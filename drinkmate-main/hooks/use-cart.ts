import { useState, useEffect, useCallback } from 'react'
import { CartItem } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/constants'

interface UseCartReturn {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isInCart: (productId: string) => boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setNote: (note: string) => void
  saveForLater: (productId: string) => void
  loading: boolean
  error: string | null
  updateTrigger: number
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.CART)
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (err) {
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items))
      } catch (err) {
        setError('Failed to save cart')
      }
    }
  }, [items, loading])

  const isInCart = useCallback((productId: string): boolean => {
    return items.some(item => item.id === productId)
  }, [items])

  const addItem = useCallback((newItem: CartItem) => {
    console.log('Adding item to cart:', newItem)
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id)
      
      if (existingItem) {
        // Update quantity if item already exists
        const updated = prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
        console.log('Updated existing item, new cart:', updated)
        return updated
      } else {
        // Add new item
        const updated = [...prevItems, newItem]
        console.log('Added new item, new cart:', updated)
        return updated
      }
    })
    setUpdateTrigger(prev => prev + 1)
  }, [])

  const removeItem = useCallback((productId: string) => {
    console.log('Removing item from cart:', productId)
    setItems(prevItems => {
      const updated = prevItems.filter(item => item.id !== productId)
      console.log('Removed item, new cart:', updated)
      return updated
    })
    setUpdateTrigger(prev => prev + 1)
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    console.log('Updating quantity for item:', productId, 'to:', quantity)
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems(prevItems => {
      const updated = prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
      console.log('Updated quantity, new cart:', updated)
      return updated
    })
    setUpdateTrigger(prev => prev + 1)
  }, [removeItem])

  const clearCart = useCallback(() => {
    console.log('Clearing cart')
    setItems([])
    setUpdateTrigger(prev => prev + 1)
  }, [])

  const setNote = useCallback((note: string) => {
    // For now, just log the note. In a real app, this would be saved to state or API
    console.log('Cart note:', note)
  }, [])

  const saveForLater = useCallback((productId: string) => {
    // For now, just remove from cart. In a real app, this would move to a "saved" list
    removeItem(productId)
  }, [removeItem])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return {
    items,
    totalItems,
    totalPrice,
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
