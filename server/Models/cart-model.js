const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Cart Items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productSnapshot: {
      name: String,
      nameAr: String,
      sku: String,
      price: Number,
      image: String,
      stock: Number
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    variants: [{
      name: String,
      value: String,
      priceAdjustment: {
        type: Number,
        default: 0
      }
    }],
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Cart Summary
  summary: {
    itemCount: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      default: 0
    },
    shipping: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'SAR',
      enum: ['SAR', 'USD', 'EUR']
    }
  },
  
  // Applied Coupon
  coupon: {
    code: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    discountValue: Number,
    appliedAt: Date,
    expiresAt: Date
  },
  
  // Cart Status
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted', 'expired'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for cart age in days
cartSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is expired
cartSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for is empty
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Indexes for better performance
cartSchema.index({ user: 1 });
cartSchema.index({ status: 1, lastAccessedAt: -1 });
cartSchema.index({ expiresAt: 1 });
cartSchema.index({ createdAt: -1 });

// Pre-save middleware
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastAccessedAt = Date.now();
  
  // Calculate item count
  this.summary.itemCount = this.items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total price for each item
  this.items.forEach(item => {
    item.totalPrice = item.unitPrice * item.quantity;
  });
  
  // Calculate subtotal
  this.summary.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Apply coupon discount if exists
  let discount = 0;
  if (this.coupon && this.coupon.code) {
    if (this.coupon.discountType === 'percentage') {
      discount = (this.summary.subtotal * this.coupon.discountValue) / 100;
    } else {
      discount = this.coupon.discountValue;
    }
    discount = Math.min(discount, this.summary.subtotal); // Don't exceed subtotal
  }
  
  this.summary.discount = discount;
  
  // Calculate total
  this.summary.total = this.summary.subtotal + this.summary.shipping + this.summary.tax - this.summary.discount;
  
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity = 1, variants = []) {
  // Check if item already exists
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.variants) === JSON.stringify(variants)
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    // Add new item (product snapshot will be populated by controller)
    this.items.push({
      product: productId,
      quantity,
      variants,
      unitPrice: 0, // Will be set by controller
      totalPrice: 0 // Will be calculated
    });
  }
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity, variants = []) {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.variants) === JSON.stringify(variants)
  );
  
  if (item) {
    if (quantity <= 0) {
      this.removeItem(productId, variants);
    } else {
      item.quantity = quantity;
    }
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId, variants = []) {
  this.items = this.items.filter(item => 
    !(item.product.toString() === productId.toString() &&
      JSON.stringify(item.variants) === JSON.stringify(variants))
  );
  
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.coupon = undefined;
  return this.save();
};

// Method to apply coupon
cartSchema.methods.applyCoupon = function(couponCode, discountType, discountValue, expiresAt) {
  this.coupon = {
    code: couponCode,
    discountType,
    discountValue,
    appliedAt: new Date(),
    expiresAt
  };
  
  return this.save();
};

// Method to remove coupon
cartSchema.methods.removeCoupon = function() {
  this.coupon = undefined;
  return this.save();
};

// Method to update shipping cost
cartSchema.methods.updateShipping = function(shippingCost) {
  this.summary.shipping = shippingCost;
  return this.save();
};

// Method to update tax
cartSchema.methods.updateTax = function(taxAmount) {
  this.summary.tax = taxAmount;
  return this.save();
};

// Method to mark as converted (when order is placed)
cartSchema.methods.markAsConverted = function() {
  this.status = 'converted';
  return this.save();
};

// Method to mark as abandoned
cartSchema.methods.markAsAbandoned = function() {
  this.status = 'abandoned';
  return this.save();
};

// Method to check if item is in stock
cartSchema.methods.isItemInStock = function(productId, quantity = 1) {
  const item = this.items.find(item => item.product.toString() === productId.toString());
  if (!item) return true;
  
  // Check if product snapshot has stock info
  if (item.productSnapshot && item.productSnapshot.stock !== undefined) {
    return item.productSnapshot.stock >= quantity;
  }
  
  return true; // Assume in stock if no stock info
};

// Method to validate cart
cartSchema.methods.validateCart = function() {
  const errors = [];
  
  // Check if cart is empty
  if (this.items.length === 0) {
    errors.push('Cart is empty');
  }
  
  // Check if items are in stock
  this.items.forEach((item, index) => {
    if (!this.isItemInStock(item.product, item.quantity)) {
      errors.push(`Item ${index + 1} is out of stock`);
    }
  });
  
  // Check if coupon is expired
  if (this.coupon && this.coupon.expiresAt && new Date() > this.coupon.expiresAt) {
    errors.push('Applied coupon has expired');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Static method to get abandoned carts
cartSchema.statics.getAbandonedCarts = function(hours = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({
    status: 'active',
    lastAccessedAt: { $lt: cutoffTime }
  }).populate('user', 'email firstName lastName');
};

// Static method to get cart statistics
cartSchema.statics.getCartStats = function(startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalCarts: { $sum: 1 },
        activeCarts: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        convertedCarts: {
          $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
        },
        abandonedCarts: {
          $sum: { $cond: [{ $eq: ['$status', 'abandoned'] }, 1, 0] }
        },
        averageCartValue: { $avg: '$summary.total' },
        totalCartValue: { $sum: '$summary.total' }
      }
    }
  ]);
};

module.exports = mongoose.model('Cart', cartSchema);
