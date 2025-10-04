require('dotenv').config();
const mongoose = require('mongoose');

async function dropDuplicateIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the Order collection
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    // List all indexes
    const indexes = await ordersCollection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop the specific index that's causing the duplicate warning
    try {
      await ordersCollection.dropIndex('shipping.aramexWaybillNumber_1');
      console.log('\n✅ Dropped index: shipping.aramexWaybillNumber_1');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️ Index does not exist or already dropped');
      } else {
        throw error;
      }
    }

    // List indexes after dropping
    const indexesAfter = await ordersCollection.indexes();
    console.log('\n📋 Indexes after dropping:');
    indexesAfter.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n✅ Done! Restart your server to recreate the index properly.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

dropDuplicateIndex();

