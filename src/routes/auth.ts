import { Router } from 'express';
import { register, login, getProfile, changePassword, changeEmail, addUserAsAdmin, updateUserAsAdmin, deleteUserAsAdmin, getAllUsersAsAdmin, getProfileAsAdmin } from '../controllers/authController';
import { validateUserRegistration, validateUserLogin, validateChangePassword, validateChangeEmail, validateAddUserAsAdmin, validateUpdateUserAsAdmin, validateDeleteUserAsAdmin } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.post('/profile', authenticate, getProfile);
router.post('/change-password', authenticate, validateChangePassword, changePassword);
router.post('/change-email', authenticate, validateChangeEmail, changeEmail);

// Admin routes
router.post('/add-admin', authenticate, authorize('admin'), validateAddUserAsAdmin, addUserAsAdmin);
router.post('/update-admin', authenticate, authorize('admin'), validateUpdateUserAsAdmin, updateUserAsAdmin);
router.post('/delete-admin', authenticate, authorize('admin'), validateDeleteUserAsAdmin, deleteUserAsAdmin);
router.post('/get-all-admin', authenticate, authorize('admin'), getAllUsersAsAdmin);
router.post('/get-detail-admin', authenticate, authorize('admin'), getProfileAsAdmin);

export default router;
