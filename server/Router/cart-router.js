const express = require('express');
const router = express.Router();
const cartController = require('../Controller/cart-controller');
const { authenticateToken } = require('../Middleware/auth-middleware');

// All cart routes require authentication
router.use(authenticateToken);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/add', cartController.addToCart);

// Update item quantity
router.put('/update', cartController.updateCartItem);

// Remove item from cart
router.delete('/remove/:productId', cartController.removeFromCart);

// Clear entire cart
router.delete('/clear', cartController.clearCart);

// Sync cart with localStorage (merge)
router.post('/sync', cartController.syncCart);

module.exports = router;

