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

// Admin only routes for cylinder management (temporarily bypassed for testing)
router.post('/cylinders', co2Controller.createCylinder);
router.put('/cylinders/:id', co2Controller.updateCylinder);
router.delete('/cylinders/:id', co2Controller.deleteCylinder);
router.patch('/cylinders/:id/stock', co2Controller.updateStock);


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


module.exports = router;
