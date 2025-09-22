const mongoose = require('mongoose');
const ExchangeCylinder = require('../Models/exchange-cylinder-model');

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

// Sample exchange cylinders data
const sampleExchangeCylinders = [
  {
    name: "60L CO2 Cylinder Exchange - Instant",
    nameAr: "تبديل أسطوانة ثاني أكسيد الكربون 60 لتر - فوري",
    brand: "drinkmate",
    exchangeType: "instant",
    serviceLevel: "express",
    estimatedTime: "Same Day",
    pickupRequired: false,
    deliveryAvailable: true,
    exchangeRadius: 50,
    price: 45.00,
    originalPrice: 55.00,
    exchangeFee: 0,
    deliveryFee: 0,
    pickupFee: 0,
    capacity: 60,
    material: "steel",
    weight: 2.5,
    dimensions: {
      height: 30,
      diameter: 8,
      width: 8
    },
    compatibility: ["drinkmate"],
    stock: 50,
    minStock: 10,
    maxDailyExchanges: 100,
    isAvailable: true,
    image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151268/co2-cylinder-exchange-60l_abc123.jpg",
    images: [
      "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151268/co2-cylinder-exchange-60l-1.jpg",
      "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151268/co2-cylinder-exchange-60l-2.jpg"
    ],
    description: "Professional 60L CO2 cylinder exchange service with instant availability. Perfect for high-volume operations.",
    descriptionAr: "خدمة تبديل أسطوانة ثاني أكسيد الكربون 60 لتر المهنية مع التوفر الفوري. مثالية للعمليات عالية الحجم.",
    features: [
      "Instant exchange service",
      "Food-grade CO2 certified for beverage use",
      "Compatible with Drinkmate machines",
      "60 liters of carbonation capacity",
      "Same-day pickup and delivery",
      "Quality guaranteed",
      "Professional service team"
    ],
    benefits: [
      "No downtime for your business",
      "Consistent quality CO2",
      "Convenient scheduling",
      "Professional handling"
    ],
    instructions: [
      "Call to schedule exchange",
      "Prepare empty cylinder for pickup",
      "Receive full cylinder same day",
      "Enjoy carbonated beverages"
    ],
    specifications: {
      pressure: "58 bar",
      threadType: "M18x1.5",
      valveType: "Pin valve",
      certification: "CE certified",
      temperatureRange: "-40°C to +60°C",
      serviceLife: "10 years",
      refillCycles: "Unlimited",
      safetyFeatures: "Pressure relief valve, burst disc",
      workingPressure: 58,
      testPressure: 87,
      burstPressure: 145
    },
    safetyFeatures: [
      "Pressure relief valve",
      "Burst disc protection",
      "Threaded connection",
      "Tamper-evident seal"
    ],
    certifications: ["CE", "ISO 9001", "Food Grade"],
    complianceStandards: ["EN 1089-3", "ISO 11114-1"],
    safetyInstructions: [
      "Store in upright position",
      "Keep away from heat sources",
      "Check for leaks before use",
      "Return empty cylinders promptly"
    ],
    serviceAreas: ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"],
    operatingHours: {
      monday: { start: "08:00", end: "18:00", closed: false },
      tuesday: { start: "08:00", end: "18:00", closed: false },
      wednesday: { start: "08:00", end: "18:00", closed: false },
      thursday: { start: "08:00", end: "18:00", closed: false },
      friday: { start: "14:00", end: "18:00", closed: false },
      saturday: { start: "08:00", end: "16:00", closed: false },
      sunday: { start: "08:00", end: "16:00", closed: false }
    },
    emergencyService: true,
    emergencyContact: "+966-50-123-4567",
    status: "active",
    isBestSeller: true,
    isFeatured: true,
    isNewProduct: false,
    isEcoFriendly: true,
    averageRating: 4.8,
    totalReviews: 25,
    totalExchanges: 150,
    metaTitle: "60L CO2 Cylinder Exchange - Instant Service | DrinkMates",
    metaDescription: "Professional 60L CO2 cylinder exchange service with instant availability. Same-day delivery in major Saudi cities.",
    keywords: ["CO2 cylinder", "exchange", "instant", "carbonation", "soda maker", "drinkmate"]
  },
  {
    name: "40L CO2 Cylinder Exchange - Scheduled",
    nameAr: "تبديل أسطوانة ثاني أكسيد الكربون 40 لتر - مجدول",
    brand: "drinkmate",
    exchangeType: "scheduled",
    serviceLevel: "standard",
    estimatedTime: "1-2 Days",
    pickupRequired: false,
    deliveryAvailable: true,
    exchangeRadius: 30,
    price: 35.00,
    originalPrice: 45.00,
    exchangeFee: 0,
    deliveryFee: 5.00,
    pickupFee: 0,
    capacity: 40,
    material: "steel",
    weight: 1.8,
    dimensions: {
      height: 25,
      diameter: 7,
      width: 7
    },
    compatibility: ["drinkmate"],
    stock: 30,
    minStock: 5,
    maxDailyExchanges: 50,
    isAvailable: true,
    image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151268/co2-cylinder-exchange-40l_def456.jpg",
    images: [
      "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151268/co2-cylinder-exchange-40l-1.jpg"
    ],
    description: "Compact 40L CO2 cylinder exchange for smaller operations. Perfect for home use and small businesses.",
    descriptionAr: "تبديل أسطوانة ثاني أكسيد الكربون 40 لتر المدمجة للعمليات الصغيرة. مثالية للاستخدام المنزلي والشركات الصغيرة.",
    features: [
      "Scheduled exchange service",
      "Food-grade CO2 certified for beverage use",
      "Compatible with Drinkmate machines",
      "40 liters of carbonation capacity",
      "1-2 day pickup and delivery",
      "Perfect for small households",
      "Flexible scheduling"
    ],
    benefits: [
      "Cost-effective solution",
      "Perfect for home use",
      "Flexible scheduling",
      "Reliable service"
    ],
    instructions: [
      "Schedule exchange online or by phone",
      "Prepare empty cylinder for pickup",
      "Receive full cylinder within 1-2 days",
      "Enjoy carbonated beverages"
    ],
    specifications: {
      pressure: "58 bar",
      threadType: "M18x1.5",
      valveType: "Pin valve",
      certification: "CE certified",
      temperatureRange: "-40°C to +60°C",
      serviceLife: "10 years",
      refillCycles: "Unlimited",
      safetyFeatures: "Pressure relief valve, burst disc",
      workingPressure: 58,
      testPressure: 87,
      burstPressure: 145
    },
    safetyFeatures: [
      "Pressure relief valve",
      "Burst disc protection",
      "Threaded connection",
      "Tamper-evident seal"
    ],
    certifications: ["CE", "ISO 9001", "Food Grade"],
    complianceStandards: ["EN 1089-3", "ISO 11114-1"],
    safetyInstructions: [
      "Store in upright position",
      "Keep away from heat sources",
      "Check for leaks before use",
      "Return empty cylinders promptly"
    ],
    serviceAreas: ["Riyadh", "Jeddah", "Dammam"],
    operatingHours: {
      monday: { start: "09:00", end: "17:00", closed: false },
      tuesday: { start: "09:00", end: "17:00", closed: false },
      wednesday: { start: "09:00", end: "17:00", closed: false },
      thursday: { start: "09:00", end: "17:00", closed: false },
      friday: { start: "14:00", end: "17:00", closed: false },
      saturday: { start: "09:00", end: "15:00", closed: false },
      sunday: { start: "09:00", end: "15:00", closed: false }
    },
    emergencyService: false,
    emergencyContact: null,
    status: "active",
    isBestSeller: false,
    isFeatured: true,
    isNewProduct: false,
    isEcoFriendly: true,
    averageRating: 4.6,
    totalReviews: 18,
    totalExchanges: 75,
    metaTitle: "40L CO2 Cylinder Exchange - Scheduled Service | DrinkMates",
    metaDescription: "Compact 40L CO2 cylinder exchange service with flexible scheduling. Perfect for home use and small businesses.",
    keywords: ["CO2 cylinder", "exchange", "scheduled", "home use", "small business", "drinkmate"]
  },
  {
    name: "130L CO2 Cylinder Exchange - Premium",
    nameAr: "تبديل أسطوانة ثاني أكسيد الكربون 130 لتر - مميز",
    brand: "drinkmate",
    exchangeType: "instant",
    serviceLevel: "premium",
    estimatedTime: "Same Day",
    pickupRequired: false,
    deliveryAvailable: true,
    exchangeRadius: 100,
    price: 85.00,
    originalPrice: 100.00,
    exchangeFee: 0,
    deliveryFee: 0,
    pickupFee: 0,
    capacity: 130,
    material: "steel",
    weight: 4.2,
    dimensions: {
      height: 45,
      diameter: 10,
      width: 10
    },
    compatibility: ["drinkmate"],
    stock: 20,
    minStock: 5,
    maxDailyExchanges: 25,
    isAvailable: true,
    image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151268/co2-cylinder-exchange-130l_ghi789.jpg",
    images: [
      "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151268/co2-cylinder-exchange-130l-1.jpg",
      "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151268/co2-cylinder-exchange-130l-2.jpg"
    ],
    description: "Premium 130L CO2 cylinder exchange service for high-volume commercial operations. Maximum efficiency and reliability.",
    descriptionAr: "خدمة تبديل أسطوانة ثاني أكسيد الكربون 130 لتر المميزة للعمليات التجارية عالية الحجم. أقصى كفاءة وموثوقية.",
    features: [
      "Premium instant exchange service",
      "Food-grade CO2 certified for beverage use",
      "Compatible with Drinkmate machines",
      "130 liters of carbonation capacity",
      "Same-day pickup and delivery",
      "Priority service for commercial customers",
      "Dedicated account manager"
    ],
    benefits: [
      "Maximum efficiency for commercial use",
      "Priority service",
      "Dedicated support",
      "Bulk pricing available"
    ],
    instructions: [
      "Contact your dedicated account manager",
      "Schedule priority exchange",
      "Prepare empty cylinder for pickup",
      "Receive full cylinder same day"
    ],
    specifications: {
      pressure: "58 bar",
      threadType: "M18x1.5",
      valveType: "Pin valve",
      certification: "CE certified",
      temperatureRange: "-40°C to +60°C",
      serviceLife: "10 years",
      refillCycles: "Unlimited",
      safetyFeatures: "Pressure relief valve, burst disc",
      workingPressure: 58,
      testPressure: 87,
      burstPressure: 145
    },
    safetyFeatures: [
      "Pressure relief valve",
      "Burst disc protection",
      "Threaded connection",
      "Tamper-evident seal",
      "Commercial-grade safety"
    ],
    certifications: ["CE", "ISO 9001", "Food Grade", "Commercial Grade"],
    complianceStandards: ["EN 1089-3", "ISO 11114-1", "Commercial Standards"],
    safetyInstructions: [
      "Store in upright position",
      "Keep away from heat sources",
      "Check for leaks before use",
      "Return empty cylinders promptly",
      "Follow commercial safety protocols"
    ],
    serviceAreas: ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Khobar", "Taif"],
    operatingHours: {
      monday: { start: "07:00", end: "19:00", closed: false },
      tuesday: { start: "07:00", end: "19:00", closed: false },
      wednesday: { start: "07:00", end: "19:00", closed: false },
      thursday: { start: "07:00", end: "19:00", closed: false },
      friday: { start: "14:00", end: "19:00", closed: false },
      saturday: { start: "08:00", end: "17:00", closed: false },
      sunday: { start: "08:00", end: "17:00", closed: false }
    },
    emergencyService: true,
    emergencyContact: "+966-50-123-4567",
    status: "active",
    isBestSeller: false,
    isFeatured: true,
    isNewProduct: true,
    isEcoFriendly: true,
    averageRating: 4.9,
    totalReviews: 12,
    totalExchanges: 45,
    metaTitle: "130L CO2 Cylinder Exchange - Premium Service | DrinkMates",
    metaDescription: "Premium 130L CO2 cylinder exchange service for commercial operations. Same-day delivery with priority service.",
    keywords: ["CO2 cylinder", "exchange", "premium", "commercial", "high volume", "drinkmate"]
  }
];

