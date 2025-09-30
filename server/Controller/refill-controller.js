const RefillOrder = require('../Models/refill-order-model');
const User = require('../Models/user-model');
const CO2Cylinder = require('../Models/co2-model');
const { sendEmail } = require('../Utils/email-service');

const refillController = {
  // ===== REFILL ORDER MANAGEMENT =====
  
  // Create new refill order
  createRefillOrder: async (req, res) => {
    try {
      const { 
        userId, 
        cylinderType, 
        quantity, 
        pickupAddress, 
        deliveryAddress, 
        specialInstructions,
        preferredPickupDate,
        preferredDeliveryDate
      } = req.body;

      // Validate required fields
      if (!userId || !cylinderType || !quantity || !pickupAddress || !deliveryAddress) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
      }

      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Calculate pricing based on quantity and cylinder type
      const basePrice = getCylinderBasePrice(cylinderType);
      const quantityDiscount = getQuantityDiscount(quantity);
      const deliveryCharge = quantity >= 4 ? 0 : 35.00;
      
      const subtotal = basePrice * quantity * (1 - quantityDiscount);
      const total = subtotal + deliveryCharge;

      // Create refill order
      const refillOrder = new RefillOrder({
        userId,
        userEmail: user.email,
        userName: user.username,
        cylinderType,
        quantity,
        pickupAddress,
        deliveryAddress,
        specialInstructions,
        preferredPickupDate,
        preferredDeliveryDate,
        pricing: {
          basePrice,
          quantityDiscount,
          deliveryCharge,
          subtotal,
          total
        },
        status: 'pending',
        orderNumber: generateOrderNumber()
      });

      const savedOrder = await refillOrder.save();

      // Send confirmation email
      try {
        await sendRefillOrderConfirmation(user.email, user.username, savedOrder);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      res.status(201).json({
        success: true,
        message: 'Refill order created successfully',
        order: savedOrder
      });

    } catch (error) {
      console.error('Error creating refill order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create refill order',
        error: error.message 
      });
    }
  },

  // Get user's refill orders
  getUserRefillOrders: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const filter = { userId };
      if (status && status !== 'all') {
        filter.status = status;
      }

      const orders = await RefillOrder.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await RefillOrder.countDocuments(filter);

      res.json({
        success: true,
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });

    } catch (error) {
      console.error('Error fetching user refill orders:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch refill orders',
        error: error.message 
      });
    }
  },

  // Get all refill orders (admin)
  getAllRefillOrders: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        cylinderType, 
        dateFrom, 
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (status && status !== 'all') filter.status = status;
      if (cylinderType && cylinderType !== 'all') filter.cylinderType = cylinderType;
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const orders = await RefillOrder.find(filter)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('userId', 'username email')
        .exec();

      const total = await RefillOrder.countDocuments(filter);

      res.json({
        success: true,
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });

    } catch (error) {
      console.error('Error fetching all refill orders:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch refill orders',
        error: error.message 
      });
    }
  },

  // ===== REFILL CYLINDER MANAGEMENT =====
  
  // Get all refill cylinders (filtered from CO2 cylinders)
  getAllRefillCylinders: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        brand, 
        status, 
        minPrice, 
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = { type: 'refill' }; // Only refill type cylinders
      if (brand) filter.brand = brand;
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
        success: true,
        cylinders,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } catch (error) {
      console.error('Error fetching refill cylinders:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch refill cylinders',
        error: error.message 
      });
    }
  },

  // Get refill cylinder by ID
  getRefillCylinderById: async (req, res) => {
    try {
      const cylinder = await CO2Cylinder.findOne({ 
        _id: req.params.id, 
        type: 'refill' 
      });
      
      if (!cylinder) {
        return res.status(404).json({ 
          success: false,
          message: 'Refill cylinder not found' 
        });
      }
      
      res.json({
        success: true,
        cylinder
      });
    } catch (error) {
      console.error('Error fetching refill cylinder:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch refill cylinder',
        error: error.message 
      });
    }
  },

  // Create new refill cylinder (admin only)
  createRefillCylinder: async (req, res) => {
    try {
      const cylinderData = {
        ...req.body,
        type: 'refill' // Ensure it's a refill type
      };

      const cylinder = new CO2Cylinder(cylinderData);
      const savedCylinder = await cylinder.save();

      res.status(201).json({
        success: true,
        message: 'Refill cylinder created successfully',
        cylinder: savedCylinder
      });
    } catch (error) {
      console.error('Error creating refill cylinder:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create refill cylinder',
        error: error.message 
      });
    }
  },

  // Update refill cylinder (admin only)
  updateRefillCylinder: async (req, res) => {
    try {
      const cylinder = await CO2Cylinder.findOneAndUpdate(
        { _id: req.params.id, type: 'refill' },
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!cylinder) {
        return res.status(404).json({ 
          success: false,
          message: 'Refill cylinder not found' 
        });
      }

      res.json({
        success: true,
        message: 'Refill cylinder updated successfully',
        cylinder
      });
    } catch (error) {
      console.error('Error updating refill cylinder:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update refill cylinder',
        error: error.message 
      });
    }
  },

  // Delete refill cylinder (admin only)
  deleteRefillCylinder: async (req, res) => {
    try {
      const cylinder = await CO2Cylinder.findOneAndDelete({ 
        _id: req.params.id, 
        type: 'refill' 
      });

      if (!cylinder) {
        return res.status(404).json({ 
          success: false,
          message: 'Refill cylinder not found' 
        });
      }

      res.json({
        success: true,
        message: 'Refill cylinder deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting refill cylinder:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete refill cylinder',
        error: error.message 
      });
    }
  },

  // Get refill order by ID
  getRefillOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await RefillOrder.findById(id).populate('userId', 'username email');
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Refill order not found' 
        });
      }

      res.json({
        success: true,
        order
      });

    } catch (error) {
      console.error('Error fetching refill order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch refill order',
        error: error.message 
      });
    }
  },

  // Update refill order status
  updateRefillOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes, scheduledDate } = req.body;

      const order = await RefillOrder.findById(id);
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Refill order not found' 
        });
      }

      // Update status and add to history
      const statusUpdate = {
        status,
        adminNotes,
        updatedAt: new Date()
      };

      if (scheduledDate) {
        statusUpdate.scheduledDate = scheduledDate;
      }

      order.statusHistory.push(statusUpdate);
      order.status = status;
      order.adminNotes = adminNotes;
      order.updatedAt = new Date();

      // Update specific fields based on status
      switch (status) {
        case 'pickup_scheduled':
          order.pickupScheduledDate = scheduledDate;
          break;
        case 'pickup_completed':
          order.pickupCompletedDate = new Date();
          break;
        case 'refilling':
          order.refillStartDate = new Date();
          break;
        case 'refill_completed':
          order.refillCompletedDate = new Date();
          break;
        case 'delivery_scheduled':
          order.deliveryScheduledDate = scheduledDate;
          break;
        case 'delivered':
          order.deliveryCompletedDate = new Date();
          break;
        case 'cancelled':
          order.cancelledDate = new Date();
          order.cancellationReason = adminNotes;
          break;
      }

      const updatedOrder = await order.save();

      // Send status update email to customer
      try {
        await sendRefillStatusUpdate(order.userEmail, order.userName, order);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }

      res.json({
        success: true,
        message: 'Refill order status updated successfully',
        order: updatedOrder
      });

    } catch (error) {
      console.error('Error updating refill order status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update refill order status',
        error: error.message 
      });
    }
  },

  // Schedule pickup
  schedulePickup: async (req, res) => {
    try {
      const { id } = req.params;
      const { pickupDate, pickupTime, pickupNotes, driverName, driverPhone } = req.body;

      const order = await RefillOrder.findById(id);
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Refill order not found' 
        });
      }

      order.pickupScheduledDate = new Date(`${pickupDate}T${pickupTime}`);
      order.pickupNotes = pickupNotes;
      order.driverName = driverName;
      order.driverPhone = driverPhone;
      order.status = 'pickup_scheduled';
      order.statusHistory.push({
        status: 'pickup_scheduled',
        adminNotes: `Pickup scheduled for ${pickupDate} at ${pickupTime}`,
        updatedAt: new Date()
      });

      const updatedOrder = await order.save();

      // Send pickup confirmation email
      try {
        await sendPickupConfirmation(order.userEmail, order.userName, updatedOrder);
      } catch (emailError) {
        console.error('Failed to send pickup confirmation email:', emailError);
      }

      res.json({
        success: true,
        message: 'Pickup scheduled successfully',
        order: updatedOrder
      });

    } catch (error) {
      console.error('Error scheduling pickup:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to schedule pickup',
        error: error.message 
      });
    }
  },

  // Schedule delivery
  scheduleDelivery: async (req, res) => {
    try {
      const { id } = req.params;
      const { deliveryDate, deliveryTime, deliveryNotes, driverName, driverPhone } = req.body;

      const order = await RefillOrder.findById(id);
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Refill order not found' 
        });
      }

      order.deliveryScheduledDate = new Date(`${deliveryDate}T${deliveryTime}`);
      order.deliveryNotes = deliveryNotes;
      order.deliveryDriverName = driverName;
      order.deliveryDriverPhone = driverPhone;
      order.status = 'delivery_scheduled';
      order.statusHistory.push({
        status: 'delivery_scheduled',
        adminNotes: `Delivery scheduled for ${deliveryDate} at ${deliveryTime}`,
        updatedAt: new Date()
      });

      const updatedOrder = await order.save();

      // Send delivery confirmation email
      try {
        await sendDeliveryConfirmation(order.userEmail, order.userName, updatedOrder);
      } catch (emailError) {
        console.error('Failed to send delivery confirmation email:', emailError);
      }

      res.json({
        success: true,
        message: 'Delivery scheduled successfully',
        order: updatedOrder
      });

    } catch (error) {
      console.error('Error scheduling delivery:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to schedule delivery',
        error: error.message 
      });
    }
  },

  // Get refill dashboard stats
  getRefillDashboardStats: async (req, res) => {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      // Get counts by status
      const statusCounts = await RefillOrder.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get monthly orders
      const monthlyOrders = await RefillOrder.countDocuments({
        createdAt: { $gte: startOfMonth }
      });

      // Get yearly orders
      const yearlyOrders = await RefillOrder.countDocuments({
        createdAt: { $gte: startOfYear }
      });

      // Get today's orders
      const todayOrders = await RefillOrder.countDocuments({
        createdAt: { 
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(today.setHours(23, 59, 59, 999))
        }
      });

      // Get revenue stats
      const revenueStats = await RefillOrder.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'refill_completed'] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.total' },
            avgOrderValue: { $avg: '$pricing.total' }
          }
        }
      ]);

      // Get cylinder type distribution
      const cylinderTypeStats = await RefillOrder.aggregate([
        {
          $group: {
            _id: '$cylinderType',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]);

      const stats = {
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        monthlyOrders,
        yearlyOrders,
        todayOrders,
        revenueStats: revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0 },
        cylinderTypeStats
      };

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Error fetching refill dashboard stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch dashboard stats',
        error: error.message 
      });
    }
  },

  // Cancel refill order
  cancelRefillOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { cancellationReason } = req.body;

      const order = await RefillOrder.findById(id);
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Refill order not found' 
        });
      }

      // Check if order can be cancelled
      if (['delivered', 'cancelled'].includes(order.status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Order cannot be cancelled in current status' 
        });
      }

      order.status = 'cancelled';
      order.cancellationReason = cancellationReason;
      order.cancelledDate = new Date();
      order.statusHistory.push({
        status: 'cancelled',
        adminNotes: cancellationReason,
        updatedAt: new Date()
      });

      const updatedOrder = await order.save();

      // Send cancellation email
      try {
        await sendRefillCancellation(order.userEmail, order.userName, updatedOrder);
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }

      res.json({
        success: true,
        message: 'Refill order cancelled successfully',
        order: updatedOrder
      });

    } catch (error) {
      console.error('Error cancelling refill order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to cancel refill order',
        error: error.message 
      });
    }
  }
};

