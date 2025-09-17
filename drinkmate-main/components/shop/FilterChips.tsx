"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Tag, DollarSign, Star, Shield, Zap, Award, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterChipsProps {
  filters: {
    category: string
    priceRange: [number, number]
    brand: string[]
    rating: number
    inStock: boolean
    isNewProduct: boolean
    isBestSeller: boolean
    isOnSale: boolean
    searchQuery: string
  }
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
  isRTL?: boolean
}

export default function FilterChips({
  filters,
  onFiltersChange,
  onClearFilters,
  isRTL = false
}: FilterChipsProps) {
  const getActiveFilters = () => {
    const activeFilters = []

    // Category filter
    if (filters.category !== 'all') {
      activeFilters.push({
        key: 'category',
        label: `Category: ${filters.category}`,
        icon: <Tag className="w-3 h-3" />,
        color: 'bg-blue-100 text-blue-700 border-blue-200'
      })
    }

    // Price range filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
      activeFilters.push({
        key: 'priceRange',
        label: `Price: ${filters.priceRange[0]} - ${filters.priceRange[1]} SAR`,
        icon: <DollarSign className="w-3 h-3" />,
        color: 'bg-green-100 text-green-700 border-green-200'
      })
    }

    // Brand filters
    filters.brand.forEach(brand => {
      activeFilters.push({
        key: `brand-${brand}`,
        label: `Brand: ${brand}`,
        icon: <Award className="w-3 h-3" />,
        color: 'bg-purple-100 text-purple-700 border-purple-200'
      })
    })

    // Rating filter
    if (filters.rating > 0) {
      activeFilters.push({
        key: 'rating',
        label: `${filters.rating}+ Stars`,
        icon: <Star className="w-3 h-3" />,
        color: 'bg-amber-100 text-amber-700 border-amber-200'
      })
    }

    // Stock filter
    if (filters.inStock) {
      activeFilters.push({
        key: 'inStock',
        label: 'In Stock Only',
        icon: <Shield className="w-3 h-3" />,
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
      })
    }

    // Special offers
    if (filters.isNewProduct) {
      activeFilters.push({
        key: 'isNewProduct',
        label: 'New Products',
        icon: <Clock className="w-3 h-3" />,
        color: 'bg-green-100 text-green-700 border-green-200'
      })
    }

    if (filters.isBestSeller) {
      activeFilters.push({
        key: 'isBestSeller',
        label: 'Best Sellers',
        icon: <Award className="w-3 h-3" />,
        color: 'bg-amber-100 text-amber-700 border-amber-200'
      })
    }

    if (filters.isOnSale) {
      activeFilters.push({
        key: 'isOnSale',
        label: 'On Sale',
        icon: <Zap className="w-3 h-3" />,
        color: 'bg-red-100 text-red-700 border-red-200'
      })
    }

    // Search query
    if (filters.searchQuery) {
      activeFilters.push({
        key: 'searchQuery',
        label: `Search: "${filters.searchQuery}"`,
        icon: <Tag className="w-3 h-3" />,
        color: 'bg-gray-100 text-gray-700 border-gray-200'
      })
    }

    return activeFilters
  }

  const handleRemoveFilter = (filterKey: string) => {
    if (filterKey === 'category') {
      onFiltersChange({ ...filters, category: 'all' })
    } else if (filterKey === 'priceRange') {
      onFiltersChange({ ...filters, priceRange: [0, 10000] })
    } else if (filterKey.startsWith('brand-')) {
      const brandToRemove = filterKey.replace('brand-', '')
      onFiltersChange({ 
        ...filters, 
        brand: filters.brand.filter(b => b !== brandToRemove) 
      })
    } else if (filterKey === 'rating') {
      onFiltersChange({ ...filters, rating: 0 })
    } else if (filterKey === 'inStock') {
      onFiltersChange({ ...filters, inStock: false })
    } else if (filterKey === 'isNewProduct') {
      onFiltersChange({ ...filters, isNewProduct: false })
    } else if (filterKey === 'isBestSeller') {
      onFiltersChange({ ...filters, isBestSeller: false })
    } else if (filterKey === 'isOnSale') {
      onFiltersChange({ ...filters, isOnSale: false })
    } else if (filterKey === 'searchQuery') {
      onFiltersChange({ ...filters, searchQuery: '' })
    }
  }

  const activeFilters = getActiveFilters()

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-brand-50/30 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Active Filters ({activeFilters.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-gray-500 hover:text-gray-700 text-xs"
        >
          Clear All
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant="outline"
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105",
              filter.color
            )}
          >
            <span className="flex items-center gap-1.5">
              {filter.icon}
              {filter.label}
            </span>
            <button
              onClick={() => handleRemoveFilter(filter.key)}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors duration-200"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}