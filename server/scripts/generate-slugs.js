require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Product = require('../Models/product-model');
const Bundle = require('../Models/bundle-model');

// Connect to MongoDB using the same connection string as the server
const uri = process.env.MONGODB_URI || 'mongodb+srv://faizanhassan608:jWnMYMNtJK0M79Fa@cluster0.rvqclhq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔍 Connecting to MongoDB...');

mongoose.connect(uri, {
  connectTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
});

// Function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

// Function to ensure unique slug
async function ensureUniqueSlug(baseSlug, model, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existing = await model.findOne(query);
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Generate slugs for products
async function generateProductSlugs() {
  console.log('Generating slugs for products...');
  
  const products = await Product.find({ slug: { $exists: false } });
  console.log(`Found ${products.length} products without slugs`);
  
  for (const product of products) {
    const baseSlug = generateSlug(product.name);
    const uniqueSlug = await ensureUniqueSlug(baseSlug, Product, product._id);
    
    product.slug = uniqueSlug;
    await product.save();
    
    console.log(`Updated product: ${product.name} -> ${uniqueSlug}`);
  }
  
  console.log('Product slugs generation completed!');
}

// Generate slugs for bundles
async function generateBundleSlugs() {
  console.log('Generating slugs for bundles...');
  
  const bundles = await Bundle.find({ slug: { $exists: false } });
  console.log(`Found ${bundles.length} bundles without slugs`);
  
  for (const bundle of bundles) {
    const baseSlug = generateSlug(bundle.name);
    const uniqueSlug = await ensureUniqueSlug(baseSlug, Bundle, bundle._id);
    
    bundle.slug = uniqueSlug;
    await bundle.save();
    
    console.log(`Updated bundle: ${bundle.name} -> ${uniqueSlug}`);
  }
  
  console.log('Bundle slugs generation completed!');
}

// Main function
async function main() {
  try {
    console.log('Starting slug generation...');
    
    // Wait for connection to be established
    await new Promise((resolve, reject) => {
      mongoose.connection.once('open', () => {
        console.log('✅ Connected to MongoDB successfully!');
        resolve();
      });
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        reject(err);
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);
    });
    
    await generateProductSlugs();
    await generateBundleSlugs();
    
    console.log('All slugs generated successfully!');
  } catch (error) {
    console.error('Error generating slugs:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateProductSlugs, generateBundleSlugs };
