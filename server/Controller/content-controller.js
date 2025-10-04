const Blog = require('../Models/blog-model');
const Recipe = require('../Models/recipe-model');
const { createErrorResponse, logError } = require('../Utils/error-handler');

// Get all blog posts for admin
const getBlogPosts = async (req, res) => {
  try {
    console.log('📝 Fetching blog posts...');
    
    const blogPosts = await Blog.find()
      .sort({ createdAt: -1 })
      .select('_id title slug excerpt category author publishedAt status featured comments image createdAt updatedAt');

    console.log(`📝 Found ${blogPosts.length} blog posts`);

    res.json({
      success: true,
      data: blogPosts
    });

  } catch (error) {
    logError(error, 'ContentController');
    res.status(500).json(createErrorResponse(
      'Failed to fetch blog posts',
      error.message
    ));
  }
};

// Get all recipes for admin
const getRecipes = async (req, res) => {
  try {
    console.log('🍳 Fetching recipes...');
    
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .select('_id title slug excerpt category difficulty prepTime ingredients publishedAt status featured image createdAt updatedAt');

    console.log(`🍳 Found ${recipes.length} recipes`);

    res.json({
      success: true,
      data: recipes
    });

  } catch (error) {
    logError(error, 'ContentController');
    res.status(500).json(createErrorResponse(
      'Failed to fetch recipes',
      error.message
    ));
  }
};

// Create new blog post
const createBlogPost = async (req, res) => {
  try {
    console.log('📝 Creating blog post...');
    
    const blogData = {
      ...req.body,
      author: req.user.fullName || req.user.email,
      publishedAt: req.body.status === 'published' ? new Date() : null
    };

    const blogPost = new Blog(blogData);
    await blogPost.save();

    console.log('📝 Blog post created:', blogPost._id);

    res.status(201).json({
      success: true,
      data: blogPost,
      message: 'Blog post created successfully'
    });

  } catch (error) {
    logError(error, 'ContentController');
    res.status(500).json(createErrorResponse(
      'Failed to create blog post',
      error.message
    ));
  }
};

// Create new recipe
const createRecipe = async (req, res) => {
  try {
    console.log('🍳 Creating recipe...');
    
    const recipeData = {
      ...req.body,
      publishedAt: req.body.status === 'published' ? new Date() : null
    };

    const recipe = new Recipe(recipeData);
    await recipe.save();

    console.log('🍳 Recipe created:', recipe._id);

    res.status(201).json({
      success: true,
      data: recipe,
      message: 'Recipe created successfully'
    });

  } catch (error) {
    logError(error, 'ContentController');
    res.status(500).json(createErrorResponse(
      'Failed to create recipe',
      error.message
    ));
  }
};

// Update blog post
const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Updating blog post:', id);
    
    const updateData = { ...req.body };
    if (updateData.status === 'published' && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const blogPost = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!blogPost) {
      return res.status(404).json(createErrorResponse(
        'Blog post not found',
        'The requested blog post does not exist'
      ));
    }

    console.log('📝 Blog post updated:', blogPost._id);

    res.json({
      success: true,
      data: blogPost,
      message: 'Blog post updated successfully'
    });

  } catch (error) {
    logError(error, 'ContentController');
    res.status(500).json(createErrorResponse(
      'Failed to update blog post',
      error.message
    ));
  }
};

// Update recipe
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🍳 Updating recipe:', id);
    
    const updateData = { ...req.body };
    if (updateData.status === 'published' && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const recipe = await Recipe.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!recipe) {
      return res.status(404).json(createErrorResponse(
        'Recipe not found',
        'The requested recipe does not exist'
      ));
    }

    console.log('🍳 Recipe updated:', recipe._id);

    res.json({
      success: true,
      data: recipe,
      message: 'Recipe updated successfully'
    });

  } catch (error) {
    logError(error, 'ContentController');
    res.status(500).json(createErrorResponse(
      'Failed to update recipe',
      error.message
    ));
  }
};

// Delete blog post
const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Deleting blog post:', id);
    
    const blogPost = await Blog.findByIdAndDelete(id);

    if (!blogPost) {
      return res.status(404).json(createErrorResponse(
        'Blog post not found',
        'The requested blog post does not exist'
      ));
    }

    console.log('📝 Blog post deleted:', id);

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    logError(error, 'ContentController');
    res.status(500).json(createErrorResponse(
      'Failed to delete blog post',
      error.message
    ));
  }
};

// Delete recipe
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🍳 Deleting recipe:', id);
    
    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return res.status(404).json(createErrorResponse(
        'Recipe not found',
        'The requested recipe does not exist'
      ));
    }

    console.log('🍳 Recipe deleted:', id);

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });

  } catch (error) {
    logError(error, 'ContentController');
    res.status(500).json(createErrorResponse(
      'Failed to delete recipe',
      error.message
    ));
  }
};

module.exports = {
  getBlogPosts,
  getRecipes,
  createBlogPost,
  createRecipe,
  updateBlogPost,
  updateRecipe,
  deleteBlogPost,
  deleteRecipe
};
