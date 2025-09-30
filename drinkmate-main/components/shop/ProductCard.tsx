"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useMemo } from "react"
import { Price, PriceWithBadge } from "./Price"
import { ColorSwatches } from "./ColorSwatches"
import { QuickView } from "./CardFooter"
import { ProductCardProps, Product } from "@/lib/types"

// Define Variant interface locally since it was removed
interface Variant {
  id: string
  colorName?: string
  colorHex?: string
  image?: string
  price: number
  compareAtPrice?: number
  inStock: boolean
}
import { cn } from "@/lib/utils"
import { Heart, Eye, ShoppingCart, Star, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import YouTubeThumbnail from "@/components/ui/YouTubeThumbnail"

// Helper function to generate correct product URL based on category
const getProductUrl = (product: Product): string => {
  if (!product.slug) return '/shop'
  
  // Get category name (handle both string and object formats)
  const categoryName = typeof product.category === 'string' 
    ? product.category 
    : product.category?.name || ''
  
  const category = categoryName.toLowerCase()
  
  // Handle bundles (check if product has bundle-related properties)
  if (product.subcategory?.toLowerCase().includes('bundle') || 
      product.name?.toLowerCase().includes('bundle') ||
      product.title?.toLowerCase().includes('bundle')) {
    if (category === 'flavors') return `/shop/flavor/bundles/${product.slug}`
    if (category === 'accessories') return `/shop/accessories/bundles/${product.slug}`
    if (category === 'sodamakers') return `/shop/sodamakers/bundles/${product.slug}`
    return `/shop/${category}/bundles/${product.slug}`
  }
  
  // Handle regular products
  if (category === 'flavors') return `/shop/flavor/${product.slug}`
  if (category === 'accessories') return `/shop/accessories/${product.slug}`
  if (category === 'co2-cylinders' || category === 'co2') return `/shop/co2-cylinders/${product.slug}`
  if (category === 'sodamakers') return `/shop/sodamakers/${product.slug}`
  
  // Fallback to generic shop URL
  return `/shop/${product.slug}`
}

export default function ProductCard({
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

  // Default selected variant: first in-stock, otherwise first available
  const firstAvailable = useMemo(
    () => product.variants?.find(v => v.inStock) ?? product.variants?.[0],
    [product.variants]
  )
  const [selected, setSelected] = useState<Variant | undefined>(firstAvailable)
  const [qty, setQty] = useState(1)
  const [showQuickView, setShowQuickView] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)

  // Get the best available image
  const getBestImage = () => {
    let imageUrl = ""
    
    // First try selected variant image
    if (selected?.image) {
      imageUrl = selected.image
    }
    // Then try product.image (singular - from API mapping)
    else if (product.image) {
      imageUrl = product.image
    }
    // Then try product.images array (plural - from API)
    else if ((product as any).images && Array.isArray((product as any).images)) {
      const images = (product as any).images
      // Find primary image first
      const primaryImage = images.find((img: any) => img.isPrimary)
      if (primaryImage && primaryImage.url) {
        imageUrl = primaryImage.url
      }
      // Fall back to first image
      else if (images[0] && images[0].url) {
        imageUrl = images[0].url
      }
      // Handle case where images array contains strings
      else if (typeof images[0] === 'string') {
        imageUrl = images[0]
      }
    }
    
    // Convert relative URLs to absolute URLs
    if (imageUrl && !imageUrl.startsWith('http')) {
      if (imageUrl.startsWith('/')) {
        imageUrl = `http://localhost:3000${imageUrl}`
      } else if (imageUrl.trim() !== "" && !imageUrl.includes("undefined")) {
        // Handle cases where the URL might not start with / but is still relative
        imageUrl = `http://localhost:3000/${imageUrl}`
      }
    }
    
    // Return the processed URL or fallback to placeholder
    return imageUrl && imageUrl.trim() !== "" && !imageUrl.includes("undefined") ? imageUrl : "/placeholder.svg"
  }
  
  const activeImage = getBestImage()

  // Debug: Log product data to see if slug exists (commented out for production)
  // console.log('ProductCard Debug:', { 
  //   id: product.id, 
  //   slug: product.slug, 
  //   title: product.title, 
  //   productImage: product.image,
  //   activeImage: activeImage,
  //   selected: selected,
  //   hasVariants: hasVariants,
  //   variants: product.variants,
  //   hasImage: !!activeImage,
  //   imageType: typeof activeImage
  // })

  const onAdd = () => {
    if (!onAddToCart) return
    onAddToCart({
      productId: String(product._id || product.id || ''),
      variantId: selected?.id,
      qty,
    })
  }

  const isSale = (selected?.compareAtPrice ?? product.compareAtPrice) &&
                 (selected?.compareAtPrice ?? 0) > (selected?.price ?? product.price)

  const finalPrice = selected?.price ?? product.price
  const comparePrice = selected?.compareAtPrice ?? product.compareAtPrice

  const percentOff =
    isSale && comparePrice
      ? Math.round(((comparePrice - finalPrice) / comparePrice) * 100)
      : 0

  const isInStock = selected?.inStock ?? product.inStock

  return (
    <div
      dir={dir}
      className={cn(
        "bg-white rounded-3xl overflow-hidden flex flex-col border border-gray-100",
        "hover:border-gray-200 transform hover:-translate-y-1 transition-all duration-300",
        "h-full",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-labelledby={`product-title-${product.id}`}
    >
      {/* Image Container - Covering Upper Side */}
      <Link href={getProductUrl(product)} className="block">
        <div className="relative h-80 bg-gray-50 overflow-hidden mb-6">
          {(() => {
            // Use the improved image selection logic
            const imageUrl = activeImage;
            const isValidUrl = imageUrl && imageUrl !== "/placeholder.svg" && imageUrl.trim() !== "" && !imageUrl.includes("undefined");
            
            // console.log('ProductCard image selection:', {
            //   activeImage,
            //   productImage: product.image,
            //   productImages: (product as any).images,
            //   selectedImageUrl: imageUrl,
            //   isValidUrl
            // });
            
            // If we have a valid URL and no previous error, use YouTubeThumbnail, otherwise show placeholder
            if (isValidUrl && !imageLoadError) {
              return (
                <YouTubeThumbnail
                  url={imageUrl}
                  alt={product.title || product.name || 'Product image'}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  showPlayButton={true}
                  onError={(e) => {
                    const errorInfo = {
                      activeImage,
                      productImage: product.image,
                      productImages: (product as any).images,
                      selected: selected,
                      productId: product.id,
                      productTitle: product.title,
                      errorEvent: e,
                      errorType: typeof e,
                      errorTarget: e?.target,
                      errorCurrentTarget: e?.currentTarget
                    };
                    console.error('ProductCard Image failed to load:', errorInfo);
                    setImageLoadError(true);
                  }}
                  onLoad={() => {
                    // console.log('ProductCard Image loaded successfully:', imageUrl)
                    setImageLoadError(false);
                  }}
                  priority={false}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              );
            } else {
              // Show placeholder directly
              return (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-sm">No image available</div>
                  </div>
                </div>
              );
            }
          })()}
          
          {/* Sale Badge */}
          {!!percentOff && (
            <div className="absolute top-3 right-3">
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {percentOff}% OFF
              </span>
            </div>
          )}

          {/* Product Badges */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.badges.map((badge, index) => (
                <span
                  key={index}
                  className={cn(
                    "rounded-full text-white text-xs px-2 py-1 font-semibold",
                    badge.toLowerCase().includes('new') ? "bg-emerald-500" :
                    badge.toLowerCase().includes('bestseller') ? "bg-amber-500" :
                    badge.toLowerCase().includes('limited') ? "bg-purple-500" :
                    "bg-brand-500"
                  )}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <Link href={getProductUrl(product)}>
          <h3 className="text-xl mb-3 hover:text-brand-600 transition-colors leading-tight cursor-pointer">{product.title}</h3>
        </Link>

        {/* Rating & Reviews */}
        {product.rating && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const ratingValue = typeof product.rating === 'number' 
                  ? product.rating 
                  : product.rating?.average || 0;
                
                return (
                  <Star
                    key={i}
                    className={cn(
                      "w-3.5 h-3.5",
                      i < Math.floor(ratingValue)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                );
              })}
            </div>
            {product.reviewCount && (
              <span className="text-sm text-gray-600">({product.reviewCount} Reviews)</span>
            )}
          </div>
        )}

        {/* Price and CTA */}
        <div className="mt-auto">
          {/* Price with discount */}
          <div className="flex items-center gap-2 mb-2">
            {isSale && comparePrice && (
              <>
                <span className="text-gray-500 text-sm line-through">
                  <Price value={comparePrice} size="sm" />
                </span>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {percentOff}% OFF
                </span>
              </>
            )}
          </div>

          {/* Main price and add to cart */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-xl text-gray-900">
                <Price value={finalPrice} size="md" />
              </span>
            </div>
            <Button
              onClick={onAdd}
              disabled={!isInStock}
              className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white rounded-full w-full sm:w-auto justify-center px-4 sm:px-6 py-2 h-10 text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {!isInStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>

          {/* Variant color swatches */}
          {hasVariants && (
            <div className="mt-3">
              <ColorSwatches
                options={product.variants!.map(v => ({
                  value: v.id,
                  label: v.colorName || 'Variant',
                  swatch: v.colorHex || '#E5E7EB',
                  inStock: v.inStock
                }))}
                selected={selected?.id}
                onSelect={(variantId) => {
                  const variant = product.variants!.find(v => v.id === variantId)
                  if (variant) setSelected(variant)
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickView
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={{
          title: product.title || product.name || '',
          description: product.description,
          price: finalPrice,
          compareAtPrice: comparePrice,
          variants: product.variants
        }}
        onAddToCart={(variantId) => {
          onAdd()
          setShowQuickView(false)
        }}
      />
    </div>
  )
}
