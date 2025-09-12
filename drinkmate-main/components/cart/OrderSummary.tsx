"use client"

import { useState } from "react"
import { CheckCircle, Truck, Tag, Gift } from "lucide-react"
import { fmt } from "@/lib/money"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface OrderSummaryProps {
  subtotal: number
  itemCount: number
  shipping?: number | null
  discount?: number
  tax?: number
  total: number
  freeShippingThreshold: number
  appliedCoupon?: { code: string; discount: number } | null
  onApplyCoupon?: (code: string) => void
  onRemoveCoupon?: () => void
  onCheckout: () => void
  isCheckoutDisabled?: boolean
  className?: string
}

export default function OrderSummary({
  subtotal,
  itemCount,
  shipping,
  discount = 0,
  tax = 0,
  total,
  freeShippingThreshold,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  isCheckoutDisabled = false,
  className = ""
}: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState("")
  const [couponError, setCouponError] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const isFreeShipping = subtotal >= freeShippingThreshold
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  const handleApplyCoupon = async () => {
    if (!onApplyCoupon || !couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    setIsApplyingCoupon(true)
    setCouponError("")
    
    try {
      await onApplyCoupon(couponCode.trim())
      setCouponCode("")
    } catch (error) {
      setCouponError("Invalid coupon code")
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    if (onRemoveCoupon) {
      onRemoveCoupon()
      toast.info(`Coupon ${appliedCoupon?.code} removed`)
    }
  }

  return (
    <aside className={`rounded-2xl border border-black/10 p-5 shadow-sm bg-white space-y-4 ${className}`}>
      {/* Free Shipping Status */}
      {isFreeShipping ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Free Shipping Unlocked!</span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
          <div className="flex items-center gap-2 text-sky-700">
            <Truck className="h-4 w-4" />
            <span className="text-sm font-medium">
              Add <SaudiRiyal amount={remainingForFreeShipping} size="sm" /> more for free shipping
            </span>
          </div>
        </div>
      )}

      {/* Order Breakdown */}
      <dl className="text-sm space-y-2">
        <div className="flex justify-between items-center">
          <dt className="text-black/80">Subtotal ({itemCount} items)</dt>
          <dd className="font-medium text-black"><SaudiRiyal amount={subtotal} size="sm" /></dd>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center text-emerald-600">
            <dt>Discount {appliedCoupon && `(${appliedCoupon.code})`}</dt>
            <dd className="font-medium">-<SaudiRiyal amount={discount} size="sm" /></dd>
          </div>
        )}

        <div className="flex justify-between items-center">
          <dt className="text-black/80">Shipping</dt>
          <dd className="text-sm">
            {isFreeShipping ? (
              <span className="text-emerald-600 font-medium">FREE</span>
            ) : shipping !== null ? (
              <SaudiRiyal amount={shipping} size="sm" />
            ) : (
              <span className="text-black/60">Calculated at checkout</span>
            )}
          </dd>
        </div>

        {tax > 0 && (
          <div className="flex justify-between items-center">
            <dt className="text-black/80">Tax</dt>
            <dd className="font-medium text-black"><SaudiRiyal amount={tax} size="sm" /></dd>
          </div>
        )}

        <div className="h-px bg-black/10 my-2" />
        
        <div className="flex justify-between items-center">
          <dt className="text-lg font-semibold text-black">Total</dt>
          <dd className="text-xl font-bold text-black"><SaudiRiyal amount={total} size="lg" /></dd>
        </div>
      </dl>

      {/* Coupon Code */}
      {onApplyCoupon && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 border border-black/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              disabled={isApplyingCoupon}
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || isApplyingCoupon}
              className="px-4 py-2 text-sm"
              size="sm"
            >
              {isApplyingCoupon ? "..." : "Apply"}
            </Button>
          </div>
          
          {couponError && (
            <p className="text-red-600 text-xs">{couponError}</p>
          )}
          
          {appliedCoupon && (
            <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <span className="text-emerald-700 text-sm font-medium">
                {appliedCoupon.code} ({appliedCoupon.discount}% off)
              </span>
              <button 
                onClick={handleRemoveCoupon}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        disabled={isCheckoutDisabled}
        className={`w-full font-semibold py-3 text-base rounded-2xl ${
          isCheckoutDisabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-sky-500 hover:bg-sky-600 text-white'
        }`}
      >
        {isCheckoutDisabled ? 'Cart is Empty' : `Secure Checkout • `}<SaudiRiyal amount={total} size="sm" />
      </Button>

      {/* Security Note */}
      <div className="text-xs text-black/60 text-center">
        Taxes and discount codes calculated at checkout
      </div>
    </aside>
  )
}