// Helper functions
function getCylinderBasePrice(cylinderType) {
  const prices = {
    'drinkmate': 65.00,
    'other-to-drinkmate': 75.00,
    'sodastream': 70.00,
    'errva': 68.00,
    'fawwar': 72.00,
    'phillips': 70.00,
    'ultima-cosa': 68.00,
    'bubble-bro': 65.00,
    'yoco-cosa': 70.00
  };
  return prices[cylinderType] || 65.00;
}

function getQuantityDiscount(quantity) {
  if (quantity >= 4) return 0.15; // 15% off
  if (quantity >= 3) return 0.10; // 10% off
  if (quantity >= 2) return 0.05; // 5% off
  return 0;
}

function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `REF-${timestamp.slice(-6)}-${random}`;
}

// Email functions
async function sendRefillOrderConfirmation(email, userName, order) {
  // Implementation for refill order confirmation email
  console.log(`Sending refill order confirmation to ${email}`);
}

async function sendRefillStatusUpdate(email, userName, order) {
  // Implementation for status update email
  console.log(`Sending status update to ${email}`);
}

async function sendPickupConfirmation(email, userName, order) {
  // Implementation for pickup confirmation email
  console.log(`Sending pickup confirmation to ${email}`);
}

async function sendDeliveryConfirmation(email, userName, order) {
  // Implementation for delivery confirmation email
  console.log(`Sending delivery confirmation to ${email}`);
}

async function sendRefillCancellation(email, userName, order) {
  // Implementation for cancellation email
  console.log(`Sending cancellation email to ${email}`);
}

module.exports = refillController;
