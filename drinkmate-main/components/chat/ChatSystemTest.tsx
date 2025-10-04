"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useSocket } from '@/lib/contexts/socket-context'
import { useChat } from '@/lib/contexts/chat-context'

export default function ChatSystemTest() {
  const { user, isAuthenticated } = useAuth()
  const { socket, isConnected, healthCheck } = useSocket()
  const { state: chatState, sendMessage, createNewChat } = useChat()
  const [testMessage, setTestMessage] = useState('')
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const runChatSystemTest = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      // Test 1: Authentication
      addTestResult(`Authentication: ${isAuthenticated ? 'PASS' : 'FAIL'} (User: ${user?.email || 'None'})`)
      
      // Test 2: Socket Connection
      addTestResult(`Socket Connection: ${isConnected ? 'PASS' : 'FAIL'} (Socket ID: ${socket?.id || 'None'})`)
      
      // Test 3: Health Check
      if (socket && isConnected) {
        try {
          const health = await healthCheck()
          addTestResult(`Health Check: PASS (${JSON.stringify(health)})`)
        } catch (error) {
          addTestResult(`Health Check: FAIL (${error})`)
        }
      }
      
      // Test 4: Chat Creation
      if (isAuthenticated && user) {
        try {
          await createNewChat()
          addTestResult(`Chat Creation: PASS (Chat ID: ${chatState.currentChat?._id || 'None'})`)
        } catch (error) {
          addTestResult(`Chat Creation: FAIL (${error})`)
        }
      }
      
      // Test 5: Message Sending
      if (chatState.currentChat && testMessage.trim()) {
        try {
          await sendMessage(testMessage)
          addTestResult(`Message Sending: PASS (Message: "${testMessage}")`)
        } catch (error) {
          addTestResult(`Message Sending: FAIL (${error})`)
        }
      }
      
      // Test 6: Message Count
      addTestResult(`Message Count: ${chatState.messages.length} messages`)
      
    } catch (error) {
      addTestResult(`Test Error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md z-50">
      <h3 className="font-bold text-lg mb-2">Chat System Test</h3>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <strong>Auth:</strong> {isAuthenticated ? '✅' : '❌'} {user?.email || 'Not logged in'}
        </div>
        <div className="text-sm">
          <strong>Socket:</strong> {isConnected ? '✅' : '❌'} {socket?.id || 'Not connected'}
        </div>
        <div className="text-sm">
          <strong>Chat:</strong> {chatState.currentChat ? '✅' : '❌'} {chatState.currentChat?._id || 'No active chat'}
        </div>
        <div className="text-sm">
          <strong>Messages:</strong> {chatState.messages.length}
        </div>
      </div>
      
      <div className="space-y-2">
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Test message"
          className="w-full p-2 border rounded text-sm"
        />
        <button
          onClick={runChatSystemTest}
          disabled={isRunning}
          className="w-full bg-blue-500 text-white p-2 rounded text-sm disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run Chat System Test'}
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="mt-4 max-h-40 overflow-y-auto">
          <h4 className="font-semibold text-sm mb-1">Test Results:</h4>
          <div className="text-xs space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-gray-600">{result}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
