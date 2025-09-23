'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, ArrowRight, Trash2, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Currency } from '@/utils/currency'
import Link from 'next/link'
import { useCartSettings } from '@/lib/cart-settings-context'
import { getImageUrl } from '@/lib/image-utils'

interface CartPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartPopup({ isOpen, onClose }: CartPopupProps) {
  const { items, totalPrice, totalItems, updateQuantity, removeItem } = useCart()
  const { getText, settings } = useCartSettings()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Calculate totals
  const subtotal = totalPrice
  const freeShippingThreshold = settings.freeShipping.threshold
  const isFreeShipping = subtotal >= freeShippingThreshold
  const shipping = isFreeShipping ? 0 : (subtotal > 0 ? 25 : 0)
  const tax = subtotal * 0.15 // 15% VAT
  const total = subtotal + shipping + tax

  const handleQuantityChange = async (id: string | number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id)
      return
    }

    setIsUpdating(id.toString())
    await new Promise(resolve => setTimeout(resolve, 150))
    updateQuantity(id, newQuantity)
    setIsUpdating(null)
  }

  const handleCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  const handleViewCart = () => {
    onClose()
    router.push('/cart')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-20 right-2 sm:right-4 md:right-6 z-50 w-[calc(100vw-1rem)] max-w-xs sm:max-w-sm md:max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-[#12d6fa]/5 to-[#0bc4e8]/5">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#12d6fa]" />
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                    Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-[#12d6fa]/10 text-gray-600 hover:text-[#12d6fa]"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-3">🛒</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{getText('general.emptyCartEn')}</h4>
                    <p className="text-gray-500 mb-4">Add some products to get started!</p>
                    <Button onClick={onClose} className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white font-semibold">
                      {getText('general.continueShoppingEn')}
                    </Button>
                  </div>
                ) : (
                  <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
                    {items.map((item, index) => {
                      // Debug: Log item structure to understand why id might be undefined
                      if (process.env.NODE_ENV === 'development') {
                        console.log('Cart item:', item, 'Index:', index);
                      }
                      return (
                      <motion.div
                        key={item.id || `item-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-[#12d6fa]/5 rounded-lg border border-gray-100 hover:border-[#12d6fa]/20 transition-colors"
                      >
                        {/* Product Image */}
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0">
                          <Image
                            src={getImageUrl(item.image)}
                            alt={item.name || 'Product image'}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs sm:text-sm font-semibold text-[#12d6fa]">
                              <Currency amount={item.price} size="sm" />
                            </span>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-0.5 sm:gap-1 bg-white rounded-lg border border-gray-200">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={isUpdating === (item.id?.toString() || '')}
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-[#12d6fa]/10 text-gray-600 hover:text-[#12d6fa]"
                                >
                                  <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </Button>
                                <span className="text-xs sm:text-sm font-medium w-4 sm:w-6 text-center text-gray-900">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  disabled={isUpdating === (item.id?.toString() || '')}
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-[#12d6fa]/10 text-gray-600 hover:text-[#12d6fa]"
                                >
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer with totals and actions */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {/* Totals */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">{getText('general.subtotalEn')}</span>
                      <span className="font-medium">
                        <Currency amount={subtotal} size="sm" />
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">{getText('general.shippingEn')}</span>
                      <span className="font-medium">
                        {isFreeShipping ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          <Currency amount={shipping} size="sm" />
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">{getText('general.taxEn')} (15%)</span>
                      <span className="font-medium">
                        <Currency amount={tax} size="sm" />
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-base sm:text-lg font-semibold border-t border-gray-200 pt-1.5 sm:pt-2">
                      <span>{getText('general.totalEn')}</span>
                      <span className="text-[#12d6fa]">
                        <Currency amount={total} size="md" />
                      </span>
                    </div>
                  </div>

                  {/* Free shipping progress */}
                  {!isFreeShipping && (
                    <div className="bg-gradient-to-r from-[#12d6fa]/10 to-[#0bc4e8]/10 rounded-lg p-2 sm:p-3 border border-[#12d6fa]/20">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#12d6fa]">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#12d6fa] rounded-full"></div>
                        <span className="truncate">
                          Add <Currency amount={freeShippingThreshold - subtotal} size="sm" /> more for free shipping
                        </span>
                      </div>
                      <div className="mt-1.5 sm:mt-2 w-full bg-[#12d6fa]/20 rounded-full h-1 sm:h-1.5">
                        <div 
                          className="bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] h-1 sm:h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#09b3d1] text-white font-semibold h-9 sm:h-10 md:h-11 text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {getText('general.secureCheckoutEn')}
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                    </Button>
                    <Button
                      onClick={handleViewCart}
                      variant="outline"
                      className="w-full border-[#12d6fa]/30 text-[#12d6fa] hover:bg-[#12d6fa]/10 hover:border-[#12d6fa] h-8 sm:h-9 md:h-10 text-xs sm:text-sm transition-all duration-300"
                    >
                      View Full Cart
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
