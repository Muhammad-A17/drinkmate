"use client"

import { useAuth } from "@/lib/auth-context"
import { useState } from "react"

export default function TestTokenPage() {
  const { user, token } = useAuth()
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testWithCurrentToken = async () => {
    setLoading(true)
    try {
      console.log('Testing with current token:', token)
      
      const response = await fetch('http://localhost:3000/chat/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      console.log('Response:', data)
      setTestResult(data)
    } catch (error) {
      console.error('Error:', error)
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testWithFreshToken = async () => {
    setLoading(true)
    try {
      // Get fresh token
      const loginResponse = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@drinkmate.com',
          password: 'admin123'
        })
      })
      
      const loginData = await loginResponse.json()
      console.log('Fresh token login:', loginData)
      
      if (loginData.token) {
        // Test with fresh token
        const chatResponse = await fetch('http://localhost:3000/chat/admin/all', {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        })
        
        const chatData = await chatResponse.json()
        console.log('Fresh token chat response:', chatData)
        setTestResult(chatData)
        
        // Update localStorage with fresh token
        localStorage.setItem('auth-token', loginData.token)
        alert('Fresh token saved to localStorage. Please refresh the page.')
      }
    } catch (error) {
      console.error('Error:', error)
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Token Test Page</h1>
      
      <div className="space-y-6">
        {/* Current Auth State */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Current Auth State</h2>
          <div className="space-y-2 text-sm">
            <div><strong>User:</strong> {user?.username} ({user?.email})</div>
            <div><strong>Is Admin:</strong> {user?.isAdmin ? 'Yes' : 'No'}</div>
            <div><strong>Token:</strong> {token ? token.substring(0, 50) + '...' : 'Missing'}</div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-x-4">
          <button 
            onClick={testWithCurrentToken}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Current Token'}
          </button>
          <button 
            onClick={testWithFreshToken}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test with Fresh Token'}
          </button>
        </div>

        {/* Results */}
        {testResult && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Test Result:</h3>
            <div className="space-y-2">
              <div><strong>Success:</strong> {testResult.success ? 'Yes' : 'No'}</div>
              <div><strong>Chats Count:</strong> {testResult.chats?.length || 0}</div>
              {testResult.error && (
                <div className="text-red-600"><strong>Error:</strong> {testResult.error}</div>
              )}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Full Response</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
