const User = require('../models/User');
const Settings = require('../models/Settings');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { logActivity, logLoginAttempt } = require('../services/auditService');

const register = async (req, res, next) => {
  try {
    const { 
      username, email, password, firstName, fatherName, grandfatherName, lastName, 
      phoneNumber, emergencyContactName, emergencyContactPhone, usesTelegram,
      dateOfBirth, gender, maritalStatus, spouseName, 
      educationLevel, graduationInstitution, fieldOfStudy,
      joinedYear, grewUpInChildrenClass, sundaySchoolGrade, notStudyingReason,
      serviceSubSection, servedInOtherParish, previousServiceSubSection,
      hasFatherConfessor, fatherConfessorName, fatherConfessorParish, fatherConfessorPhone,
      address 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already in use.' 
      });
    }

    // Create user (password is hashed in pre-save hook)
    const user = new User({
      username, email, password, firstName, 
      fatherName, grandfatherName, lastName: lastName || fatherName, 
      phoneNumber, emergencyContactName, emergencyContactPhone, usesTelegram,
      dateOfBirth, gender, maritalStatus, spouseName, 
      educationLevel, graduationInstitution, fieldOfStudy,
      joinedYear, grewUpInChildrenClass, sundaySchoolGrade, notStudyingReason,
      serviceSubSection, servedInOtherParish, previousServiceSubSection,
      hasFatherConfessor, fatherConfessorName, fatherConfessorParish, fatherConfessorPhone,
      address,
      role: 'USER', // Default role
      isActive: true
    });

    await user.save();

    // Create default settings for user
    const settings = new Settings({
      userId: user._id,
      theme: 'light',
      emailNotifications: true
    });
    await settings.save();

    // Log activity
    await logActivity(user._id, user.username, 'USER_CREATE', { source: 'registration' }, req);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      accessToken,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail }
      ]
    });

    if (!user || user.isDeleted) {
      await logLoginAttempt(null, usernameOrEmail, 'FAILED', 'User not found', req);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      await logLoginAttempt(user._id, user.username, 'FAILED', 'Account is deactivated', req);
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact an admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logLoginAttempt(user._id, user.username, 'FAILED', 'Incorrect password', req);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Success
    await logLoginAttempt(user._id, user.username, 'SUCCESS', '', req);
    await logActivity(user._id, user.username, 'LOGIN', {}, req);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logActivity(req.user._id, req.user.username, 'LOGOUT', {}, req);
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive || user.isDeleted) {
      return res.status(401).json({ success: false, message: 'User is inactive or no longer exists' });
    }

    const accessToken = generateAccessToken(user);
    res.json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password.' });
    }

    user.password = newPassword; // gets hashed in pre-save hook
    await user.save();

    await logActivity(user._id, user.username, 'PASSWORD_RESET', { trigger: 'self' }, req);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.id });
    if (!settings) {
      settings = await Settings.create({ userId: req.user.id });
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { theme, emailNotifications } = req.body;
    let settings = await Settings.findOne({ userId: req.user.id });
    if (!settings) {
      settings = new Settings({ userId: req.user.id });
    }
    if (theme) settings.theme = theme;
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;

    await settings.save();
    res.json({ success: true, settings, message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
  getSettings,
  updateSettings
};
