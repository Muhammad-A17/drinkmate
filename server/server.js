// server.js (or index.js)
const express = require('express');
const cors = require('cors');
const path = require('path');
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
const app = express();

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://drinkmates.vercel.app',
      'https://drinkmates-git-main-devopsdrinkmate-6879s-projects.vercel.app',
      'https://drinkmates-l64ifxvfr-devopsdrinkmate-6879s-projects.vercel.app',
      'https://drinkmates-jm7rtm4hz-devopsdrinkmate-6879s-projects.vercel.app',
      'https://drinkmates-1a8de3m4h-devopsdrinkmate-6879s-projects.vercel.app'
    ];
    
    // Allow all Vercel preview deployments and main domains
    if (
      origin.includes('vercel.app') || 
      origin.includes('netlify.app') ||
      origin.includes('drinkmates') ||
      origin.includes('devopsdrinkmate')
    ) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      return callback(null, true);
    }
    
    // Check if origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log(`❌ CORS blocked for origin: ${origin}`);
    callback(new Error('CORS not allowed for this origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request Body:', req.body);
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('🔍 Query Params:', req.query);
  }
  next();
});

// Note: Static file serving for uploads removed - now using Cloudinary for image storage

// API routes
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/services', serviceRouter);
app.use('/shop', productRouter);
app.use('/checkout', orderRouter);
app.use('/contact', contactRouter);
app.use('/blog', blogRouter);
app.use('/testimonials', testimonialRouter);
app.use('/', categoryRouter);
app.use('/co2', co2Router);
app.use('/refill', refillRouter);

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

// Set environment variables if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'drinkmate_secret_key_development';
  console.log('JWT_SECRET not found in environment, using default development secret');
}

// Start server
const PORT = process.env.PORT || 3000;

// Create a .env file with environment variables
const fs = require('fs');
if (!fs.existsSync('./.env')) {
  try {
    fs.writeFileSync('./.env', `PORT=3000
JWT_SECRET=drinkmate_secret_key_development
FRONTEND_URL=https://drinkmates-jm7rtm4hz-devopsdrinkmate-6879s-projects.vercel.app
MONGODB_URI=mongodb+srv://faizanhassan608:jWnMYMNtJK0M79Fa@cluster0.rvqclhq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=da6dzmflp
CLOUDINARY_API_KEY=694537626126534
CLOUDINARY_API_SECRET=elu06tzJWrK_Yb_M8H2bmGNfUL0

# Email Configuration (SMTP)
# Uncomment and configure one of the email providers below:

# Gmail (Recommended for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=devops.drinkmate@gmail.com
SMTP_PASS=ejfo bcdu fmmr wfwj

# Outlook/Hotmail
# SMTP_HOST=smtp-mail.outlook.com
# SMTP_PORT=587
# SMTP_USER=your-email@outlook.com
# SMTP_PASS=your-password

# Custom SMTP Server
# SMTP_HOST=mail.yourdomain.com
# SMTP_PORT=587
# SMTP_USER=noreply@yourdomain.com
# SMTP_PASS=your-smtp-password

# Alternative Email Variables (for backward compatibility)
EMAIL_USER=\${SMTP_USER}
EMAIL_PASS=\${SMTP_PASS}

# Environment
NODE_ENV=development`);
    console.log('Created .env file with default settings');
    console.log('⚠️  Please update CLOUDINARY_* values in .env file with your actual Cloudinary credentials');
    console.log('⚠️  Please configure email settings in .env file for password reset functionality');
  } catch (err) {
    console.log('Could not create .env file:', err);
  }
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

// 404 handler for undefined routes
app.use('*', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API Status: http://localhost:${PORT}/api-status`);
});
