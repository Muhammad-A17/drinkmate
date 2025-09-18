const Wishlist = require('../Models/wishlist-model');
const Product = require('../Models/product-model');

// Get user's wishlist
async function getWishlist(req, res) {
  try {
    const userId = req.user.id;
    
    let wishlist = await Wishlist.findOne({ user: userId })
      .populate('items.product', 'name nameAr slug sku price originalPrice images stock status category')
      .lean();
    
    if (!wishlist) {
      // Create empty wishlist if it doesn't exist
      wishlist = await Wishlist.create({
        user: userId,
        items: [],
        summary: {
          itemCount: 0,
          totalValue: 0,
          currency: 'SAR'
        }
      });
    }
    
    // Filter out products that are no longer active
    const activeItems = wishlist.items.filter(item => 
      item.product && item.product.status === 'active'
    );
    
    // Update wishlist if any items were filtered out
    if (activeItems.length !== wishlist.items.length) {
      await Wishlist.findByIdAndUpdate(wishlist._id, {
        items: activeItems.map(item => ({
          product: item.product._id,
          productSnapshot: {
            name: item.product.name,
            nameAr: item.product.nameAr,
            slug: item.product.slug,
            sku: item.product.sku,
            price: item.product.price,
            originalPrice: item.product.originalPrice,
            image: item.product.images?.[0] || '',
            stock: item.product.stock,
            status: item.product.status
          },
          addedAt: item.addedAt
        }))
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        wishlist: {
          ...wishlist,
          items: activeItems
        }
      }
    });
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist',
      error: error.message
    });
  }
}

// Add item to wishlist
async function addToWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Get product details
    const product = await Product.findById(productId).select('name nameAr slug sku price originalPrice images stock status category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }
    
    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: [],
        summary: {
          itemCount: 0,
          totalValue: 0,
          currency: 'SAR'
        }
      });
    }
    
    // Check if item already exists
    const existingItem = wishlist.items.find(item => 
      item.product.toString() === productId.toString()
    );
    
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }
    
    // Add item to wishlist
    const productSnapshot = {
      name: product.name,
      nameAr: product.nameAr,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images?.[0] || '',
      stock: product.stock,
      status: product.status
    };
    
    wishlist.items.push({
      product: productId,
      productSnapshot: productSnapshot,
      addedAt: new Date()
    });
    
    await wishlist.save();
    
    // Populate product details for the response
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('items.product', 'name nameAr slug sku price originalPrice images stock status category')
      .lean();
    
    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        wishlist: populatedWishlist
      }
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: error.message
    });
  }
}

// Remove item from wishlist
async function removeFromWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(item => 
      item.product.toString() !== productId.toString()
    );
    
    if (wishlist.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }
    
    await wishlist.save();
    
    // Populate product details for the response
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('items.product', 'name nameAr slug sku price originalPrice images stock status category')
      .lean();
    
    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: {
        wishlist: populatedWishlist
      }
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: error.message
    });
  }
}

// Toggle item in wishlist (add if not present, remove if present)
async function toggleWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Get product details
    const product = await Product.findById(productId).select('name nameAr slug sku price originalPrice images stock status category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }
    
    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: [],
        summary: {
          itemCount: 0,
          totalValue: 0,
          currency: 'SAR'
        }
      });
    }
    
    // Check if item exists
    const existingItemIndex = wishlist.items.findIndex(item => 
      item.product.toString() === productId.toString()
    );
    
    let action = '';
    
    if (existingItemIndex !== -1) {
      // Remove item
      wishlist.items.splice(existingItemIndex, 1);
      action = 'removed';
    } else {
      // Add item
      const productSnapshot = {
        name: product.name,
        nameAr: product.nameAr,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0] || '',
        stock: product.stock,
        status: product.status
      };
      
      wishlist.items.push({
        product: productId,
        productSnapshot: productSnapshot,
        addedAt: new Date()
      });
      action = 'added';
    }
    
    await wishlist.save();
    
    // Populate product details for the response
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('items.product', 'name nameAr slug sku price originalPrice images stock status category')
      .lean();
    
    res.status(200).json({
      success: true,
      message: `Product ${action} from wishlist`,
      data: {
        action: action,
        wishlist: populatedWishlist
      }
    });
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle wishlist',
      error: error.message
    });
  }
}

// Clear wishlist
async function clearWishlist(req, res) {
  try {
    const userId = req.user.id;
    
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    wishlist.items = [];
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      data: {
        wishlist: wishlist
      }
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
}

// Check if product is in wishlist
async function checkWishlistStatus(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          inWishlist: false
        }
      });
    }
    
    const inWishlist = wishlist.items.some(item => 
      item.product.toString() === productId.toString()
    );
    
    res.status(200).json({
      success: true,
      data: {
        inWishlist: inWishlist
      }
    });
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status',
      error: error.message
    });
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  checkWishlistStatus
};
