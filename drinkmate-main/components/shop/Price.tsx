"use client"

import React from 'react'
import SaudiRiyalSymbol from '@/components/ui/SaudiRiyalSymbol'
import { cn } from '@/lib/utils'

interface PriceProps {
  value: number
  compareAt?: number
  className?: string
  showSavings?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Price({ 
  value, 
  compareAt, 
  className = "",
  showSavings = true,
  size = 'md'
}: PriceProps) {
  const onSale = compareAt && compareAt > value
  const savings = onSale ? (compareAt! - value) : 0
  const savingsPercent = onSale ? Math.round((savings / compareAt!) * 100) : 0

  const sizeClasses = {
    sm: {
      icon: "w-3 h-3",
      price: "text-sm",
      compare: "text-xs",
      savings: "text-xs"
    },
    md: {
      icon: "w-[14px] h-[14px]",
      price: "text-lg",
      compare: "text-sm",
      savings: "text-xs"
    },
    lg: {
      icon: "w-4 h-4",
      price: "text-xl",
      compare: "text-base",
      savings: "text-sm"
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <div className="flex items-baseline gap-1">
        <SaudiRiyalSymbol className={cn(classes.icon, "shrink-0")} />
        <span className={cn("font-semibold tabular-nums", classes.price)}>
          {value.toFixed(2)}
        </span>
      </div>
      
      {onSale && (
        <>
          <span className={cn(
            "line-through text-muted-foreground flex items-baseline gap-1",
            classes.compare
          )}>
            <SaudiRiyalSymbol className={cn(classes.icon, "w-3 h-3")} />
            {compareAt!.toFixed(2)}
          </span>
          
          {showSavings && (
            <span className={cn(
              "text-emerald-600 font-medium",
              classes.savings
            )}>
              Save {savings.toFixed(2)} SAR
            </span>
          )}
        </>
      )}
    </div>
  )
}

export function PriceWithBadge({ 
  value, 
  compareAt, 
  className = "",
  size = 'md'
}: PriceProps) {
  const onSale = compareAt && compareAt > value
  const savingsPercent = onSale ? Math.round(((compareAt! - value) / compareAt!) * 100) : 0

  return (
    <div className={cn("relative", className)}>
      <Price 
        value={value} 
        compareAt={compareAt} 
        showSavings={false}
        size={size}
      />
      
      {onSale && (
        <div className="absolute -top-1 -right-1">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {savingsPercent}% OFF
          </span>
        </div>
      )}
    </div>
  )
}
