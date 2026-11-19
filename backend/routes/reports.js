// Report endpoints: the six queries from section 5 of the coursework,
// plus a dashboard summary. These show MongoDB aggregation ($lookup,
// $unwind, $group) working on the live data.
const express = require('express');
const { Farmer, ProduceListing, Buyer, Order, MarketPrice } = require('../models');

const router = express.Router();

// Dashboard counts
router.get('/summary', async (req, res, next) => {
  try {
    const [farmers, listings, buyers, orders, prices] = await Promise.all([
      Farmer.countDocuments(),
      ProduceListing.countDocuments(),
      Buyer.countDocuments(),
      Order.countDocuments(),
      MarketPrice.countDocuments(),
    ]);
    const revenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total_ugx' } } },
    ]);
    res.json({
      farmers,
      produce_listings: listings,
      buyers,
      orders,
      market_prices: prices,
      total_documents: farmers + listings + buyers + orders + prices,
      delivered_revenue_ugx: revenue[0]?.total || 0,
    });
  } catch (e) {
    next(e);
  }
});

// Query 1: available listings of a crop at or below a max price
router.get('/cheap-listings', async (req, res, next) => {
  try {
    const crop = (req.query.crop || 'maize').toLowerCase();
    const max = Number(req.query.max_price || 1200);
    const docs = await ProduceListing.find(
      { crop, status: 'available', price_per_kg_ugx: { $lte: max } },
      { farmer_id: 1, crop: 1, variety: 1, quantity_kg_available: 1, price_per_kg_ugx: 1 }
    ).sort({ price_per_kg_ugx: 1 });
    res.json(docs);
  } catch (e) {
    next(e);
  }
});

// Query 2: farmers that belong to a cooperative
router.get('/cooperative-farmers', async (req, res, next) => {
  try {
    const docs = await Farmer.find({ cooperative: { $exists: true, $ne: null } }, { name: 1, cooperative: 1 });
    res.json(docs);
  } catch (e) {
    next(e);
  }
});

// Query 3: total sales per crop from delivered orders ($unwind + $group)
router.get('/sales-per-crop', async (req, res, next) => {
  try {
    const docs = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.crop',
          kg_sold: { $sum: '$items.quantity_kg' },
          revenue_ugx: { $sum: '$items.line_total_ugx' },
        },
      },
      { $sort: { revenue_ugx: -1 } },
    ]);
    res.json(docs);
  } catch (e) {
    next(e);
  }
});

// Query 4: each order with the buyer's name ($lookup)
router.get('/orders-with-buyers', async (req, res, next) => {
  try {
    const docs = await Order.aggregate([
      { $lookup: { from: 'buyers', localField: 'buyer_id', foreignField: '_id', as: 'buyer' } },
      { $unwind: { path: '$buyer', preserveNullAndEmptyArrays: true } },
      { $project: { buyer: { $ifNull: ['$buyer.name', '(unknown buyer)'] }, status: 1, total_ugx: 1, ordered_at: 1 } },
      { $sort: { _id: 1 } },
    ]);
    res.json(docs);
  } catch (e) {
    next(e);
  }
});

// Query 5: is the farmer's price fair? Compare each listing with the latest
// market price for the same crop.
router.get('/price-fairness', async (req, res, next) => {
  try {
    const docs = await ProduceListing.aggregate([
      {
        $lookup: {
          from: 'market_prices',
          let: { c: '$crop' },
          pipeline: [{ $match: { $expr: { $eq: ['$crop', '$$c'] } } }, { $sort: { date: -1 } }, { $limit: 1 }],
          as: 'mp',
        },
      },
      { $unwind: { path: '$mp', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          crop: 1,
          farmer_id: 1,
          farm_price: '$price_per_kg_ugx',
          market: '$mp.market',
          market_price: '$mp.price_per_kg_ugx',
          difference: { $subtract: [{ $ifNull: ['$mp.price_per_kg_ugx', 0] }, '$price_per_kg_ugx'] },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(docs);
  } catch (e) {
    next(e);
  }
});

// Query 6: reduce stock on a listing after a sale ($inc)
router.post('/listings/:id/reduce-stock', async (req, res, next) => {
  try {
    const kg = Number(req.body.kg);
    if (!(kg > 0)) return res.status(400).json({ error: 'kg must be a positive number' });
    const listing = await ProduceListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.quantity_kg_available < kg) {
      return res.status(400).json({ error: `Only ${listing.quantity_kg_available} kg available` });
    }
    const updated = await ProduceListing.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity_kg_available: -kg } },
      { new: true }
    );
    if (updated.quantity_kg_available === 0 && updated.status === 'available') {
      updated.status = 'sold out';
      await updated.save();
    }
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// Extra: farmers who grow a given crop (array query)
router.get('/farmers-by-crop', async (req, res, next) => {
  try {
    const crop = (req.query.crop || '').toLowerCase();
    const docs = await Farmer.find(crop ? { crops_grown: crop } : {}, { name: 1, crops_grown: 1, 'location.district': 1 });
    res.json(docs);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
