"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Filter, 
  Grid3X3, 
  List, 
  ShoppingCart,
  SortAsc,
  SortDesc
} from 'lucide-react'

interface MobileStickyBarProps {
  onFilterToggle: () => void
  onViewModeChange: (mode: 'grid' | 'list') => void
  onSortToggle: () => void
  viewMode: 'grid' | 'list'
  activeFilters: number
  cartItemCount: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  isRTL?: boolean
}

export default function MobileStickyBar({
  onFilterToggle,
  onViewModeChange,
  onSortToggle,
  viewMode,
  activeFilters,
  cartItemCount,
  sortBy,
  sortOrder,
  isRTL = false
}: MobileStickyBarProps) {
  const getSortLabel = () => {
    switch (sortBy) {
      case 'popularity':
        return 'Popularity'
      case 'price':
        return sortOrder === 'asc' ? 'Price: Low to High' : 'Price: High to Low'
      case 'newest':
        return 'Newest'
      case 'rating':
        return 'Rating'
      default:
        return 'Sort'
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Filters Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onFilterToggle}
          className="flex items-center gap-2 flex-1 max-w-[120px]"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {activeFilters}
            </Badge>
          )}
        </Button>

        {/* Sort Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSortToggle}
          className="flex items-center gap-2 flex-1 max-w-[120px]"
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="w-4 h-4" />
          ) : (
            <SortDesc className="w-4 h-4" />
          )}
          <span className="truncate">{getSortLabel()}</span>
        </Button>

        {/* View Toggle */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-none border-0 px-3"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-none border-0 px-3"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Cart Button */}
        <Button
          variant="default"
          size="sm"
          className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white flex items-center gap-2 flex-1 max-w-[120px]"
        >
          <ShoppingCart className="w-4 h-4" />
          Cart
          {cartItemCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs bg-white text-[#12d6fa]">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  )
}
