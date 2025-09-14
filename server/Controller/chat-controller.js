const ChatService = require('../Services/chat-service');
const authMiddleware = require('../Middleware/auth-middleware');
const adminMiddleware = require('../Middleware/admin-middleware');

class ChatController {
  // Create a new chat
  static async createChat(req, res) {
    try {
      const { subject, category, priority } = req.body;
      const customerId = req.user.id;

      // Check business hours
      if (!ChatService.isWithinBusinessHours()) {
        const businessHoursMessage = ChatService.getBusinessHoursMessage();
        return res.status(200).json({
          success: false,
          message: businessHoursMessage,
          isBusinessHours: false
        });
      }

      const result = await ChatService.createChat(customerId, subject, category, priority);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in createChat:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get customer's chats
  static async getCustomerChats(req, res) {
    try {
      const customerId = req.user.id;
      const chats = await ChatService.getCustomerChats(customerId);
      
      res.status(200).json({
        success: true,
        chats
      });
    } catch (error) {
      console.error('Error in getCustomerChats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get admin's chats
  static async getAdminChats(req, res) {
    try {
      const adminId = req.user.id;
      const chats = await ChatService.getAdminChats(adminId);
      
      res.status(200).json({
        success: true,
        chats
      });
    } catch (error) {
      console.error('Error in getAdminChats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get all open chats (admin only)
  static async getOpenChats(req, res) {
    try {
      const chats = await ChatService.getOpenChats();
      
      res.status(200).json({
        success: true,
        chats
      });
    } catch (error) {
      console.error('Error in getOpenChats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get chat by ID
  static async getChatById(req, res) {
    try {
      const { chatId } = req.params;
      const chat = await ChatService.getChatById(chatId);
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      // Check if user has access to this chat
      const userId = req.user.id;
      const isCustomer = chat.customer._id.toString() === userId.toString();
      const isAdmin = chat.admin && chat.admin._id.toString() === userId.toString();
      
      if (!isCustomer && !isAdmin && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.status(200).json({
        success: true,
        chat
      });
    } catch (error) {
      console.error('Error in getChatById:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Assign chat to admin
  static async assignChatToAdmin(req, res) {
    try {
      const { chatId } = req.params;
      const adminId = req.user.id;

      const result = await ChatService.assignChatToAdmin(chatId, adminId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in assignChatToAdmin:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Send message
  static async sendMessage(req, res) {
    try {
      const { chatId } = req.params;
      const { content, type, attachments } = req.body;
      const senderId = req.user.id;

      const result = await ChatService.sendMessage(chatId, senderId, content, type, attachments);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get chat messages
  static async getChatMessages(req, res) {
    try {
      const { chatId } = req.params;
      const { limit = 50, skip = 0 } = req.query;

      const result = await ChatService.getChatMessages(chatId, parseInt(limit), parseInt(skip));
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getChatMessages:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      const result = await ChatService.markMessagesAsRead(chatId, userId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Close chat
  static async closeChat(req, res) {
    try {
      const { chatId } = req.params;
      const { resolutionNotes } = req.body;
      const adminId = req.user.id;

      const result = await ChatService.closeChat(chatId, adminId, resolutionNotes);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in closeChat:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get chat statistics
  static async getChatStats(req, res) {
    try {
      const result = await ChatService.getChatStats();
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getChatStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Check business hours
  static async checkBusinessHours(req, res) {
    try {
      const isWithinHours = ChatService.isWithinBusinessHours();
      const message = isWithinHours ? null : ChatService.getBusinessHoursMessage();
      
      res.status(200).json({
        success: true,
        isBusinessHours: isWithinHours,
        message
      });
    } catch (error) {
      console.error('Error in checkBusinessHours:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = {
  createChat: ChatController.createChat,
  getCustomerChats: ChatController.getCustomerChats,
  getAdminChats: ChatController.getAdminChats,
  getOpenChats: ChatController.getOpenChats,
  getChatById: ChatController.getChatById,
  assignChatToAdmin: ChatController.assignChatToAdmin,
  sendMessage: ChatController.sendMessage,
  getChatMessages: ChatController.getChatMessages,
  markMessagesAsRead: ChatController.markMessagesAsRead,
  closeChat: ChatController.closeChat,
  getChatStats: ChatController.getChatStats,
  checkBusinessHours: ChatController.checkBusinessHours
};
