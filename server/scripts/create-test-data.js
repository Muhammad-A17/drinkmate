const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../Models/product-model');
const Category = require('../Models/category-model');
const User = require('../Models/user-model');
const Order = require('../Models/order-model');

// Test data
const testProducts = [
  {
    name: "Premium Soda Maker",
    nameAr: "صانع الصودا المتميز",
    description: "Professional-grade soda maker for home use with advanced carbonation technology",
    descriptionAr: "صانع صودا منزلي متقدم بتقنية الكربنة المتطورة",
    sku: "SODA-001",
    slug: "premium-soda-maker",
    category: "accessories",
    price: 299.99,
    currency: "SAR",
    stock: 50,
    lowStockThreshold: 5,
    trackInventory: true,
    images: [
      {
        url: "https://via.placeholder.com/400x400?text=Premium+Soda+Maker",
        alt: "Premium Soda Maker",
        isPrimary: true,
        order: 0
      }
    ],
    tags: ["soda", "carbonation", "home", "premium"],
    status: "active",
    featured: true,
    newArrival: true,
    bestSeller: false,
    weight: { value: 2.5, unit: "kg" },
    dimensions: { length: 30, width: 20, height: 35, unit: "cm" },
    nutritionalInfo: {
      ingredients: ["Stainless steel", "Plastic components"],
      allergens: []
    },
    rating: { average: 4.5, count: 12 }
  },
  {
    name: "Classic CO2 Cylinder",
    nameAr: "أسطوانة ثاني أكسيد الكربون الكلاسيكية",
    description: "60L CO2 cylinder for soda makers, refillable and durable",
    descriptionAr: "أسطوانة ثاني أكسيد الكربون 60 لتر لصانعات الصودا، قابلة لإعادة التعبئة ومتينة",
    sku: "CO2-60L",
    slug: "classic-co2-cylinder",
    category: "accessories",
    price: 89.99,
    currency: "SAR",
    stock: 100,
    lowStockThreshold: 10,
    trackInventory: true,
    images: [
      {
        url: "https://via.placeholder.com/400x400?text=CO2+Cylinder",
        alt: "CO2 Cylinder",
        isPrimary: true,
        order: 0
      }
    ],
    tags: ["co2", "cylinder", "refillable", "soda"],
    status: "active",
    featured: false,
    newArrival: false,
    bestSeller: true,
    weight: { value: 1.2, unit: "kg" },
    dimensions: { length: 15, width: 15, height: 50, unit: "cm" },
    rating: { average: 4.8, count: 25 }
  },
  {
    name: "Energy Drink Mix - Berry Blast",
    nameAr: "خلطة مشروب الطاقة - انفجار التوت",
    description: "Delicious berry-flavored energy drink mix with natural ingredients",
    descriptionAr: "خلطة مشروب طاقة بنكهة التوت اللذيذة مع مكونات طبيعية",
    sku: "ENERGY-BERRY",
    slug: "energy-drink-berry-blast",
    category: "energy-drink",
    price: 15.99,
    currency: "SAR",
    stock: 200,
    lowStockThreshold: 20,
    trackInventory: true,
    images: [
      {
        url: "https://via.placeholder.com/400x400?text=Berry+Energy+Drink",
        alt: "Berry Energy Drink Mix",
        isPrimary: true,
        order: 0
      }
    ],
    tags: ["energy", "berry", "natural", "mix"],
    status: "active",
    featured: true,
    newArrival: false,
    bestSeller: true,
    weight: { value: 0.5, unit: "kg" },
    dimensions: { length: 10, width: 8, height: 15, unit: "cm" },
    nutritionalInfo: {
      ingredients: ["Natural berry flavor", "Caffeine", "B-vitamins", "Sugar"],
      allergens: ["None"]
    },
    rating: { average: 4.2, count: 18 }
  },
  {
    name: "Soda Syrup - Cola Classic",
    nameAr: "شراب الصودا - الكولا الكلاسيكية",
    description: "Authentic cola syrup for making your own soda at home",
    descriptionAr: "شراب كولا أصيل لصنع الصودا الخاصة بك في المنزل",
    sku: "SYRUP-COLA",
    slug: "soda-syrup-cola-classic",
    category: "cola",
    price: 12.99,
    currency: "SAR",
    stock: 150,
    lowStockThreshold: 15,
    trackInventory: true,
    images: [
      {
        url: "https://via.placeholder.com/400x400?text=Cola+Syrup",
        alt: "Cola Syrup",
        isPrimary: true,
        order: 0
      }
    ],
    tags: ["syrup", "cola", "soda", "classic"],
    status: "active",
    featured: false,
    newArrival: false,
    bestSeller: true,
    weight: { value: 0.75, unit: "kg" },
    dimensions: { length: 8, width: 8, height: 20, unit: "cm" },
    nutritionalInfo: {
      ingredients: ["Sugar", "Natural flavors", "Caramel color", "Phosphoric acid"],
      allergens: ["None"]
    },
    rating: { average: 4.6, count: 32 }
  },
  {
    name: "Starter Bundle - Complete Kit",
    nameAr: "حزمة البداية - مجموعة كاملة",
    description: "Everything you need to start making soda at home - soda maker, CO2 cylinder, and syrups",
    descriptionAr: "كل ما تحتاجه لبدء صنع الصودا في المنزل - صانع الصودا، أسطوانة ثاني أكسيد الكربون، والشراب",
    sku: "BUNDLE-STARTER",
    slug: "starter-bundle-complete-kit",
    category: "accessories",
    price: 399.99,
    currency: "SAR",
    stock: 25,
    lowStockThreshold: 3,
    trackInventory: true,
    images: [
      {
        url: "https://via.placeholder.com/400x400?text=Starter+Bundle",
        alt: "Starter Bundle",
        isPrimary: true,
        order: 0
      }
    ],
    tags: ["bundle", "starter", "complete", "kit"],
    status: "active",
    featured: true,
    newArrival: true,
    bestSeller: false,
    weight: { value: 4.0, unit: "kg" },
    dimensions: { length: 40, width: 30, height: 25, unit: "cm" },
    rating: { average: 4.7, count: 8 }
  }
];

