# Urways Payment Test Guide

## Critical Environment Variables for Urways

Make sure these are set in your Vercel environment variables:

```bash
# Urways Payment Configuration (REQUIRED)
URWAYS_TERMINAL_ID=aqualinesa
URWAYS_TERMINAL_PASSWORD=URWAY@026_a
URWAYS_MERCHANT_KEY=e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d
URWAYS_API_URL=https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest

# API Configuration (REQUIRED)
NEXT_PUBLIC_API_URL=https://drinkmates.onrender.com
```

## Test Steps

### 1. Guest Checkout Test
1. Add a product to cart
2. Go to checkout
3. Fill in delivery details (use a real email)
4. Select Urways as payment method
5. Click "Place Order"
6. Should redirect to Urways payment page

### 2. Authenticated Checkout Test
1. Login to your account
2. Add a product to cart
3. Go to checkout
4. Fill in delivery details
5. Select Urways as payment method
6. Click "Place Order"
7. Should redirect to Urways payment page

## Expected Behavior

### ✅ Success Flow
1. Order is created successfully (guest or authenticated)
2. Urways payment request is generated
3. User is redirected to Urways payment page
4. Payment can be completed on Urways

### ❌ Failure Points to Check
1. **Order Creation Fails**: Check backend API connection
2. **Urways API Fails**: Check environment variables
3. **Authentication Error**: Should not happen anymore (fixed)
4. **Cart Items Removed**: Should not happen anymore (fixed)

## Debug Information

### Check Browser Console
Look for these logs:
- `🚀 Creating URWAYS payment request from server...`
- `🔐 Hash String:` (should show the hash string)
- `🔐 Generated Hash:` (should show the generated hash)
- `🚀 URWAYS Payment Response:` (should show Urways response)

### Check Network Tab
1. Look for POST request to `/api/payments/urways`
2. Should return 200 status with `success: true`
3. Should contain `paymentUrl` in response

### Common Issues

1. **"Request authentication failed" (659 error)**
   - Check if environment variables are set correctly
   - Verify hash generation is working

2. **"Missing required fields"**
   - Check if order data is being passed correctly
   - Verify customer email and name are provided

3. **"Payment initiation failed"**
   - Check Urways API response
   - Verify API URL is correct

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Backend API is running and accessible
- [ ] Urways credentials are correct
- [ ] Guest checkout works
- [ ] Authenticated checkout works
- [ ] Payment redirect works
- [ ] No console errors
