const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true
  },
  type: {
    type: String,
    enum: ['open', 'questions_completed', 'accepted', 'date_selected'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
