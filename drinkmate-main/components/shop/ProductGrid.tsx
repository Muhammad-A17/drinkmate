"use client"

import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import BundleStyleProductCard from './BundleStyleProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'
import { ProductGridProps, Product } from '@/types/product'
import { useCart } from '@/hooks/use-cart'
import { useCartAnimations } from '@/hooks/use-cart-animations'
import CartNotification from '@/components/cart/CartNotification'
import { getProductImageUrl, getImageUrl } from '@/lib/image-utils'

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
  loading = false,
  onAddToWishlist,
  onAddToComparison,
  onProductView,
  wishlist = [],
  comparisonList = []
}: ProductGridProps & {
  onAddToWishlist?: (product: Product) => void
  onAddToComparison?: (product: Product) => void
  onProductView?: (product: Product) => void
  wishlist?: Product[]
  comparisonList?: Product[]
}) {
  const { addItem } = useCart()
  const { animationState, triggerAddAnimation, hideNotification } = useCartAnimations()

  // Convert old product format to new format if needed
  const convertProduct = (product: any): Product => {
    // Add safety check for undefined product
    if (!product) {
      console.error('convertProduct called with undefined product')
      throw new Error('Product is undefined')
    }
    
    // If it's already in the new format, return as is
    if (product.id && product.slug) {
      return product
    }

    // Generate slug if missing
    const generateSlug = (title: string, id: string): string => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + `-${id.slice(-6)}`
    }

    const productId = product._id || product.id
    const productTitle = product.name || product.title || 'product'
    const productSlug = product.slug || generateSlug(productTitle, productId)
    
    // Get the primary image using the utility function
    const primaryImage = getProductImageUrl(product, '/placeholder-product.jpg')

    // Convert from old format
    const convertedProduct = {
      id: productId,
      slug: productSlug,
      title: productTitle,
      image: primaryImage,
      images: product.images || [], // Pass through the full images array
      rating: product.rating,
      reviewCount: product.reviewsCount || product.reviewCount,
      price: product.price || 0,
      compareAtPrice: product.compareAtPrice,
      inStock: product.inStock !== false,
      badges: product.badges || [],
      variants: product.variants?.map((v: any) => {
        // Get variant image using the utility function
        const variantImage = getImageUrl(v.image || product.images?.[0] || primaryImage, primaryImage)
        
        return {
          id: v._id || v.id || `variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          colorName: v.name || v.colorName,
          colorHex: v.colorHex || v.value,
          image: variantImage,
          price: v.price || product.price,
          compareAtPrice: v.compareAtPrice || product.compareAtPrice,
          inStock: (v.stock || product.stock || 0) > 0
        }
      }) || [],
      description: product.description,
      category: product.category,
      brand: product.brand,
      tags: product.tags || []
    }
    
    console.log('ProductGrid - original product:', product)
    console.log('ProductGrid - converted product inStock:', convertedProduct.inStock)
    console.log('ProductGrid - original product inStock:', product.inStock)
    console.log('ProductGrid - original product stock:', product.stock)
    
    return convertedProduct
  }

  // Convert all products once for consistent data
  const convertedProducts = useMemo(() => {
    return products.map(product => convertProduct(product))
  }, [products])

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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

  const handleAddToCart = (payload: { productId: string; variantId?: string; qty: number }) => {
    console.log('handleAddToCart called with payload:', payload)
    console.log('Available converted products:', convertedProducts.map(p => ({ id: p.id, title: p.title })))
    
    const product = convertedProducts.find(p => p.id === payload.productId)
    console.log('Found product:', product)
    
    if (!product) {
      console.error('Product not found with ID:', payload.productId)
      console.error('Available product IDs:', convertedProducts.map(p => p.id))
      return
    }
    
    // Use the same image URL that's displayed on the shop page
    const displayImage = getProductImageUrl(product, '/placeholder-product.jpg')
    console.log('Display image (processed):', displayImage)
    
    const cartItem = {
      id: payload.productId,
      name: product.title,
      price: product.price,
      quantity: payload.qty,
      image: displayImage, // Use the processed image URL
      category: product.category || 'Product'
    }

    console.log('Final cart item:', cartItem)
    addItem(cartItem)
    triggerAddAnimation(cartItem)
  }

  return (
    <>
      <div
        dir={dir}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 items-stretch ${className}`}
      >
        {convertedProducts.map((product, index) => (
          <BundleStyleProductCard
            key={product.id || `product-${index}`}
            product={product}
            dir={dir}
            onAddToCart={handleAddToCart}
            onAddToWishlist={onAddToWishlist}
            onAddToComparison={onAddToComparison}
            onProductView={onProductView}
            isInWishlist={wishlist.some(p => p.id === product.id)}
            isInComparison={comparisonList.some(p => p.id === product.id)}
          />
        ))}
      </div>

      {/* Cart Notification */}
      <CartNotification
        item={animationState.lastAddedItem}
        isVisible={animationState.showNotification}
        onClose={hideNotification}
        onViewCart={() => {
          // Don't navigate automatically - just close the notification
          hideNotification()
        }}
      />
    </>
  )
}