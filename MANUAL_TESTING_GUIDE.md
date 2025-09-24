# 🧪 Manual Testing Guide - Redirect Flow

## Server Status
- **URL**: http://localhost:3000
- **Status**: Server should be running (check for port 3000 activity)

## Test Scenarios

### 🛒 Test 1: Guest Checkout Flow

**Steps:**
1. **Open Browser** → Navigate to `http://localhost:3000`
2. **Add Items to Cart** → Click "Add to Cart" on any product
3. **Open Cart Popup** → Click the cart icon in header
4. **Verify UI Elements:**
   - ✅ "Secure Checkout" button is visible and prominent
   - ✅ "Sign In or Create Account for faster checkout" text appears below
   - ✅ "View Full Cart" button is visible
5. **Test Guest Checkout** → Click "Secure Checkout"
6. **Verify Redirect** → Should redirect to `/checkout` page
7. **Verify Form** → Checkout form should be empty (no auto-fill)
8. **Test Form Fields** → Fill out the form manually

**Expected Results:**
- Guest can proceed to checkout without any login requirements
- Login/register options are available but not blocking
- Checkout form works normally for guests

---

### 🔐 Test 2: Login-Then-Checkout Flow

**Steps:**
1. **Start Fresh** → Open new incognito/private browser window
2. **Navigate to Site** → Go to `http://localhost:3000`
3. **Add Items to Cart** → Add 1-2 products to cart
4. **Open Cart Popup** → Click cart icon
5. **Click "Sign In"** → Click the "Sign In" link
6. **Verify URL** → Should be `http://localhost:3000/login?redirect=/cart`
7. **Login** → Use test credentials:
   - **Email**: `test@example.com`
   - **Password**: `test123`
8. **Verify Redirect** → Should redirect back to `/cart` page
9. **Click "Secure Checkout"** → Proceed to checkout
10. **Verify Auto-Fill** → Check if form fields are pre-filled with user data

**Expected Results:**
- Redirect parameter preserved through login flow
- User returns to cart after successful login
- Checkout form auto-fills with account information
- Console should show "User data for checkout:" log

---

### 📝 Test 3: Register-Then-Checkout Flow

**Steps:**
1. **Start Fresh** → Open new incognito/private browser window
2. **Navigate to Site** → Go to `http://localhost:3000`
3. **Add Items to Cart** → Add 1-2 products to cart
4. **Open Cart Popup** → Click cart icon
5. **Click "Create Account"** → Click the "Create Account" link
6. **Verify URL** → Should be `http://localhost:3000/register?redirect=/cart`
7. **Register New Account** → Fill out registration form:
   - **Username**: `testuser123`
   - **Email**: `testuser123@example.com`
   - **Password**: `TestPass123!`
   - **Confirm Password**: `TestPass123!`
   - **Agree to Terms**: Check the checkbox
8. **Verify Redirect** → Should redirect to login page with success message
9. **Login** → Use the new account credentials
10. **Verify Redirect** → Should redirect back to `/cart` page
11. **Click "Secure Checkout"** → Proceed to checkout
12. **Verify Auto-Fill** → Check if form fields are pre-filled with new account data

**Expected Results:**
- Complete registration → login → cart → checkout flow
- Redirect parameter preserved throughout entire flow
- New account data auto-fills in checkout form
- Success messages displayed appropriately

---

### 🛍️ Test 4: Empty Cart Flow

**Steps:**
1. **Start Fresh** → Open new incognito/private browser window
2. **Navigate to Site** → Go to `http://localhost:3000`
3. **Open Cart Popup** → Click cart icon (should be empty)
4. **Verify UI Elements:**
   - ✅ "Sign In" and "Create Account" links are visible
   - ✅ "Continue Shopping" button is visible
5. **Click "Sign In"** → Click the "Sign In" link
6. **Verify URL** → Should be `http://localhost:3000/login?redirect=/cart`
7. **Login** → Use test credentials
8. **Verify Redirect** → Should redirect back to `/cart` page (still empty)

**Expected Results:**
- Empty cart shows login/register options
- Redirect works even with empty cart
- User returns to cart after login

---

## 🔍 What to Look For

### Console Logs (Open Developer Tools → Console)
- `"User data for checkout:"` - When user logs in and goes to checkout
- `"Redirect path set to: /cart"` - When login page loads with redirect
- `"Cart item:"` - Debug logs for cart items (in development mode)

### URL Parameters
- Login URLs should contain `?redirect=/cart`
- Register URLs should contain `?redirect=/cart`
- Success redirects should preserve the redirect parameter

### Form Auto-Fill
- **First Name**: Should auto-fill from `user.firstName` or split from `user.name`
- **Last Name**: Should auto-fill from `user.lastName` or split from `user.name`
- **Email**: Should auto-fill from `user.email`
- **Phone**: Should auto-fill from `user.phone` (if available)

### UI Elements
- **Guest Users**: See "Sign In or Create Account for faster checkout"
- **Logged-in Users**: No additional login prompts, clean checkout experience
- **Cart Popup**: Always shows "Secure Checkout" button regardless of auth status

## 🐛 Troubleshooting

### If Server Won't Start
```bash
cd drinkmate-main
npm run dev
```

### If Port 3000 is Busy
- Check if another process is using port 3000
- Try `npm run dev` in a different terminal

### If Redirects Don't Work
- Check browser console for errors
- Verify URL parameters are present
- Check network tab for failed requests

### If Auto-Fill Doesn't Work
- Verify user is logged in
- Check console for "User data for checkout:" log
- Verify user object has the expected data structure

## ✅ Success Criteria

- [ ] Guests can checkout without any login requirements
- [ ] Login/register links appear for non-authenticated users
- [ ] Redirect parameters are preserved through login/register flows
- [ ] Users return to cart after successful authentication
- [ ] Checkout form auto-fills for logged-in users
- [ ] No breaking changes to existing functionality
- [ ] Clean, intuitive user experience

## 📊 Test Results

After completing all tests, document any issues or unexpected behavior here:

**Test 1 (Guest Checkout):** ✅ / ❌
**Test 2 (Login Flow):** ✅ / ❌  
**Test 3 (Register Flow):** ✅ / ❌
**Test 4 (Empty Cart):** ✅ / ❌

**Issues Found:**
- [ ] None
- [ ] [Describe any issues here]

**Overall Status:** ✅ PASS / ❌ FAIL
