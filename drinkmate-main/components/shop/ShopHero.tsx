"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Truck, Shield, Award, Sparkles, Star, Zap, Heart } from 'lucide-react'

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
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
  },
  {
    icon: <Shield className="w-4 h-4" />,
    text: "100% Original Products",
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
  },
  {
    icon: <Award className="w-4 h-4" />,
    text: "Easy 30-Day Returns",
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
  },
  {
    icon: <Zap className="w-4 h-4" />,
    text: "Fast & Secure Checkout",
    color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
  }
]

export default function ShopHero({ 
  title = "Premium DrinkMate Products",
  subtitle = "Discover our carefully curated collection of premium soda makers, flavors, and accessories",
  trustChips = defaultTrustChips,
  isRTL = false
}: ShopHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-brand-50/30 py-16 md:py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2304C4DB%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center space-y-8">
          {/* Main Headline */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-sm font-medium border border-brand-200 mb-4">
              <Star className="w-4 h-4 fill-current" />
              <span>Premium Quality Guaranteed</span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {title}
            </h1>
            
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-1 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"></div>
              <Heart className="w-6 h-6 text-brand-500" />
              <div className="w-16 h-1 bg-gradient-to-r from-brand-600 to-brand-500 rounded-full"></div>
            </div>
          </div>

          {/* Value Proposition */}
          <p className={`text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
            {subtitle}
          </p>

          {/* Trust Chips */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
            {trustChips.map((chip, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`${chip.color} px-6 py-3 text-sm font-semibold border-2 transition-all duration-300 hover:scale-105 hover:shadow-md group`}
              >
                <span className="flex items-center gap-2">
                  <span className="group-hover:scale-110 transition-transform duration-200">
                    {chip.icon}
                  </span>
                  {chip.text}
                </span>
              </Badge>
            ))}
          </div>

          {/* Additional Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">4.9★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
