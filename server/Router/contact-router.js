const express = require('express');
const router = express.Router();
const contactController = require('../Controller/contact-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');
const adminMiddleware = require('../Middleware/admin-middleware');
const authController = require('../Controller/auth-controller');

// Debug middleware for contact routes
router.use((req, res, next) => {
    console.log(`📧 Contact API Request: ${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        params: req.params
    });
    next();
});

// Public routes
router.post('/submit', authController.submitContact);
router.get('/user/contacts', contactController.getUserContacts);

// Test endpoint to verify contact API is working
router.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Contact API is working!',
        timestamp: new Date().toISOString(),
        endpoints: {
            submit: 'POST /contact/submit',
            test: 'GET /contact/test'
        }
    });
});

// Admin routes (requires authentication and admin role)
router.get('/admin/contacts', authMiddleware, adminMiddleware, contactController.getAllContacts);
router.get('/admin/contacts/:id', authMiddleware, adminMiddleware, contactController.getContactById);
router.put('/admin/contacts/:id/status', authMiddleware, adminMiddleware, contactController.updateContactStatus);
router.post('/admin/contacts/:id/response', authMiddleware, adminMiddleware, contactController.addContactResponse);
router.delete('/admin/contacts/:id', authMiddleware, adminMiddleware, contactController.deleteContact);
router.get('/admin/stats', authMiddleware, adminMiddleware, contactController.getContactStats);

module.exports = router;
