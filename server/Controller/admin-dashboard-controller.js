const { createErrorResponse, logError } = require('../Utils/error-handler');
const Order = require('../Models/order-model');
const User = require('../Models/user-model');
const Product = require('../Models/product-model');
const Chat = require('../Models/chat-model');

// Admin Dashboard Controller - Comprehensive overview
class AdminDashboardController {
  // Get complete dashboard data
  getDashboardData = async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get all dashboard data in parallel
      const [
        overview,
        recentOrders,
        recentUsers,
        lowStockProducts,
        activeChats,
        systemHealth
      ] = await Promise.all([
        this.getOverviewStats(startDate),
        this.getRecentOrders(10),
        this.getRecentUsers(10),
        this.getLowStockProducts(10),
        this.getActiveChats(10),
        this.getSystemHealthSummary()
      ]);

      res.json({
        success: true,
        dashboard: {
          overview,
          recentOrders,
          recentUsers,
          lowStockProducts,
          activeChats,
          systemHealth,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logError(error, 'getDashboardData');
      res.status(500).json(createErrorResponse(
        'Failed to get dashboard data',
        error.message
      ));
    }
  };

  // Get overview statistics
  async getOverviewStats(startDate) {
    try {
      const [
        totalUsers,
        totalOrders,
        totalProducts,
        totalChats,
        recentUsers,
        recentOrders,
        recentChats
      ] = await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments(),
        Chat.countDocuments(),
        User.countDocuments({ createdAt: { $gte: startDate } }),
        Order.countDocuments({ createdAt: { $gte: startDate } }),
        Chat.countDocuments({ createdAt: { $gte: startDate } })
      ]);

      // Get revenue data
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
            averageOrderValue: { $avg: '$total' },
            orderCount: { $sum: 1 }
          }
        }
      ]);

      const revenue = revenueData.length > 0 ? revenueData[0] : {
        totalRevenue: 0,
        averageOrderValue: 0,
        orderCount: 0
      };

      // Get order status distribution
      const orderStatusDistribution = await Order.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        totals: {
          users: totalUsers,
          orders: totalOrders,
          products: totalProducts,
          chats: totalChats
        },
        recent: {
          users: recentUsers,
          orders: recentOrders,
          chats: recentChats
        },
        revenue: {
          total: revenue.totalRevenue,
          average: revenue.averageOrderValue,
          orders: revenue.orderCount
        },
        orderStatusDistribution
      };
    } catch (error) {
      console.error('Error getting overview stats:', error);
      return {
        totals: { users: 0, orders: 0, products: 0, chats: 0 },
        recent: { users: 0, orders: 0, chats: 0 },
        revenue: { total: 0, average: 0, orders: 0 },
        orderStatusDistribution: []
      };
    }
  }

  // Get recent orders
  async getRecentOrders(limit = 10) {
    try {
      return await Order.find()
        .populate('customer', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('orderNumber status total createdAt customer');
    } catch (error) {
      console.error('Error getting recent orders:', error);
      return [];
    }
  }

  // Get recent users
  async getRecentUsers(limit = 10) {
    try {
      return await User.find()
        .select('firstName lastName email createdAt isAdmin')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error getting recent users:', error);
      return [];
    }
  }

  // Get low stock products
  async getLowStockProducts(limit = 10) {
    try {
      return await Product.find({
        stock: { $gt: 0, $lte: 10 }
      })
      .populate('category', 'name')
      .sort({ stock: 1 })
      .limit(limit)
      .select('name stock price category');
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return [];
    }
  }

  // Get active chats
  async getActiveChats(limit = 10) {
    try {
      return await Chat.find({
        status: 'active'
      })
      .populate('customer', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('customer assignedTo status createdAt updatedAt');
    } catch (error) {
      console.error('Error getting active chats:', error);
      return [];
    }
  }

  // Get system health summary
  async getSystemHealthSummary() {
    try {
      const mongoose = require('mongoose');
      const nodemailer = require('nodemailer');

      const health = {
        database: {
          status: mongoose.connection.readyState === 1 ? 'healthy' : 'error',
          connected: mongoose.connection.readyState === 1
        },
        email: {
          status: 'warning',
          configured: false
        },
        storage: {
          status: 'warning',
          configured: false
        },
        payments: {
          status: 'warning',
          configured: false
        }
      };

      // Check email configuration
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        health.email.configured = true;
        health.email.status = 'healthy';
      }

      // Check storage configuration
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        health.storage.configured = true;
        health.storage.status = 'healthy';
      }

      // Check payment configuration
      if ((process.env.URWAYS_TERMINAL_ID && process.env.URWAYS_MERCHANT_KEY) ||
          (process.env.TAP_API_KEY && process.env.TAP_SECRET_KEY)) {
        health.payments.configured = true;
        health.payments.status = 'healthy';
      }

      return health;
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        database: { status: 'error', connected: false },
        email: { status: 'error', configured: false },
        storage: { status: 'error', configured: false },
        payments: { status: 'error', configured: false }
      };
    }
  }

  // Get quick actions data
  getQuickActions = async (req, res) => {
    try {
      const actions = {
        pendingOrders: await Order.countDocuments({ status: 'pending' }),
        activeChats: await Chat.countDocuments({ status: 'active' }),
        lowStockProducts: await Product.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
        newUsers: await User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }),
        systemAlerts: []
      };

      // Check for system alerts
      if (actions.pendingOrders > 20) {
        actions.systemAlerts.push({
          type: 'warning',
          message: `${actions.pendingOrders} orders pending`,
          action: 'Review orders'
        });
      }

      if (actions.lowStockProducts > 5) {
        actions.systemAlerts.push({
          type: 'warning',
          message: `${actions.lowStockProducts} products low in stock`,
          action: 'Check inventory'
        });
      }

      if (actions.activeChats > 10) {
        actions.systemAlerts.push({
          type: 'info',
          message: `${actions.activeChats} active chats`,
          action: 'Review chat queue'
        });
      }

      res.json({
        success: true,
        actions: actions
      });
    } catch (error) {
      logError(error, 'getQuickActions');
      res.status(500).json(createErrorResponse(
        'Failed to get quick actions',
        error.message
      ));
    }
  };
}

module.exports = new AdminDashboardController();
