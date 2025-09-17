"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye, 
  Clock,
  History,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from '@/types/product'
import Image from 'next/image'

interface RecentlyViewedProps {
  products: Product[]
  isOpen: boolean
  onClose: () => void
  onProductView: (product: Product) => void
  onAddToWishlist: (product: Product) => void
  onAddToComparison: (product: Product) => void
  wishlist: Product[]
  comparisonList: Product[]
}

export default function RecentlyViewed({
  products,
  isOpen,
  onClose,
  onProductView,
  onAddToWishlist,
  onAddToComparison,
  wishlist,
  comparisonList
}: RecentlyViewedProps) {
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
              <p className="text-sm text-gray-600">Your browsing history and recommendations</p>
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
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <History className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No recent views
              </h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Start browsing products to see your recently viewed items here.
              </p>
              <Button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="p-6">
              {/* Recently Viewed Products */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Recently Viewed ({products.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.slice(0, 8).map((product) => (
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
                              <Badge className="bg-blue-500 text-white text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Recent
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

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => onProductView(product)}
                              className="flex-1 h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Again
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

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-12 justify-start text-left"
                    onClick={() => {
                      // Navigate to wishlist
                      console.log('Navigate to wishlist')
                    }}
                  >
                    <Heart className="w-5 h-5 mr-3 text-rose-600" />
                    <div>
                      <div className="font-medium">View Wishlist</div>
                      <div className="text-xs text-gray-500">{wishlist.length} items saved</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 justify-start text-left"
                    onClick={() => {
                      // Navigate to comparison
                      console.log('Navigate to comparison')
                    }}
                  >
                    <Eye className="w-5 h-5 mr-3 text-purple-600" />
                    <div>
                      <div className="font-medium">Compare Products</div>
                      <div className="text-xs text-gray-500">{comparisonList.length} items selected</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 justify-start text-left"
                    onClick={() => {
                      // Clear history
                      console.log('Clear history')
                    }}
                  >
                    <History className="w-5 h-5 mr-3 text-gray-600" />
                    <div>
                      <div className="font-medium">Clear History</div>
                      <div className="text-xs text-gray-500">Remove all recent views</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {products.length} recent view{products.length > 1 ? 's' : ''}
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
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}