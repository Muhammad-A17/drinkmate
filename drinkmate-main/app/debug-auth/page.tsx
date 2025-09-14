"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"

export default function DebugAuthPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth()
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null)
  const [sessionStorageToken, setSessionStorageToken] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageToken(localStorage.getItem('auth-token'))
      setSessionStorageToken(sessionStorage.getItem('auth-token'))
    }
  }, [])

  const testTokenVerification = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      console.log('Token verification result:', data)
      alert('Token verification result: ' + JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Token verification failed:', error)
      alert('Token verification failed: ' + error.message)
    }
  }

  const loginAsAdmin = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@drinkmate.com',
          password: 'admin123'
        })
      })
      const data = await response.json()
      console.log('Login result:', data)
      
      if (data.token) {
        localStorage.setItem('auth-token', data.token)
        sessionStorage.setItem('auth-token', data.token)
        alert('Login successful! Token saved. Please refresh the page.')
        window.location.reload()
      } else {
        alert('Login failed: ' + JSON.stringify(data, null, 2))
      }
    } catch (error) {
      console.error('Login failed:', error)
      alert('Login failed: ' + error.message)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auth State */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Auth Context State</h2>
          <div className="space-y-2 text-sm">
            <div><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</div>
            <div><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</div>
            <div><strong>user:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</div>
            <div><strong>token:</strong> {token ? 'Present (' + token.substring(0, 20) + '...)' : 'Missing'}</div>
          </div>
        </div>

        {/* Storage State */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Storage State</h2>
          <div className="space-y-2 text-sm">
            <div><strong>localStorage token:</strong> {localStorageToken ? 'Present (' + localStorageToken.substring(0, 20) + '...)' : 'Missing'}</div>
            <div><strong>sessionStorage token:</strong> {sessionStorageToken ? 'Present (' + sessionStorageToken.substring(0, 20) + '...)' : 'Missing'}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-x-4">
        <button 
          onClick={loginAsAdmin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login as Admin
        </button>
        <button 
          onClick={testTokenVerification}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Token Verification
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Refresh Page
        </button>
      </div>

      {/* Quick Links */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Quick Links:</h3>
        <div className="space-x-4">
          <a href="/admin" className="text-blue-500 hover:underline">Admin Dashboard</a>
          <a href="/admin/test-dashboard" className="text-blue-500 hover:underline">Test Dashboard</a>
          <a href="/login" className="text-blue-500 hover:underline">Login Page</a>
        </div>
      </div>
    </div>
  )
}
