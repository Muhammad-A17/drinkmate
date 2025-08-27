const mongoose = require('mongoose');

const refillOrderSchema = new mongoose.Schema({
  // Basic order information
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },

  // Cylinder details
  cylinderType: {
    type: String,
    required: true,
    enum: [
      'drinkmate',
      'other-to-drinkmate',
      'sodastream',
      'errva',
      'fawwar',
      'phillips',
      'ultima-cosa',
      'bubble-bro',
      'yoco-cosa'
    ]
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },

  // Address information
  pickupAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'Saudi Arabia' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'Saudi Arabia' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  // Special instructions and preferences
  specialInstructions: {
    type: String,
    maxlength: 500
  },
  preferredPickupDate: Date,
  preferredDeliveryDate: Date,

  // Pricing information
  pricing: {
    basePrice: { type: Number, required: true },
    quantityDiscount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true }
  },

  // Order status and tracking
  status: {
    type: String,
    required: true,
    enum: [
      'pending',
      'confirmed',
      'pickup_scheduled',
      'pickup_completed',
      'refilling',
      'refill_completed',
      'delivery_scheduled',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending'
  },

  // Status history for tracking
  statusHistory: [{
    status: { type: String, required: true },
    adminNotes: String,
    updatedAt: { type: Date, default: Date.now }
  }],

  // Pickup details
  pickupScheduledDate: Date,
  pickupCompletedDate: Date,
  pickupNotes: String,
  driverName: String,
  driverPhone: String,

  // Refill details
  refillStartDate: Date,
  refillCompletedDate: Date,
  refillNotes: String,

  // Delivery details
  deliveryScheduledDate: Date,
  deliveryCompletedDate: Date,
  deliveryNotes: String,
  deliveryDriverName: String,
  deliveryDriverPhone: String,

  // Admin notes and cancellation
  adminNotes: String,
  cancellationReason: String,
  cancelledDate: Date,

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
  timestamps: true
});

// Indexes for better query performance
refillOrderSchema.index({ userId: 1, status: 1 });
refillOrderSchema.index({ status: 1, createdAt: -1 });
refillOrderSchema.index({ orderNumber: 1 });
refillOrderSchema.index({ userEmail: 1 });

// Virtual for order age
refillOrderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for estimated completion time
refillOrderSchema.virtual('estimatedCompletion').get(function() {
  if (this.status === 'delivered') return null;
  
  const statusOrder = [
    'pending', 'confirmed', 'pickup_scheduled', 'pickup_completed',
    'refilling', 'refill_completed', 'delivery_scheduled', 'out_for_delivery', 'delivered'
  ];
  
  const currentIndex = statusOrder.indexOf(this.status);
  const remainingSteps = statusOrder.length - currentIndex - 1;
  
  // Estimate 1-2 days per step
  return remainingSteps * 1.5;
});

// Method to get status display name
refillOrderSchema.methods.getStatusDisplayName = function() {
  const statusNames = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'pickup_scheduled': 'Pickup Scheduled',
    'pickup_completed': 'Pickup Completed',
    'refilling': 'Refilling',
    'refill_completed': 'Refill Completed',
    'delivery_scheduled': 'Delivery Scheduled',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded'
  };
  return statusNames[this.status] || this.status;
};

// Method to get status color
refillOrderSchema.methods.getStatusColor = function() {
  const statusColors = {
    'pending': 'yellow',
    'confirmed': 'blue',
    'pickup_scheduled': 'purple',
    'pickup_completed': 'green',
    'refilling': 'orange',
    'refill_completed': 'teal',
    'delivery_scheduled': 'indigo',
    'out_for_delivery': 'pink',
    'delivered': 'green',
    'cancelled': 'red',
    'refunded': 'gray'
  };
  return statusColors[this.status] || 'gray';
};

// Method to check if order can be cancelled
refillOrderSchema.methods.canBeCancelled = function() {
  return !['delivered', 'cancelled', 'refunded'].includes(this.status);
};

// Method to check if order can be updated
refillOrderSchema.methods.canBeUpdated = function() {
  return !['delivered', 'cancelled', 'refunded'].includes(this.status);
};

// Method to get next possible statuses
refillOrderSchema.methods.getNextPossibleStatuses = function() {
  const statusFlow = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['pickup_scheduled', 'cancelled'],
    'pickup_scheduled': ['pickup_completed', 'cancelled'],
    'pickup_completed': ['refilling'],
    'refilling': ['refill_completed'],
    'refill_completed': ['delivery_scheduled'],
    'delivery_scheduled': ['out_for_delivery', 'cancelled'],
    'out_for_delivery': ['delivered'],
    'delivered': [],
    'cancelled': [],
    'refunded': []
  };
  return statusFlow[this.status] || [];
};

// Method to add status update
refillOrderSchema.methods.addStatusUpdate = function(status, adminNotes = '') {
  this.statusHistory.push({
    status,
    adminNotes,
    updatedAt: new Date()
  });
  this.status = status;
  this.updatedAt = new Date();
};

// Method to calculate total processing time
refillOrderSchema.methods.getTotalProcessingTime = function() {
  if (this.status !== 'delivered' || !this.deliveryCompletedDate) {
    return null;
  }
  
  const startTime = this.createdAt;
  const endTime = this.deliveryCompletedDate;
  return Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24));
};

// Pre-save middleware to update timestamps
refillOrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get orders by date range
refillOrderSchema.statics.getOrdersByDateRange = function(startDate, endDate, status = null) {
  const filter = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (status) {
    filter.status = status;
  }
  
  return this.find(filter).sort({ createdAt: -1 });
};

// Static method to get dashboard statistics
refillOrderSchema.statics.getDashboardStats = function() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  return Promise.all([
    this.countDocuments({ status: 'pending' }),
    this.countDocuments({ status: 'pickup_scheduled' }),
    this.countDocuments({ status: 'refilling' }),
    this.countDocuments({ status: 'delivery_scheduled' }),
    this.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    }),
    this.countDocuments({ 
      createdAt: { $gte: startOfYear } 
    }),
    this.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'refill_completed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.total' },
          avgOrderValue: { $avg: '$pricing.total' }
        }
      }
    ])
  ]);
};

const RefillOrder = mongoose.model('RefillOrder', refillOrderSchema);

module.exports = RefillOrder;
