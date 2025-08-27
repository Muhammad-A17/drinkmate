const mongoose = require('mongoose');
const Category = require('../Models/category-model');
const Subcategory = require('../Models/subcategory-model');

// Connect to MongoDB Atlas
require('dotenv').config();
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
    // Clear existing categories and subcategories
    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    console.log('Cleared existing categories and subcategories');
    
    // Create default categories
    const categories = [
      {
        name: 'Soda Makers',
        slug: 'sodamakers',
        description: 'Professional soda making machines',
        isActive: true
      },
      {
        name: 'Flavors',
        slug: 'flavors',
        description: 'Premium Italian flavor syrups',
        isActive: true
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Essential soda making accessories',
        isActive: true
      },
      {
        name: 'Starter Kits',
        slug: 'starter-kits',
        description: 'Complete starter packages',
        isActive: true
      }
    ];
    
    const createdCategories = await Category.insertMany(categories);
    console.log('Created categories:', createdCategories.map(c => c.name));
    
    // Create subcategories
    const subcategories = [
      // Soda Makers subcategories
      {
        name: 'Artic Series',
        slug: 'artic-series',
        description: 'Premium Artic soda makers',
        category: createdCategories[0]._id,
        isActive: true
      },
      {
        name: 'Luxe Series',
        slug: 'luxe-series',
        description: 'Luxury soda makers',
        category: createdCategories[0]._id,
        isActive: true
      },
      {
        name: 'Omni Series',
        slug: 'omni-series',
        description: 'Versatile Omni soda makers',
        category: createdCategories[0]._id,
        isActive: true
      },
      
      // Flavors subcategories
      {
        name: 'Classic Flavors',
        slug: 'classic-flavors',
        description: 'Traditional soda flavors',
        category: createdCategories[1]._id,
        isActive: true
      },
      {
        name: 'Premium Flavors',
        slug: 'premium-flavors',
        description: 'Exclusive premium flavors',
        category: createdCategories[1]._id,
        isActive: true
      },
      {
        name: 'Mocktail Flavors',
        slug: 'mocktail-flavors',
        description: 'Non-alcoholic cocktail flavors',
        category: createdCategories[1]._id,
        isActive: true
      },
      
      // Accessories subcategories
      {
        name: 'Bottles',
        slug: 'bottles',
        description: 'Premium soda bottles',
        category: createdCategories[2]._id,
        isActive: true
      },
      {
        name: 'CO2 Cylinders',
        slug: 'co2-cylinders',
        description: 'Carbon dioxide cylinders',
        category: createdCategories[2]._id,
        isActive: true
      },
      {
        name: 'Tools',
        slug: 'tools',
        description: 'Soda making tools and equipment',
        category: createdCategories[2]._id,
        isActive: true
      },
      
      // Starter Kits subcategories
      {
        name: 'Basic Kits',
        slug: 'basic-kits',
        description: 'Essential starter packages',
        category: createdCategories[3]._id,
        isActive: true
      },
      {
        name: 'Premium Kits',
        slug: 'premium-kits',
        description: 'Advanced starter packages',
        category: createdCategories[3]._id,
        isActive: true
      }
    ];
    
    const createdSubcategories = await Subcategory.insertMany(subcategories);
    console.log('Created subcategories:', createdSubcategories.map(s => s.name));
    
    console.log('✅ Default categories and subcategories created successfully!');
    console.log('Categories:', createdCategories.length);
    console.log('Subcategories:', createdSubcategories.length);
    
  } catch (error) {
    console.error('Error creating default categories:', error);
  } finally {
    mongoose.connection.close();
  }
});
