"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/lib/contexts/cart-context'
import { useTranslation } from '@/lib/contexts/translation-context'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import PageLayout from '@/components/layout/PageLayout'
import ShopHero from '@/components/shop/ShopHero'
import ShopToolbar from '@/components/shop/ShopToolbar'
import StickyToolbar from '@/components/shop/StickyToolbar'
import ShopFilters from '@/components/shop/ShopFilters'
import ProductGrid from '@/components/shop/ProductGrid'
import BundleStyleProductCard from '@/components/shop/BundleStyleProductCard'
import Pagination from '@/components/shop/Pagination'
import MobileStickyBar from '@/components/shop/MobileStickyBar'
import ProductComparison from '@/components/shop/ProductComparison'
import WishlistManager from '@/components/shop/WishlistManager'
import RecentlyViewed from '@/components/shop/RecentlyViewed'
import ProductRecommendations from '@/components/shop/ProductRecommendations'
import FilterChips from '@/components/shop/FilterChips'
import { shopAPI } from '@/lib/api'
import { Product } from '@/lib/types'
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
    subcategory: 'all',
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
    console.log('🔍 URL params:', Object.fromEntries(params.entries()))
    console.log('🔍 Current pathname:', window.location.pathname)
    
    // Read filters from URL
    // Only apply category filter if we're on the main shop page and it's explicitly set
    const category = params.get('cat') || 'all'
    console.log('🔍 Category from URL:', category)
    
    // If we're on the main shop page and no category is specified, show all products
    const isMainShopPage = window.location.pathname === '/shop'
    const finalCategory = isMainShopPage && !params.get('cat') ? 'all' : category
    console.log('🔍 Final category after main shop check:', finalCategory)
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
        category: finalCategory,
        subcategory: 'all', // Reset subcategory when reading from URL
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
        shopAPI.getProducts({ limit: 100 }), // Fetch up to 100 products to get all
        shopAPI.getCategories()
      ])

      console.log('📦 Raw API response:', {
        success: productsResponse.success,
        totalProducts: productsResponse.totalProducts,
        count: productsResponse.count,
        currentPage: productsResponse.currentPage,
        totalPages: productsResponse.totalPages,
        productsLength: productsResponse.products?.length
      })

      if (productsResponse.success && productsResponse.products) {
        // Process products to add missing properties
        const processedProducts = productsResponse.products.map((product: any) => ({
          ...product,
          inStock: product.inStock !== undefined ? product.inStock : true, // Default to in stock if not specified
          brand: product.brand || 'Drinkmate', // Default brand if not specified
        }))
        
        setProducts(processedProducts)
        
        // Extract unique brands
        const uniqueBrands = [...new Set(
          processedProducts
            .map((product: any) => product.brand)
            .filter(Boolean)
        )] as string[]
        setBrands(uniqueBrands)
        
        console.log('📊 Processed products for stats:', {
          totalProducts: processedProducts.length,
          inStockCount: processedProducts.filter((p: any) => p.inStock).length,
          brands: uniqueBrands,
          sampleProduct: processedProducts[0]
        })
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
    console.log('🔍 Starting product filtering with:', {
      totalProducts: products.length,
      filters,
      debouncedSearchQuery
    })
    
    // Filter out invalid products first
    let filtered = products.filter(product => product && typeof product === 'object')
    console.log('🔍 After invalid filter:', filtered.length)

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
      console.log('🔍 After search filter:', filtered.length)
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      console.log('🔍 Applying category filter:', filters.category)
      console.log('🔍 Sample product categories before filter:', filtered.slice(0, 3).map(p => ({
        name: (p as any)?.name,
        category: (p as any)?.category
      })))
      
      // Find the category object to get the ObjectId
      const selectedCategory = categories.find(cat => cat.slug === filters.category)
      const categoryObjectId = selectedCategory?._id
      
      console.log('🔍 Selected category:', selectedCategory)
      console.log('🔍 Category ObjectId:', categoryObjectId)
      
      filtered = filtered.filter(product => {
        const category = (product as any)?.category
        const categoryId = typeof category === 'object' ? category?._id : category
        const categorySlug = typeof category === 'object' ? category?.slug : null
        
        // Check if the product's category matches the selected category
        const matchesId = categoryId === categoryObjectId
        const matchesSlug = categorySlug === filters.category
        
        // Also check if the category name matches common variations
        const categoryName = typeof category === 'object' ? category?.name : null
        const matchesName = categoryName && (
          categoryName.toLowerCase().includes(filters.category.toLowerCase()) ||
          filters.category.toLowerCase().includes(categoryName.toLowerCase())
        )
        
        const matches = matchesId || matchesSlug || matchesName
        
        // Only log the first few products to avoid spam
        if (filtered.indexOf(product) < 3) {
          console.log('🔍 Product category check:', {
            productName: (product as any)?.name,
            category,
            categoryId,
            categorySlug,
            categoryName,
            filterCategory: filters.category,
            categoryObjectId,
            matches
          })
        }
        
        return matches
      })
      console.log('🔍 After category filter:', filtered.length)
    }

    // Subcategory filter
    if (filters.subcategory && filters.subcategory !== 'all') {
      console.log('🔍 Applying subcategory filter:', filters.subcategory)
      filtered = filtered.filter(product => {
        const subcategory = (product as any)?.subcategory
        const subcategoryId = typeof subcategory === 'object' ? subcategory?._id : subcategory
        const subcategorySlug = typeof subcategory === 'object' ? subcategory?.slug : null
        const subcategoryName = typeof subcategory === 'object' ? subcategory?.name : subcategory
        
        // Check ID, slug, and name matches
        const matchesId = subcategoryId === filters.subcategory
        const matchesSlug = subcategorySlug === filters.subcategory
        const matchesName = subcategoryName && (
          subcategoryName.toLowerCase().includes(filters.subcategory.toLowerCase()) ||
          filters.subcategory.toLowerCase().includes(subcategoryName.toLowerCase())
        )
        
        return matchesId || matchesSlug || matchesName
      })
      console.log('🔍 After subcategory filter:', filtered.length)
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

    console.log('🔍 Final filtered products:', {
      total: filtered.length,
      sample: filtered[0]
    })

    return filtered
  }, [products, filters, sortBy, sortOrder, debouncedSearchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
  
  console.log('📄 Pagination info:', {
    totalFilteredProducts: filteredProducts.length,
    itemsPerPage,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedProductsCount: paginatedProducts.length
  })

  // Count active filters
  const activeFilterCount = useMemo(() => {
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

  // Calculate product counts for each filter option
  const filterCounts = useMemo(() => {
    const counts = {
      categories: {} as Record<string, number>,
      subcategories: {} as Record<string, number>,
      brands: {} as Record<string, number>,
      ratings: {} as Record<number, number>,
      priceRanges: {
        '0-100': 0,
        '100-500': 0,
        '500-1000': 0,
        '1000-5000': 0,
        '5000+': 0
      },
      availability: {
        inStock: 0,
        outOfStock: 0
      },
      specialOffers: {
        newProducts: 0,
        bestSellers: 0,
        onSale: 0
      }
    }

    // Calculate counts for all products (before any filtering)
    products.forEach(product => {
      // Category counts
      const category = (product as any)?.category
      const categoryId = typeof category === 'object' ? category?._id : category
      
      // Find the category by ObjectId to get the slug
      const categoryObj = categories.find(cat => cat._id === categoryId)
      const categorySlug = categoryObj?.slug
      
      if (categorySlug) {
        counts.categories[categorySlug] = (counts.categories[categorySlug] || 0) + 1
      }

      // Subcategory counts
      const subcategory = (product as any)?.subcategory
      const subcategorySlug = typeof subcategory === 'object' ? subcategory?.slug : subcategory
      const subcategoryName = typeof subcategory === 'object' ? subcategory?.name : subcategory
      if (subcategorySlug) {
        counts.subcategories[subcategorySlug] = (counts.subcategories[subcategorySlug] || 0) + 1
      } else if (subcategoryName) {
        counts.subcategories[subcategoryName] = (counts.subcategories[subcategoryName] || 0) + 1
      }

      // Brand counts
      const brand = (product as any)?.brand || 'Drinkmate'
      counts.brands[brand] = (counts.brands[brand] || 0) + 1

      // Rating counts
      const rating = (product as any)?.rating || (product as any)?.averageRating || 0
      const ratingFloor = Math.floor(rating)
      if (ratingFloor >= 1) {
        counts.ratings[ratingFloor] = (counts.ratings[ratingFloor] || 0) + 1
      }

      // Price range counts
      const price = product?.price || 0
      if (price >= 0 && price <= 100) counts.priceRanges['0-100']++
      else if (price > 100 && price <= 500) counts.priceRanges['100-500']++
      else if (price > 500 && price <= 1000) counts.priceRanges['100-500']++
      else if (price > 1000 && price <= 5000) counts.priceRanges['1000-5000']++
      else if (price > 5000) counts.priceRanges['5000+']++

      // Availability counts
      if (product?.inStock) counts.availability.inStock++
      else counts.availability.outOfStock++

      // Special offers counts
      if ((product as any)?.isNewProduct) counts.specialOffers.newProducts++
      if ((product as any)?.isBestSeller) counts.specialOffers.bestSellers++
      if ((product as any)?.compareAtPrice && (product as any)?.compareAtPrice > product?.price) {
        counts.specialOffers.onSale++
      }
    })

    return counts
  }, [products])

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
    updateURL(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }, [updateURL])

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      category: 'all',
      subcategory: 'all',
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 items-stretch">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-white rounded-3xl border border-gray-100/80 overflow-hidden h-[500px] sm:h-[540px] lg:h-[580px] flex flex-col">
                        <div className="h-[220px] sm:h-[260px] lg:h-[320px] bg-gray-200 relative p-3 sm:p-4">
                          <div className="absolute top-4 right-4 w-16 h-6 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="p-4 sm:p-6 flex-1 flex flex-col">
                          <div className="h-6 bg-gray-200 rounded w-4/5 mb-3"></div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <div key={j} className="w-4 h-4 bg-gray-200 rounded"></div>
                              ))}
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div className="mt-auto">
                            <div className="flex items-center justify-between mb-3">
                              <div className="h-6 bg-gray-200 rounded w-20"></div>
                              <div className="h-8 bg-gray-200 rounded w-24"></div>
                            </div>
                          </div>
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
      {/* Professional Hero Section */}
      <section className="relative py-16 md:py-20 lg:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/water-366586_bd4us9.jpg"
            alt="Shop background"
            fill
            className="object-cover"
            priority
          />
          {/* Professional overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/60"></div>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight ${isRTL ? 'font-cairo' : 'font-montserrat'} tracking-tight`}>
              {isRTL ? "المتجر" : "Shop"}
            </h1>
            <p className={`text-base sm:text-lg md:text-xl text-white/90 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {isRTL ? "اكتشف منتجاتنا المتميزة من صانعات الصودا والنكهات والإكسسوارات." : "Discover our premium collection of soda makers, flavors, and accessories."}
            </p>
            
            {/* Professional Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-2">
                <Truck className="w-4 h-4 text-cyan-300" />
                <span className="text-white text-sm font-medium">Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-2">
                <Shield className="w-4 h-4 text-green-300" />
                <span className="text-white text-sm font-medium">100% Original</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-2">
                <Award className="w-4 h-4 text-yellow-300" />
                <span className="text-white text-sm font-medium">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Toolbar */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center justify-between">
            {/* Enhanced Search Section */}
            <div className="flex flex-1 items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 max-w-2xl">
                <div className="relative">
                  {isSearching ? (
                    <RefreshCw className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-500 w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  )}
                  <input
                    type="text"
                    placeholder="Search products, brands, or categories..."
                    value={filters.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 h-12 sm:h-14 text-sm sm:text-base border-2 border-gray-200 rounded-2xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300 bg-white shadow-sm hover:shadow-lg focus:shadow-xl"
                    dir={isRTL ? 'rtl' : 'ltr'}
                    aria-label="Search products"
                    aria-describedby="search-help"
                    autoComplete="off"
                    role="searchbox"
                  />
                  {filters.searchQuery && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors p-1 rounded-full hover:bg-cyan-50"
                      aria-label="Clear search"
                      title="Clear search"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {/* Search Suggestions/Results Count */}
                {filters.searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4" role="region" aria-live="polite">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Search className="w-4 h-4" />
                        <span>Searching for "{filters.searchQuery}"</span>
                      </div>
                      <div className="text-sm font-medium text-cyan-600">
                        {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Hidden help text for screen readers */}
                <div id="search-help" className="sr-only">
                  Search for products by name, brand, or category. Results will update as you type.
                </div>
              </div>

              {/* Enhanced Mobile Filter Button */}
              <Button
                variant="outline"
                onClick={handleFilterToggle}
                className="lg:hidden flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 h-12 sm:h-14 border-2 border-gray-200 rounded-2xl hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-300 shadow-sm hover:shadow-lg bg-white font-semibold"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="font-medium">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-cyan-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Professional Controls Section - Mobile Optimized */}
            <div className="flex flex-row items-center gap-3 sm:gap-6">
              {/* Results Count with Professional Styling */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl justify-center sm:justify-start border border-gray-200/50">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                  <span className="font-bold text-gray-900">{filteredProducts.length}</span>
                  <span className="ml-1 hidden sm:inline">products found</span>
                  <span className="ml-1 sm:hidden">found</span>
                </span>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">Sort by:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    handleSortChange(field, order as 'asc' | 'desc')
                  }}
                  className="h-12 sm:h-14 px-4 sm:px-6 border-2 border-gray-200 rounded-2xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 bg-white hover:bg-gray-50 transition-all duration-300 font-semibold shadow-sm hover:shadow-lg text-sm sm:text-base"
                  aria-label="Sort products"
                  aria-describedby="sort-help"
                >
                  <option value="popularity-desc">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest-desc">Newest First</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
                <div id="sort-help" className="sr-only">
                  Choose how to sort the products. Options include popularity, price, newest, and rating.
                </div>
              </div>

              {/* Professional View Toggle */}
              <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('grid')}
                  className={`h-12 sm:h-14 px-4 sm:px-6 rounded-none border-0 transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-cyan-500 text-white shadow-md' 
                      : 'hover:bg-cyan-50 text-gray-600 hover:text-cyan-600'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('list')}
                  className={`h-12 sm:h-14 px-4 sm:px-6 rounded-none border-0 transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-cyan-500 text-white shadow-md' 
                      : 'hover:bg-cyan-50 text-gray-600 hover:text-cyan-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200/60">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-700">Active filters:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                  </span>
                  <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {filteredProducts.length} results
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 px-4 py-2 rounded-xl transition-all duration-300 font-medium"
              >
                <X className="w-4 h-4 mr-2" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Professional Main Content Layout */}
      <div className="bg-gradient-to-br from-gray-50/30 via-white to-cyan-50/10 min-h-screen">
        <div className="max-w-10xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Enhanced Desktop Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0 -ml-8">
              <div className="sticky top-24 space-y-6">
                {/* Quick Stats Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ml-2">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 text-left">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 text-left">Total Products</span>
                      <span className="font-bold text-cyan-600">{products.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 text-left">Categories</span>
                      <span className="font-bold text-cyan-600">{categories.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 text-left">Brands</span>
                      <span className="font-bold text-cyan-600">{brands.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 text-left">In Stock</span>
                      <span className="font-bold text-green-600">
                        {products.filter(p => p.inStock).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <ShopFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  categories={categories}
                  brands={brands}
                  productCount={filteredProducts.length}
                  filterCounts={filterCounts}
                  isRTL={isRTL}
                />
              </div>
            </div>

            {/* Enhanced Main Content Area */}
            <div className="flex-1 min-w-0 -ml-4">
              {/* Product Grid with Enhanced Loading */}
              <div className="mt-8">
                {loading ? (
                  <div className="space-y-6">
                    {/* Loading Header */}
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                    
                    {/* Loading Grid */}
                    <ProductGrid
                      products={[]}
                      loading={true}
                      dir={isRTL ? "rtl" : "ltr"}
                      onAddToWishlist={handleAddToWishlist}
                      onAddToComparison={handleAddToComparison}
                      onProductView={handleProductView}
                      wishlist={wishlist}
                      comparisonList={comparisonList}
                    />
                  </div>
                ) : (
                  <ProductGrid
                    products={paginatedProducts}
                    loading={false}
                    dir={isRTL ? "rtl" : "ltr"}
                    onAddToWishlist={handleAddToWishlist}
                    onAddToComparison={handleAddToComparison}
                    onProductView={handleProductView}
                    wishlist={wishlist}
                    comparisonList={comparisonList}
                  />
                )}
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

              {/* Enhanced No Results State */}
              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-20">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                      <Search className="w-16 h-16 text-cyan-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">
                      No products found
                    </h3>
                    <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
                      We couldn't find any products matching your criteria. Try adjusting your filters or search terms to discover more products.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      onClick={handleClearFilters}
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Clear all filters
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSearch('')}
                      className="border-2 border-gray-200 hover:border-cyan-500 hover:bg-cyan-50 text-gray-700 hover:text-cyan-600 px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Browse all products
                    </Button>
                  </div>

                  {/* Quick Suggestions */}
                  <div className="mt-12 max-w-2xl mx-auto">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Try searching for:</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['soda maker', 'flavors', 'accessories', 'co2 cylinders', 'bottles'].map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="px-4 py-2 bg-gray-100 hover:bg-cyan-100 text-gray-700 hover:text-cyan-700 rounded-full text-sm font-medium transition-colors duration-200"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
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
