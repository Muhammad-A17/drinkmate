const mongoose = require('mongoose');
const CO2Cylinder = require('./Models/co2-model');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmates');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test exchange cylinders data
const testExchangeCylinders = [
  {
    name: "60L CO2 Cylinder Exchange",
    brand: "drinkmate",
    type: "exchange",
    price: 45.00,
    originalPrice: 55.00,
    capacity: 60,
    material: "steel",
    stock: 50,
    minStock: 10,
    description: "Professional 60L CO2 cylinder exchange service with instant availability",
    features: [
      "Instant exchange service",
      "Food-grade CO2 certified for beverage use",
      "Compatible with Drinkmate machines",
      "60 liters of carbonation capacity",
      "Same-day pickup and delivery",
      "Quality guaranteed"
    ],
    image: "/images/co2-cylinder.png",
    status: "active",
    isBestSeller: true,
    isFeatured: true,
    compatibility: ["drinkmate"],
    specifications: {
      weight: 2.5,
      height: 30,
      diameter: 8,
      pressure: "58 bar",
      threadType: "M18x1.5",
      valveType: "Pin valve",
      certification: "CE certified",
      temperatureRange: "-40°C to +60°C",
      serviceLife: "10 years",
      refillCycles: "Unlimited",
      safetyFeatures: "Pressure relief valve, burst disc"
    },
    averageRating: 4.8,
    totalReviews: 25
  },
  {
    name: "40L CO2 Cylinder Exchange",
    brand: "drinkmate",
    type: "exchange",
    price: 35.00,
    originalPrice: 45.00,
    capacity: 40,
    material: "steel",
    stock: 30,
    minStock: 5,
    description: "Compact 40L CO2 cylinder exchange for smaller operations",
    features: [
      "Scheduled exchange service",
      "Food-grade CO2 certified for beverage use",
      "Compatible with Drinkmate machines",
      "40 liters of carbonation capacity",
      "1-2 day pickup and delivery",
      "Perfect for small households"
    ],
    image: "/images/co2-cylinder.png",
    status: "active",
    isBestSeller: false,
    isFeatured: true,
    compatibility: ["drinkmate"],
    specifications: {
      weight: 1.8,
      height: 25,
      diameter: 7,
      pressure: "58 bar",
      threadType: "M18x1.5",
      valveType: "Pin valve",
      certification: "CE certified",
      temperatureRange: "-40°C to +60°C",
      serviceLife: "10 years",
      refillCycles: "Unlimited",
      safetyFeatures: "Pressure relief valve, burst disc"
    },
    averageRating: 4.6,
    totalReviews: 18
  }
];

// Create test exchange cylinders
const createTestExchangeCylinders = async () => {
  try {
    console.log('Starting test exchange cylinders creation...');
    
    // Check if exchange cylinders already exist
    const existingExchangeCylinders = await CO2Cylinder.find({ type: 'exchange' });
    if (existingExchangeCylinders.length > 0) {
      console.log(`Found ${existingExchangeCylinders.length} existing exchange cylinders. Updating...`);
      
      // Update existing cylinders
      for (const cylinderData of testExchangeCylinders) {
        const existingCylinder = existingExchangeCylinders.find(c => c.name === cylinderData.name);
        if (existingCylinder) {
          await CO2Cylinder.findByIdAndUpdate(existingCylinder._id, cylinderData);
          console.log(`Updated: ${cylinderData.name}`);
        } else {
          const newCylinder = new CO2Cylinder(cylinderData);
          await newCylinder.save();
          console.log(`Created: ${cylinderData.name}`);
        }
      }
    } else {
      // Create new cylinders
      const insertedCylinders = await CO2Cylinder.insertMany(testExchangeCylinders);
      console.log(`Successfully created ${insertedCylinders.length} exchange cylinders`);
      
      // Log created cylinders
      insertedCylinders.forEach(cylinder => {
        console.log(`- ${cylinder.name} - ${cylinder.price} SAR (${cylinder.capacity}L)`);
      });
    }
    
    console.log('Exchange cylinders creation completed successfully!');
  } catch (error) {
    console.error('Error creating exchange cylinders:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
if (require.main === module) {
  connectDB().then(() => {
    createTestExchangeCylinders();
  });
}

module.exports = { createTestExchangeCylinders, testExchangeCylinders };
