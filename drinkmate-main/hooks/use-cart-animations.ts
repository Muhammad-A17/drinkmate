'use client'

import { useState, useCallback } from 'react'
import { CartItem } from '@/lib/cart-context'

interface CartAnimationState {
  isAdding: boolean
  isRemoving: boolean
  isUpdating: boolean
  lastAddedItem: CartItem | null
  showNotification: boolean
}

export function useCartAnimations() {
  const [animationState, setAnimationState] = useState<CartAnimationState>({
    isAdding: false,
    isRemoving: false,
    isUpdating: false,
    lastAddedItem: null,
    showNotification: false
  })

  const triggerAddAnimation = useCallback((item: CartItem) => {
    setAnimationState(prev => ({
      ...prev,
      isAdding: true,
      lastAddedItem: item,
      showNotification: true
    }))

    // Reset adding state after animation
    setTimeout(() => {
      setAnimationState(prev => ({
        ...prev,
        isAdding: false
      }))
    }, 600)
  }, [])

  const triggerRemoveAnimation = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      isRemoving: true
    }))

    // Reset removing state after animation
    setTimeout(() => {
      setAnimationState(prev => ({
        ...prev,
        isRemoving: false
      }))
    }, 300)
  }, [])

  const triggerUpdateAnimation = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      isUpdating: true
    }))

    // Reset updating state after animation
    setTimeout(() => {
      setAnimationState(prev => ({
        ...prev,
        isUpdating: false
      }))
    }, 300)
  }, [])

  const hideNotification = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      showNotification: false,
      lastAddedItem: null
    }))
  }, [])

  return {
    animationState,
    triggerAddAnimation,
    triggerRemoveAnimation,
    triggerUpdateAnimation,
    hideNotification
  }
}
