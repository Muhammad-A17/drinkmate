// Test script to check if chat was created
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Import the Chat model
    const Chat = require('./server/Models/chat-model');
    
    // Find all chats
    Chat.find({})
      .then(chats => {
        console.log(`Found ${chats.length} chats:`);
        chats.forEach((chat, index) => {
          console.log(`\nChat ${index + 1}:`);
          console.log(`- Session ID: ${chat.sessionId}`);
          console.log(`- Customer: ${chat.customer.name} (${chat.customer.email})`);
          console.log(`- Status: ${chat.status}`);
          console.log(`- Priority: ${chat.priority}`);
          console.log(`- Category: ${chat.category}`);
          console.log(`- Messages: ${chat.messages.length}`);
          console.log(`- Created: ${chat.createdAt}`);
        });
        
        if (chats.length === 0) {
          console.log('No chats found in database');
        }
        
        mongoose.disconnect();
      })
      .catch(error => {
        console.error('Error fetching chats:', error);
        mongoose.disconnect();
      });
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });
