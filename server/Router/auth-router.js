const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../Controller/auth-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');
const { storage } = require('../Utils/cloudinary');

// Configure multer for file uploads
const upload = multer({ storage: storage });

router.get('/', authController.home);
router.post('/create-admin', authController.createAdminUser);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/verify', authMiddleware, authController.verifyToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/contact', authController.submitContact);
router.post('/test-email', authController.testEmail);
router.post('/test-welcome-email', authController.testWelcomeEmail);

// Profile routes (require authentication)
router.get('/profile', authMiddleware, authController.getUserProfile);
router.put('/profile', authMiddleware, authController.updateUserProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
