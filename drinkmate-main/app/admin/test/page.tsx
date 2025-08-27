"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminTestPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      user,
      isAuthenticated,
      isLoading,
      userIsAdmin: user?.isAdmin,
      timestamp: new Date().toISOString()
    })
  }, [user, isAuthenticated, isLoading])

  if (isLoading) {
    return <div className="p-8">Loading...</div>
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
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <p>Welcome, {user.username}! You have admin access.</p>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Information:</h2>
        <pre className="text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      <div className="mt-4">
        <a href="/admin/co2-cylinders" className="text-blue-500 hover:underline">
          Go to CO2 Cylinders
        </a>
      </div>
    </div>
  )
}
