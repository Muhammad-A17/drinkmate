const express = require('express');
const router = express.Router();
const refillController = require('../Controller/refill-controller');
const { authenticateToken, isAdmin } = require('../Middleware/auth-middleware');

// ===== REFILL ORDER MANAGEMENT ROUTES =====

// Create new refill order (authenticated users)
router.post('/orders', authenticateToken, refillController.createRefillOrder);

// Get user's refill orders (authenticated users)
router.get('/orders/user/:userId', authenticateToken, refillController.getUserRefillOrders);

// Get all refill orders (admin only)
router.get('/orders', authenticateToken, isAdmin, refillController.getAllRefillOrders);

// Get refill order by ID (admin only)
router.get('/orders/:id', authenticateToken, isAdmin, refillController.getRefillOrderById);

// Update refill order status (admin only)
router.patch('/orders/:id/status', authenticateToken, isAdmin, refillController.updateRefillOrderStatus);

// Schedule pickup (admin only)
router.patch('/orders/:id/pickup', authenticateToken, isAdmin, refillController.schedulePickup);

// Schedule delivery (admin only)
router.patch('/orders/:id/delivery', authenticateToken, isAdmin, refillController.scheduleDelivery);

// Cancel refill order (admin only)
router.patch('/orders/:id/cancel', authenticateToken, isAdmin, refillController.cancelRefillOrder);

// ===== DASHBOARD AND ANALYTICS ROUTES =====

// Get refill dashboard stats (admin only)
router.get('/dashboard/stats', authenticateToken, isAdmin, refillController.getRefillDashboardStats);

module.exports = router;
