const axios = require('axios');

async function testProductAPI() {
  try {
    console.log('🔍 Testing product API...');

    // Test 1: Get all products
    console.log('\n📋 Getting all products...');
    const productsResponse = await axios.get('http://localhost:3000/shop/products');
    const productsData = productsResponse.data;

    if (productsResponse.status === 200) {
      console.log('✅ Products endpoint working');
      console.log('📊 Total products found:', productsData.products ? productsData.products.length : 'N/A');

      if (productsData.products && productsData.products.length > 0) {
        console.log('\n📝 First few products:');
        productsData.products.slice(0, 3).forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} (slug: ${product.slug})`);
        });

        // Check if the specific product exists
        const targetSlug = 'drinkmate-soda-maker-machine';
        const foundProduct = productsData.products.find(p => p.slug === targetSlug);

        if (foundProduct) {
          console.log(`\n✅ Product found: ${foundProduct.name}`);
          console.log(`📄 Slug: ${foundProduct.slug}`);
          console.log(`🆔 ID: ${foundProduct._id}`);
        } else {
          console.log(`\n❌ Product with slug '${targetSlug}' not found`);
          console.log('💡 Available slugs:', productsData.products.map(p => p.slug).join(', '));
        }
      } else {
        console.log('⚠️ No products found in database');
      }
    } else {
      console.log('❌ Products endpoint failed:', productsResponse.status, productsData);
    }

    // Test 2: Try to get the specific product
    console.log('\n🔍 Testing specific product endpoint...');
    try {
      const specificResponse = await axios.get('http://localhost:3000/shop/products/drinkmate-soda-maker-machine');
      console.log('📡 Specific product response:', specificResponse.status);
      console.log('✅ Product found:', specificResponse.data.product?.name);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Product not found (404)');
      } else {
        console.log('❌ Error:', error.response?.status, error.response?.data);
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testProductAPI();
