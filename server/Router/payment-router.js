const express = require('express');
const router = express.Router();
const urwaysController = require('../Controller/urways-controller');
const { authenticateToken } = require('../Middleware/auth-middleware');

// Process Urways payment
router.post('/urways', authenticateToken, urwaysController.createPayment);

// Verify Urways payment
router.get('/urways/verify/:transactionId', urwaysController.verifyPayment);

// Handle Urways callback
router.post('/urways/callback', urwaysController.handleCallback);

// Refund Urways payment
router.post('/urways/refund', authenticateToken, urwaysController.refundPayment);

module.exports = router;