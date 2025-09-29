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
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    retryWrites: true,
    retryReads: true,
    readPreference: 'primary',
    w: 'majority',
    j: true // Journal acknowledgment
};

let isConnected = false;
let connectionRetries = 0;
const maxRetries = 3;

const connect = async () => {
    try {
        // Try to connect with timeout options
        await mongoose.connect(uri, connectOptions);
        console.log('✅ Connected to MongoDB');
        isConnected = true;
        connectionRetries = 0; // Reset retry counter on successful connection
        
        // Set up connection event handlers
        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
            isConnected = false;
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
            isConnected = false;
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
            isConnected = true;
            
            // Start session timeout service if it's not already running
            try {
                const sessionTimeoutService = require('../Services/session-timeout-service');
                if (!sessionTimeoutService.isRunning) {
                    console.log('🔄 Starting session timeout service after reconnection');
                    sessionTimeoutService.start();
                }
            } catch (error) {
                console.log('⚠️ Could not start session timeout service:', error.message);
            }
        });
        
        // Create admin user if it doesn't exist
        const User = require('../Models/user-model');
        const adminExists = await User.findOne({ email: 'admin@drinkmate.com' });
        
        if (!adminExists) {
            const admin = new User({
                username: 'admin',
                email: 'admin@drinkmate.com',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                firstName: 'Admin',
                lastName: 'User',
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
                firstName: 'Test',
                lastName: 'User',
                isAdmin: false
            });
            await testUser.save();
            console.log('👤 Test user created');
        }
        
        // Start session timeout service after successful connection
        try {
            const sessionTimeoutService = require('../Services/session-timeout-service');
            if (!sessionTimeoutService.isRunning) {
                console.log('🔄 Starting session timeout service after database connection');
                sessionTimeoutService.start();
            }
        } catch (error) {
            console.log('⚠️ Could not start session timeout service:', error.message);
        }
        
       
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        isConnected = false;
        
        // Retry connection if we haven't exceeded max retries
        if (connectionRetries < maxRetries) {
            connectionRetries++;
            console.log(`🔄 Retrying MongoDB connection (${connectionRetries}/${maxRetries}) in 5 seconds...`);
            setTimeout(() => {
                connect();
            }, 5000);
        } else {
            console.log('⚠️ Max MongoDB connection retries reached. Running in offline mode with mock data');
        }
    }
   
};

// Export connect function and connection status
module.exports = { 
    connect,
    isConnected: () => isConnected 
};