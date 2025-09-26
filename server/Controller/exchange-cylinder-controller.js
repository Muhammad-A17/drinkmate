const ExchangeCylinder = require('../Models/exchange-cylinder-model');

// Exchange Cylinder Management Controller
// Updated on September 26, 2025 - Adding documentation
const exchangeCylinderController = {
  // ===== EXCHANGE CYLINDER MANAGEMENT =====
  
  // Get all exchange cylinders with filtering and pagination
  getAllExchangeCylinders: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        brand, 
        exchangeType, 
        serviceLevel,
        status, 
        minPrice, 
        maxPrice,
        serviceArea,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (brand) filter.brand = brand;
      if (exchangeType) filter.exchangeType = exchangeType;
      if (serviceLevel) filter.serviceLevel = serviceLevel;
      if (status) filter.status = status;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }
      if (serviceArea) {
        filter.$or = [
          { serviceAreas: { $size: 0 } }, // Available everywhere
          { serviceAreas: serviceArea } // Available in specific area
        ];
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const cylinders = await ExchangeCylinder.find(filter)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await ExchangeCylinder.countDocuments(filter);

      res.json({
        success: true,
        cylinders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get exchange cylinder by ID
  getExchangeCylinderById: async (req, res) => {
    try {
      const cylinder = await ExchangeCylinder.findById(req.params.id);
      if (!cylinder) {
        return res.status(404).json({ 
          success: false,
          message: 'Exchange cylinder not found' 
        });
      }
      res.json({
        success: true,
        cylinder
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get exchange cylinder by slug
  getExchangeCylinderBySlug: async (req, res) => {
    try {
      const cylinder = await ExchangeCylinder.findOne({ slug: req.params.slug });
      if (!cylinder) {
        return res.status(404).json({ 
          success: false,
          message: 'Exchange cylinder not found' 
        });
      }
      res.json({
        success: true,
        cylinder
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Create new exchange cylinder
  createExchangeCylinder: async (req, res) => {
    try {
      console.log('Request body received:', JSON.stringify(req.body, null, 2));
      console.log('User from auth middleware:', req.user);
      
      // Additional validation checks
      if (!req.body.name) {
        console.error('Validation error: name is required');
        return res.status(400).json({
          success: false,
          message: 'Validation error: name is required'
        });
      }
      
      if (!req.body.price || typeof req.body.price !== 'number') {
        console.error('Validation error: price must be a number');
        return res.status(400).json({
          success: false,
          message: 'Validation error: price must be a number'
        });
      }
      
      // Log auth status
      console.log('Admin check:', req.user ? (req.user.isAdmin ? 'Is Admin' : 'Not Admin') : 'No User');
      
      const cylinder = new ExchangeCylinder(req.body);
      
      // Validate the model before saving
      const validationError = cylinder.validateSync();
      if (validationError) {
        console.error('Validation error:', validationError);
        return res.status(400).json({ 
          success: false,
          message: 'Validation error',
          errors: validationError.errors
        });
      }
      
      const savedCylinder = await cylinder.save();
      console.log('Successfully saved cylinder:', savedCylinder._id);
      
      res.status(201).json({
        success: true,
        cylinder: savedCylinder
      });
    } catch (error) {
      console.error('Error creating cylinder:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Update exchange cylinder
  updateExchangeCylinder: async (req, res) => {
    try {
      const cylinder = await ExchangeCylinder.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!cylinder) {
        return res.status(404).json({ 
          success: false,
          message: 'Exchange cylinder not found' 
        });
      }
      
      res.json({
        success: true,
        cylinder
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Delete exchange cylinder
  deleteExchangeCylinder: async (req, res) => {
    try {
      const cylinder = await ExchangeCylinder.findByIdAndDelete(req.params.id);
      
      if (!cylinder) {
        return res.status(404).json({ 
          success: false,
          message: 'Exchange cylinder not found' 
        });
      }
      
      res.json({
        success: true,
        message: 'Exchange cylinder deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get exchange cylinders by type
  getByExchangeType: async (req, res) => {
    try {
      const { type } = req.params;
      const cylinders = await ExchangeCylinder.getByExchangeType(type);
      
      res.json({
        success: true,
        cylinders
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get exchange cylinders by service level
  getByServiceLevel: async (req, res) => {
    try {
      const { level } = req.params;
      const cylinders = await ExchangeCylinder.getByServiceLevel(level);
      
      res.json({
        success: true,
        cylinders
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get exchange cylinders available in area
  getAvailableInArea: async (req, res) => {
    try {
      const { area } = req.params;
      const cylinders = await ExchangeCylinder.getAvailableInArea(area);
      
      res.json({
        success: true,
        cylinders
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get best sellers
  getBestSellers: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const cylinders = await ExchangeCylinder.getBestSellers(parseInt(limit));
      
      res.json({
        success: true,
        cylinders
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get featured exchange cylinders
  getFeatured: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const cylinders = await ExchangeCylinder.getFeatured(parseInt(limit));
      
      res.json({
        success: true,
        cylinders
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Record exchange transaction
  recordExchange: async (req, res) => {
    try {
      const { cylinderId } = req.params;
      const cylinder = await ExchangeCylinder.findById(cylinderId);
      
      if (!cylinder) {
        return res.status(404).json({ 
          success: false,
          message: 'Exchange cylinder not found' 
        });
      }
      
      await cylinder.recordExchange();
      
      res.json({
        success: true,
        message: 'Exchange recorded successfully',
        totalExchanges: cylinder.totalExchanges
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Update stock
  updateStock: async (req, res) => {
    try {
      const { cylinderId } = req.params;
      const { quantity, operation = 'decrease' } = req.body;
      
      const cylinder = await ExchangeCylinder.findById(cylinderId);
      
      if (!cylinder) {
        return res.status(404).json({ 
          success: false,
          message: 'Exchange cylinder not found' 
        });
      }
      
      await cylinder.updateStock(quantity, operation);
      
      res.json({
        success: true,
        message: 'Stock updated successfully',
        newStock: cylinder.stock
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Update rating
  updateRating: async (req, res) => {
    try {
      const { cylinderId } = req.params;
      const { rating } = req.body;
      
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          success: false,
          message: 'Rating must be between 1 and 5' 
        });
      }
      
      const cylinder = await ExchangeCylinder.findById(cylinderId);
      
      if (!cylinder) {
        return res.status(404).json({ 
          success: false,
          message: 'Exchange cylinder not found' 
        });
      }
      
      await cylinder.updateRating(rating);
      
      res.json({
        success: true,
        message: 'Rating updated successfully',
        averageRating: cylinder.averageRating,
        totalReviews: cylinder.totalReviews
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get service statistics
  getServiceStats: async (req, res) => {
    try {
      const stats = await ExchangeCylinder.aggregate([
        {
          $group: {
            _id: null,
            totalCylinders: { $sum: 1 },
            totalExchanges: { $sum: '$totalExchanges' },
            averageRating: { $avg: '$averageRating' },
            totalStock: { $sum: '$stock' },
            lowStockCount: {
              $sum: {
                $cond: [
                  { $lte: ['$stock', '$minStock'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const typeStats = await ExchangeCylinder.aggregate([
        {
          $group: {
            _id: '$exchangeType',
            count: { $sum: 1 },
            totalExchanges: { $sum: '$totalExchanges' }
          }
        }
      ]);

      res.json({
        success: true,
        stats: stats[0] || {},
        typeStats
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
};

module.exports = exchangeCylinderController;
