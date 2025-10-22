const { createErrorResponse, logError } = require('../Utils/error-handler');
const Order = require('../Models/order-model');
const User = require('../Models/user-model');
const Product = require('../Models/product-model');
const Chat = require('../Models/chat-model');

// Admin Analytics Controller
class AdminAnalyticsController {
  // Get dashboard overview
  getDashboardOverview = async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get basic counts
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

      // Get payment method distribution
      const paymentMethodDistribution = await Order.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get top products
      const topProducts = await Order.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
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

      // Get daily metrics for the period
      const dailyMetrics = await this.getDailyMetrics(startDate);

      res.json({
        success: true,
        overview: {
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
          distributions: {
            orderStatus: orderStatusDistribution,
            paymentMethod: paymentMethodDistribution
          },
          topProducts: topProducts,
          dailyMetrics: dailyMetrics
        }
      });
    } catch (error) {
      logError(error, 'getDashboardOverview');
      res.status(500).json(createErrorResponse(
        'Failed to get dashboard overview',
        error.message
      ));
    }
  };

  // Get daily metrics
  async getDailyMetrics(startDate) {
    try {
      const dailyData = await Order.aggregate([
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
            orders: { $sum: 1 },
            revenue: { $sum: '$total' },
            users: { $addToSet: '$user' }
          }
        },
        {
          $project: {
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day'
              }
            },
            orders: 1,
            revenue: 1,
            uniqueUsers: { $size: '$users' }
          }
        },
        { $sort: { date: 1 } }
      ]);

      return dailyData;
    } catch (error) {
      console.error('Error getting daily metrics:', error);
      return [];
    }
  }

  // Get sales analytics
  getSalesAnalytics = async (req, res) => {
    try {
      const { period = '30', groupBy = 'day' } = req.query;
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      let groupFormat;
      switch (groupBy) {
        case 'hour':
          groupFormat = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' }
          };
          break;
        case 'day':
          groupFormat = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          };
          break;
        case 'week':
          groupFormat = {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          };
          break;
        case 'month':
          groupFormat = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          };
          break;
        default:
          groupFormat = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          };
      }

      const salesData = await Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'shipped', 'processing'] },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: groupFormat,
            orders: { $sum: 1 },
            revenue: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' },
            uniqueCustomers: { $addToSet: '$user' }
          }
        },
        {
          $project: {
            period: '$_id',
            orders: 1,
            revenue: 1,
            averageOrderValue: 1,
            uniqueCustomers: { $size: '$uniqueCustomers' }
          }
        },
        { $sort: { period: 1 } }
      ]);

      // Get top customers
      const topCustomers = await Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'shipped', 'processing'] },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$user',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' }
      ]);

      res.json({
        success: true,
        analytics: {
          salesData: salesData,
          topCustomers: topCustomers
        }
      });
    } catch (error) {
      logError(error, 'getSalesAnalytics');
      res.status(500).json(createErrorResponse(
        'Failed to get sales analytics',
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

      // Get product performance
      const productPerformance = await Order.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
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
        { $sort: { totalRevenue: -1 } },
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
          $match: { createdAt: { $gte: startDate } }
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
          $project: {
            category: '$_id',
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
          productPerformance: productPerformance,
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

  // Get customer analytics
  getCustomerAnalytics = async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get customer acquisition data
      const customerAcquisition = await User.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            newCustomers: { $sum: 1 }
          }
        },
        {
          $project: {
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day'
              }
            },
            newCustomers: 1
          }
        },
        { $sort: { date: 1 } }
      ]);

      // Get customer lifetime value
      const customerLifetimeValue = await Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'shipped', 'processing'] }
          }
        },
        {
          $group: {
            _id: '$user',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            firstOrder: { $min: '$createdAt' },
            lastOrder: { $max: '$createdAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            customer: {
              name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
              email: '$user.email'
            },
            totalOrders: 1,
            totalSpent: 1,
            firstOrder: 1,
            lastOrder: 1,
            daysSinceFirstOrder: {
              $divide: [
                { $subtract: [new Date(), '$firstOrder'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 20 }
      ]);

      // Get customer segments
      const customerSegments = await Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'shipped', 'processing'] }
          }
        },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: '$total' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $bucket: {
            groupBy: '$totalSpent',
            boundaries: [0, 100, 500, 1000, 2000, 5000, Infinity],
            default: 'Other',
            output: {
              count: { $sum: 1 },
              averageSpent: { $avg: '$totalSpent' },
              averageOrders: { $avg: '$orderCount' }
            }
          }
        }
      ]);

      res.json({
        success: true,
        analytics: {
          customerAcquisition: customerAcquisition,
          customerLifetimeValue: customerLifetimeValue,
          customerSegments: customerSegments
        }
      });
    } catch (error) {
      logError(error, 'getCustomerAnalytics');
      res.status(500).json(createErrorResponse(
        'Failed to get customer analytics',
        error.message
      ));
    }
  };

  // Get chat analytics
  getChatAnalytics = async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get chat volume
      const chatVolume = await Chat.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalChats: { $sum: 1 },
            activeChats: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day'
              }
            },
            totalChats: 1,
            activeChats: 1
          }
        },
        { $sort: { date: 1 } }
      ]);

      // Get chat status distribution
      const chatStatusDistribution = await Chat.aggregate([
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

      // Get average response time
      const responseTimeData = await Chat.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            messages: { $exists: true, $ne: [] }
          }
        },
        { $unwind: '$messages' },
        {
          $match: {
            'messages.senderType': 'admin'
          }
        },
        {
          $group: {
            _id: '$_id',
            firstAdminMessage: { $min: '$messages.createdAt' },
            chatCreated: { $first: '$createdAt' }
          }
        },
        {
          $project: {
            responseTime: {
              $divide: [
                { $subtract: ['$firstAdminMessage', '$chatCreated'] },
                1000 * 60 // Convert to minutes
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averageResponseTime: { $avg: '$responseTime' },
            medianResponseTime: { $percentile: { input: '$responseTime', p: [0.5] } }
          }
        }
      ]);

      res.json({
        success: true,
        analytics: {
          chatVolume: chatVolume,
          chatStatusDistribution: chatStatusDistribution,
          responseTime: responseTimeData.length > 0 ? responseTimeData[0] : {
            averageResponseTime: 0,
            medianResponseTime: 0
          }
        }
      });
    } catch (error) {
      logError(error, 'getChatAnalytics');
      res.status(500).json(createErrorResponse(
        'Failed to get chat analytics',
        error.message
      ));
    }
  };
}

module.exports = new AdminAnalyticsController();

