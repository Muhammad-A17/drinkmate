// server.js (or index.js)
const express = require('express');
const cors = require('cors');
const path = require('path');
// Security and performance middleware
const {
  securityHeaders,
  generalLimiter,
  authLimiter,
  uploadLimiter,
  apiLimiter,
  speedLimiter,
  sanitizeInput,
  securityLogger,
  secureCORS
} = require('./Middleware/security-middleware');

// Optional performance middleware
let compression;
let morgan;
try {
  compression = require('compression');
} catch (e) {
  console.log('compression module not installed; skipping gzip. Run: npm i compression');
}
try {
  morgan = require('morgan');
} catch (e) {
  console.log('morgan module not installed; skipping request logger. Run: npm i morgan');
}
require('dotenv').config({ path: './.env' });

const { connect } = require('./Utils/db');
const authRouter = require('./Router/auth-router');
const serviceRouter = require('./Router/service-router');
const adminRouter = require('./Router/admin-router');
const productRouter = require('./Router/product-router');
const orderRouter = require('./Router/order-router');
const contactRouter = require('./Router/contact-router');
const blogRouter = require('./Router/blog-router');
const testimonialRouter = require('./Router/testimonial-router');
const categoryRouter = require('./Router/category-router');
const co2Router = require('./Router/co2-router');
const refillRouter = require('./Router/refill-router');
const paymentRouter = require('./Router/payment-router');
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Strong ETag for better caching/validation
app.set('etag', 'strong');

// Enable gzip compression if available
if (compression) {
  app.use(compression({ level: 6 }));
}

// Apply security headers
app.use(securityHeaders);

// Apply security middleware
app.use(securityLogger);
app.use(sanitizeInput);
app.use(speedLimiter);

// Apply secure CORS
app.use(secureCORS);
// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (dev only)
if (((process.env.NODE_ENV || 'development') !== 'production') && morgan) {
  app.use(morgan('tiny'));
}

