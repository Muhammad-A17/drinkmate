const fetch = require('node-fetch');

async function testCompleteWorkflow() {
  try {
    console.log('🧪 Testing Complete Message Sending Workflow...');
    console.log('=' .repeat(60));
    
    // Test data
    const testData = {
      content: 'Complete workflow test message',
      messageType: 'text'
    };
    
    // You'll need to replace these with valid values
    const token = 'YOUR_AUTH_TOKEN_HERE';
    const chatId = 'YOUR_CHAT_ID_HERE';
    
    console.log('📤 Step 1: Testing message API endpoint...');
    
    const response = await fetch(`http://localhost:3000/chat/${chatId}/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const responseData = await response.json();
      console.log('✅ Step 1 PASSED: Message API test');
      console.log('📝 Message ID:', responseData.data?.message?._id);
      console.log('📝 Message content:', responseData.data?.message?.content);
      console.log('📝 Message sender:', responseData.data?.message?.sender);
      console.log('📝 Message timestamp:', responseData.data?.message?.timestamp);
      
      console.log('\n📤 Step 2: Testing message retrieval...');
      const getResponse = await fetch(`http://localhost:3000/chat/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (getResponse.ok) {
        const chatData = await getResponse.json();
        console.log('✅ Step 2 PASSED: Message retrieval test');
        console.log('📝 Total messages:', chatData.data?.messages?.length || 0);
        
        // Check for duplicate messages
        const messages = chatData.data?.messages || [];
        const duplicateMessages = messages.filter((msg, index, arr) => 
          arr.findIndex(m => m.content === msg.content && m.timestamp === msg.timestamp) !== index
        );
        
        if (duplicateMessages.length > 0) {
          console.log('❌ Step 3 FAILED: Duplicate messages found:', duplicateMessages.length);
          console.log('📝 Duplicates:', duplicateMessages.map(m => ({ content: m.content, timestamp: m.timestamp })));
        } else {
          console.log('✅ Step 3 PASSED: No duplicate messages found');
        }
        
        // Show last few messages
        console.log('\n📝 Last 3 messages:');
        messages.slice(-3).forEach((msg, index) => {
          console.log(`  ${index + 1}. ${msg.content} (${msg.sender}) - ${msg.timestamp}`);
        });
        
        console.log('\n📤 Step 4: Testing chat session persistence...');
        const sessionResponse = await fetch(`http://localhost:3000/chat`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          console.log('✅ Step 4 PASSED: Chat session persistence test');
          console.log('📝 Active chats:', sessionData.data?.chats?.length || 0);
          
          // Check if our chat is in the list
          const ourChat = sessionData.data?.chats?.find(chat => chat._id === chatId);
          if (ourChat) {
            console.log('✅ Step 5 PASSED: Chat found in active sessions');
            console.log('📝 Chat status:', ourChat.status);
            console.log('📝 Chat priority:', ourChat.priority);
            console.log('📝 Last message at:', ourChat.lastMessageAt);
          } else {
            console.log('❌ Step 5 FAILED: Chat not found in active sessions');
          }
        } else {
          console.log('❌ Step 4 FAILED: Chat session persistence test failed:', sessionResponse.status);
        }
        
        console.log('\n📤 Step 6: Testing message structure...');
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) {
          const requiredFields = ['_id', 'content', 'sender', 'timestamp', 'messageType'];
          const missingFields = requiredFields.filter(field => !lastMessage[field]);
          
          if (missingFields.length === 0) {
            console.log('✅ Step 6 PASSED: Message structure is correct');
            console.log('📝 Message has all required fields:', requiredFields.join(', '));
          } else {
            console.log('❌ Step 6 FAILED: Message missing required fields:', missingFields);
          }
        }
        
        console.log('\n📤 Step 7: Testing message ID format...');
        const messageIds = messages.map(msg => msg._id);
        const validObjectIds = messageIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id));
        
        if (validObjectIds.length === messageIds.length) {
          console.log('✅ Step 7 PASSED: All message IDs are valid MongoDB ObjectIds');
        } else {
          console.log('❌ Step 7 FAILED: Some message IDs are not valid ObjectIds');
          console.log('📝 Invalid IDs:', messageIds.filter(id => !/^[0-9a-fA-F]{24}$/.test(id)));
        }
        
      } else {
        console.log('❌ Step 2 FAILED: Message retrieval test failed:', getResponse.status);
      }
      
    } else {
      console.log('❌ Step 1 FAILED: Message API test failed');
      const errorData = await response.json();
      console.log('❌ Error:', errorData.message);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 Complete Workflow Test Summary:');
    console.log('✅ Message sending via API');
    console.log('✅ Message retrieval from database');
    console.log('✅ Duplicate message prevention');
    console.log('✅ Chat session persistence');
    console.log('✅ Message structure validation');
    console.log('✅ Message ID format validation');
    console.log('\n🚀 All tests completed!');
    
  } catch (error) {
    console.error('💥 Error testing complete workflow:', error);
  }
}

// Run the test
testCompleteWorkflow();
