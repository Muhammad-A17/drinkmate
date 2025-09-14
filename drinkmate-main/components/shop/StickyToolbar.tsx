"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Grid3X3, 
  List, 
  X, 
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StickyToolbarProps {
  resultCount: number
  totalCount: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
  activeFilters: number
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  onViewModeChange: (viewMode: 'grid' | 'list') => void
  onClearFilters: () => void
  onToggleFilters: () => void
  isRTL?: boolean
}

export default function StickyToolbar({
  resultCount,
  totalCount,
  sortBy,
  sortOrder,
  viewMode,
  activeFilters,
  onSortChange,
  onViewModeChange,
  onClearFilters,
  onToggleFilters,
  isRTL = false
}: StickyToolbarProps) {
  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' },
    { value: 'newest', label: 'Newest' }
  ]

  const handleSortChange = (value: string) => {
    if (value === 'price_asc') {
      onSortChange('price', 'asc')
    } else if (value === 'price_desc') {
      onSortChange('price', 'desc')
    } else {
      onSortChange(value, 'desc')
    }
  }

  const getSortValue = () => {
    if (sortBy === 'price') {
      return sortOrder === 'asc' ? 'price_asc' : 'price_desc'
    }
    return sortBy
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Results count and filters */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">{resultCount}</span> of{' '}
              <span className="font-medium text-gray-900">{totalCount}</span> products
            </div>
            
            {activeFilters > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all ({activeFilters})
              </Button>
            )}
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className="md:hidden"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
              {activeFilters > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilters}
                </Badge>
              )}
            </Button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
              <Select value={getSortValue()} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-r-none border-r border-gray-200"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
