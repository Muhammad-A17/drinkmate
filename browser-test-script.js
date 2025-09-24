// Browser Console Test Script for Redirect Flow
// Copy and paste this into your browser console on localhost:3000

(function() {
  console.log('🧪 Redirect Flow Test Script Loaded');
  console.log('=====================================');
  
  // Test functions
  const tests = {
    // Test 1: Check current page and URL parameters
    checkCurrentPage() {
      console.log('\n📄 Test 1: Current Page Analysis');
      console.log('Current URL:', window.location.href);
      console.log('Current Path:', window.location.pathname);
      
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      
      if (redirect) {
        console.log('✅ Redirect parameter found:', redirect);
      } else {
        console.log('ℹ️ No redirect parameter in current URL');
      }
      
      // Check if we're on a page with login/register links
      const loginLinks = document.querySelectorAll('a[href*="/login"]');
      const registerLinks = document.querySelectorAll('a[href*="/register"]');
      
      console.log('Login links found:', loginLinks.length);
      console.log('Register links found:', registerLinks.length);
      
      loginLinks.forEach((link, index) => {
        console.log(`Login link ${index + 1}:`, link.href);
      });
      
      registerLinks.forEach((link, index) => {
        console.log(`Register link ${index + 1}:`, link.href);
      });
    },
    
    // Test 2: Check cart popup functionality
    checkCartPopup() {
      console.log('\n🛒 Test 2: Cart Popup Analysis');
      
      // Look for cart-related elements
      const cartButtons = document.querySelectorAll('[data-testid="cart-button"], .cart-button, [aria-label*="cart" i]');
      const cartIcons = document.querySelectorAll('.shopping-cart, [class*="cart"]');
      
      console.log('Cart buttons found:', cartButtons.length);
      console.log('Cart icons found:', cartIcons.length);
      
      // Check for cart popup content
      const cartPopup = document.querySelector('[class*="cart-popup"], [class*="cart-popup"]');
      if (cartPopup) {
        console.log('✅ Cart popup found');
        
        const checkoutButtons = cartPopup.querySelectorAll('button');
        const loginLinks = cartPopup.querySelectorAll('a[href*="/login"]');
        const registerLinks = cartPopup.querySelectorAll('a[href*="/register"]');
        
        console.log('Checkout buttons in popup:', checkoutButtons.length);
        console.log('Login links in popup:', loginLinks.length);
        console.log('Register links in popup:', registerLinks.length);
        
        loginLinks.forEach((link, index) => {
          console.log(`Login link ${index + 1}:`, link.href);
        });
        
        registerLinks.forEach((link, index) => {
          console.log(`Register link ${index + 1}:`, link.href);
        });
      } else {
        console.log('ℹ️ Cart popup not found (may need to open it)');
      }
    },
    
    // Test 3: Check checkout page auto-fill
    checkCheckoutAutoFill() {
      console.log('\n📝 Test 3: Checkout Auto-Fill Analysis');
      
      if (window.location.pathname === '/checkout') {
        console.log('✅ On checkout page');
        
        // Check form fields
        const formFields = {
          firstName: document.querySelector('input[name="firstName"], input[placeholder*="first" i]'),
          lastName: document.querySelector('input[name="lastName"], input[placeholder*="last" i]'),
          email: document.querySelector('input[name="email"], input[type="email"]'),
          phone: document.querySelector('input[name="phone"], input[type="tel"]'),
          district: document.querySelector('input[name="district"]'),
          city: document.querySelector('input[name="city"]')
        };
        
        console.log('Form fields found:');
        Object.entries(formFields).forEach(([field, element]) => {
          if (element) {
            console.log(`✅ ${field}:`, element.value || '(empty)');
          } else {
            console.log(`❌ ${field}: not found`);
          }
        });
        
        // Check for user data in console logs
        console.log('Look for "User data for checkout:" in console logs above');
        
      } else {
        console.log('ℹ️ Not on checkout page, navigate to /checkout to test');
      }
    },
    
    // Test 4: Simulate navigation tests
    simulateNavigation() {
      console.log('\n🔄 Test 4: Navigation Simulation');
      
      const testUrls = [
        '/login?redirect=/cart',
        '/register?redirect=/cart',
        '/cart',
        '/checkout'
      ];
      
      console.log('Test URLs to try:');
      testUrls.forEach(url => {
        console.log(`- http://localhost:3000${url}`);
      });
      
      console.log('\nManual test steps:');
      console.log('1. Add items to cart');
      console.log('2. Open cart popup');
      console.log('3. Click "Sign In" or "Create Account"');
      console.log('4. Verify redirect parameter in URL');
      console.log('5. Login/register');
      console.log('6. Verify redirect back to cart');
      console.log('7. Click "Secure Checkout"');
      console.log('8. Verify auto-fill on checkout page');
    },
    
    // Test 5: Check authentication status
    checkAuthStatus() {
      console.log('\n🔐 Test 5: Authentication Status');
      
      // Check for auth-related elements
      const loginButtons = document.querySelectorAll('a[href*="/login"], button[onclick*="login"]');
      const logoutButtons = document.querySelectorAll('a[href*="/logout"], button[onclick*="logout"]');
      const userMenus = document.querySelectorAll('[class*="user-menu"], [class*="profile"]');
      
      console.log('Login buttons found:', loginButtons.length);
      console.log('Logout buttons found:', logoutButtons.length);
      console.log('User menus found:', userMenus.length);
      
      if (logoutButtons.length > 0 || userMenus.length > 0) {
        console.log('✅ User appears to be logged in');
      } else {
        console.log('ℹ️ User appears to be logged out');
      }
      
      // Check localStorage for auth tokens
      const authToken = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
      if (authToken) {
        console.log('✅ Auth token found in storage');
      } else {
        console.log('ℹ️ No auth token found in storage');
      }
    },
    
    // Run all tests
    runAll() {
      console.log('🚀 Running all tests...\n');
      this.checkCurrentPage();
      this.checkCartPopup();
      this.checkCheckoutAutoFill();
      this.checkAuthStatus();
      this.simulateNavigation();
      console.log('\n✅ All tests completed!');
    }
  };
  
  // Make tests available globally
  window.redirectFlowTests = tests;
  
  console.log('\n🔧 Available test functions:');
  console.log('- redirectFlowTests.checkCurrentPage()');
  console.log('- redirectFlowTests.checkCartPopup()');
  console.log('- redirectFlowTests.checkCheckoutAutoFill()');
  console.log('- redirectFlowTests.checkAuthStatus()');
  console.log('- redirectFlowTests.simulateNavigation()');
  console.log('- redirectFlowTests.runAll()');
  
  console.log('\n💡 Run redirectFlowTests.runAll() to start testing!');
})();
