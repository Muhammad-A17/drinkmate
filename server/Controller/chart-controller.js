const Order = require('../Models/order-model');
const Product = require('../Models/product-model');
const { createErrorResponse, logError } = require('../Utils/error-handler');

// Get chart data for admin dashboard
const getChartData = async (req, res) => {
  try {
    console.log('📊 Fetching chart data...');
    console.log('📊 Request headers:', req.headers);
    console.log('📊 Request method:', req.method);
    console.log('📊 Request URL:', req.url);
    
    // Get current date and calculate date ranges
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Get last 6 months data
    const months = [];
    const salesData = [];
    const ordersData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      months.push(monthName);
      
      // Calculate start and end of month
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Get sales data for this month
      const monthlySales = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$total' },
            orderCount: { $sum: 1 }
          }
        }
      ]);
      
      salesData.push(monthlySales[0]?.totalSales || 0);
      ordersData.push(monthlySales[0]?.orderCount || 0);
    }
    
    // Get sales by category data
    const categorySales = await Order.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      {
        $unwind: '$productData'
      },
      {
        $group: {
          _id: '$productData.category',
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: '$items.quantity' }
        }
      },
      {
        $sort: { totalSales: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Format category data
    const categoryLabels = [];
    const categoryData = [];
    const categoryColors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(251, 191, 36, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)'
    ];
    
    categorySales.forEach((category, index) => {
      // Extract category name from the category field
      let categoryName = 'Unknown';
      if (typeof category._id === 'string') {
        categoryName = category._id;
      } else if (category._id && category._id.name) {
        categoryName = category._id.name;
      }
      
      categoryLabels.push(categoryName);
      categoryData.push(category.totalSales);
    });
    
    // If no category data, use default categories
    if (categoryLabels.length === 0) {
      categoryLabels.push('Sodamakers', 'CO2 Cylinders', 'Accessories', 'Flavors', 'Other');
      categoryData.push(0, 0, 0, 0, 0);
    }
    
    const chartData = {
      salesTrend: {
        labels: months,
        datasets: [{
          label: 'Sales (SAR)',
          data: salesData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      ordersByMonth: {
        labels: months,
        datasets: [{
          label: 'Orders',
          data: ordersData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }]
      },
      salesByCategory: {
        labels: categoryLabels,
        datasets: [{
          data: categoryData,
          backgroundColor: categoryColors.slice(0, categoryLabels.length),
          borderColor: categoryColors.slice(0, categoryLabels.length).map(color => 
            color.replace('0.8', '1')
          ),
          borderWidth: 1
        }]
      }
    };

    console.log('📊 Chart data calculated:', {
      salesTrendPoints: salesData.length,
      ordersTrendPoints: ordersData.length,
      categoriesCount: categoryLabels.length
    });

    res.json({
      success: true,
      data: chartData
    });

  } catch (error) {
    logError(error, 'ChartController');
    res.status(500).json(createErrorResponse(
      'Failed to fetch chart data',
      error.message
    ));
  }
};

module.exports = {
  getChartData
};
