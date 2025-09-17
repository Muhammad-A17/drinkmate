const fetch = require('node-fetch');

async function testMessageFlow() {
  try {
    console.log('🧪 Testing Message Flow...');
    console.log('=' .repeat(40));
    
    // Test data
    const testData = {
      content: 'Message flow test - ' + new Date().toISOString(),
      messageType: 'text'
    };
    
    // You'll need to replace these with valid values
    const token = 'YOUR_AUTH_TOKEN_HERE';
    const chatId = 'YOUR_CHAT_ID_HERE';
    
    console.log('📤 Sending test message...');
    console.log('📝 Content:', testData.content);
    
    const response = await fetch(`http://localhost:3000/chat/${chatId}/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log('✅ Message sent successfully!');
      console.log('📝 Message ID:', responseData.data?.message?._id);
      console.log('📝 Message content:', responseData.data?.message?.content);
      console.log('📝 Message sender:', responseData.data?.message?.sender);
      console.log('📝 Message timestamp:', responseData.data?.message?.timestamp);
      
      // Wait a moment for the message to be processed
      console.log('\n⏳ Waiting for message to be processed...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the message was saved
      console.log('\n📤 Verifying message was saved...');
      const getResponse = await fetch(`http://localhost:3000/chat/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (getResponse.ok) {
        const chatData = await getResponse.json();
        const messages = chatData.data?.messages || [];
        const ourMessage = messages.find(msg => msg.content === testData.content);
        
        if (ourMessage) {
          console.log('✅ Message found in database!');
          console.log('📝 Database message ID:', ourMessage._id);
          console.log('📝 Database message content:', ourMessage.content);
          console.log('📝 Database message sender:', ourMessage.sender);
          console.log('📝 Database message timestamp:', ourMessage.timestamp);
          
          // Check if IDs match
          if (ourMessage._id === responseData.data?.message?._id) {
            console.log('✅ Message IDs match between API response and database');
          } else {
            console.log('❌ Message IDs do not match');
            console.log('📝 API ID:', responseData.data?.message?._id);
            console.log('📝 DB ID:', ourMessage._id);
          }
          
        } else {
          console.log('❌ Message not found in database');
          console.log('📝 Total messages in database:', messages.length);
          console.log('📝 Last 3 messages:');
          messages.slice(-3).forEach((msg, index) => {
            console.log(`  ${index + 1}. ${msg.content} (${msg.sender}) - ${msg.timestamp}`);
          });
        }
        
      } else {
        console.log('❌ Failed to retrieve chat data:', getResponse.status);
      }
      
    } else {
      console.log('❌ Failed to send message');
      const errorData = await response.json();
      console.log('❌ Error:', errorData.message);
    }
    
    console.log('\n' + '=' .repeat(40));
    console.log('🎯 Message Flow Test Complete!');
    
  } catch (error) {
    console.error('💥 Error testing message flow:', error);
  }
}

// Run the test
testMessageFlow();