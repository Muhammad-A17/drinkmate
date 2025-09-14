const jwt = require('jsonwebtoken');

// Use the same JWT_SECRET from your .env file
const JWT_SECRET = 'KCiPBVw3xhHUDKdNSe5X7jcqDK3Kjcnig2I61bgwKIs=';

// Create a test user payload
const payload = {
  userId: '673dc48c48c48c48c48c48c48c48c48c',
  email: 'test@test.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
};

// Generate the token
const token = jwt.sign(payload, JWT_SECRET);

console.log('Generated JWT Token:');
console.log(token);
console.log('\nTest the API with:');
console.log(`curl -X POST http://localhost:3000/payments/urways -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"amount": 100, "currency": "SAR", "orderId": "test-123"}'`);
