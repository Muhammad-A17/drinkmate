const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function debugFrontendFlow() {
  try {
    console.log('🔍 DEBUGGING FRONTEND FLOW...\n');
    
    // Step 1: Login
    console.log('1️⃣ LOGGING IN...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'aisha.mutairi@example.com',
      password: 'Faizanhassan1999.'
    });
    
    if (!loginResponse.data.token) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Step 2: Create a test product with ALL fields
    console.log('2️⃣ CREATING TEST PRODUCT...');
    const testProduct = {
      name: `Debug Test Product ${Date.now()}`,
      description: 'Debug test description',
      shortDescription: 'Short debug description',
      fullDescription: 'Full debug description with details',
      price: 29.99,
      originalPrice: 39.99,
      stock: 100,
      category: 'energy-drink',
      subcategory: 'debug-subcategory',
      sku: `DEBUG-${Date.now()}`,
      images: [{
        url: 'https://example.com/debug.jpg',
        alt: 'Debug image',
        isPrimary: true
      }],
      colors: [{
        name: 'Red',
        hexCode: '#FF0000',
        inStock: true
      }, {
        name: 'Blue', 
        hexCode: '#0000FF',
        inStock: true
      }],
      bestSeller: true,
      newArrival: false,
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
      },
      status: 'active',
      trackInventory: true,
      lowStockThreshold: 10,
      currency: 'SAR'
    };
    
    console.log('📤 Sending product data:', JSON.stringify(testProduct, null, 2));
    
    const createResponse = await axios.post(`${API_BASE}/admin/products`, testProduct, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📥 Create response:', JSON.stringify(createResponse.data, null, 2));
    
    if (!createResponse.data.success) {
      throw new Error('Product creation failed');
    }
    
    const productId = createResponse.data.product._id;
    console.log('✅ Product created with ID:', productId);
    
    // Step 3: Fetch the product back immediately
    console.log('\n3️⃣ FETCHING PRODUCT BACK...');
    const fetchResponse = await axios.get(`${API_BASE}/shop/products/${productId}`);
    console.log('📥 Fetch response:', JSON.stringify(fetchResponse.data, null, 2));
    
    const fetchedProduct = fetchResponse.data.product;
    
    // Step 4: Check field persistence
    console.log('\n4️⃣ FIELD PERSISTENCE CHECK:');
    console.log('shortDescription:', fetchedProduct.shortDescription);
    console.log('fullDescription:', fetchedProduct.fullDescription);
    console.log('colors:', fetchedProduct.colors);
    console.log('weight:', fetchedProduct.weight);
    console.log('dimensions:', fetchedProduct.dimensions);
    console.log('subcategory:', fetchedProduct.subcategory);
    console.log('sku:', fetchedProduct.sku);
    
    // Step 5: Simulate frontend form data conversion
    console.log('\n5️⃣ SIMULATING FRONTEND FORM CONVERSION:');
    
    // Simulate how the frontend would convert the data for editing
    const formData = {
      name: fetchedProduct.name,
      description: fetchedProduct.description,
      shortDescription: fetchedProduct.shortDescription,
      fullDescription: fetchedProduct.fullDescription,
      price: fetchedProduct.price,
      originalPrice: fetchedProduct.originalPrice,
      stock: fetchedProduct.stock,
      category: fetchedProduct.category,
      subcategory: fetchedProduct.subcategory,
      sku: fetchedProduct.sku,
      images: fetchedProduct.images.map(img => img.url), // Convert to string array
      colors: fetchedProduct.colors.map(color => color.name), // Convert to string array
      weight: fetchedProduct.weight ? `${fetchedProduct.weight.value} ${fetchedProduct.weight.unit}` : '',
      dimensions: fetchedProduct.dimensions ? `${fetchedProduct.dimensions.length} x ${fetchedProduct.dimensions.width} x ${fetchedProduct.dimensions.height}` : '',
      isBestSeller: fetchedProduct.bestSeller,
      isNewProduct: fetchedProduct.newArrival,
      isFeatured: fetchedProduct.featured
    };
    
    console.log('📤 Form data (as frontend would send):', JSON.stringify(formData, null, 2));
    
    // Step 6: Simulate frontend payload creation
    console.log('\n6️⃣ SIMULATING FRONTEND PAYLOAD CREATION:');
    
    const productPayload = {
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.fullDescription || formData.shortDescription || formData.name,
      shortDescription: formData.shortDescription,
      fullDescription: formData.fullDescription,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      stock: parseInt(formData.stock),
      category: formData.category,
      subcategory: formData.subcategory,
      images: formData.images.map((img, index) => ({
        url: img,
        alt: formData.name,
        isPrimary: index === 0
      })),
      colors: formData.colors.map((color) => ({
        name: color,
        hexCode: '#000000',
        inStock: true
      })),
      bestSeller: formData.isBestSeller,
      newArrival: formData.isNewProduct,
      featured: formData.isFeatured,
      sku: formData.sku,
      weight: formData.weight ? {
        value: parseFloat(formData.weight.split(' ')[0]),
        unit: formData.weight.split(' ')[1] || 'g'
      } : undefined,
      dimensions: formData.dimensions ? (() => {
        const parts = formData.dimensions.split(' x ');
        if (parts.length === 3) {
          return {
            length: parseFloat(parts[0]) || 0,
            width: parseFloat(parts[1]) || 0,
            height: parseFloat(parts[2]) || 0,
            unit: 'cm'
          };
        }
        return undefined;
      })() : undefined
    };
    
    console.log('📤 Payload (as frontend would send):', JSON.stringify(productPayload, null, 2));
    
    // Step 7: Test update
    console.log('\n7️⃣ TESTING UPDATE...');
    const updateResponse = await axios.put(`${API_BASE}/admin/products/${productId}`, productPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📥 Update response:', JSON.stringify(updateResponse.data, null, 2));
    
    // Step 8: Fetch again to check persistence
    console.log('\n8️⃣ FETCHING AFTER UPDATE...');
    const finalFetchResponse = await axios.get(`${API_BASE}/shop/products/${productId}`);
    const finalProduct = finalFetchResponse.data.product;
    
    console.log('📥 Final fetch response:', JSON.stringify(finalProduct, null, 2));
    
    // Step 9: Final field check
    console.log('\n9️⃣ FINAL FIELD PERSISTENCE CHECK:');
    console.log('shortDescription:', finalProduct.shortDescription);
    console.log('fullDescription:', finalProduct.fullDescription);
    console.log('colors:', finalProduct.colors);
    console.log('weight:', finalProduct.weight);
    console.log('dimensions:', finalProduct.dimensions);
    console.log('subcategory:', finalProduct.subcategory);
    console.log('sku:', finalProduct.sku);
    
    // Check for missing fields
    const missingFields = [];
    if (!finalProduct.shortDescription) missingFields.push('shortDescription');
    if (!finalProduct.fullDescription) missingFields.push('fullDescription');
    if (!finalProduct.colors || finalProduct.colors.length === 0) missingFields.push('colors');
    if (!finalProduct.weight) missingFields.push('weight');
    if (!finalProduct.dimensions) missingFields.push('dimensions');
    
    if (missingFields.length > 0) {
      console.log('\n❌ MISSING FIELDS AFTER UPDATE:', missingFields);
    } else {
      console.log('\n✅ ALL FIELDS PERSISTED AFTER UPDATE');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugFrontendFlow();
