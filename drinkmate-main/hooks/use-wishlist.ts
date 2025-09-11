import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

interface UseWishlistReturn {
  items: string[]
  isInWishlist: (productId: string) => boolean
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  toggleWishlist: (productId: string) => void
  clearWishlist: () => void
  loading: boolean
  error: string | null
}

export function useWishlist(): UseWishlistReturn {
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST)
      if (savedWishlist) {
        setItems(JSON.parse(savedWishlist))
      }
    } catch (err) {
      setError('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }, [])

  // Save wishlist to localStorage whenever items change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(items))
      } catch (err) {
        setError('Failed to save wishlist')
      }
    }
  }, [items, loading])

  const isInWishlist = useCallback((productId: string): boolean => {
    return items.includes(productId)
  }, [items])

  const addToWishlist = useCallback((productId: string) => {
    setItems(prevItems => {
      if (prevItems.includes(productId)) {
        return prevItems
      }
      return [...prevItems, productId]
    })
  }, [])

  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(id => id !== productId))
  }, [])

  const toggleWishlist = useCallback((productId: string) => {
    setItems(prevItems => {
      if (prevItems.includes(productId)) {
        return prevItems.filter(id => id !== productId)
      } else {
        return [...prevItems, productId]
      }
    })
  }, [])

  const clearWishlist = useCallback(() => {
    setItems([])
  }, [])

  return {
    items,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    loading,
    error,
  }
}
