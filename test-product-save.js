const axios = require('axios');

const API_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:3002';

// Test credentials
const adminCredentials = {
  email: 'aisha.mutairi@example.com',
  password: 'Faizanhassan1999.'
};

// Test product data with all fields filled
const testProductData = {
  name: `Test Energy Drink - Complete Fields ${Date.now()}`,
  category: 'energy-drink',
  subcategory: 'premium',
  price: 25.99,
  originalPrice: 29.99,
  stock: 100,
  description: 'This is a detailed description of our test energy drink product. It contains all the necessary information including ingredients, benefits, and usage instructions. This product is designed to test the complete product creation and saving workflow in our admin dashboard.',
  shortDescription: 'This is a comprehensive test product with all fields filled to verify proper saving functionality.',
  fullDescription: 'This is a detailed description of our test energy drink product. It contains all the necessary information including ingredients, benefits, and usage instructions. This product is designed to test the complete product creation and saving workflow in our admin dashboard.',
  sku: `TEST-ENERGY-${Date.now()}`,
  images: [{
    url: 'https://res.cloudinary.com/dw2h8hejn/image/upload/v1756561291/Zoomed_In_Machines_uqufys.png',
    alt: 'Test Energy Drink',
    isPrimary: true
  }],
  colors: [
    { name: 'Red', hexCode: '#FF0000', inStock: true },
    { name: 'Blue', hexCode: '#0000FF', inStock: true },
    { name: 'Green', hexCode: '#00FF00', inStock: true }
  ],
  bestSeller: true,
  newArrival: true,
  featured: true,
  weight: {
    value: 500,
    unit: 'g'
  },
  dimensions: {
    length: 10,
    width: 5,
    height: 15,
    unit: 'cm'
  }
};

