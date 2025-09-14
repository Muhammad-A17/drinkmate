const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Reference to the chat this message belongs to
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  
  // Sender of the message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Message content
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Message type
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'auto_reply'],
    default: 'text'
  },
  
  // File attachments (if any)
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Whether this is a system message
  isSystem: {
    type: Boolean,
    default: false
  },
  
  // Whether this message is from admin
  isFromAdmin: {
    type: Boolean,
    default: false
  },
  
  // Reply to message (for threading)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  // Message metadata
  metadata: {
    // For system messages
    systemAction: {
      type: String,
      enum: ['chat_created', 'admin_assigned', 'status_changed', 'chat_closed', 'auto_reply']
    },
    
    // For auto-reply messages
    autoReplyTrigger: {
      type: String,
      enum: ['business_hours', 'offline', 'welcome', 'escalation']
    },
    
    // Original message ID for edits
    originalMessageId: mongoose.Schema.Types.ObjectId,
    
    // Edit history
    editHistory: [{
      content: String,
      editedAt: Date,
      editedBy: mongoose.Schema.Types.ObjectId
    }]
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ isSystem: 1 });
messageSchema.index({ isFromAdmin: 1 });

// Virtual for message age
messageSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for formatted time
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});

// Methods
messageSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

messageSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  return this.save();
};

messageSchema.methods.editMessage = function(newContent, editedBy) {
  // Add to edit history
  this.editHistory.push({
    content: this.content,
    editedAt: new Date(),
    editedBy: this.sender
  });
  
  // Update content
  this.content = newContent;
  this.metadata.originalMessageId = this._id;
  
  return this.save();
};

// Static methods
messageSchema.statics.getMessagesByChat = function(chatId, limit = 50, skip = 0) {
  return this.find({ chat: chatId })
    .populate('sender', 'username email firstName lastName isAdmin', null, { 
      transform: function(doc) {
        // Ensure addresses is always an array to prevent virtual field errors
        if (!doc.addresses) {
          doc.addresses = [];
        }
        return doc;
      }
    })
    .populate('replyTo', 'content sender')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

messageSchema.statics.getUnreadMessages = function(chatId, userId) {
  return this.find({
    chat: chatId,
    sender: { $ne: userId },
    status: { $ne: 'read' }
  }).populate('sender', 'username email firstName lastName isAdmin');
};

messageSchema.statics.markAllAsRead = function(chatId, userId) {
  return this.updateMany({
    chat: chatId,
    sender: { $ne: userId },
    status: { $ne: 'read' }
  }, {
    status: 'read'
  });
};

messageSchema.statics.getSystemMessages = function(chatId) {
  return this.find({
    chat: chatId,
    isSystem: true
  }).sort({ createdAt: 1 });
};

// Pre-save middleware
messageSchema.pre('save', function(next) {
  // Set isFromAdmin based on sender
  if (this.sender && this.sender.isAdmin) {
    this.isFromAdmin = true;
  }
  
  next();
});

module.exports = mongoose.model('Message', messageSchema);