const testCategories = [
  {
    name: "Soda Makers",
    nameAr: "صانعات الصودا",
    slug: "soda-makers",
    description: "Professional and home soda makers",
    descriptionAr: "صانعات الصودا المهنية والمنزلية",
    image: "https://via.placeholder.com/300x200?text=Soda+Makers",
    status: "active",
    featured: true,
    sortOrder: 1
  },
  {
    name: "CO2 Cylinders",
    nameAr: "أسطوانات ثاني أكسيد الكربون",
    slug: "co2-cylinders",
    description: "CO2 cylinders for carbonation",
    descriptionAr: "أسطوانات ثاني أكسيد الكربون للكربنة",
    image: "https://via.placeholder.com/300x200?text=CO2+Cylinders",
    status: "active",
    featured: true,
    sortOrder: 2
  },
  {
    name: "Energy Drinks",
    nameAr: "مشروبات الطاقة",
    slug: "energy-drinks",
    description: "Energy drink mixes and ready-to-drink",
    descriptionAr: "خلطات مشروبات الطاقة والجاهزة للشرب",
    image: "https://via.placeholder.com/300x200?text=Energy+Drinks",
    status: "active",
    featured: true,
    sortOrder: 3
  },
  {
    name: "Soda Syrups",
    nameAr: "شراب الصودا",
    slug: "soda-syrups",
    description: "Flavored syrups for making soda",
    descriptionAr: "شراب بنكهات لصنع الصودا",
    image: "https://via.placeholder.com/300x200?text=Soda+Syrups",
    status: "active",
    featured: false,
    sortOrder: 4
  },
  {
    name: "Bundles",
    nameAr: "الحزم",
    slug: "bundles",
    description: "Complete starter kits and bundles",
    descriptionAr: "مجموعات البداية الكاملة والحزم",
    image: "https://via.placeholder.com/300x200?text=Bundles",
    status: "active",
    featured: true,
    sortOrder: 5
  }
];

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing test data...');
    await Product.deleteMany({ sku: { $regex: /^(SODA-|CO2-|ENERGY-|SYRUP-|BUNDLE-)/ } });
    await Category.deleteMany({ slug: { $in: testCategories.map(c => c.slug) } });

    // Create categories
    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(testCategories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create products
    console.log('Creating products...');
    const createdProducts = await Product.insertMany(testProducts);
    console.log(`Created ${createdProducts.length} products`);

    // Update products with category references
    for (const product of createdProducts) {
      let category;
      // Map product categories to actual category slugs
      if (product.category === 'accessories') {
        category = createdCategories.find(c => c.slug === 'soda-makers');
      } else if (product.category === 'energy-drink') {
        category = createdCategories.find(c => c.slug === 'energy-drinks');
      } else if (product.category === 'cola') {
        category = createdCategories.find(c => c.slug === 'soda-syrups');
      } else {
        category = createdCategories.find(c => c.slug === product.category);
      }
      
      if (category) {
        product.category = category._id;
        await product.save();
      }
    }

    console.log('✅ Test data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Categories: ${createdCategories.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log('\n🛍️ Products created:');
    createdProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.sku}) - ${product.price} ${product.currency}`);
    });

    console.log('\n🏷️ Categories created:');
    createdCategories.forEach(category => {
      console.log(`  - ${category.name} (${category.slug})`);
    });

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTestData();
