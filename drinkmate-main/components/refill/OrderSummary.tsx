"use client"

import { useState, useEffect } from "react"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Truck, Gift } from "lucide-react"

interface OrderSummaryProps {
  quantity: number
  unitPrice: number
  subtotal: number
  deliveryCharge: number
  total: number
  savings: number
  freeDeliveryThreshold: number
  className?: string
}

export default function OrderSummary({
  quantity,
  unitPrice,
  subtotal,
  deliveryCharge,
  total,
  savings,
  freeDeliveryThreshold,
  className = ""
}: OrderSummaryProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const freeLeft = Math.max(0, freeDeliveryThreshold - quantity)
  const isFreeDelivery = deliveryCharge === 0

  if (!mounted) {
    return (
      <aside className={`rounded-2xl border border-black/10 p-5 space-y-3 animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside className={`rounded-2xl border border-black/10 p-5 space-y-3 ${className}`}>
      {/* Total */}
      <div className="flex items-baseline justify-between">
        <div className="text-lg font-semibold text-black">Total</div>
        <div className="text-3xl font-extrabold text-black">
          <SaudiRiyal amount={total} size="xl" />
        </div>
      </div>

      {/* Breakdown */}
      <dl className="text-sm space-y-2">
        <div className="flex justify-between items-center">
          <dt className="text-black/80">Refill / Exchange</dt>
          <dd className="text-black font-medium">
            ×{quantity} <SaudiRiyal amount={subtotal} size="sm" />
          </dd>
        </div>
        
        <div className="flex justify-between items-center">
          <dt className="text-black/80">Delivery</dt>
          <dd className={`font-medium ${isFreeDelivery ? 'text-emerald-600' : 'text-black'}`}>
            {isFreeDelivery ? (
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3" />
                FREE
              </span>
            ) : (
              <SaudiRiyal amount={deliveryCharge} size="sm" />
            )}
          </dd>
        </div>

        {savings > 0 && (
          <div className="flex justify-between items-center text-emerald-600">
            <dt>Total savings</dt>
            <dd className="font-medium">
              -<SaudiRiyal amount={savings} size="sm" />
            </dd>
          </div>
        )}
      </dl>

      {/* Free delivery hint */}
      {freeLeft > 0 && (
        <div className="text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-sky-600" />
            <span>
              Add {freeLeft} more {freeLeft > 1 ? 'cylinders' : 'cylinder'} for FREE delivery
            </span>
          </div>
        </div>
      )}

      {/* Free delivery unlocked */}
      {isFreeDelivery && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">FREE delivery unlocked! 🎉</span>
          </div>
        </div>
      )}
    </aside>
  )
}
