'use client'

import { useState } from 'react'
import { getAuthToken } from '@/lib/auth-context'

export default function TestTokenPage() {
  const [result, setResult] = useState<string>('')

  const testToken = async () => {
    try {
      const token = getAuthToken()
      console.log('Token found:', !!token)
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token')
      
      if (!token) {
        setResult('No token found in localStorage')
        return
      }

      const response = await fetch('/api/recipes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      setResult(`API Response: ${response.status} - ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Token Test</h1>
      <button 
        onClick={testToken}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Token
      </button>
      <pre className="mt-4 p-4 bg-gray-100 rounded">
        {result}
      </pre>
    </div>
  )
}