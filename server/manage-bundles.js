#!/usr/bin/env node

/**
 * Bundle Management Utility
 * Use this script to manage bundle status and data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Bundle = require('./Models/bundle-model');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate';

const command = process.argv[2];
const bundleId = process.argv[3];

console.log('🔧 Bundle Management Utility\n');

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Connected to database');
    
    switch (command) {
      case 'list':
        await listBundles();
        break;
      case 'activate':
        await activateBundle(bundleId);
        break;
      case 'deactivate':
        await deactivateBundle(bundleId);
        break;
      case 'activate-all':
        await activateAllBundles();
        break;
      case 'create-test':
        await createTestBundle();
        break;
      default:
        showHelp();
    }
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
  })
  .finally(() => {
    process.exit(0);
  });

async function listBundles() {
  console.log('📋 All Bundles:');
  const bundles = await Bundle.find({}).lean();
  
  if (bundles.length === 0) {
    console.log('   No bundles found');
    return;
  }
  
  bundles.forEach((bundle, index) => {
    const status = bundle.isActive ? '✅ Active' : '❌ Inactive';
    const featured = bundle.isFeatured ? '⭐ Featured' : '📦 Regular';
    console.log(`   ${index + 1}. ${bundle.name}`);
    console.log(`      ID: ${bundle._id}`);
    console.log(`      Status: ${status} | ${featured}`);
    console.log(`      Price: $${bundle.price} | Category: ${bundle.category}`);
    console.log('');
  });
}

async function activateBundle(bundleId) {
  if (!bundleId) {
    console.log('❌ Please provide bundle ID');
    return;
  }
  
  const result = await Bundle.findByIdAndUpdate(
    bundleId,
    { $set: { isActive: true } },
    { new: true }
  );
  
  if (result) {
    console.log(`✅ Activated bundle: ${result.name}`);
  } else {
    console.log('❌ Bundle not found');
  }
}

async function deactivateBundle(bundleId) {
  if (!bundleId) {
    console.log('❌ Please provide bundle ID');
    return;
  }
  
  const result = await Bundle.findByIdAndUpdate(
    bundleId,
    { $set: { isActive: false } },
    { new: true }
  );
  
  if (result) {
    console.log(`❌ Deactivated bundle: ${result.name}`);
  } else {
    console.log('❌ Bundle not found');
  }
}

async function activateAllBundles() {
  const result = await Bundle.updateMany(
    {},
    { $set: { isActive: true } }
  );
  
  console.log(`✅ Activated ${result.modifiedCount} bundles`);
}

async function createTestBundle() {
  const testBundle = new Bundle({
    name: "Test Premium Bundle",
    description: "A test bundle for development purposes",
    price: 299.99,
    originalPrice: 399.99,
    bundleDiscount: 25,
    category: "test",
    images: ["/placeholder-bundle.jpg"],
    isActive: true,
    isFeatured: true,
    stock: 10,
    badge: {
      text: "Test",
      color: "#12d6fa"
    }
  });
  
  await testBundle.save();
  console.log('✅ Created test bundle:', testBundle.name);
}

function showHelp() {
  console.log('Usage: node manage-bundles.js <command> [bundleId]');
  console.log('');
  console.log('Commands:');
  console.log('  list              - List all bundles');
  console.log('  activate <id>     - Activate a specific bundle');
  console.log('  deactivate <id>   - Deactivate a specific bundle');
  console.log('  activate-all      - Activate all bundles');
  console.log('  create-test       - Create a test bundle');
  console.log('');
  console.log('Examples:');
  console.log('  node manage-bundles.js list');
  console.log('  node manage-bundles.js activate 68c1527bb1df185393fb3b6f');
  console.log('  node manage-bundles.js activate-all');
}
