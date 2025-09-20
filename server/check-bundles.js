#!/usr/bin/env node

/**
 * Check what bundles exist in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Bundle = require('./Models/bundle-model');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate';

console.log('🔍 Checking bundles in database...\n');

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Connected to database');
    
    // Get all bundles without any filter
    const allBundles = await Bundle.find({}).lean();
    console.log(`📊 Total bundles in database: ${allBundles.length}`);
    
    if (allBundles.length > 0) {
      console.log('\n📋 Bundle details:');
      allBundles.forEach((bundle, index) => {
        console.log(`\n${index + 1}. Bundle: ${bundle.name || 'Unnamed'}`);
        console.log(`   ID: ${bundle._id}`);
        console.log(`   isActive: ${bundle.isActive}`);
        console.log(`   isFeatured: ${bundle.isFeatured}`);
        console.log(`   category: ${bundle.category}`);
        console.log(`   price: ${bundle.price}`);
        console.log(`   createdAt: ${bundle.createdAt}`);
      });
      
      // Check active bundles specifically
      const activeBundles = await Bundle.find({ isActive: true }).lean();
      console.log(`\n✅ Active bundles (isActive: true): ${activeBundles.length}`);
      
      // Check inactive bundles
      const inactiveBundles = await Bundle.find({ isActive: false }).lean();
      console.log(`❌ Inactive bundles (isActive: false): ${inactiveBundles.length}`);
      
      // Check bundles without isActive field
      const bundlesWithoutActive = await Bundle.find({ isActive: { $exists: false } }).lean();
      console.log(`❓ Bundles without isActive field: ${bundlesWithoutActive.length}`);
      
      if (bundlesWithoutActive.length > 0) {
        console.log('\n💡 Found bundles without isActive field!');
        console.log('   These bundles need to be updated to have isActive: true');
      }
      
    } else {
      console.log('❌ No bundles found in database');
    }
    
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
  })
  .finally(() => {
    process.exit(0);
  });
