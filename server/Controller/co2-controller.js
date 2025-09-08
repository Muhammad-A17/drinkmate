const CO2Cylinder = require('../Models/co2-model');
const CO2Order = require('../Models/co2-order-model');
const CO2Subscription = require('../Models/co2-subscription-model');
const User = require('../Models/user-model');

// CO2 Cylinder Management
const co2Controller = {
  // ===== CYLINDER MANAGEMENT =====
  
  // Get all cylinders with filtering and pagination
  getAllCylinders: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        brand, 
        type, 
        status, 
        minPrice, 
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (brand) filter.brand = brand;
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const cylinders = await CO2Cylinder.find(filter)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await CO2Cylinder.countDocuments(filter);

      res.json({
        cylinders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get cylinder by ID
  getCylinderById: async (req, res) => {
    try {
      const cylinder = await CO2Cylinder.findById(req.params.id);
      if (!cylinder) {
        return res.status(404).json({ message: 'Cylinder not found' });
      }
      res.json(cylinder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get cylinder by slug
  getCylinderBySlug: async (req, res) => {
    try {
      const cylinder = await CO2Cylinder.findBySlug(req.params.slug);
      if (!cylinder) {
        return res.status(404).json({ message: 'Cylinder not found' });
      }
      res.json(cylinder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new cylinder
  createCylinder: async (req, res) => {
    try {
      const cylinder = new CO2Cylinder(req.body);
      const savedCylinder = await cylinder.save();
      res.status(201).json(savedCylinder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update cylinder
  updateCylinder: async (req, res) => {
    try {
      const cylinder = await CO2Cylinder.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!cylinder) {
        return res.status(404).json({ message: 'Cylinder not found' });
      }
      res.json(cylinder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete cylinder
  deleteCylinder: async (req, res) => {
    try {
      const cylinder = await CO2Cylinder.findByIdAndDelete(req.params.id);
      if (!cylinder) {
        return res.status(404).json({ message: 'Cylinder not found' });
      }
      res.json({ message: 'Cylinder deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update cylinder stock
  updateStock: async (req, res) => {
    try {
      const { quantity, operation } = req.body;
      const cylinder = await CO2Cylinder.findById(req.params.id);
      
      if (!cylinder) {
        return res.status(404).json({ message: 'Cylinder not found' });
      }

      await cylinder.updateStock(quantity, operation);
      res.json(cylinder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // ===== ORDER MANAGEMENT =====

  // Get all orders with filtering and pagination
  getAllOrders: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        orderType, 
        userId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (orderType) filter.orderType = orderType;
      if (userId) filter.userId = userId;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const orders = await CO2Order.find(filter)
        .populate('userId', 'name email phone')
        .populate('cylinderType', 'name brand price')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await CO2Order.countDocuments(filter);

      res.json({
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get order by ID
  getOrderById: async (req, res) => {
    try {
      const order = await CO2Order.findById(req.params.id)
        .populate('userId', 'name email phone address')
        .populate('cylinderType', 'name brand price description');
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new order
  createOrder: async (req, res) => {
    try {
      const orderData = req.body;
      
      // Initialize cylinders array
      orderData.cylinders = Array.from({ length: orderData.quantity }, (_, index) => ({
        cylinderId: `CYL-${Date.now()}-${index + 1}`,
        status: 'pending'
      }));

      const order = new CO2Order(orderData);
      const savedOrder = await order.save();
      
      // Populate references for response
      await savedOrder.populate('userId cylinderType');
      
      res.status(201).json(savedOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { status, notes } = req.body;
      const order = await CO2Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (notes) {
        order.adminNotes = notes;
      }

      await order.updateStatus(status);
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Schedule pickup
  schedulePickup: async (req, res) => {
    try {
      const { pickupDate } = req.body;
      const order = await CO2Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      await order.schedulePickup(new Date(pickupDate));
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Schedule delivery
  scheduleDelivery: async (req, res) => {
    try {
      const { deliveryDate } = req.body;
      const order = await CO2Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      await order.scheduleDelivery(new Date(deliveryDate));
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update cylinder status in order
  updateCylinderStatus: async (req, res) => {
    try {
      const { cylinderId, status, notes } = req.body;
      const order = await CO2Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const cylinder = order.cylinders.find(c => c.cylinderId === cylinderId);
      if (!cylinder) {
        return res.status(404).json({ message: 'Cylinder not found in order' });
      }

      cylinder.status = status;
      if (notes) cylinder.notes = notes;

      // Update timestamps based on status
      if (status === 'picked_up') {
        cylinder.pickupDate = new Date();
      } else if (status === 'ready') {
        cylinder.refillDate = new Date();
      } else if (status === 'delivered') {
        cylinder.deliveryDate = new Date();
      }

      await order.save();
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // ===== SUBSCRIPTION MANAGEMENT =====

  // Get all subscriptions
  getAllSubscriptions: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        subscriptionType,
        userId,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (subscriptionType) filter.subscriptionType = subscriptionType;
      if (userId) filter.userId = userId;

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const subscriptions = await CO2Subscription.find(filter)
        .populate('userId', 'name email phone')
        .populate('cylinderType', 'name brand price')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await CO2Subscription.countDocuments(filter);

      res.json({
        subscriptions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get subscription by ID
  getSubscriptionById: async (req, res) => {
    try {
      const subscription = await CO2Subscription.findById(req.params.id)
        .populate('userId', 'name email phone address')
        .populate('cylinderType', 'name brand price description');
      
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new subscription
  createSubscription: async (req, res) => {
    try {
      const subscriptionData = req.body;
      
      // Calculate next refill date
      const startDate = new Date();
      const nextRefillDate = new Date(startDate);
      nextRefillDate.setMonth(nextRefillDate.getMonth() + subscriptionData.frequency);
      
      subscriptionData.startDate = startDate;
      subscriptionData.nextRefillDate = nextRefillDate;

      const subscription = new CO2Subscription(subscriptionData);
      const savedSubscription = await subscription.save();
      
      await savedSubscription.populate('userId cylinderType');
      
      res.status(201).json(savedSubscription);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update subscription status
  updateSubscriptionStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const subscription = await CO2Subscription.findById(req.params.id);
      
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }

      if (status === 'paused') {
        await subscription.pause();
      } else if (status === 'active') {
        await subscription.resume();
      } else if (status === 'cancelled') {
        await subscription.cancel();
      }

      res.json(subscription);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Process subscription refill
  processSubscriptionRefill: async (req, res) => {
    try {
      const { quantity, notes } = req.body;
      const subscription = await CO2Subscription.findById(req.params.id);
      
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }

      // Add refill to history
      await subscription.addRefillToHistory(quantity, 'scheduled', notes);
      
      // Schedule next refill
      await subscription.scheduleNextRefill();
      
      res.json(subscription);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // ===== ANALYTICS AND REPORTS =====

  // Get CO2 dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      const [
        totalCylinders,
        totalOrders,
        totalSubscriptions,
        pendingOrders,
        lowStockCylinders,
        monthlyRevenue,
        topSellingCylinders
      ] = await Promise.all([
        CO2Cylinder.countDocuments(),
        CO2Order.countDocuments(),
        CO2Subscription.countDocuments(),
        CO2Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
        CO2Cylinder.countDocuments({ stock: { $lte: '$minStock' } }),
        CO2Order.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
              status: { $in: ['delivered', 'completed'] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$total' }
            }
          }
        ]),
        CO2Order.aggregate([
          {
            $match: { status: { $in: ['delivered', 'completed'] } }
          },
          {
            $group: {
              _id: '$cylinderType',
              totalOrders: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' }
            }
          },
          {
            $sort: { totalQuantity: -1 }
          },
          {
            $limit: 5
          }
        ])
      ]);

      res.json({
        totalCylinders,
        totalOrders,
        totalSubscriptions,
        pendingOrders,
        lowStockCylinders,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        topSellingCylinders
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get orders by date range
  getOrdersByDateRange: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const filter = {};
      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const orders = await CO2Order.find(filter)
        .populate('userId', 'name email')
        .populate('cylinderType', 'name brand')
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = co2Controller;
