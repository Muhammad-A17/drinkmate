import React, { useState } from 'react'
import { Product, Bundle, CO2Cylinder } from '@/lib/types'
import ProductCard from './ProductCard'
import { VIEW_MODES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Grid3X3, 
  List, 
  SlidersHorizontal, 
  SortAsc, 
  SortDesc,
  Filter,
  X,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Star,
  Award
} from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  bundles?: Bundle[]
  cylinders?: CO2Cylinder[]
  viewMode?: 'grid' | 'list'
  loading?: boolean
  onAddToCart?: (item: any) => void
  onAddToWishlist?: (productId: string) => void
  onQuickView?: (product: Product | Bundle | CO2Cylinder) => void
  onViewModeChange?: (mode: 'grid' | 'list') => void
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  onFilterToggle?: () => void
  showFilters?: boolean
  className?: string
  productCount?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  activeFilters?: number
}

export default function ProductGrid({
  products,
  bundles = [],
  cylinders = [],
  viewMode = VIEW_MODES.GRID,
  loading = false,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onViewModeChange,
  onSortChange,
  onFilterToggle,
  showFilters = false,
  className = '',
  productCount = 0,
  sortBy = 'popularity',
  sortOrder = 'desc',
  activeFilters = 0
}: ProductGridProps) {
  const allItems = [...products, ...bundles, ...cylinders]
  const [localViewMode, setLocalViewMode] = useState<'grid' | 'list'>(viewMode)

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setLocalViewMode(mode)
    onViewModeChange?.(mode)
  }

  const handleSortChange = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc'
    onSortChange?.(newSortBy, newSortOrder)
  }

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
  }

  const getSortLabel = (field: string) => {
    const labels: Record<string, string> = {
      popularity: 'Popularity',
      name: 'Name',
      price: 'Price',
      rating: 'Rating',
      createdAt: 'Date Added'
    }
    return labels[field] || field
  }

  const currentViewMode = localViewMode || viewMode

  if (loading) {
    return (
      <div className={className}>
        {/* Loading Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>

        {/* Loading Grid */}
        <div className={`grid gap-6 ${currentViewMode === VIEW_MODES.GRID ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-xl mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (allItems.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms to find what you're looking for.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={onFilterToggle}
                variant="outline"
                className="hover:bg-[#12d6fa] hover:text-white hover:border-[#12d6fa]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Adjust Filters
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="hover:bg-gray-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                {productCount > 0 ? `${productCount} Premium Products` : 'Premium Products'}
              </h2>
              <p className="text-slate-600 font-medium mt-2 text-lg">
                Showing premium quality products from {allItems.length} total items
              </p>
            </div>
          </div>
          {activeFilters > 0 && (
            <Badge variant="secondary" className="bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] text-white px-5 py-2.5 text-sm font-semibold rounded-full shadow-xl animate-pulse">
              {activeFilters} filters active
            </Badge>
          )}
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-4">
          {/* Filter Toggle (Mobile) */}
          <Button
            variant="outline"
            onClick={onFilterToggle}
            className="lg:hidden border-2 border-slate-200 hover:border-[#12d6fa] hover:bg-[#12d6fa]/5 transition-all duration-300 font-semibold"
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filters
            {activeFilters > 0 && (
              <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] text-white">
                {activeFilters}
              </Badge>
            )}
          </Button>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 hidden sm:block">Sort by:</span>
            <div className="flex items-center gap-2">
              {['popularity', 'name', 'price', 'rating', 'createdAt'].map((field) => (
                <Button
                  key={field}
                  variant={sortBy === field ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange(field)}
                  className={`text-xs font-semibold transition-all duration-300 ${
                    sortBy === field 
                      ? 'bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] text-white shadow-lg' 
                      : 'hover:bg-[#12d6fa] hover:text-white hover:border-[#12d6fa] hover:shadow-md'
                  }`}
                >
                  {getSortLabel(field)}
                  {getSortIcon(field)}
                </Button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <Button
              variant={currentViewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className={`px-4 py-2.5 transition-all duration-300 font-semibold ${
                currentViewMode === 'grid' 
                  ? 'bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={currentViewMode === 'list' ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className={`px-4 py-2.5 transition-all duration-300 font-semibold ${
                currentViewMode === 'list' 
                  ? 'bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters > 0 && (
        <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-1 text-blue-700">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Premium Quality</span>
          </div>
          <div className="flex items-center gap-1 text-green-700">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Connected</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter Presets</span>
            <X className="w-3 h-3" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              Save
            </Button>
            <Button size="sm" variant="outline" className="text-xs text-red-600 hover:text-red-700">
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className={`grid gap-8 ${
        currentViewMode === VIEW_MODES.GRID 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {allItems.map((item, index) => (
          <div
            key={item._id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard
              product={item}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              onQuickView={onQuickView}
              className={currentViewMode === VIEW_MODES.LIST ? 'flex flex-row' : ''}
            />
          </div>
        ))}
      </div>

      {/* Load More Button (if needed) */}
      {allItems.length >= 20 && (
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-3 hover:bg-[#12d6fa] hover:text-white hover:border-[#12d6fa] transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Load More Products
          </Button>
        </div>
      )}
    </div>
  )
}
