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

// Populate exchange cylinders with sample data
const populateExchangeCylinders = async () => {
  try {
    await connectDB();
    
    // Import the model
    const ExchangeCylinder = require('./Models/exchange-cylinder-model');
    
    // Clear existing data
    await ExchangeCylinder.deleteMany({});
    console.log('✅ Cleared existing exchange cylinders');
    
    // Sample exchange cylinders data
    const sampleCylinders = [
      {
        name: "60L CO2 Cylinder Exchange",
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
      },
      {
        name: "30L CO2 Cylinder Exchange",
        nameAr: "تبديل اسطوانة ثاني أكسيد الكربون 30 لتر",
        brand: "drinkmate",
        exchangeType: "scheduled",
        serviceLevel: "premium",
        estimatedTime: "Next Day",
        price: 25,
        originalPrice: 35,
        capacity: 30,
        material: "steel",
        weight: 8,
        dimensions: {
          height: 45,
          diameter: 18,
          width: 18
        },
        description: "Compact 30L CO2 cylinder exchange service with scheduled delivery",
        image: "https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-30l.jpg",
        images: ["https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-30l.jpg"],
        status: "active",
        isAvailable: true,
        stock: 50,
        minStock: 5,
        serviceAreas: ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"],
        operatingHours: {
          monday: { start: "09:00", end: "17:00", closed: false },
          tuesday: { start: "09:00", end: "17:00", closed: false },
          wednesday: { start: "09:00", end: "17:00", closed: false },
          thursday: { start: "09:00", end: "17:00", closed: false },
          friday: { start: "09:00", end: "17:00", closed: false },
          saturday: { start: "09:00", end: "17:00", closed: false },
          sunday: { start: "09:00", end: "17:00", closed: false }
        }
      },
      {
        name: "90L CO2 Cylinder Exchange",
        nameAr: "تبديل اسطوانة ثاني أكسيد الكربون 90 لتر",
        brand: "drinkmate",
        exchangeType: "instant",
        serviceLevel: "premium",
        estimatedTime: "Same Day",
        price: 75,
        originalPrice: 100,
        capacity: 90,
        material: "steel",
        weight: 25,
        dimensions: {
          height: 80,
          diameter: 25,
          width: 25
        },
        description: "Large capacity 90L CO2 cylinder exchange service for high-volume operations",
        image: "https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-90l.jpg",
        images: ["https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-90l.jpg"],
        status: "active",
        isAvailable: true,
        stock: 25,
        minStock: 3,
        serviceAreas: ["Riyadh", "Jeddah"],
        operatingHours: {
          monday: { start: "08:00", end: "18:00", closed: false },
          tuesday: { start: "08:00", end: "18:00", closed: false },
          wednesday: { start: "08:00", end: "18:00", closed: false },
          thursday: { start: "08:00", end: "18:00", closed: false },
          friday: { start: "08:00", end: "18:00", closed: false },
          saturday: { start: "08:00", end: "18:00", closed: false },
          sunday: { start: "08:00", end: "18:00", closed: false }
        }
      }
    ];
    
    // Insert sample data
    const insertedCylinders = await ExchangeCylinder.insertMany(sampleCylinders);
    console.log(`✅ Successfully inserted ${insertedCylinders.length} exchange cylinders`);
    
    // Display summary
    const allCylinders = await ExchangeCylinder.find({});
    console.log('✅ Total exchange cylinders in database:', allCylinders.length);
    
    // Show breakdown by exchange type
    const instantCylinders = await ExchangeCylinder.find({ exchangeType: 'instant' });
    const scheduledCylinders = await ExchangeCylinder.find({ exchangeType: 'scheduled' });
    
    console.log('✅ Instant exchange cylinders:', instantCylinders.length);
    console.log('✅ Scheduled exchange cylinders:', scheduledCylinders.length);
    
    console.log('\n📋 Sample data has been populated in the exchangecylinders collection');
    console.log('You can now view the data in MongoDB Compass');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating exchange cylinders:', error);
    process.exit(1);
  }
};

populateExchangeCylinders();
