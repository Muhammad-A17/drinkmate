"use client"

import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"

export default function DebugChatPage() {
  const { user, token } = useAuth()
  const [chatData, setChatData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testChatAPI = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Testing chat API with token:', token ? 'Present' : 'Missing')
      
      const response = await fetch('http://localhost:3000/chat/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      setChatData(data)
      
      if (!data.success) {
        setError(data.message || 'API returned error')
      }
    } catch (err: any) {
      console.error('Chat API test failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testWithNewToken = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get a fresh token
      const loginResponse = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@drinkmate.com',
          password: 'admin123'
        })
      })
      
      const loginData = await loginResponse.json()
      console.log('Login response:', loginData)
      
      if (loginData.token) {
        // Test with fresh token
        const chatResponse = await fetch('http://localhost:3000/chat/admin/all', {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        })
        
        const chatData = await chatResponse.json()
        console.log('Chat response with fresh token:', chatData)
        setChatData(chatData)
      } else {
        setError('Failed to get fresh token')
      }
    } catch (err: any) {
      console.error('Fresh token test failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.isAdmin) {
      testChatAPI()
    }
  }, [user, token])

  if (!user?.isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need admin privileges to access this page.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Chat API Debug</h1>
      
      <div className="space-y-6">
        {/* Auth Info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Authentication Info</h2>
          <div className="space-y-2 text-sm">
            <div><strong>User:</strong> {user?.username} ({user?.email})</div>
            <div><strong>Is Admin:</strong> {user?.isAdmin ? 'Yes' : 'No'}</div>
            <div><strong>Token:</strong> {token ? 'Present (' + token.substring(0, 20) + '...)' : 'Missing'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-x-4">
          <button 
            onClick={testChatAPI}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Current Token'}
          </button>
          <button 
            onClick={testWithNewToken}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test with Fresh Token'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {chatData && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">API Response:</h3>
            <div className="space-y-2">
              <div><strong>Success:</strong> {chatData.success ? 'Yes' : 'No'}</div>
              <div><strong>Chats Count:</strong> {chatData.chats?.length || 0}</div>
              {chatData.chats && chatData.chats.length > 0 && (
                <div>
                  <strong>Chats:</strong>
                  <ul className="ml-4 mt-2 space-y-1">
                    {chatData.chats.map((chat: any, index: number) => (
                      <li key={index} className="text-sm">
                        {index + 1}. {chat.subject} - {chat.customer?.email} ({chat.status})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Full Response</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(chatData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
