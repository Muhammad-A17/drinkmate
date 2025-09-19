const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/drinkmate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Import the Product model
const Product = require('./Models/product-model');

async function debugMongooseSave() {
  try {
    console.log('🔍 Testing Mongoose save with problematic fields...');

    // Test data with the problematic fields
    const testData = {
      name: "Debug Test Product",
      description: "Main description",
      shortDescription: "Short description test",
      fullDescription: "Full description test",
      sku: "DEBUG-TEST-001",
      category: "energy-drink",
      subcategory: "premium",
      price: 25.99,
      stock: 100,
      colors: [
        { name: "Red", hexCode: "#FF0000", inStock: true },
        { name: "Blue", hexCode: "#0000FF", inStock: true }
      ],
      images: [
        { url: "https://example.com/image1.jpg", alt: "Image 1", isPrimary: true }
      ],
      weight: { value: 500, unit: "g" },
      dimensions: { length: 10, width: 5, height: 15, unit: "cm" }
    };

    console.log('📝 Creating product with data:', JSON.stringify(testData, null, 2));

    // Create new product
    const product = new Product(testData);
    
    console.log('🔍 Product before save:');
    console.log('- shortDescription:', product.shortDescription);
    console.log('- fullDescription:', product.fullDescription);
    console.log('- colors:', product.colors);
    console.log('- Product object:', JSON.stringify(product.toObject(), null, 2));

    // Validate the product
    const validationError = product.validateSync();
    if (validationError) {
      console.error('❌ Validation error:', validationError);
      return;
    }

    console.log('✅ Validation passed');

    // Save the product
    await product.save();
    
    console.log('🔍 Product after save:');
    console.log('- shortDescription:', product.shortDescription);
    console.log('- fullDescription:', product.fullDescription);
    console.log('- colors:', product.colors);
    console.log('- Product object:', JSON.stringify(product.toObject(), null, 2));

    // Fetch the product from database
    const savedProduct = await Product.findById(product._id);
    
    console.log('🔍 Product fetched from DB:');
    console.log('- shortDescription:', savedProduct.shortDescription);
    console.log('- fullDescription:', savedProduct.fullDescription);
    console.log('- colors:', savedProduct.colors);
    console.log('- Product object:', JSON.stringify(savedProduct.toObject(), null, 2));

    // Clean up
    await Product.findByIdAndDelete(product._id);
    console.log('🧹 Test product deleted');

    console.log('✅ Debug test completed');

  } catch (error) {
    console.error('❌ Debug test failed:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
}

debugMongooseSave();
