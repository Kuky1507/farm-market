// FarmMarket data models.
// Each model maps to one collection in the farm_market database, with the
// same field names used in the coursework document. Documents use readable
// string _ids (F001, L001, B001, O001, M001) exactly as in the report.
// `strict: false` keeps the schema flexible: a crop-specific attributes
// sub-document, an optional cooperative, certifications, etc. are all allowed.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const flexible = { strict: false, versionKey: false, timestamps: true };

// 1. farmers ---------------------------------------------------------------
const FarmerSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    location: {
      district: { type: String, required: true },
      subcounty: String,
      village: String,
    },
    crops_grown: { type: [String], default: [] },
    farm_size_acres: { type: Number, min: 0 },
    cooperative: String, // optional
    certifications: [String], // optional
    has_irrigation: Boolean, // optional
    mobile_money: { provider: String, number: String },
    joined_on: { type: Date, default: Date.now },
  },
  { ...flexible, collection: 'farmers' }
);

// 2. produce_listings ------------------------------------------------------
const ListingSchema = new Schema(
  {
    _id: { type: String, required: true },
    farmer_id: { type: String, ref: 'Farmer', required: true, index: true },
    crop: { type: String, required: true, lowercase: true, trim: true },
    variety: String,
    quantity_kg_available: { type: Number, required: true, min: 0 },
    price_per_kg_ugx: { type: Number, required: true, min: 0 },
    harvest_date: Date,
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold out', 'withdrawn'],
      default: 'available',
    },
    attributes: { type: Schema.Types.Mixed, default: {} }, // differs per crop
  },
  { ...flexible, collection: 'produce_listings' }
);
ListingSchema.index({ crop: 1, status: 1, price_per_kg_ugx: 1 });

// 3. buyers ----------------------------------------------------------------
const BuyerSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['school', 'restaurant', 'market vendor', 'exporter', 'processor', 'hotel', 'hospital', 'other'],
      required: true,
    },
    contact: { person: String, phone: String },
    location: { district: String, area: String },
    needs: { type: [String], default: [] },
    monthly_volume_kg: Number, // optional
    payment_terms: String, // optional
    required_grade: String, // optional
    registered_on: { type: Date, default: Date.now },
  },
  { ...flexible, collection: 'buyers' }
);

// 4. orders ----------------------------------------------------------------
const OrderItemSchema = new Schema(
  {
    listing_id: { type: String, ref: 'ProduceListing', required: true },
    crop: String,
    quantity_kg: { type: Number, required: true, min: 1 },
    unit_price_ugx: { type: Number, required: true, min: 0 },
    line_total_ugx: Number,
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    _id: { type: String, required: true },
    buyer_id: { type: String, ref: 'Buyer', required: true },
    ordered_at: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
      default: 'pending',
    },
    items: { type: [OrderItemSchema], validate: (v) => v.length > 0 },
    total_ugx: Number,
    payment: {
      method: String,
      status: { type: String, default: 'unpaid' },
      paid_on: Date,
    },
    delivery: { address: String, expected_on: Date, delivered_on: Date },
    cancellation: { reason: String, cancelled_on: Date },
  },
  { ...flexible, collection: 'orders' }
);
OrderSchema.index({ buyer_id: 1, ordered_at: -1 });

// Keep line totals and the order total consistent on every save.
OrderSchema.pre('validate', function () {
  if (Array.isArray(this.items)) {
    this.items.forEach((it) => {
      it.line_total_ugx = it.quantity_kg * it.unit_price_ugx;
    });
    this.total_ugx = this.items.reduce((s, it) => s + it.line_total_ugx, 0);
  }
});

// 5. market_prices ---------------------------------------------------------
const MarketPriceSchema = new Schema(
  {
    _id: { type: String, required: true },
    crop: { type: String, required: true, lowercase: true, trim: true },
    market: { type: String, required: true },
    date: { type: Date, required: true },
    price_per_kg_ugx: { type: Number, required: true, min: 0 },
    trend: { type: String, enum: ['rising', 'stable', 'falling'], default: 'stable' },
  },
  { ...flexible, collection: 'market_prices' }
);
MarketPriceSchema.index({ crop: 1, date: -1 });

module.exports = {
  Farmer: mongoose.model('Farmer', FarmerSchema),
  ProduceListing: mongoose.model('ProduceListing', ListingSchema),
  Buyer: mongoose.model('Buyer', BuyerSchema),
  Order: mongoose.model('Order', OrderSchema),
  MarketPrice: mongoose.model('MarketPrice', MarketPriceSchema),
};
