"use client"

import { useState } from "react"
import { CheckCircle, Truck, Tag, Gift } from "lucide-react"
import { fmt } from "@/lib/money"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import SaudiRiyalSymbol from "@/components/ui/SaudiRiyalSymbol"
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
    <aside className={`lg:sticky lg:top-24 rounded-2xl border border-black/10 bg-white p-5 w-full max-w-[360px] ${className}`}>
      {/* Free Shipping Status */}
      <div className="mb-3 rounded-xl bg-sky-50 text-sky-800 text-sm px-3 py-2">
        {isFreeShipping ? (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">You've unlocked free shipping!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>
              Add <strong className="tabular-nums flex items-center gap-1">
                {fmt(remainingForFreeShipping, 'SAR')} <SaudiRiyalSymbol size="sm" className="text-sky-800" />
              </strong> more for free shipping
            </span>
          </div>
        )}
      </div>

      {/* Order Breakdown */}
      <dl className="text-sm space-y-2">
        <div className="flex justify-between items-center">
          <dt className="text-black/80">Subtotal ({itemCount} items)</dt>
          <dd className="font-medium text-black tabular-nums flex items-center gap-1">
            {fmt(subtotal, 'SAR')} <SaudiRiyalSymbol size="sm" />
          </dd>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center text-emerald-600">
            <dt>Discount {appliedCoupon && `(${appliedCoupon.code})`}</dt>
            <dd className="font-medium tabular-nums flex items-center gap-1">
              -{fmt(discount, 'SAR')} <SaudiRiyalSymbol size="sm" />
            </dd>
          </div>
        )}

        <div className="flex justify-between items-center">
          <dt className="text-black/80">Shipping</dt>
          <dd className="text-sm">
            {isFreeShipping ? (
              <span className="text-emerald-600 font-medium">FREE</span>
            ) : shipping !== null ? (
              <span className="tabular-nums flex items-center gap-1">
                {fmt(shipping, 'SAR')} <SaudiRiyalSymbol size="sm" />
              </span>
            ) : (
              <span className="text-black/60">Calculated at checkout</span>
            )}
          </dd>
        </div>

        {tax > 0 && (
          <div className="flex justify-between items-center">
            <dt className="text-black/80">Tax</dt>
            <dd className="font-medium text-black tabular-nums flex items-center gap-1">
              {fmt(tax, 'SAR')} <SaudiRiyalSymbol size="sm" />
            </dd>
          </div>
        )}

        <div className="h-px bg-black/10 my-2" />
        
        <div className="flex justify-between items-center">
          <dt className="text-lg font-semibold text-black">Total</dt>
          <dd className="text-xl font-bold text-black tabular-nums flex items-center gap-1">
            {fmt(total, 'SAR')} <SaudiRiyalSymbol size="lg" />
          </dd>
        </div>
      </dl>

      {/* Coupon Code */}
      {onApplyCoupon && (
        <div className="mt-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code"
              className="input flex-1 h-10 rounded-xl border border-black/20 px-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              disabled={isApplyingCoupon}
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || isApplyingCoupon}
              className="h-10 px-4 rounded-xl border font-medium disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              {isApplyingCoupon ? "..." : "Apply"}
            </Button>
          </div>
          
          {couponError && (
            <p className="mt-1 text-xs text-rose-600">{couponError}</p>
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
        className={`mt-4 h-11 w-full rounded-xl font-semibold hover:bg-emerald-700 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 transition-all duration-200 ${
          isCheckoutDisabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-emerald-600 text-white'
        }`}
      >
        {isCheckoutDisabled ? (
          'Cart is Empty'
        ) : (
          <>
            Secure Checkout • <span className="tabular-nums flex items-center gap-1">
              {fmt(total, 'SAR')} <SaudiRiyalSymbol size="sm" />
            </span>
          </>
        )}
      </Button>

      {/* Security Note */}
      <p className="mt-2 text-xs text-black/60">
        Taxes and discount codes calculated at checkout
      </p>
    </aside>
  )
}
