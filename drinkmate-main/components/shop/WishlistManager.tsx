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
  Shield, 
  Zap, 
  Award,
  Truck,
  Trash2,
  Share2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from '@/lib/types'
import Image from 'next/image'

interface WishlistManagerProps {
  products: Product[]
  isOpen: boolean
  onClose: () => void
  onRemoveProduct: (productId: string) => void
  onClearAll: () => void
  onAddToCart: (item: any) => void
}

export default function WishlistManager({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
  onClearAll,
  onAddToCart
}: WishlistManagerProps) {
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

  const handleAddToCart = (product: Product) => {
    onAddToCart({
      productId: product.id,
      qty: 1,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Heart className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
              <p className="text-sm text-gray-600">{products.length} items saved for later</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {products.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="text-gray-600 hover:text-gray-800"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Start adding products you love to your wishlist. They'll appear here for easy access later.
              </p>
              <Button
                onClick={onClose}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="p-6">
              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="relative">
                        <div className="aspect-square relative rounded-lg overflow-hidden mb-3">
                          <Image
                            src={product.image}
                            alt={product.title || product.name || 'Product image'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            onClick={() => onRemoveProduct(String(product._id || product.id || ''))}
                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                            aria-label={`Remove ${product.title} from wishlist`}
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </button>
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-rose-500 text-white text-xs">
                              <Heart className="w-3 h-3 mr-1 fill-current" />
                              Saved
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

                        {/* Description */}
                        {product.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock}
                            className="flex-1 h-9 text-xs bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 text-xs"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 text-xs"
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {products.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {products.length} item{products.length > 1 ? 's' : ''} in your wishlist
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={() => {
                  // Add all items to cart
                  products.forEach(product => {
                    if (product.inStock) {
                      handleAddToCart(product)
                    }
                  })
                }}
                className="px-6 bg-rose-600 hover:bg-rose-700 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add All to Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}