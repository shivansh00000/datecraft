const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String },
  answerText: { type: String, required: true }
});

const ResponseSchema = new mongoose.Schema({
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
    device: { type: String }, // 'mobile', 'tablet', 'desktop'
    country: { type: String, default: 'Unknown' },
    os: { type: String }
  },
  acceptanceStatus: {
    type: String,
    enum: ['pending', 'yes', 'no'],
    default: 'pending'
  },
  answers: [AnswerSchema],
  selectedDate: {
    type: Date
  },
  selectedTime: {
    type: String
  },
  completionPercentage: {
    type: Number,
    default: 0
  },
  timeSpentSeconds: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Response', ResponseSchema);
