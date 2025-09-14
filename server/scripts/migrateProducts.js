const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Get the Product model
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
    
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);
    
    for (const product of products) {
      let needsUpdate = false;
      const updates = {};
      
      // Normalize price - ensure it's a number
      if (typeof product.price === 'string') {
        const numeric = parseFloat(product.price.replace(/[^\d.]/g, ''));
        updates.price = isNaN(numeric) ? 0 : numeric;
        updates.priceCents = Math.round(updates.price * 100);
        updates.currency = product.currency || 'SAR';
        needsUpdate = true;
      }
      
      // Ensure storefront visibility flags
      if (product.status !== 'active') {
        updates.status = 'active';
        needsUpdate = true;
      }
      
      // Add missing storefront fields
      if (product.published !== true) {
        updates.published = true;
        needsUpdate = true;
      }
      
      if (!product.visibility) {
        updates.visibility = 'public';
        needsUpdate = true;
      }
      
      if (product.isArchived !== false) {
        updates.isArchived = false;
        needsUpdate = true;
      }
      
      // Ensure stock is a positive number
      if (!product.stock || product.stock < 0) {
        updates.stock = 10;
        needsUpdate = true;
      }
      
      // Generate slug if missing
      if (!product.slug && product.name) {
        updates.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        needsUpdate = true;
      }
      
      // Ensure at least one image
      if (!product.images || product.images.length === 0) {
        updates.images = [{
          url: 'https://via.placeholder.com/400x400?text=No+Image',
          alt: product.name || 'Product Image',
          isPrimary: true,
          order: 0
        }];
        needsUpdate = true;
      }
      
      // Add publishedAt if missing
      if (!product.publishedAt) {
        updates.publishedAt = new Date();
        needsUpdate = true;
      }
      
      // Update the product if needed
      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, updates);
        console.log(`Updated product: ${product.name || product._id}`);
      }
    }
    
    console.log(`✅ Migration completed for ${products.length} products`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.connection.close();
  }
});
