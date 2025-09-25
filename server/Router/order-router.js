const express = require('express');
const router = express.Router();
const orderController = require('../Controller/order-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');
const adminMiddleware = require('../Middleware/admin-middleware');

// Public routes - Order Tracking
router.get('/track/:orderNumber', orderController.trackOrder);

// User routes (requires authentication)
router.post('/orders', authMiddleware, orderController.createOrder);
router.get('/orders', authMiddleware, orderController.getUserOrders);
router.get('/orders/:id', authMiddleware, orderController.getOrder);
router.post('/orders/:id/cancel', authMiddleware, orderController.cancelOrder);
router.post('/validate-coupon', authMiddleware, orderController.validateCoupon);

// Enhanced order tracking routes (requires authentication)
router.get('/recent-orders', authMiddleware, orderController.getRecentOrders);
router.get('/order-history', authMiddleware, orderController.getAllUserOrders);

// Admin routes
router.get('/admin/orders', authMiddleware, adminMiddleware, orderController.getAllOrders);
router.put('/admin/orders/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

// URWAYS Payment routes are handled in payment-router.js

module.exports = router;
