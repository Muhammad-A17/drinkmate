# Urways Payment Integration Setup Guide

## 🚀 Complete Urways Payment System Implementation

Your DrinkMate application now has a complete Urways payment integration with backend API processing.

## ✅ What's Been Implemented

### 1. **Backend Services**
- ✅ `server/Services/urways-service.js` - Complete Urways API integration
- ✅ `server/Router/payment-router.js` - Payment API routes
- ✅ Updated `server/Controller/order-controller.js` - Order processing with payment methods
- ✅ Updated `server/server.js` - Payment routes integration

### 2. **Frontend Integration**
- ✅ Updated `drinkmate-main/lib/payment-service.ts` - Backend API calls
- ✅ Existing `drinkmate-main/app/api/payments/urways/route.ts` - Frontend API route
- ✅ Checkout pages already configured for Urways

### 3. **API Endpoints Available**
- `POST /payments/urways` - Process Urways payment
- `POST /payments/urways/verify` - Verify payment status
- `POST /payments/urways/callback` - Handle Urways callbacks
- `POST /payments/urways/refund` - Process refunds
- `GET /payments/methods` - Get available payment methods

## 🔧 Environment Variables Setup

Add these to your `/server/.env` file:

```env
# Urways Payment Gateway Configuration
URWAYS_API_KEY=your_merchant_secret_key_here
URWAYS_SECRET_KEY=your_merchant_secret_key_here
URWAYS_MERCHANT_ID=your_merchant_id_here
URWAYS_TERMINAL_ID=your_terminal_id_here
URWAYS_TERMINAL_PASSWORD="#your_terminal_password_here"
URWAYS_ENVIRONMENT=sandbox

# Frontend Configuration
FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

## 🧪 Testing the Integration

### Step 1: Start the Backend Server
```bash
cd server
npm start
```

### Step 2: Start the Frontend
```bash
cd drinkmate-main
npm run dev
```

### Step 3: Test Payment Flow
1. Go to your shop and add items to cart
2. Proceed to checkout
3. Select "Urways" as payment method
4. Fill in delivery details
5. Click "Place Order"
6. You should be redirected to Urways payment page

## 🔍 How It Works

### Payment Flow:
1. **Frontend** → Creates order via `/checkout` API
2. **Backend** → Creates order with `paymentStatus: 'pending'`
3. **Frontend** → Calls `/api/payments/urways` with payment details
4. **Backend** → Processes payment with Urways API
5. **Urways** → Redirects user to payment page
6. **User** → Completes payment on Urways
7. **Urways** → Calls `/payments/urways/callback` with result
8. **Backend** → Updates order status based on payment result

### Key Features:
- ✅ Secure API key management
- ✅ Signature generation for Urways API
- ✅ Payment verification
- ✅ Callback handling
- ✅ Refund processing
- ✅ Error handling and logging
- ✅ Order status updates

## 🛠️ Configuration Details

### Urways Service Configuration:
- **Environment**: Set to `sandbox` for testing, `production` for live
- **API Base URL**: Automatically switches based on environment
- **Signature**: HMAC-SHA256 for secure API calls
- **Amount**: Automatically converts to halalas (multiply by 100)

### Order Processing:
- Orders with `urways` payment method start as `pending`
- Payment status updates to `paid` or `failed` based on Urways response
- Order status changes to `processing` when payment is successful

## 🚨 Important Notes

1. **Environment Variables**: Make sure all Urways credentials are correctly set
2. **Password Format**: Include the `#` symbol in quotes for the terminal password
3. **Testing**: Use `sandbox` environment for testing, `production` for live payments
4. **Callbacks**: Urways will call your callback URL to confirm payments
5. **Security**: Never commit your `.env` file to version control

## 🔧 Troubleshooting

### Common Issues:
1. **"Missing required fields"** - Check environment variables
2. **"Payment initiation failed"** - Verify Urways credentials
3. **"Unable to connect"** - Check network and Urways API status
4. **"Invalid signature"** - Verify secret key configuration

### Debug Steps:
1. Check server logs for detailed error messages
2. Verify environment variables are loaded correctly
3. Test Urways credentials with their API directly
4. Check network connectivity to Urways servers

## 📞 Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify your Urways account and credentials
3. Test with Urways sandbox environment first
4. Contact Urways support for API-related issues

## 🎉 Ready to Test!

Your Urways payment integration is now complete and ready for testing. The system will handle the entire payment flow from order creation to payment confirmation automatically.
