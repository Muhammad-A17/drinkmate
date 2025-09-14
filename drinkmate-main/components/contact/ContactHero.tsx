"use client"

import React, { useState } from 'react'
import { Search, Package, RefreshCw, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ContactHeroProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  isRTL: boolean
}

export default function ContactHero({ searchQuery, onSearchChange, isRTL }: ContactHeroProps) {
  const [isSearching, setIsSearching] = useState(false)

  const quickLinks = [
    {
      label: 'Track Order',
      labelAr: 'تتبع الطلب',
      icon: Package,
      href: '/track-order',
      description: 'Check your order status',
      descriptionAr: 'تحقق من حالة طلبك'
    },
    {
      label: 'Refill & Exchange',
      labelAr: 'إعادة التعبئة والاستبدال',
      icon: RefreshCw,
      href: '/refill-cylinder',
      description: 'CO₂ cylinder services',
      descriptionAr: 'خدمات أسطوانات ثاني أكسيد الكربون'
    },
    {
      label: 'Warranty & Returns',
      labelAr: 'الضمان والإرجاع',
      icon: Shield,
      href: '/warranty',
      description: 'Product support',
      descriptionAr: 'دعم المنتج'
    }
  ]

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    // TODO: Implement search functionality
    setTimeout(() => setIsSearching(false), 1000)
  }

  return (
    <div className="text-center space-y-8">
      {/* Hero Headline */}
      <div className="space-y-4">
        <h1 className={`text-4xl lg:text-5xl font-bold text-gray-900 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
          Get in touch
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Search answers or choose a way to contact us. We'll help you get sorted fast.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search FAQs, help articles, or ask a question..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-xl"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <Button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-lg"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {quickLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-brand hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-brand/10 rounded-lg flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                  <link.icon className="h-6 w-6 text-brand" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-brand transition-colors">
                  {isRTL ? link.labelAr : link.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isRTL ? link.descriptionAr : link.description}
                </p>
                <div className="flex items-center mt-2 text-brand text-sm font-medium group-hover:gap-2 transition-all">
                  <span>{isRTL ? 'اعرف المزيد' : 'Learn more'}</span>
                  <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
