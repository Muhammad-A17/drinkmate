"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react'
import { getCategoryName } from '@/lib/utils/category-utils'
import { cartAPI } from '@/lib/api/services'

export interface CartItem {
  id: string | number
  name: string
  price: number
  quantity: number
  image: string
  category?: string
  color?: string
  size?: string
  sku?: string
  isBundle?: boolean
  isFree?: boolean
  productId?: string  // For regular products
  bundleId?: string   // For bundles
  productType?: 'product' | 'bundle' | 'cylinder'
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  showToast: boolean
  lastAddedItem: CartItem | null
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string | number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string | number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SHOW_TOAST'; payload: CartItem }
  | { type: 'HIDE_TOAST' }

interface CartContextType {
  state: CartState
  addItem: (item: CartItem) => Promise<void>
  removeItem: (id: string | number) => Promise<void>
  updateQuantity: (id: string | number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  isInCart: (id: string | number) => boolean
  getItemQuantity: (id: string | number) => number
  switchUserCart: (userId?: string | null) => void
  showToast: (item: CartItem) => void
  hideToast: () => void
  syncWithDatabase: () => Promise<void>
  loadCartFromDatabase: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Helper function to fix category names in cart items
const fixCartItemCategories = (items: CartItem[]): CartItem[] => {
  return items.map(item => ({
    ...item,
    category: getCategoryName(item.category)
  }))
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      console.log('Cart reducer - ADD_ITEM:', action.payload)
      console.log('Cart reducer - payload image:', action.payload.image)
      
      // Validate that the item has a valid ID
      if (!action.payload.id) {
        console.error('Cart reducer - Cannot add item without ID:', action.payload)
        return state
      }
      
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        console.log('Cart reducer - updating existing item')
        // Update quantity if item already exists
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        
        return {
          ...state,
          items: updatedItems,
          total: newTotal,
          itemCount: newItemCount,
          showToast: true,
          lastAddedItem: action.payload
        }
      } else {
        console.log('Cart reducer - adding new item')
        // Add new item
        const newItems = [...state.items, action.payload]
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
        
        console.log('Cart reducer - new items:', newItems)
        
        return {
          ...state,
          items: newItems,
          total: newTotal,
          itemCount: newItemCount,
          showToast: true,
          lastAddedItem: action.payload
        }
      }
    }
    
    case 'REMOVE_ITEM': {
      // Validate that we have a valid ID to remove
      if (!action.payload) {
        console.error('Cart reducer - Cannot remove item without ID:', action.payload)
        return state
      }
      
      const newItems = state.items.filter(item => item.id !== action.payload)
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    
    case 'UPDATE_QUANTITY': {
      // Validate that we have a valid ID to update
      if (!action.payload.id) {
        console.error('Cart reducer - Cannot update quantity without ID:', action.payload)
        return state
      }
      
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      )
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      }
    }
    
