"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function TestDashboardPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth()
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [chatData, setChatData] = useState<any>(null)

  useEffect(() => {
    setDebugInfo({
      user,
      isAuthenticated,
      isLoading,
      userIsAdmin: user?.isAdmin,
      token: token ? 'Present' : 'Missing',
      timestamp: new Date().toISOString()
    })
  }, [user, isAuthenticated, isLoading, token])

  const testChatAPI = async () => {
    try {
      const response = await fetch('http://localhost:3000/chat/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setChatData(data)
    } catch (error) {
      console.error('Chat API test failed:', error)
      setChatData({ error: error.message })
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading authentication...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
        <p>You need to be logged in to access this page.</p>
        <button 
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Not Admin</h1>
        <p>You need admin privileges to access this page.</p>
        <p>Your role: {user?.isAdmin ? 'Admin' : 'User'}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Dashboard</h1>
      <p>Welcome, {user.username}! You have admin access.</p>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Information:</h2>
        <pre className="text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      <div className="mt-4">
        <button 
          onClick={testChatAPI}
          className="px-4 py-2 bg-green-500 text-white rounded mr-2"
        >
          Test Chat API
        </button>
        <a href="/admin" className="text-blue-500 hover:underline">
          Go to Main Admin Dashboard
        </a>
      </div>

      {chatData && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Chat API Response:</h3>
          <pre className="text-sm">{JSON.stringify(chatData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
