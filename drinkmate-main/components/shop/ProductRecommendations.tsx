"use client"

import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye, 
  Sparkles,
  TrendingUp,
  Award,
  ArrowRight,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from '@/types/product'
import Image from 'next/image'

interface ProductRecommendationsProps {
  products: Product[]
  recentlyViewed: Product[]
  isOpen: boolean
  onClose: () => void
  onProductView: (product: Product) => void
  onAddToWishlist: (product: Product) => void
  onAddToComparison: (product: Product) => void
  wishlist: Product[]
  comparisonList: Product[]
}

export default function ProductRecommendations({
  products,
  recentlyViewed,
  isOpen,
  onClose,
  onProductView,
  onAddToWishlist,
  onAddToComparison,
  wishlist,
  comparisonList
}: ProductRecommendationsProps) {
  // Generate recommendations based on recently viewed products
  const recommendations = useMemo(() => {
    if (recentlyViewed.length === 0) {
      // If no recent views, return popular products
      return products
        .filter(p => (p as any).isBestSeller || (p as any).isPopular)
        .slice(0, 8)
    }

    // Get categories from recently viewed products
    const recentCategories = recentlyViewed.map(p => (p as any).category).filter(Boolean)
    const recentBrands = recentlyViewed.map(p => (p as any).brand).filter(Boolean)
    
    // Find similar products
    const similarProducts = products.filter(product => {
      const productCategory = (product as any).category
      const productBrand = (product as any).brand
      
      return (
        recentCategories.includes(productCategory) ||
        recentBrands.includes(productBrand) ||
        (product as any).isBestSeller ||
        (product as any).isNewProduct
      )
    }).filter(product => !recentlyViewed.some(p => p.id === product.id))

    return similarProducts.slice(0, 8)
  }, [products, recentlyViewed])

  if (!isOpen) {
    return null
  }

  const getRatingStars = (product: Product) => {
    const rating = typeof product.rating === 'number' 
      ? product.rating 
      : (product.rating as any)?.average || 0
    
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < Math.floor(rating)
            ? "text-amber-400 fill-current"
            : "text-gray-300"
        )}
      />
    ))
  }

  const isInWishlist = (product: Product) => {
    return wishlist.some(item => item.id === product.id)
  }

  const isInComparison = (product: Product) => {
    return comparisonList.some(item => item.id === product.id)
  }

  const handleAddToCart = (product: Product) => {
    // This would typically be passed as a prop
    console.log('Add to cart:', product)
  }

  const getRecommendationReason = (product: Product) => {
    if ((product as any).isBestSeller) return 'Best Seller'
    if ((product as any).isNewProduct) return 'New Product'
    if (recentlyViewed.some(p => (p as any).category === (product as any).category)) return 'Similar Category'
    if (recentlyViewed.some(p => (p as any).brand === (product as any).brand)) return 'Same Brand'
    return 'Recommended'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
              <p className="text-sm text-gray-600">Based on your browsing history and preferences</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          {recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No recommendations yet
              </h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Start browsing products to get personalized recommendations based on your interests.
              </p>
              <Button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="p-6">
              {/* Recommendation Categories */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Recommended Products ({recommendations.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recommendations.map((product) => (
                    <Card key={product.id} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="relative">
                          <div className="aspect-square relative rounded-lg overflow-hidden mb-3">
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button
                                onClick={() => onAddToWishlist(product)}
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110",
                                  isInWishlist(product)
                                    ? "bg-rose-500 text-white"
                                    : "bg-white/90 text-gray-600 hover:bg-rose-50 hover:text-rose-600"
                                )}
                                aria-label={isInWishlist(product) ? "Remove from wishlist" : "Add to wishlist"}
                              >
                                <Heart className={cn("w-4 h-4", isInWishlist(product) && "fill-current")} />
                              </button>
                              <button
                                onClick={() => onAddToComparison(product)}
                                disabled={comparisonList.length >= 4 && !isInComparison(product)}
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110",
                                  isInComparison(product)
                                    ? "bg-purple-500 text-white"
                                    : "bg-white/90 text-gray-600 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50"
                                )}
                                aria-label={isInComparison(product) ? "Remove from comparison" : "Add to comparison"}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-emerald-500 text-white text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {getRecommendationReason(product)}
                              </Badge>
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-2">
                            {product.title}
                          </h3>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {/* Price */}
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              SAR {product.price.toLocaleString()}
                            </span>
                            <Badge 
                              variant={product.inStock ? "default" : "destructive"}
                              className={cn(
                                "text-xs",
                                product.inStock 
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                                  : "bg-red-100 text-red-700 border-red-200"
                              )}
                            >
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </div>

                          {/* Rating */}
                          {product.rating && (
                            <div className="flex items-center gap-1">
                              {getRatingStars(product)}
                              <span className="text-xs text-gray-500 ml-1">
                                ({typeof product.rating === 'number' 
                                  ? product.rating.toFixed(1) 
                                  : (product.rating as any)?.average?.toFixed(1) || '0.0'})
                              </span>
                            </div>
                          )}

                          {/* Recommendation Reason */}
                          <div className="text-xs text-emerald-600 font-medium">
                            <Zap className="w-3 h-3 inline mr-1" />
                            {getRecommendationReason(product)}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => onProductView(product)}
                              className="flex-1 h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Product
                            </Button>
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={!product.inStock}
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 text-xs"
                            >
                              <ShoppingCart className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recommendation Insights */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Why These Recommendations?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Based on Your History</h4>
                      <p className="text-sm text-gray-600">Products similar to what you've viewed recently</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Popular Choices</h4>
                      <p className="text-sm text-gray-600">Best-selling products loved by our customers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">New Arrivals</h4>
                      <p className="text-sm text-gray-600">Latest products that might interest you</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Personalized</h4>
                      <p className="text-sm text-gray-600">Curated just for your preferences and interests</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {recommendations.length} recommendation{recommendations.length > 1 ? 's' : ''} for you
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Close
            </Button>
            <Button
              onClick={onClose}
              className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}