const express = require('express');
const router = express.Router();
const {
  getAllRecipes,
  getRecipeBySlug,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getFeaturedRecipes,
  getRecipesByCategory,
  rateRecipe,
  getRecipeStats
} = require('../Controller/recipe-controller');
const { authenticateToken, isAdmin } = require('../Middleware/auth-middleware');
const { body, param, query } = require('express-validator');

// Validation middleware - Only title is required
const validateRecipe = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2100 })
    .withMessage('Description must be less than 2100 characters'),
  body('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array'),
  body('ingredients.*.name')
    .optional()
    .trim(),
  body('ingredients.*.amount')
    .optional()
    .trim(),
  body('instructions')
    .optional()
    .isArray()
    .withMessage('Instructions must be an array'),
  body('instructions.*.instruction')
    .optional()
    .trim(),
  body('prepTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Prep time must be a positive number'),
  body('cookTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Cook time must be a positive number'),
  body('servings')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('category')
    .optional()
    .isIn(['Classic', 'Fruity', 'Creamy', 'Refreshing', 'Seasonal', 'Specialty'])
    .withMessage('Invalid category'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*.url')
    .optional()
    .notEmpty()
    .withMessage('Image URL cannot be empty if provided'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean')
];

const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];

// Public routes
router.get('/', getAllRecipes);
router.get('/featured', getFeaturedRecipes);
router.get('/category/:category', getRecipesByCategory);
router.get('/stats', getRecipeStats);
router.get('/slug/:slug', getRecipeBySlug);
router.post('/:id/rate', validateRating, rateRecipe);

// Protected routes (require authentication)
router.get('/admin/:id', authenticateToken, getRecipeById);

// Admin routes (require admin role)
router.post('/admin', authenticateToken, isAdmin, validateRecipe, createRecipe);
router.put('/admin/:id', authenticateToken, isAdmin, validateRecipe, updateRecipe);
router.delete('/admin/:id', authenticateToken, isAdmin, deleteRecipe);

// Also add regular routes for admin panel
router.post('/', authenticateToken, isAdmin, validateRecipe, createRecipe);
router.put('/:id', authenticateToken, isAdmin, validateRecipe, updateRecipe);
router.delete('/:id', authenticateToken, isAdmin, deleteRecipe);

module.exports = router;
