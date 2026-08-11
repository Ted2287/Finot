const { body, validationResult } = require('express-validator');

// Helper to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

const registerValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required'),
  body('fatherName')
    .trim()
    .notEmpty().withMessage("Father's name is required"),
  body('grandfatherName')
    .trim()
    .notEmpty().withMessage("Grandfather's name is required"),
  body('gender')
    .notEmpty().withMessage('Gender is required'),
  body('maritalStatus')
    .notEmpty().withMessage('Marital status is required'),
  body('spouseName')
    .custom((value, { req }) => {
      const isMarried = req.body.maritalStatus === 'Married' || req.body.maritalStatus === 'ያገባ';
      if (isMarried && (!value || value.trim() === '')) {
        throw new Error('Spouse name is required when married');
      }
      return true;
    }),
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  body('emergencyContactName')
    .trim()
    .notEmpty().withMessage('Emergency contact name is required'),
  body('emergencyContactPhone')
    .trim()
    .notEmpty().withMessage('Emergency contact phone number is required'),
  body('hasFatherConfessor')
    .notEmpty().withMessage('Father confessor status is required'),
  body('fatherConfessorName')
    .custom((value, { req }) => {
      const hasFC = req.body.hasFatherConfessor === 'Yes' || req.body.hasFatherConfessor === 'አዎ አለኝ';
      if (hasFC && (!value || value.trim() === '')) {
        throw new Error('Father confessor name is required when selected Yes');
      }
      return true;
    }),
  body('educationLevel')
    .optional({ checkFalsy: true })
    .trim(),
  validate
];

const loginValidator = [
  body('usernameOrEmail')
    .trim()
    .notEmpty().withMessage('Username or Email is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

const updateProfileValidator = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty().withMessage('First name cannot be empty'),
  body('fatherName')
    .optional()
    .trim()
    .notEmpty().withMessage("Father's name cannot be empty"),
  body('grandfatherName')
    .optional()
    .trim()
    .notEmpty().withMessage("Grandfather's name cannot be empty"),
  body('phoneNumber')
    .optional()
    .trim(),
  body('dateOfBirth')
    .optional(),
  body('spouseName')
    .custom((value, { req }) => {
      const isMarried = req.body.maritalStatus === 'Married' || req.body.maritalStatus === 'ያገባ';
      if (isMarried && (!value || value.trim() === '')) {
        throw new Error('Spouse name is required when married');
      }
      return true;
    }),
  validate
];

const changePasswordValidator = [
  body('oldPassword')
    .notEmpty().withMessage('Old password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  validate
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator
};
