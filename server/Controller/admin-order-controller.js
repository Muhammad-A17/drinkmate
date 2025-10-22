const { createErrorResponse, logError } = require('../Utils/error-handler');
const Order = require('../Models/order-model');
const User = require('../Models/user-model');
const Product = require('../Models/product-model');

// Admin Order Management Controller
class AdminOrderController {
  // Get all orders with advanced filtering
  getAllOrders = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status = '', 
        paymentStatus = '',
        dateFrom = '',
        dateTo = '',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = {};
      
      if (search) {
        filter.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'customer.firstName': { $regex: search, $options: 'i' } },
          { 'customer.lastName': { $regex: search, $options: 'i' } },
          { 'customer.email': { $regex: search, $options: 'i' } },
          { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
          { 'shippingAddress.lastName': { $regex: search, $options: 'i' } }
        ];
      }

      if (status) {
        filter.status = status;
      }

      if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
      }

      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) {
          filter.createdAt.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          filter.createdAt.$lte = new Date(dateTo);
        }
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get orders with pagination
      const orders = await Order.find(filter)
        .populate('customer', 'firstName lastName email phone')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const totalOrders = await Order.countDocuments(filter);
      const totalPages = Math.ceil(totalOrders / parseInt(limit));

      res.json({
        success: true,
        orders: orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalOrders: totalOrders,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      });
    } catch (error) {
      logError(error, 'getAllOrders');
      res.status(500).json(createErrorResponse(
        'Failed to get orders',
        error.message
      ));
    }
  };

  // Get order by ID
  getOrderById = async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findById(id)
        .populate('customer', 'firstName lastName email phone')
        .populate('items.product', 'name price image');
      
      if (!order) {
        return res.status(404).json(createErrorResponse(
          'Order not found',
          'Order with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        order: order
      });
    } catch (error) {
      logError(error, 'getOrderById');
      res.status(500).json(createErrorResponse(
        'Failed to get order',
        error.message
      ));
    }
  };

  // Update order status
  updateOrderStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json(createErrorResponse(
          'Invalid status',
          'Status must be one of: ' + validStatuses.join(', ')
        ));
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { 
          status: status,
          $push: {
            statusHistory: {
              status: status,
              timestamp: new Date(),
              notes: notes || '',
              updatedBy: req.user.id
            }
          }
        },
        { new: true, runValidators: true }
      ).populate('customer', 'firstName lastName email phone');

      if (!order) {
        return res.status(404).json(createErrorResponse(
          'Order not found',
          'Order with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        order: order
      });
    } catch (error) {
      logError(error, 'updateOrderStatus');
      res.status(500).json(createErrorResponse(
        'Failed to update order status',
        error.message
      ));
    }
  };

  // Update payment status
  updatePaymentStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus, notes } = req.body;

      const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
      
      if (!validStatuses.includes(paymentStatus)) {
        return res.status(400).json(createErrorResponse(
          'Invalid payment status',
          'Payment status must be one of: ' + validStatuses.join(', ')
        ));
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { 
          paymentStatus: paymentStatus,
          $push: {
            paymentHistory: {
              status: paymentStatus,
              timestamp: new Date(),
              notes: notes || '',
              updatedBy: req.user.id
            }
          }
        },
        { new: true, runValidators: true }
      ).populate('customer', 'firstName lastName email phone');

      if (!order) {
        return res.status(404).json(createErrorResponse(
          'Order not found',
          'Order with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        message: 'Payment status updated successfully',
        order: order
      });
    } catch (error) {
      logError(error, 'updatePaymentStatus');
      res.status(500).json(createErrorResponse(
        'Failed to update payment status',
        error.message
      ));
    }
  };

  // Update shipping information
  updateShippingInfo = async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        trackingNumber, 
        carrier, 
        shippingMethod, 
        estimatedDelivery,
        notes 
      } = req.body;

      const updateData = {
        'shipping.trackingNumber': trackingNumber,
        'shipping.carrier': carrier,
        'shipping.method': shippingMethod,
        'shipping.estimatedDelivery': estimatedDelivery ? new Date(estimatedDelivery) : null,
        'shipping.notes': notes
      };

      // Remove null/undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const order = await Order.findByIdAndUpdate(
        id,
        { 
          $set: updateData,
          $push: {
            shippingHistory: {
              trackingNumber: trackingNumber,
              carrier: carrier,
              method: shippingMethod,
              timestamp: new Date(),
              notes: notes || '',
              updatedBy: req.user.id
            }
          }
        },
        { new: true, runValidators: true }
      ).populate('customer', 'firstName lastName email phone');

      if (!order) {
        return res.status(404).json(createErrorResponse(
          'Order not found',
          'Order with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        message: 'Shipping information updated successfully',
        order: order
      });
    } catch (error) {
      logError(error, 'updateShippingInfo');
      res.status(500).json(createErrorResponse(
        'Failed to update shipping information',
        error.message
      ));
    }
  };

  // Cancel order
  cancelOrder = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, notes } = req.body;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json(createErrorResponse(
          'Order not found',
          'Order with the specified ID does not exist'
        ));
      }

      if (order.status === 'delivered') {
        return res.status(400).json(createErrorResponse(
          'Cannot cancel delivered order',
          'Orders that have been delivered cannot be cancelled'
        ));
      }

      if (order.status === 'cancelled') {
        return res.status(400).json(createErrorResponse(
          'Order already cancelled',
          'This order has already been cancelled'
        ));
      }

      // Update order status
      order.status = 'cancelled';
      order.cancellationReason = reason;
      order.cancelledAt = new Date();
      order.cancelledBy = req.user.id;

      // Add to status history
      order.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date(),
        notes: notes || `Cancelled: ${reason}`,
        updatedBy: req.user.id
      });

      await order.save();

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        order: order
      });
    } catch (error) {
      logError(error, 'cancelOrder');
      res.status(500).json(createErrorResponse(
        'Failed to cancel order',
        error.message
      ));
    }
  };

  // Get order statistics
  getOrderStats = async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const stats = {
        totalOrders: await Order.countDocuments(),
        pendingOrders: await Order.countDocuments({ status: 'pending' }),
        processingOrders: await Order.countDocuments({ status: 'processing' }),
        shippedOrders: await Order.countDocuments({ status: 'shipped' }),
        deliveredOrders: await Order.countDocuments({ status: 'delivered' }),
        cancelledOrders: await Order.countDocuments({ status: 'cancelled' }),
        ordersToday: await Order.countDocuments({
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }),
        ordersThisWeek: await Order.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        ordersThisMonth: await Order.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
        recentOrders: await Order.countDocuments({
          createdAt: { $gte: startDate }
        })
      };

      // Calculate revenue
      const revenueData = await Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'shipped', 'processing'] },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' }
          }
        }
      ]);

      stats.revenue = revenueData.length > 0 ? revenueData[0] : { totalRevenue: 0, averageOrderValue: 0 };

      res.json({
        success: true,
        stats: stats
      });
    } catch (error) {
      logError(error, 'getOrderStats');
      res.status(500).json(createErrorResponse(
        'Failed to get order statistics',
        error.message
      ));
    }
  };

  // Get order analytics
  getOrderAnalytics = async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Daily order counts
      const dailyOrders = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);

      // Status distribution
      const statusDistribution = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Payment method distribution
      const paymentDistribution = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        analytics: {
          dailyOrders: dailyOrders,
          statusDistribution: statusDistribution,
          paymentDistribution: paymentDistribution
        }
      });
    } catch (error) {
      logError(error, 'getOrderAnalytics');
      res.status(500).json(createErrorResponse(
        'Failed to get order analytics',
        error.message
      ));
    }
  };
}

module.exports = new AdminOrderController();

