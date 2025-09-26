'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { useCartSettings } from '@/lib/contexts/cart-settings-context'

export default function CartHeader() {
  const { totalPrice } = useCart()
  const { settings, getFreeShippingText, getUnlockedText, getText } = useCartSettings()
  
  const freeShippingThreshold = settings.freeShipping.threshold
  const freeShippingProgress = Math.min(1, totalPrice / freeShippingThreshold)
  const freeShippingLeft = Math.max(0, freeShippingThreshold - totalPrice)
  const unlocked = totalPrice >= freeShippingThreshold

  return (
    <header className="bg-white rounded-soft shadow-card p-5">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <h1 className="text-2xl font-semibold text-ink-900">Your Cart</h1>
        {settings.secureCheckout.enabled && (
          <div className="flex items-center gap-2 text-ink-500">
            <Lock className="w-4 h-4" aria-hidden />
            <span>{getText('secureCheckout.textEn')}</span>
          </div>
        )}
      </div>

      {settings.freeShipping.enabled && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-ink-600 mb-2">
            <span>
              {unlocked ? (
                <span className="text-green-700 font-medium">{getUnlockedText()}</span>
              ) : (
                <span>{getFreeShippingText(freeShippingLeft)}</span>
              )}
            </span>
          </div>
          <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${unlocked ? 'bg-green-500' : 'bg-brand'}`}
              style={{ width: `${Math.min(100, Math.max(0, freeShippingProgress * 100))}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button className="text-danger hover:underline text-sm">{getText('general.clearCartEn')}</button>
        <Link href="/shop" className="text-brand hover:underline text-sm">{getText('general.continueShoppingEn')}</Link>
      </div>
    </header>
  )
}
