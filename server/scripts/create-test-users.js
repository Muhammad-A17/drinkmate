const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../Models/user-model');

// Database connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test users
const createTestUsers = async () => {
  try {
    console.log('🚀 Creating test users...');

    // Check if users already exist
    const existingAdmin = await User.findOne({ email: 'admin@drinkmate.com' });
    const existingUser = await User.findOne({ email: 'customer@drinkmate.com' });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
    } else {
      // Create Admin User
      const adminPassword = await bcrypt.hash('admin123', 12);
      const adminUser = new User({
        username: 'admin',
        email: 'admin@drinkmate.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+966501234567',
        isAdmin: true,
        isActive: true,
        emailVerified: true,
        status: 'active'
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log('   Email: admin@drinkmate.com');
      console.log('   Password: admin123');
    }

    if (existingUser) {
      console.log('⚠️ Customer user already exists');
    } else {
      // Create Customer User
      const customerPassword = await bcrypt.hash('customer123', 12);
      const customerUser = new User({
        username: 'customer',
        email: 'customer@drinkmate.com',
        password: customerPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+966501234568',
        isAdmin: false,
        isActive: true,
        emailVerified: true,
        status: 'active'
      });

      await customerUser.save();
      console.log('✅ Customer user created successfully');
      console.log('   Email: customer@drinkmate.com');
      console.log('   Password: customer123');
    }

    // Display all users
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({}, 'username email firstName lastName isAdmin isActive');
    allUsers.forEach(user => {
      console.log(`   ${user.isAdmin ? '👑' : '👤'} ${user.firstName} ${user.lastName} (${user.email}) - ${user.isAdmin ? 'Admin' : 'Customer'}`);
    });

    console.log('\n🎉 Test users setup complete!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@drinkmate.com / admin123');
    console.log('   Customer: customer@drinkmate.com / customer123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createTestUsers();
  await mongoose.disconnect();
  console.log('\n✅ Database connection closed');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
