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
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());

// Note: Static file serving for uploads removed - now using Cloudinary for image storage

// API routes
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/services', serviceRouter);
app.use('/api/shop', productRouter);
app.use('/api/checkout', orderRouter);
app.use('/api/contact', contactRouter);
app.use('/api/blog', blogRouter);
app.use('/api/testimonials', testimonialRouter);
app.use('/api', categoryRouter);
app.use('/api/co2', co2Router);
app.use('/api/refill', refillRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Drinkmate API is running');
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
FRONTEND_URL=http://localhost:3001
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
