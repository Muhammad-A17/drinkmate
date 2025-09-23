// Test the exchange cylinder API endpoint
const fetch = require('node-fetch');

const testCreateExchangeCylinder = async () => {
  try {
    const testData = {
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
      },
      exchangeFee: 0,
      deliveryFee: 0,
      pickupFee: 0,
      discount: 0,
      exchangeRadius: 50,
      pickupRequired: false,
      deliveryAvailable: true,
      emergencyService: false,
      isBestSeller: false,
      isFeatured: false,
      isNewProduct: false,
      isEcoFriendly: false,
      averageRating: 0,
      totalReviews: 0,
      totalExchanges: 0
    };

    console.log('Testing exchange cylinder creation...');
    console.log('Data being sent:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3000/api/exchange-cylinders/cylinders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: No auth token for this test - we'll see what error we get
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ Success:', result);
    } else {
      console.log('❌ Error:', response.status, responseText);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

testCreateExchangeCylinder();
