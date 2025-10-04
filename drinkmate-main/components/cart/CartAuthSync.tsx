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
      console.log('User logged in, switching to user cart')
      
      // Save current guest cart before switching
      const guestCartKey = 'drinkmate-cart-guest'
      const guestCart = localStorage.getItem(guestCartKey)
      const guestItems = guestCart ? JSON.parse(guestCart) : []
      
      // Switch to user cart (this will load from database)
      switchUserCart(user._id)
      
      // If there were items in guest cart, merge them with database cart after a delay
      if (!hasLoggedInRef.current && guestItems.length > 0) {
        console.log('Guest cart has items, will merge after user cart loads')
        setTimeout(() => {
          console.log('Merging guest cart with database cart')
          syncWithDatabase()
        }, 1000) // Longer delay to ensure switchUserCart completes
      }
      
      hasLoggedInRef.current = true
    } else if (!isAuthenticated && hasLoggedInRef.current) {
      console.log('User logged out, switching to guest cart')
      // User logged out - switch to guest cart
      switchUserCart(null)
      hasLoggedInRef.current = false
    }
  }, [isAuthenticated, user, switchUserCart, syncWithDatabase])

  // This component doesn't render anything
  return null
}
