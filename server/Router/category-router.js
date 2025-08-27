const express = require('express');
const router = express.Router();
const categoryController = require('../Controller/category-controller');

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Category router is working' });
});

// Public routes
router.get('/categories', categoryController.getAllCategories);
router.get('/subcategories', categoryController.getAllSubcategories);
router.get('/categories/:categoryId/subcategories', categoryController.getSubcategoriesByCategory);
router.get('/categories/:id', categoryController.getCategoryById);
router.get('/subcategories/:id', categoryController.getSubcategoryById);



module.exports = router;
