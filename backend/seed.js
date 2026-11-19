// Seed script: loads sample data into the farm_market database.
// The first documents in each collection are exactly those in the coursework
// report (F001-F005, L001-L006, B001-B005, O001-O006, M001-M006 = 28 docs).
// More documents follow so the database holds 50 documents in total, which
// is enough to exercise searching, filtering, aggregation and all CRUD paths.
//
// Run:  npm run seed      (drops and reloads the five collections)
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const { Farmer, ProduceListing, Buyer, Order, MarketPrice } = require('./models');

const D = (s) => new Date(s);

const farmers = [
  { _id: 'F001', name: 'Nakato Joyce', phone: '0772 100 201', location: { district: 'Mukono', subcounty: 'Goma', village: 'Kasenge' }, crops_grown: ['maize', 'beans'], farm_size_acres: 4.5, cooperative: 'Mukono Growers Cooperative', mobile_money: { provider: 'MTN', number: '0772 100 201' }, joined_on: D('2025-03-12') },
  { _id: 'F002', name: 'Ssebugwawo Peter', phone: '0753 100 202', location: { district: 'Masaka', subcounty: 'Kyesiiga', village: 'Bukalagi' }, crops_grown: ['matooke', 'coffee'], farm_size_acres: 8.0, certifications: ['UTZ'], mobile_money: { provider: 'Airtel', number: '0753 100 202' }, joined_on: D('2024-11-05') },
  { _id: 'F003', name: 'Akello Brenda', phone: '0782 100 203', location: { district: 'Gulu', subcounty: 'Bardege', village: 'Pece' }, crops_grown: ['beans', 'simsim'], farm_size_acres: 3.0, mobile_money: { provider: 'MTN', number: '0782 100 203' }, joined_on: D('2025-06-20') },
  { _id: 'F004', name: 'Tumusiime Robert', phone: '0701 100 204', location: { district: 'Mbarara', subcounty: 'Kakoba', village: 'Rwemigina' }, crops_grown: ['matooke', 'tomatoes'], farm_size_acres: 5.5, cooperative: 'Ankole Fresh Growers', has_irrigation: true, mobile_money: { provider: 'MTN', number: '0701 100 204' }, joined_on: D('2025-01-18') },
  { _id: 'F005', name: 'Namatovu Agnes', phone: '0759 100 205', location: { district: 'Wakiso', subcounty: 'Kasangati', village: 'Gayaza' }, crops_grown: ['tomatoes', 'cassava'], farm_size_acres: 2.0, has_irrigation: true, mobile_money: { provider: 'Airtel', number: '0759 100 205' }, joined_on: D('2025-08-02') },
  // additional farmers
  { _id: 'F006', name: 'Okello Francis', phone: '0774 100 206', location: { district: 'Lira', subcounty: 'Adekokwok', village: 'Boroboro' }, crops_grown: ['simsim', 'maize', 'sunflower'], farm_size_acres: 6.0, cooperative: 'Lango Oilseed Farmers', mobile_money: { provider: 'MTN', number: '0774 100 206' }, joined_on: D('2025-02-27') },
  { _id: 'F007', name: 'Kyomugisha Doreen', phone: '0756 100 207', location: { district: 'Kabale', subcounty: 'Rubaya', village: 'Kacerere' }, crops_grown: ['irish potatoes', 'beans'], farm_size_acres: 1.5, has_irrigation: false, mobile_money: { provider: 'Airtel', number: '0756 100 207' }, joined_on: D('2025-09-14') },
  { _id: 'F008', name: 'Mugisha Isaac', phone: '0703 100 208', location: { district: 'Bushenyi', subcounty: 'Kyabugimbi', village: 'Nyakabirizi' }, crops_grown: ['coffee', 'matooke'], farm_size_acres: 12.0, certifications: ['Rainforest Alliance', 'Organic'], cooperative: 'Bushenyi Coffee Union', mobile_money: { provider: 'MTN', number: '0703 100 208' }, joined_on: D('2024-08-30') },
  { _id: 'F009', name: 'Nabukenya Sarah', phone: '0788 100 209', location: { district: 'Luwero', subcounty: 'Zirobwe', village: 'Kikyusa' }, crops_grown: ['pineapples', 'cassava', 'maize'], farm_size_acres: 3.5, mobile_money: { provider: 'MTN', number: '0788 100 209' }, joined_on: D('2025-04-09') },
  { _id: 'F010', name: 'Opio Richard', phone: '0752 100 210', location: { district: 'Soroti', subcounty: 'Arapai', village: 'Olio' }, crops_grown: ['groundnuts', 'cassava', 'sorghum'], farm_size_acres: 7.0, has_irrigation: false, mobile_money: { provider: 'Airtel', number: '0752 100 210' }, joined_on: D('2025-07-21') },
];

