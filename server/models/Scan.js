const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  scanMethod: {
    type: String,
    enum: ['barcode', 'photo'],
    required: true
  },
  ecoScoreAtScan: {
    type: String,       // snapshot of score at time of scan
    default: ''
  },
  sharedToSocial: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);