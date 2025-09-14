const mongoose = require('mongoose');
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

// Verify test users
const verifyTestUsers = async () => {
  try {
    console.log('🔍 Verifying test users...\n');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@drinkmate.com' });
    if (adminUser) {
      console.log('👑 ADMIN USER:');
      console.log(`   ID: ${adminUser._id}`);
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`);
      console.log(`   Phone: ${adminUser.phone || 'Not set'}`);
      console.log(`   Is Admin: ${adminUser.isAdmin}`);
      console.log(`   Is Active: ${adminUser.isActive}`);
      console.log(`   Status: ${adminUser.status}`);
      console.log(`   Created: ${adminUser.createdAt}`);
    } else {
      console.log('❌ Admin user not found');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Find customer user
    const customerUser = await User.findOne({ email: 'customer@drinkmate.com' });
    if (customerUser) {
      console.log('👤 CUSTOMER USER:');
      console.log(`   ID: ${customerUser._id}`);
      console.log(`   Username: ${customerUser.username}`);
      console.log(`   Email: ${customerUser.email}`);
      console.log(`   Name: ${customerUser.firstName} ${customerUser.lastName}`);
      console.log(`   Phone: ${customerUser.phone || 'Not set'}`);
      console.log(`   Is Admin: ${customerUser.isAdmin}`);
      console.log(`   Is Active: ${customerUser.isActive}`);
      console.log(`   Status: ${customerUser.status}`);
      console.log(`   Created: ${customerUser.createdAt}`);
    } else {
      console.log('❌ Customer user not found');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Show all users count
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ isAdmin: true });
    const customerCount = await User.countDocuments({ isAdmin: false });

    console.log('📊 DATABASE STATISTICS:');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Admin Users: ${adminCount}`);
    console.log(`   Customer Users: ${customerCount}`);

    console.log('\n🎯 TESTING INSTRUCTIONS:');
    console.log('1. Start your backend server: npm start');
    console.log('2. Start your frontend: npm run dev');
    console.log('3. Login as admin: admin@drinkmate.com / admin123');
    console.log('4. Login as customer: customer@drinkmate.com / customer123');
    console.log('5. Test chat functionality between the two accounts');

  } catch (error) {
    console.error('❌ Error verifying test users:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await verifyTestUsers();
  await mongoose.disconnect();
  console.log('\n✅ Database connection closed');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
