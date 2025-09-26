# 🚀 Urways Payment Production Readiness Checklist

## ✅ Issues Fixed

### **1. CORS Configuration**
- ✅ Added `https://drinkmate-ruddy.vercel.app` to allowed origins
- ✅ Added `https://drinkmates.vercel.app` as backup domain
- ✅ CORS now properly configured for production

### **2. Environment Variables**
- ✅ Moved hardcoded Urways credentials to environment variables
- ✅ Added fallback values for development
- ✅ Created comprehensive environment variables guide

### **3. Error Handling**
- ✅ Added proper validation for required fields
- ✅ Added timeout handling for API calls
- ✅ Added detailed error logging
- ✅ Added response validation

### **4. Security**
- ✅ Added security headers
- ✅ Added request validation
- ✅ Added proper error sanitization

## 🔧 Required Environment Variables

### **Vercel Frontend Environment Variables**
Add these to your Vercel project settings:

```bash
NEXT_PUBLIC_BASE_URL=https://drinkmate-ruddy.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://your-backend-server.herokuapp.com
URWAYS_TERMINAL_ID=aqualinesa
URWAYS_TERMINAL_PASSWORD=URWAY@026_a
URWAYS_MERCHANT_KEY=e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d
URWAYS_API_URL=https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest
```

### **Backend Server Environment Variables**
Add these to your backend server (Heroku/Railway/etc.):

```bash
FRONTEND_URL=https://drinkmate-ruddy.vercel.app
CORS_ORIGIN=https://drinkmate-ruddy.vercel.app
URWAYS_TERMINAL_ID=aqualinesa
URWAYS_TERMINAL_PASSWORD=URWAY@026_a
URWAYS_MERCHANT_KEY=e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d
URWAYS_API_URL=https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest
```

## 🧪 Testing Steps After Deployment

### **1. Deploy to Vercel**
1. Push all changes to your repository
2. Deploy to Vercel
3. Add environment variables in Vercel dashboard
4. Redeploy if needed

### **2. Test Payment Flow**
1. Go to your deployed site
2. Add a product to cart
3. Go to checkout
4. Fill in delivery details
5. Select "Urways" as payment method
6. Click "Place Order"
7. Should redirect to Urways payment page

### **3. Expected Behavior**
- ✅ No CORS errors in browser console
- ✅ Payment request is created successfully
- ✅ Redirect to Urways payment page works
- ✅ No authentication errors
- ✅ Guest checkout works

## 🚨 Common Issues & Solutions

### **CORS Error**
- **Symptom**: "CORS policy" error in browser
- **Solution**: Check that `https://drinkmate-ruddy.vercel.app` is in backend CORS origins

### **Environment Variable Error**
- **Symptom**: "undefined" values in logs
- **Solution**: Verify environment variables are set in Vercel dashboard

### **Payment Redirect Error**
- **Symptom**: Payment page doesn't load
- **Solution**: Check Urways credentials and API URL

### **Authentication Error**
- **Symptom**: "request authentication failed"
- **Solution**: Verify Urways hash generation is correct

## 📋 Pre-Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] Backend server has correct CORS configuration
- [ ] Urways credentials are valid and active
- [ ] All code changes are committed and pushed
- [ ] No linting errors
- [ ] Test locally with production URLs

## 🎯 Success Criteria

After deployment, you should be able to:
1. Add items to cart ✅
2. Go to checkout ✅
3. Fill delivery details ✅
4. Select Urways payment ✅
5. Click "Place Order" ✅
6. Get redirected to Urways payment page ✅
7. Complete payment (test with Urways test cards) ✅

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Vercel function logs
3. Check backend server logs
4. Verify all environment variables are set
5. Test with Urways sandbox first

---

**Ready for Production! 🚀**
