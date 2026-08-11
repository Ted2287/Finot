const AuditLog = require('../models/AuditLog');
const LoginHistory = require('../models/LoginHistory');

/**
 * Creates an entry in the AuditLog collection
 * @param {ObjectId} userId 
 * @param {String} username 
 * @param {String} action 
 * @param {Object} details 
 * @param {Object} req - Express Request Object (to extract IP & User-Agent)
 */
const logActivity = async (userId, username, action, details = {}, req = null) => {
  try {
    const logData = {
      userId,
      username,
      action,
      details,
      ipAddress: req ? (req.headers['x-forwarded-for'] || req.ip || 'unknown') : 'system',
      browserInfo: req ? (req.headers['user-agent'] || 'unknown') : 'system'
    };

    await AuditLog.create(logData);
  } catch (error) {
    console.error('Error logging audit activity:', error);
  }
};

/**
 * Creates an entry in the LoginHistory collection
 * @param {ObjectId} userId 
 * @param {String} username 
 * @param {String} status - SUCCESS or FAILED
 * @param {String} failureReason 
 * @param {Object} req - Express Request Object
 */
const logLoginAttempt = async (userId, username, status, failureReason = '', req = null) => {
  try {
    const loginData = {
      userId,
      username,
      status,
      failureReason,
      ipAddress: req ? (req.headers['x-forwarded-for'] || req.ip || 'unknown') : 'system',
      browserInfo: req ? (req.headers['user-agent'] || 'unknown') : 'system'
    };

    await LoginHistory.create(loginData);
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

module.exports = {
  logActivity,
  logLoginAttempt
};
