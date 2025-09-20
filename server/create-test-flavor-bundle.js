const mongoose = require('mongoose');
const Bundle = require('./Models/bundle-model');

async function createTestFlavorBundle() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/drinkmate');
    console.log('Connected to MongoDB');

    // Create test flavor bundle
    const testBundle = new Bundle({
      name: 'Test Flavor Bundle',
      slug: 'test-flavor-bundle',
      description: 'A test bundle containing various flavor syrups for soda making. Perfect for testing different flavor combinations and discovering new tastes.',
      price: 299,
      originalPrice: 399,
      bundleDiscount: 25,
      category: 'flavors',
      subcategory: 'starter-kits',
      images: ['https://res.cloudinary.com/da6dzmflp/image/upload/v1757500023/drinkmate/kvv4b7f7xujz6ibzuqov.png'],
      videos: [],
      youtubeLinks: ['https://youtu.be/PiGTvS89yPw?si=4jfSlxuO6w8-2YWS'],
      badge: {
        text: 'Test Bundle',
        color: '#ff6b6b'
      },
      sku: 'TEST-FLAVOR-001',
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      isLimited: false,
      stock: 50,
      averageRating: 0,
      reviewCount: 0,
      items: [],
      dimensions: '15, 20, 10, 2',
      faq: [],
      features: 'Perfect for testing different flavor combinations',
      specifications: '{}',
      videos: [],
      warranty: '1 Year Warranty',
      weight: '2 kg',
      youtubeLinks: ['https://youtu.be/PiGTvS89yPw?si=4jfSlxuO6w8-2YWS']
    });

    // Save the bundle
    const savedBundle = await testBundle.save();
    console.log('Test flavor bundle created successfully:');
    console.log('ID:', savedBundle._id);
    console.log('Name:', savedBundle.name);
    console.log('Category:', savedBundle.category);
    console.log('Price:', savedBundle.price);
    console.log('Badge Color:', savedBundle.badge?.color);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating test flavor bundle:', error);
    await mongoose.disconnect();
  }
}

createTestFlavorBundle();
