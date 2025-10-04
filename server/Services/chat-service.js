const Chat = require('../Models/chat-model');
const User = require('../Models/user-model');

class ChatService {
  // Check if chat is within business hours (configurable via environment variables)
  static isWithinBusinessHours() {
    const now = new Date();
    const timezone = process.env.CHAT_TIMEZONE || 'Asia/Riyadh';
    const businessStart = parseInt(process.env.CHAT_BUSINESS_HOURS_START) || 9;
    const businessEnd = parseInt(process.env.CHAT_BUSINESS_HOURS_END) || 24;
    
    const localTime = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
    const hour = localTime.getHours();
    
    return hour >= businessStart && hour < businessEnd;
  }

  // Get business hours message
  static getBusinessHoursMessage() {
    const now = new Date();
    const timezone = process.env.CHAT_TIMEZONE || 'Asia/Riyadh';
    const businessStart = parseInt(process.env.CHAT_BUSINESS_HOURS_START) || 9;
    const businessEnd = parseInt(process.env.CHAT_BUSINESS_HOURS_END) || 24;
    
    const localTime = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
    const hour = localTime.getHours();
    
    if (hour < businessStart) {
      const startTime = businessStart === 0 ? '12 AM' : businessStart < 12 ? `${businessStart} AM` : businessStart === 12 ? '12 PM' : `${businessStart - 12} PM`;
      return `Our live chat is available from ${startTime} to ${businessEnd === 0 ? '12 AM' : businessEnd < 12 ? `${businessEnd} AM` : businessEnd === 12 ? '12 PM' : `${businessEnd - 12} PM`} (${timezone}). Please come back at ${startTime}.`;
    } else if (hour >= businessEnd) {
      const startTime = businessStart === 0 ? '12 AM' : businessStart < 12 ? `${businessStart} AM` : businessStart === 12 ? '12 PM' : `${businessStart - 12} PM`;
      return `Our live chat is available from ${startTime} to ${businessEnd === 0 ? '12 AM' : businessEnd < 12 ? `${businessEnd} AM` : businessEnd === 12 ? '12 PM' : `${businessEnd - 12} PM`} (${timezone}). Please come back tomorrow at ${startTime}.`;
    }
    
    return null; // Within business hours
  }

  // Create a new chat
  static async createChat(customerId, subject, category = 'general', priority = 'medium') {
    try {
      // Check if customer already has an open chat
      const existingChat = await Chat.findOne({
        customer: customerId,
        status: { $in: ['active', 'waiting'] }
      });

      if (existingChat) {
        return {
          success: false,
          message: 'You already have an open chat. Please continue with your existing conversation.',
          chatId: existingChat._id
        };
      }

      const chat = new Chat({
        customer: customerId,
        subject,
        category,
        priority,
        status: 'active'
      });

      // Add initial messages to the chat
      await chat.addMessage('customer', customerId, `Hello! I need help with: ${subject}`, 'text', []);
      await chat.addMessage('system', null, 'Chat created. Our team will respond shortly.', 'system', []);

      await chat.save();

      return {
        success: true,
        message: 'Chat created successfully',
        chat: await this.getChatById(chat._id)
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      return {
        success: false,
        message: 'Failed to create chat',
        error: error.message
      };
    }
  }

  // Get chat by ID
  static async getChatById(chatId) {
    return await Chat.findById(chatId)
      .populate('customer', 'username email firstName lastName')
      .populate('admin', 'username email firstName lastName');
  }

  // Get customer's chats
  static async getCustomerChats(customerId) {
    return await Chat.find({ customer: customerId })
      .populate('admin', 'username email firstName lastName')
      .sort({ lastMessageAt: -1 });
  }

  // Get admin's assigned chats
  static async getAdminChats(adminId) {
    return await Chat.find({ admin: adminId })
      .populate('customer', 'username email firstName lastName')
      .sort({ lastMessageAt: -1 });
  }

  // Get all open chats for admin dashboard
  static async getOpenChats() {
    return await Chat.getOpenChats();
  }

  // Assign chat to admin
  static async assignChatToAdmin(chatId, adminId) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return { success: false, message: 'Chat not found' };
      }

      chat.assignedTo = adminId;
      chat.status = 'active';
      // Add system message about assignment
      await chat.addMessage('system', null, 'Admin has been assigned to your chat.', 'system', []);
      
