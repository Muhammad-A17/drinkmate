require('dotenv').config();
const mongoose = require('mongoose');

async function fixDuplicateIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Fix orders collection indexes
    console.log('\n🔧 Fixing orders collection indexes...');
    const ordersCollection = db.collection('orders');
    
    // List current indexes
    const currentIndexes = await ordersCollection.indexes();
    console.log('\n📋 Current indexes:');
    currentIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop problematic duplicate indexes
    const indexesToDrop = [
      'shipping.aramexWaybillNumber_1', // This was causing the duplicate warning
    ];

    for (const indexName of indexesToDrop) {
      try {
        await ordersCollection.dropIndex(indexName);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (error) {
        if (error.code === 27) {
          console.log(`⚠️ Index ${indexName} does not exist or already dropped`);
        } else {
          console.log(`❌ Error dropping index ${indexName}:`, error.message);
        }
      }
    }

    // List indexes after cleanup
    const indexesAfter = await ordersCollection.indexes();
    console.log('\n📋 Indexes after cleanup:');
    indexesAfter.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Fix users collection indexes
    console.log('\n🔧 Fixing users collection indexes...');
    const usersCollection = db.collection('users');
    
    const userIndexes = await usersCollection.indexes();
    console.log('\n📋 Current user indexes:');
    userIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Fix chats collection indexes
    console.log('\n🔧 Fixing chats collection indexes...');
    const chatsCollection = db.collection('chats');
    
    const chatIndexes = await chatsCollection.indexes();
    console.log('\n📋 Current chat indexes:');
    chatIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Fix products collection indexes
    console.log('\n🔧 Fixing products collection indexes...');
    const productsCollection = db.collection('products');
    
    const productIndexes = await productsCollection.indexes();
    console.log('\n📋 Current product indexes:');
    productIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n✅ Index cleanup completed!');
    console.log('💡 Restart your server to recreate indexes properly.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

fixDuplicateIndexes();

