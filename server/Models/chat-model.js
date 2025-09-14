const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  // Chat session identification
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Customer information
  customer: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Can be anonymous
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: false
    }
  },
  
  // Chat status
  status: {
    type: String,
    enum: ['active', 'waiting', 'closed', 'resolved'],
    default: 'active'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Category/topic
  category: {
    type: String,
    enum: ['general', 'order', 'technical', 'billing', 'refund', 'other'],
    default: 'general'
  },
  
  // Order reference (if applicable)
  orderNumber: {
    type: String,
    required: false
  },
  
  // Assigned admin
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // Messages in this chat
  messages: [{
    sender: {
      type: String,
      enum: ['customer', 'admin', 'system'],
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    content: {
      type: String,
      required: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    attachments: [{
      name: String,
      url: String,
      type: String,
      size: Number
    }],
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Chat metadata
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  
  // Resolution information
  resolution: {
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionNotes: String
  },
  
  // Tags for categorization
  tags: [String],
  
  // Notes for internal use
  internalNotes: String,
  
  // IP tracking for ban functionality
  customerIP: {
    type: String,
    required: false
  },
  
  // Ticket conversion
  ticketId: {
    type: String,
    required: false
  },
  
  // Ban status
  isBanned: {
    type: Boolean,
    default: false
  },
  
  // Ban reason
  banReason: {
    type: String,
    required: false
  },
  
  // Ban details
  banDetails: {
    bannedAt: Date,
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    banReason: String,
    banExpiry: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
chatSchema.index({ sessionId: 1 });
chatSchema.index({ 'customer.email': 1 });
chatSchema.index({ status: 1, lastMessageAt: -1 });
chatSchema.index({ assignedTo: 1, status: 1 });
chatSchema.index({ category: 1, status: 1 });
chatSchema.index({ priority: 1, status: 1 });

// Virtual for unread message count
chatSchema.virtual('unreadCount').get(function() {
  return this.messages.filter(msg => !msg.isRead && msg.sender === 'customer').length;
});

// Virtual for last message preview
chatSchema.virtual('lastMessage').get(function() {
  if (this.messages.length === 0) return null;
  const lastMsg = this.messages[this.messages.length - 1];
  return {
    content: lastMsg.content.substring(0, 100) + (lastMsg.content.length > 100 ? '...' : ''),
    sender: lastMsg.sender,
    timestamp: lastMsg.timestamp
  };
});

// Method to add a message
chatSchema.methods.addMessage = function(sender, senderId, content, messageType = 'text', attachments = []) {
  this.messages.push({
    sender,
    senderId,
    content,
    messageType,
    attachments,
    timestamp: new Date()
  });
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(adminId) {
  this.messages.forEach(msg => {
    if (msg.sender === 'customer') {
      msg.isRead = true;
    }
  });
  return this.save();
};

// Method to assign to admin
chatSchema.methods.assignTo = function(adminId) {
  this.assignedTo = adminId;
  this.messages.push({
    sender: 'system',
    senderId: null,
    content: `Chat assigned to admin`,
    messageType: 'system',
    timestamp: new Date()
  });
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to close chat
chatSchema.methods.closeChat = function(adminId, notes = '') {
  this.status = 'closed';
  this.resolution = {
    resolvedAt: new Date(),
    resolvedBy: adminId,
    resolutionNotes: notes
  };
  this.messages.push({
    sender: 'system',
    senderId: null,
    content: `Chat closed by admin`,
    messageType: 'system',
    timestamp: new Date()
  });
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to convert chat to ticket
chatSchema.methods.convertToTicket = function(adminId, ticketId) {
  this.ticketId = ticketId;
  this.status = 'resolved';
  this.messages.push({
    sender: 'system',
    senderId: null,
    content: `Chat converted to ticket #${ticketId}`,
    messageType: 'system',
    timestamp: new Date()
  });
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to ban IP address
chatSchema.methods.banIP = function(adminId, reason, expiry = null) {
  this.isBanned = true;
  this.banDetails = {
    bannedAt: new Date(),
    bannedBy: adminId,
    banReason: reason,
    banExpiry: expiry
  };
  this.messages.push({
    sender: 'system',
    senderId: null,
    content: `IP address banned: ${reason}`,
    messageType: 'system',
    timestamp: new Date()
  });
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to unban IP address
chatSchema.methods.unbanIP = function(adminId) {
  this.isBanned = false;
  this.banDetails = null;
  this.messages.push({
    sender: 'system',
    senderId: null,
    content: `IP address ban lifted`,
    messageType: 'system',
    timestamp: new Date()
  });
  this.lastMessageAt = new Date();
  return this.save();
};

// Static method to get active chats
chatSchema.statics.getActiveChats = function() {
  return this.find({ status: { $in: ['active', 'waiting'] } })
    .populate('assignedTo', 'firstName lastName email')
    .populate('customer.userId', 'firstName lastName email')
    .sort({ lastMessageAt: -1 });
};

// Static method to get chat statistics
chatSchema.statics.getChatStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Chat', chatSchema);