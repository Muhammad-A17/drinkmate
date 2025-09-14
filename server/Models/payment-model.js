const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment Identification
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Related Order
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderNumber: {
    type: String,
    required: true
  },
  
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'SAR',
    enum: ['SAR', 'USD', 'EUR']
  },
  
  // Payment Method
  method: {
    type: String,
    required: true,
    enum: ['urways', 'tap', 'cash', 'bank_transfer']
  },
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  // Gateway Information
  gateway: {
    name: {
      type: String,
      required: true,
      enum: ['urways', 'tap', 'cash', 'bank_transfer']
    },
    transactionId: String,
    referenceId: String,
    gatewayOrderId: String,
    paymentUrl: String,
    callbackUrl: String,
    returnUrl: String,
    cancelUrl: String
  },
  
  // Gateway Response
  gatewayResponse: {
    raw: mongoose.Schema.Types.Mixed,
    processed: {
      success: Boolean,
      message: String,
      code: String,
      transactionId: String,
      authCode: String,
      trackId: String,
      rrn: String,
      cardBrand: String,
      responseCode: String,
      reason: String
    }
  },
  
  // Payment Timeline
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
    gatewayData: mongoose.Schema.Types.Mixed
  }],
  
  // Refund Information
  refunds: [{
    refundId: String,
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    gatewayRefundId: String,
    processedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Security and Verification
  signature: String,
  verificationHash: String,
  ipAddress: String,
  userAgent: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  expiredAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total refunded amount
paymentSchema.virtual('totalRefunded').get(function() {
  return this.refunds
    .filter(refund => refund.status === 'completed')
    .reduce((total, refund) => total + refund.amount, 0);
});

// Virtual for remaining amount
paymentSchema.virtual('remainingAmount').get(function() {
  return this.amount - this.totalRefunded;
});

// Virtual for payment age in minutes
paymentSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60));
});

// Virtual for is expired
paymentSchema.virtual('isExpired').get(function() {
  if (this.expiredAt) {
    return new Date() > this.expiredAt;
  }
  // Default expiration: 30 minutes for pending payments
  return this.status === 'pending' && this.ageInMinutes > 30;
});

// Indexes for better performance
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ customer: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ 'gateway.transactionId': 1 });
paymentSchema.index({ createdAt: -1 });

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate payment ID if not provided
  if (!this.paymentId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    this.paymentId = `PAY${timestamp}${random}`;
  }
  
  // Set expiration time for pending payments
  if (this.status === 'pending' && !this.expiredAt) {
    this.expiredAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  next();
});

// Method to add timeline entry
paymentSchema.methods.addTimelineEntry = function(status, description, gatewayData = null) {
  this.timeline.push({
    status,
    description,
    timestamp: new Date(),
    gatewayData
  });
  return this.save();
};

// Method to update status
paymentSchema.methods.updateStatus = function(newStatus, description, gatewayData = null) {
  this.status = newStatus;
  this.addTimelineEntry(newStatus, description, gatewayData);
  
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Method to process gateway response
paymentSchema.methods.processGatewayResponse = function(gatewayResponse) {
  this.gatewayResponse.raw = gatewayResponse;
  
  // Process common gateway response fields
  this.gatewayResponse.processed = {
    success: gatewayResponse.result === 'Successful' || gatewayResponse.success === true,
    message: gatewayResponse.reason || gatewayResponse.message || '',
    code: gatewayResponse.responseCode || gatewayResponse.code || '',
    transactionId: gatewayResponse.tranid || gatewayResponse.transactionId || '',
    authCode: gatewayResponse.authCode || '',
    trackId: gatewayResponse.trackid || gatewayResponse.trackId || '',
    rrn: gatewayResponse.rrn || '',
    cardBrand: gatewayResponse.cardBrand || '',
    responseCode: gatewayResponse.responseCode || '',
    reason: gatewayResponse.reason || ''
  };
  
  // Update payment status based on response
  if (this.gatewayResponse.processed.success) {
    this.updateStatus('completed', 'Payment completed successfully', gatewayResponse);
  } else {
    this.updateStatus('failed', this.gatewayResponse.processed.message, gatewayResponse);
  }
  
  return this.save();
};

// Method to create refund
paymentSchema.methods.createRefund = function(amount, reason, gatewayRefundId = null) {
  if (amount > this.remainingAmount) {
    throw new Error('Refund amount exceeds remaining amount');
  }
  
  const refund = {
    refundId: `REF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    amount,
    reason,
    gatewayRefundId,
    status: 'pending'
  };
  
  this.refunds.push(refund);
  
  // Update payment status
  const totalRefunded = this.totalRefunded + amount;
  if (totalRefunded >= this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }
  
  this.addTimelineEntry('refund_created', `Refund created: ${amount} ${this.currency}`, { refundId: refund.refundId });
  
  return this.save();
};

// Method to update refund status
paymentSchema.methods.updateRefundStatus = function(refundId, newStatus, gatewayRefundId = null) {
  const refund = this.refunds.find(r => r.refundId === refundId);
  if (!refund) {
    throw new Error('Refund not found');
  }
  
  refund.status = newStatus;
  if (gatewayRefundId) {
    refund.gatewayRefundId = gatewayRefundId;
  }
  if (newStatus === 'completed') {
    refund.processedAt = new Date();
  }
  
  this.addTimelineEntry('refund_updated', `Refund ${refundId} status updated to ${newStatus}`);
  
  return this.save();
};

// Method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function() {
  return this.status === 'completed' && this.remainingAmount > 0;
};

// Method to check if payment is successful
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'completed';
};

// Method to check if payment is pending
paymentSchema.methods.isPending = function() {
  return ['pending', 'processing'].includes(this.status);
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = function(startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        successfulAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        pendingPayments: {
          $sum: { $cond: [{ $in: ['$status', ['pending', 'processing']] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get payments by method
paymentSchema.statics.getPaymentsByMethod = function(startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        successfulCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);
