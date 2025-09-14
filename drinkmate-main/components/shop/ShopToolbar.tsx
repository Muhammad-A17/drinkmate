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
  Sparkles
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
  { value: 'popularity', label: 'Popularity', icon: <Sparkles className="w-4 h-4" /> },
  { value: 'price-asc', label: 'Price: Low to High', icon: <SortAsc className="w-4 h-4" /> },
  { value: 'price-desc', label: 'Price: High to Low', icon: <SortDesc className="w-4 h-4" /> },
  { value: 'newest', label: 'Newest', icon: <Sparkles className="w-4 h-4" /> },
  { value: 'rating', label: 'Rating', icon: <Sparkles className="w-4 h-4" /> }
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

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Left Section: Search & Filters */}
          <div className="flex flex-1 items-center gap-4 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border-gray-300 focus:border-[#12d6fa] focus:ring-[#12d6fa]"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Filter Button (Mobile) */}
            <Button
              variant="outline"
              onClick={onFilterToggle}
              className="lg:hidden flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </div>

          {/* Right Section: Results Count, Sort, View Toggle */}
          <div className="flex items-center gap-4">
            {/* Results Count */}
            <div className="text-sm text-gray-600 hidden sm:block">
              Showing <span className="font-medium">{productCount}</span> of <span className="font-medium">{totalProducts}</span> products
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:block">Sort by:</span>
              <Select value={getSortValue()} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-none border-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none border-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Row */}
        {activeFilters > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              <Badge variant="secondary" className="px-3 py-1">
                {activeFilters} filter{activeFilters > 1 ? 's' : ''}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
