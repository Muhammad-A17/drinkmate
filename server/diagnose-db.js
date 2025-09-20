#!/usr/bin/env node

/**
 * Database Connection Diagnostic Tool
 * This script helps diagnose why the database is not connecting
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Database Connection Diagnostic Tool');
console.log('=====================================\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '***SET***' : 'NOT SET');
console.log('   PORT:', process.env.PORT || 'not set');
console.log('');

// Check if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

console.log('2. Configuration Files:');
console.log('   .env file exists:', fs.existsSync(envPath) ? 'YES' : 'NO');
if (fs.existsSync(envPath)) {
  console.log('   .env file size:', fs.statSync(envPath).size, 'bytes');
} else {
  console.log('   ⚠️  .env file is missing!');
}
console.log('');

// Determine database URI
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate';
console.log('3. Database Configuration:');
console.log('   Using URI:', uri.includes('@') ? uri.replace(/:([^@]*)@/, ':****@') : uri);
console.log('   URI type:', uri.includes('mongodb+srv://') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB');
console.log('');

// Test connection
console.log('4. Connection Test:');
console.log('   Attempting to connect...');

const connectOptions = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 1,
};

mongoose.connect(uri, connectOptions)
  .then(() => {
    console.log('   ✅ SUCCESS: Connected to database!');
    console.log('   Database name:', mongoose.connection.db.databaseName);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Port:', mongoose.connection.port);
    
    // Test a simple query
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('   ✅ Database ping successful');
    
    // Check if bundles collection exists
    return mongoose.connection.db.listCollections({ name: 'bundles' }).toArray();
  })
  .then((collections) => {
    if (collections.length > 0) {
      console.log('   ✅ Bundles collection exists');
      
      // Count documents
      return mongoose.connection.db.collection('bundles').countDocuments();
    } else {
      console.log('   ⚠️  Bundles collection does not exist');
      return 0;
    }
  })
  .then((count) => {
    console.log('   📊 Bundle documents count:', count);
    
    if (count === 0) {
      console.log('   ⚠️  No bundles found in database');
      console.log('   💡 You may need to create some test data');
    }
  })
  .catch((error) => {
    console.log('   ❌ FAILED: Could not connect to database');
    console.log('   Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('   💡 Solution: MongoDB is not running locally');
      console.log('   - Install MongoDB locally, OR');
      console.log('   - Use MongoDB Atlas (cloud), OR');
      console.log('   - Check if MongoDB service is running');
    } else if (error.message.includes('authentication failed')) {
      console.log('   💡 Solution: Check your MongoDB credentials');
      console.log('   - Verify username and password');
      console.log('   - Check if user has proper permissions');
    } else if (error.message.includes('network')) {
      console.log('   💡 Solution: Check your network connection');
      console.log('   - Verify internet connection');
      console.log('   - Check firewall settings');
    }
  })
  .finally(() => {
    console.log('\n5. Recommendations:');
    
    if (!fs.existsSync(envPath)) {
      console.log('   📝 Create .env file:');
      console.log('   - Copy env-template.txt to .env');
      console.log('   - Update MONGODB_URI with your database URL');
    }
    
    if (uri === 'mongodb://localhost:27017/drinkmate') {
      console.log('   🗄️  For local MongoDB:');
      console.log('   - Install MongoDB Community Server');
      console.log('   - Start MongoDB service');
      console.log('   - Or use MongoDB Atlas (recommended)');
    }
    
    console.log('   🚀 For MongoDB Atlas:');
    console.log('   - Create free account at mongodb.com');
    console.log('   - Create a cluster');
    console.log('   - Get connection string');
    console.log('   - Update MONGODB_URI in .env file');
    
    console.log('\n6. Quick Setup Commands:');
    console.log('   # Copy environment template');
    console.log('   cp env-template.txt .env');
    console.log('');
    console.log('   # Install and start MongoDB locally (if using local)');
    console.log('   # Windows: Download from mongodb.com');
    console.log('   # macOS: brew install mongodb-community');
    console.log('   # Linux: sudo apt-get install mongodb');
    console.log('');
    console.log('   # Start the server');
    console.log('   npm start');
    
    process.exit(0);
  });
