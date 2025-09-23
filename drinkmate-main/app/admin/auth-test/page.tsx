'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getAuthToken } from '@/lib/auth-context'

export default function AuthTestPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    const currentToken = getAuthToken()
    setToken(currentToken)
  }, [])

  const testRecipeCreation = async () => {
    try {
      const currentToken = getAuthToken()
      if (!currentToken) {
        setTestResult('No token found')
        return
      }

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          title: 'Auth Test Recipe',
          description: 'Testing authentication'
        })
      })

      const data = await response.json()
      setTestResult(`Status: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Auth State:</h2>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>User: {user ? JSON.stringify(user, null, 2) : 'None'}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Token:</h2>
          <p>Token found: {token ? 'Yes' : 'No'}</p>
          <p>Token value: {token ? token.substring(0, 50) + '...' : 'None'}</p>
        </div>

        <button 
          onClick={testRecipeCreation}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Recipe Creation
        </button>

        <div>
          <h2 className="text-lg font-semibold">Test Result:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {testResult}
          </pre>
        </div>
      </div>
    </div>
  )
}