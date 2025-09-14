const axios = require('axios');
require('dotenv').config();

class UrwaysDashboardTester {
    constructor() {
        this.merchantId = process.env.URWAYS_MERCHANT_ID;
        this.terminalId = process.env.URWAYS_TERMINAL_ID;
        this.password = process.env.URWAYS_TERMINAL_PASSWORD?.replace(/^["']|["']$/g, '');
        this.secretKey = process.env.URWAYS_SECRET_KEY;
        this.environment = process.env.URWAYS_ENVIRONMENT || 'sandbox';
        
        this.baseUrl = this.environment === 'production' 
            ? 'https://payments.urway-tech.com' 
            : 'https://payments-dev.urway-tech.com';
    }

    async testCredentials() {
        console.log('=== TESTING URWAYS CREDENTIALS ===');
        console.log('Environment:', this.environment);
        console.log('Base URL:', this.baseUrl);
        console.log('Merchant ID:', this.merchantId);
        console.log('Terminal ID:', this.terminalId);
        console.log('Password:', this.password ? '***' + this.password.slice(-4) : 'NOT SET');
        console.log('Secret Key:', this.secretKey ? '***' + this.secretKey.slice(-4) : 'NOT SET');
        console.log('');

        // Test 1: Check if we can access the dashboard
        console.log('1. Testing dashboard access...');
        try {
            const dashboardUrl = `${this.baseUrl}/URWAYPG/checkUserExistance.htm`;
            console.log('Dashboard URL:', dashboardUrl);
            
            const response = await axios.get(dashboardUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            console.log('✅ Dashboard accessible - Status:', response.status);
            console.log('Response contains "login" or "dashboard":', 
                response.data.toLowerCase().includes('login') || 
                response.data.toLowerCase().includes('dashboard'));
        } catch (error) {
            console.log('❌ Dashboard access failed:', error.message);
        }

        // Test 2: Test API endpoint
        console.log('\n2. Testing API endpoint...');
        try {
            const apiUrl = `${this.baseUrl}/URWAYPGService/transaction/jsonProcess/JSONrequest`;
            console.log('API URL:', apiUrl);
            
            // Create a test payment request
            const testRequest = {
                merchantID: this.merchantId,
                terminalID: this.terminalId,
                password: this.password,
                amount: '100', // 1 SAR in halalas
                currency: 'SAR',
                orderID: `TEST_${Date.now()}`,
                customerEmail: 'test@drinkmate.com',
                customerName: 'Test User',
                description: 'DrinkMate Test Payment',
                returnURL: 'https://drinkmate.com/payment/success',
                cancelURL: 'https://drinkmate.com/payment/cancel',
                action: '1',
                trackID: `TRACK_${Date.now()}`,
                udf1: 'DrinkMate',
                udf2: `TEST_${Date.now()}`,
                udf3: 'test@drinkmate.com'
            };

            // Generate signature
            const crypto = require('crypto');
            const sortedKeys = Object.keys(testRequest).sort();
            const signatureString = sortedKeys
                .map(key => `${key}=${testRequest[key]}`)
                .join('&');
            
            testRequest.signature = crypto
                .createHmac('sha256', this.secretKey)
                .update(signatureString)
                .digest('hex');

            console.log('Test request prepared (without password):', {
                ...testRequest,
                password: '***'
            });

            const response = await axios.post(apiUrl, testRequest, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ API call successful - Status:', response.status);
            console.log('Response:', JSON.stringify(response.data, null, 2));
            
            if (response.data && response.data.result) {
                console.log('✅ Urways API responded with result:', response.data.result);
                if (response.data.targetURL) {
                    console.log('✅ Payment URL generated:', response.data.targetURL);
                }
            }

        } catch (error) {
            console.log('❌ API call failed:', error.message);
            if (error.response) {
                console.log('Response status:', error.response.status);
                console.log('Response data:', JSON.stringify(error.response.data, null, 2));
            }
        }

        // Test 3: Provide dashboard instructions
        console.log('\n3. Dashboard Testing Instructions:');
        console.log('=====================================');
        console.log('1. Open this URL in your browser:');
        console.log(`   ${this.baseUrl}/URWAYPG/checkUserExistance.htm`);
        console.log('');
        console.log('2. Login with these credentials:');
        console.log(`   Merchant ID: ${this.merchantId}`);
        console.log(`   Terminal ID: ${this.terminalId}`);
        console.log(`   Password: ${this.password}`);
        console.log('');
        console.log('3. Look for:');
        console.log('   - Transaction history');
        console.log('   - Test transactions (if any)');
        console.log('   - Account status');
        console.log('');
        console.log('4. If you see test transactions, the integration is working!');
    }
}

// Run the test
const tester = new UrwaysDashboardTester();
tester.testCredentials().catch(console.error);
