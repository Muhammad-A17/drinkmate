import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCardProps } from '@/lib/types'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye, 
  Share2,
  Award,
  Sparkles,
  CheckCircle,
  Truck,
  Clock,
  Zap,
  Leaf,
  Shield,
  TrendingUp,
  Users,
  ChevronRight,
  X
} from 'lucide-react'
import SaudiRiyal from '@/components/ui/SaudiRiyal'
import { toast } from 'sonner'

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  onQuickView, 
  showQuickActions = true,
  className = ''
}: ProductCardProps) {
  const { addItem, isInCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleAddToCart = () => {
    const cartItem = {
      id: product._id,
      name: product.name,
      price: (product as any).salePrice || product.price,
      image: product.images?.[0] || product.image || '/placeholder.svg',
      quantity: 1,
      productType: 'product' as const
    }

    addItem(cartItem)
    onAddToCart?.(cartItem)
    toast.success('Product added to cart!')
  }

  const handleWishlistToggle = () => {
    toggleWishlist(product._id)
    onAddToWishlist?.(product._id)
    toast.success(isInWishlist(product._id) ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleQuickView = () => {
    onQuickView?.(product)
  }

  const formatPercentOff = (original?: number, current?: number) => {
    if (!original || !current || original <= current) return null
    const percent = Math.round((1 - (current / original)) * 100)
    return `${percent}% OFF`
  }

  const isOnSale = (product as any).originalPrice && (product as any).originalPrice > product.price
  const isOutOfStock = product.stock !== undefined && product.stock <= 0
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5
  const isNew = (product as any).isNewProduct
  const isBestSeller = (product as any).isBestSeller
  const isEcoFriendly = (product as any).isEcoFriendly
  const isFeatured = (product as any).isFeatured

  const getDeliveryDate = () => {
    const today = new Date()
    const deliveryDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
    return deliveryDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 bg-white border-0 shadow-lg rounded-2xl hover:scale-[1.02] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-t-2xl">
        <Link href={`/shop/${product.slug}`}>
          <Image
            src={product.images?.[0] || product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            className={`object-cover object-top transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-slate-300 border-t-[#12d6fa] rounded-full animate-spin"></div>
            </div>
          )}
        </Link>

        {/* Enhanced Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {isOnSale && (
            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl animate-pulse px-3 py-1.5 text-xs font-bold rounded-full border-0">
              {formatPercentOff((product as any).originalPrice, product.price)}
            </Badge>
          )}
          {isBestSeller && (
            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border-0">
              <Award className="w-3.5 h-3.5" />
              Best Seller
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border-0">
              <Sparkles className="w-3.5 h-3.5" />
              New
            </Badge>
          )}
          {isEcoFriendly && (
            <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border-0">
              <Leaf className="w-3.5 h-3.5" />
              Eco-Friendly
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border-0">
              <Star className="w-3.5 h-3.5" />
              Featured
            </Badge>
          )}
        </div>

        {/* Enhanced Quick Actions */}
        {showQuickActions && (
          <div className={`absolute top-4 right-4 flex flex-col gap-2.5 transition-all duration-500 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'
          }`}>
            <Button
              size="sm"
              variant="secondary"
              className="h-10 w-10 p-0 rounded-full bg-white/95 hover:bg-white shadow-xl border-0 backdrop-blur-sm hover:scale-110 transition-all duration-300"
              onClick={handleWishlistToggle}
              aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart 
                className={`w-4.5 h-4.5 transition-all duration-300 ${
                  isInWishlist(product._id) ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-600 hover:text-red-500'
                }`} 
              />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-10 w-10 p-0 rounded-full bg-white/95 hover:bg-white shadow-xl border-0 backdrop-blur-sm hover:scale-110 transition-all duration-300"
              onClick={handleQuickView}
              aria-label="Quick view"
            >
              <Eye className="w-4.5 h-4.5 text-slate-600 hover:text-[#12d6fa] transition-colors duration-300" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-10 w-10 p-0 rounded-full bg-white/95 hover:bg-white shadow-xl border-0 backdrop-blur-sm hover:scale-110 transition-all duration-300"
              aria-label="Share product"
            >
              <Share2 className="w-4.5 h-4.5 text-slate-600 hover:text-[#12d6fa] transition-colors duration-300" />
            </Button>
          </div>
        )}

        {/* Stock Status Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <Badge variant="destructive" className="text-lg px-6 py-3 font-bold shadow-lg">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Low Stock Warning */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute bottom-3 left-3 right-3">
            <Badge className="bg-orange-500 text-white text-xs font-bold px-3 py-1">
              Only {product.stock} left!
            </Badge>
          </div>
        )}

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>

      <CardContent className="p-5">
        <div className="space-y-3">
          {/* Product Name */}
          <Link href={`/shop/${product.slug}`}>
            <h3 className="font-bold text-slate-900 line-clamp-2 hover:text-[#12d6fa] transition-colors duration-300 text-lg leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round((product as any).rating || (product as any).averageRating || 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-600">
              {(product as any).rating || (product as any).averageRating || 0}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            {isOnSale ? (
              <>
                <span className="text-xl font-bold text-[#12d6fa]">
                  <SaudiRiyal amount={product.price} size="lg" />
                </span>
                <span className="text-sm text-slate-500 line-through">
                  <SaudiRiyal amount={(product as any).originalPrice!} size="sm" />
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-slate-900">
                <SaudiRiyal amount={product.price} size="lg" />
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-1 text-sm">
            {isOutOfStock ? (
              <div className="flex items-center gap-1 text-red-600">
                <X className="w-4 h-4" />
                <span>Out of Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>In Stock</span>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isInCart(product._id)}
            className={`w-full transition-all duration-300 ${
              isOutOfStock 
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                : isInCart(product._id)
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-[#12d6fa] hover:bg-[#0fb8d9] text-white'
            }`}
            size="lg"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isOutOfStock 
              ? 'Out of Stock' 
              : isInCart(product._id) 
              ? 'Added to Cart' 
              : 'Add to Cart'
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}