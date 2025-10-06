"use client"

import { useEffect, useRef } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useCart } from '@/lib/contexts/cart-context'

export default function CartAuthSync() {
  const { user, isAuthenticated } = useAuth()
  const { switchUserCart, syncWithDatabase, loadCartFromDatabase } = useCart()
  const hasLoggedInRef = useRef(false)
  const lastUserIdRef = useRef<string | null>(null)
  const isNewAccountRef = useRef(false)

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
      
      // Check if this is a new account by looking for a flag in localStorage
      // This flag should be set during account creation, not login
      const isNewAccount = localStorage.getItem('is-new-account') === 'true'
      isNewAccountRef.current = isNewAccount
      
      // Clear the flag after checking
      if (isNewAccount) {
        localStorage.removeItem('is-new-account')
      }
      
      // Save current guest cart before switching
      const guestCartKey = 'drinkmate-cart-guest'
      const guestCart = localStorage.getItem(guestCartKey)
      const guestItems = guestCart ? JSON.parse(guestCart) : []
      
      // Switch to user cart; it will handle loading from localStorage
      // and then background-sync to database.
      switchUserCart(user._id)
      
      // Only merge guest cart if this is a NEW account creation, not existing account login
      if (isNewAccount && guestItems.length > 0) {
        console.log('New account detected with guest cart items, will merge after user cart loads')
        setTimeout(() => {
          console.log('Merging guest cart with database cart for new account')
          syncWithDatabase()
        }, 1000) // Longer delay to ensure switchUserCart completes
      } else if (!isNewAccount) {
        console.log('Existing account login - not merging guest cart')
      }
      
      hasLoggedInRef.current = true
    } else if (!isAuthenticated && hasLoggedInRef.current) {
      console.log('User logged out, switching to guest cart')
      // User logged out - switch to guest cart
      switchUserCart(null)
      hasLoggedInRef.current = false
    }
  }, [isAuthenticated, user, switchUserCart, syncWithDatabase, loadCartFromDatabase])

  // This component doesn't render anything
  return null
}
