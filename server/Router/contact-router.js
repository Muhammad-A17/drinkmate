const express = require('express');
const router = express.Router();
const contactController = require('../Controller/contact-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');
const adminMiddleware = require('../Middleware/admin-middleware');
const authController = require('../Controller/auth-controller');

// Public routes
router.post('/submit', authController.submitContact);

// Admin routes (requires authentication and admin role)
router.get('/admin/contacts', authMiddleware, adminMiddleware, contactController.getAllContacts);
router.get('/admin/contacts/:id', authMiddleware, adminMiddleware, contactController.getContactById);
router.put('/admin/contacts/:id/status', authMiddleware, adminMiddleware, contactController.updateContactStatus);
router.post('/admin/contacts/:id/response', authMiddleware, adminMiddleware, contactController.addContactResponse);
router.delete('/admin/contacts/:id', authMiddleware, adminMiddleware, contactController.deleteContact);
router.get('/admin/stats', authMiddleware, adminMiddleware, contactController.getContactStats);

module.exports = router;
