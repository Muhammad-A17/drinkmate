"use client"

import { useEffect } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { fmt } from "@/lib/money"
import SaudiRiyalSymbol from "@/components/ui/SaudiRiyalSymbol"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FreeShippingBarProps {
  subtotal: number
  threshold: number
  className?: string
}

export default function FreeShippingBar({ subtotal, threshold, className = "" }: FreeShippingBarProps) {
  const percentage = Math.min(100, Math.max(0, (subtotal / threshold) * 100))
  const remaining = Math.max(0, threshold - subtotal)
  const isUnlocked = remaining <= 0

  // Create a spring value that starts at 0
  const springValue = useSpring(0, { 
    stiffness: 140, 
    damping: 22, 
    mass: 0.6 
  })

  // Update the spring value when percentage changes
  useEffect(() => {
    springValue.set(percentage)
  }, [percentage, springValue])

  // Transform the spring value to a percentage string
  const width = useTransform(springValue, (value) => `${value}%`)

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm sm:text-base text-black/70" aria-live="polite">
        {isUnlocked ? (
          <span className="text-emerald-600 font-medium">
            🎉 You've unlocked free shipping!
          </span>
        ) : (
          <>
            Only <strong className="font-semibold tabular-nums text-sky-600 flex items-center gap-1">
              {fmt(remaining, 'SAR')} <SaudiRiyalSymbol size="sm" className="text-sky-600" />
            </strong> away from free shipping
          </>
        )}
      </p>
      
      <div 
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={threshold}
        aria-valuenow={Math.min(subtotal, threshold)}
        aria-valuetext={`${isUnlocked ? 'Free shipping unlocked' : `${fmt(remaining, 'SAR')} away from free shipping`}`}
        className="relative h-2 rounded-full bg-black/10 overflow-hidden"
      >
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${
            isUnlocked ? 'bg-emerald-500' : 'bg-sky-500'
          }`}
          style={{ width }}
        />
        {/* Subtle shine effect */}
        <div 
          className="pointer-events-none absolute inset-0 -translate-x-full animate-[shine_1.6s_ease_infinite]"
          style={{ 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent)' 
          }} 
        />
      </div>
    </div>
  )
}
