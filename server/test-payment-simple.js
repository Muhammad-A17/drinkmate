const axios = require('axios');

// Test the payment API without authentication
async function testPayment() {
    try {
        console.log('Testing payment API...');
        
        const response = await axios.post('http://localhost:3000/payments/urways', {
            amount: 100,
            currency: 'SAR',
            orderId: 'test-123',
            customerEmail: 'test@test.com'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response:', response.data);
    } catch (error) {
        console.log('Error:', error.response?.data || error.message);
    }
}

testPayment();

