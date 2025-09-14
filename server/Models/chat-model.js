const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  // Customer who initiated the chat
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Admin assigned to handle the chat
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Chat status
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Category of the inquiry
  category: {
    type: String,
    enum: ['general', 'order', 'product', 'technical', 'billing', 'refund', 'other'],
    default: 'general'
  },
  
  // Subject/title of the chat
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  // Last message timestamp
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  
  // Customer's last seen timestamp
  customerLastSeen: {
    type: Date,
    default: Date.now
  },
  
  // Admin's last seen timestamp
  adminLastSeen: {
    type: Date,
    default: null
  },
  
  // Resolution notes (for admin)
  resolutionNotes: {
    type: String,
    maxlength: 1000
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    maxlength: 50
  }],
  
  // Chat metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      enum: ['website', 'mobile', 'api'],
      default: 'website'
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatSchema.index({ customer: 1, status: 1 });
chatSchema.index({ admin: 1, status: 1 });
chatSchema.index({ status: 1, createdAt: -1 });
chatSchema.index({ priority: 1, createdAt: -1 });
chatSchema.index({ category: 1, status: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Virtual for unread message count
chatSchema.virtual('unreadCount').get(function() {
  // This will be calculated in the service layer
  return 0;
});

// Virtual for chat duration
chatSchema.virtual('duration').get(function() {
  if (this.status === 'closed' || this.status === 'resolved') {
    return this.updatedAt - this.createdAt;
  }
  return Date.now() - this.createdAt;
});

// Methods
chatSchema.methods.assignAdmin = function(adminId) {
  this.admin = adminId;
  this.status = 'in_progress';
  return this.save();
};

chatSchema.methods.closeChat = function(adminId, notes = '') {
  this.status = 'closed';
  this.resolutionNotes = notes;
  this.admin = adminId;
  return this.save();
};

chatSchema.methods.updateLastMessage = function() {
  this.lastMessageAt = new Date();
  return this.save();
};

chatSchema.methods.updateCustomerSeen = function() {
  this.customerLastSeen = new Date();
  return this.save();
};

chatSchema.methods.updateAdminSeen = function() {
  this.adminLastSeen = new Date();
  return this.save();
};

// Static methods
chatSchema.statics.getOpenChats = function() {
  return this.find({ status: { $in: ['open', 'in_progress'] } })
    .populate('customer', 'username email firstName lastName')
    .populate('admin', 'username email firstName lastName')
    .sort({ lastMessageAt: -1 });
};

chatSchema.statics.getChatsByAdmin = function(adminId) {
  return this.find({ admin: adminId })
    .populate('customer', 'username email firstName lastName')
    .sort({ lastMessageAt: -1 });
};

chatSchema.statics.getChatsByCustomer = function(customerId) {
  return this.find({ customer: customerId })
    .populate('admin', 'username email firstName lastName')
    .sort({ lastMessageAt: -1 });
};

module.exports = mongoose.model('Chat', chatSchema);
