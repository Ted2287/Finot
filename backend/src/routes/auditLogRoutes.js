const express = require('express');
const router = express.Router();
const { getAuditLogs, exportAuditLogs } = require('../controllers/auditLogController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('ADMIN'), getAuditLogs);
router.get('/export', authenticate, authorize('ADMIN'), exportAuditLogs);

module.exports = router;
