"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { co2API } from "@/lib/api"

export default function AuthDebugPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
    setDebugInfo({
      user,
      isAuthenticated,
      isLoading,
      userIsAdmin: user?.isAdmin,
      token: token ? `${token.substring(0, 20)}...` : 'No token',
      tokenLength: token ? token.length : 0,
      localStorage: localStorage.getItem('auth-token') ? 'Has token' : 'No token',
      sessionStorage: sessionStorage.getItem('auth-token') ? 'Has token' : 'No token',
      timestamp: new Date().toISOString()
    })
  }, [user, isAuthenticated, isLoading])

  const testAuth = async () => {
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
    if (!token) {
      alert('No token found')
      return
    }

    try {
      // Use co2API instead of direct fetch
      const response = await co2API.getCylinders();
      
      alert(`Response: ${response.success ? 'Success' : 'Failed'} - ${response.message || ''}`)
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={testAuth}
              className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
            >
              Test CO2 API Call
            </button>
            
            <button
              onClick={() => {
                localStorage.removeItem('auth-token')
                sessionStorage.removeItem('auth-token')
                window.location.reload()
              }}
              className="w-full bg-red-500 text-white p-3 rounded hover:bg-red-600"
            >
              Clear All Tokens
            </button>

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Check if you have a valid token in localStorage or sessionStorage</li>
          <li>If no token, go to login page and authenticate</li>
          <li>If token exists, test the API call to see the response</li>
          <li>Check the browser console for any errors</li>
        </ol>
      </div>
    </div>
  )
}
