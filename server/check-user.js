const mongoose = require('mongoose');
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./Models/user-model');
    const user = await User.findOne({ email: 'aisha.mutairi@example.com' });
    
    if (user) {
      console.log('User found:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Phone:', user.phone);
      console.log('District:', user.district);
      console.log('City:', user.city);
      console.log('National Address:', user.nationalAddress);
      console.log('Country:', user.country);
    } else {
      console.log('User not found');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
