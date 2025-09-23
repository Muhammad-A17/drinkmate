'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartItem } from '@/lib/cart-context'
import Image from 'next/image'
import { cn, isValidImageUrl } from '@/lib/utils'
import { Currency } from '@/utils/currency'
import { getImageUrl } from '@/lib/image-utils'

interface AnimatedCartItemProps {
  item: CartItem
  onUpdateQuantity: (id: string | number, quantity: number) => void
  onRemove: (id: string | number) => void
  onMoveToWishlist?: (id: string | number) => void
  className?: string
}

export default function AnimatedCartItem({
  item,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist,
  className
}: AnimatedCartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)

  // Sync quantity with prop changes
  useEffect(() => {
    setQuantity(item.quantity)
  }, [item.quantity])

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove()
      return
    }

    setIsUpdating(true)
    setQuantity(newQuantity)
    
    // Add a small delay for smooth animation
    await new Promise(resolve => setTimeout(resolve, 150))
    
    onUpdateQuantity(item.id || '', newQuantity)
    setIsUpdating(false)
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    
    // Wait for exit animation to complete
    await new Promise(resolve => setTimeout(resolve, 300))
    
    onRemove(item.id || '')
  }

  const handleIncrement = () => {
    handleQuantityChange(quantity + 1)
  }

  const handleDecrement = () => {
    handleQuantityChange(quantity - 1)
  }

  return (
    <AnimatePresence mode="wait">
      {!isRemoving && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 }
          }}
          exit={{ 
            opacity: 0, 
            x: -300, 
            scale: 0.8,
            transition: { duration: 0.3, ease: "easeInOut" }
          }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          className={cn(
            "group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
            className
          )}
        >
          {/* Remove animation overlay */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isRemoving ? 1 : 0 }}
            className="absolute inset-0 bg-red-500/10 z-10 origin-left"
          />
          
          <div className="flex items-center gap-4 p-4">
            {/* Product Image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
            >
              {(() => {
                const imageUrl = getImageUrl(item.image, '/placeholder.svg')
                console.log('AnimatedCartItem - item data:', item)
                console.log('AnimatedCartItem - original image:', item.image)
                console.log('AnimatedCartItem - processed image:', imageUrl)
                
                return imageUrl !== '/placeholder.svg' ? (
                  <Image
                    src={imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                    onError={() => {
                      console.log('Image load error for:', imageUrl)
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', imageUrl)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <svg
                      className="w-8 h-8"
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
                )
              })()}
              
              {/* Quantity badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              >
                {quantity}
              </motion.div>
            </motion.div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{item.category}</p>
              
              {/* Price */}
              <motion.div
                key={item.price * quantity}
                initial={{ scale: 1.1, color: "#10b981" }}
                animate={{ scale: 1, color: "#111827" }}
                className="text-lg font-bold text-gray-900 mt-1"
              >
                <Currency amount={item.price * quantity} size="md" />
              </motion.div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex items-center border border-gray-300 rounded-lg overflow-hidden"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDecrement}
                  disabled={isUpdating || quantity <= 1}
                  className="h-8 w-8 p-0 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <motion.div
                  key={quantity}
                  initial={{ scale: 1.2, color: "#3b82f6" }}
                  animate={{ scale: 1, color: "#111827" }}
                  className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center"
                >
                  {quantity}
                </motion.div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleIncrement}
                  disabled={isUpdating}
                  className="h-8 w-8 p-0 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Move to Wishlist */}
              {onMoveToWishlist && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveToWishlist(item.id || '')}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {/* Remove */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Loading overlay */}
          <AnimatePresence>
            {isUpdating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
