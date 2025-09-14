const mongoose = require('mongoose');
const User = require('./Models/user-model');

const createAdmin = async () => {
  try {
    // Connect to MongoDB using the same URI as the server
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@drinkmate.com' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists:');
      console.log('   Email:', existingAdmin.email);
      console.log('   ID:', existingAdmin._id);
      console.log('   Is Admin:', existingAdmin.isAdmin);
      console.log('   Username:', existingAdmin.username);
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@drinkmate.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      isActive: true,
      emailVerified: true
    });

    const savedUser = await adminUser.save();
    console.log('✅ Admin user created successfully:');
    console.log('   Email:', savedUser.email);
    console.log('   ID:', savedUser._id);
    console.log('   Is Admin:', savedUser.isAdmin);
    console.log('   Username:', savedUser.username);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 The server might be running in offline mode. Try logging in with:');
      console.log('   Email: admin@drinkmate.com');
      console.log('   Password: admin123');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createAdmin();
