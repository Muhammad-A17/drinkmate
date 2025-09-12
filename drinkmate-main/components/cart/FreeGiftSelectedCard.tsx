"use client"

import Image from "next/image"
import { Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FreeGiftProduct } from "@/lib/freeGift"
import SaudiRiyalSymbol from "@/components/ui/SaudiRiyalSymbol"

interface FreeGiftSelectedCardProps {
  item: FreeGiftProduct
  onReplace: () => void
  onRemove?: () => void
  className?: string
}

export default function FreeGiftSelectedCard({ 
  item, 
  onReplace, 
  onRemove,
  className = "" 
}: FreeGiftSelectedCardProps) {
  return (
    <div className={`rounded-2xl border border-emerald-200 bg-emerald-50 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-4 w-4 text-emerald-600" />
        <h3 className="font-semibold text-emerald-900 text-sm">Free Gift Selected</h3>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
            {item.name}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 line-through">
              <span className="flex items-center gap-1">
                {item.originalPrice} <SaudiRiyalSymbol size="xs" />
              </span>
            </span>
            <span className="text-xs font-semibold text-emerald-600">FREE</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 px-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            onClick={onReplace}
          >
            Change
          </Button>
          {onRemove && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2 text-red-600 hover:bg-red-50"
              onClick={onRemove}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
