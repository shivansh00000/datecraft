const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true
  },
  visitorId: {
    type: String,
    required: true
  },
  ipHash: {
    type: String
  },
  userAgent: {
    browser: { type: String },
    device: { type: String },
    country: { type: String, default: 'Unknown' },
    os: { type: String },
    source: { type: String, default: 'Direct' } // WhatsApp, Telegram, etc.
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Visit', VisitSchema);
