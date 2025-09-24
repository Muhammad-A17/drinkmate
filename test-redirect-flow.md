# Redirect Flow Testing Plan

## Test Scenarios

### 1. Guest Checkout Flow
**Steps:**
1. Open website (not logged in)
2. Add items to cart
3. Open cart popup
4. Verify "Secure Checkout" button is visible
5. Verify "Sign In or Create Account for faster checkout" text is visible
6. Click "Secure Checkout"
7. Verify redirect to checkout page
8. Verify checkout form is empty (no auto-fill)
9. Fill out checkout form manually
10. Complete checkout process

**Expected Results:**
- Guest can checkout without login
- Login/register links are available but not required
- Checkout form works for guests

### 2. Login-Then-Checkout Flow
**Steps:**
1. Open website (not logged in)
2. Add items to cart
3. Open cart popup
4. Click "Sign In" link
5. Verify redirect to login page with `?redirect=/cart`
6. Login with valid credentials
7. Verify redirect back to cart page
8. Click "Secure Checkout"
9. Verify checkout form auto-fills with user data
10. Complete checkout

**Expected Results:**
- Redirect parameter is preserved through login
- User returns to cart after login
- Checkout form auto-fills with account data

### 3. Register-Then-Checkout Flow
**Steps:**
1. Open website (not logged in)
2. Add items to cart
3. Open cart popup
4. Click "Create Account" link
5. Verify redirect to register page with `?redirect=/cart`
6. Register with new account
7. Verify redirect to login page with success message and redirect parameter
8. Login with new credentials
9. Verify redirect back to cart page
10. Click "Secure Checkout"
11. Verify checkout form auto-fills with account data

**Expected Results:**
- Redirect parameter is preserved through registration
- User goes through login after registration
- User returns to cart after login
- Checkout form auto-fills with new account data

### 4. Empty Cart Flow
**Steps:**
1. Open website (not logged in)
2. Open cart popup (should be empty)
3. Verify "Sign In" and "Create Account" links are visible
4. Click "Sign In"
5. Verify redirect to login page with `?redirect=/cart`
6. Login successfully
7. Verify redirect back to cart page (still empty)

**Expected Results:**
- Empty cart shows login/register options
- Redirect works even with empty cart
- User returns to cart after login

## Test Data

### User Account for Testing
- **Email:** test@example.com
- **Password:** test123
- **Name:** Test User
- **Phone:** +966501234567

### Test Products
- Add any available products to cart for testing

## Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (if on Mac)
- Mobile browsers

## Expected Console Logs
- "User data for checkout:" when user logs in and goes to checkout
- "Redirect path set to: /cart" when login page loads with redirect
- Cart item debug logs in development mode
