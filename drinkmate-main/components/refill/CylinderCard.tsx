"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

interface CylinderCardProps {
  selected: boolean
  title: string
  price: number
  originalPrice?: number
  discount?: number
  icon: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

export default function CylinderCard({ 
  selected, 
  title, 
  price, 
  originalPrice,
  discount,
  icon, 
  onClick, 
  disabled = false,
  className = ""
}: CylinderCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full rounded-2xl border p-4 text-left transition-all duration-200 group",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200",
        selected 
          ? "border-emerald-400 ring-2 ring-emerald-200 bg-emerald-50/50" 
          : "border-black/10 hover:border-black/20 bg-white",
        disabled && "opacity-50 cursor-not-allowed",
        className
      ].join(" ")}
      aria-pressed={selected}
      aria-disabled={disabled}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <Image 
            src={icon} 
            alt={`${title} cylinder`} 
            width={32} 
            height={32}
            className="object-contain"
          />
          {selected && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-black truncate">{title}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-emerald-600">
              <SaudiRiyal amount={price} size="sm" />
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-gray-500 line-through">
                <SaudiRiyal amount={originalPrice} size="sm" />
              </span>
            )}
            {discount && discount > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
