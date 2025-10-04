"use client"

import { useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useCart } from '@/lib/contexts/cart-context'

export default function CartAuthSync() {
  const { user, isAuthenticated } = useAuth()
  const { switchUserCart } = useCart()

  useEffect(() => {
    // Switch cart when user authentication state changes
    if (isAuthenticated && user) {
      // User logged in - switch to their cart
      switchUserCart(user._id)
    } else {
      // User logged out - switch to guest cart
      switchUserCart(null)
    }
  }, [isAuthenticated, user, switchUserCart])

  // This component doesn't render anything
  return null
}
