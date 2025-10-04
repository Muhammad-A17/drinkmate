const Cart = require('../Models/cart-model');
const Product = require('../Models/product-model');
const Bundle = require('../Models/bundle-model');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find cart for this user
    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name nameAr sku price images stock status category'
      });
    
    // If no cart exists, create an empty one
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        summary: {
          itemCount: 0,
          subtotal: 0,
          shipping: 0,
          tax: 0,
          discount: 0,
          total: 0,
          currency: 'SAR'
        }
      });
    }
    
    // Filter out any items where product no longer exists or is inactive
    const validItems = cart.items.filter(item => 
      item.product && item.product.status === 'active'
    );
    
    // If some items were removed, update the cart
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }
    
    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items.map(item => ({
          id: item.product._id.toString(),
          productId: item.product._id.toString(),
          name: item.productSnapshot?.name || item.product.name,
          nameAr: item.productSnapshot?.nameAr || item.product.nameAr,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.productSnapshot?.image || item.product.images?.[0] || '',
          sku: item.productSnapshot?.sku || item.product.sku,
          category: item.product.category,
          stock: item.product.stock,
          productType: 'product'
        })),
        summary: cart.summary
      }
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, variants = [] } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Get product details
    const product = await Product.findById(productId);
    
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
    
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        summary: {
          itemCount: 0,
          subtotal: 0,
          shipping: 0,
          tax: 0,
          discount: 0,
          total: 0,
          currency: 'SAR'
        }
      });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId.toString() &&
      JSON.stringify(item.variants) === JSON.stringify(variants)
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      
      // Check stock again
      if (cart.items[existingItemIndex].quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Only ${product.stock} available in stock`
        });
      }
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        productSnapshot: {
          name: product.name,
          nameAr: product.nameAr,
          sku: product.sku,
          price: product.price,
          image: product.images?.[0] || '',
          stock: product.stock
        },
        quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
        variants
      });
    }
    
    // Save cart (will trigger pre-save middleware to calculate totals)
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name nameAr sku price images stock status category'
    });
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart: {
        _id: cart._id,
        items: cart.items.map(item => ({
          id: item.product._id.toString(),
          productId: item.product._id.toString(),
          name: item.productSnapshot?.name || item.product.name,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.productSnapshot?.image || item.product.images?.[0] || '',
          sku: item.productSnapshot?.sku || item.product.sku,
          category: item.product.category,
          productType: 'product'
        })),
        summary: cart.summary
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// Update item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }
    
    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be non-negative'
      });
    }
    
    // Find cart
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId.toString()
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Check product stock
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`
        });
      }
      
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].totalPrice = cart.items[itemIndex].unitPrice * quantity;
    }
    
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name nameAr sku price images stock status category'
    });
    
    res.status(200).json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      cart: {
        _id: cart._id,
        items: cart.items.map(item => ({
          id: item.product._id.toString(),
          productId: item.product._id.toString(),
          name: item.productSnapshot?.name || item.product.name,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.productSnapshot?.image || item.product.images?.[0] || '',
          sku: item.productSnapshot?.sku || item.product.sku,
          category: item.product.category,
          productType: 'product'
        })),
        summary: cart.summary
      }
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Find cart
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Remove item
    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId.toString()
    );
    
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name nameAr sku price images stock status category'
    });
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        _id: cart._id,
        items: cart.items.map(item => ({
          id: item.product._id.toString(),
          productId: item.product._id.toString(),
          name: item.productSnapshot?.name || item.product.name,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.productSnapshot?.image || item.product.images?.[0] || '',
          sku: item.productSnapshot?.sku || item.product.sku,
          category: item.product.category,
          productType: 'product'
        })),
        summary: cart.summary
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = [];
    cart.coupon = undefined;
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: {
        _id: cart._id,
        items: [],
        summary: cart.summary
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// Sync cart with localStorage (merge localStorage cart with DB cart)
const syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body; // Items from localStorage
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        summary: {
          itemCount: 0,
          subtotal: 0,
          shipping: 0,
          tax: 0,
          discount: 0,
          total: 0,
          currency: 'SAR'
        }
      });
    }
    
    // Process each item from localStorage
    for (const localItem of items) {
      try {
        const productId = localItem.productId || localItem.id;
        if (!productId) continue;
        
        // Get product details
        const product = await Product.findById(productId);
        if (!product || product.status !== 'active') continue;
        
        // Check if item already exists in DB cart
        const existingItemIndex = cart.items.findIndex(item => 
          item.product.toString() === productId.toString()
        );
        
        if (existingItemIndex !== -1) {
          // Merge quantities (take the higher quantity)
          const newQuantity = Math.max(
            cart.items[existingItemIndex].quantity,
            localItem.quantity
          );
          
          // Don't exceed stock
          cart.items[existingItemIndex].quantity = Math.min(newQuantity, product.stock);
        } else {
          // Add new item from localStorage
          const quantity = Math.min(localItem.quantity, product.stock);
          
          cart.items.push({
            product: productId,
            productSnapshot: {
              name: product.name,
              nameAr: product.nameAr,
              sku: product.sku,
              price: product.price,
              image: product.images?.[0] || '',
              stock: product.stock
            },
            quantity,
            unitPrice: product.price,
            totalPrice: product.price * quantity,
            variants: localItem.variants || []
          });
        }
      } catch (itemError) {
        console.error('Error processing cart item:', itemError);
        // Continue with next item
      }
    }
    
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name nameAr sku price images stock status category'
    });
    
    res.status(200).json({
      success: true,
      message: 'Cart synced successfully',
      cart: {
        _id: cart._id,
        items: cart.items.map(item => ({
          id: item.product._id.toString(),
          productId: item.product._id.toString(),
          name: item.productSnapshot?.name || item.product.name,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.productSnapshot?.image || item.product.images?.[0] || '',
          sku: item.productSnapshot?.sku || item.product.sku,
          category: item.product.category,
          productType: 'product'
        })),
        summary: cart.summary
      }
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync cart',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
};

