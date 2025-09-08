const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class SessionManager {
  constructor() {
    this.activeSessions = new Map(); // userId -> Set of sessionIds
    this.sessionData = new Map(); // sessionId -> session data
    this.maxSessionsPerUser = parseInt(process.env.MAX_SESSIONS_PER_USER) || 3;
    this.sessionTimeout = parseInt(process.env.SESSION_TIMEOUT) || 24 * 60 * 60 * 1000; // 24 hours
    this.cleanupInterval = 5 * 60 * 1000; // 5 minutes
    
    // Start cleanup process
    this.startCleanupProcess();
  }

  // Create a new session
  createSession(userId, userData, deviceInfo = {}) {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    
    const session = {
      id: sessionId,
      userId,
      createdAt: now,
      lastAccessed: now,
      expiresAt: now + this.sessionTimeout,
      deviceInfo: {
        userAgent: deviceInfo.userAgent || 'Unknown',
        ip: deviceInfo.ip || 'Unknown',
        platform: deviceInfo.platform || 'Unknown',
        browser: deviceInfo.browser || 'Unknown'
      },
      isActive: true,
      tokenVersion: 1
    };

    // Check if user has too many active sessions
    const userSessions = this.activeSessions.get(userId) || new Set();
    
    if (userSessions.size >= this.maxSessionsPerUser) {
      // Remove oldest session
      const oldestSessionId = this.getOldestSession(userId);
      if (oldestSessionId) {
        this.revokeSession(oldestSessionId);
      }
    }

    // Store session
    this.sessionData.set(sessionId, session);
    userSessions.add(sessionId);
    this.activeSessions.set(userId, userSessions);

    // Generate JWT token with session info
    const token = jwt.sign(
      {
        userId,
        sessionId,
        tokenVersion: session.tokenVersion,
        iat: Math.floor(now / 1000),
        exp: Math.floor(session.expiresAt / 1000)
      },
      process.env.JWT_SECRET,
      { algorithm: 'HS256' }
    );

    return {
      sessionId,
      token,
      expiresAt: session.expiresAt,
      maxSessions: this.maxSessionsPerUser
    };
  }

  // Validate session
  validateSession(sessionId, token) {
    const session = this.sessionData.get(sessionId);
    
    if (!session || !session.isActive) {
      return { valid: false, reason: 'Session not found or inactive' };
    }

    if (Date.now() > session.expiresAt) {
      this.revokeSession(sessionId);
      return { valid: false, reason: 'Session expired' };
    }

    // Verify JWT token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.sessionId !== sessionId || 
          decoded.userId !== session.userId ||
          decoded.tokenVersion !== session.tokenVersion) {
        return { valid: false, reason: 'Token mismatch' };
      }

      // Update last accessed time
      session.lastAccessed = Date.now();
      
      return { 
        valid: true, 
        session,
        userId: session.userId 
      };
    } catch (error) {
      return { valid: false, reason: 'Invalid token' };
    }
  }

  // Revoke session
  revokeSession(sessionId) {
    const session = this.sessionData.get(sessionId);
    
    if (session) {
      session.isActive = false;
      
      // Remove from active sessions
      const userSessions = this.activeSessions.get(session.userId);
      if (userSessions) {
        userSessions.delete(sessionId);
        if (userSessions.size === 0) {
          this.activeSessions.delete(session.userId);
        }
      }
      
      // Remove session data
      this.sessionData.delete(sessionId);
      
      console.log(`Session revoked: ${sessionId} for user ${session.userId}`);
    }
  }

  // Revoke all sessions for a user
  revokeAllUserSessions(userId) {
    const userSessions = this.activeSessions.get(userId);
    
    if (userSessions) {
      for (const sessionId of userSessions) {
        this.revokeSession(sessionId);
      }
    }
  }

  // Get user sessions
  getUserSessions(userId) {
    const userSessions = this.activeSessions.get(userId);
    if (!userSessions) return [];

    const sessions = [];
    for (const sessionId of userSessions) {
      const session = this.sessionData.get(sessionId);
      if (session && session.isActive) {
        sessions.push({
          id: sessionId,
          createdAt: session.createdAt,
          lastAccessed: session.lastAccessed,
          expiresAt: session.expiresAt,
          deviceInfo: session.deviceInfo,
          isCurrent: false // Will be set by caller
        });
      }
    }

    return sessions;
  }

  // Generate session ID
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Get oldest session for a user
  getOldestSession(userId) {
    const userSessions = this.activeSessions.get(userId);
    if (!userSessions || userSessions.size === 0) return null;

    let oldestSessionId = null;
    let oldestTime = Date.now();

    for (const sessionId of userSessions) {
      const session = this.sessionData.get(sessionId);
      if (session && session.lastAccessed < oldestTime) {
        oldestTime = session.lastAccessed;
        oldestSessionId = sessionId;
      }
    }

    return oldestSessionId;
  }

  // Cleanup expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    const expiredSessions = [];

    for (const [sessionId, session] of this.sessionData.entries()) {
      if (now > session.expiresAt) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach(sessionId => {
      this.revokeSession(sessionId);
    });

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  // Start cleanup process
  startCleanupProcess() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.cleanupInterval);
  }

  // Get session statistics
  getSessionStats() {
    const stats = {
      totalActiveSessions: this.sessionData.size,
      totalUsers: this.activeSessions.size,
      maxSessionsPerUser: this.maxSessionsPerUser,
      sessionTimeout: this.sessionTimeout,
      sessionsByUser: {}
    };

    for (const [userId, sessions] of this.activeSessions.entries()) {
      stats.sessionsByUser[userId] = sessions.size;
    }

    return stats;
  }

  // Force logout all users (emergency)
  forceLogoutAll() {
    const totalSessions = this.sessionData.size;
    
    this.sessionData.clear();
    this.activeSessions.clear();
    
    console.log(`🚨 EMERGENCY: Force logged out ${totalSessions} sessions`);
    
    return totalSessions;
  }
}

