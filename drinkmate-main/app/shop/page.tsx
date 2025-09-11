"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCart } from '@/lib/cart-context'
import { useTranslation } from '@/lib/translation-context'
import PageLayout from '@/components/layout/PageLayout'
import ProductFilters from '@/components/product/ProductFilters'
import ProductGrid from '@/components/product/ProductGrid'
import { shopAPI } from '@/lib/api'
import { Product, Bundle, CO2Cylinder, ProductFilters as ProductFiltersType } from '@/lib/types'
import {
  Award,
  Truck,
  Shield,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

// Dynamic export to prevent static optimization
export const dynamic = "force-dynamic"

export default function ShopPage() {
  const { t } = useTranslation()
  const { addItem } = useCart()
  const router = useRouter()

  // State management
  const [products, setProducts] = useState<Product[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [cylinders, setCylinders] = useState<CO2Cylinder[]>([])
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter and view state
  const [filters, setFilters] = useState<ProductFiltersType>({
    category: 'all',
    priceRange: [0, 10000],
    brand: [],
    rating: 0,
    inStock: false,
    isNew: false,
    isBestSeller: false,
    sortBy: 'popularity',
    sortOrder: 'desc'
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState(0)

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
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product as any).description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product as any).brand?.toLowerCase().includes(searchQuery.toLowerCase())
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
        product.price >= filters.priceRange![0] && product.price <= filters.priceRange![1]
      )
    }

    // Brand filter
    if (filters.brand && filters.brand.length > 0) {
      filtered = filtered.filter(product => 
        filters.brand!.includes((product as any).brand)
      )
    }

    // Rating filter
    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter(product => 
        ((product as any).rating || (product as any).averageRating || 0) >= filters.rating!
      )
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => 
        product.stock === undefined || product.stock > 0
      )
    }

    // New products filter
    if (filters.isNew) {
      filtered = filtered.filter(product => (product as any).isNew)
    }

    // Best seller filter
    if (filters.isBestSeller) {
      filtered = filtered.filter(product => (product as any).isBestSeller)
    }

    // Eco-friendly filter
    if ((filters as any).isEcoFriendly) {
      filtered = filtered.filter(product => (product as any).isEcoFriendly)
    }

    // Sort products
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any

        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
        break
          case 'price':
            aValue = a.price
            bValue = b.price
        break
          case 'rating':
            aValue = (a as any).rating || (a as any).averageRating || 0
            bValue = (b as any).rating || (b as any).averageRating || 0
        break
          case 'createdAt':
            aValue = new Date((a as any).createdAt || 0).getTime()
            bValue = new Date((b as any).createdAt || 0).getTime()
        break
          default:
            aValue = (a as any).popularity || 0
            bValue = (b as any).popularity || 0
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    return filtered
  }, [products, filters, searchQuery])

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length
    setActiveFilters(count)
  }, [filters])

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: ProductFiltersType) => {
    setFilters(newFilters)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({
      category: 'all',
      priceRange: [0, 10000],
      brand: [],
      rating: 0,
      inStock: false,
      isNew: false,
      isBestSeller: false,
      sortBy: 'popularity',
      sortOrder: 'desc'
    })
    setSearchQuery('')
  }, [])

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode)
  }, [])

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder }))
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

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
      {/* Hero Section with Background Image */}
      <section className="relative py-8 md:py-16 bg-white animate-fade-in-up overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1757148169/javier-balseiro-EjJ7ffSd8iA-unsplash_xpsedo.webp"
            alt="DrinkMate Premium Products Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-slide-in-up tracking-tight">
                Our Premium Shop
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] mx-auto rounded-full animate-slide-in-up delay-100"></div>
            </div>
            <p className="text-lg md:text-2xl text-gray-100 max-w-4xl mx-auto animate-slide-in-up delay-200 leading-relaxed font-light">
              Discover our carefully curated collection of premium DrinkMate products designed for the modern lifestyle
            </p>
            <div className="flex items-center justify-center gap-8 mt-8 animate-slide-in-up delay-300">
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-2 h-2 bg-[#12d6fa] rounded-full"></div>
                <span className="text-sm font-medium">Premium Quality</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-20" id="products-section">
          <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              categories={categories}
              brands={brands}
              showFilters={showFilters}
              onToggleFilters={handleFilterToggle}
              productCount={filteredProducts.length}
              onSearch={handleSearch}
            />
            </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <ProductGrid
              products={filteredProducts}
              bundles={bundles}
              cylinders={cylinders}
              viewMode={viewMode}
              loading={loading}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onQuickView={handleQuickView}
              onViewModeChange={handleViewModeChange}
              onSortChange={handleSortChange}
              onFilterToggle={handleFilterToggle}
              showFilters={showFilters}
              productCount={filteredProducts.length}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              activeFilters={activeFilters}
                    />
                  </div>
                </div>

                </div>
              </div>
    </PageLayout>
  )
}
