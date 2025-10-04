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
    connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT_MS) || 30000,
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT_MS) || 30000,
    serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT_MS) || 30000,
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
    heartbeatFrequencyMS: parseInt(process.env.DB_HEARTBEAT_FREQUENCY_MS) || 10000,
    maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME_MS) || 30000, // Close connections after 30 seconds of inactivity
    retryWrites: true,
    retryReads: true,
    readPreference: 'primary',
    w: 'majority',
    journal: true // Journal acknowledgment (replaces deprecated 'j' option)
};

let isConnected = false;
let connectionRetries = 0;
const maxRetries = parseInt(process.env.DB_MAX_RETRIES) || 3;

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
            // Session timeout service is already running, no need to restart
        });
        
        // Create admin user if it doesn't exist
        const User = require('../Models/user-model');
        const adminExists = await User.findOne({ email: 'admin@drinkmate.com' });
        
        if (!adminExists && process.env.ADMIN_PASSWORD) {
            const admin = new User({
                username: 'admin',
                email: 'admin@drinkmate.com',
                password: process.env.ADMIN_PASSWORD,
                firstName: 'Admin',
                lastName: 'User',
                isAdmin: true
            });
            await admin.save();
            console.log('👤 Admin user created');
        } else if (!adminExists) {
            console.log('⚠️ Admin user not created - ADMIN_PASSWORD not set in environment');
        }
        
        // Create test user if it doesn't exist
        const testUserExists = await User.findOne({ email: 'test@example.com' });
        
        if (!testUserExists && process.env.TEST_PASSWORD) {
            const testUser = new User({
                username: 'testuser',
                email: 'test@example.com',
                password: process.env.TEST_PASSWORD,
                firstName: 'Test',
                lastName: 'User',
                isAdmin: false
            });
            await testUser.save();
            console.log('👤 Test user created');
        } else if (!testUserExists) {
            console.log('⚠️ Test user not created - TEST_PASSWORD not set in environment');
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