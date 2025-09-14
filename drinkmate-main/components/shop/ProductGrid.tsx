"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'
import { ProductGridProps, Product } from '@/types/product'

const EmptyState = ({ onRetry, isRTL }: { onRetry?: () => void; isRTL?: boolean }) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <AlertCircle className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      No products found
    </h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
    </p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    )}
  </div>
)

export default function ProductGrid({
  products,
  dir = "ltr",
  className = "",
  loading = false
}: ProductGridProps) {
  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (products.length === 0) {
    return <EmptyState isRTL={dir === "rtl"} />
  }

  // Convert old product format to new format if needed
  const convertProduct = (product: any): Product => {
    // If it's already in the new format, return as is
    if (product.id && product.slug) {
      return product
    }

    // Convert from old format
    return {
      id: product._id || product.id,
      slug: product.slug,
      title: product.name || product.title,
      image: product.images?.[0]?.url || product.image || '/placeholder-product.jpg',
      rating: product.rating,
      reviewCount: product.reviewsCount || product.reviewCount,
      price: product.price || 0,
      compareAtPrice: product.compareAtPrice,
      inStock: (product.stock || 0) > 0,
      badges: product.badges || [],
      variants: product.variants?.map((v: any) => ({
        id: v._id || v.id || Math.random().toString(),
        colorName: v.name || v.colorName,
        colorHex: v.colorHex || v.value,
        image: v.image || product.images?.[0]?.url,
        price: v.price || product.price,
        compareAtPrice: v.compareAtPrice || product.compareAtPrice,
        inStock: (v.stock || product.stock || 0) > 0
      })) || [],
      description: product.description,
      category: product.category,
      brand: product.brand,
      tags: product.tags || []
    }
  }

  return (
    <div
      dir={dir}
      className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${className}`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={convertProduct(product)}
          dir={dir}
          onAddToCart={(payload) => {
            console.log('Add to cart:', payload)
            // TODO: Implement add to cart functionality
          }}
        />
      ))}
    </div>
  )
}