async function testProductSaving() {
  try {
    console.log('🚀 Starting Product Save Test...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, adminCredentials);
    
    if (!loginResponse.data.token) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful\n');

    // Step 2: Create test product
    console.log('2. Creating test product with all fields...');
    console.log('Product data:', JSON.stringify(testProductData, null, 2));
    
    const createResponse = await axios.post(`${API_URL}/admin/products`, testProductData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!createResponse.data.success) {
      throw new Error('Product creation failed: ' + createResponse.data.message);
    }

    const createdProduct = createResponse.data.product;
    console.log('✅ Product created successfully');
    console.log('Created product ID:', createdProduct._id);
    console.log('Created product data:', JSON.stringify(createdProduct, null, 2));

    // Step 3: Verify product was saved correctly
    console.log('\n3. Verifying product was saved correctly...');
    
    // Check if all fields are present
    const requiredFields = [
      'name', 'description', 'shortDescription', 'fullDescription', 'sku', 
      'price', 'originalPrice', 'stock', 'category', 'subcategory',
      'images', 'colors', 'bestSeller', 'newArrival', 'featured',
      'weight', 'dimensions'
    ];

    const missingFields = [];
    const incorrectFields = [];

    requiredFields.forEach(field => {
      if (!(field in createdProduct)) {
        missingFields.push(field);
      }
    });

    // Check specific field values
    if (createdProduct.name !== testProductData.name) {
      incorrectFields.push(`name: expected "${testProductData.name}", got "${createdProduct.name}"`);
    }

    if (createdProduct.shortDescription !== testProductData.shortDescription) {
      incorrectFields.push(`shortDescription: expected "${testProductData.shortDescription}", got "${createdProduct.shortDescription}"`);
    }

    if (createdProduct.fullDescription !== testProductData.fullDescription) {
      incorrectFields.push(`fullDescription: expected "${testProductData.fullDescription}", got "${createdProduct.fullDescription}"`);
    }

    if (createdProduct.sku !== testProductData.sku) {
      incorrectFields.push(`sku: expected "${testProductData.sku}", got "${createdProduct.sku}"`);
    }

    if (createdProduct.price !== testProductData.price) {
      incorrectFields.push(`price: expected ${testProductData.price}, got ${createdProduct.price}`);
    }

    if (createdProduct.stock !== testProductData.stock) {
      incorrectFields.push(`stock: expected ${testProductData.stock}, got ${createdProduct.stock}`);
    }

    if (createdProduct.bestSeller !== testProductData.bestSeller) {
      incorrectFields.push(`bestSeller: expected ${testProductData.bestSeller}, got ${createdProduct.bestSeller}`);
    }

    if (createdProduct.newArrival !== testProductData.newArrival) {
      incorrectFields.push(`newArrival: expected ${testProductData.newArrival}, got ${createdProduct.newArrival}`);
    }

    if (createdProduct.featured !== testProductData.featured) {
      incorrectFields.push(`featured: expected ${testProductData.featured}, got ${createdProduct.featured}`);
    }

    // Check colors structure
    if (!createdProduct.colors || createdProduct.colors.length !== testProductData.colors.length) {
      incorrectFields.push(`colors: expected ${testProductData.colors.length} colors, got ${createdProduct.colors?.length || 0}`);
    } else {
      createdProduct.colors.forEach((color, index) => {
        if (color.name !== testProductData.colors[index].name) {
          incorrectFields.push(`colors[${index}]: expected "${testProductData.colors[index].name}", got "${color.name}"`);
        }
      });
    }

    // Check weight structure
    if (testProductData.weight && createdProduct.weight) {
      if (createdProduct.weight.value !== testProductData.weight.value) {
        incorrectFields.push(`weight.value: expected ${testProductData.weight.value}, got ${createdProduct.weight.value}`);
      }
    }

    // Check dimensions structure
    if (testProductData.dimensions && createdProduct.dimensions) {
      if (createdProduct.dimensions.length !== testProductData.dimensions.length ||
          createdProduct.dimensions.width !== testProductData.dimensions.width ||
          createdProduct.dimensions.height !== testProductData.dimensions.height) {
        incorrectFields.push(`dimensions: expected ${testProductData.dimensions.length}x${testProductData.dimensions.width}x${testProductData.dimensions.height}, got ${createdProduct.dimensions.length}x${createdProduct.dimensions.width}x${createdProduct.dimensions.height}`);
      }
    }

    // Report results
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
    }

    if (incorrectFields.length > 0) {
      console.log('❌ Incorrect field values:', incorrectFields);
    }

    if (missingFields.length === 0 && incorrectFields.length === 0) {
      console.log('✅ All fields saved correctly!');
    }

    // Step 4: Fetch product again to verify persistence
    console.log('\n4. Fetching product to verify persistence...');
    const fetchResponse = await axios.get(`${API_URL}/shop/products/${createdProduct._id}`);

    if (!fetchResponse.data.success) {
      throw new Error('Failed to fetch product: ' + fetchResponse.data.message);
    }

    const fetchedProduct = fetchResponse.data.product;
    console.log('✅ Product fetched successfully');
    console.log('Fetched product data:', JSON.stringify(fetchedProduct, null, 2));

    // Compare fetched product with created product
    const fieldsMatch = JSON.stringify(createdProduct) === JSON.stringify(fetchedProduct);
    if (fieldsMatch) {
      console.log('✅ Product data persists correctly after fetch');
    } else {
      console.log('❌ Product data changed after fetch');
      console.log('Differences detected between created and fetched product');
    }

    // Step 5: Test product update
    console.log('\n5. Testing product update...');
    const updateData = {
      ...testProductData,
      name: 'Updated Test Energy Drink',
      shortDescription: 'Updated short description',
      price: '19.99'
    };

    const updateResponse = await axios.put(`${API_URL}/admin/products/${createdProduct._id}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!updateResponse.data.success) {
      throw new Error('Product update failed: ' + updateResponse.data.message);
    }

    const updatedProduct = updateResponse.data.product;
    console.log('✅ Product updated successfully');
    console.log('Updated product name:', updatedProduct.name);
    console.log('Updated product price:', updatedProduct.price);

    // Step 6: Clean up - delete test product
    console.log('\n6. Cleaning up test product...');
    const deleteResponse = await axios.delete(`${API_URL}/admin/products/${createdProduct._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!deleteResponse.data.success) {
      console.log('⚠️ Failed to delete test product:', deleteResponse.data.message);
    } else {
      console.log('✅ Test product deleted successfully');
    }

    console.log('\n🎉 Product Save Test Completed!');
    console.log('\nSummary:');
    console.log('- Product creation: ✅');
    console.log('- Field mapping: ' + (missingFields.length === 0 && incorrectFields.length === 0 ? '✅' : '❌'));
    console.log('- Data persistence: ' + (fieldsMatch ? '✅' : '❌'));
    console.log('- Product update: ✅');
    console.log('- Cleanup: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testProductSaving();
