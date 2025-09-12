"use client"

import Image from "next/image"
import { Tag, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FreeGiftProduct } from "@/lib/freeGift"
import SaudiRiyalSymbol from "@/components/ui/SaudiRiyalSymbol"

interface FreeGiftGridProps {
  options: FreeGiftProduct[]
  selectedId?: number | null
  onSelect: (product: FreeGiftProduct) => void
  onReplace?: () => void
  placement?: 'sidebar' | 'main'
  className?: string
}

function GiftCard({ 
  product, 
  isSelected, 
  onSelect 
}: { 
  product: FreeGiftProduct
  isSelected: boolean
  onSelect: (product: FreeGiftProduct) => void 
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-emerald-300 bg-emerald-50' 
          : 'border-emerald-200 hover:border-emerald-300'
      }`}
      onClick={() => !isSelected && onSelect(product)}
    >
      <div className="relative h-24 bg-white rounded-xl mb-3 flex items-center justify-center overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={60}
          height={60}
          className="object-contain"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
        {product.name}
      </h4>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 line-through">
          <span className="flex items-center gap-1">
            {product.originalPrice} <SaudiRiyalSymbol size="xs" />
          </span>
        </div>
        <span className="text-xs font-semibold text-emerald-600">FREE</span>
      </div>
      
      <Button
        size="sm"
        className={`w-full mt-3 text-xs ${
          isSelected 
            ? 'bg-emerald-100 text-emerald-700 cursor-default' 
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        }`}
        disabled={isSelected}
        onClick={(e) => {
          e.stopPropagation()
          if (!isSelected) onSelect(product)
        }}
      >
        {isSelected ? 'Selected ✓' : 'Add Free Item'}
      </Button>
    </div>
  )
}

export default function FreeGiftGrid({ 
  options, 
  selectedId, 
  onSelect, 
  onReplace,
  placement = 'sidebar',
  className = "" 
}: FreeGiftGridProps) {
  const items = options.slice(0, 3) // Cap to max 3 options
  const isSidebar = placement === 'sidebar'
  
  return (
    <section className={`rounded-2xl border p-4 bg-emerald-50/40 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-emerald-600" />
          <h3 className="font-semibold text-emerald-900 text-sm">
            Select a FREE product
          </h3>
        </div>
        {onReplace && selectedId && (
          <button
            onClick={onReplace}
            className="text-xs text-emerald-600 hover:text-emerald-700 underline"
          >
            Change
          </button>
        )}
      </div>
      
      <p className="text-xs text-emerald-700 mb-4">
        You qualify for one free product! Choose from the options below.
      </p>
      
      <div className={`grid gap-3 ${
        isSidebar 
          ? 'grid-cols-1' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {items.map((product) => (
          <GiftCard
            key={product.id}
            product={product}
            isSelected={selectedId === product.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}
