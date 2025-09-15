import { useCallback, useState, useEffect } from 'react'
import { useCart as useCartContext } from '@/lib/cart-context'
import { CartItem } from '@/lib/types'

interface UseCartReturn {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isInCart: (productId: string) => boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string | number) => void
  updateQuantity: (productId: string | number, quantity: number) => void
  clearCart: () => void
  setNote: (note: string) => void
  saveForLater: (productId: string) => void
  loading: boolean
  error: string | null
  updateTrigger: number
}

export function useCart(): UseCartReturn {
  const cartContext = useCartContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  // Sync updateTrigger when cart changes
  useEffect(() => {
    setUpdateTrigger(prev => prev + 1)
  }, [cartContext.state.items])

  const isInCart = useCallback((productId: string): boolean => {
    return cartContext.isInCart(productId)
  }, [cartContext])

  const addItem = useCallback((newItem: CartItem) => {
    // console.log('Adding item to cart:', newItem)
    cartContext.addItem(newItem)
  }, [cartContext])

  const removeItem = useCallback((productId: string | number) => {
    // console.log('Removing item from cart:', productId)
    cartContext.removeItem(productId)
  }, [cartContext])

  const updateQuantity = useCallback((productId: string | number, quantity: number) => {
    // console.log('Updating quantity for item:', productId, 'to:', quantity)
    if (quantity <= 0) {
      cartContext.removeItem(productId)
      return
    }
    cartContext.updateQuantity(productId, quantity)
  }, [cartContext])

  const clearCart = useCallback(() => {
    // console.log('Clearing cart')
    cartContext.clearCart()
  }, [cartContext])

  const setNote = useCallback((note: string) => {
    // For now, just log the note. In a real app, this would be saved to state or API
    // console.log('Cart note:', note)
  }, [])

  const saveForLater = useCallback((productId: string) => {
    // For now, just remove from cart. In a real app, this would move to a "saved" list
    cartContext.removeItem(productId)
  }, [cartContext])

  return {
    items: cartContext.state.items,
    totalItems: cartContext.state.itemCount,
    totalPrice: cartContext.state.total,
    isInCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setNote,
    saveForLater,
    loading,
    error,
    updateTrigger,
  }
}
