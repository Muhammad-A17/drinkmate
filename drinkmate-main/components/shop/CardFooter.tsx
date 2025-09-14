"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Bell } from 'lucide-react'
import { ColorSwatches } from './ColorSwatches'
import { Price } from './Price'
import { cn } from '@/lib/utils'

interface CardFooterProps {
  onAddToCart: () => void
  onWishlist?: () => void
  onNotifyMe?: () => void
  disabled?: boolean
  inStock?: boolean
  isWishlisted?: boolean
  className?: string
  showQuantity?: boolean
  maxQuantity?: number
}

export function CardFooter({
  onAddToCart,
  onWishlist,
  onNotifyMe,
  disabled = false,
  inStock = true,
  isWishlisted = false,
  className = "",
  showQuantity = true,
  maxQuantity = 10
}: CardFooterProps) {
  const [quantity, setQuantity] = useState(1)

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(1, Math.min(maxQuantity, newQuantity))
    setQuantity(clampedQuantity)
  }

  if (!inStock) {
    return (
      <div className={cn("mt-3 space-y-2", className)}>
        <Button
          variant="outline"
          className="w-full"
          onClick={onNotifyMe}
          disabled={disabled}
        >
          <Bell className="w-4 h-4 mr-2" />
          Notify Me
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("mt-3 space-y-2", className)}>
      {/* Quantity and Add to Cart */}
      <div className="flex items-center gap-2">
        {showQuantity && (
          <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || disabled}
              className="px-2 py-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              value={quantity}
              readOnly
              className="w-8 text-center text-sm font-medium tabular-nums border-0 focus:outline-none"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity || disabled}
              className="px-2 py-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}
        
        <Button
          onClick={() => onAddToCart()}
          disabled={disabled}
          className="flex-1"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>

      {/* Wishlist Button */}
      {onWishlist && (
        <Button
          variant="outline"
          size="sm"
          onClick={onWishlist}
          className={cn(
            "w-full",
            isWishlisted && "text-red-600 border-red-200 bg-red-50"
          )}
        >
          <Heart className={cn("w-4 h-4 mr-2", isWishlisted && "fill-current")} />
          {isWishlisted ? "Wishlisted" : "Wishlist"}
        </Button>
      )}
    </div>
  )
}

interface QuickViewProps {
  isOpen: boolean
  onClose: () => void
  product: {
    title: string
    description?: string
    price: number
    compareAtPrice?: number
    variants?: Array<{
      id: string
      colorName?: string
      colorHex?: string
      inStock: boolean
    }>
  }
  onAddToCart: (variantId?: string) => void
}

export function QuickView({ isOpen, onClose, product, onAddToCart }: QuickViewProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants?.[0]?.id
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{product.title}</h3>
          
          {product.description && (
            <p className="text-gray-600 text-sm">{product.description}</p>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Color</h4>
              <ColorSwatches
                options={product.variants.map(v => ({
                  value: v.id,
                  label: v.colorName || 'Variant',
                  swatch: v.colorHex || '#E5E7EB',
                  inStock: v.inStock
                }))}
                selected={selectedVariant}
                onSelect={setSelectedVariant}
              />
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <Price value={product.price} compareAt={product.compareAtPrice} />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => onAddToCart(selectedVariant)}
              className="flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
