const Product = require('../Models/product-model');
const Order = require('../Models/order-model');
const Category = require('../Models/category-model');

// Simple in-memory cache for recommendations
const recommendationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get personalized recommendations based on customer's purchase history
exports.getPersonalizedRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 3;
        
        // Get customer's recent orders with product details
        const recentOrders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('items.product', 'category name')
            .lean();
        
        let recommendations = [];
        
        if (recentOrders.length === 0) {
            // No purchase history - show best selling items
            recommendations = await getBestSellingProducts(limit);
        } else if (recentOrders.length === 1) {
            // Only one purchase - show 1 best seller + 2 from last purchase category
            const lastOrder = recentOrders[0];
            const lastOrderCategories = getCategoriesFromOrder(lastOrder);
            
            const bestSellers = await getBestSellingProducts(1);
            const categoryProducts = await getProductsByCategories(lastOrderCategories, 2);
            
            recommendations = [...bestSellers, ...categoryProducts];
        } else {
            // Multiple purchases - show 1 from second last + 1 best seller + 1 from last purchase
            const lastOrder = recentOrders[0];
            const secondLastOrder = recentOrders[1];
            
            const lastOrderCategories = getCategoriesFromOrder(lastOrder);
            const secondLastOrderCategories = getCategoriesFromOrder(secondLastOrder);
            
            const secondLastProducts = await getProductsByCategories(secondLastOrderCategories, 1);
            const bestSellers = await getBestSellingProducts(1);
            const lastProducts = await getProductsByCategories(lastOrderCategories, 1);
            
            recommendations = [...secondLastProducts, ...bestSellers, ...lastProducts];
        }
        
        // Remove duplicates and limit to requested amount
        const uniqueRecommendations = removeDuplicates(recommendations).slice(0, limit);
        
        // If we don't have enough recommendations, fill with best sellers
        if (uniqueRecommendations.length < limit) {
            const additionalBestSellers = await getBestSellingProducts(limit - uniqueRecommendations.length);
            const existingIds = uniqueRecommendations.map(r => r._id.toString());
            const filteredBestSellers = additionalBestSellers.filter(bs => 
                !existingIds.includes(bs._id.toString())
            );
            uniqueRecommendations.push(...filteredBestSellers);
        }
        
        res.status(200).json({
            success: true,
            data: {
                recommendations: uniqueRecommendations.slice(0, limit),
                strategy: getRecommendationStrategy(recentOrders.length)
            }
        });
        
    } catch (error) {
        console.error('Error in getPersonalizedRecommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Helper function to get best selling products
async function getBestSellingProducts(limit) {
    const cacheKey = `best_selling_${limit}`;
    const cached = recommendationCache.get(cacheKey);
    
    // Return cached data if available and not expired
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data;
    }
    
    // First try to get products marked as best sellers
    let products = await Product.find({
        status: 'active',
        stock: { $gt: 0 },
        bestSeller: true
    })
    .select('name slug price originalPrice images averageRating reviewCount category shortDescription')
    .populate('category', 'name slug')
    .sort({ reviewCount: -1, averageRating: -1 })
    .limit(limit)
    .lean();
    
    // If no best sellers found, fall back to popular products
    if (products.length === 0) {
        products = await Product.find({
            status: 'active',
            stock: { $gt: 0 }
        })
        .select('name slug price originalPrice images averageRating reviewCount category shortDescription')
        .populate('category', 'name slug')
        .sort({ reviewCount: -1, averageRating: -1, createdAt: -1 })
        .limit(limit)
        .lean();
    }
    
    // Cache the results
    recommendationCache.set(cacheKey, {
        data: products,
        timestamp: Date.now()
    });
    
    return products;
}

// Helper function to get products by categories
async function getProductsByCategories(categories, limit) {
    if (!categories || categories.length === 0) return [];
    
    const products = await Product.find({
        status: 'active',
        stock: { $gt: 0 },
        $or: [
            { category: { $in: categories } },
            { 'category.name': { $in: categories } },
            { 'category.slug': { $in: categories } }
        ]
    })
    .select('name slug price originalPrice images averageRating reviewCount category shortDescription')
    .populate('category', 'name slug')
    .sort({ reviewCount: -1, averageRating: -1 })
    .limit(limit)
    .lean();
    
    return products;
}

// Helper function to extract categories from an order
function getCategoriesFromOrder(order) {
    const categories = new Set();
    
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            if (item.product && item.product.category) {
                // Handle different category formats
                if (typeof item.product.category === 'string') {
                    categories.add(item.product.category);
                } else if (item.product.category.name) {
                    categories.add(item.product.category.name);
                } else if (item.product.category.slug) {
                    categories.add(item.product.category.slug);
                }
            }
        });
    }
    
    return Array.from(categories);
}

// Helper function to remove duplicate products
function removeDuplicates(products) {
    const seen = new Set();
    return products.filter(product => {
        const id = product._id.toString();
        if (seen.has(id)) {
            return false;
        }
        seen.add(id);
        return true;
    });
}

// Helper function to get recommendation strategy description
function getRecommendationStrategy(orderCount) {
    if (orderCount === 0) {
        return 'best_sellers_only';
    } else if (orderCount === 1) {
        return 'best_sellers_and_last_purchase';
    } else {
        return 'mixed_strategy';
    }
}

// Get best selling products (public endpoint)
exports.getBestSellingProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const products = await getBestSellingProducts(limit);
        
        res.status(200).json({
            success: true,
            data: {
                products,
                count: products.length
            }
        });
        
    } catch (error) {
        console.error('Error in getBestSellingProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
