const AuditLog = require('../models/AuditLog');
const { exportToCSV, exportToExcel } = require('../utils/exporter');

const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const { username, action, startDate, endDate } = req.query;

    const query = {};

    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }

    if (action) {
      query.action = action;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // include the entire end day
        query.createdAt.$lte = end;
      }
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (error) {
    next(error);
  }
};

const exportAuditLogs = async (req, res, next) => {
  try {
    const { username, action, startDate, endDate, format } = req.query;
    
    const query = {};
    if (username) query.username = { $regex: username, $options: 'i' };
    if (action) query.action = action;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const logs = await AuditLog.find(query).sort({ createdAt: -1 });

    const columns = [
      { header: 'Username', key: 'username', width: 15 },
      { header: 'Action', key: 'action', width: 20 },
      { header: 'Details', key: 'detailsString', width: 40 },
      { header: 'IP Address', key: 'ipAddress', width: 15 },
      { header: 'Browser Info', key: 'browserInfo', width: 35 },
      { header: 'Date & Time', key: 'createdAtDate', width: 20 }
    ];

    const formattedData = logs.map(item => {
      const obj = item.toObject();
      return {
        ...obj,
        detailsString: JSON.stringify(obj.details || {}),
        createdAtDate: item.createdAt.toLocaleString()
      };
    });

    const exportFormat = String(format || 'csv').toLowerCase();

    if (exportFormat === 'csv') {
      const csvContent = exportToCSV(columns, formattedData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
      return res.status(200).send(csvContent);
    } else if (exportFormat === 'excel') {
      const excelBuffer = await exportToExcel(columns, formattedData, 'Audit Logs');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.xlsx`);
      return res.status(200).send(excelBuffer);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid export format. Choose csv or excel.' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
  exportAuditLogs
};
