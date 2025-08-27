const express = require('express');
const router = express.Router();
const blogController = require('../Controller/blog-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');
const adminMiddleware = require('../Middleware/admin-middleware');

// Public routes
router.get('/posts', blogController.getAllPosts);
router.get('/posts/:idOrSlug', blogController.getPost);
router.post('/posts/:id/like', blogController.likePost);

// User routes (requires authentication)
router.post('/posts/:id/comments', authMiddleware, blogController.addComment);

// Admin routes (requires authentication and admin role)
router.post('/admin/posts', authMiddleware, adminMiddleware, blogController.createPost);
router.put('/admin/posts/:id', authMiddleware, adminMiddleware, blogController.updatePost);
router.delete('/admin/posts/:id', authMiddleware, adminMiddleware, blogController.deletePost);
router.put('/admin/posts/:postId/comments/:commentId/approve', authMiddleware, adminMiddleware, blogController.approveComment);

module.exports = router;
