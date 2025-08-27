// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../Models/user-model');

const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_dev_secret');
    
    // If token is for a demo user (starts with 'demo')
    if (decoded.id.toString().startsWith('demo')) {
      req.user = {
        _id: decoded.id,
        username: 'Demo User',
        email: 'demo@example.com',
        isAdmin: decoded.isAdmin || false,
      };
      return next();
    }
    
    try {
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ message: 'User not found' });
      
      req.user = user; // Attach user to request
      next();
    } catch (mongoError) {
      console.error("MongoDB error in auth middleware, using token data:", mongoError);
      
      // If MongoDB is unavailable, create a basic user from token
      req.user = {
        _id: decoded.id,
        username: 'User',
        email: 'user@example.com',
        isAdmin: decoded.isAdmin || false,
      };
      next();
    }
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const isAdmin = async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Export both functions and the original middleware for backward compatibility
module.exports = {
  authenticateToken,
  isAdmin,
  authMiddleware: authenticateToken
};