// Lightweight Cache-Control for GET requests
app.use((req, res, next) => {
  if (req.method === 'GET') {
    const longTtlPaths = [
      '/shop/categories',
      '/blog/posts',
      '/testimonials',
      '/co2/cylinders'
    ];
    const isLong = longTtlPaths.some((p) => req.path.startsWith(p));
    const maxAge = isLong ? 300 : 30; // seconds
    res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${Math.min(maxAge, 60)}`);
  }
  next();
});

// Simple in-memory response cache for hot GET endpoints
const responseCache = new Map();
const CACHE_MAX = 100; // entries
const cacheablePrefixes = [
  '/shop/products',
  '/shop/bundles',
  '/shop/categories',
  '/blog/posts',
  '/co2/cylinders',
  '/testimonials'
];

function setCache(key, value, ttlMs) {
  // Evict oldest if needed
  if (responseCache.size >= CACHE_MAX) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
  responseCache.set(key, { expiresAt: Date.now() + ttlMs, value });
}

function getCache(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.value;
}

app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (!cacheablePrefixes.some((p) => req.path.startsWith(p))) return next();

  // TTL based on path
  const ttlMs = req.path.startsWith('/shop/categories') ? 120000 : 20000; // 120s for categories, 20s for lists
  const key = req.originalUrl;
  const cached = getCache(key);
  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.json(cached);
  }
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    try { setCache(key, body, ttlMs); } catch (_) {}
    res.set('X-Cache', 'MISS');
    return originalJson(body);
  };
  next();
});

// Note: Static file serving for uploads removed - now using Cloudinary for image storage

// API routes with rate limiting
app.use('/admin', generalLimiter, adminRouter);
app.use('/auth', authLimiter, authRouter);
app.use('/services', generalLimiter, serviceRouter);
app.use('/shop', apiLimiter, productRouter);
app.use('/checkout', apiLimiter, orderRouter);
app.use('/contact', generalLimiter, contactRouter);
app.use('/blog', generalLimiter, blogRouter);
app.use('/testimonials', generalLimiter, testimonialRouter);
app.use('/', generalLimiter, categoryRouter);
app.use('/co2', generalLimiter, co2Router);
app.use('/refill', generalLimiter, refillRouter);
app.use('/payments', apiLimiter, paymentRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Drinkmate API is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Status endpoint - shows all available routes
app.get('/api-status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    apis: {
      root: 'GET /',
      health: 'GET /health',
      apiStatus: 'GET /api-status',
      auth: {
        base: 'POST /auth/*',
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        contact: 'POST /auth/contact',
        verify: 'GET /auth/verify',
        forgotPassword: 'POST /auth/forgot-password',
        resetPassword: 'POST /auth/reset-password'
      },
      shop: {
        base: 'GET /shop/*',
        products: 'GET /shop/products',
        bundles: 'GET /shop/bundles',
        categories: 'GET /shop/categories',
        reviews: 'POST /shop/reviews'
      },
      contact: {
        base: 'POST /contact/*',
        submit: 'POST /contact/submit',
        test: 'GET /contact/test'
      },
      checkout: {
        base: 'POST /checkout/*',
        createOrder: 'POST /checkout/orders',
        trackOrder: 'GET /checkout/track/:orderNumber',
        validateCoupon: 'POST /checkout/validate-coupon'
      },
      admin: {
        base: 'GET /admin/*',
        requires: 'Authentication + Admin role'
      },
      co2: {
        base: 'GET /co2/*'
      },
      refill: {
        base: 'GET /refill/*'
      }
    }
  });
});

// Test all APIs endpoint
app.get('/test-apis', async (req, res) => {
  try {
    const testResults = {
      timestamp: new Date().toISOString(),
      server: 'OK',
      database: 'Unknown',
      apis: {}
    };

    // Test database connection
    try {
      const { isConnected } = require('./Utils/db');
      testResults.database = isConnected() ? 'Connected' : 'Disconnected';
    } catch (error) {
      testResults.database = 'Error: ' + error.message;
    }

    // Test basic endpoints
    testResults.apis.root = 'OK';
    testResults.apis.health = 'OK';
    testResults.apis.apiStatus = 'OK';

    res.status(200).json(testResults);
  } catch (error) {
    console.error('Error in test-apis:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error.message
    });
  }
});

// Security: Require proper environment configuration
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'drinkmate_secret_key_development') {
  console.error('🚨 CRITICAL SECURITY ERROR: JWT_SECRET not properly configured!');
  console.error('Please set a strong JWT_SECRET in your environment variables.');
  process.exit(1);
}

// Start server

// Security: Check for required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('🚨 CRITICAL SECURITY ERROR: Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('Please configure all required environment variables before starting the server.');
  process.exit(1);
}

// Security: Validate JWT secret strength
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('🚨 CRITICAL SECURITY ERROR: JWT_SECRET is too weak!');
  console.error('JWT_SECRET must be at least 32 characters long.');
  console.error('Generate a strong secret: openssl rand -base64 32');
  process.exit(1);
}

// Start server even if MongoDB connection fails
connect().catch((error) => {
  console.error('Error connecting to MongoDB, but server will still start:', error);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err);
  
  // Handle CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: 'Cross-origin request not allowed',
      origin: req.headers.origin,
      details: err.message
    });
  }
  
  // Handle other errors
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes (catch-all middleware)
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api-status',
      'POST /auth/register',
      'POST /auth/login',
      'POST /contact/submit',
      'GET /contact/test',
      'GET /shop/products',
      'GET /shop/bundles'
    ]
  });
});

// Start server on port 3000 (force port 3000)
const PORT = parseInt(process.env.PORT, 10) || 3000;

// Function to kill process on port 3000 if it exists
function killProcessOnPort(port) {
  const { exec } = require('child_process');
  exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
    if (stdout) {
      const lines = stdout.trim().split('\n');
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            console.log(`🔄 Killing process ${pid} on port ${port}`);
            exec(`taskkill /F /PID ${pid}`, (err) => {
              if (err) {
                console.log(`⚠️  Could not kill process ${pid}: ${err.message}`);
              } else {
                console.log(`✅ Successfully killed process ${pid}`);
              }
            });
          }
        }
      });
    }
  });
}

// Kill any existing process on port 3000
killProcessOnPort(3000);

// Wait a moment for the port to be freed
setTimeout(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 API Status: http://localhost:${PORT}/api-status`);
  });
  
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is still in use. Please manually kill the process and restart.`);
      console.error(`💡 Try: netstat -ano | findstr :${PORT} then taskkill /F /PID <PID>`);
      process.exit(1);
    } else {
      throw error;
    }
  });
}, 2000);
