"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ProductCardProps, Variant, Product } from "@/types/product"
import { cn } from "@/lib/utils"
import { Star, ShoppingCart, Heart, Eye, Zap, Award, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

export default function BundleStyleProductCard({
  product,
  dir = "ltr",
  onAddToCart,
  className,
  onAddToWishlist,
  onAddToComparison,
  onProductView,
  isInWishlist = false,
  isInComparison = false,
}: ProductCardProps & {
  onAddToWishlist?: (product: Product) => void
  onAddToComparison?: (product: Product) => void
  onProductView?: (product: Product) => void
  isInWishlist?: boolean
  isInComparison?: boolean
}) {
  const hasVariants = (product.variants?.length ?? 0) > 0
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  // Get the best available image
  const getBestImage = () => {
    if (imageLoadError) return "/placeholder.svg"
    
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary)
      if (primaryImage?.url) return primaryImage.url
      return product.images[0]?.url || product.image
    }
    return product.image
  }

  const onAdd = async () => {
    if (onAddToCart && !isAddingToCart) {
      setIsAddingToCart(true)
      try {
        await onAddToCart({
          productId: product.id,
          variantId: hasVariants ? product.variants?.[0]?.id : undefined,
          qty: 1
        })
      } finally {
        setTimeout(() => setIsAddingToCart(false), 1000)
      }
    }
  }

  const isSale = product.compareAtPrice && product.compareAtPrice > product.price
  const percentOff = isSale && product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const isInStock = product.inStock

  return (
    <div
      dir={dir}
      className={cn(
        "group bg-white rounded-3xl overflow-hidden flex flex-col border border-gray-100/80",
        "hover:border-cyan-200/60 transform hover:-translate-y-2 transition-all duration-500 ease-out",
        "h-[500px] sm:h-[540px] lg:h-[580px] shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20",
        "relative backdrop-blur-sm bg-gradient-to-b from-white to-gray-50/30",
        className
      )}
      onMouseEnter={() => {
        setIsHovered(true)
        setShowOverlay(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowOverlay(false)
      }}
      role="article"
      aria-labelledby={`product-title-${product.id}`}
    >
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/20 via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Image Container */}
      <div className="relative">
        <Link href={`/shop/${product.slug}`} className="block">
          <div className="relative h-[220px] sm:h-[260px] lg:h-[320px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden p-3 sm:p-4">
            <Image
              src={getBestImage()}
              alt={product.title}
              fill
              className="object-contain object-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              onError={() => setImageLoadError(true)}
              onLoad={() => setImageLoadError(false)}
            />
            
            {/* Premium Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Premium Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  POPULAR
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Quick Actions Overlay - Outside of Link */}
        <div className={cn(
          "absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-all duration-300",
          "backdrop-blur-sm pointer-events-none",
          showOverlay ? "opacity-100 pointer-events-auto" : "opacity-0"
        )}>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToWishlist?.(product as Product)
            }}
          >
            <Heart className={cn("w-5 h-5", isInWishlist ? "fill-red-500 text-red-500" : "text-gray-700")} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onProductView?.(product as Product)
            }}
          >
            <Eye className="w-5 h-5 text-gray-700" />
          </Button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col relative z-10 min-h-0 pb-4 sm:pb-6">
        {/* Product Name */}
        <Link href={`/shop/${product.slug}`} className="block mb-3 group">
          <h3 
            id={`product-title-${product.id}`}
            className="font-bold text-xl text-gray-900 group-hover:text-cyan-600 transition-colors leading-tight tracking-tight"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => {
              const rating = typeof product.rating === 'number' ? product.rating : 
                           typeof product.rating === 'object' && product.rating?.average ? product.rating.average : 0
              return (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              )
            })}
          </div>
          <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
            ({product.reviewCount || 0} Reviews)
          </span>
          <div className="flex items-center gap-1 text-xs text-cyan-600 font-semibold whitespace-nowrap">
            <Zap className="w-3 h-3" />
            Premium
          </div>
        </div>

        {/* Description/Tagline */}
        <p 
          className="text-sm text-gray-600 mb-4 leading-relaxed"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.description || "Premium product bundle with exceptional quality"}
        </p>

        {/* Premium Features */}
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 flex-wrap">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Shield className="w-3 h-3 flex-shrink-0" />
            <span>Warranty</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Zap className="w-3 h-3 flex-shrink-0" />
            <span>Fast Delivery</span>
          </div>
        </div>

                    {/* Pricing and Add Button */}
                    <div className="mt-auto pt-2">
                      {/* Price Section */}
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        {product.compareAtPrice && (
                          <>
                            <span className="text-gray-400 text-sm line-through font-medium whitespace-nowrap">
                              <SaudiRiyal amount={product.compareAtPrice} size="sm" />
                            </span>
                            {percentOff > 0 && (
                              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                                {percentOff}% OFF
                              </span>
                            )}
                          </>
                        )}
                      </div>

          {/* Current Price and Add Button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="font-bold text-2xl text-gray-900 tracking-tight">
                <SaudiRiyal amount={product.price} size="lg" />
              </span>
            </div>
            
            <Button
              onClick={onAdd}
              disabled={!isInStock || isAddingToCart}
              className={cn(
                "bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 hover:from-cyan-600 hover:via-cyan-500 hover:to-cyan-600",
                "text-white rounded-full px-5 sm:px-6 py-2.5 sm:py-3 h-11 sm:h-12 text-xs font-bold",
                "transition-all duration-300 transform hover:scale-105 hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                "flex items-center gap-1.5 shadow-lg border border-cyan-300/20",
                "relative overflow-hidden whitespace-nowrap min-w-[120px] sm:min-w-[130px] flex-shrink-0"
              )}
            >
              {isAddingToCart ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding...</span>
                </div>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Add to Cart</span>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
