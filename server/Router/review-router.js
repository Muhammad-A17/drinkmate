const express = require('express');
const router = express.Router();
const reviewController = require('../Controller/review-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');
const adminMiddleware = require('../Middleware/admin-middleware');

// Base route - service information
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Review Service',
    description: 'Product, bundle, and CO2 cylinder review management',
    endpoints: {
      public: {
        getAllReviews: 'GET /reviews',
        getReviewById: 'GET /reviews/:id'
      },
      user: {
        createReview: 'POST /reviews (requires auth)',
        voteReview: 'POST /reviews/:id/vote (requires auth)'
      },
      admin: {
        getAllReviewsAdmin: 'GET /admin/reviews (requires admin)',
        updateReview: 'PUT /admin/reviews/:id (requires admin)',
        deleteReview: 'DELETE /admin/reviews/:id (requires admin)',
        approveReview: 'PUT /admin/reviews/:id/approve (requires admin)',
        rejectReview: 'PUT /admin/reviews/:id/reject (requires admin)',
        addAdminResponse: 'POST /admin/reviews/:id/response (requires admin)',
        bulkUpdateReviews: 'POST /admin/reviews/bulk (requires admin)'
      }
    }
  });
});

// Public routes
router.get('/reviews', reviewController.getAllReviews);
router.get('/reviews/:id', reviewController.getReviewById);

// User routes (requires authentication)
router.post('/reviews', authMiddleware, reviewController.createReview);
router.post('/reviews/:id/vote', authMiddleware, reviewController.voteReview);

// Admin routes (requires authentication and admin role)
router.get('/admin/reviews', authMiddleware, adminMiddleware, reviewController.getAllReviewsAdmin);
router.put('/admin/reviews/:id', authMiddleware, adminMiddleware, reviewController.updateReview);
router.delete('/admin/reviews/:id', authMiddleware, adminMiddleware, reviewController.deleteReview);
router.put('/admin/reviews/:id/approve', authMiddleware, adminMiddleware, reviewController.approveReview);
router.put('/admin/reviews/:id/reject', authMiddleware, adminMiddleware, reviewController.rejectReview);
router.post('/admin/reviews/:id/response', authMiddleware, adminMiddleware, reviewController.addAdminResponse);
router.post('/admin/reviews/bulk', authMiddleware, adminMiddleware, reviewController.bulkUpdateReviews);

module.exports = router;
