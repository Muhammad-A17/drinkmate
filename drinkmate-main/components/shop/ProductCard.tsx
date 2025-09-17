"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useMemo } from "react"
import { Price, PriceWithBadge } from "./Price"
import { ColorSwatches } from "./ColorSwatches"
import { CardFooter, QuickView } from "./CardFooter"
import { ProductCardProps, Variant } from "@/types/product"
import { cn } from "@/lib/utils"

export default function ProductCard({
  product,
  dir = "ltr",
  onAddToCart,
  className,
}: ProductCardProps) {
  const hasVariants = (product.variants?.length ?? 0) > 0

  // Default selected variant: first in-stock, otherwise first available
  const firstAvailable = useMemo(
    () => product.variants?.find(v => v.inStock) ?? product.variants?.[0],
    [product.variants]
  )
  const [selected, setSelected] = useState<Variant | undefined>(firstAvailable)
  const [qty, setQty] = useState(1)
  const [showQuickView, setShowQuickView] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const activeImage = selected?.image || product.image

  const onAdd = () => {
    if (!onAddToCart) return
    onAddToCart({
      productId: product.id,
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
        "group rounded-2xl bg-white/90 backdrop-blur border border-black/5 shadow-sm",
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        "flex flex-col h-full",
        className
      )}
    >
      {/* Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative block overflow-hidden rounded-t-2xl"
        aria-label={product.title}
      >
        {!!percentOff && (
          <span className={cn(
            "absolute z-10 top-3",
            dir === "rtl" ? "left-3" : "right-3",
            "rounded-full bg-rose-500 text-white text-xs px-2 py-1 shadow-sm font-medium"
          )}>
            {percentOff}% OFF
          </span>
        )}

        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className={cn(
            "absolute z-10 top-3",
            dir === "rtl" ? "right-3" : "left-3",
            "flex flex-col gap-1"
          )}>
            {product.badges.map((badge, index) => (
              <span
                key={index}
                className="rounded-full bg-sky-500 text-white text-xs px-2 py-1 shadow-sm font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        <div className="relative aspect-[4/5] w-full">
          <Image
            src={activeImage}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            priority={false}
          />
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Title */}
        <Link
          href={`/shop/${product.slug}`}
          className="line-clamp-2 font-montserrat font-semibold text-neutral-900 hover:text-sky-600 transition-colors"
        >
          {product.title}
        </Link>

        {/* Rating */}
        {typeof product.rating === "number" && (
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                className={cn("w-4 h-4",
                  i < (product.rating ?? 0) ? "fill-current" : "fill-amber-200"
                )}
                aria-hidden="true"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
            {product.reviewCount ? (
              <span className="text-xs text-neutral-500 ms-1">
                ({product.reviewCount})
              </span>
            ) : null}
          </div>
        )}

        {/* Price */}
        <div className="space-y-1">
          <Price 
            value={finalPrice} 
            compareAt={comparePrice}
            size="md"
          />
          {!hasVariants && product.minPrice && product.maxPrice && product.minPrice !== product.maxPrice && (
            <span className="text-sm text-neutral-500">
              From <Price value={product.minPrice} size="sm" />
            </span>
          )}
        </div>

        {/* Variant color swatches */}
        {hasVariants && (
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
            className="mt-1"
          />
        )}

        {/* Stock Status */}
        <div className={cn(
          "text-xs font-medium flex items-center gap-1",
          isInStock ? "text-emerald-600" : "text-rose-600"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isInStock ? "bg-emerald-500" : "bg-rose-500"
          )} />
          {isInStock ? "In stock" : "Out of stock"}
        </div>

        {/* CTA */}
        <CardFooter
          onAddToCart={onAdd}
          onWishlist={() => setIsWishlisted(!isWishlisted)}
          onNotifyMe={() => console.log('Notify me clicked')}
          disabled={!isInStock}
          inStock={isInStock}
          isWishlisted={isWishlisted}
          showQuantity={!hasVariants}
        />
      </div>

      {/* Quick View Modal */}
      <QuickView
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={{
          title: product.title,
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