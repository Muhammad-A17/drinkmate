"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDebouncedCallback } from "use-debounce"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuantityControlProps {
  quantity: number
  onQuantityChange: (newQuantity: number) => void
  onRemove?: () => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  productName?: string
}

// Helper function to sanitize integer input
const sanitizeInt = (value: string): number => {
  const parsed = parseInt(value.replace(/\D/g, '') || '0', 10)
  return isNaN(parsed) ? 0 : Math.max(0, parsed)
}

export default function QuantityControl({
  quantity,
  onQuantityChange,
  onRemove,
  min = 1,
  max = 10,
  disabled = false,
  className = "",
  productName = "item"
}: QuantityControlProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity)
  const [isUpdating, setIsUpdating] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync local state when prop changes
  useEffect(() => {
    setLocalQuantity(quantity)
  }, [quantity])

  // Debounced update to prevent API spam
  const debouncedUpdate = useDebouncedCallback(
    useCallback((newQuantity: number) => {
      if (newQuantity !== quantity) {
        onQuantityChange(newQuantity)
        setIsUpdating(false)
      }
    }, [quantity, onQuantityChange]),
    200
  )

  const handleChange = (newQuantity: number) => {
    if (disabled || newQuantity < min || newQuantity > max) return
    
    setLocalQuantity(newQuantity)
    setIsUpdating(true)
    debouncedUpdate(newQuantity)
  }

  const decrease = () => {
    if (localQuantity <= 1) {
      setConfirmOpen(true)
    } else {
      handleChange(localQuantity - 1)
    }
  }

  const increase = () => {
    handleChange(localQuantity + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInt(e.target.value)
    
    if (sanitizedValue === 0) {
      setConfirmOpen(true)
      return
    }
    
    const clampedValue = Math.max(min, Math.min(max, sanitizedValue))
    setLocalQuantity(clampedValue)
    setIsUpdating(true)
    debouncedUpdate(clampedValue)
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    }
    setConfirmOpen(false)
  }

  // Close confirm dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setConfirmOpen(false)
      }
    }

    if (confirmOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    
    return undefined
  }, [confirmOpen])

  return (
    <div 
      ref={containerRef}
      className={`relative inline-flex items-center gap-2 rtl:flex-row-reverse ${className}`} 
      role="group" 
      aria-label={`Quantity for ${productName}`}
    >
      <button 
        aria-label="Decrease quantity"
        onClick={decrease}
        disabled={disabled}
        className="h-9 w-9 rounded-full border border-black/20 hover:bg-black/5 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
      >
        −
      </button>
      
      <input
        aria-label="Quantity"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={localQuantity}
        onChange={handleInputChange}
        disabled={disabled}
        className={`w-12 text-center border border-black/20 rounded h-9 font-medium tabular-nums ${
          isUpdating ? 'bg-sky-50 border-sky-300' : 'bg-white'
        } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500`}
      />
      
      <button 
        aria-label="Increase quantity"
        onClick={increase}
        disabled={disabled || localQuantity >= max}
        className="h-9 w-9 rounded-full border border-black/20 hover:bg-black/5 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
      >
        +
      </button>

      {/* Remove confirmation dialog */}
      {confirmOpen && (
        <div 
          role="dialog" 
          aria-modal="true"
          className="z-20 absolute mt-10 left-1/2 transform -translate-x-1/2 rounded-xl border border-black/10 bg-white shadow-lg p-3 min-w-[200px]"
        >
          <p className="text-sm mb-2 text-black">Remove this item?</p>
          <div className="flex gap-2 rtl:flex-row-reverse">
            <button 
              className="px-3 h-9 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
              onClick={handleRemove}
            >
              Remove
            </button>
            <button 
              className="px-3 h-9 rounded-lg border border-black/20 hover:bg-black/5 transition-colors duration-200"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
