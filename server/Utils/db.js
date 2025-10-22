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
        
        // Check if any admin users exist
        const User = require('../Models/user-model');
        const adminCount = await User.countDocuments({ isAdmin: true });
        
        if (adminCount === 0) {
            console.log('⚠️ No admin users found. Please create an admin user through the registration process.');
            console.log('💡 You can create an admin user by:');
            console.log('   1. Registering a new user through the frontend');
            console.log('   2. Using the admin creation endpoint with proper authorization');
            console.log('   3. Manually updating a user\'s isAdmin field in the database');
        } else {
            console.log(`👤 Found ${adminCount} admin user(s)`);
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