const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../Middleware/auth-middleware');
const adminMiddleware = require('../Middleware/admin-middleware');
const { getAllUsers, deleteUser } = require('../Controller/admin-controller');
const categoryController = require('../Controller/category-controller');
const orderController = require('../Controller/order-controller');
const { storage, deleteImage } = require('../Utils/cloudinary');
const User = require('../Models/user-model');

// Configure multer with Cloudinary storage
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (Cloudinary can handle larger files)
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create admin user endpoint (for testing)
router.post('/create-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@drinkmate.com' });
    if (existingAdmin) {
      return res.status(200).json({
        success: true,
        message: 'Admin user already exists',
        user: {
          _id: existingAdmin._id,
          email: existingAdmin.email,
          isAdmin: existingAdmin.isAdmin
        }
      });
    }
    
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@drinkmate.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      isActive: true,
      emailVerified: true
    });
    
    await adminUser.save();
    
    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        _id: adminUser._id,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
});

// Protected routes (auth + admin)
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

// Orders routes
router.get('/orders', authMiddleware, adminMiddleware, orderController.getAllOrders);

// Review management routes
router.get('/reviews', authMiddleware, adminMiddleware, require('../Controller/product-controller').getAllReviews);
router.put('/reviews/:id/status', authMiddleware, adminMiddleware, require('../Controller/product-controller').updateReviewStatus);

// Category management routes
router.get('/categories', authMiddleware, adminMiddleware, categoryController.getAdminCategories);
router.get('/subcategories', authMiddleware, adminMiddleware, categoryController.getAdminSubcategories);
router.post('/categories', authMiddleware, adminMiddleware, categoryController.createCategory);
router.post('/subcategories', authMiddleware, adminMiddleware, categoryController.createSubcategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, categoryController.updateCategory);
router.put('/subcategories/:id', authMiddleware, adminMiddleware, categoryController.updateSubcategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);
router.delete('/subcategories/:id', authMiddleware, adminMiddleware, categoryController.deleteSubcategory);
router.patch('/categories/:id/toggle', authMiddleware, adminMiddleware, categoryController.toggleCategoryStatus);
router.patch('/subcategories/:id/toggle', authMiddleware, adminMiddleware, categoryController.toggleSubcategoryStatus);

// Utility route for updating item counts
router.post('/update-item-counts', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await categoryController.updateItemCounts();
        res.status(200).json({
            success: true,
            message: 'Item counts updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update item counts'
        });
    }
});

// Temporary endpoint to create admin user (remove in production)
router.post('/create-admin', async (req, res) => {
  try {
    const User = require('../Models/user-model');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists'
      });
    }
    
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@drinkmate.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      status: 'active'
    });
    
    await adminUser.save();
    
    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        _id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
});

