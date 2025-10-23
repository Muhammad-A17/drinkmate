"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Star,
  Truck,
  Sparkles,
  Tag,
  DollarSign,
  Award,
  Clock,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
  count?: number
  color?: string
}

interface ShopFiltersProps {
  filters: {
    category: string
    subcategory: string
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
  categories: Array<{ _id: string; name: string; slug: string; count?: number; subcategories?: Array<{ _id: string; name: string; slug: string }> }>
  brands: string[]
  productCount: number
  filterCounts?: {
    categories: Record<string, number>
    subcategories: Record<string, number>
    brands: Record<string, number>
    ratings: Record<number, number>
    priceRanges: Record<string, number>
    availability: Record<string, number>
    specialOffers: Record<string, number>
  }
  isRTL?: boolean
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

const ratingOptions = [
  { value: 4, label: '4+ Stars', icon: <Star className="w-4 h-4 fill-current" /> },
  { value: 3, label: '3+ Stars', icon: <Star className="w-4 h-4 fill-current" /> },
  { value: 2, label: '2+ Stars', icon: <Star className="w-4 h-4 fill-current" /> },
  { value: 1, label: '1+ Stars', icon: <Star className="w-4 h-4 fill-current" /> }
]

export default function ShopFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  categories,
  brands,
  productCount,
  filterCounts,
  isRTL = false,
  isMobile = false,
  isOpen = false,
  onClose
}: ShopFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['category', 'price']))
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(filters.priceRange)

  // Update local price range when filters change
  useEffect(() => {
    setLocalPriceRange(filters.priceRange)
  }, [filters.priceRange])

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }, [])

  const handleFilterChange = useCallback((key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }, [filters, onFiltersChange])

  const handleCategoryChange = useCallback((categorySlug: string) => {
    console.log('🔧 ShopFilters: handleCategoryChange called with:', categorySlug)
    const newCategory = filters.category === categorySlug ? 'all' : categorySlug
    console.log('🔧 ShopFilters: newCategory will be:', newCategory)
    handleFilterChange('category', newCategory)
    // Reset subcategory when category changes
    if (newCategory !== 'all') {
      handleFilterChange('subcategory', 'all')
    }
  }, [filters.category, handleFilterChange])

  const handleSubcategoryChange = useCallback((subcategorySlug: string) => {
    const newSubcategory = filters.subcategory === subcategorySlug ? 'all' : subcategorySlug
    handleFilterChange('subcategory', newSubcategory)
  }, [filters.subcategory, handleFilterChange])

  const handleBrandChange = useCallback((brand: string) => {
    const newBrands = filters.brand.includes(brand)
      ? filters.brand.filter(b => b !== brand)
      : [...filters.brand, brand]
    handleFilterChange('brand', newBrands)
  }, [filters.brand, handleFilterChange])

  const handlePriceRangeChange = useCallback((value: [number, number]) => {
    setLocalPriceRange(value)
  }, [])

  const handlePriceRangeCommit = useCallback(() => {
    handleFilterChange('priceRange', localPriceRange)
  }, [localPriceRange, handleFilterChange])

  const handleRatingChange = useCallback((rating: number) => {
    const newRating = filters.rating === rating ? 0 : rating
    handleFilterChange('rating', newRating)
  }, [filters.rating, handleFilterChange])

  const handleBooleanFilterChange = useCallback((key: string, value: boolean) => {
    handleFilterChange(key, value)
  }, [handleFilterChange])

  const getActiveFilterCount = useCallback(() => {
    let count = 0
    if (filters.category !== 'all') count++
    if (filters.subcategory !== 'all') count++
    if (filters.brand.length > 0) count += filters.brand.length
    if (filters.rating > 0) count++
    if (filters.inStock) count++
    if (filters.isNewProduct) count++
    if (filters.isBestSeller) count++
    if (filters.isOnSale) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++
    return count
  }, [filters])

  const activeFilterCount = getActiveFilterCount()

  const FilterSection = ({ 
    title, 
    sectionKey, 
    children, 
    icon 
  }: { 
    title: string
    sectionKey: string
    children: React.ReactNode
    icon?: React.ReactNode
  }) => {
    const isExpanded = expandedSections.has(sectionKey)
    
    return (
      <Card className="mb-4">
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection(sectionKey)}
        >
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              {icon}
              {title}
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CardTitle>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0">
            {children}
          </CardContent>
        )}
      </Card>
    )
  }

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-100 rounded-lg">
            <Filter className="w-5 h-5 text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-3 py-2 rounded-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear all
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <FilterSection
        title="Categories"
        sectionKey="category"
        icon={<Tag className="w-4 h-4 text-brand-600" />}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="category-all"
                checked={filters.category === 'all'}
                onCheckedChange={() => handleCategoryChange('all')}
                className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
              />
              <Label htmlFor="category-all" className="text-sm font-medium cursor-pointer">
                All Categories
              </Label>
            </div>
            <Badge variant="secondary" className="bg-brand-100 text-brand-700 px-2 py-1">
              {productCount}
            </Badge>
          </div>
          {categories.map((category) => {
            const count = filterCounts?.categories[category.slug] || 0
            return (
              <div key={category._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`category-${category.slug}`}
                    checked={filters.category === category.slug}
                    onCheckedChange={() => handleCategoryChange(category.slug)}
                    className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                  />
                  <Label htmlFor={`category-${category.slug}`} className="text-sm font-medium cursor-pointer">
                    {category.name}
                  </Label>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "px-2 py-1",
                    count > 0 
                      ? "bg-brand-100 text-brand-700" 
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  {count}
                </Badge>
              </div>
            )
          })}
        </div>
      </FilterSection>

      {/* Subcategory Filter */}
      {filters.category !== 'all' && (
        <FilterSection
          title="Subcategories"
          sectionKey="subcategory"
          icon={<Tag className="w-4 h-4 text-brand-600" />}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="subcategory-all"
                  checked={filters.subcategory === 'all'}
                  onCheckedChange={() => handleSubcategoryChange('all')}
                  className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                />
                <Label htmlFor="subcategory-all" className="text-sm font-medium cursor-pointer">
                  All Subcategories
                </Label>
              </div>
              <Badge variant="secondary" className="bg-brand-100 text-brand-700 px-2 py-1">
                {productCount}
              </Badge>
            </div>
            {Object.entries(filterCounts?.subcategories || {}).map(([subcategorySlug, count]) => (
              <div key={subcategorySlug} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`subcategory-${subcategorySlug}`}
                    checked={filters.subcategory === subcategorySlug}
                    onCheckedChange={() => handleSubcategoryChange(subcategorySlug)}
                    className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                  />
                  <Label htmlFor={`subcategory-${subcategorySlug}`} className="text-sm font-medium cursor-pointer">
                    {subcategorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "px-2 py-1",
                    count > 0 
                      ? "bg-brand-100 text-brand-700" 
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range Filter */}
      <FilterSection
        title="Price Range"
        sectionKey="price"
        icon={<DollarSign className="w-4 h-4 text-brand-600" />}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <Slider
              value={localPriceRange}
              onValueChange={handlePriceRangeChange}
              onValueCommit={handlePriceRangeCommit}
              max={10000}
              min={0}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>SAR {localPriceRange[0].toLocaleString()}</span>
              <span>SAR {localPriceRange[1].toLocaleString()}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price-min" className="text-xs text-gray-500 mb-1 block">Min Price</Label>
              <Input
                id="price-min"
                type="number"
                placeholder="0"
                value={localPriceRange[0]}
                onChange={(e) => setLocalPriceRange([Number(e.target.value), localPriceRange[1]])}
                className="h-9 text-sm border border-gray-200 rounded-lg focus:border-brand-500"
              />
            </div>
            <div>
              <Label htmlFor="price-max" className="text-xs text-gray-500 mb-1 block">Max Price</Label>
              <Input
                id="price-max"
                type="number"
                placeholder="10000"
                value={localPriceRange[1]}
                onChange={(e) => setLocalPriceRange([localPriceRange[0], Number(e.target.value)])}
                className="h-9 text-sm border border-gray-200 rounded-lg focus:border-brand-500"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <FilterSection
          title="Brands"
          sectionKey="brand"
          icon={<Award className="w-4 h-4 text-brand-600" />}
        >
          <div className="space-y-2">
            {brands.map((brand) => {
              const count = filterCounts?.brands[brand] || 0
              return (
                <div key={brand} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={filters.brand.includes(brand)}
                      onCheckedChange={() => handleBrandChange(brand)}
                      className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                    />
                    <Label htmlFor={`brand-${brand}`} className="text-sm font-medium cursor-pointer">
                      {brand}
                    </Label>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "px-2 py-1",
                      count > 0 
                        ? "bg-brand-100 text-brand-700" 
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {count}
                  </Badge>
                </div>
              )
            })}
          </div>
        </FilterSection>
      )}

      {/* Rating Filter */}
      <FilterSection
        title="Customer Rating"
        sectionKey="rating"
        icon={<Star className="w-4 h-4 text-brand-600" />}
      >
        <div className="space-y-2">
          {ratingOptions.map((option) => {
            const count = filterCounts?.ratings[option.value] || 0
            return (
              <div key={option.value} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`rating-${option.value}`}
                    checked={filters.rating === option.value}
                    onCheckedChange={() => handleRatingChange(option.value)}
                    className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                  />
                  <Label htmlFor={`rating-${option.value}`} className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < option.value ? "fill-current" : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <span>{option.label}</span>
                  </Label>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "px-2 py-1",
                    count > 0 
                      ? "bg-brand-100 text-brand-700" 
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  {count}
                </Badge>
              </div>
            )
          })}
        </div>
      </FilterSection>

      {/* Availability Filter */}
      <FilterSection
        title="Availability"
        sectionKey="availability"
        icon={<Shield className="w-4 h-4 text-brand-600" />}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="in-stock"
                checked={filters.inStock}
                onCheckedChange={(checked) => handleBooleanFilterChange('inStock', checked as boolean)}
                className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <Label htmlFor="in-stock" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                In Stock Only
              </Label>
            </div>
            <Badge 
              variant="secondary" 
              className={cn(
                "px-2 py-1",
                (filterCounts?.availability.inStock || 0) > 0 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {filterCounts?.availability.inStock || 0}
            </Badge>
          </div>
        </div>
      </FilterSection>

      {/* Special Offers Filter */}
      <FilterSection
        title="Special Offers"
        sectionKey="offers"
        icon={<Zap className="w-4 h-4 text-brand-600" />}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="new-products"
                checked={filters.isNewProduct}
                onCheckedChange={(checked) => handleBooleanFilterChange('isNewProduct', checked as boolean)}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <Label htmlFor="new-products" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                New Products
              </Label>
            </div>
            <Badge 
              variant="secondary" 
              className={cn(
                "px-2 py-1",
                (filterCounts?.specialOffers.newProducts || 0) > 0 
                  ? "bg-green-100 text-green-700" 
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {filterCounts?.specialOffers.newProducts || 0}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="best-sellers"
                checked={filters.isBestSeller}
                onCheckedChange={(checked) => handleBooleanFilterChange('isBestSeller', checked as boolean)}
                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <Label htmlFor="best-sellers" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Best Sellers
              </Label>
            </div>
            <Badge 
              variant="secondary" 
              className={cn(
                "px-2 py-1",
                (filterCounts?.specialOffers.bestSellers || 0) > 0 
                  ? "bg-amber-100 text-amber-700" 
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {filterCounts?.specialOffers.bestSellers || 0}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="on-sale"
                checked={filters.isOnSale}
                onCheckedChange={(checked) => handleBooleanFilterChange('isOnSale', checked as boolean)}
                className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
              />
              <Label htmlFor="on-sale" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                <Tag className="w-4 h-4 text-red-500" />
                On Sale
              </Label>
            </div>
            <Badge 
              variant="secondary" 
              className={cn(
                "px-2 py-1",
                (filterCounts?.specialOffers.onSale || 0) > 0 
                  ? "bg-red-100 text-red-700" 
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {filterCounts?.specialOffers.onSale || 0}
            </Badge>
          </div>
        </div>
      </FilterSection>
    </div>
  )

  if (isMobile) {
    return (
      <div className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="h-full flex flex-col">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 rounded-lg">
                  <Filter className="w-5 h-5 text-brand-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Mobile Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {content}
            </div>
            
            {/* Mobile Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-3">
                <div className="text-center text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{productCount}</span> products found
                </div>
                <Button
                  onClick={onClose}
                  className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg"
                >
                  Show Results
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-24">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {content}
        </div>
      </div>
    </div>
  )
}
