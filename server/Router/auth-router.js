const express = require('express');
const router = express.Router();
const authController = require('../Controller/auth-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');

router.get('/', authController.home);
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

module.exports = router;
