"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { useTranslation } from '@/lib/translation-context'
import { Button } from '@/components/ui/button'
import PageLayout from '@/components/layout/PageLayout'
import ShopHero from '@/components/shop/ShopHero'
import ShopToolbar from '@/components/shop/ShopToolbar'
import StickyToolbar from '@/components/shop/StickyToolbar'
import ShopFilters from '@/components/shop/ShopFilters'
import ProductGrid from '@/components/shop/ProductGrid'
import Pagination from '@/components/shop/Pagination'
import MobileStickyBar from '@/components/shop/MobileStickyBar'
import { shopAPI } from '@/lib/api'
import { Product } from '@/types/product'
import { Bundle, CO2Cylinder } from '@/lib/types'
import {
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

// Dynamic export to prevent static optimization
export const dynamic = "force-dynamic"

function ShopPageContent() {
  const { t, isRTL } = useTranslation()
  const { addItem, state } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()

  // State management
  const [products, setProducts] = useState<Product[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [cylinders, setCylinders] = useState<CO2Cylinder[]>([])
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string; count?: number }>>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter and view state
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 10000] as [number, number],
    brand: [] as string[],
    rating: 0,
    inStock: false,
    isNewProduct: false,
    isBestSeller: false,
    isOnSale: false,
    searchQuery: ''
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [sortBy, setSortBy] = useState('popularity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(24)
  const isUpdatingURL = React.useRef(false)

  // URL synchronization - only when not updating URL ourselves
  useEffect(() => {
    if (isUpdatingURL.current) {
      isUpdatingURL.current = false
      return
    }

    const params = new URLSearchParams(searchParams)
    
    // Read filters from URL
    const category = params.get('cat') || 'all'
    const priceMin = parseInt(params.get('priceMin') || '0')
    const priceMax = parseInt(params.get('priceMax') || '10000')
    const brand = params.get('brand') ? params.get('brand')!.split(',') : []
    const rating = parseInt(params.get('rating') || '0')
    const inStock = params.get('inStock') === 'true'
    const isNewProduct = params.get('new') === 'true'
    const isBestSeller = params.get('bestseller') === 'true'
    const isOnSale = params.get('sale') === 'true'
    const searchQuery = params.get('q') || ''
    const sort = params.get('sort') || 'popularity'
    const page = parseInt(params.get('page') || '1')

    // Only update state if values are different to prevent loops
    setFilters(prevFilters => {
      const newFilters = {
        category,
        priceRange: [priceMin, priceMax] as [number, number],
        brand,
        rating,
        inStock,
        isNewProduct,
        isBestSeller,
        isOnSale,
        searchQuery
      }
      
      // Check if filters actually changed
      if (JSON.stringify(prevFilters) !== JSON.stringify(newFilters)) {
        return newFilters
      }
      return prevFilters
    })

    if (sort.includes('-')) {
      const [field, order] = sort.split('-')
      setSortBy(prev => prev !== field ? field : prev)
      setSortOrder(prev => prev !== (order as 'asc' | 'desc') ? (order as 'asc' | 'desc') : prev)
    } else {
      setSortBy(prev => prev !== sort ? sort : prev)
      setSortOrder(prev => prev !== 'desc' ? 'desc' : prev)
    }

    setCurrentPage(prev => prev !== page ? page : prev)
  }, [searchParams])

  // Update URL when filters change
  const updateURL = useCallback((newFilters: any, newSortBy?: string, newSortOrder?: string, newPage?: number) => {
    isUpdatingURL.current = true
    
    const params = new URLSearchParams()
    
    if (newFilters.category !== 'all') params.set('cat', newFilters.category)
    if (newFilters.priceRange[0] > 0) params.set('priceMin', newFilters.priceRange[0].toString())
    if (newFilters.priceRange[1] < 10000) params.set('priceMax', newFilters.priceRange[1].toString())
    if (newFilters.brand.length > 0) params.set('brand', newFilters.brand.join(','))
    if (newFilters.rating > 0) params.set('rating', newFilters.rating.toString())
    if (newFilters.inStock) params.set('inStock', 'true')
    if (newFilters.isNewProduct) params.set('new', 'true')
    if (newFilters.isBestSeller) params.set('bestseller', 'true')
    if (newFilters.isOnSale) params.set('sale', 'true')
    if (newFilters.searchQuery) params.set('q', newFilters.searchQuery)
    
    const sort = newSortBy || sortBy
    const order = newSortOrder || sortOrder
    if (sort !== 'popularity') {
      params.set('sort', order === 'asc' ? `${sort}-asc` : `${sort}-desc`)
    }
    
    const page = newPage || currentPage
    if (page > 1) params.set('page', page.toString())

    const newURL = params.toString() ? `?${params.toString()}` : ''
    router.replace(`/shop${newURL}`, { scroll: false })
  }, [sortBy, sortOrder, currentPage, router])

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch products, categories, and other data
      const [productsResponse, categoriesResponse] = await Promise.all([
        shopAPI.getProducts(),
        shopAPI.getCategories()
      ])

      if (productsResponse.success && productsResponse.products) {
        setProducts(productsResponse.products)
        
        // Extract unique brands
        const uniqueBrands = [...new Set(
          productsResponse.products
            .map((product: any) => product.brand)
            .filter(Boolean)
        )] as string[]
        setBrands(uniqueBrands)
      }

      if (categoriesResponse.success && categoriesResponse.categories) {
        setCategories(categoriesResponse.categories)
      }

      // Set bundles and cylinders (if available)
      setBundles([])
      setCylinders([])

    } catch (err) {
      console.error('Error fetching shop data:', err)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Search filter
    if (filters.searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (product as any).description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (product as any).brand?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => 
        (product as any).category === filters.category ||
        (typeof (product as any).category === 'object' && (product as any).category?.slug === filters.category)
      )
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      )
    }

    // Brand filter
    if (filters.brand && filters.brand.length > 0) {
      filtered = filtered.filter(product => 
        filters.brand.includes((product as any).brand)
      )
    }

    // Rating filter
    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter(product => 
        ((product as any).rating || (product as any).averageRating || 0) >= filters.rating
      )
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => 
        product.inStock
      )
    }

    // New products filter
    if (filters.isNewProduct) {
      filtered = filtered.filter(product => (product as any).isNewProduct)
    }

    // Best seller filter
    if (filters.isBestSeller) {
      filtered = filtered.filter(product => (product as any).isBestSeller)
    }

    // On sale filter
    if (filters.isOnSale) {
      filtered = filtered.filter(product => (product as any).compareAtPrice && (product as any).compareAtPrice > product.price)
    }

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'rating':
          aValue = (a as any).rating || (a as any).averageRating || 0
          bValue = (b as any).rating || (b as any).averageRating || 0
          break
        case 'newest':
          aValue = new Date((a as any).createdAt || 0).getTime()
          bValue = new Date((b as any).createdAt || 0).getTime()
          break
        default: // popularity
          aValue = (a as any).popularity || 0
          bValue = (b as any).popularity || 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [products, filters, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Count active filters
  const activeFilterCount = useMemo(() => {
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

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
    updateURL(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }, [updateURL])

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      category: 'all',
      priceRange: [0, 10000] as [number, number],
      brand: [] as string[],
      rating: 0,
      inStock: false,
      isNewProduct: false,
      isBestSeller: false,
      isOnSale: false,
      searchQuery: ''
    }
    setFilters(clearedFilters)
    updateURL(clearedFilters)
    setCurrentPage(1)
  }, [updateURL])

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode)
  }, [])

  const handleSortChange = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setFilters(prevFilters => {
      updateURL(prevFilters, newSortBy, newSortOrder)
      return prevFilters
    })
    setCurrentPage(1)
  }, [updateURL])

  const handleSearch = useCallback((query: string) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, searchQuery: query }
      updateURL(newFilters)
      setCurrentPage(1)
      return newFilters
    })
  }, [updateURL])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    setFilters(prevFilters => {
      updateURL(prevFilters, sortBy, sortOrder, page)
      return prevFilters
    })
  }, [sortBy, sortOrder, updateURL])

  const handleAddToCart = useCallback((item: any) => {
    addItem(item)
    toast.success('Product added to cart!')
  }, [addItem])

  const handleAddToWishlist = useCallback((productId: string) => {
    toast.success('Added to wishlist!')
  }, [])

  const handleQuickView = useCallback((product: Product | Bundle | CO2Cylinder) => {
    // Implement quick view functionality
    console.log('Quick view:', product)
  }, [])

  const handleFilterToggle = useCallback(() => {
    setShowFilters(!showFilters)
  }, [showFilters])

  const handleSortToggle = useCallback(() => {
    setShowSortMenu(!showSortMenu)
  }, [showSortMenu])

  const handleFilterClose = useCallback(() => {
    setShowFilters(false)
  }, [])

  // Loading state
  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#12d6fa] mx-auto"></div>
              <div className="text-lg font-medium">Loading premium products...</div>
              <div className="text-sm text-muted-foreground">Preparing the best shopping experience</div>
            </div>
            </div>
            </div>
      </PageLayout>
    )
  }

  // Error state
  if (error) {
          return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h1 className="text-2xl font-bold">Error Loading Products</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchData} className="bg-[#12d6fa] hover:bg-[#0fb8d9]">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
          </Button>
        </div>
      </div>
    </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Compact Hero */}
      <ShopHero 
        title="Premium DrinkMate Products"
        subtitle="Discover our carefully curated collection of premium soda makers, flavors, and accessories"
        isRTL={isRTL}
      />

      {/* Shop Toolbar */}
      <ShopToolbar
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onFilterToggle={handleFilterToggle}
        showFilters={showFilters}
        productCount={paginatedProducts.length}
        totalProducts={filteredProducts.length}
        activeFilters={activeFilterCount}
        onClearFilters={handleClearFilters}
        isRTL={isRTL}
      />

      {/* Sticky Toolbar */}
      <StickyToolbar
        resultCount={paginatedProducts.length}
        totalCount={filteredProducts.length}
        sortBy={sortBy}
        sortOrder={sortOrder}
        viewMode={viewMode}
        activeFilters={activeFilterCount}
        onSortChange={handleSortChange}
        onViewModeChange={handleViewModeChange}
        onClearFilters={handleClearFilters}
        onToggleFilters={handleFilterToggle}
        isRTL={isRTL}
      />

      {/* Main Content */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block">
              <ShopFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                categories={categories}
                brands={brands}
                productCount={filteredProducts.length}
                isRTL={isRTL}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              <ProductGrid
                products={paginatedProducts}
                loading={loading}
                dir={isRTL ? "rtl" : "ltr"}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    isRTL={isRTL}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <ShopFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        categories={categories}
        brands={brands}
        productCount={filteredProducts.length}
        isRTL={isRTL}
        isMobile={true}
        isOpen={showFilters}
        onClose={handleFilterClose}
      />

      {/* Mobile Sticky Bar */}
      <MobileStickyBar
        onFilterToggle={handleFilterToggle}
        onViewModeChange={handleViewModeChange}
        onSortToggle={handleSortToggle}
        viewMode={viewMode}
        activeFilters={activeFilterCount}
        cartItemCount={state.items.length}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isRTL={isRTL}
      />
    </PageLayout>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#12d6fa] mx-auto"></div>
              <div className="text-lg font-medium">Loading shop...</div>
            </div>
          </div>
        </div>
      </PageLayout>
    }>
      <ShopPageContent />
    </Suspense>
  )
}
