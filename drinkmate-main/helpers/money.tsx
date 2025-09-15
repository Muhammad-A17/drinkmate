import React from 'react'
import SaudiRiyalSymbol from '@/components/ui/SaudiRiyalSymbol'

interface SARProps {
  value: number
  className?: string
  iconClass?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * SAR Currency Component - Displays amounts with the Saudi Riyal SVG symbol
 * Uses the existing SaudiRiyalSymbol SVG component from the project
 */
export const SAR = ({
  value,
  className = "",
  iconClass = "w-[1.15em] h-[1.15em] -mt-[0.05em]",
  size = 'md'
}: SARProps) => {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <SaudiRiyalSymbol 
        size={size} 
        className={iconClass} 
        color="currentColor"
      />
      {value.toFixed(2)}
    </span>
  )
}

export default SAR

