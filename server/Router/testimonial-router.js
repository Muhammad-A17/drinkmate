const express = require('express');
const router = express.Router();
const testimonialController = require('../Controller/testimonial-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');
const adminMiddleware = require('../Middleware/admin-middleware');

// Base route - redirect to testimonials
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Testimonial Service',
    endpoints: {
      testimonials: 'GET /testimonials',
      byId: 'GET /testimonials/:id',
      submit: 'POST /submit (requires auth)',
      admin: {
        create: 'POST /admin/testimonials (requires admin)',
        update: 'PUT /admin/testimonials/:id (requires admin)',
        delete: 'DELETE /admin/testimonials/:id (requires admin)',
        approve: 'PUT /admin/testimonials/:id/approve (requires admin)'
      }
    }
  });
});

// Public routes
router.get('/testimonials', testimonialController.getAllTestimonials);
router.get('/testimonials/:id', testimonialController.getTestimonialById);

// User routes (requires authentication)
router.post('/submit', authMiddleware, testimonialController.submitTestimonial);

// Admin routes (requires authentication and admin role)
router.post('/admin/testimonials', authMiddleware, adminMiddleware, testimonialController.createTestimonial);
router.put('/admin/testimonials/:id', authMiddleware, adminMiddleware, testimonialController.updateTestimonial);
router.delete('/admin/testimonials/:id', authMiddleware, adminMiddleware, testimonialController.deleteTestimonial);
router.put('/admin/testimonials/:id/approve', authMiddleware, adminMiddleware, testimonialController.approveTestimonial);

module.exports = router;
