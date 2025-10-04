"use client"

import { useState, useEffect } from 'react'
import { useWishlist } from '@/hooks/use-wishlist'
import { useAuth } from '@/lib/contexts/auth-context'

export default function WishlistTest() {
  const { user, isAuthenticated, token } = useAuth()
  const { 
    items, 
    itemIds, 
    isInWishlist, 
    addToWishlist, 
    removeFromWishlist, 
    toggleWishlist, 
    clearWishlist, 
    loading, 
    error, 
    refreshWishlist 
  } = useWishlist()
  
  const [testProductId, setTestProductId] = useState('test-product-123')
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const runWishlistTest = async () => {
    setTestResults([])
    
    try {
      // Test 1: Authentication Status
      addTestResult(`Auth: ${isAuthenticated ? '✅' : '❌'} (User: ${user?.email || 'Guest'})`)
      
      // Test 2: Wishlist Loading
      addTestResult(`Loading: ${loading ? '⏳' : '✅'} (Items: ${items.length})`)
      
      // Test 3: Error Status
      addTestResult(`Error: ${error ? `❌ ${error}` : '✅ None'}`)
      
      // Test 4: Add to Wishlist
      addTestResult(`Adding product ${testProductId}...`)
      const addResult = await addToWishlist(testProductId)
      addTestResult(`Add Result: ${addResult ? '✅' : '❌'}`)
      
      // Test 5: Check if in wishlist
      const inWishlist = isInWishlist(testProductId)
      addTestResult(`In Wishlist: ${inWishlist ? '✅' : '❌'}`)
      
      // Test 6: Toggle wishlist
      addTestResult(`Toggling product ${testProductId}...`)
      const toggleResult = await toggleWishlist(testProductId)
      addTestResult(`Toggle Result: ${toggleResult ? '✅' : '❌'}`)
      
      // Test 7: Final count
      addTestResult(`Final Items: ${items.length}`)
      
    } catch (error) {
      addTestResult(`Test Error: ${error}`)
    }
  }

  const clearTest = async () => {
    setTestResults([])
    await clearWishlist()
    addTestResult('Wishlist cleared')
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-md z-50">
      <h3 className="font-bold text-lg mb-2">Wishlist Test</h3>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <strong>Auth:</strong> {isAuthenticated ? '✅' : '❌'} {user?.email || 'Guest'}
        </div>
        <div className="text-sm">
          <strong>Loading:</strong> {loading ? '⏳' : '✅'}
        </div>
        <div className="text-sm">
          <strong>Items:</strong> {items.length}
        </div>
        <div className="text-sm">
          <strong>Error:</strong> {error ? `❌ ${error}` : '✅ None'}
        </div>
      </div>
      
      <div className="space-y-2">
        <input
          type="text"
          value={testProductId}
          onChange={(e) => setTestProductId(e.target.value)}
          placeholder="Test product ID"
          className="w-full p-2 border rounded text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={runWishlistTest}
            className="flex-1 bg-blue-500 text-white p-2 rounded text-sm"
          >
            Run Test
          </button>
          <button
            onClick={clearTest}
            className="flex-1 bg-red-500 text-white p-2 rounded text-sm"
          >
            Clear
          </button>
        </div>
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
