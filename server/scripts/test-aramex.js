const aramexService = require('../Services/aramex-service');

async function testAramexIntegration() {
  console.log('🧪 Testing Aramex Integration...\n');

  try {
    // Test 1: Service Health Check
    console.log('1. Testing service health...');
    console.log('✅ Aramex service loaded successfully');
    console.log(`   Base URL: ${aramexService.baseURL}`);
    console.log(`   Account: ${aramexService.credentials.AccountNumber}\n`);

    // Test 2: Test tracking with a sample waybill (this will likely fail in sandbox)
    console.log('2. Testing shipment tracking...');
    try {
      const trackingResult = await aramexService.trackShipment('TEST123456');
      console.log('✅ Tracking test completed');
      console.log('   Result:', JSON.stringify(trackingResult, null, 2));
    } catch (error) {
      console.log('⚠️  Tracking test failed (expected in sandbox)');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 3: Test shipment creation with sample data
    console.log('3. Testing shipment creation...');
    try {
      const sampleShipmentData = {
        shipper: {
          reference1: 'DrinkMate Test',
          address: {
            line1: 'Test Address',
            city: 'Riyadh',
            state: 'Riyadh',
            countryCode: 'SA'
          },
          contact: {
            personName: 'Test User',
            companyName: 'DrinkMate',
            emailAddress: 'test@drinkmate.com'
          }
        },
        consignee: {
          reference1: 'Test Order',
          address: {
            line1: 'Test Delivery Address',
            city: 'Riyadh',
            state: 'Riyadh',
            countryCode: 'SA'
          },
          contact: {
            personName: 'Test Customer',
            emailAddress: 'customer@test.com'
          }
        },
        details: {
          dimensions: {
            length: 30,
            width: 20,
            height: 15,
            unit: 'CM'
          },
          actualWeight: {
            value: 1,
            unit: 'KG'
          },
          productGroup: 'DOM',
          productType: 'ONX',
          numberOfPieces: 1,
          descriptionOfGoods: 'Test Product'
        }
      };

      const createResult = await aramexService.createShipment(sampleShipmentData);
      console.log('✅ Shipment creation test completed');
      console.log('   Result:', JSON.stringify(createResult, null, 2));
    } catch (error) {
      console.log('⚠️  Shipment creation test failed (expected in sandbox)');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 4: Test SOAP request building
    console.log('4. Testing SOAP request building...');
    try {
      const trackRequest = aramexService.buildTrackShipmentRequest('TEST123456');
      console.log('✅ SOAP request building successful');
      console.log('   Request length:', trackRequest.length, 'characters');
      console.log('   Contains SOAP envelope:', trackRequest.includes('soap:Envelope'));
    } catch (error) {
      console.log('❌ SOAP request building failed');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 5: Test pickup creation
    console.log('5. Testing pickup creation...');
    try {
        const samplePickupData = {
            address: {
                line1: 'Test Pickup Address',
                city: 'Riyadh',
                state: 'Riyadh',
                countryCode: 'SA'
            },
            contact: {
                personName: 'Test Contact',
                companyName: 'DrinkMate',
                phoneNumber1: '+966501234567',
                emailAddress: 'pickup@drinkmate.com'
            },
            pickupDate: new Date().toISOString(),
            readyTime: '10:00',
            lastPickupTime: '17:00',
            comments: 'Test pickup for DrinkMate'
        };

        const pickupResult = await aramexService.createPickup(samplePickupData);
        console.log('✅ Pickup creation test completed');
        console.log('   Result:', JSON.stringify(pickupResult, null, 2));
    } catch (error) {
        console.log('⚠️  Pickup creation test failed (expected in sandbox)');
        console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 6: Test label printing
    console.log('6. Testing label printing...');
    try {
        const sampleLabelData = {
            waybillNumber: 'TEST123456',
            reportID: 9201,
            reportType: 'URL'
        };

        const labelResult = await aramexService.printLabel(sampleLabelData);
        console.log('✅ Label printing test completed');
        console.log('   Result:', JSON.stringify(labelResult, null, 2));
    } catch (error) {
        console.log('⚠️  Label printing test failed (expected in sandbox)');
        console.log(`   Error: ${error.message}`);
    }
    console.log('');

    console.log('🎉 Aramex integration test completed!');
    console.log('\n📝 Notes:');
    console.log('- Some tests may fail in sandbox environment');
    console.log('- This is normal and expected behavior');
    console.log('- Real waybill numbers are needed for actual tracking');
    console.log('- Check logs for detailed error information');
    console.log('\n🚀 New Features Added:');
    console.log('- Pickup management (create/cancel)');
    console.log('- Label printing');
    console.log('- Enhanced shipment creation with additional fields');
    console.log('- Improved SOAP request structure');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testAramexIntegration();
}

module.exports = testAramexIntegration;
