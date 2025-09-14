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

// Validation middleware
const validateRecipe = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),
  body('ingredients.*.name')
    .trim()
    .notEmpty()
    .withMessage('Ingredient name is required'),
  body('ingredients.*.amount')
    .trim()
    .notEmpty()
    .withMessage('Ingredient amount is required'),
  body('instructions')
    .isArray({ min: 1 })
    .withMessage('At least one instruction is required'),
  body('instructions.*.instruction')
    .trim()
    .notEmpty()
    .withMessage('Instruction text is required'),
  body('prepTime')
    .isInt({ min: 0 })
    .withMessage('Prep time must be a positive number'),
  body('cookTime')
    .isInt({ min: 0 })
    .withMessage('Cook time must be a positive number'),
  body('servings')
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('category')
    .isIn(['Classic', 'Fruity', 'Creamy', 'Refreshing', 'Seasonal', 'Specialty'])
    .withMessage('Invalid category'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
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

module.exports = router;