const listings = [
  { _id: 'L001', farmer_id: 'F001', crop: 'maize', variety: 'Longe 5', quantity_kg_available: 1200, price_per_kg_ugx: 1100, harvest_date: D('2026-09-20'), status: 'available', attributes: { moisture_percent: 13, grade: 'A' } },
  { _id: 'L002', farmer_id: 'F002', crop: 'matooke', variety: 'Mbwazirume', quantity_kg_available: 900, price_per_kg_ugx: 1500, harvest_date: D('2026-10-05'), status: 'available', attributes: { bunch_count: 60, maturity: 'full' } },
  { _id: 'L003', farmer_id: 'F002', crop: 'coffee', variety: 'Robusta', quantity_kg_available: 500, price_per_kg_ugx: 6800, harvest_date: D('2026-09-28'), status: 'available', attributes: { grade: 'FAQ', moisture_percent: 12, screen_size: '15' } },
  { _id: 'L004', farmer_id: 'F003', crop: 'beans', variety: 'NABE 15', quantity_kg_available: 600, price_per_kg_ugx: 3200, harvest_date: D('2026-09-15'), status: 'available', attributes: { colour: 'red', sorted: true } },
  { _id: 'L005', farmer_id: 'F004', crop: 'tomatoes', variety: 'Kiboko F1', quantity_kg_available: 300, price_per_kg_ugx: 2200, harvest_date: D('2026-10-08'), status: 'available', attributes: { ripeness: 'firm-ripe', crate_count: 30 } },
  { _id: 'L006', farmer_id: 'F005', crop: 'cassava', variety: 'NASE 14', quantity_kg_available: 700, price_per_kg_ugx: 800, harvest_date: D('2026-10-01'), status: 'available', attributes: { form: 'fresh roots' } },
  // additional listings
  { _id: 'L007', farmer_id: 'F006', crop: 'simsim', variety: 'Sesim 2', quantity_kg_available: 400, price_per_kg_ugx: 5500, harvest_date: D('2026-09-10'), status: 'available', attributes: { colour: 'white', oil_content_percent: 52 } },
  { _id: 'L008', farmer_id: 'F007', crop: 'irish potatoes', variety: 'Victoria', quantity_kg_available: 1500, price_per_kg_ugx: 1800, harvest_date: D('2026-10-12'), status: 'available', attributes: { size: 'medium', washed: false } },
  { _id: 'L009', farmer_id: 'F008', crop: 'coffee', variety: 'Arabica', quantity_kg_available: 800, price_per_kg_ugx: 9500, harvest_date: D('2026-10-03'), status: 'available', attributes: { grade: 'AA', moisture_percent: 11, screen_size: '18', certified: 'Organic' } },
  { _id: 'L010', farmer_id: 'F009', crop: 'pineapples', variety: 'Smooth Cayenne', quantity_kg_available: 2000, price_per_kg_ugx: 1200, harvest_date: D('2026-10-15'), status: 'available', attributes: { ripeness: 'ripe', average_weight_kg: 1.8 } },
  { _id: 'L011', farmer_id: 'F010', crop: 'groundnuts', variety: 'Serenut 5R', quantity_kg_available: 350, price_per_kg_ugx: 4800, harvest_date: D('2026-09-25'), status: 'reserved', attributes: { shelled: true, grade: 'B' } },
  { _id: 'L012', farmer_id: 'F001', crop: 'beans', variety: 'K132', quantity_kg_available: 0, price_per_kg_ugx: 3000, harvest_date: D('2026-08-30'), status: 'sold out', attributes: { colour: 'yellow', sorted: true } },
];

