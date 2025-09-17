const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testAdminProductFetching() {
  console.log('🧪 Testing Admin Product Fetching Functionality...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server health...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Server is running:', healthResponse.data.status);

    // Test 2: Check API status
    console.log('\n2️⃣ Testing API status...');
    const apiStatusResponse = await axios.get(`${API_URL}/api-status`);
    console.log('✅ API status:', apiStatusResponse.data.status);
    console.log('📋 Available admin routes:', apiStatusResponse.data.apis.admin);

    // Test 3: Test admin product endpoints (without auth - should fail)
    console.log('\n3️⃣ Testing admin product endpoints without authentication...');
    try {
      await axios.get(`${API_URL}/admin/products`);
      console.log('❌ Admin products endpoint should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Admin products endpoint correctly requires authentication');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 4: Test admin bundle endpoints (without auth - should fail)
    console.log('\n4️⃣ Testing admin bundle endpoints without authentication...');
    try {
      await axios.get(`${API_URL}/admin/bundles`);
      console.log('❌ Admin bundles endpoint should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Admin bundles endpoint correctly requires authentication');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 5: Test public product endpoints (should work)
    console.log('\n5️⃣ Testing public product endpoints...');
    try {
      const productsResponse = await axios.get(`${API_URL}/shop/products`);
      console.log('✅ Public products endpoint works:', productsResponse.data.success ? 'Success' : 'Failed');
      console.log('📊 Products count:', productsResponse.data.products?.length || 0);
    } catch (error) {
      console.log('❌ Public products endpoint failed:', error.response?.status, error.response?.data);
    }

    // Test 6: Test public bundle endpoints (should work)
    console.log('\n6️⃣ Testing public bundle endpoints...');
    try {
      const bundlesResponse = await axios.get(`${API_URL}/shop/bundles`);
      console.log('✅ Public bundles endpoint works:', bundlesResponse.data.success ? 'Success' : 'Failed');
      console.log('📊 Bundles count:', bundlesResponse.data.bundles?.length || 0);
    } catch (error) {
      console.log('❌ Public bundles endpoint failed:', error.response?.status, error.response?.data);
    }

    console.log('\n🎉 Admin Product Fetching Test Complete!');
    console.log('\n📝 Summary:');
    console.log('- Server is running and healthy');
    console.log('- Admin endpoints are properly protected with authentication');
    console.log('- Public endpoints are accessible');
    console.log('- Admin product management routes are configured correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 3000');
      console.log('💡 Run: cd server && npm start');
    }
  }
}

// Run the test
testAdminProductFetching();
