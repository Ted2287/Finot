const User = require('../models/User');
const Settings = require('../models/Settings');
const { logActivity } = require('../services/auditService');
const fs = require('fs');
const path = require('path');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user && user.profilePicture && !user.profilePicture.startsWith('data:') && !user.profilePicture.startsWith('http')) {
      if (!fs.existsSync(user.profilePicture)) {
        user.profilePicture = '';
        await User.updateOne({ _id: user._id }, { $set: { profilePicture: '' } });
      }
    }
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

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      // Admin updating their own profile applies immediately
      await User.updateOne({ _id: user._id }, { $set: { ...updates, pendingUpdates: null } });
      await logActivity(user._id, user.username, 'PROFILE_UPDATE', { fields: Object.keys(updates) }, req);
      
      const updatedUser = await User.findById(user._id).select('-password');
      const userObj = updatedUser.toObject();

      return res.json({
        success: true,
        isPending: false,
        message: 'Profile updated successfully.',
        user: userObj
      });
    }

    // Standard User profile update requests MUST NOT be applied immediately to live user record.
    // They are recorded into pendingUpdates and sent to Pending Approvals page for Admin review.
    const pendingObj = {
      data: updates,
      requestedAt: new Date(),
      resolvedAt: null,
      status: 'PENDING',
      rejectReason: ''
    };

    await User.updateOne(
      { _id: user._id },
      { $set: { pendingUpdates: pendingObj } }
    );

    await logActivity(user._id, user.username, 'PROFILE_UPDATE_SUBMITTED', { fields: Object.keys(updates) }, req);

    const updatedUser = await User.findById(user._id).select('-password');
    const userObj = updatedUser.toObject();

    return res.json({
      success: true,
      isPending: true,
      message: 'Your update has been submitted and is pending admin approval.',
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

const uploadProfilePicture = async (req, res, next) => {
  try {
    let profilePicUrl = req.body.profilePicture || '';

    if (req.file) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        const fileBuffer = fs.readFileSync(req.file.path);
        const mimeType = req.file.mimetype || 'image/jpeg';
        profilePicUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('Error removing temp file:', err);
        }
      }
    }

    if (!profilePicUrl) {
      return res.status(400).json({ success: false, message: 'Please upload or select a valid image file.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.updateOne({ _id: user._id }, { $set: { profilePicture: profilePicUrl } });

    await logActivity(user._id, user.username, 'PROFILE_PICTURE_CHANGE', {}, req);

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: profilePicUrl
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { username, email, password, firstName, fatherName, grandfatherName, role, phoneNumber, emergencyContactName, emergencyContactPhone, gender, maritalStatus, hasFatherConfessor } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already in use.' });
    }

    const user = new User({
      username,
      email,
      password,
      firstName,
      fatherName,
      grandfatherName,
      lastName: fatherName,
      phoneNumber: phoneNumber || '+251900000000',
      emergencyContactName: emergencyContactName || 'Support',
      emergencyContactPhone: emergencyContactPhone || '+251900000000',
      gender: gender || 'Male',
      maritalStatus: maritalStatus || 'Single',
      hasFatherConfessor: hasFatherConfessor || 'No',
      role: role || 'USER',
      isActive: true
    });

    await user.save();

    const settings = new Settings({ userId: user._id });
    await settings.save();

    await logActivity(user._id, user.username, 'USER_CREATE', { admin: req.user.username }, req);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, message: 'User created successfully', user: userResponse });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role, isActive, serviceSubSection } = req.query;

    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { grandfatherName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (serviceSubSection) query.serviceSubSection = serviceSubSection;

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
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
    const allowed = [
      'firstName', 'fatherName', 'grandfatherName', 'lastName',
      'email', 'role', 'isActive', 'phoneNumber', 'emergencyContactName',
      'emergencyContactPhone', 'usesTelegram', 'dateOfBirth', 'gender',
      'maritalStatus', 'spouseName', 'educationLevel', 'graduationInstitution',
      'fieldOfStudy', 'joinedYear', 'grewUpInChildrenClass', 'sundaySchoolGrade',
      'notStudyingReason', 'serviceSubSection', 'servedInOtherParish',
      'previousServiceSubSection', 'hasFatherConfessor', 'fatherConfessorName',
      'fatherConfessorParish', 'fatherConfessorPhone', 'address'
    ];

    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatePayload = {
      ...updates
    };

    // If user had a pending update, mark it approved
    if (user.pendingUpdates && user.pendingUpdates.status === 'PENDING') {
      updatePayload.pendingUpdates = {
        data: updates,
        requestedAt: user.pendingUpdates.requestedAt,
        resolvedAt: new Date(),
        status: 'APPROVED',
        rejectReason: ''
      };
    }

    await User.updateOne({ _id: user._id }, { $set: updatePayload });

    await logActivity(user._id, user.username, 'USER_UPDATE_DIRECT', { admin: req.user.username, fields: Object.keys(updates) }, req);

    const updatedUser = await User.findById(user._id).select('-password');
    const userObj = updatedUser.toObject();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date(), isActive: false } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logActivity(user._id, user.username, 'USER_DELETE', { admin: req.user.username }, req);

    res.json({ success: true, message: 'User soft-deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const toggleActivation = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = !user.isActive;
    await User.updateOne({ _id: user._id }, { $set: { isActive: newStatus } });

    await logActivity(user._id, user.username, 'USER_STATUS_TOGGLE', { isActive: newStatus }, req);

    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
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

// ================= ADMIN PROFILE UPDATE APPROVAL HANDLERS =================

const getPendingUpdates = async (req, res, next) => {
  try {
    const pendingUsers = await User.find({
      isDeleted: false,
      'pendingUpdates.status': 'PENDING'
    }).select('-password').sort({ 'pendingUpdates.requestedAt': -1 });

    res.json({
      success: true,
      pendingUsers
    });
  } catch (error) {
    next(error);
  }
};

const approveProfileUpdate = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user || !user.pendingUpdates || !user.pendingUpdates.data || user.pendingUpdates.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'No pending updates found for this user.' });
    }

    const proposed = user.pendingUpdates.data;
    const updatePayload = {
      ...proposed,
      pendingUpdates: {
        data: proposed,
        requestedAt: user.pendingUpdates.requestedAt,
        resolvedAt: new Date(),
        status: 'APPROVED',
        rejectReason: ''
      }
    };

    await User.updateOne({ _id: user._id }, { $set: updatePayload });

    await logActivity(user._id, user.username, 'PROFILE_UPDATE_APPROVED', { admin: req.user.username, approvedFields: Object.keys(proposed) }, req);

    const updatedUser = await User.findById(user._id).select('-password');
    const userResponse = updatedUser.toObject();

    res.json({
      success: true,
      message: `Profile update for @${user.username} approved successfully!`,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

const rejectProfileUpdate = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user || !user.pendingUpdates || user.pendingUpdates.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'No pending updates found for this user.' });
    }

    const pendingObj = {
      data: user.pendingUpdates.data,
      requestedAt: user.pendingUpdates.requestedAt,
      resolvedAt: new Date(),
      status: 'REJECTED',
      rejectReason: reason || 'Request rejected by Administrator.'
    };

    await User.updateOne({ _id: user._id }, { $set: { pendingUpdates: pendingObj } });

    await logActivity(user._id, user.username, 'PROFILE_UPDATE_REJECTED', { admin: req.user.username, reason }, req);

    const updatedUser = await User.findById(user._id).select('-password');
    const userResponse = updatedUser.toObject();

    res.json({
      success: true,
      message: `Profile update request for @${user.username} rejected.`,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

const clearPendingStatus = async (req, res, next) => {
  try {
    await User.updateOne({ _id: req.user.id }, { $set: { pendingUpdates: null } });
    const updatedUser = await User.findById(req.user.id).select('-password');
    const userObj = updatedUser ? updatedUser.toObject() : null;
    res.json({ success: true, user: userObj });
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
  resetUserPassword,
  getPendingUpdates,
  approveProfileUpdate,
  rejectProfileUpdate,
  clearPendingStatus
};
