// Test script to debug flavor page API calls
const axios = require('axios');

async function testFlavorPageAPIs() {
  console.log('Testing Flavor Page API calls...\n');
  
  try {
    // Test 1: Get categories
    console.log('1. Testing categories API...');
    const categoriesResponse = await axios.get('http://localhost:3002/api/shop/categories');
    console.log('Categories response:', {
      success: categoriesResponse.data.success,
      categoriesCount: categoriesResponse.data.categories?.length || 0,
      flavorsCategory: categoriesResponse.data.categories?.find(c => c.slug === 'flavors')
    });
    
    // Test 2: Get products by category
    console.log('\n2. Testing products by category API...');
    const productsResponse = await axios.get('http://localhost:3002/api/shop/categories/flavors/products');
    console.log('Products response:', {
      success: productsResponse.data.success,
      productsCount: productsResponse.data.products?.length || 0,
      category: productsResponse.data.category?.name
    });
    
    // Test 3: Get bundles
    console.log('\n3. Testing bundles API...');
    const bundlesResponse = await axios.get('http://localhost:3002/api/shop/bundles?category=flavors');
    console.log('Bundles response:', {
      success: bundlesResponse.data.success,
      bundlesCount: bundlesResponse.data.bundles?.length || 0
    });
    
    console.log('\n✅ All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testFlavorPageAPIs();