    case 'LOAD_CART': {
      // Fix category names when loading cart items
      const fixedItems = fixCartItemCategories(action.payload)
      const newTotal = fixedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = fixedItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: fixedItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    
    case 'SHOW_TOAST': {
      return {
        ...state,
        showToast: true,
        lastAddedItem: action.payload
      }
    }
    
    case 'HIDE_TOAST': {
      return {
        ...state,
        showToast: false,
        lastAddedItem: null
      }
    }
    
    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  showToast: false,
  lastAddedItem: null
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const currentUserIdRef = useRef<string | null>(null)
  const currentCartItemsRef = useRef<CartItem[]>([])

  // Helper function to get user-specific cart key
  const getCartKey = useCallback((userId?: string | null) => {
    if (userId) {
      return `drinkmate-cart-${userId}`
    }
    return 'drinkmate-cart-guest'
  }, [])

  // Load cart from database (defined before first use to avoid TDZ errors)
  const loadCartFromDatabase = useCallback(async () => {
    if (typeof window === 'undefined') return
    
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
    if (!token) {
      console.log('No auth token, skipping database cart load')
      return
    }
    
    try {
      console.log('Loading cart from database...')
      const response = await cartAPI.getCart()
      
      // Handle the wrapped response from apiClient
      if (response.success && response.data) {
        const cartData = response.data
        if (cartData.success && cartData.cart) {
          const dbItems = cartData.cart.items || []
          console.log('Loaded cart from database - items:', dbItems.length)
          
          // Only update if database has items, otherwise keep current local cart
          if (dbItems.length > 0) {
            dispatch({ type: 'LOAD_CART', payload: dbItems })
          } else {
            console.log('Database cart is empty, keeping current local cart')
            // Sync current local cart to database instead
            const currentItems = currentCartItemsRef.current
            if (currentItems.length > 0) {
              console.log('Syncing local cart to database...')
              await syncWithDatabase()
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading cart from database:', error)
    }
  }, [])

  // Load cart on mount: if authenticated, load from database; otherwise from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
    let userId: string | null = null
    
    if (token) {
      try {
        const parts = token.split('.')
        if (parts.length >= 2) {
          const base64Url = parts[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const jsonPayload = typeof window !== 'undefined'
            ? decodeURIComponent(atob(base64).split('').map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))
            : Buffer.from(base64, 'base64').toString('utf-8')
          const payload = JSON.parse(jsonPayload)
          userId = payload.id || payload.userId || null
        }
      } catch (error) {
        console.warn('Could not decode auth token for cart loading:', error)
      }
    }
    
    // Initialize the current user ref
    currentUserIdRef.current = userId
    console.log('Initial cart load for user:', userId)
    
    if (userId && token) {
      // Authenticated: first try localStorage, then sync with database
      const cartKey = getCartKey(userId)
      const savedCart = localStorage.getItem(cartKey)
      
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          const validItems = parsedCart.filter((item: any) => item.id !== undefined && item.id !== null)
          console.log('Loading user cart from localStorage on mount - items:', validItems.length)
          dispatch({ type: 'LOAD_CART', payload: validItems })
          
          // Then sync with database in background
          setTimeout(() => {
            loadCartFromDatabase()
          }, 100)
        } catch (error) {
          console.error('Error loading user cart from localStorage on mount:', error)
          // Fallback to database
          setTimeout(() => {
            loadCartFromDatabase()
          }, 0)
        }
      } else {
        // No local cart, load from database
        console.log('No local user cart found on mount, loading from database')
        setTimeout(() => {
          loadCartFromDatabase()
        }, 0)
      }
      return
    }
    
    // Guest: load from guest localStorage
    const cartKey = getCartKey(null)
    const savedCart = localStorage.getItem(cartKey)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        const validItems = parsedCart.filter((item: any) => item.id !== undefined && item.id !== null)
        if (validItems.length !== parsedCart.length) {
          console.warn('Cart cleanup: Removed items with undefined IDs', {
            original: parsedCart.length,
            cleaned: validItems.length
          })
        }
        dispatch({ type: 'LOAD_CART', payload: validItems })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [getCartKey])

  // Clean up any items with undefined IDs in the current state
  useEffect(() => {
    const invalidItems = state.items.filter(item => !item.id)
    if (invalidItems.length > 0) {
      console.warn('Cart cleanup: Removing items with undefined IDs from current state', invalidItems)
      const validItems = state.items.filter(item => item.id)
      dispatch({ type: 'LOAD_CART', payload: validItems })
    }
  }, [state.items])

  // Keep track of current cart items in a ref
  useEffect(() => {
    currentCartItemsRef.current = state.items
  }, [state.items])

  // Save cart to localStorage whenever it changes
  // Using a debounced effect to avoid frequent localStorage writes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const timeoutId = setTimeout(() => {
      // Use the ref to get the current user ID
      const userId = currentUserIdRef.current
      const cartKey = getCartKey(userId)
      localStorage.setItem(cartKey, JSON.stringify(state.items))
      console.log('Auto-saved cart for user:', userId, '- items:', state.items.length)
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timeoutId)
  }, [state.items, getCartKey])

  // Memoize cart operations to prevent unnecessary re-renders
  const addItem = useCallback(async (item: CartItem) => {
    console.log('Cart context - adding item:', item)
    console.log('Cart context - item image:', item.image)
    console.log('Cart context - item image type:', typeof item.image)
    
    // Add to local state immediately for instant UI feedback
    dispatch({ type: 'ADD_ITEM', payload: item })
    
    // If user is authenticated, also save to database
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
    if (token) {
      try {
        console.log('Saving item to database...')
        const productId = item.productId || item.id
        await cartAPI.addToCart(String(productId), item.quantity, [])
        console.log('Item saved to database successfully')
      } catch (error) {
        console.error('Error saving item to database:', error)
        // Continue anyway - item is already in localStorage
      }
    }
  }, [])

  const removeItem = useCallback(async (id: string | number) => {
    // Remove from local state immediately
    dispatch({ type: 'REMOVE_ITEM', payload: id })
    
    // If user is authenticated, also remove from database
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
    if (token) {
      try {
        console.log('Removing item from database...')
        await cartAPI.removeFromCart(String(id))
        console.log('Item removed from database successfully')
      } catch (error) {
        console.error('Error removing item from database:', error)
      }
    }
  }, [])

  const updateQuantity = useCallback(async (id: string | number, quantity: number) => {
    // Update local state immediately
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
    
    // If user is authenticated, also update in database
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
    if (token) {
      try {
        console.log('Updating item quantity in database...')
        await cartAPI.updateCartItem(String(id), quantity)
        console.log('Item quantity updated in database successfully')
      } catch (error) {
        console.error('Error updating item quantity in database:', error)
      }
    }
  }, [])

  const clearCart = useCallback(async () => {
    // Clear local state immediately
    dispatch({ type: 'CLEAR_CART' })
    
    // If user is authenticated, also clear database cart
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
    if (token) {
      try {
        console.log('Clearing cart in database...')
        await cartAPI.clearCart()
        console.log('Cart cleared in database successfully')
      } catch (error) {
        console.error('Error clearing cart in database:', error)
      }
    }
  }, [])

  const isInCart = useCallback((id: string | number): boolean => {
    return state.items.some(item => item.id === id)
  }, [state.items])

  const getItemQuantity = useCallback((id: string | number): number => {
    const item = state.items.find(item => item.id === id)
    return item ? item.quantity : 0
  }, [state.items])

  const showToast = useCallback((item: CartItem) => {
    dispatch({ type: 'SHOW_TOAST', payload: item })
  }, [])

  const hideToast = useCallback(() => {
    dispatch({ type: 'HIDE_TOAST' })
  }, [])

  

  // Sync current cart with database
  const syncWithDatabase = useCallback(async () => {
    if (typeof window === 'undefined') return
    
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
    if (!token) {
      console.log('No auth token, skipping database sync')
      return
    }
    
    try {
      const currentItems = currentCartItemsRef.current
      if (currentItems.length === 0) {
        console.log('Cart is empty, skipping sync')
        return
      }
      
      console.log('Syncing cart with database - items:', currentItems.length)
      const response = await cartAPI.syncCart(currentItems)
      
      // Handle the wrapped response from apiClient
      if (response.success && response.data) {
        const cartData = response.data
        if (cartData.success && cartData.cart) {
          console.log('Cart synced successfully')
          // Update local state with merged cart from database
          const dbItems = cartData.cart.items || []
          dispatch({ type: 'LOAD_CART', payload: dbItems })
        }
      }
    } catch (error) {
      console.error('Error syncing cart with database:', error)
    }
  }, [])

  const switchUserCart = useCallback((userId?: string | null) => {
    if (typeof window === 'undefined') return
    
    const newUserId = userId || null
    
    // Prevent infinite loop: Don't switch if we're already on this user's cart
    if (currentUserIdRef.current === newUserId) {
      console.log('Cart already switched to user:', newUserId)
      return
    }
    
    console.log('Switching cart from', currentUserIdRef.current, 'to', newUserId)
    
    // Save current cart before switching using the ref (which has the latest items)
    const currentCartKey = getCartKey(currentUserIdRef.current)
    const currentItems = currentCartItemsRef.current
    localStorage.setItem(currentCartKey, JSON.stringify(currentItems))
    console.log('Saved cart for user/guest:', currentUserIdRef.current, '- items:', currentItems.length)
    
    // Update the ref BEFORE dispatching to prevent re-triggering
    currentUserIdRef.current = newUserId
    
    if (newUserId) {
      // User logged in - first try to load from localStorage, then sync with database
      const userCartKey = getCartKey(newUserId)
      const savedUserCart = localStorage.getItem(userCartKey)
      
      if (savedUserCart) {
        try {
          const parsedCart = JSON.parse(savedUserCart)
          const validItems = parsedCart.filter((item: any) => item.id !== undefined && item.id !== null)
          console.log('Loading user cart from localStorage - items:', validItems.length)
          dispatch({ type: 'LOAD_CART', payload: validItems })
          
          // Then sync with database in background to ensure consistency
          setTimeout(() => {
            loadCartFromDatabase()
          }, 100)
        } catch (error) {
          console.error('Error loading user cart from localStorage:', error)
          // Fallback to database
          loadCartFromDatabase()
        }
      } else {
        // No local cart, load from database
        console.log('No local user cart found, loading from database for user:', newUserId)
        loadCartFromDatabase()
      }
    } else {
      // User logged out - load guest cart from localStorage
      const newCartKey = getCartKey(null)
      const savedCart = localStorage.getItem(newCartKey)
      
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          const validItems = parsedCart.filter((item: any) => item.id !== undefined && item.id !== null)
          console.log('Loading guest cart - items:', validItems.length)
          dispatch({ type: 'LOAD_CART', payload: validItems })
        } catch (error) {
          console.error('Error loading guest cart:', error)
          dispatch({ type: 'LOAD_CART', payload: [] })
        }
      } else {
        console.log('No guest cart found, starting with empty cart')
        dispatch({ type: 'LOAD_CART', payload: [] })
      }
    }
  }, [getCartKey])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    switchUserCart,
    showToast,
    hideToast,
    syncWithDatabase,
    loadCartFromDatabase
  }), [state, addItem, removeItem, updateQuantity, clearCart, isInCart, getItemQuantity, switchUserCart, showToast, hideToast, syncWithDatabase, loadCartFromDatabase])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
