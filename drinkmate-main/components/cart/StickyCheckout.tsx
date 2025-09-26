'use client'

import { Currency } from '@/utils/currency'
import { useCartSettings } from '@/lib/contexts/cart-settings-context'
import { useRouter } from 'next/navigation'

interface CartTotals {
  subtotal: number
  shipping: number | null
  discount: number
  tax: number
  total: number
  shippingLabel: string | React.ReactNode
}

interface StickyCheckoutProps {
  visible: boolean
  totals: CartTotals
}

export default function StickyCheckout({ visible, totals }: StickyCheckoutProps) {
  const { settings, getText } = useCartSettings()
  const router = useRouter()
  
  if (!settings.stickyCheckout.enabled) return null
  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 transition-transform lg:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 pb-safe">
        <div className="bg-white rounded-t-2xl shadow-card p-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-ink-500">{getText('general.subtotalEn')}</div>
            <div className="text-base font-semibold text-ink-900">
              <Currency amount={totals.total} />
            </div>
          </div>
          <button 
            onClick={() => router.push('/checkout')}
            className="h-12 px-5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
          >
            {getText('stickyCheckout.textEn')}
          </button>
        </div>
      </div>
    </div>
  )
}
