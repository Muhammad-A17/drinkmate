"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Truck, Shield, Award, Sparkles } from 'lucide-react'

interface ShopHeroProps {
  title?: string
  subtitle?: string
  trustChips?: Array<{
    icon: React.ReactNode
    text: string
    color: string
  }>
  isRTL?: boolean
}

const defaultTrustChips = [
  {
    icon: <Truck className="w-4 h-4" />,
    text: "Free delivery over 200 SAR",
    color: "bg-green-100 text-green-800 border-green-200"
  },
  {
    icon: <Shield className="w-4 h-4" />,
    text: "100% Original",
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    icon: <Award className="w-4 h-4" />,
    text: "Easy Returns",
    color: "bg-amber-100 text-amber-800 border-amber-200"
  }
]

export default function ShopHero({ 
  title = "Premium DrinkMate Products",
  subtitle = "Discover our carefully curated collection of premium soda makers, flavors, and accessories",
  trustChips = defaultTrustChips,
  isRTL = false
}: ShopHeroProps) {
  return (
    <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-6">
          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {title}
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] mx-auto rounded-full"></div>
          </div>

          {/* Value Proposition */}
          <p className={`text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
            {subtitle}
          </p>

          {/* Trust Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {trustChips.map((chip, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`${chip.color} px-4 py-2 text-sm font-medium border transition-all duration-200 hover:scale-105`}
              >
                <span className="flex items-center gap-2">
                  {chip.icon}
                  {chip.text}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
