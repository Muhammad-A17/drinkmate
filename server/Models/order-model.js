const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  
  // Customer Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow null for guest orders
  },
  
  // Guest Information (for guest checkout)
  guestInfo: {
    email: {
      type: String,
      required: function() { return !this.user; } // Required if no user
    },
    name: {
      type: String,
      required: function() { return !this.user; } // Required if no user
    }
  },
  
  // Flag to identify guest orders
  isGuestOrder: {
    type: Boolean,
    default: false
  },
  
  // Items (matches controller format)
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    bundle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bundle'
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    color: String,
    image: String,
    sku: String
  }],
  
  // Addresses (matches controller format)
  shippingAddress: {
    fullName: String,
    email: String,
    phone: String,
    district: String,
    city: String,
    country: {
      type: String,
      default: 'Saudi Arabia'
    },
    nationalAddress: String,
    specialInstructions: String
  },
  
  billingAddress: {
    sameAsShipping: {
      type: Boolean,
      default: true
    },
    fullName: String,
    email: String,
    phone: String,
    district: String,
    city: String,
    country: {
      type: String,
      default: 'Saudi Arabia'
    },
    nationalAddress: String
  },
  
  // Payment Information (matches controller format)
  paymentMethod: {
    type: String,
    required: true,
    enum: ['urways', 'tap', 'cash_on_delivery', 'bank_transfer']
  },
  
  paymentDetails: {
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentDate: Date
  },
  
  // Pricing (matches controller format)
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Coupon Information
  coupon: {
    code: String,
    discountAmount: Number,
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    }
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  
  // Additional Order Details
  packingInstructions: String,
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: String,
  
  // Order Timeline
  timeline: [{
    status: {
      type: String,
      required: true
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      enum: ['system', 'customer', 'admin'],
      default: 'system'
    }
  }],
  
  // Notes and Comments
  notes: {
    customer: String,
    admin: String,
    internal: String
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

// Virtual for customer full name
orderSchema.virtual('customerFullName').get(function() {
  if (this.shippingAddress && this.shippingAddress.fullName) {
    return this.shippingAddress.fullName;
  }
  return 'Unknown Customer';
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Indexes for better performance (orderNumber already has unique index)
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'paymentDetails.paymentStatus': 1 });
orderSchema.index({ 'shippingAddress.email': 1 });

// Pre-save middleware
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate order number if not provided
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.orderNumber = `DM${timestamp}${random}`;
  }
  
  next();
});

// Method to add timeline entry
orderSchema.methods.addTimelineEntry = function(status, description, updatedBy = 'system') {
  this.timeline.push({
    status,
    description,
    timestamp: new Date(),
    updatedBy
  });
  return this.save();
};

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, description, updatedBy = 'system') {
  this.status = newStatus;
  this.addTimelineEntry(newStatus, description, updatedBy);
  return this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = function(newStatus, transactionId = null) {
  this.paymentDetails.paymentStatus = newStatus;
  
  if (transactionId) {
    this.paymentDetails.transactionId = transactionId;
  }
  
  if (newStatus === 'paid') {
    this.paymentDetails.paymentDate = new Date();
  }
  
  this.addTimelineEntry(`payment_${newStatus}`, `Payment ${newStatus}`, 'system');
  return this.save();
};

// Method to cancel order
orderSchema.methods.cancelOrder = function(reason, cancelledBy = 'customer') {
  this.status = 'cancelled';
  this.addTimelineEntry('cancelled', `Order cancelled: ${reason}`, cancelledBy);
  return this.save();
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status) && 
         this.paymentDetails.paymentStatus !== 'paid';
};

// Method to check if order can be returned
orderSchema.methods.canBeReturned = function() {
  return this.status === 'delivered' && 
         this.ageInDays <= 30; // 30-day return policy
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = function(startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);