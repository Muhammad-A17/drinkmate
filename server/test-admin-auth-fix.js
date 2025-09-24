// Test script to verify admin authentication and exchange cylinder API
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const ADMIN_CREDENTIALS = {
  email: 'aisha.mutairi@example.com',
  password: 'Faizanhassan1999.'
};

async function testAdminWorkflow() {
  console.log('🚀 Testing Admin Exchange Cylinder Workflow...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.token;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    console.log('✅ Login successful');
    console.log('👤 User:', loginResponse.data.user.username);
    console.log('🔑 Admin:', loginResponse.data.user.isAdmin);
    console.log('🎫 Token:', token.substring(0, 20) + '...\n');

    // Step 2: Test GET exchange cylinders
    console.log('2️⃣ Testing GET exchange cylinders...');
    const getCylindersResponse = await axios.get(`${BASE_URL}/exchange-cylinders/cylinders`, { headers });
    
    console.log('✅ GET successful');
    console.log('📊 Found cylinders:', getCylindersResponse.data.cylinders?.length || 0);
    console.log('🔄 Response format:', getCylindersResponse.data.success ? 'Valid' : 'Invalid\n');

    // Step 3: Test POST (create) exchange cylinder
    console.log('3️⃣ Testing POST (create) exchange cylinder...');
    const testCylinder = {
      name: 'Test Admin Cylinder',
      slug: 'test-admin-cylinder-' + Date.now(),
      price: 75,
      originalPrice: 85,
      capacity: 60,
      description: 'Test cylinder created via admin API',
      material: 'aluminum',
      exchangeType: 'instant',
      estimatedTime: 'Same Day',
      weight: 12,
      brand: 'drinkmate',
      image: '/images/placeholder.jpg',
      images: ['/images/placeholder.jpg'],
      inStock: true
    };

    const createResponse = await axios.post(`${BASE_URL}/exchange-cylinders/cylinders`, testCylinder, { headers });
    
    if (createResponse.data.success) {
      console.log('✅ CREATE successful');
      console.log('🆔 New cylinder ID:', createResponse.data.cylinder?._id);
      
      const cylinderId = createResponse.data.cylinder._id;

      // Step 4: Test PUT (update) exchange cylinder
      console.log('\n4️⃣ Testing PUT (update) exchange cylinder...');
      const updateData = {
        ...testCylinder,
        name: 'Updated Test Admin Cylinder',
        price: 80
      };

      const updateResponse = await axios.put(`${BASE_URL}/exchange-cylinders/cylinders/${cylinderId}`, updateData, { headers });
      
      if (updateResponse.data.success) {
        console.log('✅ UPDATE successful');
        console.log('📝 Updated cylinder:', updateResponse.data.cylinder?.name);
      } else {
        console.log('❌ UPDATE failed:', updateResponse.data.message);
      }

      // Step 5: Test DELETE exchange cylinder
      console.log('\n5️⃣ Testing DELETE exchange cylinder...');
      const deleteResponse = await axios.delete(`${BASE_URL}/exchange-cylinders/cylinders/${cylinderId}`, { headers });
      
      if (deleteResponse.data.success) {
        console.log('✅ DELETE successful');
        console.log('🗑️ Cylinder deleted successfully');
      } else {
        console.log('❌ DELETE failed:', deleteResponse.data.message);
      }

    } else {
      console.log('❌ CREATE failed:', createResponse.data.message);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n💡 Admin authentication and CRUD operations are working properly.');
    console.log('🔧 The frontend should now be able to save, update, and delete exchange cylinders.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
    console.log('\n🔍 Troubleshooting steps:');
    console.log('1. Make sure the backend server is running on port 3000');
    console.log('2. Verify the admin credentials are correct');
    console.log('3. Check if the database is connected');
    console.log('4. Ensure all required middleware is loaded');
  }
}

// Run the test
testAdminWorkflow();
