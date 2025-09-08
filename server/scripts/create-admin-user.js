const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simple script to create an admin user for testing
const createAdminUser = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Import User model
    const User = require('../Models/user-model');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@drinkmate.com' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists:', existingAdmin.email);
      
      // Generate a token for the existing admin
      const token = jwt.sign(
        { 
          id: existingAdmin._id, 
          email: existingAdmin.email,
          isAdmin: existingAdmin.isAdmin 
        },
        process.env.JWT_SECRET || 'default_dev_secret',
        { expiresIn: '7d' }
      );
      
      console.log('🔑 Admin token:', token);
      console.log('💾 Save this token in localStorage as "auth-token" to test admin features');
      return;
    }
    
    console.log('🚀 Creating admin user...');
    
    // Hash password
    // Security: Use environment variable for admin password
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@drinkmate.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      isActive: true,
      emailVerified: true
    });
    
    const savedUser = await adminUser.save();
    console.log('✅ Admin user created:', savedUser.email);
    
    // Generate a token for the new admin
    const token = jwt.sign(
      { 
        id: savedUser._id, 
        email: savedUser.email,
        isAdmin: savedUser.isAdmin 
      },
      process.env.JWT_SECRET || 'default_dev_secret',
      { expiresIn: '7d' }
    );
    
    console.log('🔑 Admin token:', token);
    console.log('💾 Save this token in localStorage as "auth-token" to test admin features');
    console.log('🔐 Admin credentials:');
    console.log('   Email: admin@drinkmate.com');
    console.log('   Password: [REDACTED - Check environment variable ADMIN_PASSWORD]');
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
};

// Run the script
createAdminUser();
