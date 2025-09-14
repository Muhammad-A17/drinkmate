'use client'

import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { useCartSettings } from '@/lib/cart-settings-context'
import { Gift } from 'lucide-react'

export default function FreeGift() {
  const { totalPrice, items, addItem } = useCart()
  const { settings, getText } = useCartSettings()
  
  const freeGiftEligible = totalPrice >= settings.freeGift.threshold && totalPrice < settings.freeShipping.threshold
  
  if (!settings.freeGift.enabled || !freeGiftEligible) return null

  const gifts = [
    {
      id: 101,
      name: "Drinkmate Flavor Sachet - Cherry",
      image: "/images/italian-strawberry-lemon-syrup.png",
      originalPrice: 15.0,
    },
    {
      id: 102,
      name: "Drinkmate Flavor Sachet - Lemon", 
      image: "/images/italian-strawberry-lemon-syrup.png",
      originalPrice: 15.0,
    },
    {
      id: 103,
      name: "Drinkmate Flavor Sachet - Peach",
      image: "/images/italian-strawberry-lemon-syrup.png", 
      originalPrice: 15.0,
    },
  ]

  return (
    <section className="bg-white rounded-soft shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink-900">{getText('freeGift.titleEn')}</h2>
        <span className="text-sm text-ink-500">1 of {settings.freeGift.maxGift}</span>
      </div>
      
      <p className="text-sm text-ink-600 mb-6">{getText('freeGift.descriptionEn')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map((gift, index) => {
          const isSelected = items.some(item => String(item.id) === String(gift.id))
          return (
            <div
              key={gift.id}
              className={`rounded-soft border p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group ${
                isSelected ? 'border-brand bg-brand-light scale-105 shadow-lg' : 'border-ink-200 hover:border-brand/60'
              }`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="relative h-32 bg-white rounded-xl mb-4 flex items-center justify-center overflow-hidden group-hover:bg-ink-50 transition-colors duration-300">
                <Image
                  src={gift.image || "/placeholder.svg"}
                  alt={gift.name}
                  width={80}
                  height={80}
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="text-center">
                <div className="text-ink-900 font-medium text-sm mb-2">{gift.name}</div>
                <div className="text-green-700 text-sm mb-3">FREE</div>
                <button
                  onClick={() => {
                    addItem({
                      id: String(gift.id),
                      name: gift.name,
                      price: 0,
                      quantity: 1,
                      image: gift.image,
                    })
                  }}
                  className={`w-full h-10 rounded-md text-sm font-medium transition-all duration-300 transform ${
                    isSelected 
                      ? 'bg-green-500 text-white scale-105 shadow-lg' 
                      : 'bg-white border border-ink-200 hover:border-brand hover:scale-105 active:scale-95'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Gift className="w-4 h-4 inline mr-1" />
                      Selected ✓
                    </>
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
    </section>
  )
}
