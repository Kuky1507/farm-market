// Exports every collection in farm_market to JSON files that MongoDB Compass
// can import (Add Data -> Import JSON or CSV file). Dates are written in
// Extended JSON form ({ "$date": "..." }) so Compass keeps them as dates.
//
// Run:  node export.js [output folder]     (default: ../requirements/data)
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Farmer, ProduceListing, Buyer, Order, MarketPrice } = require('./models');

const outDir = path.resolve(process.argv[2] || path.join(__dirname, '..', 'requirements', 'data'));
fs.mkdirSync(outDir, { recursive: true });

function toExtendedJson(value) {
  if (value instanceof Date) return { $date: value.toISOString() };
  if (Array.isArray(value)) return value.map(toExtendedJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toExtendedJson(v)]));
  }
  return value;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm_market');
  const sets = [
    ['farmers', Farmer],
    ['produce_listings', ProduceListing],
    ['buyers', Buyer],
    ['orders', Order],
    ['market_prices', MarketPrice],
  ];
  for (const [name, Model] of sets) {
    const docs = await Model.find({}, { createdAt: 0, updatedAt: 0 }).sort({ _id: 1 }).lean();
    const file = path.join(outDir, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(toExtendedJson(docs), null, 2));
    console.log(`${name}: ${docs.length} documents -> ${file}`);
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
