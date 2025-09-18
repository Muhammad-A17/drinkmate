const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Wishlist Items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productSnapshot: {
      name: String,
      nameAr: String,
      slug: String,
      sku: String,
      price: Number,
      originalPrice: Number,
      image: String,
      stock: Number,
      status: {
        type: String,
        enum: ['active', 'inactive', 'draft', 'discontinued'],
        default: 'active'
      }
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Wishlist Summary
  summary: {
    itemCount: {
      type: Number,
      default: 0
    },
    totalValue: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'SAR',
      enum: ['SAR', 'USD', 'EUR']
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });
wishlistSchema.index({ 'items.addedAt': -1 });

// Pre-save middleware to update summary
wishlistSchema.pre('save', function(next) {
  this.summary.itemCount = this.items.length;
  this.summary.totalValue = this.items.reduce((total, item) => {
    return total + (item.productSnapshot.price || 0);
  }, 0);
  next();
});

// Method to add item to wishlist
wishlistSchema.methods.addItem = function(productId, productSnapshot) {
  // Check if item already exists
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (existingItem) {
    return false; // Item already exists
  }
  
  this.items.push({
    product: productId,
    productSnapshot: productSnapshot,
    addedAt: new Date()
  });
  
  return true; // Item added successfully
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = function(productId) {
  const initialLength = this.items.length;
  this.items = this.items.filter(item => 
    item.product.toString() !== productId.toString()
  );
  
  return this.items.length < initialLength; // Return true if item was removed
};

// Method to check if item is in wishlist
wishlistSchema.methods.hasItem = function(productId) {
  return this.items.some(item => 
    item.product.toString() === productId.toString()
  );
};

// Method to clear wishlist
wishlistSchema.methods.clear = function() {
  this.items = [];
  return true;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
