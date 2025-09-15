'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartItem } from '@/lib/cart-context'
import { Currency } from '@/utils/currency'
import Image from 'next/image'
import Link from 'next/link'

interface CartNotificationProps {
  item: CartItem | null
  isVisible: boolean
  onClose: () => void
  onViewCart: () => void
}

export default function CartNotification({
  item,
  isVisible,
  onClose,
  onViewCart
}: CartNotificationProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible && item) {
      setShow(true)
      
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300) // Wait for exit animation
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, item, onClose])

  if (!item) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-green-500 text-white px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">Added to Cart!</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShow(false)
                  setTimeout(onClose, 300)
                }}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                {/* Product Image */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </motion.div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity} • <Currency amount={item.price} size="xs" /> each
                  </p>
                  <p className="text-sm font-bold text-green-600">
                    Total: <Currency amount={item.price * item.quantity} size="sm" />
                  </p>
                </div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2 mt-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShow(false)
                    setTimeout(onClose, 300)
                  }}
                  className="flex-1 text-xs"
                >
                  Continue Shopping
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onViewCart()
                    setShow(false)
                    setTimeout(onClose, 300)
                  }}
                  className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  View Cart
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
