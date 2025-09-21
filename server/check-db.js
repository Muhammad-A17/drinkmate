const mongoose = require('mongoose');
const Product = require('./Models/product-model');

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/drinkmates');
    console.log('Connected to MongoDB');
    
    const count = await Product.countDocuments();
    console.log('Total products:', count);
    
    const flavors = await Product.find({ category: { $regex: /flavor/i } });
    console.log('Flavor products:', flavors.length);
    
    if(flavors.length > 0) {
      console.log('Sample flavor product:', JSON.stringify(flavors[0], null, 2));
    }
    
    // Check all categories
    const categories = await Product.distinct('category');
    console.log('All categories:', categories);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDatabase();
