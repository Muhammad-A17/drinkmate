"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface ColorOption {
  value: string
  label: string
  swatch: string
  inStock?: boolean
}

interface ColorSwatchesProps {
  options: ColorOption[]
  selected?: string
  onSelect: (value: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ColorSwatches({ 
  options, 
  selected, 
  onSelect, 
  className = "",
  size = 'md'
}: ColorSwatchesProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  if (!options || options.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          aria-label={`Select ${option.label}`}
          onClick={() => onSelect(option.value)}
          disabled={option.inStock === false}
          className={cn(
            "rounded-full ring-1 ring-black/10 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
            sizeClasses[size],
            selected === option.value 
              ? "ring-2 ring-sky-500 scale-105" 
              : "hover:ring-black/20",
            option.inStock === false && "opacity-40 cursor-not-allowed"
          )}
          style={{ backgroundColor: option.swatch }}
          title={`${option.label}${option.inStock === false ? ' (Out of Stock)' : ''}`}
        />
      ))}
    </div>
  )
}

interface SizeSwatchesProps {
  options: Array<{
    value: string
    label: string
    inStock?: boolean
  }>
  selected?: string
  onSelect: (value: string) => void
  className?: string
}

export function SizeSwatches({ 
  options, 
  selected, 
  onSelect, 
  className = ""
}: SizeSwatchesProps) {
  if (!options || options.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          disabled={option.inStock === false}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
            selected === option.value
              ? "border-sky-500 bg-sky-50 text-sky-700"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
            option.inStock === false && "opacity-40 cursor-not-allowed bg-gray-100"
          )}
          title={`${option.label}${option.inStock === false ? ' (Out of Stock)' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}