const buyers = [
  { _id: 'B001', name: 'Kisenyi Fresh Traders', type: 'market vendor', contact: { person: 'Namuli Harriet', phone: '0701 200 301' }, location: { district: 'Kampala', area: 'Nakasero Market' }, needs: ['tomatoes', 'cassava', 'matooke'], registered_on: D('2025-02-10') },
  { _id: 'B002', name: 'Sunrise Secondary School', type: 'school', contact: { person: 'Mr. Kato Samuel', phone: '0772 200 302' }, location: { district: 'Mukono', area: 'Mukono Town' }, needs: ['maize', 'beans'], monthly_volume_kg: 1500, payment_terms: 'Pays within 14 days', registered_on: D('2025-04-22') },
  { _id: 'B003', name: 'Lakeview Restaurant', type: 'restaurant', contact: { person: 'Ms. Nabirye Doreen', phone: '0753 200 303' }, location: { district: 'Wakiso', area: 'Entebbe' }, needs: ['matooke', 'tomatoes', 'beans'], registered_on: D('2025-05-30') },
  { _id: 'B004', name: 'Pearl Coffee Exporters Ltd', type: 'exporter', contact: { person: 'Mr. Opio Daniel', phone: '0782 200 304' }, location: { district: 'Kampala', area: 'Industrial Area' }, needs: ['coffee'], required_grade: 'FAQ', registered_on: D('2024-12-14') },
  { _id: 'B005', name: 'Nile Millers Ltd', type: 'processor', contact: { person: 'Ms. Atim Grace', phone: '0759 200 305' }, location: { district: 'Jinja', area: 'Njeru' }, needs: ['maize'], monthly_volume_kg: 8000, registered_on: D('2025-07-07') },
  // additional buyers
  { _id: 'B006', name: 'Gulu Regional Referral Hospital', type: 'hospital', contact: { person: 'Dr. Ocen Patrick', phone: '0774 200 306' }, location: { district: 'Gulu', area: 'Gulu City' }, needs: ['beans', 'maize', 'irish potatoes'], monthly_volume_kg: 2500, payment_terms: 'Pays within 30 days', registered_on: D('2025-03-03') },
  { _id: 'B007', name: 'Mukwano Industries', type: 'processor', contact: { person: 'Mr. Patel Rajesh', phone: '0703 200 307' }, location: { district: 'Kampala', area: 'Mukwano Road' }, needs: ['simsim', 'groundnuts', 'sunflower'], monthly_volume_kg: 20000, required_grade: 'A', registered_on: D('2024-10-18') },
  { _id: 'B008', name: 'Speke Resort Munyonyo', type: 'hotel', contact: { person: 'Chef Mutebi Allan', phone: '0788 200 308' }, location: { district: 'Kampala', area: 'Munyonyo' }, needs: ['pineapples', 'tomatoes', 'matooke', 'irish potatoes'], payment_terms: 'Pays on delivery', registered_on: D('2025-06-11') },
];

const orders = [
  { _id: 'O001', buyer_id: 'B002', ordered_at: D('2026-10-02'), status: 'delivered', items: [{ listing_id: 'L001', crop: 'maize', quantity_kg: 400, unit_price_ugx: 1100 }, { listing_id: 'L004', crop: 'beans', quantity_kg: 200, unit_price_ugx: 3200 }], payment: { method: 'MTN Mobile Money', status: 'paid', paid_on: D('2026-10-09') }, delivery: { address: 'Mukono Town', delivered_on: D('2026-10-04') } },
  { _id: 'O002', buyer_id: 'B003', ordered_at: D('2026-10-06'), status: 'delivered', items: [{ listing_id: 'L002', crop: 'matooke', quantity_kg: 150, unit_price_ugx: 1500 }, { listing_id: 'L005', crop: 'tomatoes', quantity_kg: 40, unit_price_ugx: 2200 }], payment: { method: 'Cash', status: 'paid', paid_on: D('2026-10-07') }, delivery: { address: 'Entebbe', delivered_on: D('2026-10-07') } },
  { _id: 'O003', buyer_id: 'B004', ordered_at: D('2026-10-08'), status: 'confirmed', items: [{ listing_id: 'L003', crop: 'coffee', quantity_kg: 300, unit_price_ugx: 6800 }], payment: { method: 'Bank transfer', status: 'pending' }, delivery: { address: 'Industrial Area, Kampala', expected_on: D('2026-10-14') } },
  { _id: 'O004', buyer_id: 'B005', ordered_at: D('2026-10-03'), status: 'delivered', items: [{ listing_id: 'L001', crop: 'maize', quantity_kg: 500, unit_price_ugx: 1100 }], payment: { method: 'Airtel Money', status: 'paid', paid_on: D('2026-10-05') }, delivery: { address: 'Njeru, Jinja', delivered_on: D('2026-10-05') } },
  { _id: 'O005', buyer_id: 'B001', ordered_at: D('2026-10-10'), status: 'pending', items: [{ listing_id: 'L006', crop: 'cassava', quantity_kg: 300, unit_price_ugx: 800 }, { listing_id: 'L005', crop: 'tomatoes', quantity_kg: 100, unit_price_ugx: 2200 }], payment: { method: 'MTN Mobile Money', status: 'unpaid' }, delivery: { address: 'Nakasero Market, Kampala', expected_on: D('2026-10-13') } },
  { _id: 'O006', buyer_id: 'B003', ordered_at: D('2026-10-09'), status: 'cancelled', items: [{ listing_id: 'L004', crop: 'beans', quantity_kg: 100, unit_price_ugx: 3200 }], payment: { method: 'Cash', status: 'not charged' }, cancellation: { reason: 'Buyer postponed the purchase', cancelled_on: D('2026-10-09') } },
  // additional orders
  { _id: 'O007', buyer_id: 'B006', ordered_at: D('2026-10-11'), status: 'delivered', items: [{ listing_id: 'L008', crop: 'irish potatoes', quantity_kg: 600, unit_price_ugx: 1800 }, { listing_id: 'L004', crop: 'beans', quantity_kg: 150, unit_price_ugx: 3200 }], payment: { method: 'Bank transfer', status: 'paid', paid_on: D('2026-10-20') }, delivery: { address: 'Gulu Regional Referral Hospital stores', delivered_on: D('2026-10-14') } },
  { _id: 'O008', buyer_id: 'B007', ordered_at: D('2026-10-12'), status: 'confirmed', items: [{ listing_id: 'L007', crop: 'simsim', quantity_kg: 400, unit_price_ugx: 5500 }, { listing_id: 'L011', crop: 'groundnuts', quantity_kg: 350, unit_price_ugx: 4800 }], payment: { method: 'Bank transfer', status: 'pending' }, delivery: { address: 'Mukwano Road, Kampala', expected_on: D('2026-10-18') } },
  { _id: 'O009', buyer_id: 'B008', ordered_at: D('2026-10-13'), status: 'delivered', items: [{ listing_id: 'L010', crop: 'pineapples', quantity_kg: 250, unit_price_ugx: 1200 }, { listing_id: 'L005', crop: 'tomatoes', quantity_kg: 60, unit_price_ugx: 2200 }, { listing_id: 'L002', crop: 'matooke', quantity_kg: 120, unit_price_ugx: 1500 }], payment: { method: 'Cash', status: 'paid', paid_on: D('2026-10-15') }, delivery: { address: 'Speke Resort Munyonyo', delivered_on: D('2026-10-15') } },
  { _id: 'O010', buyer_id: 'B004', ordered_at: D('2026-10-16'), status: 'pending', items: [{ listing_id: 'L009', crop: 'coffee', quantity_kg: 500, unit_price_ugx: 9500 }], payment: { method: 'Bank transfer', status: 'unpaid' }, delivery: { address: 'Industrial Area, Kampala', expected_on: D('2026-10-25') } },
];

