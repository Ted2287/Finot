const mongoose = require('mongoose');

const LoginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  },
  browserInfo: {
    type: String,
    default: 'unknown'
  },
  status: {
    type: String,
    required: true,
    enum: ['SUCCESS', 'FAILED']
  },
  failureReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes for performance
LoginHistorySchema.index({ username: 1 });
LoginHistorySchema.index({ status: 1 });
LoginHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('LoginHistory', LoginHistorySchema);
