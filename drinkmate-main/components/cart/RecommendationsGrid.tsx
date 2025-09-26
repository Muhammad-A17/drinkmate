"use client"

import Image from "next/image"
import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { fmt } from "@/lib/money"
import SaudiRiyalSymbol from "@/components/ui/SaudiRiyalSymbol"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils/image-utils"

interface Recommendation {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  reviews: number
  rating: number
}

interface RecommendationsGridProps {
  items: Recommendation[]
  maxItems?: number
  onAddToCart: (item: Recommendation) => void
  className?: string
}

function RecCard({ product, onAddToCart }: { product: Recommendation; onAddToCart: (item: Recommendation) => void }) {
  const [isAdding, setIsAdding] = useState(false)

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const handleAdd = async () => {
    setIsAdding(true)
    try {
      await onAddToCart(product)
      toast.success(`${product.name} added to cart`, {
        duration: 3000,
      })
    } catch (error) {
      toast.error("Failed to add item to cart")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,.08)] transition-all duration-200">
      <div className="rounded-xl bg-white/70 aspect-[4/3] grid place-items-center mb-3 overflow-hidden">
        <Image
          src={getImageUrl(product.image)}
          alt={product.name || 'Product'}
          width={120}
          height={90}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>

      <h3 className="font-semibold leading-snug line-clamp-2 text-black text-sm mb-2">
        {product.name}
      </h3>

      <div className="flex items-center gap-2 text-sm mb-3">
        <div className="flex text-yellow-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-xs">★</span>
          ))}
        </div>
        <span className="text-xs text-gray-600">({product.reviews})</span>
      </div>

      <div className="mt-1 flex items-center gap-2 text-sm mb-3">
        <span className="font-semibold tabular-nums text-black flex items-center gap-1">
          {fmt(product.price, 'SAR')} <SaudiRiyalSymbol size="sm" />
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <>
            <s className="text-black/40 tabular-nums text-xs flex items-center gap-1">
              {fmt(product.originalPrice, 'SAR')} <SaudiRiyalSymbol size="xs" />
            </s>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-medium">
              {discount}% OFF
            </span>
          </>
        )}
      </div>

      <Button
        onClick={handleAdd}
        disabled={isAdding}
        className="h-10 w-full rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 active:scale-95 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 transition-all duration-200"
      >
        {isAdding ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Adding…
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} />
            Add
          </div>
        )}
      </Button>
    </article>
  )
}

export default function RecommendationsGrid({ 
  items, 
  maxItems = 3, 
  onAddToCart,
  className = "" 
}: RecommendationsGridProps) {
  const data = (items ?? []).slice(0, maxItems)
  
  if (!data.length) return null

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}>
      {data.map((product) => (
        <RecCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}