const marketPrices = [
  { _id: 'M001', crop: 'maize', market: 'Owino Market, Kampala', date: D('2026-10-01'), price_per_kg_ugx: 1250, trend: 'stable' },
  { _id: 'M002', crop: 'beans', market: 'Nakasero Market, Kampala', date: D('2026-10-01'), price_per_kg_ugx: 3500, trend: 'rising' },
  { _id: 'M003', crop: 'matooke', market: 'Nakasero Market, Kampala', date: D('2026-10-02'), price_per_kg_ugx: 1700, trend: 'stable' },
  { _id: 'M004', crop: 'tomatoes', market: 'Owino Market, Kampala', date: D('2026-10-02'), price_per_kg_ugx: 2600, trend: 'falling' },
  { _id: 'M005', crop: 'coffee', market: 'Kampala (FAQ robusta)', date: D('2026-10-03'), price_per_kg_ugx: 7100, trend: 'rising' },
  { _id: 'M006', crop: 'cassava', market: 'Masaka Main Market', date: D('2026-10-03'), price_per_kg_ugx: 900, trend: 'stable' },
  // additional market prices
  { _id: 'M007', crop: 'simsim', market: 'Lira Main Market', date: D('2026-10-04'), price_per_kg_ugx: 6000, trend: 'rising' },
  { _id: 'M008', crop: 'irish potatoes', market: 'Kalerwe Market, Kampala', date: D('2026-10-05'), price_per_kg_ugx: 2100, trend: 'stable' },
  { _id: 'M009', crop: 'pineapples', market: 'Nakasero Market, Kampala', date: D('2026-10-05'), price_per_kg_ugx: 1500, trend: 'falling' },
  { _id: 'M010', crop: 'groundnuts', market: 'Soroti Main Market', date: D('2026-10-06'), price_per_kg_ugx: 5200, trend: 'stable' },
];

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm_market';
  await mongoose.connect(uri);
  console.log('Connected to', uri);

  await Promise.all([
    Farmer.deleteMany({}),
    ProduceListing.deleteMany({}),
    Buyer.deleteMany({}),
    Order.deleteMany({}),
    MarketPrice.deleteMany({}),
  ]);

  await Farmer.insertMany(farmers);
  await ProduceListing.insertMany(listings);
  await Buyer.insertMany(buyers);
  await Order.create(orders); // create() runs the pre-validate hook that computes totals
  await MarketPrice.insertMany(marketPrices);
  await Promise.all([ProduceListing.syncIndexes(), Order.syncIndexes(), MarketPrice.syncIndexes()]);

  const counts = {
    farmers: await Farmer.countDocuments(),
    produce_listings: await ProduceListing.countDocuments(),
    buyers: await Buyer.countDocuments(),
    orders: await Order.countDocuments(),
    market_prices: await MarketPrice.countDocuments(),
  };
  counts.total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.table(counts);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
