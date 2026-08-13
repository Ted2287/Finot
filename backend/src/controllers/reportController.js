const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const LoginHistory = require('../models/LoginHistory');
const { exportToCSV, exportToExcel, exportToPDF } = require('../utils/exporter');

const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const activeUsers = await User.countDocuments({ isDeleted: false, isActive: true });
    const inactiveUsers = await User.countDocuments({ isDeleted: false, isActive: false });
    
    // New registrations in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newRegistrations = await User.countDocuments({
      isDeleted: false,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Monthly trends (group by month/year)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1); // start of month
    
    const monthlyTrendsRaw = await User.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly trends: make sure all months are represented
    const monthlyTrends = [];
    const tempDate = new Date(twelveMonthsAgo);
    for (let i = 0; i < 12; i++) {
      const year = tempDate.getFullYear();
      const month = tempDate.getMonth() + 1; // 1-indexed
      const monthName = tempDate.toLocaleString('default', { month: 'short' });
      
      const found = monthlyTrendsRaw.find(m => m._id.year === year && m._id.month === month);
      monthlyTrends.push({
        label: `${monthName} ${year}`,
        value: found ? found.count : 0
      });
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    // Recent activity
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Login stats (success vs failure)
    const successLogins = await LoginHistory.countDocuments({ status: 'SUCCESS' });
    const failedLogins = await LoginHistory.countDocuments({ status: 'FAILED' });

    // Education level distribution
    const educationStats = await User.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$educationLevel', count: { $sum: 1 } } }
    ]);

    // Marital status distribution
    const maritalStats = await User.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$maritalStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newRegistrations,
        monthlyTrends,
        loginStats: {
          success: successLogins,
          failed: failedLogins
        },
        educationStats: educationStats.map(s => ({ name: s._id || 'Not Specified', value: s.count })),
        maritalStats: maritalStats.map(s => ({ name: s._id || 'Not Specified', value: s.count })),
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generic report handler helper
const generateReport = async (req, res, reportType, exportFormat) => {
  let data = [];
  let columns = [];
  let title = '';

  const format = String(exportFormat).toLowerCase();

  switch (reportType) {
    case 'registration':
      title = 'Sunday School Member Registration Report';
      data = await User.find({ isDeleted: false }).sort({ createdAt: -1 });
      columns = [
        { header: 'Username', key: 'username', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'First Name', key: 'firstName', width: 15 },
        { header: "Father's Name", key: 'fatherName', width: 15 },
        { header: "Grandfather's Name", key: 'grandfatherName', width: 15 },
        { header: 'Phone Number', key: 'phoneNumber', width: 15 },
        { header: 'Emergency Contact', key: 'emergencyContactName', width: 18 },
        { header: 'Emergency Phone', key: 'emergencyContactPhone', width: 18 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Marital Status', key: 'maritalStatus', width: 12 },
        { header: 'Spouse Name', key: 'spouseName', width: 15 },
        { header: 'Education Level', key: 'educationLevel', width: 15 },
        { header: 'Institution', key: 'graduationInstitution', width: 20 },
        { header: 'Field of Study', key: 'fieldOfStudy', width: 18 },
        { header: 'SS Grade', key: 'sundaySchoolGrade', width: 12 },
        { header: 'Sub-Section', key: 'serviceSubSection', width: 18 },
        { header: 'Father Confessor', key: 'fatherConfessorName', width: 18 },
        { header: 'Role', key: 'role', width: 10 },
        { header: 'Status', key: 'statusText', width: 10 },
        { header: 'Created At', key: 'createdAtDate', width: 20 }
      ];
      // Format items
      data = data.map(item => ({
        ...item.toObject(),
        statusText: item.isActive ? 'Active' : 'Inactive',
        createdAtDate: item.createdAt.toLocaleString()
      }));
      break;

    case 'active':
      title = 'Active Sunday School Members Report';
      data = await User.find({ isDeleted: false, isActive: true }).sort({ createdAt: -1 });
      columns = [
        { header: 'Username', key: 'username', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'First Name', key: 'firstName', width: 15 },
        { header: "Father's Name", key: 'fatherName', width: 15 },
        { header: "Grandfather's Name", key: 'grandfatherName', width: 15 },
        { header: 'Phone Number', key: 'phoneNumber', width: 15 },
        { header: 'SS Grade', key: 'sundaySchoolGrade', width: 12 },
        { header: 'Sub-Section', key: 'serviceSubSection', width: 18 },
        { header: 'Father Confessor', key: 'fatherConfessorName', width: 18 },
        { header: 'Created At', key: 'createdAtDate', width: 20 }
      ];
      data = data.map(item => ({
        ...item.toObject(),
        createdAtDate: item.createdAt.toLocaleString()
      }));
      break;

    case 'inactive':
      title = 'Inactive Members Report';
      data = await User.find({ isDeleted: false, isActive: false }).sort({ createdAt: -1 });
      columns = [
        { header: 'Username', key: 'username', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'First Name', key: 'firstName', width: 15 },
        { header: "Father's Name", key: 'fatherName', width: 15 },
        { header: "Grandfather's Name", key: 'grandfatherName', width: 15 },
        { header: 'Phone Number', key: 'phoneNumber', width: 15 },
        { header: 'Created At', key: 'createdAtDate', width: 20 }
      ];
      data = data.map(item => ({
        ...item.toObject(),
        createdAtDate: item.createdAt.toLocaleString()
      }));
      break;

    case 'activity':
      title = 'User Activity Report';
      data = await AuditLog.find().sort({ createdAt: -1 });
      columns = [
        { header: 'Username', key: 'username', width: 15 },
        { header: 'Action', key: 'action', width: 20 },
        { header: 'Details', key: 'detailsString', width: 40 },
        { header: 'IP Address', key: 'ipAddress', width: 15 },
        { header: 'Browser Information', key: 'browserInfo', width: 30 },
        { header: 'Date & Time', key: 'createdAtDate', width: 20 }
      ];
      data = data.map(item => {
        const obj = item.toObject();
        return {
          ...obj,
          detailsString: JSON.stringify(obj.details || {}),
          createdAtDate: item.createdAt.toLocaleString()
        };
      });
      break;

    case 'login-history':
      title = 'Login History Report';
      data = await LoginHistory.find().sort({ createdAt: -1 });
      columns = [
        { header: 'Username', key: 'username', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Failure Reason', key: 'failureReason', width: 25 },
        { header: 'IP Address', key: 'ipAddress', width: 15 },
        { header: 'Browser Information', key: 'browserInfo', width: 30 },
        { header: 'Date & Time', key: 'createdAtDate', width: 20 }
      ];
      data = data.map(item => ({
        ...item.toObject(),
        createdAtDate: item.createdAt.toLocaleString()
      }));
      break;

    default:
      throw new Error('Invalid report type');
  }

  // Handle format exports
  if (format === 'csv') {
    const csvContent = exportToCSV(columns, data);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=report-${reportType}-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } else if (format === 'excel') {
    const excelBuffer = await exportToExcel(columns, data, reportType);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report-${reportType}-${Date.now()}.xlsx`);
    return res.status(200).send(excelBuffer);
  } else {
    // Return JSON data as default for live UI preview
    return res.json({ success: true, title, data });
  }
};

const getReport = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { format } = req.query;
    await generateReport(req, res, type, format);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getReport
};
