"use client"

import Image from "next/image"
import { useState } from "react"
import { Trash2, Bookmark } from "lucide-react"
import { fmt } from "@/lib/money"
import QuantityControl from "./QuantityControl"
import { toast } from "sonner"

interface CartLineItemProps {
  item: {
    id: string | number
    name: string
    price: number
    quantity: number
    image: string
    category?: string
  }
  onQuantityChange: (id: string | number, quantity: number) => void
  onRemove: (id: string | number) => void
  onSaveForLater: (item: any) => void
  className?: string
}

export default function CartLineItem({
  item,
  onQuantityChange,
  onRemove,
  onSaveForLater,
  className = ""
}: CartLineItemProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [isHighlighting, setIsHighlighting] = useState(false)

  const handleRemove = () => {
    setIsRemoving(true)
    onRemove(item.id)
    toast.success(`${item.name} removed from cart`, {
      duration: 3000,
    })
  }

  const handleSaveForLater = () => {
    onSaveForLater(item)
    toast.success(`${item.name} saved for later`, {
      duration: 3000,
    })
  }

  const handleQuantityChange = (newQuantity: number) => {
    // Trigger highlight animation
    setIsHighlighting(true)
    setTimeout(() => setIsHighlighting(false), 120)
    
    onQuantityChange(item.id, newQuantity)
  }

  const lineTotal = item.price * item.quantity

  return (
    <article 
      className={`grid grid-cols-[88px_1fr_auto_auto] rtl:grid-cols-[auto_auto_1fr_88px] items-center gap-4 p-4 rounded-2xl border border-black/10 bg-white transition-all duration-300 ${
        isRemoving ? 'opacity-50 scale-95' : 'hover:shadow-md'
      } ${className}`}
    >
      {/* Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-black/10 bg-white">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          className="object-contain p-2"
          sizes="88px"
        />
      </div>

      {/* Product Info */}
      <div className="min-w-0">
        <h3 className="font-semibold leading-tight text-black text-sm md:text-base truncate">
          {item.name}
        </h3>
        <div className="text-sm text-black/60 mt-1">
          {item.category && `${item.category} • `}
          Unit price: {fmt(item.price, 'SAR')}
        </div>
        <div className="mt-2 flex gap-3 text-sm">
          <button 
            onClick={handleSaveForLater}
            className="flex items-center gap-1 text-sky-700 hover:text-sky-800 hover:underline transition-colors duration-200"
            disabled={isRemoving}
          >
            <Bookmark size={14} />
            Save for later
          </button>
          <button 
            onClick={handleRemove}
            className="flex items-center gap-1 text-black/60 hover:text-red-600 hover:underline transition-colors duration-200"
            disabled={isRemoving}
          >
            <Trash2 size={14} />
            Remove
          </button>
        </div>
      </div>

      {/* Quantity Control */}
      <div className="flex justify-center">
        <QuantityControl
          quantity={item.quantity}
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemove}
          min={1}
          max={10}
          disabled={isRemoving}
          productName={item.name}
        />
      </div>

      {/* Line Total */}
      <div className="text-right rtl:text-left">
        <div className="text-sm text-black/60 mb-1">Line total</div>
        <div className={`text-sm text-black/80 font-semibold tabular-nums transition-all duration-120 ${
          isHighlighting ? 'bg-yellow-50 animate-pulse' : ''
        }`}>
          {fmt(lineTotal, 'SAR')}
        </div>
      </div>
    </article>
  )
}
