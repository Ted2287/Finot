const express = require('express');
const router = express.Router();
const { getDashboardStats, getReport } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

// All reports are restricted to ADMIN role
router.get('/stats', authenticate, authorize('ADMIN'), getDashboardStats);
router.get('/export/:type', authenticate, authorize('ADMIN'), getReport);

module.exports = router;
