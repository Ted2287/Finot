const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
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
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'PASSWORD_RESET',
      'PROFILE_CHANGE',
      'ACCOUNT_ACTIVATE',
      'ACCOUNT_DEACTIVATE'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  },
  browserInfo: {
    type: String,
    default: 'unknown'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // only createdAt is needed
});

// Create indexes
AuditLogSchema.index({ username: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
