"use client"

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  X, 
  ChevronDown,
  SortAsc,
  SortDesc,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Zap,
  SlidersHorizontal
} from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface ShopToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onFilterToggle: () => void
  showFilters: boolean
  productCount: number
  totalProducts: number
  activeFilters: number
  onClearFilters: () => void
  isRTL?: boolean
}

const sortOptions = [
  { value: 'popularity', label: 'Most Popular', icon: <TrendingUp className="w-4 h-4" />, description: 'Best selling products' },
  { value: 'price-asc', label: 'Price: Low to High', icon: <SortAsc className="w-4 h-4" />, description: 'Cheapest first' },
  { value: 'price-desc', label: 'Price: High to Low', icon: <SortDesc className="w-4 h-4" />, description: 'Most expensive first' },
  { value: 'newest', label: 'Newest First', icon: <Clock className="w-4 h-4" />, description: 'Recently added' },
  { value: 'rating', label: 'Highest Rated', icon: <Star className="w-4 h-4" />, description: 'Best reviews first' }
]

export default function ShopToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  onFilterToggle,
  showFilters,
  productCount,
  totalProducts,
  activeFilters,
  onClearFilters,
  isRTL = false
}: ShopToolbarProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300)

  // Update parent when debounced query changes
  React.useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      onSearchChange(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, onSearchChange, searchQuery])

  const handleSortChange = useCallback((value: string) => {
    if (value.includes('-')) {
      const [field, order] = value.split('-')
      onSortChange(field, order as 'asc' | 'desc')
    } else {
      onSortChange(value, 'desc')
    }
  }, [onSortChange])

  const getSortValue = () => {
    if (sortBy === 'price') {
      return `price-${sortOrder}`
    }
    return sortBy
  }

  const getCurrentSortOption = () => {
    return sortOptions.find(option => option.value === getSortValue()) || sortOptions[0]
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          {/* Left Section: Search & Filters */}
          <div className="flex flex-1 items-center gap-4 w-full lg:w-auto">
            {/* Enhanced Search Input */}
            <div className="relative flex-1 max-w-lg">
              <div className={`
                relative transition-all duration-300
                ${isSearchFocused ? 'scale-105' : 'scale-100'}
              `}>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-200" />
                <Input
                  type="text"
                  placeholder="Search for products, brands, or categories..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`
                    pl-12 pr-4 py-3 h-12 text-base
                    border-2 border-gray-200 rounded-xl
                    focus:border-brand-500 focus:ring-4 focus:ring-brand-100
                    transition-all duration-300
                    bg-gray-50/50 hover:bg-white
                    ${isSearchFocused ? 'bg-white shadow-lg' : ''}
                  `}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {localSearchQuery && (
                  <button
                    onClick={() => setLocalSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Search Suggestions (placeholder for future enhancement) */}
              {isSearchFocused && localSearchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-2">
                  <div className="text-sm text-gray-500 p-3">
                    Search suggestions will appear here...
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Filter Button (Mobile) */}
            <Button
              variant="outline"
              onClick={onFilterToggle}
              className={`
                lg:hidden flex items-center gap-3 px-4 py-3 h-12
                border-2 border-gray-200 rounded-xl
                hover:border-brand-500 hover:bg-brand-50
                transition-all duration-300
                ${activeFilters > 0 ? 'border-brand-500 bg-brand-50' : ''}
              `}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              {activeFilters > 0 && (
                <Badge className="bg-brand-500 text-white px-2 py-1 text-xs font-bold">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </div>

          {/* Right Section: Results Count, Sort, View Toggle */}
          <div className="flex items-center gap-6">
            {/* Enhanced Results Count */}
            <div className="text-sm text-gray-600 hidden md:block">
              <span className="font-semibold text-gray-900">{productCount}</span>
              <span className="mx-1">of</span>
              <span className="font-semibold text-gray-900">{totalProducts}</span>
              <span className="ml-1">products</span>
            </div>

            {/* Enhanced Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Sort by:</span>
              <Select value={getSortValue()} onValueChange={handleSortChange}>
                <SelectTrigger className="w-56 h-12 border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 bg-gray-50/50 hover:bg-white transition-all duration-300">
                  <div className="flex items-center gap-3">
                    {getCurrentSortOption().icon}
                    <span className="font-medium">{getCurrentSortOption().label}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="py-3">
                      <div className="flex items-center gap-3">
                        {option.icon}
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced View Toggle */}
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className={`
                  h-12 px-4 rounded-none border-0 transition-all duration-300
                  ${viewMode === 'grid' 
                    ? 'bg-brand-500 text-white shadow-md' 
                    : 'hover:bg-white text-gray-600'
                  }
                `}
              >
                <Grid3X3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className={`
                  h-12 px-4 rounded-none border-0 transition-all duration-300
                  ${viewMode === 'list' 
                    ? 'bg-brand-500 text-white shadow-md' 
                    : 'hover:bg-white text-gray-600'
                  }
                `}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Active Filters Row */}
        {activeFilters > 0 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              <Badge className="bg-brand-500 text-white px-4 py-2 text-sm font-semibold">
                {activeFilters} filter{activeFilters > 1 ? 's' : ''} applied
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
