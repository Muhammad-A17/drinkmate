# Architecture Analysis - DrinkMate

## 🏗️ **Current Architecture**

```
┌─────────────────┐    ┌─────────────────┐
│   VERCEL        │    │   RENDER        │
│   (Frontend)    │    │   (Backend)     │
│                 │    │                 │
│ • Next.js App   │    │ • Node.js API   │
│ • API Routes    │    │ • MongoDB       │
│ • Static Files  │    │ • WebSocket     │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              API Calls
```

## 🔍 **API Route Distribution**

### **Vercel API Routes (Frontend)**
- `/api/payments/urways` - Urways payment processing
- `/api/payments/tap` - Tap payment processing  
- `/api/shop/products` - Product data
- `/api/recipes` - Recipe data
- `/api/contact/submit` - Contact form
- `/api/admin/*` - Admin dashboard data
- `/api/user/*` - User profile data

### **Render API Routes (Backend)**
- `/auth/*` - Authentication
- `/chat/*` - Chat system
- `/orders/*` - Order management
- `/payments/*` - Payment processing (legacy)
- `/admin/*` - Admin operations
- `/co2/*` - CO2 cylinders
- `/wishlist/*` - Wishlist management

## ⚠️ **CRITICAL ISSUE FOUND**

The frontend is **inconsistently** calling APIs:
- Some calls go to **Vercel API routes** (local)
- Some calls go to **Render backend** (remote)

This creates confusion and potential failures!

## 🔧 **REQUIRED FIXES**

### **1. Environment Variables Needed**

#### **Vercel (Frontend) Environment Variables:**
```bash
# Backend API URL (Render)
NEXT_PUBLIC_API_URL=https://drinkmates.onrender.com

# Frontend URL (Vercel)
NEXT_PUBLIC_FRONTEND_URL=https://drinkmate-ruddy.vercel.app

# Urways Payment (for Vercel API routes)
URWAYS_TERMINAL_ID=aqualinesa
URWAYS_TERMINAL_PASSWORD=URWAY@026_a
URWAYS_MERCHANT_KEY=e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d
URWAYS_API_URL=https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest

# Other services
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=da6dzmflp
NEXT_PUBLIC_CLOUDINARY_API_KEY=694537626126534
```

#### **Render (Backend) Environment Variables:**
```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drinkmate

# Frontend URL (for CORS)
FRONTEND_URL=https://drinkmate-ruddy.vercel.app
CORS_ORIGIN=https://drinkmate-ruddy.vercel.app

# Urways Payment (for backend processing)
URWAYS_TERMINAL_ID=aqualinesa
URWAYS_TERMINAL_PASSWORD=URWAY@026_a
URWAYS_MERCHANT_KEY=e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d
URWAYS_API_URL=https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest

# Other services
CLOUDINARY_CLOUD_NAME=da6dzmflp
CLOUDINARY_API_KEY=694537626126534
CLOUDINARY_API_SECRET=elu06tzJWrK_Yb_M8H2bmGNfUL0
```

## 🎯 **RECOMMENDED ARCHITECTURE**

### **Option 1: Keep Current (Hybrid)**
- Vercel handles: Payments, Products, Recipes, Admin UI
- Render handles: Auth, Chat, Orders, Database operations

### **Option 2: Move Everything to Render (Recommended)**
- Move all API routes to Render backend
- Vercel only serves static frontend
- Single API endpoint for everything

## 🚨 **IMMEDIATE ACTION REQUIRED**

1. **Set `NEXT_PUBLIC_API_URL=https://drinkmates.onrender.com` in Vercel**
2. **Ensure Render backend is running and accessible**
3. **Test API connectivity between Vercel and Render**

## ✅ **CURRENT STATUS**

- ✅ Urways payment routes are in Vercel (working)
- ✅ Most other APIs are in Render (needs connection)
- ⚠️ Environment variables need to be set correctly
- ⚠️ API routing needs to be consistent
