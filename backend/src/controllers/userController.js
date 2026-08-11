const User = require('../models/User');
const Settings = require('../models/Settings');
const { logActivity } = require('../services/auditService');
const fs = require('fs');
const path = require('path');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'firstName', 'fatherName', 'grandfatherName', 'lastName',
      'phoneNumber', 'emergencyContactName', 'emergencyContactPhone', 'usesTelegram',
      'dateOfBirth', 'gender', 'maritalStatus', 'spouseName',
      'educationLevel', 'graduationInstitution', 'fieldOfStudy',
      'joinedYear', 'grewUpInChildrenClass', 'sundaySchoolGrade', 'notStudyingReason',
      'serviceSubSection', 'servedInOtherParish', 'previousServiceSubSection',
      'hasFatherConfessor', 'fatherConfessorName', 'fatherConfessorParish', 'fatherConfessorPhone',
      'address', 'occupation', 'department', 'bio'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.dateOfBirth === '') {
      updates.dateOfBirth = null;
    }

    if (updates.maritalStatus && updates.maritalStatus !== 'Married' && updates.maritalStatus !== 'ያገባ') {
      updates.spouseName = '';
    }

    if (updates.hasFatherConfessor && updates.hasFatherConfessor !== 'Yes' && updates.hasFatherConfessor !== 'አዎ' && updates.hasFatherConfessor !== 'አዎ አለኝ') {
      updates.fatherConfessorName = '';
      updates.fatherConfessorParish = '';
      updates.fatherConfessorPhone = '';
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    await logActivity(user._id, user.username, 'PROFILE_CHANGE', { fields: Object.keys(updates) }, req);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const user = await User.findById(req.user.id);
    
    // Delete old profile picture if exists
    if (user.profilePicture && fs.existsSync(user.profilePicture)) {
      try {
        fs.unlinkSync(user.profilePicture);
      } catch (err) {
        console.error('Failed to delete old avatar:', err);
      }
    }

    user.profilePicture = req.file.path.replace(/\\/g, '/'); // normalize slashes
    await user.save();

    await logActivity(user._id, user.username, 'PROFILE_CHANGE', { fields: ['profilePicture'] }, req);

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN CONTROLLERS ====================

const createUser = async (req, res, next) => {
  try {
    const { 
      username, email, password, firstName, fatherName, grandfatherName, lastName, role,
      phoneNumber, emergencyContactName, emergencyContactPhone, usesTelegram,
      dateOfBirth, gender, maritalStatus, spouseName, 
      educationLevel, graduationInstitution, fieldOfStudy,
      joinedYear, grewUpInChildrenClass, sundaySchoolGrade, notStudyingReason,
      serviceSubSection, servedInOtherParish, previousServiceSubSection,
      hasFatherConfessor, fatherConfessorName, fatherConfessorParish, fatherConfessorPhone,
      address, occupation, department, bio
    } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already in use.' });
    }

    const user = new User({
      username, email, password, firstName, fatherName, grandfatherName,
      lastName: lastName || fatherName, role: role || 'USER',
      phoneNumber, emergencyContactName, emergencyContactPhone, usesTelegram,
      dateOfBirth, gender, maritalStatus, spouseName, 
      educationLevel, graduationInstitution, fieldOfStudy,
      joinedYear, grewUpInChildrenClass, sundaySchoolGrade, notStudyingReason,
      serviceSubSection, servedInOtherParish, previousServiceSubSection,
      hasFatherConfessor, fatherConfessorName, fatherConfessorParish, fatherConfessorPhone,
      address, occupation, department, bio,
      isActive: true
    });

    await user.save();

    // Create settings
    await Settings.create({ userId: user._id });

    await logActivity(user._id, user.username, 'USER_CREATE', { creator: req.user.username }, req);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const role = req.query.role || '';
    const isActive = req.query.isActive;

    // Build filter
    const filter = { isDeleted: false };
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { grandfatherName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { graduationInstitution: { $regex: search, $options: 'i' } },
        { fieldOfStudy: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const fields = [
      'firstName', 'fatherName', 'grandfatherName', 'lastName', 'role',
      'phoneNumber', 'emergencyContactName', 'emergencyContactPhone', 'usesTelegram',
      'dateOfBirth', 'gender', 'maritalStatus', 'spouseName', 
      'educationLevel', 'graduationInstitution', 'fieldOfStudy',
      'joinedYear', 'grewUpInChildrenClass', 'sundaySchoolGrade', 'notStudyingReason',
      'serviceSubSection', 'servedInOtherParish', 'previousServiceSubSection',
      'hasFatherConfessor', 'fatherConfessorName', 'fatherConfessorParish', 'fatherConfessorPhone',
      'address', 'occupation', 'department', 'bio'
    ];

    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        user[f] = req.body[f];
      }
    });

    if (user.maritalStatus !== 'Married' && user.maritalStatus !== 'ያገባ') {
      user.spouseName = '';
    }

    await user.save();

    await logActivity(user._id, user.username, 'USER_UPDATE', { updater: req.user.username }, req);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Admins cannot delete their own account.' });
    }

    user.isDeleted = true;
    user.isActive = false; // deactivate too
    user.deletedAt = new Date();
    await user.save();

    await logActivity(user._id, user.username, 'USER_DELETE', { deleter: req.user.username }, req);

    res.json({ success: true, message: 'User soft-deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const toggleActivation = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Admins cannot change their own active status.' });
    }

    user.isActive = isActive;
    await user.save();

    const action = isActive ? 'ACCOUNT_ACTIVATE' : 'ACCOUNT_DEACTIVATE';
    await logActivity(user._id, user.username, action, { admin: req.user.username }, req);

    res.json({
      success: true,
      message: `User account has been ${isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    next(error);
  }
};

const resetUserPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password; // gets hashed in pre-save hook
    await user.save();

    await logActivity(user._id, user.username, 'PASSWORD_RESET', { admin: req.user.username }, req);

    res.json({ success: true, message: 'User password reset successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleActivation,
  resetUserPassword
};
