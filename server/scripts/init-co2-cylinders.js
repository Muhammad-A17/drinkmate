const mongoose = require('mongoose');
const CO2Cylinder = require('../Models/co2-model');
require('dotenv').config({ path: './.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://faizanhassan608:jWnMYMNtJK0M79Fa@cluster0.rvqclhq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Default CO2 cylinders data
const defaultCylinders = [
  {
    name: "Drinkmate CO2 Cylinder Refill",
    brand: "drinkmate",
    type: "refill",
    price: 65.00,
    originalPrice: 75.00,
    capacity: 60,
    material: "steel",
    stock: 100,
    minStock: 20,
    description: "Original Drinkmate CO2 cylinder refill service. Each cylinder carbonates up to 60 liters of water.",
    features: [
      "Food-grade CO2 certified for beverage use",
      "Compatible with Drinkmate machines",
      "60 liters of carbonation capacity",
      "Convenient home pickup and delivery",
      "3-5 business day turnaround"
    ],
    image: "/images/co2-cylinder.png",
    status: "active",
    isBestSeller: true,
    isFeatured: true,
    compatibility: ["drinkmate"],
    specifications: {
      weight: 2.5,
      height: 30,
      diameter: 8
    }
  },
  {
    name: "Other Brand to Drinkmate Conversion",
    brand: "other",
    type: "conversion",
    price: 75.00,
    originalPrice: 85.00,
    capacity: 60,
    material: "steel",
    stock: 50,
    minStock: 10,
    description: "Convert other brand cylinders to work with Drinkmate machines. Includes adapter and compatibility testing.",
    features: [
      "Convert any brand cylinder to Drinkmate",
      "Includes necessary adapters",
      "Compatibility testing included",
      "60 liters of carbonation capacity",
      "Professional conversion service"
    ],
    image: "/images/co2-cylinder-single.png",
    status: "active",
    isBestSeller: false,
    isFeatured: true,
    compatibility: ["universal"],
    specifications: {
      weight: 2.5,
      height: 30,
      diameter: 8
    }
  },
  {
    name: "SodaStream CO2 Cylinder Refill",
    brand: "sodastream",
    type: "refill",
    price: 75.00,
    originalPrice: 85.00,
    capacity: 60,
    material: "steel",
    stock: 80,
    minStock: 15,
    description: "SodaStream CO2 cylinder refill service. Compatible with all SodaStream machines.",
    features: [
      "Food-grade CO2 certified for beverage use",
      "Compatible with SodaStream machines",
      "60 liters of carbonation capacity",
      "Convenient home pickup and delivery",
      "3-5 business day turnaround"
    ],
    image: "/images/co2-cylinder.png",
    status: "active",
    isBestSeller: false,
    isFeatured: false,
    compatibility: ["sodastream"],
    specifications: {
      weight: 2.5,
      height: 30,
      diameter: 8
    }
  },
  {
    name: "Errva CO2 Cylinder Refill",
    brand: "errva",
    type: "refill",
    price: 70.00,
    originalPrice: 80.00,
    capacity: 60,
    material: "steel",
    stock: 60,
    minStock: 12,
    description: "Errva CO2 cylinder refill service. Compatible with Errva sparkling water makers.",
    features: [
      "Food-grade CO2 certified for beverage use",
      "Compatible with Errva machines",
      "60 liters of carbonation capacity",
      "Convenient home pickup and delivery",
      "3-5 business day turnaround"
    ],
    image: "/images/co2-cylinder.png",
    status: "active",
    isBestSeller: false,
    isFeatured: false,
    compatibility: ["errva"],
    specifications: {
      weight: 2.5,
      height: 30,
      diameter: 8
    }
  },
  {
    name: "Fawwar CO2 Cylinder Refill",
    brand: "fawwar",
    type: "refill",
    price: 70.00,
    originalPrice: 80.00,
    capacity: 60,
    material: "steel",
    stock: 60,
    minStock: 12,
    description: "Fawwar CO2 cylinder refill service. Compatible with Fawwar sparkling water makers.",
    features: [
      "Food-grade CO2 certified for beverage use",
      "Compatible with Fawwar machines",
      "60 liters of carbonation capacity",
      "Convenient home pickup and delivery",
      "3-5 business day turnaround"
    ],
    image: "/images/co2-cylinder.png",
    status: "active",
    isBestSeller: false,
    isFeatured: false,
    compatibility: ["fawwar"],
    specifications: {
      weight: 2.5,
      height: 30,
      diameter: 8
    }
  },
  {
    name: "Phillips CO2 Cylinder Refill",
    brand: "phillips",
    type: "refill",
    price: 75.00,
    originalPrice: 85.00,
    capacity: 60,
    material: "steel",
    stock: 70,
    minStock: 15,
    description: "Phillips CO2 cylinder refill service. Compatible with Phillips sparkling water makers.",
    features: [
      "Food-grade CO2 certified for beverage use",
      "Compatible with Phillips machines",
      "60 liters of carbonation capacity",
      "Convenient home pickup and delivery",
      "3-5 business day turnaround"
    ],
    image: "/images/co2-cylinder.png",
    status: "active",
    isBestSeller: false,
    isFeatured: false,
    compatibility: ["phillips"],
    specifications: {
      weight: 2.5,
      height: 30,
      diameter: 8
    }
  },
  {
    name: "Ultima Cosa CO2 Cylinder Refill",
    brand: "ultima-cosa",
    type: "refill",
    price: 70.00,
    originalPrice: 80.00,
    capacity: 60,
    material: "steel",
    stock: 50,
    minStock: 10,
    description: "Ultima Cosa CO2 cylinder refill service. Compatible with Ultima Cosa sparkling water makers.",
    features: [
      "Food-grade CO2 certified for beverage use",
      "Compatible with Ultima Cosa machines",
      "60 liters of carbonation capacity",
      "Convenient home pickup and delivery",
      "3-5 business day turnaround"
    ],
    image: "/images/co2-cylinder.png",
    status: "active",
    isBestSeller: false,
    isFeatured: false,
    compatibility: ["ultima-cosa"],
    specifications: {
      weight: 2.5,
      height: 30,
      diameter: 8
    }
  },
  {
    name: "Bubble Bro CO2 Cylinder Refill",
    brand: "bubble-bro",
    type: "refill",
    price: 70.00,
    originalPrice: 80.00,
    capacity: 60,
    material: "steel",
    stock: 50,
    minStock: 10,
    description: "Bubble Bro CO2 cylinder refill service. Compatible with Bubble Bro sparkling water makers.",
    features: [
      "Food-grade CO2 certified for beverage use",
      "Compatible with Bubble Bro machines",
      "60 liters of carbonation capacity",
      "Convenient home pickup and delivery",
      "3-5 business day turnaround"
    ],
    image: "/images/co2-cylinder.png",
    status: "active",
    isBestSeller: false,
    isFeatured: false,
    compatibility: ["bubble-bro"],
    specifications: {
      weight: 2.5,
      height: 30,
      diameter: 8
    }
  },
  {
    name: "Yoco Cosa CO2 Cylinder Refill",
    brand: "yoco-cosa",
    type: "refill",
    price: 70.00,
    originalPrice: 80.00,
    capacity: 60,
    material: "steel",
    stock: 50,
    minStock: 10,
    description: "Yoco Cosa CO2 cylinder refill service. Compatible with Yoco Cosa sparkling water makers.",
    features: [
      "Food-grade CO2 certified for beverage use",
      "Compatible with Yoco Cosa machines",
      "60 liters of carbonation capacity",
      "Convenient home pickup and delivery",
      "3-5 business day turnaround"
    ],
    image: "/images/co2-cylinder.png",
    status: "active",
    isBestSeller: false,
    isFeatured: false,
    compatibility: ["yoco-cosa"],
    specifications: {
      weight: 2.5,
      height: 30,
      diameter: 8
    }
  }
];

// Initialize CO2 cylinders
const initCO2Cylinders = async () => {
  try {
    console.log('Starting CO2 cylinders initialization...');
    
    // Clear existing cylinders
    await CO2Cylinder.deleteMany({});
    console.log('Cleared existing CO2 cylinders');
    
    // Insert default cylinders
    const insertedCylinders = await CO2Cylinder.insertMany(defaultCylinders);
    console.log(`Successfully inserted ${insertedCylinders.length} CO2 cylinders`);
    
    // Log inserted cylinders
    insertedCylinders.forEach(cylinder => {
      console.log(`- ${cylinder.name} (${cylinder.brand}) - ${cylinder.price} SAR`);
    });
    
    console.log('CO2 cylinders initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing CO2 cylinders:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the initialization
if (require.main === module) {
  connectDB().then(() => {
    initCO2Cylinders();
  });
}

module.exports = { initCO2Cylinders };
