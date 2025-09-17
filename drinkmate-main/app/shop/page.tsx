"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import { useTranslation } from '@/lib/translation-context'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import PageLayout from '@/components/layout/PageLayout'
import ShopHero from '@/components/shop/ShopHero'
import ShopToolbar from '@/components/shop/ShopToolbar'
import StickyToolbar from '@/components/shop/StickyToolbar'
import ShopFilters from '@/components/shop/ShopFilters'
import ProductGrid from '@/components/shop/ProductGrid'
import Pagination from '@/components/shop/Pagination'
import MobileStickyBar from '@/components/shop/MobileStickyBar'
import ProductComparison from '@/components/shop/ProductComparison'
import WishlistManager from '@/components/shop/WishlistManager'
import RecentlyViewed from '@/components/shop/RecentlyViewed'
import ProductRecommendations from '@/components/shop/ProductRecommendations'
import FilterChips from '@/components/shop/FilterChips'
import { shopAPI } from '@/lib/api'
import { Product } from '@/types/product'
import { Bundle, CO2Cylinder } from '@/lib/types'
import {
  AlertCircle,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Heart,
  Eye,
  ShoppingCart,
  Filter,
  Grid3X3,
  List,
  ArrowUpDown,
  X,
  Zap,
  Award,
  Shield,
  Truck,
  ChevronDown,
  SlidersHorizontal
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
  const [isSearching, setIsSearching] = useState(false)

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
  
  // Debounced search query for better performance
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300)
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [sortBy, setSortBy] = useState('popularity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(24)
  const isUpdatingURL = React.useRef(false)

  // Premium features state
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [comparisonList, setComparisonList] = useState<Product[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  // SEO optimization
  useEffect(() => {
    document.title = 'Premium DrinkMate Shop | Advanced Soda Makers & Accessories'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover our premium collection of soda makers, CO2 cylinders, flavor concentrates, and accessories. Advanced filtering, product comparison, and personalized recommendations await.')
    }
  }, [])

  // Load persistent data
  useEffect(() => {
    const savedWishlist = localStorage.getItem('drinkmates-wishlist')
    const savedRecent = localStorage.getItem('drinkmates-recently-viewed')
    const savedComparison = localStorage.getItem('drinkmates-comparison')

    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist))
    }
    if (savedRecent) {
      setRecentlyViewed(JSON.parse(savedRecent))
    }
    if (savedComparison) {
      setComparisonList(JSON.parse(savedComparison))
    }
  }, [])

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

  // Update URL when debounced search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== filters.searchQuery) {
      setIsSearching(true)
      setFilters(prevFilters => {
        const newFilters = { ...prevFilters, searchQuery: debouncedSearchQuery }
        updateURL(newFilters)
        return newFilters
      })
      // Reset searching state after a short delay
      setTimeout(() => setIsSearching(false), 100)
    }
  }, [debouncedSearchQuery, updateURL])

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
    // Filter out invalid products first
    let filtered = products.filter(product => product && typeof product === 'object')

    // Search filter using debounced query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase().trim()
      filtered = filtered.filter(product => {
        // Safe property access with fallbacks
        const title = product?.title || (product as any)?.name || ''
        const description = (product as any)?.description || ''
        const brand = (product as any)?.brand || ''
        const category = (product as any)?.category || ''
        
        const titleMatch = title.toLowerCase().includes(query)
        const descriptionMatch = description.toLowerCase().includes(query)
        const brandMatch = brand.toLowerCase().includes(query)
        const categoryMatch = category.toLowerCase().includes(query)
        
        return titleMatch || descriptionMatch || brandMatch || categoryMatch
      })
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => {
        const category = (product as any)?.category
        return category === filters.category ||
               (typeof category === 'object' && category?.slug === filters.category)
      })
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = product?.price || 0
        return price >= filters.priceRange[0] && price <= filters.priceRange[1]
      })
    }

    // Brand filter
    if (filters.brand && filters.brand.length > 0) {
      filtered = filtered.filter(product => {
        const brand = (product as any)?.brand || ''
        return filters.brand.includes(brand)
      })
    }

    // Rating filter
    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter(product => {
        const rating = (product as any)?.rating || (product as any)?.averageRating || 0
        return rating >= filters.rating
      })
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => 
        product?.inStock === true
      )
    }

    // New products filter
    if (filters.isNewProduct) {
      filtered = filtered.filter(product => (product as any)?.isNewProduct === true)
    }

    // Best seller filter
    if (filters.isBestSeller) {
      filtered = filtered.filter(product => (product as any)?.isBestSeller === true)
    }

    // On sale filter
    if (filters.isOnSale) {
      filtered = filtered.filter(product => {
        const compareAtPrice = (product as any)?.compareAtPrice
        const price = product?.price || 0
        return compareAtPrice && compareAtPrice > price
      })
    }

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = (a?.title || (a as any)?.name || '').toLowerCase()
          bValue = (b?.title || (b as any)?.name || '').toLowerCase()
          break
        case 'price':
          aValue = a?.price || 0
          bValue = b?.price || 0
          break
        case 'rating':
          aValue = (a as any)?.rating || (a as any)?.averageRating || 0
          bValue = (b as any)?.rating || (b as any)?.averageRating || 0
          break
        case 'newest':
          aValue = new Date((a as any)?.createdAt || 0).getTime()
          bValue = new Date((b as any)?.createdAt || 0).getTime()
          break
        default: // popularity
          aValue = (a as any)?.popularity || 0
          bValue = (b as any)?.popularity || 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [products, filters, sortBy, sortOrder, debouncedSearchQuery])

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
    setFilters(prevFilters => ({
      ...prevFilters,
      searchQuery: query
    }))
    setCurrentPage(1)
  }, [])

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

  // Premium feature handlers
  const handleAddToWishlist = useCallback((product: Product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id)
    if (!isInWishlist) {
      const updatedWishlist = [...wishlist, product]
      setWishlist(updatedWishlist)
      localStorage.setItem('drinkmates-wishlist', JSON.stringify(updatedWishlist))
      toast.success('Added to wishlist!')
    } else {
      const updatedWishlist = wishlist.filter(item => item.id !== product.id)
      setWishlist(updatedWishlist)
      localStorage.setItem('drinkmates-wishlist', JSON.stringify(updatedWishlist))
      toast.success('Removed from wishlist!')
    }
  }, [wishlist])

  const handleAddToComparison = useCallback((product: Product) => {
    const isInComparison = comparisonList.some(item => item.id === product.id)
    if (!isInComparison && comparisonList.length < 4) {
      const updatedComparison = [...comparisonList, product]
      setComparisonList(updatedComparison)
      localStorage.setItem('drinkmates-comparison', JSON.stringify(updatedComparison))
      toast.success('Added to comparison!')
    } else if (isInComparison) {
      const updatedComparison = comparisonList.filter(item => item.id !== product.id)
      setComparisonList(updatedComparison)
      localStorage.setItem('drinkmates-comparison', JSON.stringify(updatedComparison))
      toast.success('Removed from comparison!')
    } else {
      toast.error('Maximum 4 products can be compared!')
    }
  }, [comparisonList])

  const handleProductView = useCallback((product: Product) => {
    const updatedRecent = [product, ...recentlyViewed.filter(p => p.id !== product.id)].slice(0, 10)
    setRecentlyViewed(updatedRecent)
    localStorage.setItem('drinkmates-recently-viewed', JSON.stringify(updatedRecent))
  }, [recentlyViewed])

  const handleQuickView = useCallback((product: Product | Bundle | CO2Cylinder) => {
    handleProductView(product as Product)
    // Implement quick view functionality
    console.log('Quick view:', product)
  }, [handleProductView])

  const handleFilterToggle = useCallback(() => {
    setShowFilters(!showFilters)
  }, [showFilters])

  const handleSortToggle = useCallback(() => {
    setShowSortMenu(!showSortMenu)
  }, [showSortMenu])

  const handleFilterClose = useCallback(() => {
    setShowFilters(false)
  }, [])

  // Modern Loading state
  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50/30">
          {/* Hero Skeleton */}
          <div className="relative bg-gradient-to-br from-slate-50 via-white to-brand-50/20 py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center space-y-8 animate-pulse">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 w-48 h-8 mx-auto"></div>
                <div className="space-y-4">
                  <div className="h-16 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-16 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto"></div>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar Skeleton */}
          <div className="bg-white border-b border-gray-200/60 py-6">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex flex-1 items-center gap-4 w-full lg:w-auto">
                  <div className="flex-1 max-w-lg h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="lg:hidden h-12 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:block h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="h-12 w-20 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filter Skeleton */}
              <div className="hidden lg:block w-80">
                <div className="space-y-6 animate-pulse">
                  <div className="bg-white rounded-xl p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                    <div className="h-11 bg-gray-200 rounded-xl"></div>
                  </div>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                      <div className="h-5 bg-gray-200 rounded w-32"></div>
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <div key={j} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 bg-gray-200 rounded"></div>
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div className="w-8 h-4 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Grid Skeleton */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="aspect-[4/5] bg-gray-200"></div>
                        <div className="p-6 space-y-4">
                          <div className="h-5 bg-gray-200 rounded w-4/5"></div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <div key={j} className="w-4 h-4 bg-gray-200 rounded"></div>
                              ))}
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-24"></div>
                          <div className="h-10 bg-gray-200 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
        <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Error Loading Products</h1>
              <p className="text-gray-600">{error}</p>
            </div>
            <Button 
              onClick={fetchData} 
              className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Hero Section - Recipe Page Style */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/water-366586_bd4us9.jpg"
            alt="Shop background"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay with opacity */}
          <div className="absolute inset-0 bg-black/40"></div>
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight ${isRTL ? 'font-cairo' : 'font-montserrat'} tracking-tight`}>
              {isRTL ? "المتجر" : "Shop"}
            </h1>
            <p className={`text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {isRTL ? "اكتشف منتجاتنا المتميزة من صانعات الصودا والنكهات والإكسسوارات." : "Discover our premium collection of soda makers, flavors, and accessories."}
            </p>
          </div>
        </div>
      </section>

      {/* Modern Toolbar */}
      <div className="bg-white border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Section */}
            <div className="flex flex-1 items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 max-w-lg">
                {isSearching ? (
                  <RefreshCw className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-500 w-5 h-5 animate-spin" />
                ) : (
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                  type="text"
                  placeholder="Search products, brands, or categories..."
                  value={filters.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {filters.searchQuery && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                onClick={handleFilterToggle}
                className="lg:hidden flex items-center gap-2 px-4 py-3 h-12 border-2 border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-brand-500 text-white text-xs px-2 py-1 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Controls Section */}
            <div className="flex items-center gap-4">
              {/* Results Count */}
              <div className="text-sm text-gray-600 hidden md:block">
                <span className="font-semibold text-gray-900">{filteredProducts.length}</span>
                <span className="mx-1">products found</span>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Sort:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    handleSortChange(field, order as 'asc' | 'desc')
                  }}
                  className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 bg-gray-50/50 hover:bg-white transition-all duration-300"
                  aria-label="Sort products"
                >
                  <option value="popularity-desc">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest-desc">Newest First</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('grid')}
                  className={`h-12 px-4 rounded-none border-0 ${viewMode === 'grid' ? 'bg-brand-500 text-white' : 'hover:bg-white text-gray-600'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('list')}
                  className={`h-12 px-4 rounded-none border-0 ${viewMode === 'list' ? 'bg-brand-500 text-white' : 'hover:bg-white text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                <span className="bg-brand-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg"
              >
                <X className="w-4 h-4 mr-2" />
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="bg-gray-50/30 min-h-screen">
        <div className="max-w-10xl mx-auto px-2 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0 -ml-12">
              <div className="sticky top-24">
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
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Filter Chips */}
              <FilterChips
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                isRTL={isRTL}
              />

              {/* Product Grid */}
              <div className="mt-6">
                <ProductGrid
                  products={paginatedProducts}
                  loading={loading}
                  dir={isRTL ? "rtl" : "ltr"}
                  onAddToWishlist={handleAddToWishlist}
                  onAddToComparison={handleAddToComparison}
                  onProductView={handleProductView}
                  wishlist={wishlist}
                  comparisonList={comparisonList}
                />
              </div>

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

              {/* No Results State */}
              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                  </p>
                  <Button
                    onClick={handleClearFilters}
                    className="bg-brand-500 hover:bg-brand-600 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear all filters
                  </Button>
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

      {/* Premium Modals */}
      <ProductComparison
        products={comparisonList}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onRemoveProduct={(productId) => {
          const updated = comparisonList.filter(p => p.id !== productId)
          setComparisonList(updated)
          localStorage.setItem('drinkmates-comparison', JSON.stringify(updated))
        }}
        onClearAll={() => {
          setComparisonList([])
          localStorage.removeItem('drinkmates-comparison')
        }}
      />

      <WishlistManager
        products={wishlist}
        isOpen={showWishlist}
        onClose={() => setShowWishlist(false)}
        onRemoveProduct={(productId) => {
          const updated = wishlist.filter(p => p.id !== productId)
          setWishlist(updated)
          localStorage.setItem('drinkmates-wishlist', JSON.stringify(updated))
        }}
        onClearAll={() => {
          setWishlist([])
          localStorage.removeItem('drinkmates-wishlist')
        }}
        onAddToCart={handleAddToCart}
      />

      <RecentlyViewed
        products={recentlyViewed}
        isOpen={showRecommendations}
        onClose={() => setShowRecommendations(false)}
        onProductView={handleProductView}
        onAddToWishlist={handleAddToWishlist}
        onAddToComparison={handleAddToComparison}
        wishlist={wishlist}
        comparisonList={comparisonList}
      />

      <ProductRecommendations
        products={products}
        recentlyViewed={recentlyViewed}
        isOpen={showRecommendations}
        onClose={() => setShowRecommendations(false)}
        onProductView={handleProductView}
        onAddToWishlist={handleAddToWishlist}
        onAddToComparison={handleAddToComparison}
        wishlist={wishlist}
        comparisonList={comparisonList}
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
