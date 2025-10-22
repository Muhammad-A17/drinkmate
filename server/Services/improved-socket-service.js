const jwt = require('jsonwebtoken');
const User = require('../Models/user-model');
const Chat = require('../Models/chat-model');

class ImprovedSocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.adminSockets = new Set(); // Set of admin socket IDs
    this.userSockets = new Map(); // userId -> Set of socketIds
    this.connectionAttempts = new Map(); // Track connection attempts
    this.maxConnectionAttempts = 5;
    this.connectionTimeout = 30000; // 30 seconds
    
    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupConnectionMonitoring();
  }

  // Setup authentication middleware with improved error handling
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        console.log('🔌 Socket connection attempt from:', socket.handshake.address);
        console.log('🔌 Token present:', !!token);
        
        if (!token) {
          console.log('❌ No token provided for socket connection');
          return next(new Error('Authentication required'));
        }

        // Handle demo tokens
        if (token.startsWith('demo_token_')) {
          console.log('✅ Demo token detected, allowing connection');
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

        // Validate token format
        if (!token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
          console.log('❌ Invalid token format');
          return next(new Error('Invalid token format'));
        }
        
        // Verify token with timeout
        const decoded = await this.verifyTokenWithTimeout(token);
        console.log('✅ Token verified successfully for user:', decoded.id);
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          console.log('❌ User not found for token');
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        
        next();
      } catch (error) {
        console.error('❌ Socket authentication error:', error.message);
        next(new Error('Authentication failed: ' + error.message));
      }
    });
  }

  // Verify token with timeout
  async verifyTokenWithTimeout(token) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Token verification timeout'));
      }, 5000); // 5 second timeout

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        clearTimeout(timeout);
        resolve(decoded);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  // Setup connection monitoring
  setupConnectionMonitoring() {
    // Monitor connection health every 30 seconds
    setInterval(() => {
      this.monitorConnections();
    }, 30000);

    // Clean up stale connections every 5 minutes
    setInterval(() => {
      this.cleanupStaleConnections();
    }, 300000);
  }

  // Monitor active connections
  monitorConnections() {
    const stats = {
      totalConnections: this.io.engine.clientsCount,
      adminConnections: this.adminSockets.size,
      userConnections: this.connectedUsers.size,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Socket connection stats:', stats);
    
    // Emit stats to admin users
    this.adminSockets.forEach(socketId => {
      this.io.to(socketId).emit('connection_stats', stats);
    });
  }

  // Clean up stale connections
  cleanupStaleConnections() {
    const staleSockets = [];
    
    this.io.sockets.sockets.forEach((socket, socketId) => {
      if (!socket.connected) {
        staleSockets.push(socketId);
      }
    });

    staleSockets.forEach(socketId => {
      this.removeSocket(socketId);
    });

    if (staleSockets.length > 0) {
      console.log(`🧹 Cleaned up ${staleSockets.length} stale connections`);
    }
  }

  // Setup event handlers with improved error handling
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('✅ Socket connected:', socket.id, 'User:', socket.userId);
      
      // Track connection attempt
      this.trackConnectionAttempt(socket.userId);
      
      // Add to connected users
      this.addSocket(socket);
      
      // Send connection confirmation
      socket.emit('connected', {
        socketId: socket.id,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });

      // Handle join chat room
      socket.on('join_chat', async (data) => {
        try {
          const { chatId } = data;
          console.log('🔥 User joining chat:', chatId, 'User:', socket.userId);
          
          // Verify user has access to this chat
          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit('error', { message: 'Chat not found' });
            return;
          }

          const hasAccess = this.verifyChatAccess(chat, socket.userId, socket.user);
          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied to this chat' });
            return;
          }

          // Join the chat room
          socket.join(`chat_${chatId}`);
          console.log('✅ User joined chat room:', `chat_${chatId}`);
          
          socket.emit('joined_chat', { chatId: chatId });
        } catch (error) {
          console.error('Error joining chat:', error);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      // Handle leave chat room
      socket.on('leave_chat', (data) => {
        const { chatId } = data;
        socket.leave(`chat_${chatId}`);
        console.log('👋 User left chat room:', `chat_${chatId}`);
        socket.emit('left_chat', { chatId: chatId });
      });

      // Handle sending message with improved error handling
      socket.on('send_message', async (data) => {
        try {
          const { chatId, content, type = 'text' } = data;
          
          console.log('💬 Message received:', { chatId, content: content?.substring(0, 50) + '...', type, userId: socket.userId });
          
          // Validate input
          if (!chatId || !content || content.trim().length === 0) {
            socket.emit('message_error', { message: 'Invalid message data' });
            return;
          }

          // Verify user has access to this chat
          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit('message_error', { message: 'Chat not found' });
            return;
          }

          const hasAccess = this.verifyChatAccess(chat, socket.userId, socket.user);
          if (!hasAccess) {
            socket.emit('message_error', { message: 'Access denied to this chat' });
            return;
          }

          // Determine sender type
          const senderType = this.getSenderType(chat, socket.userId, socket.user);
          
          // Add message to chat
          await chat.addMessage(senderType, socket.userId, content, type, []);
          
          // Get the last message
          const lastMessage = chat.messages[chat.messages.length - 1];
          
          // Broadcast to chat room
          this.io.to(`chat_${chatId}`).emit('new_message', {
            chatId: chatId,
            message: lastMessage
          });

          // Notify admins if customer sent message
          if (senderType === 'customer') {
            this.notifyAdmins('new_customer_message', {
              chatId: chatId,
              message: lastMessage,
              customer: {
                name: `${chat.customer.firstName} ${chat.customer.lastName}`,
                email: chat.customer.email
              }
            });
          }

          console.log('✅ Message sent successfully');
        } catch (error) {
          console.error('❌ Error sending message:', error);
          socket.emit('message_error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { chatId } = data;
        socket.to(`chat_${chatId}`).emit('user_typing', {
          chatId: chatId,
          userId: socket.userId,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data) => {
        const { chatId } = data;
        socket.to(`chat_${chatId}`).emit('user_typing', {
          chatId: chatId,
          userId: socket.userId,
          isTyping: false
        });
      });

      // Handle chat assignment
      socket.on('assign_chat', async (data) => {
        try {
          const { chatId, adminId } = data;
          
          if (!socket.user.isAdmin) {
            socket.emit('error', { message: 'Admin access required' });
            return;
          }

          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit('error', { message: 'Chat not found' });
            return;
          }

          chat.assignedTo = adminId;
          await chat.save();

          // Notify all admins about assignment
          this.notifyAdmins('chat_assigned', {
            chatId: chatId,
            assignedTo: adminId,
            assignedBy: socket.userId
          });

          socket.emit('chat_assigned', { chatId: chatId, assignedTo: adminId });
        } catch (error) {
          console.error('Error assigning chat:', error);
          socket.emit('error', { message: 'Failed to assign chat' });
        }
      });

      // Handle chat deletion
      socket.on('chat_deleted', (data) => {
        try {
          const { chatId } = data;
          
          if (!socket.user.isAdmin) {
            socket.emit('error', { message: 'Admin access required' });
            return;
          }

          console.log(`🗑️ Chat deleted event received for chat ${chatId}`);

          // Broadcast to all admin sockets
          this.notifyAdmins('chat_deleted', {
            chatId: chatId,
            deletedBy: socket.userId
          });

          // Notify chat room participants
          this.io.to(`chat_${chatId}`).emit('chat_deleted', {
            chatId: chatId,
            message: 'This chat has been deleted'
          });

          console.log(`✅ Chat deleted event broadcasted for chat ${chatId}`);
        } catch (error) {
          console.error('Error handling chat deletion:', error);
          socket.emit('error', { message: 'Failed to handle chat deletion' });
        }
      });

      // Handle disconnect with cleanup
      socket.on('disconnect', (reason) => {
        console.log('👋 Socket disconnected:', socket.id, 'Reason:', reason);
        this.removeSocket(socket.id);
      });

      // Handle connection errors
      socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });
    });
  }

  // Track connection attempts to prevent spam
  trackConnectionAttempt(userId) {
    const attempts = this.connectionAttempts.get(userId) || 0;
    this.connectionAttempts.set(userId, attempts + 1);
    
    if (attempts >= this.maxConnectionAttempts) {
      console.log(`⚠️ Too many connection attempts for user ${userId}`);
      return false;
    }
    
    return true;
  }

  // Add socket to tracking
  addSocket(socket) {
    if (!socket.userId) return;

    this.connectedUsers.set(socket.userId, socket.id);
    
    // Track user sockets
    if (!this.userSockets.has(socket.userId)) {
      this.userSockets.set(socket.userId, new Set());
    }
    this.userSockets.get(socket.userId).add(socket.id);

    // Track admin sockets
    if (socket.user && socket.user.isAdmin) {
      this.adminSockets.add(socket.id);
    }

    console.log(`📊 User ${socket.userId} connected (${this.userSockets.get(socket.userId).size} sockets)`);
  }

  // Remove socket from tracking
  removeSocket(socketId) {
    // Find user by socket ID
    let userId = null;
    for (const [uid, sockets] of this.userSockets.entries()) {
      if (sockets.has(socketId)) {
        userId = uid;
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(uid);
          this.connectedUsers.delete(uid);
        }
        break;
      }
    }

    // Remove from admin sockets
    this.adminSockets.delete(socketId);

    if (userId) {
      console.log(`📊 User ${userId} disconnected`);
    }
  }

  // Verify chat access
  verifyChatAccess(chat, userId, user) {
    // Admin users have access to all chats
    if (user && user.isAdmin) {
      return true;
    }

    // Customer users can only access their own chats
    if (chat.customer.userId && chat.customer.userId.toString() === userId) {
      return true;
    }

    // Assigned admin can access the chat
    if (chat.assignedTo && chat.assignedTo.toString() === userId) {
      return true;
    }

    return false;
  }

  // Get sender type
  getSenderType(chat, userId, user) {
    if (user && user.isAdmin) {
      return 'admin';
    }
    return 'customer';
  }

  // Notify all admin users
  notifyAdmins(event, data) {
    this.adminSockets.forEach(socketId => {
      this.io.to(socketId).emit(event, data);
    });
  }

  // Get connection stats
  getConnectionStats() {
    return {
      totalConnections: this.io.engine.clientsCount,
      adminConnections: this.adminSockets.size,
      userConnections: this.connectedUsers.size,
      uniqueUsers: this.userSockets.size
    };
  }

  // Force disconnect user
  disconnectUser(userId) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach(socketId => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      });
    }
  }
}

module.exports = ImprovedSocketService;

