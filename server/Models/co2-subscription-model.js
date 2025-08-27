const mongoose = require('mongoose');

const co2SubscriptionSchema = new mongoose.Schema({
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Subscription details
  subscriptionType: {
    type: String,
    required: true,
    enum: ['monthly', 'quarterly', 'biannual', 'annual']
  },
  frequency: {
    type: Number, // Number of months between refills
    required: true,
    min: 1
  },
  
  // Cylinder information
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
  
  // Pricing and discounts
  basePrice: {
    type: Number,
    required: true
  },
  subscriptionDiscount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  finalPrice: {
    type: Number,
    required: true
  },
  
  // Delivery preferences
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  deliveryInstructions: String,
  
  // Schedule and timing
  nextRefillDate: {
    type: Date,
    required: true
  },
  lastRefillDate: Date,
  startDate: {
    type: Date,
    default: Date.now
  },
  
  // Status and management
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  isAutoRenew: {
    type: Boolean,
    default: true
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // History and tracking
  refillHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    quantity: Number,
    status: {
      type: String,
      enum: ['scheduled', 'picked_up', 'refilled', 'delivered'],
      default: 'scheduled'
    },
    notes: String
  }],
  
  // Notifications and preferences
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  reminderDays: {
    type: Number,
    default: 3 // Days before refill to send reminder
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
  timestamps: true
});

// Indexes for better query performance
co2SubscriptionSchema.index({ userId: 1, status: 1 });
co2SubscriptionSchema.index({ status: 1, nextRefillDate: 1 });
co2SubscriptionSchema.index({ subscriptionType: 1, status: 1 });

// Virtual for subscription duration in months
co2SubscriptionSchema.virtual('durationMonths').get(function() {
  const start = new Date(this.startDate);
  const end = new Date();
  return Math.floor((end - start) / (1000 * 60 * 60 * 24 * 30.44));
});

// Virtual for next refill in days
co2SubscriptionSchema.virtual('daysUntilNextRefill').get(function() {
  const now = new Date();
  const next = new Date(this.nextRefillDate);
  return Math.ceil((next - now) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate final price
co2SubscriptionSchema.pre('save', function(next) {
  if (this.subscriptionDiscount > 0) {
    this.finalPrice = this.basePrice * (1 - this.subscriptionDiscount / 100);
  } else {
    this.finalPrice = this.basePrice;
  }
  this.updatedAt = new Date();
  next();
});

// Method to schedule next refill
co2SubscriptionSchema.methods.scheduleNextRefill = function() {
  const lastRefill = this.lastRefillDate || this.startDate;
  this.nextRefillDate = new Date(lastRefill);
  this.nextRefillDate.setMonth(this.nextRefillDate.getMonth() + this.frequency);
  return this.save();
};

// Method to pause subscription
co2SubscriptionSchema.methods.pause = function() {
  this.status = 'paused';
  return this.save();
};

// Method to resume subscription
co2SubscriptionSchema.methods.resume = function() {
  this.status = 'active';
  return this.save();
};

// Method to cancel subscription
co2SubscriptionSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.isAutoRenew = false;
  return this.save();
};

// Method to add refill to history
co2SubscriptionSchema.methods.addRefillToHistory = function(quantity, status, notes) {
  this.refillHistory.push({
    date: new Date(),
    quantity,
    status,
    notes
  });
  this.lastRefillDate = new Date();
  return this.save();
};

module.exports = mongoose.model('CO2Subscription', co2SubscriptionSchema);
