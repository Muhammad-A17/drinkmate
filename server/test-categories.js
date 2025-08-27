const fetch = require('node-fetch');

async function testCategoriesAPI() {
  try {
    console.log('🔍 Testing categories API...');
    
    // Test 1: Check if server is running
    const baseResponse = await fetch('http://localhost:3000/');
    console.log('✅ Server is running:', baseResponse.status);
    
    // Test 2: Check categories endpoint without auth
    try {
      const categoriesResponse = await fetch('http://localhost:3000/api/admin/categories');
      console.log('📡 Categories endpoint response (no auth):', categoriesResponse.status);
      
      if (categoriesResponse.status === 401) {
        console.log('✅ Endpoint exists but requires authentication');
      }
    } catch (error) {
      console.log('❌ Categories endpoint error:', error.message);
    }
    
    // Test 3: Check if create-default-categories endpoint exists
    try {
      const createResponse = await fetch('http://localhost:3000/api/admin/create-default-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      console.log('📡 Create default categories endpoint response (no auth):', createResponse.status);
      
      if (createResponse.status === 401) {
        console.log('✅ Endpoint exists but requires authentication');
      }
    } catch (error) {
      console.log('❌ Create default categories endpoint error:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testCategoriesAPI();