      await chat.save();

      return {
        success: true,
        message: 'Chat assigned successfully',
        chat: await this.getChatById(chatId)
      };
    } catch (error) {
      console.error('Error assigning chat:', error);
      return {
        success: false,
        message: 'Failed to assign chat',
        error: error.message
      };
    }
  }

  // Send message
  static async sendMessage(chatId, senderId, content, type = 'text', attachments = []) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return { success: false, message: 'Chat not found' };
      }

      // Check if sender is part of this chat
      const isCustomer = chat.customer.toString() === senderId.toString();
      const isAdmin = chat.admin && chat.admin.toString() === senderId.toString();
      
      if (!isCustomer && !isAdmin) {
        return { success: false, message: 'Unauthorized to send message to this chat' };
      }

      // Add message to chat using the chat's addMessage method
      await chat.addMessage(isAdmin ? 'admin' : 'customer', senderId, content, type, attachments);

      // Mark messages as read for the sender
      await chat.markAsRead(senderId);

      return {
        success: true,
        message: 'Message sent successfully',
        messageData: chat.messages[chat.messages.length - 1]
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        message: 'Failed to send message',
        error: error.message
      };
    }
  }

  // Get messages for a chat
  static async getChatMessages(chatId, limit = 50, skip = 0) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return {
          success: false,
          message: 'Chat not found',
          error: 'Chat not found'
        };
      }
      
      // Get messages from the chat's embedded messages array
      const messages = chat.messages.slice(skip, skip + limit);
      
      return {
        success: true,
        messages: messages.reverse() // Show oldest first
      };
    } catch (error) {
      console.error('Error getting messages:', error);
      return {
        success: false,
        message: 'Failed to get messages',
        error: error.message
      };
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(chatId, userId) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return { success: false, message: 'Chat not found' };
      }
      
      await chat.markAsRead(userId);
      
      // Update last seen time
      if (chat.customer.userId && chat.customer.userId.toString() === userId.toString()) {
        await chat.updateCustomerSeen();
      } else if (chat.assignedTo && chat.assignedTo.toString() === userId.toString()) {
        await chat.updateAdminSeen();
      }

      return { success: true, message: 'Messages marked as read' };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return {
        success: false,
        message: 'Failed to mark messages as read',
        error: error.message
      };
    }
  }

  // Close chat
  static async closeChat(chatId, adminId, resolutionNotes = '') {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return { success: false, message: 'Chat not found' };
      }

      await chat.closeChat(adminId, resolutionNotes);

      return {
        success: true,
        message: 'Chat closed successfully',
        chat: await this.getChatById(chatId)
      };
    } catch (error) {
      console.error('Error closing chat:', error);
      return {
        success: false,
        message: 'Failed to close chat',
        error: error.message
      };
    }
  }

  // Get chat statistics
  static async getChatStats() {
    try {
      const totalChats = await Chat.countDocuments();
      const activeChats = await Chat.countDocuments({ status: 'active' });
      const waitingChats = await Chat.countDocuments({ status: 'waiting' });
      const resolvedChats = await Chat.countDocuments({ status: 'resolved' });
      const closedChats = await Chat.countDocuments({ status: 'closed' });

      return {
        success: true,
        stats: {
          total: totalChats,
          active: activeChats,
          waiting: waitingChats,
          resolved: resolvedChats,
          closed: closedChats
        }
      };
    } catch (error) {
      console.error('Error getting chat stats:', error);
      return {
        success: false,
        message: 'Failed to get chat statistics',
        error: error.message
      };
    }
  }
}

module.exports = {
  isWithinBusinessHours: ChatService.isWithinBusinessHours,
  getBusinessHoursMessage: ChatService.getBusinessHoursMessage,
  createChat: ChatService.createChat,
  getChatById: ChatService.getChatById,
  getCustomerChats: ChatService.getCustomerChats,
  getAdminChats: ChatService.getAdminChats,
  getOpenChats: ChatService.getOpenChats,
  assignChatToAdmin: ChatService.assignChatToAdmin,
  sendMessage: ChatService.sendMessage,
  getChatMessages: ChatService.getChatMessages,
  markMessagesAsRead: ChatService.markMessagesAsRead,
  closeChat: ChatService.closeChat,
  getChatStats: ChatService.getChatStats
};
