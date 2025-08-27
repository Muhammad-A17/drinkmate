"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string | number
  name: string
  price: number
  quantity: number
  image: string
  category?: string
  color?: string
  size?: string
  isBundle?: boolean
  isFree?: boolean
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
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
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
        // Add new item
        const newItems = [...state.items, action.payload]
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
        
        return {
          ...state,
          items: newItems,
          total: newTotal,
          itemCount: newItemCount
        }
      }
    }
    
    case 'REMOVE_ITEM': {
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
          dispatch({ type: 'LOAD_CART', payload: parsedCart })
        } catch (error) {
          console.error('Error loading cart from localStorage:', error)
        }
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('drinkmate-cart', JSON.stringify(state.items))
    }
  }, [state.items])

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: string | number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string | number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const isInCart = (id: string | number): boolean => {
    return state.items.some(item => item.id === id)
  }

  const getItemQuantity = (id: string | number): number => {
    const item = state.items.find(item => item.id === id)
    return item ? item.quantity : 0
  }

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  }

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
