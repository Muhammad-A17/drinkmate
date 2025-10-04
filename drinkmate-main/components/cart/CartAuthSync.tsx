"use client"

import { useEffect, useRef } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useCart } from '@/lib/contexts/cart-context'

export default function CartAuthSync() {
  const { user, isAuthenticated } = useAuth()
  const { switchUserCart, syncWithDatabase, state } = useCart()
  const hasLoggedInRef = useRef(false)
  const lastUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Only run when authentication state actually changes
    const currentUserId = user?._id || null
    
    // Skip if user hasn't changed
    if (lastUserIdRef.current === currentUserId) {
      return
    }
    
    lastUserIdRef.current = currentUserId
    
    if (isAuthenticated && user) {
      console.log('User logged in, switching to user cart and syncing with database')
      
      // Switch to user cart (this will load from database)
      switchUserCart(user._id)
      
      // If there were items in guest cart (localStorage), sync them with database
      if (!hasLoggedInRef.current && state.items.length > 0) {
        console.log('Syncing guest cart with database on login')
        setTimeout(() => {
          syncWithDatabase()
        }, 500) // Small delay to ensure switchUserCart completes
      }
      
      hasLoggedInRef.current = true
    } else if (!isAuthenticated && hasLoggedInRef.current) {
      console.log('User logged out, switching to guest cart')
      // User logged out - switch to guest cart
      switchUserCart(null)
      hasLoggedInRef.current = false
    }
  }, [isAuthenticated, user, switchUserCart, syncWithDatabase, state.items.length])

  // This component doesn't render anything
  return null
}
