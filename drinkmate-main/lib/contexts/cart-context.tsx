"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react'

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
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string | number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string | number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }

interface CartContextType {
  state: CartState
  addItem: (item: CartItem) => void
  removeItem: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
  isInCart: (id: string | number) => boolean
  getItemQuantity: (id: string | number) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

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
          itemCount: newItemCount
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
          itemCount: newItemCount
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
      const newTotal = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: action.payload,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    
    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('drinkmate-cart')
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
  }, [])

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
      localStorage.setItem('drinkmate-cart', JSON.stringify(state.items))
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timeoutId)
  }, [state.items])

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

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  }), [state, addItem, removeItem, updateQuantity, clearCart, isInCart, getItemQuantity])

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
