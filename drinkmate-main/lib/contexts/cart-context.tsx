"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react'
import { getCategoryName } from '@/lib/utils/category-utils'

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
  addItem: (item: CartItem) => void
  removeItem: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
  isInCart: (id: string | number) => boolean
  getItemQuantity: (id: string | number) => number
  switchUserCart: (userId?: string | null) => void
  showToast: (item: CartItem) => void
  hideToast: () => void
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

  // Helper function to get user-specific cart key
  const getCartKey = useCallback((userId?: string | null) => {
    if (userId) {
      return `drinkmate-cart-${userId}`
    }
    return 'drinkmate-cart-guest'
  }, [])

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try to get user ID from auth token
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      let userId = null
      
      if (token) {
        try {
          // Decode JWT token to get user ID
          const payload = JSON.parse(atob(token.split('.')[1]))
          userId = payload.id
        } catch (error) {
          console.warn('Could not decode auth token for cart loading:', error)
        }
      }
      
      // Initialize the current user ref
      currentUserIdRef.current = userId
      console.log('Initial cart load for user:', userId)
      
      const cartKey = getCartKey(userId)
      let savedCart = localStorage.getItem(cartKey)
      
      // Migration: If no user-specific cart exists, try to migrate from old shared cart
      if (!savedCart && userId) {
        const oldCartKey = 'drinkmate-cart'
        const oldCart = localStorage.getItem(oldCartKey)
        if (oldCart) {
          console.log('Migrating cart from old shared key to user-specific key')
          localStorage.setItem(cartKey, oldCart)
          // Remove old cart to prevent confusion
          localStorage.removeItem(oldCartKey)
          savedCart = oldCart
        }
      }
      
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          // Filter out any items with undefined or null IDs
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
  const addItem = useCallback((item: CartItem) => {
    console.log('Cart context - adding item:', item)
    console.log('Cart context - item image:', item.image)
    console.log('Cart context - item image type:', typeof item.image)
    dispatch({ type: 'ADD_ITEM', payload: item })
  }, [])

  const removeItem = useCallback((id: string | number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }, [])

  const updateQuantity = useCallback((id: string | number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
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

  const switchUserCart = useCallback((userId?: string | null) => {
    if (typeof window === 'undefined') return
    
    const newUserId = userId || null
    
    // Prevent infinite loop: Don't switch if we're already on this user's cart
    if (currentUserIdRef.current === newUserId) {
      console.log('Cart already switched to user:', newUserId)
      return
    }
    
    console.log('Switching cart from', currentUserIdRef.current, 'to', newUserId)
    
    // Save current cart before switching
    if (currentUserIdRef.current !== null) {
      const currentCartKey = getCartKey(currentUserIdRef.current)
      localStorage.setItem(currentCartKey, JSON.stringify(state.items))
      console.log('Saved cart for user:', currentUserIdRef.current)
    } else if (currentUserIdRef.current === null) {
      // Save guest cart
      const guestCartKey = getCartKey(null)
      localStorage.setItem(guestCartKey, JSON.stringify(state.items))
      console.log('Saved guest cart')
    }
    
    // Update the ref BEFORE dispatching to prevent re-triggering
    currentUserIdRef.current = newUserId
    
    // Load new user's cart
    const newCartKey = getCartKey(newUserId)
    const savedCart = localStorage.getItem(newCartKey)
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        const validItems = parsedCart.filter((item: any) => item.id !== undefined && item.id !== null)
        console.log('Loading cart for user:', newUserId, '- items:', validItems.length)
        dispatch({ type: 'LOAD_CART', payload: validItems })
      } catch (error) {
        console.error('Error loading new user cart:', error)
        dispatch({ type: 'LOAD_CART', payload: [] })
      }
    } else {
      // No saved cart for this user, start with empty cart
      console.log('No saved cart for user:', newUserId, '- starting with empty cart')
      dispatch({ type: 'LOAD_CART', payload: [] })
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
    hideToast
  }), [state, addItem, removeItem, updateQuantity, clearCart, isInCart, getItemQuantity, switchUserCart, showToast, hideToast])

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