// Initialize exchange cylinders
const initExchangeCylinders = async () => {
  try {
    console.log('🚀 Starting exchange cylinders initialization...');
    
    // Clear existing exchange cylinders
    await ExchangeCylinder.deleteMany({});
    console.log('✅ Cleared existing exchange cylinders');
    
    // Insert sample exchange cylinders
    const insertedCylinders = await ExchangeCylinder.insertMany(sampleExchangeCylinders);
    console.log(`✅ Successfully inserted ${insertedCylinders.length} exchange cylinders`);
    
    // Log inserted cylinders
    console.log('\n📋 Exchange cylinders created:');
    insertedCylinders.forEach(cylinder => {
      console.log(`- ${cylinder.name} (${cylinder.exchangeType}) - ${cylinder.price} SAR (${cylinder.capacity}L)`);
    });
    
    console.log('\n🎉 Exchange cylinders initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Total cylinders: ${insertedCylinders.length}`);
    console.log(`- Instant service: ${insertedCylinders.filter(c => c.exchangeType === 'instant').length}`);
    console.log(`- Scheduled service: ${insertedCylinders.filter(c => c.exchangeType === 'scheduled').length}`);
    console.log(`- Premium service: ${insertedCylinders.filter(c => c.serviceLevel === 'premium').length}`);
    
  } catch (error) {
    console.error('❌ Error initializing exchange cylinders:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the initialization
if (require.main === module) {
  connectDB().then(() => {
    initExchangeCylinders();
  });
}

module.exports = { initExchangeCylinders, sampleExchangeCylinders };
