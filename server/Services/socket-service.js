const jwt = require('jsonwebtoken');
const User = require('../Models/user-model');
const Chat = require('../Models/chat-model');
const Message = require('../Models/message-model');

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.adminSockets = new Set(); // Set of admin socket IDs
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // Setup authentication middleware
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        console.log('Socket auth attempt - token:', token ? 'present' : 'missing');
        console.log('Socket auth attempt - auth object:', socket.handshake.auth);
        
        if (!token) {
          console.log('No token provided for socket connection');
          return next(new Error('Authentication error: No token provided'));
        }

        // Check if token is a demo token
        if (token.startsWith('demo_token_')) {
          console.log('Demo token detected, allowing connection');
          socket.userId = 'demo_user_123';
          socket.user = {
            _id: 'demo_user_123',
            username: 'Demo User',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            isAdmin: false
          };
          return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', decoded);
        
        const user = await User.findById(decoded.id).select('_id username email firstName lastName isAdmin');
        
        if (!user) {
          console.log('User not found for token:', decoded.id);
          return next(new Error('Authentication error: User not found'));
        }

        console.log('User found for socket connection:', user.username);
        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        console.error('Error details:', error.message);
        next(new Error('Authentication error: Invalid token format'));
      }
    });
  }

  // Setup event handlers
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.username} (${socket.userId})`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Add to admin sockets if user is admin
      if (socket.user.isAdmin) {
        this.adminSockets.add(socket.id);
        this.notifyAdminsOnline();
      }

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Handle joining chat room
      socket.on('join_chat', (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`User ${socket.user.username} joined chat ${chatId}`);
        
        // Mark messages as read when joining
        this.markMessagesAsRead(chatId, socket.userId);
      });

      // Handle leaving chat room
      socket.on('leave_chat', (chatId) => {
        socket.leave(`chat_${chatId}`);
        console.log(`User ${socket.user.username} left chat ${chatId}`);
      });

      // Handle sending message
      socket.on('send_message', async (data) => {
        try {
          const { chatId, content, type = 'text' } = data;
          
          // Verify user has access to this chat
          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit('error', { message: 'Chat not found' });
            return;
          }

          const isCustomer = chat.customer.toString() === socket.userId;
          const isAdmin = chat.admin && chat.admin.toString() === socket.userId;
          
          if (!isCustomer && !isAdmin && !socket.user.isAdmin) {
            socket.emit('error', { message: 'Access denied' });
            return;
          }

          // Create message
          const message = new Message({
            chat: chatId,
            sender: socket.userId,
            content,
            type,
            isFromAdmin: isAdmin || socket.user.isAdmin
          });

          await message.save();

          // Update chat last message time
          chat.lastMessageAt = new Date();
          await chat.save();

          // Mark messages as read for sender
          await Message.markAllAsRead(chatId, socket.userId);

          // Emit message to all users in the chat room
          this.io.to(`chat_${chatId}`).emit('new_message', {
            message: {
              _id: message._id,
              content: message.content,
              type: message.type,
              isSystem: message.isSystem,
              isFromAdmin: message.isFromAdmin,
              createdAt: message.createdAt,
              formattedTime: message.formattedTime,
              sender: {
                _id: socket.user._id,
                username: socket.user.username || socket.user.name,
                firstName: socket.user.firstName || socket.user.name,
                lastName: socket.user.lastName || '',
                name: socket.user.name || `${socket.user.firstName || ''} ${socket.user.lastName || ''}`.trim(),
                isAdmin: socket.user.isAdmin
              }
            }
          });

          // Notify admins of new message if from customer
          if (!isAdmin && !socket.user.isAdmin) {
            this.notifyAdminsNewMessage(chat, message);
          }

        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { chatId } = data;
        socket.to(`chat_${chatId}`).emit('user_typing', {
          userId: socket.userId,
          username: socket.user.username,
          isAdmin: socket.user.isAdmin
        });
      });

      socket.on('typing_stop', (data) => {
        const { chatId } = data;
        socket.to(`chat_${chatId}`).emit('user_stopped_typing', {
          userId: socket.userId
        });
      });

      // Handle chat assignment
      socket.on('assign_chat', async (data) => {
        try {
          const { chatId } = data;
          
          if (!socket.user.isAdmin) {
            socket.emit('error', { message: 'Admin access required' });
            return;
          }

          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit('error', { message: 'Chat not found' });
            return;
          }

          // Assign chat to admin
          chat.admin = socket.userId;
          chat.status = 'in_progress';
          await chat.save();

          // Create system message
          const systemMessage = new Message({
            chat: chatId,
            sender: socket.userId,
            content: 'Admin has been assigned to your chat.',
            type: 'system',
            isSystem: true,
            metadata: {
              systemAction: 'admin_assigned'
            }
          });

          await systemMessage.save();

          // Notify all users in chat
          this.io.to(`chat_${chatId}`).emit('chat_assigned', {
            chat: {
              _id: chat._id,
              admin: {
                _id: socket.user._id,
                username: socket.user.username,
                firstName: socket.user.firstName,
                lastName: socket.user.lastName
              }
            }
          });

          // Notify customer specifically
          this.io.to(`user_${chat.customer}`).emit('chat_assigned', {
            chat: {
              _id: chat._id,
              admin: {
                _id: socket.user._id,
                username: socket.user.username,
                firstName: socket.user.firstName,
                lastName: socket.user.lastName
              }
            }
          });

        } catch (error) {
          console.error('Error assigning chat:', error);
          socket.emit('error', { message: 'Failed to assign chat' });
        }
      });

      // Handle chat status updates
      socket.on('update_chat_status', async (data) => {
        try {
          const { chatId, status, resolutionNotes } = data;
          
          if (!socket.user.isAdmin) {
            socket.emit('error', { message: 'Admin access required' });
            return;
          }

          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit('error', { message: 'Chat not found' });
            return;
          }

          chat.status = status;
          if (resolutionNotes) {
            chat.resolutionNotes = resolutionNotes;
          }
          await chat.save();

          // Notify all users in chat
          this.io.to(`chat_${chatId}`).emit('chat_status_updated', {
            chat: {
              _id: chat._id,
              status: chat.status,
              resolutionNotes: chat.resolutionNotes
            }
          });

        } catch (error) {
          console.error('Error updating chat status:', error);
          socket.emit('error', { message: 'Failed to update chat status' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.username} (${socket.userId})`);
        
        // Remove user connection
        this.connectedUsers.delete(socket.userId);
        
        // Remove from admin sockets if admin
        if (socket.user.isAdmin) {
          this.adminSockets.delete(socket.id);
          this.notifyAdminsOnline();
        }
      });
    });
  }

  // Mark messages as read
  async markMessagesAsRead(chatId, userId) {
    try {
      await Message.markAllAsRead(chatId, userId);
      
      // Update last seen time
      const chat = await Chat.findById(chatId);
      if (chat.customer.toString() === userId) {
        await chat.updateCustomerSeen();
      } else if (chat.admin && chat.admin.toString() === userId) {
        await chat.updateAdminSeen();
      }

      // Notify other users in chat
      this.io.to(`chat_${chatId}`).emit('messages_read', {
        chatId,
        userId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Notify admins of new message
  notifyAdminsNewMessage(chat, message) {
    const adminNotification = {
      type: 'new_message',
      chat: {
        _id: chat._id,
        subject: chat.subject,
        status: chat.status,
        priority: chat.priority,
        category: chat.category,
        customer: {
          _id: chat.customer._id,
          username: chat.customer.username,
          firstName: chat.customer.firstName,
          lastName: chat.customer.lastName
        }
      },
      message: {
        _id: message._id,
        content: message.content,
        createdAt: message.createdAt
      }
    };

    // Send to all admin sockets
    this.adminSockets.forEach(socketId => {
      this.io.to(socketId).emit('admin_notification', adminNotification);
    });
  }

  // Notify admins about online status
  notifyAdminsOnline() {
    const onlineAdmins = this.adminSockets.size;
    this.io.emit('admins_online', { count: onlineAdmins });
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Send message to all admins
  sendToAdmins(event, data) {
    this.adminSockets.forEach(socketId => {
      this.io.to(socketId).emit(event, data);
    });
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, data);
  }
}

module.exports = SocketService;
