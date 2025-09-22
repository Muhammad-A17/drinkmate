"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { 
  ShoppingCart, 
  Star, 
  Zap, 
  Shield, 
  Award, 
  Clock, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface ExchangeCylinderCardProps {
  product: {
    id: string
    slug: string
    title: string
    image: string
    price: number
    compareAtPrice?: number
    rating: number | { average: number; count: number }
    reviewCount: number
    description: string
    category: string
    inStock: boolean
    badges?: string[]
    capacity?: number
    material?: string
    exchangeType?: 'instant' | 'scheduled' | 'pickup'
    estimatedTime?: string
  }
  onAddToCart: (data: { productId: string; qty: number }) => void
  onAddToWishlist: () => void
  onAddToComparison: () => void
  onProductView: () => void
  className?: string
  dir?: "ltr" | "rtl"
}

export default function ExchangeCylinderCard({
  product,
  onAddToCart,
  onAddToWishlist,
  onAddToComparison,
  onProductView,
  className,
  dir = "ltr"
}: ExchangeCylinderCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)

  const getBestImage = () => {
    if (imageLoadError) return "/placeholder.svg"
    return product.image || "/placeholder.svg"
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      await onAddToCart({ productId: product.id, qty: 1 })
      toast.success(`${product.title} added to cart!`)
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const percentOff = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const getExchangeTypeInfo = () => {
    switch (product.exchangeType) {
      case 'instant':
        return { label: 'Instant Exchange', color: 'text-green-600', icon: CheckCircle }
      case 'scheduled':
        return { label: 'Scheduled Exchange', color: 'text-blue-600', icon: Clock }
      case 'pickup':
        return { label: 'Pickup Required', color: 'text-orange-600', icon: AlertCircle }
      default:
        return { label: 'Exchange Available', color: 'text-cyan-600', icon: RefreshCw }
    }
  }

  const exchangeInfo = getExchangeTypeInfo()
  const ExchangeIcon = exchangeInfo.icon

  return (
    <div
      dir={dir}
      className={cn(
        "group bg-white rounded-3xl overflow-hidden flex flex-col border border-gray-100/80",
        "hover:border-cyan-200/60 transform hover:-translate-y-2 transition-all duration-500 ease-out",
        "h-[520px] sm:h-[560px] lg:h-[580px] shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20",
        "relative backdrop-blur-sm bg-gradient-to-b from-white to-gray-50/30",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            
            {/* Exchange Type Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-1">
                  <ExchangeIcon className="w-3 h-3" />
                  EXCHANGE
                </div>
              </div>
            </div>

            {/* Exchange Type Indicator */}
            <div className="absolute top-4 left-4 z-10">
              <div className={cn(
                "bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border",
                exchangeInfo.color
              )}>
                <div className="flex items-center gap-1">
                  <ExchangeIcon className="w-3 h-3" />
                  {exchangeInfo.label}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col relative z-10 min-h-0 pb-4 sm:pb-6">
        {/* Product Name */}
        <Link href={`/shop/${product.slug}`} className="block mb-3 group">
          <h3 
            id={`product-title-${product.id}`}
            className="font-bold text-xl text-gray-900 group-hover:text-cyan-600 transition-colors leading-tight tracking-tight line-clamp-2"
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
            Exchange
          </div>
        </div>

        {/* Description/Tagline */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
          {product.description || "Professional CO2 cylinder exchange service"}
        </p>

        {/* Exchange Details */}
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 flex-wrap">
          {product.capacity && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Shield className="w-3 h-3 flex-shrink-0" />
              <span>{product.capacity}L Capacity</span>
            </div>
          )}
          {product.material && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Award className="w-3 h-3 flex-shrink-0" />
              <span>{product.material}</span>
            </div>
          )}
          {product.estimatedTime && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{product.estimatedTime}</span>
            </div>
          )}
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
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
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
                  <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Exchange Now</span>
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
