# Production Deployment Guide - DrinkMate

## Issues Fixed

### 1. Authentication Issues ✅
- **Problem**: Payment service required authentication for guest users
- **Solution**: Updated payment service to use frontend API routes (no auth required)
- **Files Modified**: `drinkmate-main/lib/services/payment-service.ts`

### 2. Cart Validation Issues ✅
- **Problem**: Cart items were being removed aggressively during checkout
- **Solution**: Made cart validation more lenient, only removing definitely invalid items
- **Files Modified**: `drinkmate-main/app/checkout/page.tsx`

### 3. WebSocket/CSP Issues ✅
- **Problem**: Content Security Policy blocking WebSocket connections
- **Solution**: Updated CSP to allow WebSocket connections and production backend URL
- **Files Modified**: 
  - `server/Middleware/security-middleware.js`
  - `drinkmate-main/next.config.mjs`
  - `drinkmate-main/app/layout.tsx`
  - `drinkmate-main/lib/contexts/socket-context.tsx`

## Environment Variables Required

### Frontend (Vercel) Environment Variables

Set these in your Vercel dashboard under Settings > Environment Variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://drinkmates.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://drinkmate-ruddy.vercel.app

# Urways Payment Configuration
URWAYS_TERMINAL_ID=aqualinesa
URWAYS_TERMINAL_PASSWORD=URWAY@026_a
URWAYS_MERCHANT_KEY=e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d
URWAYS_API_URL=https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest

# Tap Payment Configuration (if needed)
TAP_SECRET_KEY=sk_test_XKokBfNWv6FIYuTMg5sLPjhJ
TAP_PUBLIC_KEY=pk_test_EtHFV4BuPQokJT6jiROlsbY2

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=da6dzmflp
NEXT_PUBLIC_CLOUDINARY_API_KEY=694537626126534

# Security
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://drinkmate-ruddy.vercel.app

# Environment
NODE_ENV=production
```

### Backend (Render) Environment Variables

Set these in your Render dashboard under Environment:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Security Configuration
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters
SESSION_SECRET=your_session_secret_here_minimum_32_characters
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drinkmate?retryWrites=true&w=majority&authSource=admin

# Frontend Configuration
FRONTEND_URL=https://drinkmate-ruddy.vercel.app
CORS_ORIGIN=https://drinkmate-ruddy.vercel.app

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=da6dzmflp
CLOUDINARY_API_KEY=694537626126534
CLOUDINARY_API_SECRET=elu06tzJWrK_Yb_M8H2bmGNfUL0

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=devops.drinkmate@gmail.com
SMTP_PASS=ejfo bcdu fmmr wfwj

# Urways Payment Configuration
URWAYS_TERMINAL_ID=aqualinesa
URWAYS_TERMINAL_PASSWORD=URWAY@026_a
URWAYS_MERCHANT_KEY=e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d
URWAYS_API_URL=https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest

# Admin Credentials
ADMIN_PASSWORD=your_strong_admin_password_here
TEST_PASSWORD=your_strong_test_password_here

# Security Monitoring
SECURITY_LOGGING=true
LOG_LEVEL=warn
```

## Deployment Steps

### 1. Deploy Backend to Render
1. Push changes to GitHub
2. Deploy to Render with the backend environment variables
3. Ensure the backend is running on port 3000

### 2. Deploy Frontend to Vercel
1. Push changes to GitHub
2. Deploy to Vercel with the frontend environment variables
3. Ensure all environment variables are set correctly

### 3. Test the Application
1. Test guest checkout flow
2. Test authenticated checkout flow
3. Test Urways payment integration
4. Test product pages loading
5. Check for WebSocket connection errors

## Key Changes Made

### Payment Service Fix
- Removed authentication requirement for guest users
- Updated to use frontend API routes instead of backend API

### Cart Validation Fix
- Made validation more lenient
- Only removes items that are definitely invalid
- Prevents aggressive item removal during checkout

### WebSocket/CSP Fix
- Added WebSocket support to CSP
- Updated production backend URL in CSP
- Fixed socket connection URL configuration

### Product Page Fix
- Improved error handling for product loading
- Better fallback for missing products

## Testing Checklist

- [ ] Guest checkout works without authentication
- [ ] Authenticated checkout works with user login
- [ ] Cart items are not removed unnecessarily
- [ ] Product pages load correctly
- [ ] Urways payment integration works
- [ ] WebSocket connections work without CSP errors
- [ ] No console errors related to authentication
- [ ] No console errors related to WebSocket connections

## Troubleshooting

### If authentication still fails:
1. Check that `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend is running and accessible
3. Check browser network tab for API call errors

### If cart items are still removed:
1. Check browser console for validation errors
2. Verify product IDs are correct in cart items
3. Check API responses for product validation

### If WebSocket errors persist:
1. Check CSP configuration in browser dev tools
2. Verify backend WebSocket server is running
3. Check network tab for WebSocket connection attempts

### If product pages show "item must have been removed":
1. Check API connectivity
2. Verify product data in database
3. Check API response in network tab
