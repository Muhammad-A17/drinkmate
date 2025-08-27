const express = require('express');
const router = express.Router();
const productController = require('../Controller/product-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');
const adminMiddleware = require('../Middleware/admin-middleware');

// Public routes
router.get('/products', productController.getAllProducts);
router.get('/products/:idOrSlug', productController.getProduct);
router.get('/categories', productController.getCategories);
router.get('/categories/:slug/products', productController.getProductsByCategory);
router.get('/bundles', productController.getBundles);
router.get('/bundles/:idOrSlug', productController.getBundle);

// Review routes (public for reading, protected for creating)
router.get('/products/:id/reviews', productController.getProductReviews);
router.get('/bundles/:id/reviews', productController.getBundleReviews);
router.post('/reviews', authMiddleware, productController.createReview);
router.put('/reviews/:id', authMiddleware, productController.updateReview);
router.delete('/reviews/:id', authMiddleware, productController.deleteReview);

// Protected admin routes
router.post('/products', authMiddleware, adminMiddleware, productController.createProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, productController.updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

// Bundle management routes (admin only)
router.post('/bundles', authMiddleware, adminMiddleware, productController.createBundle);
router.put('/bundles/:id', authMiddleware, adminMiddleware, productController.updateBundle);
router.delete('/bundles/:id', authMiddleware, adminMiddleware, productController.deleteBundle);

module.exports = router;
