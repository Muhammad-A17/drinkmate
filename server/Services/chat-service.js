const Chat = require('../Models/chat-model');
const Message = require('../Models/message-model');
const User = require('../Models/user-model');

class ChatService {
  // Check if chat is within business hours (9 AM - 12 AM Saudi time) - Extended for testing
  static isWithinBusinessHours() {
    const now = new Date();
    const saudiTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Riyadh"}));
    const hour = saudiTime.getHours();
    
    return hour >= 9 && hour < 24; // 9 AM to 12 AM (midnight)
  }

  // Get business hours message
  static getBusinessHoursMessage() {
    const now = new Date();
    const saudiTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Riyadh"}));
    const hour = saudiTime.getHours();
    
    if (hour < 9) {
      return "Our live chat is available from 9:00 AM to 12:00 AM Saudi time. Please come back at 9:00 AM.";
    } else if (hour >= 24) {
      return "Our live chat is available from 9:00 AM to 12:00 AM Saudi time. Please come back tomorrow at 9:00 AM.";
    }
    
    return null; // Within business hours
  }

  // Create a new chat
  static async createChat(customerId, subject, category = 'general', priority = 'medium') {
    try {
      // Check if customer already has an open chat
      const existingChat = await Chat.findOne({
        customer: customerId,
        status: { $in: ['open', 'in_progress'] }
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
        status: 'open'
      });

      await chat.save();

      // Create welcome message
      const welcomeMessage = new Message({
        chat: chat._id,
        sender: customerId,
        content: `Hello! I need help with: ${subject}`,
        type: 'text',
        isSystem: false
      });

      await welcomeMessage.save();

      // Create system message
      const systemMessage = new Message({
        chat: chat._id,
        sender: customerId,
        content: 'Chat created. Our team will respond shortly.',
        type: 'system',
        isSystem: true,
        metadata: {
          systemAction: 'chat_created'
        }
      });

      await systemMessage.save();

      // Update chat with last message
      await chat.updateLastMessage();

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

      chat.admin = adminId;
      chat.status = 'in_progress';
      await chat.save();

      // Create system message
      const systemMessage = new Message({
        chat: chatId,
        sender: adminId,
        content: 'Admin has been assigned to your chat.',
        type: 'system',
        isSystem: true,
        metadata: {
          systemAction: 'admin_assigned'
        }
      });

      await systemMessage.save();

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

      const message = new Message({
        chat: chatId,
        sender: senderId,
        content,
        type,
        attachments,
        isFromAdmin: isAdmin
      });

      await message.save();

      // Update chat last message time
      await chat.updateLastMessage();

      // Mark messages as read for the sender
      await Message.markAllAsRead(chatId, senderId);

      return {
        success: true,
        message: 'Message sent successfully',
        messageData: await Message.findById(message._id)
          .populate('sender', 'username email firstName lastName isAdmin')
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
      const messages = await Message.getMessagesByChat(chatId, limit, skip);
      
      // Ensure messages is an array before calling reverse
      if (!Array.isArray(messages)) {
        console.error('Messages is not an array:', messages);
        return {
          success: false,
          message: 'Failed to get messages - invalid data format',
          error: 'Messages data is not an array'
        };
      }
      
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
      await Message.markAllAsRead(chatId, userId);
      
      // Update last seen time
      const chat = await Chat.findById(chatId);
      if (chat.customer.toString() === userId.toString()) {
        await chat.updateCustomerSeen();
      } else if (chat.admin && chat.admin.toString() === userId.toString()) {
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

      // Create system message
      const systemMessage = new Message({
        chat: chatId,
        sender: adminId,
        content: 'Chat has been closed.',
        type: 'system',
        isSystem: true,
        metadata: {
          systemAction: 'chat_closed'
        }
      });

      await systemMessage.save();

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
      const openChats = await Chat.countDocuments({ status: 'open' });
      const inProgressChats = await Chat.countDocuments({ status: 'in_progress' });
      const resolvedChats = await Chat.countDocuments({ status: 'resolved' });
      const closedChats = await Chat.countDocuments({ status: 'closed' });

      return {
        success: true,
        stats: {
          total: totalChats,
          open: openChats,
          inProgress: inProgressChats,
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
