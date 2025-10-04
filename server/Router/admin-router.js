const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../Middleware/auth-middleware');
const adminMiddleware = require('../Middleware/admin-middleware');
const { requireAdmin, requirePermission, auditLog } = require('../Middleware/authorization-middleware');
const { getAllUsers, deleteUser } = require('../Controller/admin-controller');
const categoryController = require('../Controller/category-controller');
const orderController = require('../Controller/order-controller');
const statsController = require('../Controller/stats-controller');
const { storage, deleteImage } = require('../Utils/cloudinary');
const User = require('../Models/user-model');

// Configure multer with Cloudinary storage - Optimized for speed
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for faster uploads
    files: 1, // Single file upload
    fieldSize: 1024 * 1024 // 1MB field size limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      // Additional validation for supported formats
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed!'), false);
      }
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create admin user endpoint (for testing) - REMOVED FOR SECURITY
// This endpoint was removed as it creates admin users without proper authorization
// Use the auth-controller createAdminUser endpoint instead with proper secret validation

// Protected routes (auth + admin)
router.get('/users', authMiddleware, requirePermission('users.read'), auditLog('users.read', 'users'), getAllUsers);
router.delete('/users/:id', authMiddleware, requirePermission('users.delete'), auditLog('users.delete', 'user'), deleteUser);

// Debug endpoint to check user permissions
router.get('/debug/user', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      isAdmin: req.user.isAdmin,
      fullName: req.user.fullName,
      name: req.user.name
    }
  });
});

// Stats routes
router.get('/stats', authMiddleware, requirePermission('analytics.read'), auditLog('analytics.read', 'stats'), statsController.getAdminStats);
router.get('/recent-data', authMiddleware, requirePermission('analytics.read'), auditLog('analytics.read', 'recent-data'), statsController.getRecentData);

// Orders routes
router.get('/orders', authMiddleware, requirePermission('orders.read'), auditLog('orders.read', 'orders'), orderController.getAllOrders);

// Product management routes
router.get('/products', authMiddleware, requirePermission('products.read'), auditLog('products.read', 'products'), require('../Controller/product-controller').getAdminProducts);
router.get('/products/:id', authMiddleware, requirePermission('products.read'), require('../Controller/product-controller').getProduct);
router.post('/products', authMiddleware, requirePermission('products.create'), auditLog('products.create', 'product'), require('../Controller/product-controller').createProduct);
router.put('/products/:id', authMiddleware, requirePermission('products.update'), auditLog('products.update', 'product'), require('../Controller/product-controller').updateProduct);
router.delete('/products/:id', authMiddleware, requirePermission('products.delete'), auditLog('products.delete', 'product'), require('../Controller/product-controller').deleteProduct);

// Bundle management routes
router.get('/bundles', authMiddleware, requirePermission('products.read'), require('../Controller/product-controller').getBundles);
router.get('/bundles/:id', authMiddleware, requirePermission('products.read'), require('../Controller/product-controller').getBundle);
router.post('/bundles', authMiddleware, requirePermission('products.create'), auditLog('products.create', 'bundle'), require('../Controller/product-controller').createBundle);
router.put('/bundles/:id', authMiddleware, requirePermission('products.update'), auditLog('products.update', 'bundle'), require('../Controller/product-controller').updateBundle);
router.delete('/bundles/:id', authMiddleware, requirePermission('products.delete'), auditLog('products.delete', 'bundle'), require('../Controller/product-controller').deleteBundle);

// Review management routes
router.get('/reviews', authMiddleware, requirePermission('products.read'), require('../Controller/product-controller').getAllReviews);
router.put('/reviews/:id/status', authMiddleware, requirePermission('products.update'), auditLog('products.update', 'review'), require('../Controller/product-controller').updateReviewStatus);

// Category management routes
router.get('/categories', authMiddleware, requirePermission('categories.read'), categoryController.getAdminCategories);
router.get('/subcategories', authMiddleware, requirePermission('categories.read'), categoryController.getAdminSubcategories);
router.post('/categories', authMiddleware, requirePermission('categories.create'), auditLog('categories.create', 'category'), categoryController.createCategory);
router.post('/subcategories', authMiddleware, requirePermission('categories.create'), auditLog('categories.create', 'subcategory'), categoryController.createSubcategory);
router.put('/categories/:id', authMiddleware, requirePermission('categories.update'), auditLog('categories.update', 'category'), categoryController.updateCategory);
router.put('/subcategories/:id', authMiddleware, requirePermission('categories.update'), auditLog('categories.update', 'subcategory'), categoryController.updateSubcategory);
router.delete('/categories/:id', authMiddleware, requirePermission('categories.delete'), auditLog('categories.delete', 'category'), categoryController.deleteCategory);
router.delete('/subcategories/:id', authMiddleware, requirePermission('categories.delete'), auditLog('categories.delete', 'subcategory'), categoryController.deleteSubcategory);
router.patch('/categories/:id/toggle', authMiddleware, requirePermission('categories.update'), auditLog('categories.update', 'category'), categoryController.toggleCategoryStatus);
router.patch('/subcategories/:id/toggle', authMiddleware, requirePermission('categories.update'), auditLog('categories.update', 'subcategory'), categoryController.toggleSubcategoryStatus);

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

