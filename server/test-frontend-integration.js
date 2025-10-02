const axios = require('axios');

// Test the frontend-backend integration
async function testFrontendIntegration() {
  console.log('🧪 Testing Frontend-Backend Integration');
  console.log('=====================================');

  try {
    // First, login to get auth token
    console.log('📝 Step 1: Login to get auth token...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'aisha.mutairi@example.com',
      password: 'Faizanhassan1999'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Test creating a product with proper image structure
    console.log('\n📝 Step 2: Test product creation with proper image structure...');
    const testProduct = {
      name: 'Test Product Frontend',
      slug: 'test-product-frontend',
      description: 'Test product created from frontend integration test',
      shortDescription: 'Frontend test product',
      fullDescription: 'This is a test product created to verify frontend-backend integration',
      price: 25.99,
      originalPrice: 35.99,
      stock: 50,
      category: 'energy-drink',
      subcategory: 'premium',
      images: [
        {
          url: 'https://res.cloudinary.com/da6dzmflp/image/upload/v1759395896/drinkmate/test-image.png',
          alt: 'Test Product Frontend',
          isPrimary: true
        }
      ],
      colors: [],
      isBestSeller: false,
      isNewProduct: true,
      isFeatured: false,
      sku: 'TEST-FRONTEND-001',
      status: 'active',
      trackInventory: true,
      lowStockThreshold: 10,
      currency: 'SAR',
      salesCount: 0,
      viewCount: 0,
      rating: {
        average: 0,
        count: 0
      }
    };

    const createResponse = await axios.post('http://localhost:3000/api/admin/products', testProduct, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Product creation successful');
    console.log('📊 Response:', createResponse.data);

    const productId = createResponse.data.product._id;
    console.log('🆔 Product ID:', productId);

    // Test updating the product
    console.log('\n📝 Step 3: Test product update...');
    const updateData = {
      ...testProduct,
      name: 'Updated Test Product Frontend',
      price: 29.99,
      images: [
        {
          url: 'https://res.cloudinary.com/da6dzmflp/image/upload/v1759395896/drinkmate/updated-test-image.png',
          alt: 'Updated Test Product Frontend',
          isPrimary: true
        }
      ]
    };

    const updateResponse = await axios.put(`http://localhost:3000/api/admin/products/${productId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Product update successful');
    console.log('📊 Response:', updateResponse.data);

    // Clean up - delete the test product
    console.log('\n📝 Step 4: Cleanup - delete test product...');
    await axios.delete(`http://localhost:3000/api/admin/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Test product deleted');

    console.log('\n🎉 All tests passed! Frontend-backend integration is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('📊 Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

testFrontendIntegration();
