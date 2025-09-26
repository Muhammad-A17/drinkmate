const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.youtube.com", "https://www.googletagmanager.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com", "https://www.youtube.com"],
      mediaSrc: ["'self'", "https://www.youtube.com"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'", "https://www.youtube.com"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// Rate limiting for different endpoints
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// General rate limiting
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiting for auth endpoints (increased for testing)
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  20, // 20 attempts per window (increased for testing)
  'Too many authentication attempts, please try again later.'
);

// File upload rate limiting
const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Too many file uploads, please try again later.'
);

// API rate limiting
const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  200, // 200 requests per window
  'API rate limit exceeded, please try again later.'
);

// Slow down middleware for additional protection
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes, then...
  delayMs: (used, req) => {
    const delayAfter = req.slowDown?.limit || 50;
    return (used - delayAfter) * 500;
  }
});

// Input sanitization middleware
const sanitizeInput = [
  // Sanitize data against NoSQL query injection
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized NoSQL injection attempt: ${key} in ${req.method} ${req.path}`);
    }
  }),
  
  // Sanitize data against XSS
  xss({
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized XSS attempt: ${key} in ${req.method} ${req.path}`);
    }
  }),
  
  // Prevent parameter pollution
  hpp({
    whitelist: ['sort', 'filter', 'limit', 'page']
  })
];

// Security logging middleware
const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log suspicious activities
  const suspiciousPatterns = [
    /script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<script/i,
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i
  ];
  
  const checkSuspicious = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            console.warn(`🚨 SECURITY ALERT: Suspicious pattern detected in ${req.method} ${req.path} at ${currentPath}: ${value}`);
            // Log to security monitoring service in production
            if (process.env.SECURITY_LOGGING === 'true') {
              // TODO: Send to security monitoring service
            }
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        checkSuspicious(value, currentPath);
      }
    }
  };
  
  // Check request body, query, and params
  if (req.body) checkSuspicious(req.body, 'body');
  if (req.query) checkSuspicious(req.query, 'query');
  if (req.params) checkSuspicious(req.params, 'params');
  
  // Log response time for performance monitoring
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 5000) { // Log slow requests
      console.warn(`⚠️ Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

// CORS security configuration
const secureCORS = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
    'https://drinkmate-ruddy.vercel.app', // Production Vercel URL
    'https://drinkmates.vercel.app', // Alternative production domain
    'http://localhost:3001', // Development frontend
    'http://localhost:3002', // Development frontend (Next.js default)
    'http://localhost:3000' // Alternative development port
  ].filter(Boolean);
  
  // Debug logging for CORS issues
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_CORS) {
    console.log('CORS Debug:', {
      origin,
      allowedOrigins,
      method: req.method,
      path: req.path,
      isAllowed: origin && allowedOrigins.includes(origin)
    });
  }
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // Log blocked origins for debugging
    console.log('CORS Blocked:', { origin, allowedOrigins });
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Cache-Control, Pragma');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

module.exports = {
  securityHeaders,
  generalLimiter,
  authLimiter,
  uploadLimiter,
  apiLimiter,
  speedLimiter,
  sanitizeInput,
  securityLogger,
  secureCORS
};
