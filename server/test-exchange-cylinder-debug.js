// Test script to debug exchange cylinder admin panel issues
const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'demo-admin-token'; // Replace with actual admin token

// Test data for creating an exchange cylinder
const testCylinderData = {
  name: "Test CO2 Cylinder Exchange",
  slug: "test-co2-cylinder-exchange",
  price: 45,
  originalPrice: 60,
  description: "Test description for CO2 cylinder exchange service",
  capacity: 60,
  material: "steel",
  exchangeType: "instant",
  estimatedTime: "Same Day",
  image: "/images/placeholder.jpg",
  images: ["/images/placeholder.jpg"],
  weight: 10,
  brand: "drinkmate",
  serviceLevel: "standard",
  status: "active",
  isAvailable: true,
  stock: 100,
  minStock: 10,
  exchangeFee: 0,
  deliveryFee: 0,
  pickupFee: 0,
  discount: 0,
  exchangeRadius: 50,
  pickupRequired: false,
  deliveryAvailable: true,
  serviceAreas: [],
  operatingHours: {
    monday: { start: "08:00", end: "18:00", closed: false },
    tuesday: { start: "08:00", end: "18:00", closed: false },
    wednesday: { start: "08:00", end: "18:00", closed: false },
    thursday: { start: "08:00", end: "18:00", closed: false },
    friday: { start: "08:00", end: "18:00", closed: false },
    saturday: { start: "08:00", end: "18:00", closed: false },
    sunday: { start: "08:00", end: "18:00", closed: false }
  },
  emergencyService: false,
  isBestSeller: false,
  isFeatured: false,
  isNewProduct: false,
  isEcoFriendly: false,
  averageRating: 0,
  totalReviews: 0,
  totalExchanges: 0
};

async function testExchangeCylinderAPI() {
  console.log('🔍 Testing Exchange Cylinder API...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    const healthResponse = await axios.get(`${API_BASE_URL}/exchange-cylinders/cylinders`);
    console.log('✅ Backend is running');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Cylinders count: ${healthResponse.data.cylinders?.length || 0}\n`);

    // Test 2: Test authentication
    console.log('2. Testing authentication...');
    try {
      const authResponse = await axios.get(`${API_BASE_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
      });
      console.log('✅ Authentication successful');
      console.log(`   User: ${authResponse.data.user?.username || 'Unknown'}\n`);
    } catch (authError) {
      console.log('❌ Authentication failed');
      console.log(`   Error: ${authError.response?.data?.message || authError.message}\n`);
    }

    // Test 3: Test creating exchange cylinder
    console.log('3. Testing exchange cylinder creation...');
    try {
      const createResponse = await axios.post(
        `${API_BASE_URL}/exchange-cylinders/cylinders`,
        testCylinderData,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Exchange cylinder created successfully');
      console.log(`   ID: ${createResponse.data.cylinder?._id}`);
      console.log(`   Name: ${createResponse.data.cylinder?.name}\n`);

      const cylinderId = createResponse.data.cylinder._id;

      // Test 4: Test updating exchange cylinder
      console.log('4. Testing exchange cylinder update...');
      const updateData = {
        ...testCylinderData,
        name: "Updated Test CO2 Cylinder Exchange",
        price: 50
      };
      
      const updateResponse = await axios.put(
        `${API_BASE_URL}/exchange-cylinders/cylinders/${cylinderId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Exchange cylinder updated successfully');
      console.log(`   Updated name: ${updateResponse.data.cylinder?.name}`);
      console.log(`   Updated price: ${updateResponse.data.cylinder?.price}\n`);

      // Test 5: Test deleting exchange cylinder
      console.log('5. Testing exchange cylinder deletion...');
      const deleteResponse = await axios.delete(
        `${API_BASE_URL}/exchange-cylinders/cylinders/${cylinderId}`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`
          }
        }
      );
      console.log('✅ Exchange cylinder deleted successfully\n');

    } catch (createError) {
      console.log('❌ Exchange cylinder creation/update/delete failed');
      console.log(`   Status: ${createError.response?.status}`);
      console.log(`   Error: ${createError.response?.data?.message || createError.message}`);
      console.log(`   Details: ${JSON.stringify(createError.response?.data, null, 2)}\n`);
    }

    // Test 6: Test frontend API route
    console.log('6. Testing frontend API route...');
    try {
      const frontendResponse = await axios.get('http://localhost:3001/api/exchange-cylinders/cylinders', {
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
      });
      console.log('✅ Frontend API route is working');
      console.log(`   Status: ${frontendResponse.status}\n`);
    } catch (frontendError) {
      console.log('❌ Frontend API route failed');
      console.log(`   Error: ${frontendError.response?.data?.message || frontendError.message}\n`);
    }

  } catch (error) {
    console.log('❌ Backend connection failed');
    console.log(`   Error: ${error.message}`);
    console.log(`   Make sure the backend server is running on ${API_BASE_URL}\n`);
  }
}

// Run the test
testExchangeCylinderAPI().catch(console.error);
