const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, uploadProfilePicture,
  createUser, getUsers, getUserById, updateUser,
  deleteUser, toggleActivation, resetUserPassword,
  getPendingUpdates, approveProfileUpdate, rejectProfileUpdate
} = require('../controllers/userController');
const { updateProfileValidator } = require('../validators/userValidator');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// User profile routes (Self)
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfileValidator, updateProfile);
router.post('/me/profile-picture', authenticate, upload.single('profilePicture'), uploadProfilePicture);

// Admin-only Pending Profile Approval routes
router.get('/pending-updates', authenticate, authorize('ADMIN'), getPendingUpdates);
router.post('/:id/approve-update', authenticate, authorize('ADMIN'), approveProfileUpdate);
router.post('/:id/reject-update', authenticate, authorize('ADMIN'), rejectProfileUpdate);

// Admin-only User CRUD routes
router.post('/', authenticate, authorize('ADMIN'), updateProfileValidator, createUser);
router.get('/', authenticate, authorize('ADMIN'), getUsers);
router.get('/:id', authenticate, authorize('ADMIN'), getUserById);
router.put('/:id', authenticate, authorize('ADMIN'), updateProfileValidator, updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);
router.put('/:id/activation', authenticate, authorize('ADMIN'), toggleActivation);
router.post('/:id/reset-password', authenticate, authorize('ADMIN'), resetUserPassword);

module.exports = router;
