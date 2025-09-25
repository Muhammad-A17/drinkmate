// Comprehensive error handling utility to prevent information disclosure
const fs = require('fs');
const path = require('path');

// Error types and their safe messages
const ERROR_TYPES = {
  VALIDATION_ERROR: {
    status: 400,
    message: 'Invalid input provided',
    logLevel: 'warn'
  },
  AUTHENTICATION_ERROR: {
    status: 401,
    message: 'Authentication required',
    logLevel: 'warn'
  },
  AUTHORIZATION_ERROR: {
    status: 403,
    message: 'Access denied',
    logLevel: 'warn'
  },
  NOT_FOUND_ERROR: {
    status: 404,
    message: 'Resource not found',
    logLevel: 'info'
  },
  CONFLICT_ERROR: {
    status: 409,
    message: 'Resource already exists',
    logLevel: 'warn'
  },
  RATE_LIMIT_ERROR: {
    status: 429,
    message: 'Too many requests. Please try again later',
    logLevel: 'warn'
  },
  SERVER_ERROR: {
    status: 500,
    message: 'Internal server error',
    logLevel: 'error'
  },
  DATABASE_ERROR: {
    status: 503,
    message: 'Service temporarily unavailable',
    logLevel: 'error'
  },
  EXTERNAL_SERVICE_ERROR: {
    status: 503,
    message: 'External service unavailable',
    logLevel: 'error'
  }
};

// Sensitive patterns that should be redacted from logs
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /credential/i,
  /session/i,
  /jwt/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i
];

/**
 * Sanitize error message to prevent information disclosure
 */
function sanitizeErrorMessage(error, isDevelopment = false) {
  if (isDevelopment) {
    return error.message || 'Unknown error';
  }

  // Check if error message contains sensitive information
  const message = error.message || 'An error occurred';
  
  // If it's a known error type, return safe message
  if (error.type && ERROR_TYPES[error.type]) {
    return ERROR_TYPES[error.type].message;
  }

  // Check for sensitive patterns
  const hasSensitiveInfo = SENSITIVE_PATTERNS.some(pattern => 
    pattern.test(message) || pattern.test(error.stack || '')
  );

  if (hasSensitiveInfo) {
    return 'An error occurred while processing your request';
  }

  // For other errors, return generic message
  return 'An error occurred while processing your request';
}

/**
 * Sanitize error object for logging
 */
function sanitizeErrorForLogging(error) {
  const sanitized = {
    name: error.name || 'Error',
    message: error.message || 'Unknown error',
    stack: error.stack || '',
    timestamp: new Date().toISOString(),
    type: error.type || 'UNKNOWN_ERROR'
  };

  // Remove sensitive information from stack trace
  if (sanitized.stack) {
    sanitized.stack = sanitized.stack
      .split('\n')
      .map(line => {
        // Remove lines that might contain sensitive info
        if (SENSITIVE_PATTERNS.some(pattern => pattern.test(line))) {
          return '[REDACTED]';
        }
        return line;
      })
      .join('\n');
  }

  return sanitized;
}

/**
 * Log error securely
 */
function logError(error, context = '') {
  const sanitizedError = sanitizeErrorForLogging(error);
  const logEntry = {
    ...sanitizedError,
    context,
    environment: process.env.NODE_ENV || 'development'
  };

  // Log to console with appropriate level
  const logLevel = ERROR_TYPES[error.type]?.logLevel || 'error';
  const logMessage = `[${logLevel.toUpperCase()}] ${context}: ${sanitizedError.message}`;
  
  if (logLevel === 'error') {
    console.error(logMessage, sanitizedError);
  } else if (logLevel === 'warn') {
    console.warn(logMessage, sanitizedError);
  } else {
    console.log(logMessage, sanitizedError);
  }

  // In production, you might want to send to external logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to external logging service (e.g., Sentry, LogRocket, etc.)
  }
}

/**
 * Create standardized error response
 */
function createErrorResponse(error, req = null) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Determine error type
  let errorType = 'SERVER_ERROR';
  let statusCode = 500;

  if (error.name === 'ValidationError') {
    errorType = 'VALIDATION_ERROR';
    statusCode = 400;
  } else if (error.name === 'CastError') {
    errorType = 'VALIDATION_ERROR';
    statusCode = 400;
  } else if (error.name === 'MongoError' || error.name === 'MongooseError') {
    errorType = 'DATABASE_ERROR';
    statusCode = 503;
  } else if (error.status || error.statusCode) {
    statusCode = error.status || error.statusCode;
    if (statusCode === 401) errorType = 'AUTHENTICATION_ERROR';
    else if (statusCode === 403) errorType = 'AUTHORIZATION_ERROR';
    else if (statusCode === 404) errorType = 'NOT_FOUND_ERROR';
    else if (statusCode === 409) errorType = 'CONFLICT_ERROR';
    else if (statusCode === 429) errorType = 'RATE_LIMIT_ERROR';
  }

  // Set error type for logging
  error.type = errorType;

  // Log the error
  logError(error, req ? `${req.method} ${req.path}` : 'Unknown context');

  // Create response
  const response = {
    success: false,
    error: sanitizeErrorMessage(error, isDevelopment),
    timestamp: new Date().toISOString()
  };

  // Add request ID if available
  if (req && req.id) {
    response.requestId = req.id;
  }

  // Add error code for client handling
  response.code = errorType;

  // In development, add more details
  if (isDevelopment) {
    response.details = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    status: statusCode,
    data: response
  };
}

/**
 * Handle async route errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware
 */
function globalErrorHandler(error, req, res, next) {
  // Don't log 404 errors
  if (error.status === 404) {
    return res.status(404).json({
      success: false,
      error: 'Resource not found',
      timestamp: new Date().toISOString()
    });
  }

  const errorResponse = createErrorResponse(error, req);
  res.status(errorResponse.status).json(errorResponse.data);
}

/**
 * Handle uncaught exceptions
 */
function handleUncaughtException() {
  process.on('uncaughtException', (error) => {
    logError(error, 'Uncaught Exception');
    console.error('Uncaught Exception occurred. Application will exit.');
    process.exit(1);
  });
}

/**
 * Handle unhandled promise rejections
 */
function handleUnhandledRejection() {
  process.on('unhandledRejection', (reason, promise) => {
    logError(new Error(`Unhandled Rejection: ${reason}`), 'Unhandled Promise Rejection');
    console.error('Unhandled Rejection occurred:', reason);
  });
}

/**
 * Create API response helper
 */
function createApiResponse(success, data = null, message = null, statusCode = 200) {
  const response = {
    success,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return {
    status: statusCode,
    data: response
  };
}

module.exports = {
  ERROR_TYPES,
  sanitizeErrorMessage,
  sanitizeErrorForLogging,
  logError,
  createErrorResponse,
  asyncHandler,
  globalErrorHandler,
  handleUncaughtException,
  handleUnhandledRejection,
  createApiResponse
};
