const Recipe = require('../Models/recipe-model');
const { validationResult } = require('express-validator');

// Get all recipes with pagination and filtering
const getAllRecipes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      difficulty,
      featured,
      published = true,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - default to published recipes for public API
    const filter = { published: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (featured) filter.featured = featured === 'true';

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: {
        path: 'author',
        select: 'username firstName lastName'
      }
    };

    const recipes = await Recipe.paginate(filter, options);

    res.json({
      success: true,
      recipes: recipes.docs,
      pagination: {
        currentPage: recipes.page,
        totalPages: recipes.totalPages,
        totalRecipes: recipes.totalDocs,
        hasNext: recipes.hasNextPage,
        hasPrev: recipes.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipes',
      error: error.message
    });
  }
};

// Get single recipe by slug
const getRecipeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const recipe = await Recipe.findOne({ slug, published: true })
      .populate('author', 'username firstName lastName')
      .populate('relatedRecipes', 'title slug images');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Increment view count
    await recipe.incrementViews();

    res.json({
      success: true,
      recipe
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipe',
      error: error.message
    });
  }
};

// Get recipe by ID (for admin)
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id)
      .populate('author', 'username firstName lastName')
      .populate('relatedRecipes', 'title slug images');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      recipe
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipe',
      error: error.message
    });
  }
};

// Create new recipe
const createRecipe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const recipeData = {
      ...req.body,
      author: req.user.id
    };

    const recipe = new Recipe(recipeData);
    await recipe.save();

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      recipe
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create recipe',
      error: error.message
    });
  }
};

// Update recipe
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const recipe = await Recipe.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      recipe
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update recipe',
      error: error.message
    });
  }
};

// Delete recipe
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete recipe',
      error: error.message
    });
  }
};

// Get featured recipes
const getFeaturedRecipes = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const recipes = await Recipe.findFeatured(parseInt(limit));

    res.json({
      success: true,
      recipes
    });
  } catch (error) {
    console.error('Error fetching featured recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured recipes',
      error: error.message
    });
  }
};

// Get recipes by category
const getRecipesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 12 } = req.query;

    const recipes = await Recipe.findByCategory(category, parseInt(limit));

    res.json({
      success: true,
      recipes
    });
  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipes by category',
      error: error.message
    });
  }
};

// Rate recipe
const rateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    await recipe.updateRating(rating);

    res.json({
      success: true,
      message: 'Recipe rated successfully',
      rating: recipe.rating
    });
  } catch (error) {
    console.error('Error rating recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate recipe',
      error: error.message
    });
  }
};

// Get recipe statistics
const getRecipeStats = async (req, res) => {
  try {
    const stats = await Recipe.aggregate([
      {
        $group: {
          _id: null,
          totalRecipes: { $sum: 1 },
          publishedRecipes: {
            $sum: { $cond: [{ $eq: ['$published', true] }, 1, 0] }
          },
          featuredRecipes: {
            $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          avgRating: { $avg: '$rating.average' }
        }
      }
    ]);

    const categoryStats = await Recipe.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalRecipes: 0,
        publishedRecipes: 0,
        featuredRecipes: 0,
        totalViews: 0,
        totalLikes: 0,
        avgRating: 0
      },
      categoryStats
    });
  } catch (error) {
    console.error('Error fetching recipe stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipe statistics',
      error: error.message
    });
  }
};

module.exports = {
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
};
