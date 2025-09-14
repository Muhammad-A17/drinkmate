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
  Search,
  Star,
  Truck,
  Sparkles
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
  categories: Array<{ _id: string; name: string; slug: string; count?: number }>
  brands: string[]
  productCount: number
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
    const newCategory = filters.category === categorySlug ? 'all' : categorySlug
    handleFilterChange('category', newCategory)
  }, [filters.category, handleFilterChange])

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="filter-search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="filter-search"
            placeholder="Search products..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="pl-10"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
      </div>

      {/* Category Filter */}
      <FilterSection
        title="Category"
        sectionKey="category"
        icon={<Filter className="w-4 h-4" />}
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="category-all"
              checked={filters.category === 'all'}
              onCheckedChange={() => handleCategoryChange('all')}
            />
            <Label htmlFor="category-all" className="text-sm">
              All Categories ({productCount})
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category._id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.slug}`}
                  checked={filters.category === category.slug}
                  onCheckedChange={() => handleCategoryChange(category.slug)}
                />
                <Label htmlFor={`category-${category.slug}`} className="text-sm">
                  {category.name}
                </Label>
              </div>
              {category.count !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection
        title="Price Range"
        sectionKey="price"
        icon={<span className="text-sm">SAR</span>}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Slider
              value={localPriceRange}
              onValueChange={handlePriceRangeChange}
              onValueCommit={handlePriceRangeCommit}
              max={10000}
              min={0}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>SAR {localPriceRange[0]}</span>
              <span>SAR {localPriceRange[1]}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={localPriceRange[0]}
              onChange={(e) => setLocalPriceRange([Number(e.target.value), localPriceRange[1]])}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={localPriceRange[1]}
              onChange={(e) => setLocalPriceRange([localPriceRange[0], Number(e.target.value)])}
              className="text-sm"
            />
          </div>
        </div>
      </FilterSection>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <FilterSection
          title="Brand"
          sectionKey="brand"
          icon={<Sparkles className="w-4 h-4" />}
        >
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brand.includes(brand)}
                  onCheckedChange={() => handleBrandChange(brand)}
                />
                <Label htmlFor={`brand-${brand}`} className="text-sm">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Rating Filter */}
      <FilterSection
        title="Rating"
        sectionKey="rating"
        icon={<Star className="w-4 h-4" />}
      >
        <div className="space-y-2">
          {ratingOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${option.value}`}
                checked={filters.rating === option.value}
                onCheckedChange={() => handleRatingChange(option.value)}
              />
              <Label htmlFor={`rating-${option.value}`} className="text-sm flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {option.icon}
                </div>
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Availability Filter */}
      <FilterSection
        title="Availability"
        sectionKey="availability"
        icon={<Truck className="w-4 h-4" />}
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStock}
              onCheckedChange={(checked) => handleBooleanFilterChange('inStock', checked as boolean)}
            />
            <Label htmlFor="in-stock" className="text-sm">
              In Stock Only
            </Label>
          </div>
        </div>
      </FilterSection>

      {/* Special Offers Filter */}
      <FilterSection
        title="Special Offers"
        sectionKey="offers"
        icon={<Sparkles className="w-4 h-4" />}
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new-products"
              checked={filters.isNewProduct}
              onCheckedChange={(checked) => handleBooleanFilterChange('isNewProduct', checked as boolean)}
            />
            <Label htmlFor="new-products" className="text-sm">
              New Products
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="best-sellers"
              checked={filters.isBestSeller}
              onCheckedChange={(checked) => handleBooleanFilterChange('isBestSeller', checked as boolean)}
            />
            <Label htmlFor="best-sellers" className="text-sm">
              Best Sellers
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="on-sale"
              checked={filters.isOnSale}
              onCheckedChange={(checked) => handleBooleanFilterChange('isOnSale', checked as boolean)}
            />
            <Label htmlFor="on-sale" className="text-sm">
              On Sale
            </Label>
          </div>
        </div>
      </FilterSection>
    </div>
  )

  if (isMobile) {
    return (
      <div className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {content}
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={onClose}
                className="w-full bg-[#12d6fa] hover:bg-[#0fb8d9]"
              >
                Show {productCount} Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 flex-shrink-0">
      {content}
    </div>
  )
}
