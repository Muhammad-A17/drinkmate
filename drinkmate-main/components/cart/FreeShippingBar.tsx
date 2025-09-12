"use client"

import { motion, useSpring } from "framer-motion"
import { fmt } from "@/lib/money"

interface FreeShippingBarProps {
  subtotal: number
  threshold: number
  className?: string
}

export default function FreeShippingBar({ subtotal, threshold, className = "" }: FreeShippingBarProps) {
  const percentage = Math.min(100, Math.max(0, (subtotal / threshold) * 100))
  const remaining = Math.max(0, threshold - subtotal)
  const isUnlocked = remaining <= 0

  // Smooth spring animation for progress bar
  const width = useSpring(percentage, { 
    stiffness: 140, 
    damping: 22, 
    mass: 0.6 
  })

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm sm:text-base text-black/70" aria-live="polite">
        {isUnlocked ? (
          <span className="text-emerald-600 font-medium">
            🎉 You've unlocked free shipping!
          </span>
        ) : (
          <>
            Only <strong className="font-semibold tabular-nums text-sky-600">{fmt(remaining, 'SAR')}</strong> away from free shipping
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
          style={{ width: width.to(v => `${v}%`) }}
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
