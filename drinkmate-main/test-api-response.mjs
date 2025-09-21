// Test script to check API response
import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing API response...');
    
    // Test the backend directly
    const backendResponse = await fetch('http://localhost:3000/products?limit=2');
    const backendData = await backendResponse.json();
    
    console.log('Backend Response:');
    console.log('Success:', backendData.success);
    console.log('Products count:', backendData.products?.length || 0);
    
    if (backendData.products && backendData.products.length > 0) {
      const firstProduct = backendData.products[0];
      console.log('First product:');
      console.log('- Name:', firstProduct.name);
      console.log('- Images:', firstProduct.images);
      console.log('- Image count:', firstProduct.images?.length || 0);
      if (firstProduct.images && firstProduct.images.length > 0) {
        console.log('- First image:', firstProduct.images[0]);
      }
    }
    
    // Test the frontend API route
    const frontendResponse = await fetch('http://localhost:3001/api/shop/products?limit=2');
    const frontendData = await frontendResponse.json();
    
    console.log('\nFrontend API Response:');
    console.log('Success:', frontendData.success);
    console.log('Products count:', frontendData.products?.length || 0);
    
    if (frontendData.products && frontendData.products.length > 0) {
      const firstProduct = frontendData.products[0];
      console.log('First product:');
      console.log('- Name:', firstProduct.name);
      console.log('- Images:', firstProduct.images);
      console.log('- Image count:', firstProduct.images?.length || 0);
      if (firstProduct.images && firstProduct.images.length > 0) {
        console.log('- First image:', firstProduct.images[0]);
      }
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI();
