const express = require('express');
const router = express.Router();
const { 
  register, login, logout, refreshToken, 
  changePassword, getSettings, updateSettings 
} = require('../controllers/authController');
const { 
  registerValidator, loginValidator, changePasswordValidator 
} = require('../validators/userValidator');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

// Protected auth routes
router.post('/change-password', authenticate, changePasswordValidator, changePassword);
router.get('/settings', authenticate, getSettings);
router.put('/settings', authenticate, updateSettings);

module.exports = router;
