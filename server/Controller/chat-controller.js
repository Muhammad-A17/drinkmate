const Chat = require('../Models/chat-model');
const User = require('../Models/user-model');
const ticketGenerator = require('../Utils/ticket-generator');

// Get all chats for admin dashboard
const getAllChats = async (req, res) => {
  try {
    const { status, assignedTo, category, priority, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    
    const chats = await Chat.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('customer.userId', 'firstName lastName email')
      .populate('messages.senderId', 'firstName lastName email')
      .sort({ lastMessageAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Fix customer names for existing chats with "undefined undefined"
    chats.forEach(chat => {
      if (chat.customer.name === 'undefined undefined' && chat.customer.userId) {
        const firstName = chat.customer.userId.firstName || '';
        const lastName = chat.customer.userId.lastName || '';
        chat.customer.name = `${firstName} ${lastName}`.trim() || chat.customer.userId.username || chat.customer.userId.fullName || 'Unknown Customer';
      }
    });
    
    const total = await Chat.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        chats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
};

// Get customer's own chat sessions
const getCustomerChats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const chats = await Chat.find({ 'customer.userId': userId })
      .populate('assignedTo', 'firstName lastName email')
      .sort({ lastMessageAt: -1 });
    
    res.json({
      success: true,
      data: {
        chats
      }
    });
  } catch (error) {
    console.error('Error fetching customer chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat sessions',
      error: error.message
    });
  }
};

// Get a specific chat with messages
const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const chat = await Chat.findById(id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('customer.userId', 'firstName lastName email')
      .populate('messages.senderId', 'firstName lastName email');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: error.message
    });
  }
};

// Create a new chat session
const createChat = async (req, res) => {
  try {
    const { customer, category, orderNumber, priority = 'medium' } = req.body;
    
    // Get client IP address
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     req.headers['x-real-ip'] ||
                     'unknown';
    
    // Generate unique session ID
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const chat = new Chat({
      sessionId,
      customer,
      category,
      orderNumber,
      priority,
      status: 'active',
      customerIP: clientIP
    });
    
    await chat.save();
    
    res.status(201).json({
      success: true,
      data: chat,
      message: 'Chat session created successfully'
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: error.message
    });
  }
};

// Add a message to a chat
const addMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text', attachments = [] } = req.body;
    const senderId = req.user.id;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    await chat.addMessage('admin', senderId, content, messageType, attachments);
    
    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Assign chat to admin
const assignChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { adminId } = req.body;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    await chat.assignTo(adminId);
    
    res.json({
      success: true,
      message: 'Chat assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign chat',
      error: error.message
    });
  }
};

// Close a chat
const closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { resolutionNotes = '' } = req.body;
    const adminId = req.user.id;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    await chat.closeChat(adminId, resolutionNotes);
    
    res.json({
      success: true,
      message: 'Chat closed successfully'
    });
  } catch (error) {
    console.error('Error closing chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close chat',
      error: error.message
    });
  }
};

// Update chat status
const updateChatStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { status, priority, tags, internalNotes, initialMessage, source } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (tags) updateData.tags = tags;
    if (internalNotes) updateData.internalNotes = internalNotes;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Handle initial message from contact form
    if (initialMessage && source === 'contact_form') {
      // Add the initial message as a customer message
      chat.messages.push({
        sender: 'customer',
        senderId: null,
        content: initialMessage,
        messageType: 'text',
        timestamp: new Date()
      });
      chat.lastMessageAt = new Date();
    }
    
    // Update other fields
    Object.assign(chat, updateData);
    await chat.save();
    
    // Populate the updated chat
    const updatedChat = await Chat.findById(chatId)
      .populate('assignedTo', 'firstName lastName email')
      .populate('customer.userId', 'firstName lastName email');
    
    res.json({
      success: true,
      data: updatedChat,
      message: 'Chat updated successfully'
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat',
      error: error.message
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    await chat.markAsRead(req.user.id);
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// Get chat statistics
const getChatStats = async (req, res) => {
  try {
    const total = await Chat.countDocuments();
    const active = await Chat.countDocuments({ status: 'active' });
    const waiting = await Chat.countDocuments({ status: 'waiting' });
    const closed = await Chat.countDocuments({ status: 'closed' });
    const resolved = await Chat.countDocuments({ status: 'resolved' });
    const unassigned = await Chat.countDocuments({ assignedTo: { $exists: false } });
    
    res.json({
      success: true,
      data: {
        total,
        active,
        waiting,
        closed,
        resolved,
        unassigned
      }
    });
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat statistics',
      error: error.message
    });
  }
};

