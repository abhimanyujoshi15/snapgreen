const mongoose = require('mongoose');

const alternativeSchema = new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  reason: String,
  ecoScore: String,
  overallScore: Number,
  co2Saved: String,
  estimatedPrice: String,
  whereToBuy: [String],
  keyBenefit: String,
  searchQuery: String,
});

const productSchema = new mongoose.Schema({
  barcode: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  brand: { type: String, default: 'Unknown' },
  category: { type: String, default: 'General' },
  imageUrl: { type: String, default: '' },
  ecoScore: { type: String, default: 'C' },
  carbonFootprint: { type: String, default: '' },
  packagingScore: { type: Number, default: 50 },
  sourcingScore: { type: Number, default: 50 },
  overallScore: { type: Number, default: 50 },
  impactSummary: { type: String, default: '' },
  packagingDetail: { type: String, default: '' },
  sourcingDetail: { type: String, default: '' },
  manufacturingDetail: { type: String, default: '' },
  funFact: { type: String, default: '' },
  tips: { type: [String], default: [] },
  alternatives: [alternativeSchema],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);