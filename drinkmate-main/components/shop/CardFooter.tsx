"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Bell, X, Star, Shield, Truck } from 'lucide-react'
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
          className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:from-amber-100 hover:to-orange-100 text-amber-700 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
          <div className="inline-flex items-center rounded-xl border-2 border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || disabled}
              className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-xl transition-all duration-200"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              value={quantity}
              readOnly
              className="w-10 text-center text-sm font-bold tabular-nums border-0 focus:outline-none bg-transparent"
              aria-label="Quantity"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity || disabled}
              className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-xl transition-all duration-200"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}
        
        <Button
          onClick={() => onAddToCart()}
          disabled={disabled}
          className="flex-1 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:ring-4 hover:ring-brand-100 border-0"
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
            "w-full rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105",
            isWishlisted
              ? "text-red-600 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 shadow-lg"
              : "border-gray-200/60 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:border-brand-300 hover:shadow-lg"
          )}
        >
          <Heart className={cn("w-4 h-4 mr-2 transition-all duration-300", isWishlisted && "fill-current animate-pulse")} />
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
      image?: string
    }>
    images?: string[]
    rating?: number
    reviewCount?: number
    inStock?: boolean
    badges?: string[]
  }
  onAddToCart: (variantId?: string) => void
}

export function QuickView({ isOpen, onClose, product, onAddToCart }: QuickViewProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants?.[0]?.id
  )
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const images = product.images || (product.variants?.map(v => v.image).filter(Boolean) as string[]) || []
  const currentImage = selectedVariant 
    ? product.variants?.find(v => v.id === selectedVariant)?.image || images[0]
    : images[0]

  const isSale = product.compareAtPrice && product.compareAtPrice > product.price
  const percentOff = isSale ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100) : 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Quick View</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Image Gallery */}
          <div className="lg:w-1/2 p-6">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
                
                {/* Sale Badge */}
                {isSale && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      -{percentOff}%
                    </span>
                  </div>
                )}

                {/* Product Badges */}
                {product.badges && product.badges.length > 0 && (
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="bg-brand-500 text-white text-xs px-2 py-1 rounded-full font-semibold"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-brand-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 p-6 space-y-6">
            {/* Title & Rating */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">{product.title}</h3>
              
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < product.rating! ? 'text-amber-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {product.reviewCount && (
                    <span className="text-sm text-gray-500">
                      ({product.reviewCount} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Price value={product.price} compareAt={product.compareAtPrice} size="lg" />
                {isSale && (
                  <span className="text-lg text-gray-500 line-through">
                    <Price value={product.compareAtPrice!} size="md" />
                  </span>
                )}
              </div>
              {isSale && (
                <p className="text-sm text-green-600 font-medium">
                  Save {percentOff}% on this item
                </p>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Color</h4>
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

            {/* Quantity & Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-sm font-medium border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => onAddToCart(selectedVariant)}
                  className="flex-1 h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`px-4 ${
                    isWishlisted ? 'text-red-600 border-red-200 bg-red-50' : ''
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-500" />
                <span>2 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4 text-blue-500" />
                <span>Free Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