// Convert chat to ticket
const convertToTicket = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { ticketId: customTicketId, autoGenerate = true } = req.body;
    const adminId = req.user.id;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    let ticketId;
    
    if (autoGenerate) {
      // Auto-generate ticket ID based on chat category
      ticketId = await ticketGenerator.generateCategoryBasedTicketId(chat.category);
    } else if (customTicketId) {
      // Use custom ticket ID if provided
      if (!ticketGenerator.isValidTicketId(customTicketId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ticket ID format. Expected format: PREFIX-YYYYMMDD-XXXX'
        });
      }
      ticketId = customTicketId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either provide a custom ticket ID or enable auto-generation'
      });
    }
    
    // Check if ticket ID already exists
    const existingTicket = await Chat.findOne({ ticketId });
    if (existingTicket) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID already exists. Please try again or use a different ID.'
      });
    }
    
    await chat.convertToTicket(adminId, ticketId);
    
    res.json({
      success: true,
      message: 'Chat converted to ticket successfully',
      data: { 
        ticketId,
        autoGenerated: autoGenerate,
        category: chat.category
      }
    });
  } catch (error) {
    console.error('Error converting chat to ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert chat to ticket',
      error: error.message
    });
  }
};

// Ban IP address
const banIP = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { reason, expiry } = req.body;
    const adminId = req.user.id;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    if (!chat.customerIP) {
      return res.status(400).json({
        success: false,
        message: 'No IP address found for this chat'
      });
    }
    
    await chat.banIP(adminId, reason, expiry);
    
    res.json({
      success: true,
      message: 'IP address banned successfully'
    });
  } catch (error) {
    console.error('Error banning IP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ban IP address',
      error: error.message
    });
  }
};

// Unban IP address
const unbanIP = async (req, res) => {
  try {
    const { chatId } = req.params;
    const adminId = req.user.id;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    await chat.unbanIP(adminId);
    
    res.json({
      success: true,
      message: 'IP address ban lifted successfully'
    });
  } catch (error) {
    console.error('Error unbanning IP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lift IP ban',
      error: error.message
    });
  }
};

// Delete chat
const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    await Chat.findByIdAndDelete(chatId);
    
    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat',
      error: error.message
    });
  }
};

// Rate chat
const rateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { score, feedback = '' } = req.body;
    
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating score must be between 1 and 5'
      });
    }
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Rate the chat
    await chat.rateChat(score, feedback);
    
    res.json({
      success: true,
      message: 'Chat rated successfully',
      data: {
        rating: {
          score,
          feedback,
          ratedAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error rating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate chat',
      error: error.message
    });
  }
};

// Get messages for a specific chat
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId)
      .populate('messages.sender', 'firstName lastName username email isAdmin')
      .populate('assignedTo', 'firstName lastName email')
      .populate('customer.userId', 'firstName lastName email');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        chat: {
          _id: chat._id,
          subject: chat.subject,
          status: chat.status,
          priority: chat.priority,
          assignedTo: chat.assignedTo,
          customer: chat.customer,
          messages: chat.messages || [],
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat messages',
      error: error.message
    });
  }
};

module.exports = {
  getAllChats,
  getCustomerChats,
  getChatById,
  createChat,
  addMessage,
  assignChat,
  closeChat,
  updateChatStatus,
  markAsRead,
  getChatStats,
  convertToTicket,
  banIP,
  unbanIP,
  rateChat,
  deleteChat,
  getChatMessages
};