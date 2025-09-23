// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../Models/user-model');
const rateLimit = require('express-rate-limit');

// Rate limiting for authentication attempts (increased for testing)
const authAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window (increased for testing)
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Enhanced token validation
const validateToken = (token) => {
  if (!token) {
    throw new Error('No token provided');
  }
  
  // Check token format
  if (!token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
    throw new Error('Invalid token format');
  }
  
  return token;
};

// Enhanced JWT verification with security checks
const verifyToken = (token) => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }
  
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET too weak');
  }
  
  return jwt.verify(token, jwtSecret);
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No valid authorization header provided',
        code: 'MISSING_AUTH_HEADER'
      });
    }

    const token = validateToken(authHeader.replace('Bearer ', ''));
    const decoded = verifyToken(token);
    
    // Security check: Ensure token has required fields
    if (!decoded.id || !decoded.iat || !decoded.exp) {
      return res.status(401).json({ 
        error: 'Invalid token structure',
        code: 'INVALID_TOKEN_STRUCTURE'
      });
    }
    
    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return res.status(401).json({ 
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // Security check: Reject demo accounts in production
    if (process.env.NODE_ENV === 'production' && decoded.id.toString().startsWith('demo')) {
      return res.status(401).json({ 
        error: 'Demo accounts not allowed in production',
        code: 'DEMO_ACCOUNT_BLOCKED'
      });
    }
    
    // Allow demo users in development mode
    if (decoded.id.toString().startsWith('demo')) {
      req.user = {
        _id: decoded.id,
        username: 'Demo User',
        email: 'demo@example.com',
        isAdmin: decoded.isAdmin || false,
        isDemo: true
      };
      return next();
    }
    
    try {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Check if user account is active
      if (user.status === 'blocked') {
        return res.status(403).json({ 
          error: 'Account is blocked',
          code: 'ACCOUNT_BLOCKED'
        });
      }
      
      if (user.status === 'inactive') {
        return res.status(403).json({ 
          error: 'Account is inactive',
          code: 'ACCOUNT_INACTIVE'
        });
      }
      
      // Update last activity
      user.lastLogin = new Date();
      
      // Ensure required fields exist before saving
      if (!user.firstName) {
        user.firstName = user.username || 'User';
      }
      if (!user.lastName) {
        user.lastName = 'Name';
      }
      
      await user.save();
      
      req.user = user;
      next();
    } catch (mongoError) {
      console.error("MongoDB error in auth middleware:", mongoError);
      
      // Handle validation errors gracefully
      if (mongoError.name === 'ValidationError') {
        console.warn("User validation error, continuing with token data:", mongoError.message);
        // Continue with token data instead of failing
        req.user = { 
          id: decoded.id, 
          username: decoded.username, 
          email: decoded.email,
          role: decoded.role || 'user'
        };
        return next();
      }
      
      // In production, don't allow fallback to token data for other errors
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ 
          error: 'Authentication service temporarily unavailable',
          code: 'AUTH_SERVICE_UNAVAILABLE'
        });
      }
      
      // Development fallback
      req.user = {
        _id: decoded.id,
        username: 'User',
        email: 'user@example.com',
        isAdmin: decoded.isAdmin || false,
        isFallback: true
      };
      next();
    }
  } catch (err) {
    console.error('Authentication error:', err.message);
    
    // Don't expose internal error details
    const errorResponse = {
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    };
    
    // Only in development, include more details
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.details = err.message;
    }
    
    res.status(401).json(errorResponse);
  }
};

const isAdmin = async (req, res, next) => {
  console.log('isAdmin middleware check:', {
    hasUser: !!req.user,
    userRole: req.user ? (req.user.role || 'no role') : 'no user',
    isAdmin: req.user ? (req.user.isAdmin || false) : false,
    userId: req.user ? (req.user._id || 'unknown') : 'no user'
  });

  if (!req.user) {
    console.log('Admin check failed: No user in request');
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  if (!req.user.isAdmin) {
    console.log('Admin check failed: User is not admin');
    return res.status(403).json({ 
      error: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  // Additional security check for admin access
  if (req.user.isDemo && process.env.NODE_ENV === 'production') {
    console.log('Admin check failed: Demo account in production');
    return res.status(403).json({ 
      error: 'Demo accounts cannot access admin features in production',
      code: 'DEMO_ADMIN_BLOCKED'
    });
  }
  
  next();
};

// Enhanced password validation
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common, please choose a stronger password');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Export both functions and the original middleware for backward compatibility
module.exports = {
  authenticateToken,
  isAdmin,
  authMiddleware: authenticateToken,
  authAttemptLimiter,
  validatePassword,
  validateEmail
};
