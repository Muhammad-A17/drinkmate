"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useCart } from '@/lib/contexts/cart-context'

export default function CartIsolationTest() {
  const { user, isAuthenticated } = useAuth()
  const { state } = useCart()
  const [localStorageCarts, setLocalStorageCarts] = useState<Record<string, any>>({})

  useEffect(() => {
    // Check all cart keys in localStorage
    const carts: Record<string, any> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('drinkmate-cart')) {
        try {
          const cartData = JSON.parse(localStorage.getItem(key) || '[]')
          carts[key] = cartData
        } catch (error) {
          carts[key] = 'Error parsing cart data'
        }
      }
    }
    setLocalStorageCarts(carts)
  }, [state.items]) // Update when cart changes

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Cart Isolation Test (Dev Only)</h3>
      <div className="text-xs space-y-1">
        <div>
          <strong>Current User:</strong> {isAuthenticated ? user?.email || user?._id : 'Guest'}
        </div>
        <div>
          <strong>Current Cart Items:</strong> {state.items.length}
        </div>
        <div>
          <strong>Cart Total:</strong> {state.total}
        </div>
        <div className="mt-2">
          <strong>All Carts in localStorage:</strong>
          <div className="max-h-32 overflow-y-auto">
            {Object.entries(localStorageCarts).map(([key, cart]) => (
              <div key={key} className="text-xs">
                <div className="font-mono text-blue-600">{key}</div>
                <div className="ml-2">
                  Items: {Array.isArray(cart) ? cart.length : 'Error'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
