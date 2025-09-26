# Vercel Environment Variables Configuration

## 🚨 CRITICAL: Add these environment variables to your Vercel project

### **Frontend Environment Variables (Vercel)**

Go to your Vercel project dashboard → Settings → Environment Variables and add:

```bash
# Base URL Configuration
NEXT_PUBLIC_BASE_URL=https://drinkmate-ruddy.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://your-backend-server.herokuapp.com
NEXT_PUBLIC_API_URL=https://your-backend-server.herokuapp.com

# Urways Payment Configuration
URWAYS_TERMINAL_ID=aqualinesa
URWAYS_TERMINAL_PASSWORD=URWAY@026_a
URWAYS_MERCHANT_KEY=e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d
URWAYS_API_URL=https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest

# Security Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://drinkmate-ruddy.vercel.app
```

### **Backend Environment Variables (Heroku/Railway/etc.)**

Add these to your backend server environment:

```bash
# CORS Configuration
FRONTEND_URL=https://drinkmate-ruddy.vercel.app
CORS_ORIGIN=https://drinkmate-ruddy.vercel.app

# Urways Payment Configuration
URWAYS_TERMINAL_ID=aqualinesa
URWAYS_TERMINAL_PASSWORD=URWAY@026_a
URWAYS_MERCHANT_KEY=e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d
URWAYS_API_URL=https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest

# Database and other configurations...
```

## 🔧 How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with:
   - **Name**: The variable name (e.g., `NEXT_PUBLIC_BASE_URL`)
   - **Value**: The variable value (e.g., `https://drinkmate-ruddy.vercel.app`)
   - **Environment**: Select "Production", "Preview", and "Development"

## ⚠️ Important Notes

- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Variables without `NEXT_PUBLIC_` are only available on the server
- Make sure to redeploy after adding environment variables
- Test the payment flow after deployment

## 🧪 Testing After Deployment

1. Deploy to Vercel with the environment variables
2. Test the payment flow:
   - Add item to cart
   - Go to checkout
   - Select Urways payment
   - Fill details and place order
   - Should redirect to Urways payment page
