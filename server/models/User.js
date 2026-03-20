const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  greenScore: {
    type: Number,
    default: 0
  },
  streakCount: {
    type: Number,
    default: 0
  },
  lastScanDate: {
    type: Date,
    default: null
  },
  badges: {
    type: [String],
    default: []
  },
  // e.g. ['Plastic Avoider', 'Local Hero', 'Zero Waste Week']
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);