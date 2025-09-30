const express = require('express');
const router = express.Router();
const refillController = require('../Controller/refill-controller');
const { authenticateToken, isAdmin } = require('../Middleware/auth-middleware');

// ===== REFILL ORDER MANAGEMENT ROUTES =====

// Base route - service information
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Refill Service',
    description: 'CO2 cylinder refill and exchange service',
    endpoints: {
      orders: {
        create: 'POST /orders (requires auth)',
        getUserOrders: 'GET /orders/user/:userId (requires auth)',
        getAllOrders: 'GET /orders (requires admin)',
        getOrderById: 'GET /orders/:id (requires admin)',
        updateStatus: 'PATCH /orders/:id/status (requires admin)',
        schedulePickup: 'PATCH /orders/:id/pickup (requires admin)',
        scheduleDelivery: 'PATCH /orders/:id/delivery (requires admin)',
        cancel: 'PATCH /orders/:id/cancel (requires admin)'
      }
    },
    note: 'All endpoints require authentication. Contact support for assistance.'
  });
});

// Create new refill order (authenticated users)
router.post('/orders', authenticateToken, refillController.createRefillOrder);

// ===== REFILL CYLINDER MANAGEMENT ROUTES =====

// Get all refill cylinders (public)
router.get('/cylinders', refillController.getAllRefillCylinders);

// Get refill cylinder by ID (public)
router.get('/cylinders/:id', refillController.getRefillCylinderById);

// Admin only routes for refill cylinder management
router.post('/cylinders', authenticateToken, isAdmin, refillController.createRefillCylinder);
router.put('/cylinders/:id', authenticateToken, isAdmin, refillController.updateRefillCylinder);
router.delete('/cylinders/:id', authenticateToken, isAdmin, refillController.deleteRefillCylinder);

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
