'use client'

import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { useCartSettings } from '@/lib/cart-settings-context'
import { Gift, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface FreeGiftProduct {
  id: string | number
  name: string
  image: string
  originalPrice: number
  isActive: boolean
}

export default function FreeGift() {
  const { totalPrice, items, addItem, removeItem, updateQuantity } = useCart()
  const { settings, getText } = useCartSettings()
  const [selectedGiftId, setSelectedGiftId] = useState<string | number | null>(null)
  
  const freeGiftEligible = totalPrice >= settings.freeGift.threshold && totalPrice < settings.freeShipping.threshold

  // Get free gift products from admin settings
  const getFreeGiftProducts = (): FreeGiftProduct[] => {
    if (typeof window === 'undefined') return []
    
    try {
      // In a real implementation, this would come from an API
      // For now, we'll use a default set that matches the admin
      const defaultGifts: FreeGiftProduct[] = [
        {
          id: 101,
          name: "Drinkmate Flavor Sachet - Cherry",
          image: "/images/italian-strawberry-lemon-syrup.png",
          originalPrice: 15.0,
          isActive: true,
        },
        {
          id: 102,
          name: "Drinkmate Flavor Sachet - Lemon", 
          image: "/images/italian-strawberry-lemon-syrup.png",
          originalPrice: 15.0,
          isActive: true,
        },
        {
          id: 103,
          name: "Drinkmate Flavor Sachet - Peach",
          image: "/images/italian-strawberry-lemon-syrup.png", 
          originalPrice: 15.0,
          isActive: true,
        },
      ]
      
      // Try to get from localStorage (admin settings)
      const savedProducts = localStorage.getItem('free-gift-products')
      if (savedProducts) {
        return JSON.parse(savedProducts).filter((gift: FreeGiftProduct) => gift.isActive)
      }
      
      return defaultGifts.filter(gift => gift.isActive)
    } catch (error) {
      console.error('Error loading free gift products:', error)
      return []
    }
  }

  const gifts = getFreeGiftProducts()

  // Find currently selected free gift
  useEffect(() => {
    const freeGiftInCart = items.find(item => item.price === 0 && item.isFree)
    if (freeGiftInCart) {
      setSelectedGiftId(freeGiftInCart.id)
    } else {
      setSelectedGiftId(null)
    }
  }, [items])

  if (!settings.freeGift.enabled || !freeGiftEligible) return null

  const handleGiftSelection = (gift: FreeGiftProduct) => {
    // If this gift is already selected, remove it
    if (selectedGiftId === gift.id) {
      removeItem(String(gift.id))
      setSelectedGiftId(null)
      return
    }

    // If another gift is selected, remove it first
    if (selectedGiftId) {
      removeItem(String(selectedGiftId))
    }

    // Add the new gift
    addItem({
      id: String(gift.id),
      name: gift.name,
      price: 0,
      quantity: 1,
      image: gift.image,
      isFree: true, // Mark as free gift
    })
    setSelectedGiftId(gift.id)
  }

  const isGiftSelected = (giftId: string | number) => selectedGiftId === giftId
  const hasFreeGift = selectedGiftId !== null

  return (
    <section className="bg-white rounded-soft shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink-900">{getText('freeGift.titleEn')}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-500">
            {hasFreeGift ? '1' : '0'} of {settings.freeGift.maxGift}
          </span>
          {hasFreeGift && (
            <button
              onClick={() => {
                if (selectedGiftId) {
                  removeItem(String(selectedGiftId))
                  setSelectedGiftId(null)
                }
              }}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remove free gift"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-sm text-ink-600 mb-6">{getText('freeGift.descriptionEn')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map((gift, index) => {
          const isSelected = isGiftSelected(gift.id)
          const isDisabled = hasFreeGift && !isSelected // Disable other gifts if one is selected
          
          return (
            <div
              key={gift.id}
              className={`rounded-soft border p-4 transition-all duration-300 transform group ${
                isSelected 
                  ? 'border-green-500 bg-green-50 scale-105 shadow-lg' 
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  : 'border-ink-200 hover:border-brand/60 hover:scale-105 hover:shadow-lg'
              }`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className={`relative h-32 bg-white rounded-xl mb-4 flex items-center justify-center overflow-hidden transition-colors duration-300 ${
                isSelected ? 'bg-green-100' : 'group-hover:bg-ink-50'
              }`}>
                <Image
                  src={gift.image || "/placeholder.svg"}
                  alt={gift.name}
                  width={80}
                  height={80}
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-ink-900 font-medium text-sm mb-2">{gift.name}</div>
                <div className="text-green-700 text-sm mb-3 font-semibold">FREE</div>
                <button
                  onClick={() => !isDisabled && handleGiftSelection(gift)}
                  disabled={isDisabled}
                  className={`w-full h-10 rounded-md text-sm font-medium transition-all duration-300 transform ${
                    isSelected 
                      ? 'bg-green-500 text-white scale-105 shadow-lg' 
                      : isDisabled
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white border border-ink-200 hover:border-brand hover:scale-105 active:scale-95'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Gift className="w-4 h-4 inline mr-1" />
                      Selected ✓
                    </>
                  ) : isDisabled ? (
                    'Select Another Gift First'
                  ) : (
                    <>
                      <Gift className="w-4 h-4 inline mr-1" />
                      Add Free Item
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Free gift info */}
      {hasFreeGift && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <Gift className="w-4 h-4" />
            <span>You've selected a free gift! It will be added to your order at checkout.</span>
          </div>
        </div>
      )}
    </section>
  )
}
