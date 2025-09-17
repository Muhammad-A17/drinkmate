const express = require('express');
const router = express.Router();
const recommendationController = require('../Controller/recommendation-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');

// Get personalized recommendations (requires authentication)
router.get('/personalized', authMiddleware, (req, res) => recommendationController.getPersonalizedRecommendations(req, res));

// Get best selling products (public endpoint)
router.get('/best-selling', (req, res) => recommendationController.getBestSellingProducts(req, res));

module.exports = router;
