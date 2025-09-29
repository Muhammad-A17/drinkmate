const Chat = require('../Models/chat-model');

class SessionTimeoutService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  // Start the session timeout checker
  start() {
    if (this.isRunning) {
      console.log('Session timeout service is already running');
      return;
    }

    console.log('Starting session timeout service...');
    this.isRunning = true;

    // Check for expired sessions every 5 minutes
    this.intervalId = setInterval(async () => {
      try {
        await this.checkAndCloseExpiredSessions();
      } catch (error) {
        console.error('Error in session timeout check:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Also run immediately on startup
    this.checkAndCloseExpiredSessions();
  }

  // Stop the session timeout checker
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Session timeout service stopped');
  }

  // Check and close expired sessions
  async checkAndCloseExpiredSessions() {
    try {
      // Check if database is connected before proceeding
      const { isConnected } = require('../Utils/db');
      if (!isConnected()) {
        console.log('Database not connected, skipping session check');
        return;
      }

      console.log('Checking for expired chat sessions...');
      
      // Add timeout wrapper to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Session check timeout')), 15000); // 15 second timeout
      });
      
      const sessionPromise = Chat.closeExpiredSessions();
      
      const closedSessions = await Promise.race([sessionPromise, timeoutPromise]);
      
      if (closedSessions.length > 0) {
        console.log(`Closed ${closedSessions.length} expired chat sessions`);
        
        // Emit socket event to notify admins about closed sessions
        if (global.io) {
          global.io.emit('sessions_expired', {
            count: closedSessions.length,
            sessions: closedSessions.map(session => ({
              id: session._id,
              customerName: session.customer.name,
              closedAt: session.resolution.resolvedAt
            }))
          });
        }
      }
    } catch (error) {
      console.error('Error checking expired sessions:', error);
      
      // If it's a timeout error, don't spam the logs
      if (error.message === 'Session check timeout') {
        console.log('Session check timed out, will retry on next cycle');
      } else if (error.message.includes('before initial connection is complete')) {
        console.log('Database not ready, skipping session check');
      } else {
        console.error('MongoDB operation failed:', error.message);
      }
    }
  }

  // Get session timeout info for a specific chat
  async getSessionTimeoutInfo(chatId) {
    try {
      return await Chat.getSessionTimeoutInfo(chatId);
    } catch (error) {
      console.error('Error getting session timeout info:', error);
      return null;
    }
  }

  // Manually close a specific session (for testing or admin override)
  async closeSession(chatId) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      if (chat.status === 'closed') {
        return { message: 'Chat is already closed', chat };
      }

      await chat.closeExpiredSession();
      return { message: 'Session closed successfully', chat };
    } catch (error) {
      console.error('Error closing session:', error);
      throw error;
    }
  }

  // Get all sessions that are close to expiring (within 30 minutes)
  async getSessionsNearExpiry() {
    try {
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + (30 * 60 * 1000));
      const fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000));

      const nearExpirySessions = await Chat.find({
        status: { $in: ['active', 'waiting'] },
        lastMessageAt: { 
          $gte: fourHoursAgo,
          $lte: thirtyMinutesFromNow
        }
      }).populate('assignedTo', 'firstName lastName email');

      return nearExpirySessions.map(chat => ({
        id: chat._id,
        customerName: chat.customer.name,
        assignedTo: chat.assignedTo ? `${chat.assignedTo.firstName} ${chat.assignedTo.lastName}` : 'Unassigned',
        lastActivity: chat.lastMessageAt,
        timeUntilExpiry: (4 * 60 * 60 * 1000) - (now.getTime() - chat.lastMessageAt.getTime()),
        expiresAt: new Date(chat.lastMessageAt.getTime() + (4 * 60 * 60 * 1000))
      }));
    } catch (error) {
      console.error('Error getting sessions near expiry:', error);
      return [];
    }
  }
}

// Create singleton instance
const sessionTimeoutService = new SessionTimeoutService();

module.exports = sessionTimeoutService;
