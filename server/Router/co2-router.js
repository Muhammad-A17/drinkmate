const express = require('express');
const router = express.Router();
const co2Controller = require('../Controller/co2-controller');
const { authenticateToken, isAdmin } = require('../Middleware/auth-middleware');

// ===== CYLINDER MANAGEMENT ROUTES =====

// Get all cylinders (public)
router.get('/cylinders', co2Controller.getAllCylinders);

// Get cylinder by ID (public)
router.get('/cylinders/:id', co2Controller.getCylinderById);

// Get cylinder by slug (public)
router.get('/cylinders/slug/:slug', co2Controller.getCylinderBySlug);

// Admin only routes for cylinder management
router.post('/cylinders', authenticateToken, isAdmin, co2Controller.createCylinder);
router.put('/cylinders/:id', authenticateToken, isAdmin, co2Controller.updateCylinder);
router.delete('/cylinders/:id', authenticateToken, isAdmin, co2Controller.deleteCylinder);
router.patch('/cylinders/:id/stock', authenticateToken, isAdmin, co2Controller.updateStock);

// ===== ORDER MANAGEMENT ROUTES =====

// Get all orders (admin only)
router.get('/orders', authenticateToken, isAdmin, co2Controller.getAllOrders);

// Get order by ID (admin only)
router.get('/orders/:id', authenticateToken, isAdmin, co2Controller.getOrderById);

// Create new order (authenticated users)
router.post('/orders', authenticateToken, co2Controller.createOrder);

// Update order status (admin only)
router.patch('/orders/:id/status', authenticateToken, isAdmin, co2Controller.updateOrderStatus);

// Schedule pickup (admin only)
router.patch('/orders/:id/pickup', authenticateToken, isAdmin, co2Controller.schedulePickup);

// Schedule delivery (admin only)
router.patch('/orders/:id/delivery', authenticateToken, isAdmin, co2Controller.scheduleDelivery);

// Update cylinder status in order (admin only)
router.patch('/orders/:id/cylinder-status', authenticateToken, isAdmin, co2Controller.updateCylinderStatus);

// ===== SUBSCRIPTION MANAGEMENT ROUTES =====

// Get all subscriptions (admin only)
router.get('/subscriptions', authenticateToken, isAdmin, co2Controller.getAllSubscriptions);

// Get subscription by ID (admin only)
router.get('/subscriptions/:id', authenticateToken, isAdmin, co2Controller.getSubscriptionById);

// Create new subscription (authenticated users)
router.post('/subscriptions', authenticateToken, co2Controller.createSubscription);

// Update subscription status (admin only)
router.patch('/subscriptions/:id/status', authenticateToken, isAdmin, co2Controller.updateSubscriptionStatus);

// Process subscription refill (admin only)
router.post('/subscriptions/:id/refill', authenticateToken, isAdmin, co2Controller.processSubscriptionRefill);

// ===== ANALYTICS AND REPORTS ROUTES =====

// Get CO2 dashboard stats (admin only)
router.get('/dashboard/stats', authenticateToken, isAdmin, co2Controller.getDashboardStats);

// Get orders by date range (admin only)
router.get('/dashboard/orders-by-date', authenticateToken, isAdmin, co2Controller.getOrdersByDateRange);

module.exports = router;