const sessionManager = new SessionManager();

// Session middleware
const sessionMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Let other middleware handle authentication
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.decode(token);
    
    if (decoded && decoded.sessionId) {
      const validation = sessionManager.validateSession(decoded.sessionId, token);
      
      if (!validation.valid) {
        return res.status(401).json({
          error: 'Invalid session',
          code: 'INVALID_SESSION',
          reason: validation.reason
        });
      }

      req.session = validation.session;
      req.sessionId = decoded.sessionId;
    }
  } catch (error) {
    // Let other middleware handle the error
  }

  next();
};

// Session management endpoints
const getSessionInfo = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const sessions = sessionManager.getUserSessions(req.user._id);
    
    // Mark current session
    if (req.sessionId) {
      sessions.forEach(session => {
        session.isCurrent = session.id === req.sessionId;
      });
    }

    res.json({
      success: true,
      sessions,
      maxSessions: sessionManager.maxSessionsPerUser,
      currentSession: req.sessionId
    });
  } catch (error) {
    console.error('Get session info error:', error);
    res.status(500).json({
      error: 'Failed to get session information',
      code: 'SESSION_INFO_FAILED'
    });
  }
};

const revokeSession = (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID is required',
        code: 'MISSING_SESSION_ID'
      });
    }

    // Check if user owns this session
    const session = sessionManager.sessionData.get(sessionId);
    if (!session || session.userId !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'SESSION_ACCESS_DENIED'
      });
    }

    sessionManager.revokeSession(sessionId);

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      error: 'Failed to revoke session',
      code: 'REVOKE_SESSION_FAILED'
    });
  }
};

const revokeAllSessions = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    sessionManager.revokeAllUserSessions(req.user._id);

    res.json({
      success: true,
      message: 'All sessions revoked successfully'
    });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(500).json({
      error: 'Failed to revoke all sessions',
      code: 'REVOKE_ALL_SESSIONS_FAILED'
    });
  }
};

// Admin endpoint for session management
const getSessionStats = (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }

    const stats = sessionManager.getSessionStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get session stats error:', error);
    res.status(500).json({
      error: 'Failed to get session statistics',
      code: 'SESSION_STATS_FAILED'
    });
  }
};

module.exports = {
  sessionMiddleware,
  getSessionInfo,
  revokeSession,
  revokeAllSessions,
  getSessionStats,
  sessionManager
};
