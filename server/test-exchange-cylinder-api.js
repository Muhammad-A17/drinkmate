const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test exchange cylinder creation
const testExchangeCylinder = async () => {
  try {
    await connectDB();
    
    // Import the model
    const ExchangeCylinder = require('./Models/exchange-cylinder-model');
    
    // Create a test exchange cylinder
    const testCylinder = new ExchangeCylinder({
      name: "Test 60L CO2 Cylinder Exchange",
      nameAr: "تبديل اسطوانة ثاني أكسيد الكربون 60 لتر",
      brand: "drinkmate",
      exchangeType: "instant",
      serviceLevel: "standard",
      estimatedTime: "Same Day",
      price: 45,
      originalPrice: 60,
      capacity: 60,
      material: "steel",
      weight: 15,
      dimensions: {
        height: 60,
        diameter: 20,
        width: 20
      },
      description: "Professional 60L CO2 cylinder exchange service with instant availability",
      image: "https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-60l.jpg",
      images: ["https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-60l.jpg"],
      status: "active",
      isAvailable: true,
      stock: 100,
      minStock: 10,
      serviceAreas: ["Riyadh", "Jeddah", "Dammam"],
      operatingHours: {
        monday: { start: "08:00", end: "18:00", closed: false },
        tuesday: { start: "08:00", end: "18:00", closed: false },
        wednesday: { start: "08:00", end: "18:00", closed: false },
        thursday: { start: "08:00", end: "18:00", closed: false },
        friday: { start: "08:00", end: "18:00", closed: false },
        saturday: { start: "08:00", end: "18:00", closed: false },
        sunday: { start: "08:00", end: "18:00", closed: false }
      }
    });
    
    // Save the cylinder
    const savedCylinder = await testCylinder.save();
    console.log('✅ Exchange cylinder created successfully:', savedCylinder._id);
    
    // Test fetching all cylinders
    const allCylinders = await ExchangeCylinder.find({});
    console.log('✅ Total exchange cylinders in database:', allCylinders.length);
    
    // Test fetching by exchange type
    const instantCylinders = await ExchangeCylinder.find({ exchangeType: 'instant' });
    console.log('✅ Instant exchange cylinders:', instantCylinders.length);
    
    // Clean up - delete the test cylinder
    await ExchangeCylinder.findByIdAndDelete(savedCylinder._id);
    console.log('✅ Test cylinder cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing exchange cylinder:', error);
    process.exit(1);
  }
};

testExchangeCylinder();
