'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ShoppingCart, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartItem } from '@/lib/contexts/cart-context'
import { Currency } from '@/utils/currency'
import Image from 'next/image'
import { isValidImageUrl } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/contexts/cart-context'

interface ImprovedCartToastProps {
  item: CartItem | null
  isVisible: boolean
  onClose: () => void
  onViewCart?: () => void
  onCheckout?: () => void
  className?: string
}

interface ToastStackItem {
  id: string
  item: CartItem
  timestamp: number
}

export default function ImprovedCartToast({
  item,
  isVisible,
  onClose,
  onViewCart,
  onCheckout,
  className = ''
}: ImprovedCartToastProps) {
  const [toastStack, setToastStack] = useState<ToastStackItem[]>([])
  const [isHovered, setIsHovered] = useState(false)
  const [dismissTimer, setDismissTimer] = useState<NodeJS.Timeout | null>(null)
  const toastRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { state: cartState } = useCart()

  // Auto-dismiss timer management
  const startDismissTimer = useCallback(() => {
    setDismissTimer(prev => {
      if (prev) clearTimeout(prev)
      
      const timer = setTimeout(() => {
        setToastStack(prev => {
          if (prev.length === 1) {
            onClose()
            return []
          }
          return prev.slice(1)
        })
      }, 4500) // 4.5 seconds
      
      return timer
    })
  }, [onClose])

  const pauseDismissTimer = useCallback(() => {
    setDismissTimer(prev => {
      if (prev) {
        clearTimeout(prev)
      }
      return null
    })
  }, [])

  // Handle new items being added
  useEffect(() => {
    if (isVisible && item) {
      const newToast: ToastStackItem = {
        id: `${item.id}-${Date.now()}`,
        item,
        timestamp: Date.now()
      }

      setToastStack(prev => {
        const updated = [newToast, ...prev].slice(0, 2) // Max 2 toasts
        
        // If we have more than 1 toast, collapse older ones
        if (updated.length > 1) {
          const collapsedCount = prev.length
          if (collapsedCount > 0) {
            // Update the second toast to show collapsed count
            updated[1] = {
              ...updated[1],
              item: {
                ...updated[1].item,
                name: `+${collapsedCount} more items added`,
                quantity: collapsedCount
              }
            }
          }
        }
        
        return updated
      })

      startDismissTimer()
    }
  }, [isVisible, item?.id])

  // Handle hover state
  const handleMouseEnter = () => {
    setIsHovered(true)
    pauseDismissTimer()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (toastStack.length > 0) {
      startDismissTimer()
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && toastStack.length > 0) {
        onClose()
        setToastStack([])
      }
    }

    if (toastStack.length > 0) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [toastStack.length, onClose])

  // Focus management
  useEffect(() => {
    if (toastStack.length > 0 && toastRef.current) {
      toastRef.current.focus()
    }
  }, [toastStack.length])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimer) clearTimeout(dismissTimer)
    }
  }, [dismissTimer])

  const handleViewCart = () => {
    onViewCart?.()
    onClose()
    setToastStack([])
    router.push('/cart')
  }

  const handleCheckout = () => {
    onCheckout?.()
    onClose()
    setToastStack([])
    router.push('/checkout')
  }

  const handleContinueShopping = () => {
    onClose()
    setToastStack([])
  }

  const handleClose = () => {
    onClose()
    setToastStack([])
  }

  if (toastStack.length === 0) return null

  const currentToast = toastStack[0]
  
  // Get the current cart item data (with merged quantities) instead of using stale data
  const currentCartItem = cartState.items.find(cartItem => cartItem.id === currentToast.item.id)
  const displayItem = currentCartItem || currentToast.item
  const lineTotal = displayItem.price * displayItem.quantity

  return (
    <AnimatePresence>
      <motion.div
        ref={toastRef}
        initial={{ opacity: 0, y: 50, scale: 0.9, x: 24 }}
        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
        exit={{ opacity: 0, y: 50, scale: 0.9, x: 24 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.3 
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed bottom-28 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] ${className}`}
        role="status"
        aria-live="polite"
        tabIndex={-1}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden ring-1 ring-black/5">
          {/* Header with success indicator */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 15,
                  delay: 0.1 
                }}
              >
                <CheckCircle className="w-5 h-5" />
              </motion.div>
              <span className="font-semibold text-sm">Added to cart</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 text-white hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Product info with hierarchy */}
            <div className="flex items-start gap-3 mb-4">
              {/* Product thumbnail */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-gray-200"
              >
                {isValidImageUrl(displayItem.image) ? (
                  <Image
                    src={displayItem.image}
                    alt={displayItem.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>

              {/* Product details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                  {displayItem.name}
                </h4>
                <p className="text-xs text-gray-500 mb-1">
                  {displayItem.quantity} × <Currency amount={displayItem.price} size="xs" />
                </p>
                <p className="text-sm font-bold text-green-600">
                  <Currency amount={lineTotal} size="sm" />
                </p>
              </div>
            </div>

            {/* Action buttons with proper hierarchy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2"
            >
              {/* Primary CTA - Checkout */}
              <Button
                onClick={handleCheckout}
                className="flex-1 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#12d6fa] text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                size="sm"
              >
                Checkout
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>

              {/* Secondary CTA - View Cart */}
              <Button
                variant="outline"
                onClick={handleViewCart}
                className="flex-1 text-sm border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                size="sm"
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                View Cart
              </Button>
            </motion.div>

            {/* Tertiary CTA - Continue Shopping */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3 text-center"
            >
              <button
                onClick={handleContinueShopping}
                className="text-xs text-gray-500 hover:text-gray-700 underline focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 rounded px-1 py-0.5"
              >
                Continue shopping
              </button>
            </motion.div>

            {/* Progress indicator for free shipping (if applicable) */}
            {/* This would be implemented based on your free shipping logic */}
            {/* <div className="mt-3 text-xs text-gray-500 text-center">
              SAR 35.00 more for free delivery
            </div> */}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
