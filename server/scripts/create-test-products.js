const mongoose = require('mongoose');
const Product = require('../Models/product-model');
const Category = require('../Models/category-model');

// Connect to MongoDB
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
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Get the first category (Soda Makers)
    const category = await Category.findOne({ slug: 'sodamakers' });
    if (!category) {
      console.error('No category found. Please run create-default-categories.js first.');
      return;
    }
    
    // Create test products
    const products = [
      {
        name: 'DrinkMate Soda Maker Machine',
        slug: 'drinkmate-soda-maker-machine',
        description: 'Professional-grade soda maker machine with advanced carbonation technology. Perfect for creating restaurant-quality sodas at home.',
        shortDescription: 'Professional soda maker with advanced carbonation technology',
        fullDescription: 'The DrinkMate Soda Maker Machine is a professional-grade appliance designed for creating restaurant-quality sodas at home. Featuring advanced carbonation technology, this machine delivers consistent results every time. Built with premium stainless steel construction, it offers durability and style. The easy-to-use interface makes it simple for anyone to create their favorite sodas, while the energy-efficient design ensures low operating costs. With quiet operation and professional results, this soda maker is perfect for both home use and small commercial applications.',
        price: 299.99,
        originalPrice: 399.99,
        sku: 'DM-SM-001',
        category: category._id.toString(),
        images: [
          {
            url: '/images/products/soda-maker-1.jpg',
            alt: 'DrinkMate Soda Maker Machine - Front View',
            isPrimary: true
          },
          {
            url: '/images/products/soda-maker-2.jpg',
            alt: 'DrinkMate Soda Maker Machine - Side View',
            isPrimary: false
          }
        ],
        image: '/images/products/soda-maker-1.jpg',
        stock: 50,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNew: false,
        isEcoFriendly: true,
        averageRating: 4.8,
        reviewCount: 127,
        features: [
          {
            title: 'Advanced Carbonation Technology',
            description: 'State-of-the-art carbonation system for perfect bubbles every time',
            icon: 'carbonation'
          },
          {
            title: 'Stainless Steel Construction',
            description: 'Premium materials ensure durability and longevity',
            icon: 'steel'
          },
          {
            title: 'Easy-to-Use Interface',
            description: 'Intuitive controls make soda making simple and enjoyable',
            icon: 'interface'
          },
          {
            title: 'Energy Efficient',
            description: 'Low power consumption for eco-friendly operation',
            icon: 'energy'
          },
          {
            title: 'Quiet Operation',
            description: 'Minimal noise for comfortable home use',
            icon: 'quiet'
          },
          {
            title: 'Professional Results',
            description: 'Restaurant-quality sodas every time',
            icon: 'quality'
          }
        ],
        specifications: [
          {
            name: 'Power',
            value: '120W'
          },
          {
            name: 'Capacity',
            value: '1.5L'
          },
          {
            name: 'Material',
            value: 'Stainless Steel'
          },
          {
            name: 'Weight',
            value: '3.2kg'
          },
          {
            name: 'Dimensions',
            value: '25cm x 20cm x 35cm'
          },
          {
            name: 'Warranty',
            value: '2 years'
          }
        ],
        safetyFeatures: [
          'Auto-shutoff safety',
          'Overpressure protection',
          'Child-safe design',
          'Certified materials'
        ],
        dimensions: {
          width: 25,
          height: 35,
          depth: 20,
          weight: 3.2
        },
        warranty: '2 years',
        certifications: ['CE', 'FCC', 'RoHS'],
        compatibility: ['Standard CO2 cylinders', 'Universal bottles'],
        tags: ['soda-maker', 'professional', 'stainless-steel', 'carbonation'],
        colors: [
          {
            name: 'Silver',
            hexCode: '#C0C0C0',
            inStock: true
          },
          {
            name: 'Black',
            hexCode: '#000000',
            inStock: true
          }
        ],
        sizes: ['Standard']
      },
      {
        name: 'DrinkMate Premium Flavor Pack',
        slug: 'drinkmate-premium-flavor-pack',
        description: 'Premium collection of Italian flavor syrups for creating authentic sodas. Includes 6 classic flavors.',
        shortDescription: 'Premium Italian flavor syrups collection',
        fullDescription: 'The DrinkMate Premium Flavor Pack features six carefully selected Italian flavor syrups, each crafted with authentic ingredients and traditional recipes. This collection includes classic flavors like Cola, Lemon, Orange, Cherry, Grape, and Root Beer. Each syrup is made with natural ingredients and contains no artificial preservatives, ensuring a pure and authentic taste experience. The 750ml bottles provide generous portions for multiple servings, and the syrups have a 24-month shelf life when stored at room temperature. Perfect for creating restaurant-quality sodas at home.',
        price: 49.99,
        originalPrice: 69.99,
        sku: 'DM-FP-001',
        category: category._id.toString(),
        images: [
          {
            url: '/images/products/flavor-pack-1.jpg',
            alt: 'DrinkMate Premium Flavor Pack - Collection View',
            isPrimary: true
          },
          {
            url: '/images/products/flavor-pack-2.jpg',
            alt: 'DrinkMate Premium Flavor Pack - Individual Bottles',
            isPrimary: false
          }
        ],
        image: '/images/products/flavor-pack-1.jpg',
        stock: 100,
        isActive: true,
        isFeatured: false,
        isBestSeller: true,
        isNew: true,
        isEcoFriendly: true,
        averageRating: 4.6,
        reviewCount: 89,
        features: [
          {
            title: '6 Premium Italian Flavors',
            description: 'Carefully selected authentic Italian flavor syrups',
            icon: 'flavors'
          },
          {
            title: 'Natural Ingredients',
            description: 'Made with real fruit extracts and natural flavors',
            icon: 'natural'
          },
          {
            title: 'No Artificial Preservatives',
            description: 'Pure ingredients for authentic taste',
            icon: 'pure'
          },
          {
            title: 'Long Shelf Life',
            description: '24-month shelf life for extended use',
            icon: 'shelf-life'
          },
          {
            title: 'Easy to Use',
            description: 'Simple mixing instructions for perfect results',
            icon: 'easy'
          },
          {
            title: 'Professional Quality',
            description: 'Restaurant-grade syrups for home use',
            icon: 'professional'
          }
        ],
        specifications: [
          {
            name: 'Flavors',
            value: '6 varieties'
          },
          {
            name: 'Volume',
            value: '750ml each'
          },
          {
            name: 'Ingredients',
            value: 'Natural'
          },
          {
            name: 'Shelf Life',
            value: '24 months'
          },
          {
            name: 'Storage',
            value: 'Room temperature'
          }
        ],
        tags: ['flavors', 'italian', 'premium', 'natural'],
        colors: [
          {
            name: 'Mixed',
            hexCode: '#FF6B6B',
            inStock: true
          }
        ],
        sizes: ['Standard']
      }
    ];
    
    const createdProducts = await Product.insertMany(products);
    console.log('✅ Test products created successfully!');
    console.log('Products created:', createdProducts.length);
    console.log('Product names:', createdProducts.map(p => p.name));
    console.log('Product slugs:', createdProducts.map(p => p.slug));
    
  } catch (error) {
    console.error('Error creating test products:', error);
  } finally {
    mongoose.connection.close();
  }
});
