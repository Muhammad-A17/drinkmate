import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'
import { useAuth } from '@/lib/contexts/auth-context'

interface WishlistItem {
  _id: string
  product: {
    _id: string
    name: string
    nameAr?: string
    slug: string
    sku: string
    price: number
    originalPrice?: number
    images: string[]
    stock: number
    status: string
    category?: {
      _id: string
      name: string
      slug: string
    }
  }
  productSnapshot: {
    name: string
    nameAr?: string
    slug: string
    sku: string
    price: number
    originalPrice?: number
    image: string
    stock: number
    status: string
  }
  addedAt: string
}

interface UseWishlistReturn {
  items: WishlistItem[]
  itemIds: string[]
  isInWishlist: (productId: string) => boolean
  addToWishlist: (productId: string) => Promise<boolean>
  removeFromWishlist: (productId: string) => Promise<boolean>
  toggleWishlist: (productId: string) => Promise<boolean>
  clearWishlist: () => Promise<boolean>
  loading: boolean
  error: string | null
  refreshWishlist: () => Promise<void>
}

export function useWishlist(): UseWishlistReturn {
  const { user, isAuthenticated, token } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get item IDs for backward compatibility
  const itemIds = items.map(item => item.product._id)

  // Load wishlist from API or localStorage
  const loadWishlist = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (isAuthenticated && token) {
        // Load from API for authenticated users
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/wishlist`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Handle different response structures
            const wishlistItems = data.data?.wishlist?.items || data.data?.items || []
            setItems(wishlistItems)
            return
          }
        }
      }

      // Fallback to localStorage for guest users or API failure
      const savedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST)
      if (savedWishlist) {
        const localItems = JSON.parse(savedWishlist)
        // Convert localStorage format to WishlistItem format
        const wishlistItems: WishlistItem[] = localItems.map((itemId: string) => ({
          _id: `local_${itemId}`,
          product: {
            _id: itemId,
            name: 'Product',
            slug: '',
            sku: '',
            price: 0,
            images: [],
            stock: 0,
            status: 'active'
          },
          productSnapshot: {
            name: 'Product',
            slug: '',
            sku: '',
            price: 0,
            image: '',
            stock: 0,
            status: 'active'
          },
          addedAt: new Date().toISOString()
        }))
        setItems(wishlistItems)
      }
    } catch (err) {
      console.error('Error loading wishlist:', err)
      setError('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token])

  // Load wishlist on mount and when auth state changes
  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  // Save to localStorage for guest users
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      try {
        const itemIds = items.map(item => item.product._id)
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(itemIds))
      } catch (err) {
        setError('Failed to save wishlist')
      }
    }
  }, [items, loading, isAuthenticated])

  const isInWishlist = useCallback((productId: string): boolean => {
    return items.some(item => item.product._id === productId)
  }, [items])

  const addToWishlist = useCallback(async (productId: string): Promise<boolean> => {
    try {
      if (isAuthenticated && token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/wishlist/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const wishlistItems = data.data?.wishlist?.items || data.data?.items || []
            setItems(wishlistItems)
            return true
          }
        }
        return false
      } else {
        // Fallback to localStorage for guest users
        if (!itemIds.includes(productId)) {
          const newItem: WishlistItem = {
            _id: `local_${productId}`,
            product: {
              _id: productId,
              name: 'Product',
              slug: '',
              sku: '',
              price: 0,
              images: [],
              stock: 0,
              status: 'active'
            },
            productSnapshot: {
              name: 'Product',
              slug: '',
              sku: '',
              price: 0,
              image: '',
              stock: 0,
              status: 'active'
            },
            addedAt: new Date().toISOString()
          }
          setItems(prev => [...prev, newItem])
          return true
        }
        return false
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err)
      setError('Failed to add to wishlist')
      return false
    }
  }, [isAuthenticated, token, itemIds])

  const removeFromWishlist = useCallback(async (productId: string): Promise<boolean> => {
    try {
      if (isAuthenticated && token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/wishlist/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const wishlistItems = data.data?.wishlist?.items || data.data?.items || []
            setItems(wishlistItems)
            return true
          }
        }
        return false
      } else {
        // Fallback to localStorage for guest users
        setItems(prev => prev.filter(item => item.product._id !== productId))
        return true
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      setError('Failed to remove from wishlist')
      return false
    }
  }, [isAuthenticated, token])

  const toggleWishlist = useCallback(async (productId: string): Promise<boolean> => {
    try {
      if (isAuthenticated && token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/wishlist/toggle`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const wishlistItems = data.data?.wishlist?.items || data.data?.items || []
            setItems(wishlistItems)
            return true
          }
        }
        return false
      } else {
        // Fallback to localStorage for guest users
        if (isInWishlist(productId)) {
          return await removeFromWishlist(productId)
        } else {
          return await addToWishlist(productId)
        }
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err)
      setError('Failed to toggle wishlist')
      return false
    }
  }, [isAuthenticated, token, isInWishlist, addToWishlist, removeFromWishlist])

  const clearWishlist = useCallback(async (): Promise<boolean> => {
    try {
      if (isAuthenticated && token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/wishlist/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setItems([])
            return true
          }
        }
        return false
      } else {
        // Fallback to localStorage for guest users
        setItems([])
        return true
      }
    } catch (err) {
      console.error('Error clearing wishlist:', err)
      setError('Failed to clear wishlist')
      return false
    }
  }, [isAuthenticated, token])

  const refreshWishlist = useCallback(async (): Promise<void> => {
    await loadWishlist()
  }, [loadWishlist])

  return {
    items,
    itemIds,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    loading,
    error,
    refreshWishlist,
  }
}
