const mongoose = require('mongoose');
const User = require('./Models/user-model');

const createAdmin = async () => {
  try {
    // Connect to MongoDB using the same URI as the server
    const uri = process.env.MONGODB_URI || 'mongodb+srv://drinkmate:drinkmate123@cluster0.8qjqj.mongodb.net/drinkmate?retryWrites=true&w=majority';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@drinkmate.com' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists:', existingAdmin.email);
      console.log('🔑 Admin ID:', existingAdmin._id);
      console.log('👑 Is Admin:', existingAdmin.isAdmin);
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
    console.log('✅ Admin user created successfully:', savedUser.email);
    console.log('🔑 Admin ID:', savedUser._id);
    console.log('👑 Is Admin:', savedUser.isAdmin);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createAdmin();
