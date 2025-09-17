'use client'

import { cn } from '@/lib/utils'
import RiyalIcon from '@/components/icons/RiyalIcon'

interface PriceProps {
  value: number
  compareAt?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Price({ value, compareAt, size = 'md', className }: PriceProps) {
  // Handle undefined or null values
  const safeValue = value || 0
  const safeCompareAt = compareAt || 0
  const sale = safeCompareAt && safeCompareAt > safeValue
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="inline-flex items-baseline gap-1">
        <RiyalIcon className={iconSizes[size]} />
        <span className={cn("tabular-nums font-semibold", sizeClasses[size])}>
          {safeValue.toFixed(2)}
        </span>
      </span>
      {sale && (
        <span className={cn(
          "text-sm line-through opacity-60 inline-flex items-baseline gap-1",
          sizeClasses[size]
        )}>
          <RiyalIcon className="w-3 h-3" />
          {safeCompareAt.toFixed(2)}
        </span>
      )}
    </div>
  )
}
