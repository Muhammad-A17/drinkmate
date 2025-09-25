const User = require('../Models/user-model');
const Order = require('../Models/order-model');
const Product = require('../Models/product-model');
const Testimonial = require('../Models/testimonial-model');
const Blog = require('../Models/blog-model');
const Contact = require('../Models/contact-model');
const { createErrorResponse, logError } = require('../Utils/error-handler');

// Get admin dashboard statistics
const getAdminStats = async (req, res) => {
  try {
    console.log('📊 Fetching admin stats...');
    console.log('📊 Request headers:', req.headers);
    console.log('📊 User from token:', req.user);
    
    // Get current date for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Parallel queries for better performance
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalTestimonials,
      totalBlogPosts,
      totalContacts,
      monthlyUsers,
      lastMonthUsers,
      monthlyOrders,
      lastMonthOrders,
      lowStockProducts,
      pendingOrders,
      monthlyRevenue,
      lastMonthRevenue
    ] = await Promise.all([
      // Total counts
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Testimonial.countDocuments(),
      Blog.countDocuments(),
      Contact.countDocuments(),
      
      // Monthly counts for growth calculations
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      }),
      
      // Additional stats
      Product.countDocuments({ stock: { $lt: 10 } }), // Low stock threshold
      Order.countDocuments({ status: { $in: ['pending', 'processing'] } }),
      
      // Revenue calculations
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { 
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, 
          status: 'completed' 
        }},
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    // Calculate growth percentages
    const userGrowth = lastMonthUsers > 0 
      ? ((monthlyUsers - lastMonthUsers) / lastMonthUsers) * 100 
      : 0;
    
    const orderGrowth = lastMonthOrders > 0 
      ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : 0;

    // Calculate revenue
    const currentRevenue = monthlyRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0 
      ? ((currentRevenue - lastMonthRev) / lastMonthRev) * 100 
      : 0;

    const stats = {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: currentRevenue,
      lowStockProducts,
      pendingOrders,
      totalTestimonials,
      totalBlogPosts,
      totalContacts,
      monthlyGrowth: revenueGrowth,
      orderGrowth,
      userGrowth
    };

    console.log('📊 Admin stats calculated:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logError(error, 'StatsController');
    res.status(500).json(createErrorResponse(
      'Failed to fetch admin statistics',
      error.message
    ));
  }
};

// Get recent data for admin dashboard
const getRecentData = async (req, res) => {
  try {
    console.log('📊 Fetching recent data...');
    
    // Get recent orders (last 5)
    const recentOrders = await Order.find()
      .populate('user', 'fullName firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id user total status createdAt items');

    // Get recent products (last 5)
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id name price stock images category createdAt');

    // Get recent users (last 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id fullName firstName lastName email createdAt');

    const recentData = {
      orders: recentOrders,
      products: recentProducts,
      users: recentUsers
    };

    console.log('📊 Recent data fetched:', {
      ordersCount: recentOrders.length,
      productsCount: recentProducts.length,
      usersCount: recentUsers.length
    });

    res.json({
      success: true,
      data: recentData
    });

  } catch (error) {
    logError(error, 'StatsController');
    res.status(500).json(createErrorResponse(
      'Failed to fetch recent data',
      error.message
    ));
  }
};

module.exports = {
  getAdminStats,
  getRecentData
};
