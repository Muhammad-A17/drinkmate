'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Currency } from '@/utils/currency'

interface FloatingCartButtonProps {
  className?: string
}

export default function FloatingCartButton({ className = '' }: FloatingCartButtonProps) {
  const { totalItems, totalPrice } = useCart()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [lastItemCount, setLastItemCount] = useState(0)

  // Check if we're on a page that shows chat widget
  const isSupportPage = pathname?.startsWith('/account/support') || pathname?.startsWith('/support')
  const isContactPage = pathname === '/contact'
  const showChatWidget = isSupportPage || isContactPage

  useEffect(() => {
    if (totalItems > 0) {
      setIsVisible(false) // Hide when cart has items
      setLastItemCount(totalItems)
    } else {
      // Show when cart is empty, but only if chat widget is not shown
      setIsVisible(!showChatWidget)
    }
  }, [totalItems, lastItemCount, showChatWidget])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 ${className}`}
    >
      <Link href="/cart">
        <motion.div
          className="relative bg-blue-600 text-white rounded-full p-4 shadow-2xl cursor-pointer group"
          whileHover={{ 
            boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
            transition: { duration: 0.2 }
          }}
        >
          {/* Cart Icon */}
          <ShoppingCart className="w-6 h-6" />
          
          {/* Item Count Badge */}
          <AnimatePresence mode="wait">
            {totalItems > 0 && (
              <motion.div
                key={totalItems}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  transition: { 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 15 
                  }
                }}
                exit={{ scale: 0, rotate: 180 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              >
                {totalItems > 99 ? '99+' : totalItems}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
          >
            <Currency amount={totalPrice} size="sm" />
          </motion.div>

          {/* Pulse Animation */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-blue-400 rounded-full"
          />
        </motion.div>
      </Link>
    </motion.div>
  )
}
