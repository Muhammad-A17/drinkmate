const fetch = require('node-fetch');

async function testDuplicateFix() {
  try {
    console.log('🧪 Testing duplicate message fix...');
    
    // Test data
    const testData = {
      content: 'Test message for duplicate fix',
      messageType: 'text'
    };
    
    // You'll need to replace these with valid values
    const token = 'YOUR_AUTH_TOKEN_HERE';
    const chatId = 'YOUR_CHAT_ID_HERE';
    
    console.log('📤 Testing message API endpoint...');
    
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
      console.log('✅ Message API test passed!');
      console.log('📝 Message ID:', responseData.data?.message?._id);
      console.log('📝 Message content:', responseData.data?.message?.content);
      
      // Test message retrieval to check for duplicates
      console.log('\n📤 Testing message retrieval...');
      const getResponse = await fetch(`http://localhost:3000/chat/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (getResponse.ok) {
        const chatData = await getResponse.json();
        console.log('✅ Message retrieval test passed!');
        console.log('📝 Total messages:', chatData.data?.messages?.length || 0);
        
        // Check for duplicate messages
        const messages = chatData.data?.messages || [];
        const duplicateMessages = messages.filter((msg, index, arr) => 
          arr.findIndex(m => m.content === msg.content && m.timestamp === msg.timestamp) !== index
        );
        
        if (duplicateMessages.length > 0) {
          console.log('❌ Duplicate messages found:', duplicateMessages.length);
          console.log('📝 Duplicates:', duplicateMessages.map(m => ({ content: m.content, timestamp: m.timestamp })));
        } else {
          console.log('✅ No duplicate messages found!');
        }
        
        // Show last few messages
        console.log('📝 Last 3 messages:');
        messages.slice(-3).forEach((msg, index) => {
          console.log(`  ${index + 1}. ${msg.content} (${msg.sender}) - ${msg.timestamp}`);
        });
        
      } else {
        console.log('❌ Message retrieval test failed:', getResponse.status);
      }
      
    } else {
      console.log('❌ Message API test failed');
      const errorData = await response.json();
      console.log('❌ Error:', errorData.message);
    }
    
  } catch (error) {
    console.error('💥 Error testing duplicate fix:', error);
  }
}

// Run the test
testDuplicateFix();
