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
  loading: boolean
  error: string | null
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id)
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      } else {
        // Add new item
        return [...prevItems, newItem]
      }
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

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
    loading,
    error,
  }
}
