"use client"

import { useState, useEffect } from "react"
import { Minus, Plus } from "lucide-react"

interface QuantityControlProps {
  quantity: number
  onQuantityChange: (newQuantity: number) => void
  min?: number
  max?: number
  className?: string
}

export default function QuantityControl({
  quantity,
  onQuantityChange,
  min = 1,
  max = 10,
  className = ""
}: QuantityControlProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleChange = (newQuantity: number) => {
    if (newQuantity < min || newQuantity > max) return
    
    setIsAnimating(true)
    onQuantityChange(newQuantity)
    
    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 150)
  }

  const decrease = () => handleChange(quantity - 1)
  const increase = () => handleChange(quantity + 1)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quantity Controls */}
      <div className="flex items-center gap-4">
        <button 
          aria-label="Decrease quantity"
          onClick={decrease}
          disabled={quantity <= min}
          className="h-10 w-10 rounded-full border border-black/20 hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
        >
          <Minus className="w-4 h-4 text-black/70" />
        </button>
        
        <span className={`text-xl font-semibold w-8 text-center transition-all duration-150 ${
          isAnimating ? 'scale-110 text-emerald-600' : 'scale-100 text-black'
        }`}>
          {quantity}
        </span>
        
        <button 
          aria-label="Increase quantity"
          onClick={increase}
          disabled={quantity >= max}
          className="h-10 w-10 rounded-full border border-black/20 hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
        >
          <Plus className="w-4 h-4 text-black/70" />
        </button>
      </div>

      {/* Quantity Benefits */}
      <div className="space-y-2">
        {quantity >= 2 && (
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <span className="text-sm font-medium">5% off for 2+ cylinders</span>
          </div>
        )}
        {quantity >= 3 && (
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <span className="text-sm font-medium">10% off for 3+ cylinders</span>
          </div>
        )}
        {quantity >= 4 && (
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <span className="text-sm font-medium">15% off for 4+ cylinders + FREE delivery</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-black/60 space-y-1">
        <p>
          Please return {quantity} empty {quantity > 1 ? 'cylinders' : 'cylinder'}
        </p>
        <p>Estimated delivery time 3-5 business days</p>
      </div>
    </div>
  )
}