// Admin user creation endpoint - requires super admin privileges
router.post('/create-admin', authMiddleware, requirePermission('admin.create'), auditLog('admin.create', 'admin_user'), async (req, res) => {
  try {
    
    const User = require('../Models/user-model');
    const { email, password, firstName, lastName } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
    }
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create admin user
    const adminUser = new User({
      username: email.split('@')[0], // Use email prefix as username
      email,
      password,
      firstName,
      lastName,
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
        username: adminUser.username,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        isAdmin: adminUser.isAdmin
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
    // Set a timeout for this specific request
    req.setTimeout(60000); // 60 seconds timeout for upload
    
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
    
    // Handle specific error types
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
        error: 'FILE_TOO_LARGE'
      });
    }
    
    if (error.message && error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        message: 'Upload timeout. Please try again.',
        error: 'UPLOAD_TIMEOUT'
      });
    }
    
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
    console.log('Delete image request - Raw publicId:', publicId);
    console.log('Delete image request - Decoded publicId:', decodeURIComponent(publicId));
    
    // Delete image from Cloudinary (use decoded publicId)
    const decodedPublicId = decodeURIComponent(publicId);
    console.log('Using decoded publicId for Cloudinary:', decodedPublicId);
    const result = await deleteImage(decodedPublicId);
    
    console.log('Cloudinary delete result:', result);
    
    // Handle different Cloudinary response types
    if (result.result === 'ok' || result.result === 'not found') {
      // 'not found' is also considered success since the image is effectively deleted
      res.json({
        success: true,
        message: result.result === 'not found' 
          ? 'Image was already deleted or not found' 
          : 'Image deleted successfully from Cloudinary'
      });
    } else {
      console.warn('Unexpected Cloudinary delete result:', result);
      res.status(400).json({
        success: false,
        message: 'Failed to delete image from Cloudinary',
        details: result
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

// Audit logs endpoint
router.post('/audit-logs', authMiddleware, requirePermission('analytics.read'), async (req, res) => {
  try {
    const auditLogger = require('../Services/audit-logger');
    const { page = 1, limit = 50, category, severity } = req.body;
    
    // Get audit logs
    const logs = await auditLogger.getAuditLogsByCategory(category || 'all', limit, (page - 1) * limit);
    
    res.json({
      success: true,
      logs: logs,
      totalPages: Math.ceil(logs.length / limit),
      currentPage: page,
      totalLogs: logs.length
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
});

// System health endpoint
router.get('/system-health', authMiddleware, requirePermission('analytics.read'), async (req, res) => {
  try {
    const User = require('../Models/user-model');
    const Order = require('../Models/order-model');
    const Product = require('../Models/product-model');
    
    // Check database connection
    const dbStatus = await checkDatabaseHealth();
    
    // Get basic stats
    const [userCount, orderCount, productCount] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments()
    ]);
    
    // Simulate system metrics (in production, these would come from actual monitoring)
    const health = {
      status: dbStatus.connected ? 'healthy' : 'critical',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus.connected ? 'up' : 'down',
          responseTime: dbStatus.responseTime || 0,
          lastCheck: new Date().toISOString(),
          error: dbStatus.error
        },
        api: {
          status: 'up',
          responseTime: Math.floor(Math.random() * 100) + 50,
          lastCheck: new Date().toISOString()
        },
        storage: {
          status: 'up',
          responseTime: Math.floor(Math.random() * 200) + 100,
          lastCheck: new Date().toISOString()
        },
        email: {
          status: 'up',
          responseTime: Math.floor(Math.random() * 300) + 200,
          lastCheck: new Date().toISOString()
        },
        payment: {
          status: 'up',
          responseTime: Math.floor(Math.random() * 150) + 100,
          lastCheck: new Date().toISOString()
        }
      },
      metrics: {
        cpuUsage: Math.floor(Math.random() * 30) + 20,
        memoryUsage: Math.floor(Math.random() * 40) + 40,
        diskUsage: Math.floor(Math.random() * 20) + 20,
        uptime: 99.9,
        responseTime: Math.floor(Math.random() * 100) + 50
      },
      stats: {
        totalUsers: userCount,
        totalOrders: orderCount,
        totalProducts: productCount,
        activeConnections: Math.floor(Math.random() * 50) + 10
      }
    };
    
    res.json({
      success: true,
      health: health
    });
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: error.message
    });
  }
});

// Helper function to check database health
async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    const responseTime = Date.now() - start;
    
    return {
      connected: isConnected,
      responseTime: responseTime,
      error: isConnected ? null : 'Database connection failed'
    };
  } catch (error) {
    return {
      connected: false,
      responseTime: 0,
      error: error.message
    };
  }
}

module.exports = router;