// Temporary endpoint to create default categories (remove in production)
router.post('/create-default-categories', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const Category = require('../Models/category-model');
    const Subcategory = require('../Models/subcategory-model');
    
    // Check if force reset is requested
    const { forceReset } = req.query;
    
    if (forceReset === 'true') {
      // Clear all existing categories and subcategories
      await Category.deleteMany({});
      await Subcategory.deleteMany({});
      console.log('Forced reset: Cleared all existing categories and subcategories');
    }
    
    // Check if default categories already exist
    const defaultCategoryNames = ['Soda Makers', 'Flavors', 'Accessories', 'Starter Kits'];
    const existingDefaultCategories = await Category.find({ name: { $in: defaultCategoryNames } });
    
    if (existingDefaultCategories.length === defaultCategoryNames.length && !forceReset) {
      return res.status(400).json({
        success: false,
        message: 'Default categories already exist. Use ?forceReset=true to reset all categories.'
      });
    }
    
    // If some default categories exist, we'll add the missing ones
    // If no default categories exist, we'll create all of them
    const existingNames = existingDefaultCategories.map(cat => cat.name);
    
    // Define default categories
    const defaultCategories = [
      {
        name: 'Soda Makers',
        slug: 'sodamakers',
        description: 'Professional soda making machines',
        isActive: true
      },
      {
        name: 'Flavors',
        slug: 'flavors',
        description: 'Premium Italian flavor syrups',
        isActive: true
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Essential soda making accessories',
        isActive: true
      },
      {
        name: 'Starter Kits',
        slug: 'starter-kits',
        description: 'Complete starter packages',
        isActive: true
      }
    ];
    
    // Filter out categories that already exist
    const categoriesToCreate = defaultCategories.filter(cat => !existingNames.includes(cat.name));
    
    if (categoriesToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All default categories already exist'
      });
    }
    
    const createdCategories = await Category.insertMany(categoriesToCreate);
    
    console.log(`Created ${createdCategories.length} new categories:`, createdCategories.map(cat => cat.name));
    
    // Create subcategories dynamically based on created categories
    const subcategories = [];
    
    for (const category of createdCategories) {
      switch (category.name) {
        case 'Soda Makers':
          subcategories.push(
            {
              name: 'Artic Series',
              slug: 'artic-series',
              description: 'Premium Artic soda makers',
              category: category._id,
              isActive: true
            },
            {
              name: 'Luxe Series',
              slug: 'luxe-series',
              description: 'Luxury soda makers',
              category: category._id,
              isActive: true
            },
            {
              name: 'Omni Series',
              slug: 'omni-series',
              description: 'Versatile Omni soda makers',
              category: category._id,
              isActive: true
            }
          );
          break;
          
        case 'Flavors':
          subcategories.push(
            {
              name: 'Classic Flavors',
              slug: 'classic-flavors',
              description: 'Traditional soda flavors',
              category: category._id,
              isActive: true
            },
            {
              name: 'Premium Flavors',
              slug: 'premium-flavors',
              description: 'Exclusive premium flavors',
              category: category._id,
              isActive: true
            },
            {
              name: 'Mocktail Flavors',
              slug: 'mocktail-flavors',
              description: 'Non-alcoholic cocktail flavors',
              category: category._id,
              isActive: true
            }
          );
          break;
          
        case 'Accessories':
          subcategories.push(
            {
              name: 'Bottles',
              slug: 'bottles',
              description: 'Premium soda bottles',
              category: category._id,
              isActive: true
            },
            {
              name: 'CO2 Cylinders',
              slug: 'co2-cylinders',
              description: 'Carbon dioxide cylinders',
              category: category._id,
              isActive: true
            },
            {
              name: 'Tools',
              slug: 'tools',
              description: 'Soda making tools and equipment',
              category: category._id,
              isActive: true
            }
          );
          break;
          
        case 'Starter Kits':
          subcategories.push(
            {
              name: 'Basic Kits',
              slug: 'basic-kits',
              description: 'Essential starter packages',
              category: category._id,
              isActive: true
            },
            {
              name: 'Premium Kits',
              slug: 'premium-kits',
              description: 'Advanced starter packages',
              category: category._id,
              isActive: true
            }
          );
          break;
      }
    }
    
    if (subcategories.length > 0) {
      const createdSubcategories = await Subcategory.insertMany(subcategories);
      console.log(`Created ${createdSubcategories.length} new subcategories`);
      
      // Update categories with subcategories
      for (const category of createdCategories) {
        const categorySubcategories = createdSubcategories.filter(
          sub => sub.category.toString() === category._id.toString()
        );
        
        await Category.findByIdAndUpdate(category._id, {
          subcategories: categorySubcategories.map(sub => sub._id)
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Default categories created successfully${subcategories.length > 0 ? ' with subcategories' : ''}`,
      categories: createdCategories.length,
      subcategories: subcategories.length
    });
    
  } catch (error) {
    console.error('Error creating default categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create default categories',
      error: error.message
    });
  }
});

// Image upload endpoint
router.post('/upload-image', authMiddleware, adminMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('File uploaded to Cloudinary:', req.file);
    console.log('Cloudinary URL:', req.file.path);
    console.log('Public ID:', req.file.filename);

    // Cloudinary returns the full URL in req.file.path
    const imageUrl = req.file.path;
    const publicId = req.file.filename; // This is the public ID for deletion
    
    console.log('Image URL for frontend:', imageUrl);
    console.log('Public ID for deletion:', publicId);
    
    res.json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary',
      imageUrl: imageUrl,
      publicId: publicId,
      filename: req.file.originalname // Keep original filename for reference
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image to Cloudinary',
      error: error.message
    });
  }
});

// Delete image endpoint
router.delete('/delete-image/:publicId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const publicId = req.params.publicId;
    
    // Delete image from Cloudinary
    const result = await deleteImage(publicId);
    
    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully from Cloudinary'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete image from Cloudinary'
      });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image from Cloudinary',
      error: error.message
    });
  }
});

module.exports = router;
