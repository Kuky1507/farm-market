// FarmMarket API server: Express + Mongoose on top of MongoDB.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { Farmer, ProduceListing, Buyer, Order, MarketPrice } = require('./models');
const { crudRouter } = require('./routes/crud');
const reports = require('./routes/reports');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm_market';
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// --- REST API: full CRUD for all five collections ---------------------------
app.use(
  '/api/farmers',
  crudRouter(Farmer, {
    prefix: 'F',
    searchFields: ['name', 'phone', 'location.district', 'cooperative', 'crops_grown'],
    filterFields: ['location.district', 'crops_grown'],
  })
);
app.use(
  '/api/listings',
  crudRouter(ProduceListing, {
    prefix: 'L',
    searchFields: ['crop', 'variety', 'farmer_id'],
    filterFields: ['crop', 'status', 'farmer_id'],
  })
);
app.use(
  '/api/buyers',
  crudRouter(Buyer, {
    prefix: 'B',
    searchFields: ['name', 'type', 'contact.person', 'location.district', 'needs'],
    filterFields: ['type', 'needs'],
  })
);
app.use(
  '/api/orders',
  crudRouter(Order, {
    prefix: 'O',
    searchFields: ['buyer_id', 'status', 'items.crop'],
    filterFields: ['status', 'buyer_id'],
    sort: { ordered_at: -1 },
  })
);
app.use(
  '/api/market-prices',
  crudRouter(MarketPrice, {
    prefix: 'M',
    searchFields: ['crop', 'market'],
    filterFields: ['crop', 'trend'],
    sort: { date: -1 },
  })
);
app.use('/api/reports', reports);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// --- Front end: static files served from ../frontend -----------------------
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --- Error handler ----------------------------------------------------------
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join('; ') });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: `Duplicate id: ${JSON.stringify(err.keyValue)}` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid value for ${err.path}: ${err.value}` });
  }
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`MongoDB connected: ${MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//$1:***@')}`);
    app.listen(PORT, () => console.log(`FarmMarket running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
