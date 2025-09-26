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
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from '@/lib/types'
import Image from 'next/image'

interface ProductComparisonProps {
  products: Product[]
  isOpen: boolean
  onClose: () => void
  onRemoveProduct: (productId: string) => void
  onClearAll: () => void
}

export default function ProductComparison({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
  onClearAll
}: ProductComparisonProps) {
  if (!isOpen || products.length === 0) {
    return null
  }

  const comparisonFeatures = [
    { key: 'title', label: 'Product Name', type: 'text' },
    { key: 'price', label: 'Price', type: 'price' },
    { key: 'rating', label: 'Rating', type: 'rating' },
    { key: 'inStock', label: 'Availability', type: 'boolean' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'brand', label: 'Brand', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'isNewProduct', label: 'New Product', type: 'boolean' },
    { key: 'isBestSeller', label: 'Best Seller', type: 'boolean' },
    { key: 'isOnSale', label: 'On Sale', type: 'boolean' }
  ]

  const getFeatureValue = (product: Product, feature: any) => {
    const value = (product as any)[feature.key]
    
    switch (feature.type) {
      case 'price':
        return `SAR ${product.price.toLocaleString()}`
      case 'rating':
        if (typeof value === 'number') {
          return value.toFixed(1)
        } else if (value && typeof value === 'object' && value.average) {
          return value.average.toFixed(1)
        }
        return 'N/A'
      case 'boolean':
        return value ? 'Yes' : 'No'
      case 'text':
        return value || 'N/A'
      default:
        return value || 'N/A'
    }
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Product Comparison</h2>
              <p className="text-sm text-gray-600">Compare up to 4 products side by side</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear All
            </Button>
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
          <div className="p-6">
            {/* Product Cards Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {products.map((product) => (
                <Card key={product.id} className="relative group">
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
                          className="absolute top-2 right-2 w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                          aria-label={`Remove ${product.title} from comparison`}
                        >
                          <X className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                        {product.title}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
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
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          {getRatingStars(product)}
                          <span className="text-xs text-gray-500 ml-1">
                            ({getFeatureValue(product, { key: 'rating', type: 'rating' })})
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                      Feature
                    </th>
                    {products.map((product) => (
                      <th key={product.id} className="text-center py-3 px-4 font-semibold text-gray-700 bg-gray-50 min-w-[200px]">
                        <div className="truncate">{product.title}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={feature.key} className={cn(
                      "border-b border-gray-100",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    )}>
                      <td className="py-3 px-4 font-medium text-gray-700">
                        {feature.label}
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="py-3 px-4 text-center">
                          {feature.type === 'boolean' ? (
                            <div className="flex items-center justify-center">
                              {getFeatureValue(product, feature) === 'Yes' ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          ) : feature.type === 'rating' ? (
                            <div className="flex items-center justify-center gap-1">
                              {getRatingStars(product)}
                              <span className="text-sm text-gray-500 ml-1">
                                {getFeatureValue(product, feature)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-700">
                              {getFeatureValue(product, feature)}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Comparing {products.length} of 4 products
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
              className="px-6 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add Selected to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
