const express = require('express');
const router = express.Router();
const wishlistController = require('../Controller/wishlist-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');

// All wishlist routes require authentication
router.use(authMiddleware);

// Get user's wishlist
router.get('/', (req, res) => wishlistController.getWishlist(req, res));

// Add item to wishlist
router.post('/add', (req, res) => wishlistController.addToWishlist(req, res));

// Remove item from wishlist
router.delete('/remove/:productId', (req, res) => wishlistController.removeFromWishlist(req, res));

// Toggle item in wishlist (add if not present, remove if present)
router.post('/toggle', (req, res) => wishlistController.toggleWishlist(req, res));

// Clear wishlist
router.delete('/clear', (req, res) => wishlistController.clearWishlist(req, res));

// Check if product is in wishlist
router.get('/check/:productId', (req, res) => wishlistController.checkWishlistStatus(req, res));

module.exports = router;
