const express = require('express');
const router = express.Router();
const exchangeCylinderController = require('../Controller/exchange-cylinder-controller');
const { authenticateToken, isAdmin } = require('../Middleware/auth-middleware');

// ===== EXCHANGE CYLINDER MANAGEMENT ROUTES =====

// Public routes
// Get all exchange cylinders (public)
router.get('/cylinders', exchangeCylinderController.getAllExchangeCylinders);

// Get exchange cylinder by ID (public)
router.get('/cylinders/:id', exchangeCylinderController.getExchangeCylinderById);

// Get exchange cylinder by slug (public)
router.get('/cylinders/slug/:slug', exchangeCylinderController.getExchangeCylinderBySlug);

// Get exchange cylinders by type (public)
router.get('/cylinders/type/:type', exchangeCylinderController.getByExchangeType);

// Get exchange cylinders by service level (public)
router.get('/cylinders/service-level/:level', exchangeCylinderController.getByServiceLevel);

// Get exchange cylinders available in area (public)
router.get('/cylinders/area/:area', exchangeCylinderController.getAvailableInArea);

// Get best sellers (public)
router.get('/cylinders/best-sellers', exchangeCylinderController.getBestSellers);

// Get featured exchange cylinders (public)
router.get('/cylinders/featured', exchangeCylinderController.getFeatured);

// Get service statistics (public)
router.get('/cylinders/stats', exchangeCylinderController.getServiceStats);

// ===== AUTHENTICATED ROUTES =====

// Record exchange transaction (authenticated)
router.post('/cylinders/:cylinderId/exchange', authenticateToken, exchangeCylinderController.recordExchange);

// Update rating (authenticated)
router.post('/cylinders/:cylinderId/rating', authenticateToken, exchangeCylinderController.updateRating);

// ===== ADMIN ROUTES =====

// Create new exchange cylinder (admin only)
router.post('/cylinders', authenticateToken, isAdmin, (req, res, next) => {
  console.log('POST /cylinders - Request received');
  console.log('Auth headers:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('Request user:', req.user);
  next();
}, exchangeCylinderController.createExchangeCylinder);

// Update exchange cylinder (admin only)
router.put('/cylinders/:id', authenticateToken, isAdmin, exchangeCylinderController.updateExchangeCylinder);

// Delete exchange cylinder (admin only)
router.delete('/cylinders/:id', authenticateToken, isAdmin, exchangeCylinderController.deleteExchangeCylinder);

// Update stock (admin only)
router.put('/cylinders/:cylinderId/stock', authenticateToken, isAdmin, exchangeCylinderController.updateStock);

module.exports = router;
