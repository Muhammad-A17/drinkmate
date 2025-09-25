// Enhanced authorization middleware with role-based access control
const { logError } = require('../Utils/error-handler');
const auditLogger = require('../Services/audit-logger');

// Define role hierarchy and permissions
const ROLE_HIERARCHY = {
  'super_admin': 4,
  'admin': 3,
  'moderator': 2,
  'user': 1
};

const PERMISSIONS = {
  // User management
  'users.read': ['super_admin', 'admin'],
  'users.create': ['super_admin', 'admin'],
  'users.update': ['super_admin', 'admin'],
  'users.delete': ['super_admin'],
  
  // Product management
  'products.read': ['super_admin', 'admin', 'moderator'],
  'products.create': ['super_admin', 'admin'],
  'products.update': ['super_admin', 'admin'],
  'products.delete': ['super_admin', 'admin'],
  
  // Order management
  'orders.read': ['super_admin', 'admin', 'moderator'],
  'orders.update': ['super_admin', 'admin'],
  'orders.delete': ['super_admin'],
  
  // Category management
  'categories.read': ['super_admin', 'admin', 'moderator'],
  'categories.create': ['super_admin', 'admin'],
  'categories.update': ['super_admin', 'admin'],
  'categories.delete': ['super_admin', 'admin'],
  
  // Contact management
  'contacts.read': ['super_admin', 'admin', 'moderator'],
  'contacts.update': ['super_admin', 'admin', 'moderator'],
  'contacts.delete': ['super_admin', 'admin'],
  
  // Chat management
  'chat.read': ['super_admin', 'admin', 'moderator'],
  'chat.manage': ['super_admin', 'admin'],
  
  // Analytics
  'analytics.read': ['super_admin', 'admin'],
  
  // Settings
  'settings.read': ['super_admin', 'admin'],
  'settings.update': ['super_admin'],
  
  // Admin user creation
  'admin.create': ['super_admin']
};

/**
 * Check if user has required role level
 */
function hasRoleLevel(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Check if user has specific permission
 */
function hasPermission(userRole, permission) {
  if (!PERMISSIONS[permission]) {
    return false;
  }
  return PERMISSIONS[permission].includes(userRole);
}

/**
 * Enhanced admin middleware with role checking
 */
function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is admin (backward compatibility)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Check if user has admin role
    const userRole = req.user.role || 'user';
    if (!hasRoleLevel(userRole, 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges'
      });
    }

    next();
  } catch (error) {
    logError(error, 'Admin authorization check failed');
    res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
}

/**
 * Require specific permission
 */
function requirePermission(permission) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role || 'user';
      
      // Super admin bypass
      if (userRole === 'super_admin') {
        return next();
      }

      if (!hasPermission(userRole, permission)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges for this action'
        });
      }

      next();
    } catch (error) {
      logError(error, 'Permission check failed');
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
}

/**
 * Require minimum role level
 */
function requireRole(requiredRole) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role || 'user';
      
      if (!hasRoleLevel(userRole, requiredRole)) {
        return res.status(403).json({
          success: false,
          message: `Minimum role required: ${requiredRole}`
        });
      }

      next();
    } catch (error) {
      logError(error, 'Role check failed');
      res.status(500).json({
        success: false,
        message: 'Role check failed'
      });
    }
  };
}

/**
 * Check if user can access resource (owner or admin)
 */
function requireOwnershipOrAdmin(resourceUserIdField = 'userId') {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role || 'user';
      const isAdmin = req.user.isAdmin || userRole === 'admin' || userRole === 'super_admin';
      
      // Admin can access everything
      if (isAdmin) {
        return next();
      }

      // Check if user owns the resource
      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
      if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own resources'
      });
    } catch (error) {
      logError(error, 'Ownership check failed');
      res.status(500).json({
        success: false,
        message: 'Ownership check failed'
      });
    }
  };
}

/**
 * Audit logging for sensitive operations
 */
function auditLog(operation, resource = null) {
  return (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();
    
    res.send = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Log the operation using audit logger
      auditLogger.logApiAccessEvent(
        req.method,
        req.path,
        req.user?._id,
        req.user?.email,
        req.ip,
        req.get('User-Agent'),
        responseTime,
        res.statusCode,
        {
          operation,
          resource,
          userRole: req.user?.role,
          requestBody: req.method !== 'GET' ? req.body : undefined
        }
      );
      
      // Call original send
      return originalSend.call(this, data);
    };
    
    next();
  };
}

module.exports = {
  requireAdmin,
  requirePermission,
  requireRole,
  requireOwnershipOrAdmin,
  auditLog,
  hasRoleLevel,
  hasPermission,
  ROLE_HIERARCHY,
  PERMISSIONS
};
