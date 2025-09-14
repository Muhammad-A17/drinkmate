import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import SaudiRiyalSymbol from '@/components/ui/SaudiRiyalSymbol'
import { ProductFilters as ProductFiltersType } from '@/lib/types'
import { SORT_OPTIONS, FILTER_OPTIONS, RATING_OPTIONS, PRICE_RANGES } from '@/lib/constants'
import { 
  X, 
  SlidersHorizontal, 
  Search, 
  Filter, 
  Star, 
  Truck, 
  Sparkles, 
  Award, 
  Leaf, 
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface ProductFiltersProps {
  filters: ProductFiltersType
  onFiltersChange: (filters: ProductFiltersType) => void
  onClearFilters: () => void
  categories: Array<{ _id: string; name: string; slug: string }>
  brands: string[]
  showFilters: boolean
  onToggleFilters: () => void
  className?: string
  productCount?: number
  onSearch?: (query: string) => void
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  categories,
  brands,
  showFilters,
  onToggleFilters,
  className = '',
  productCount = 0,
  onSearch
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProductFiltersType>(filters)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brands: true,
    rating: true,
    availability: true,
    sort: true
  })

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof ProductFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePriceRangeChange = (value: number[]) => {
    handleFilterChange('priceRange', value as [number, number])
  }

  const handleBrandToggle = (brand: string) => {
    const currentBrands = localFilters.brand || []
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand]
    handleFilterChange('brand', newBrands)
  }

  const handleRatingChange = (rating: number) => {
    handleFilterChange('rating', rating === localFilters.rating ? 0 : rating)
  }

  const handleSortChange = (sortBy: string) => {
    const [field, order] = sortBy.split('_')
    handleFilterChange('sortBy', field as any)
    handleFilterChange('sortOrder', order as any)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const activeFiltersCount = Object.values(localFilters).filter(value => 
    value !== undefined && value !== null && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length

  const FilterSection = ({ 
    title, 
    icon: Icon, 
    section, 
    children 
  }: { 
    title: string
    icon: any
    section: keyof typeof expandedSections
    children: React.ReactNode 
  }) => (
    <div className="border-b border-slate-200/60 pb-6">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full py-3 text-left hover:text-[#12d6fa] transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-slate-100 group-hover:bg-[#12d6fa]/10 rounded-lg flex items-center justify-center transition-colors duration-300">
            <Icon className="w-4 h-4 text-slate-600 group-hover:text-[#12d6fa]" />
          </div>
          <span className="font-semibold text-slate-800 text-base">{title}</span>
        </div>
        <div className="w-6 h-6 bg-slate-100 group-hover:bg-[#12d6fa]/10 rounded-lg flex items-center justify-center transition-all duration-300">
          {expandedSections[section] ? (
            <ChevronUp className="w-4 h-4 text-slate-600 group-hover:text-[#12d6fa]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-[#12d6fa]" />
          )}
        </div>
      </button>
      {expandedSections[section] && (
        <div className="mt-4 pl-9">
          {children}
        </div>
      )}
    </div>
  )

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      {onSearch && (
        <div className="pb-6 border-b border-slate-200/60">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-4 py-3 border-slate-300 focus:ring-2 focus:ring-[#12d6fa] focus:border-transparent rounded-xl bg-slate-50/50 font-medium"
            />
          </div>
        </div>
      )}

      {/* Product Count */}
      <div className="flex items-center justify-between py-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl px-4">
        <span className="text-sm font-semibold text-slate-700">
          {productCount} products found
        </span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] text-white text-xs font-semibold px-3 py-1 rounded-full">
            {activeFiltersCount} filters active
          </Badge>
        )}
      </div>

      {/* Categories */}
      <FilterSection title="Categories" icon={Filter} section="categories">
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="radio"
              name="category"
              checked={!localFilters.category || localFilters.category === 'all'}
              onChange={() => handleFilterChange('category', 'all')}
              className="text-[#12d6fa] focus:ring-[#12d6fa] w-4 h-4"
            />
            <span className="text-sm text-gray-700 group-hover:text-[#12d6fa] transition-colors">
              All Categories
            </span>
          </label>
          {categories.map((category) => (
            <label key={category._id} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={localFilters.category === category.slug}
                onChange={() => handleFilterChange('category', category.slug)}
                className="text-[#12d6fa] focus:ring-[#12d6fa] w-4 h-4"
              />
              <span className="text-sm text-gray-700 group-hover:text-[#12d6fa] transition-colors">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" icon={Zap} section="price">
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={localFilters.priceRange || [0, 10000]}
              onValueChange={handlePriceRangeChange}
              max={10000}
              min={0}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-3">
              <div className="flex items-center gap-1">
                <span className="font-medium flex items-center gap-1">
                  {localFilters.priceRange?.[0] || 0} <SaudiRiyalSymbol size="xs" />
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium flex items-center gap-1">
                  {localFilters.priceRange?.[1] || 10000} <SaudiRiyalSymbol size="xs" />
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PRICE_RANGES).map(([label, range]) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                onClick={() => handlePriceRangeChange([...range] as [number, number])}
                className="text-xs hover:bg-[#12d6fa] hover:text-white hover:border-[#12d6fa] transition-colors"
              >
                {label.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brands" icon={Award} section="brands">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                <Checkbox
                  checked={localFilters.brand?.includes(brand) || false}
                  onCheckedChange={() => handleBrandToggle(brand)}
                  className="text-[#12d6fa] focus:ring-[#12d6fa]"
                />
                <span className="text-sm text-gray-700 group-hover:text-[#12d6fa] transition-colors">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Rating */}
      <FilterSection title="Customer Rating" icon={Star} section="rating">
        <div className="space-y-2">
          {Object.entries(RATING_OPTIONS).map(([label, rating]) => (
            <label key={label} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={localFilters.rating === rating}
                onChange={() => handleRatingChange(rating)}
                className="text-[#12d6fa] focus:ring-[#12d6fa] w-4 h-4"
              />
              <div className="flex items-center gap-1">
                {label !== 'ALL' && (
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
                <span className="text-sm text-gray-700 group-hover:text-[#12d6fa] transition-colors">
                  {label === 'ALL' ? 'All Ratings' : `${rating}+ Stars`}
                </span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability & Features" icon={Truck} section="availability">
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <Checkbox
              checked={localFilters.inStock || false}
              onCheckedChange={(checked) => handleFilterChange('inStock', checked)}
              className="text-[#12d6fa] focus:ring-[#12d6fa]"
            />
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700 group-hover:text-[#12d6fa] transition-colors">
                In Stock Only
              </span>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <Checkbox
              checked={localFilters.isNewProduct || false}
              onCheckedChange={(checked) => handleFilterChange('isNewProduct', checked)}
              className="text-[#12d6fa] focus:ring-[#12d6fa]"
            />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700 group-hover:text-[#12d6fa] transition-colors">
                New Arrivals
              </span>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <Checkbox
              checked={localFilters.isBestSeller || false}
              onCheckedChange={(checked) => handleFilterChange('isBestSeller', checked)}
              className="text-[#12d6fa] focus:ring-[#12d6fa]"
            />
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-700 group-hover:text-[#12d6fa] transition-colors">
                Best Sellers
              </span>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <Checkbox
              checked={(localFilters as any).isEcoFriendly || false}
              onCheckedChange={(checked) => handleFilterChange('isEcoFriendly' as any, checked)}
              className="text-[#12d6fa] focus:ring-[#12d6fa]"
            />
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-700 group-hover:text-[#12d6fa] transition-colors">
                Eco-Friendly
              </span>
            </div>
          </label>
        </div>
      </FilterSection>

      {/* Sort Options */}
      <FilterSection title="Sort By" icon={RefreshCw} section="sort">
        <select
          value={`${localFilters.sortBy || 'popularity'}_${localFilters.sortOrder || 'desc'}`}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-transparent bg-white"
          aria-label="Sort products by"
        >
          <option value="popularity_desc">Most Popular</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
          <option value="price_asc">Price Low to High</option>
          <option value="price_desc">Price High to Low</option>
          <option value="rating_desc">Highest Rated</option>
          <option value="createdAt_desc">Newest First</option>
          <option value="createdAt_asc">Oldest First</option>
        </select>
      </FilterSection>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters ({activeFiltersCount})
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className={className}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <Button
          variant="outline"
          onClick={onToggleFilters}
          className="w-full justify-between h-12 border-2 border-gray-200 hover:border-[#12d6fa] hover:bg-[#12d6fa]/5 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filters & Sorting</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-[#12d6fa] text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <X className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-[#12d6fa]/10 via-blue-50 to-indigo-50 border-b border-slate-200/60 p-6">
            <CardTitle className="flex items-center justify-between text-2xl font-bold">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] rounded-xl flex items-center justify-center shadow-lg">
                  <Filter className="w-6 h-6 text-white" />
                </div>
                <span className="text-slate-800">Filters & Sorting</span>
              </div>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] text-white px-4 py-2 font-semibold rounded-full shadow-lg animate-pulse">
                  {activeFiltersCount} active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <FilterContent />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#12d6fa]" />
                  Filters & Sorting
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFilters}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {activeFiltersCount > 0 && (
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-[#12d6fa] text-white">
                    {activeFiltersCount} filters active
                  </Badge>
                </div>
              )}
            </div>
            <div className="p-4">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
