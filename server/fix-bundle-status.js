#!/usr/bin/env node

/**
 * Fix bundle status to make them active
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Bundle = require('./Models/bundle-model');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate';

console.log('🔧 Fixing bundle status...\n');

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Connected to database');
    
    // Update all bundles to be active
    const result = await Bundle.updateMany(
      {}, // Update all bundles
      { 
        $set: { 
          isActive: true,
          isFeatured: true // Also make them featured for better visibility
        } 
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} bundles`);
    
    // Verify the update
    const activeBundles = await Bundle.find({ isActive: true }).lean();
    console.log(`📊 Active bundles after update: ${activeBundles.length}`);
    
    if (activeBundles.length > 0) {
      console.log('\n📋 Updated bundles:');
      activeBundles.forEach((bundle, index) => {
        console.log(`${index + 1}. ${bundle.name} - Active: ${bundle.isActive}, Featured: ${bundle.isFeatured}`);
      });
    }
    
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
  })
  .finally(() => {
    process.exit(0);
  });
