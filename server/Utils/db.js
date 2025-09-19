require('dotenv').config();
const mongoose = require('mongoose');

// Use a local MongoDB instance if available, or use mock data mode
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate';

// Print URI but hide password for security
const printableUri = uri.includes('@') ? 
    uri.replace(/:([^@]*)@/, ':****@') : 
    uri;
console.log('🔍 MongoDB URI:', printableUri); 

// Set longer connection timeout for better reliability
const connectOptions = {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    maxPoolSize: 10,
    heartbeatFrequencyMS: 10000,
};

let isConnected = false;

const connect = async () => {
    try {
        // Try to connect with timeout options
        await mongoose.connect(uri, connectOptions);
        console.log('✅ Connected to MongoDB');
        isConnected = true;
        
        // Create admin user if it doesn't exist
        const User = require('../Models/user-model');
        const adminExists = await User.findOne({ email: 'admin@drinkmate.com' });
        
        if (!adminExists) {
            const admin = new User({
                username: 'admin',
                email: 'admin@drinkmate.com',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                isAdmin: true
            });
            await admin.save();
            console.log('👤 Admin user created');
        }
        
        // Create test user if it doesn't exist
        const testUserExists = await User.findOne({ email: 'test@example.com' });
        
        if (!testUserExists) {
            const testUser = new User({
                username: 'testuser',
                email: 'test@example.com',
                password: process.env.TEST_PASSWORD || 'test123',
                isAdmin: false
            });
            await testUser.save();
            console.log('👤 Test user created');
        }
        
       
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        console.log('⚠️ Running in offline mode with mock data');
        isConnected = false;
    }
   
};

// Export connect function and connection status
module.exports = { 
    connect,
    isConnected: () => isConnected 
};