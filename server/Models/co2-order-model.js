const mongoose = require('mongoose');

const co2OrderSchema = new mongoose.Schema({
  // Order identification
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order details
  orderType: {
    type: String,
    required: true,
    enum: ['refill', 'exchange', 'new', 'subscription']
  },
  cylinderType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CO2Cylinder',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Pricing information
  unitPrice: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  
  // Delivery and pickup information
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  deliveryInstructions: String,
  
  // Scheduling
  preferredPickupDate: Date,
  preferredDeliveryDate: Date,
  actualPickupDate: Date,
  actualDeliveryDate: Date,
  
  // Order status and tracking
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'pickup_scheduled',
      'picked_up',
      'refilling',
      'ready_for_delivery',
      'delivery_scheduled',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending'
  },
  
  // Cylinder status tracking
  cylinders: [{
    cylinderId: String, // Unique identifier for each cylinder
    status: {
      type: String,
      enum: ['pending', 'picked_up', 'refilling', 'ready', 'delivered'],
      default: 'pending'
    },
    pickupDate: Date,
    refillDate: Date,
    deliveryDate: Date,
    notes: String
  }],
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['urways', 'tap_payment', 'credit_card', 'debit_card', 'bank_transfer', 'paypal', 'cash_on_delivery'],
    required: true
  },
  deliveryOption: {
    type: String,
    enum: ['standard', 'express', 'economy'],
    default: 'standard'
  },
  cardDetails: {
    cardNumber: String,
    cardholderName: String,
    expiryMonth: String,
    expiryYear: String,
    cvv: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  transactionId: String,
  
  // Notes and communication
  customerNotes: String,
  adminNotes: String,
  internalNotes: String,
  
  // Timestamps and tracking
  estimatedPickupDate: Date,
  estimatedDeliveryDate: Date,
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
co2OrderSchema.index({ orderNumber: 1 });
co2OrderSchema.index({ userId: 1, status: 1 });
co2OrderSchema.index({ status: 1, createdAt: 1 });
co2OrderSchema.index({ orderType: 1, status: 1 });

// Pre-save middleware to generate order number
co2OrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `CO2${year}${month}${day}${random}`;
  }
  
  // Calculate totals
  this.subtotal = this.unitPrice * this.quantity;
  this.total = this.subtotal + this.deliveryCharge - this.discount;
  
  this.updatedAt = new Date();
  next();
});

// Virtual for order age in days
co2OrderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// Virtual for estimated delivery time
co2OrderSchema.virtual('estimatedDeliveryTime').get(function() {
  if (this.estimatedDeliveryDate) {
    const now = new Date();
    const estimated = new Date(this.estimatedDeliveryDate);
    return Math.ceil((estimated - now) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Method to update order status
co2OrderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  // Update cylinder statuses based on order status
  if (newStatus === 'picked_up') {
    this.cylinders.forEach(cylinder => {
      cylinder.status = 'picked_up';
      cylinder.pickupDate = new Date();
    });
  } else if (newStatus === 'refilling') {
    this.cylinders.forEach(cylinder => {
      cylinder.status = 'refilling';
    });
  } else if (newStatus === 'ready_for_delivery') {
    this.cylinders.forEach(cylinder => {
      cylinder.status = 'ready';
      cylinder.refillDate = new Date();
    });
  } else if (newStatus === 'delivered') {
    this.cylinders.forEach(cylinder => {
      cylinder.status = 'delivered';
      cylinder.deliveryDate = new Date();
    });
  }
  
  return this.save();
};

// Method to schedule pickup
co2OrderSchema.methods.schedulePickup = function(pickupDate) {
  this.preferredPickupDate = pickupDate;
  this.status = 'pickup_scheduled';
  this.estimatedPickupDate = pickupDate;
  return this.save();
};

// Method to schedule delivery
co2OrderSchema.methods.scheduleDelivery = function(deliveryDate) {
  this.preferredDeliveryDate = deliveryDate;
  this.status = 'delivery_scheduled';
  this.estimatedDeliveryDate = deliveryDate;
  return this.save();
};

// Method to mark cylinder as picked up
co2OrderSchema.methods.markCylinderPickedUp = function(cylinderId) {
  const cylinder = this.cylinders.find(c => c.cylinderId === cylinderId);
  if (cylinder) {
    cylinder.status = 'picked_up';
    cylinder.pickupDate = new Date();
  }
  return this.save();
};

// Method to mark cylinder as refilled
co2OrderSchema.methods.markCylinderRefilled = function(cylinderId) {
  const cylinder = this.cylinders.find(c => c.cylinderId === cylinderId);
  if (cylinder) {
    cylinder.status = 'ready';
    cylinder.refillDate = new Date();
  }
  return this.save();
};

// Method to mark cylinder as delivered
co2OrderSchema.methods.markCylinderDelivered = function(cylinderId) {
  const cylinder = this.cylinders.find(c => c.cylinderId === cylinderId);
  if (cylinder) {
    cylinder.status = 'delivered';
    cylinder.deliveryDate = new Date();
  }
  return this.save();
};

// Static method to get orders by status
co2OrderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status }).populate('userId cylinderType').sort({ createdAt: -1 });
};

// Static method to get orders by user
co2OrderSchema.statics.getOrdersByUser = function(userId) {
  return this.find({ userId }).populate('cylinderType').sort({ createdAt: -1 });
};

module.exports = mongoose.model('CO2Order', co2OrderSchema);
