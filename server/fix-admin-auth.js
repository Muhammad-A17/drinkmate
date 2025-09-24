// Quick fix for admin authentication
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const fixAdminAuth = async () => {
  try {
    console.log('🔧 Fixing admin authentication...');
    
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    
    // Import User model
    const User = require('./Models/user-model');
    
    // Check if admin exists
    let adminUser = await User.findOne({ email: 'admin@drinkmate.com' });
    
    if (!adminUser) {
      console.log('👤 Creating admin user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Create admin user
      adminUser = new User({
        username: 'admin',
        email: 'admin@drinkmate.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true,
        isActive: true,
        emailVerified: true,
        status: 'active'
      });
      
      adminUser = await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      console.log('👤 Admin user already exists');
    }
    
    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'default_dev_secret_change_in_production';
    const token = jwt.sign(
      { 
        id: adminUser._id, 
        email: adminUser.email,
        isAdmin: adminUser.isAdmin 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('\n🎉 SUCCESS! Here\'s what you need to do:');
    console.log('1. Open your browser and go to: http://localhost:3001/admin/exchange-cylinders');
    console.log('2. Open Developer Tools (F12)');
    console.log('3. Go to Console tab');
    console.log('4. Run this command:');
    console.log(`   localStorage.setItem('auth-token', '${token}');`);
    console.log('5. Refresh the page');
    console.log('\n🔑 Admin credentials:');
    console.log('   Email: admin@drinkmate.com');
    console.log('   Password: admin123');
    console.log('\n💡 You can also log in normally using these credentials');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

fixAdminAuth();