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
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
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
  
  // Last seen timestamps
  customerLastSeen: {
    type: Date,
    default: Date.now
  },
  adminLastSeen: {
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
  },

  // Chat rating
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    feedback: {
      type: String,
      required: false
    },
    ratedAt: {
      type: Date,
      required: false
    }
  },

  // SLA tracking
  sla: {
    firstResponseAt: Date,
    firstResponseTime: Number, // in minutes
    resolutionAt: Date,
    resolutionTime: Number, // in minutes
    firstResponseTarget: {
      type: Number,
      default: 30 // 30 minutes
    },
    resolutionTarget: {
      type: Number,
      default: 240 // 4 hours
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
// sessionId index removed - already has unique: true which creates an index
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

// Method to update customer last seen time
chatSchema.methods.updateCustomerSeen = function() {
  this.customerLastSeen = new Date();
  return this.save();
};

// Method to update admin last seen time
chatSchema.methods.updateAdminSeen = function() {
  this.adminLastSeen = new Date();
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

// Method to rate chat
chatSchema.methods.rateChat = function(score, feedback = '') {
  this.rating = {
    score: score,
    feedback: feedback,
    ratedAt: new Date()
  };
  this.messages.push({
    sender: 'system',
    senderId: null,
    content: `Chat rated ${score}/5 stars`,
    messageType: 'system',
    timestamp: new Date()
  });
  this.lastMessageAt = new Date();
  return this.save();
};

// Method for customer to close and rate chat
chatSchema.methods.customerCloseAndRate = function(score, feedback = '') {
  this.status = 'closed';
  this.rating = {
    score: score,
    feedback: feedback,
    ratedAt: new Date()
  };
  this.resolution = {
    resolvedAt: new Date(),
    resolvedBy: null, // Customer closure
    resolutionNotes: 'Closed by customer'
  };
  this.messages.push({
    sender: 'system',
    senderId: null,
    content: `Chat closed by customer with rating: ${score}/5 stars${feedback ? ` - ${feedback}` : ''}`,
    messageType: 'system',
    timestamp: new Date()
  });
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to track first response
chatSchema.methods.trackFirstResponse = function() {
  if (!this.sla.firstResponseAt) {
    this.sla.firstResponseAt = new Date();
    const createdAt = new Date(this.createdAt);
    this.sla.firstResponseTime = Math.round((this.sla.firstResponseAt - createdAt) / (1000 * 60));
  }
  return this.save();
};

// Method to track resolution
chatSchema.methods.trackResolution = function() {
  if (!this.sla.resolutionAt) {
    this.sla.resolutionAt = new Date();
    const createdAt = new Date(this.createdAt);
    this.sla.resolutionTime = Math.round((this.sla.resolutionAt - createdAt) / (1000 * 60));
  }
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

// Method to check if chat session has expired (4 hours)
chatSchema.methods.isSessionExpired = function() {
  const now = new Date();
  const lastActivity = this.lastMessageAt || this.createdAt;
  const fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000)); // 4 hours in milliseconds
  
  return lastActivity < fourHoursAgo;
};

// Method to close expired session
chatSchema.methods.closeExpiredSession = function() {
  if (this.isSessionExpired() && this.status !== 'closed') {
    this.status = 'closed';
    this.resolution = {
      resolvedAt: new Date(),
      resolvedBy: null, // System closure
      resolutionNotes: 'Session expired after 4 hours of inactivity'
    };
    this.messages.push({
      sender: 'system',
      senderId: null,
      content: 'Chat session expired after 4 hours of inactivity and has been automatically closed',
      messageType: 'system',
      timestamp: new Date()
    });
    this.lastMessageAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to close all expired sessions
chatSchema.statics.closeExpiredSessions = async function() {
  try {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000));
    
    // Find all active chats that haven't had activity in the last 4 hours
    const expiredChats = await this.find({
      status: { $in: ['active', 'waiting'] },
      lastMessageAt: { $lt: fourHoursAgo }
    });
    
    console.log(`Found ${expiredChats.length} expired chat sessions to close`);
    
    // Close each expired session
    const closePromises = expiredChats.map(chat => chat.closeExpiredSession());
    const results = await Promise.all(closePromises);
    
    console.log(`Successfully closed ${results.length} expired chat sessions`);
    return results;
  } catch (error) {
    console.error('Error closing expired sessions:', error);
    throw error;
  }
};

// Static method to get session timeout info
chatSchema.statics.getSessionTimeoutInfo = function(chatId) {
  return this.findById(chatId).then(chat => {
    if (!chat) return null;
    
    const now = new Date();
    const lastActivity = chat.lastMessageAt || chat.createdAt;
    const timeUntilExpiry = (4 * 60 * 60 * 1000) - (now.getTime() - lastActivity.getTime());
    
    return {
      chatId: chat._id,
      lastActivity: lastActivity,
      timeUntilExpiry: Math.max(0, timeUntilExpiry),
      isExpired: chat.isSessionExpired(),
      expiresAt: new Date(lastActivity.getTime() + (4 * 60 * 60 * 1000))
    };
  });
};

module.exports = mongoose.model('Chat', chatSchema);