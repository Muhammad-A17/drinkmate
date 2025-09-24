// Test script for redirect flow functionality
// Run this in browser console on localhost:3000

console.log('🧪 Starting Redirect Flow Tests...');

// Test 1: Check if cart popup has login/register links
function testCartPopupLinks() {
  console.log('📋 Test 1: Checking cart popup links...');
  
  // This would need to be run manually in browser
  console.log('Manual test required:');
  console.log('1. Add items to cart');
  console.log('2. Open cart popup');
  console.log('3. Check for "Sign In" and "Create Account" links');
  console.log('4. Verify links have ?redirect=/cart parameter');
}

// Test 2: Check login page redirect handling
function testLoginRedirect() {
  console.log('🔐 Test 2: Checking login page redirect...');
  
  const currentUrl = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect');
  
  if (redirect) {
    console.log('✅ Redirect parameter found:', redirect);
  } else {
    console.log('ℹ️ No redirect parameter in current URL');
  }
}

// Test 3: Check checkout page auto-fill
function testCheckoutAutoFill() {
  console.log('📝 Test 3: Checking checkout auto-fill...');
  
  // Check if we're on checkout page
  if (window.location.pathname === '/checkout') {
    console.log('✅ On checkout page');
    
    // Check for user data in console logs
    console.log('Look for "User data for checkout:" in console logs');
    
    // Check form fields
    const firstNameField = document.querySelector('input[name="firstName"]');
    const emailField = document.querySelector('input[name="email"]');
    
    if (firstNameField && firstNameField.value) {
      console.log('✅ First name auto-filled:', firstNameField.value);
    } else {
      console.log('ℹ️ First name not auto-filled (guest checkout)');
    }
    
    if (emailField && emailField.value) {
      console.log('✅ Email auto-filled:', emailField.value);
    } else {
      console.log('ℹ️ Email not auto-filled (guest checkout)');
    }
  } else {
    console.log('ℹ️ Not on checkout page, navigate to /checkout to test');
  }
}

// Test 4: Simulate redirect flow
function simulateRedirectFlow() {
  console.log('🔄 Test 4: Simulating redirect flow...');
  
  // Test URLs
  const testUrls = [
    '/login?redirect=/cart',
    '/register?redirect=/cart',
    '/cart',
    '/checkout'
  ];
  
  console.log('Test URLs:');
  testUrls.forEach(url => {
    console.log(`- http://localhost:3000${url}`);
  });
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running all redirect flow tests...\n');
  
  testCartPopupLinks();
  console.log('');
  
  testLoginRedirect();
  console.log('');
  
  testCheckoutAutoFill();
  console.log('');
  
  simulateRedirectFlow();
  console.log('');
  
  console.log('✅ All tests completed!');
  console.log('📋 Manual testing required for full validation');
}

// Export functions for manual testing
window.testRedirectFlow = {
  testCartPopupLinks,
  testLoginRedirect,
  testCheckoutAutoFill,
  simulateRedirectFlow,
  runAllTests
};

console.log('🔧 Test functions loaded. Run testRedirectFlow.runAllTests() to start testing.');
