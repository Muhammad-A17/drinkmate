// Simple test script to verify API connectivity
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    console.log('Testing API connectivity...');
    
    // Test health endpoint
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check:', healthResponse.status);
    
    // Test products endpoint
    const productsResponse = await axios.get(`${API_URL}/api/products`);
    console.log('✅ Products API:', productsResponse.status);
    console.log('Products count:', productsResponse.data.products?.length || 0);
    
    // Test specific product by slug
    const productResponse = await axios.get(`${API_URL}/api/products/drinkmate-soda-maker-machine`);
    console.log('✅ Product by slug:', productResponse.status);
    console.log('Product found:', !!productResponse.data.product);
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
