const { createErrorResponse, logError } = require('../Utils/error-handler');
const Product = require('../Models/product-model');
const Category = require('../Models/category-model');
const Order = require('../Models/order-model');

// Admin Product Management Controller
class AdminProductController {
  // Get all products with advanced filtering
  getAllProducts = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        category = '', 
        status = '',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = {};
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      if (category) {
        filter.category = category;
      }

      if (status) {
        filter.status = status;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get products with pagination
      const products = await Product.find(filter)
        .populate('category', 'name')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const totalProducts = await Product.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / parseInt(limit));

      res.json({
        success: true,
        products: products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalProducts: totalProducts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      });
    } catch (error) {
      logError(error, 'getAllProducts');
      res.status(500).json(createErrorResponse(
        'Failed to get products',
        error.message
      ));
    }
  };

  // Get product by ID
  getProductById = async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findById(id)
        .populate('category', 'name')
        .populate('relatedProducts', 'name price image');
      
      if (!product) {
        return res.status(404).json(createErrorResponse(
          'Product not found',
          'Product with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        product: product
      });
    } catch (error) {
      logError(error, 'getProductById');
      res.status(500).json(createErrorResponse(
        'Failed to get product',
        error.message
      ));
    }
  };

  // Create new product
  createProduct = async (req, res) => {
    try {
      const productData = req.body;

      // Validate required fields
      if (!productData.name || !productData.price || !productData.category) {
        return res.status(400).json(createErrorResponse(
          'Missing required fields',
          'Name, price, and category are required'
        ));
      }

      // Check if product with same SKU already exists
      if (productData.sku) {
        const existingProduct = await Product.findOne({ sku: productData.sku });
        if (existingProduct) {
          return res.status(400).json(createErrorResponse(
            'SKU already exists',
            'A product with this SKU already exists'
          ));
        }
      }

      // Create product
      const product = new Product(productData);
      await product.save();

      // Populate category
      await product.populate('category', 'name');

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: product
      });
    } catch (error) {
      logError(error, 'createProduct');
      res.status(500).json(createErrorResponse(
        'Failed to create product',
        error.message
      ));
    }
  };

  // Update product
  updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates._id;
      delete updates.createdAt;

      // Check SKU uniqueness if being updated
      if (updates.sku) {
        const existingProduct = await Product.findOne({ 
          sku: updates.sku, 
          _id: { $ne: id } 
        });
        if (existingProduct) {
          return res.status(400).json(createErrorResponse(
            'SKU already exists',
            'A product with this SKU already exists'
          ));
        }
      }

      const product = await Product.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('category', 'name');

      if (!product) {
        return res.status(404).json(createErrorResponse(
          'Product not found',
          'Product with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        product: product
      });
    } catch (error) {
      logError(error, 'updateProduct');
      res.status(500).json(createErrorResponse(
        'Failed to update product',
        error.message
      ));
    }
  };

  // Delete product
  deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;

      // Check if product is used in any orders
      const ordersWithProduct = await Order.countDocuments({
        'items.product': id
      });

      if (ordersWithProduct > 0) {
        return res.status(400).json(createErrorResponse(
          'Cannot delete product',
          'Product is used in existing orders. Consider archiving instead.'
        ));
      }

      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json(createErrorResponse(
          'Product not found',
          'Product with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      logError(error, 'deleteProduct');
      res.status(500).json(createErrorResponse(
        'Failed to delete product',
        error.message
      ));
    }
  };

  // Bulk update products
  bulkUpdateProducts = async (req, res) => {
    try {
      const { productIds, updates } = req.body;

      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json(createErrorResponse(
          'Invalid request',
          'Product IDs array is required'
        ));
      }

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json(createErrorResponse(
          'Invalid request',
          'Updates object is required'
        ));
      }

      // Remove fields that shouldn't be updated
      delete updates._id;
      delete updates.createdAt;

      const result = await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: updates }
      );

      res.json({
        success: true,
        message: `${result.modifiedCount} products updated successfully`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      logError(error, 'bulkUpdateProducts');
      res.status(500).json(createErrorResponse(
        'Failed to bulk update products',
        error.message
      ));
    }
  };

  // Get product statistics
  getProductStats = async (req, res) => {
    try {
      const stats = {
        totalProducts: await Product.countDocuments(),
        activeProducts: await Product.countDocuments({ status: 'active' }),
        inactiveProducts: await Product.countDocuments({ status: 'inactive' }),
        outOfStock: await Product.countDocuments({ stock: 0 }),
        lowStock: await Product.countDocuments({ 
          stock: { $gt: 0, $lte: 10 } 
        }),
        categories: await Product.distinct('category').length,
        newProductsToday: await Product.countDocuments({
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }),
        newProductsThisWeek: await Product.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        newProductsThisMonth: await Product.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
      };

      res.json({
        success: true,
        stats: stats
      });
    } catch (error) {
      logError(error, 'getProductStats');
      res.status(500).json(createErrorResponse(
        'Failed to get product statistics',
        error.message
      ));
    }
  };

  // Get low stock products
  getLowStockProducts = async (req, res) => {
    try {
      const { threshold = 10 } = req.query;

      const products = await Product.find({
        stock: { $gt: 0, $lte: parseInt(threshold) }
      })
      .populate('category', 'name')
      .sort({ stock: 1 });

      res.json({
        success: true,
        products: products,
        count: products.length
      });
    } catch (error) {
      logError(error, 'getLowStockProducts');
      res.status(500).json(createErrorResponse(
        'Failed to get low stock products',
        error.message
      ));
    }
  };

  // Update product stock
  updateProductStock = async (req, res) => {
    try {
      const { id } = req.params;
      const { stock, operation = 'set' } = req.body;

      if (typeof stock !== 'number' || stock < 0) {
        return res.status(400).json(createErrorResponse(
          'Invalid stock value',
          'Stock must be a non-negative number'
        ));
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json(createErrorResponse(
          'Product not found',
          'Product with the specified ID does not exist'
        ));
      }

      let newStock;
      switch (operation) {
        case 'add':
          newStock = product.stock + stock;
          break;
        case 'subtract':
          newStock = Math.max(0, product.stock - stock);
          break;
        case 'set':
        default:
          newStock = stock;
          break;
      }

      product.stock = newStock;
      await product.save();

      res.json({
        success: true,
        message: 'Product stock updated successfully',
        product: {
          id: product._id,
          name: product.name,
          stock: product.stock
        }
      });
    } catch (error) {
      logError(error, 'updateProductStock');
      res.status(500).json(createErrorResponse(
        'Failed to update product stock',
        error.message
      ));
    }
  };

  // Get product analytics
  getProductAnalytics = async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get top selling products
      const topSellingProducts = await Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'shipped', 'processing'] },
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' }
      ]);

      // Get category performance
      const categoryPerformance = await Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'shipped', 'processing'] },
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.category',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            productCount: { $addToSet: '$items.product' }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $project: {
            category: '$category.name',
            totalQuantity: 1,
            totalRevenue: 1,
            uniqueProducts: { $size: '$productCount' }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]);

      res.json({
        success: true,
        analytics: {
          topSellingProducts: topSellingProducts,
          categoryPerformance: categoryPerformance
        }
      });
    } catch (error) {
      logError(error, 'getProductAnalytics');
      res.status(500).json(createErrorResponse(
        'Failed to get product analytics',
        error.message
      ));
    }
  };
}

module.exports = new AdminProductController();

