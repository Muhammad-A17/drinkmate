"use client"

// Flavor Page - Displays all flavor products with filtering options and bundles
// Version: 1.1.0
// Last updated: January 2025

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import PageLayout from "@/components/layout/PageLayout"
import { Star, Loader2, ShoppingCart, ChevronDown, Filter, X, Search } from "lucide-react"
import { shopAPI } from "@/lib/api"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

// Define product types
interface Product {
  _id: string
  id?: number
  slug?: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  category: string
  subcategory?: string
  rating: number
  reviews: number
  description?: string
  images?: Array<{ url: string; alt: string; isPrimary: boolean }>
  flavorType?: string
  isOnPromotion?: boolean
  isBundled?: boolean
  createdAt?: string
}

interface Bundle {
  _id: string
  id?: number
  slug: string
  name: string
  price: number
  originalPrice?: number
  image: string
  description: string
  rating: number
  reviews: number
  badge?: string
  category?: string
}

export default function FlavorPage() {
  const router = useRouter()
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // State for products and bundles
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [allFlavors, setAllFlavors] = useState<Product[]>([])
  const [subcategorySections, setSubcategorySections] = useState<Array<{ _id: string; name: string; products: Product[] }>>([])

  // Filter and sort state
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedSort, setSelectedSort] = useState("popularity")
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter and sort options based on subcategories
  const filterOptions = [
    { value: "all", label: "All Flavors" },
    ...subcategorySections.map(section => ({
      value: section._id,
      label: section.name
    }))
  ]

  const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "price-high-low", label: "Price High to Low" },
    { value: "price-low-high", label: "Price Low to High" },
    { value: "latest", label: "Latest Arrivals" },
  ]

  // Define fetch function
  async function fetchProducts() {
    try {
      setIsLoading(true)

      // Fetch bundles - try without category filter first
      console.log("Fetching all bundles to check what's available...")
      const allBundlesResponse = await shopAPI.getBundles({
        limit: 20,
      })
      console.log("All bundles response:", allBundlesResponse)
      console.log("All bundles found:", allBundlesResponse.bundles?.length || 0)
      
      // Now fetch with flavors category
      console.log("Fetching bundles for flavors category...")
      const bundlesResponse = await shopAPI.getBundles({
        category: "flavors",
        featured: true,
        limit: 4,
      })
      console.log("Flavors bundles response:", bundlesResponse)
      console.log("Flavors bundles array:", bundlesResponse.bundles)
      console.log("Number of flavors bundles found:", bundlesResponse.bundles?.length || 0)

      // Format bundles data - use all bundles temporarily to test
      const bundlesToUse = bundlesResponse.bundles?.length > 0 ? bundlesResponse.bundles : allBundlesResponse.bundles || []
      console.log("Using bundles:", bundlesToUse.length, "bundles")
      
      const formattedBundles = bundlesToUse.map((bundle: any) => {
        console.log("Processing bundle:", bundle.name, "Full bundle object:", bundle)
        return {
        _id: bundle._id,
        id: bundle._id,
        slug: bundle.slug,
        name: bundle.name,
        price: bundle.price,
        originalPrice: bundle.originalPrice,
        image: (() => {
          console.log("Bundle image data:", bundle.images)
          if (bundle.images && bundle.images.length > 0) {
            // Handle different image formats
            const firstImage = bundle.images[0]
            if (typeof firstImage === 'string') {
              return firstImage
            } else if (firstImage && firstImage.url) {
              return firstImage.url
            }
          }
          return "/images/01 - Flavors/Strawberry-Lemon-Flavor.png"
        })(),
        description: bundle.shortDescription || "Premium flavor bundle",
        rating: bundle.averageRating || 5,
        reviews: bundle.reviewCount || 300,
        badge: bundle.isFeatured ? "POPULAR" : bundle.isLimited ? "SALE" : undefined,
      }
      })

      setBundles(formattedBundles)
      console.log("Formatted bundles for flavors:", formattedBundles)

      // Fetch categories and find Flavors category
      const categoriesResp = await shopAPI.getCategories()
      const categoriesWithSubs = categoriesResp.categories || []
      const flavorsCat = categoriesWithSubs.find((c: any) => {
        const name = (c.name || '').toLowerCase()
        const slug = (c.slug || '').toLowerCase()
        return name.includes('flavor') || slug.includes('flavor')
      })
      const flavorSlug = flavorsCat?.slug || 'flavor'

      // Fetch products by category (returns subcategory field)
      const byCategoryResp = await shopAPI.getProductsByCategory(flavorSlug, { limit: 100 })
      const flavorProducts = byCategoryResp.products || []

      // Helper to pick first/primary image
      const pickImage = (imgs: any): string => {
        if (!imgs || imgs.length === 0) return "/images/01 - Flavors/Strawberry-Lemon-Flavor.png"
        const first = imgs[0]
        if (typeof first === 'string') return first
        return (imgs.find((img: any) => img.isPrimary)?.url) || first.url || "/images/01 - Flavors/Strawberry-Lemon-Flavor.png"
      }

      // Format products and capture subcategory
      const formattedFlavors = flavorProducts.map((product: any) => ({
        _id: product._id,
        id: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: pickImage(product.images),
        category: "flavors",
        subcategory: (typeof product.subcategory === 'string' ? product.subcategory : product.subcategory?._id) || product.subcategory,
        rating: product.averageRating || 5,
        reviews: product.reviewCount || 300,
        description: product.shortDescription,
        images: product.images,
      }))

      setAllFlavors(formattedFlavors)
      console.log("Formatted flavors:", formattedFlavors)
      console.log("Flavors category:", flavorsCat)
      console.log("Subcategories:", flavorsCat?.subcategories)

      // Build sections by subcategory
      const subs = (flavorsCat?.subcategories || []) as Array<{ _id: string; name: string }>
      const bySubId: Record<string, Product[]> = {}
      const bySubName: Record<string, Product[]> = {}
      
      for (const p of formattedFlavors) {
        const sid = p.subcategory || ''
        const sname = p.subcategory || ''
        
        // Group by ID
        if (!bySubId[sid]) bySubId[sid] = []
        bySubId[sid].push(p)
        
        // Group by name (fallback)
        if (!bySubName[sname]) bySubName[sname] = []
        bySubName[sname].push(p)
      }
      
      const sections: Array<{ _id: string; name: string; products: Product[] }> = []
      
      // First, try to match by subcategory ID
      for (const sc of subs) {
        const productsById = bySubId[sc._id] || []
        const productsByName = bySubName[sc.name] || []
        
        // Use the larger set of products
        const products = productsById.length > productsByName.length ? productsById : productsByName
        
        sections.push({ _id: sc._id, name: sc.name, products })
      }
      
      // Add any remaining products that don't match any subcategory
      const usedProductIds = new Set(sections.flatMap(s => s.products.map((p: Product) => p._id)))
      const otherProducts = formattedFlavors.filter((p: Product) => !usedProductIds.has(p._id))
      
      if (otherProducts.length > 0) {
        sections.push({ _id: 'others', name: 'Other Flavors', products: otherProducts })
      }
      
      // If no sections were created, create a default "All Flavors" section
      if (sections.length === 0 && formattedFlavors.length > 0) {
        sections.push({ _id: 'all', name: 'All Flavors', products: formattedFlavors })
      }
      
      console.log("Subcategory sections:", sections)
      setSubcategorySections(sections)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to load products. Please try again later.")

      // Fallback to static data if API fails
      setAllFlavors([
        {
          _id: "401",
          id: 401,
          slug: "italian-strawberry-lemon",
          name: "Italian Strawberry Lemon",
          price: 49.99,
          originalPrice: 59.99,
          image: "/images/01 - Flavors/Strawberry-Lemon-Flavor.png",
          category: "flavors",
          subcategory: undefined,
          rating: 5,
          reviews: 320,
          description: "Natural premium Italian flavor syrup",
        },
        {
          _id: "402",
          id: 402,
          slug: "italian-cola",
          name: "Italian Cola",
          price: 49.99,
          originalPrice: 59.99,
          image: "/images/01 - Flavors/Cola-Flavor.png",
          category: "flavors",
          subcategory: undefined,
          rating: 5,
          reviews: 280,
          description: "Classic cola flavor for your carbonated drinks",
        },
        {
          _id: "403",
          id: 403,
          slug: "mojito-mocktail",
          name: "Italian Mojito Mocktail",
          price: 49.99,
          originalPrice: 59.99,
          image: "/images/01 - Flavors/Mojito-Mocktails.png",
          category: "flavors",
          subcategory: undefined,
          rating: 5,
          reviews: 350,
          description: "Refreshing mojito flavor without the alcohol",
        },
      ])
      setSubcategorySections([])
      setBundles([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, []) // Empty dependency array means this effect runs once on mount

  function handleAddToCart(product: Product | Bundle) {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category,
    })
  }

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    let filteredProducts = [...allFlavors]

    // Apply filter based on subcategories
    if (selectedFilter !== "all") {
      // Find the selected subcategory section
      const selectedSection = subcategorySections.find(section => section._id === selectedFilter)
      if (selectedSection) {
        // Filter products that belong to this subcategory
        filteredProducts = filteredProducts.filter(product => 
          product.subcategory === selectedSection.name
        )
      }
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      )
    }

    // Apply sort
    switch (selectedSort) {
      case "popularity":
        filteredProducts.sort((a, b) => b.rating - a.rating)
        break
      case "price-high-low":
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case "price-low-high":
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case "latest":
        filteredProducts.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
        break
      default:
        filteredProducts.sort((a, b) => b.rating - a.rating)
    }

    return filteredProducts
  }

  const clearFilters = () => {
    setSelectedFilter("all")
    setSelectedSort("popularity")
    setSearchQuery("")
  }

  // Function to render star ratings
  function renderStars(rating: number) {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />,
      )
    }
    return <div className="flex">{stars}</div>
  }

  // Function to render product cards
  function renderProductCard(product: Product) {
    const isInCartStatus = isInCart(product._id)
    const discountPercentage = product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0

    return (
      <div
        key={product.id}
        className="bg-white rounded-3xl p-6 flex flex-col border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 transition-all duration-300"
      >
        <Link href={`/shop/flavor/${(product as any).slug || product._id}`} className="block">
          <div className="relative h-52 bg-white rounded-3xl mb-6 flex items-center justify-center overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={180}
              height={180}
              className="object-contain h-44 transition-transform duration-300 hover:scale-105"
            />
          </div>
          <h3 className="text-xl mb-3 hover:text-[#12d6fa] transition-colors leading-tight">{product.name}</h3>
        </Link>

        <div className="flex items-center gap-3 mb-4">
          {renderStars(product.rating)}
          <span className="text-sm text-gray-600">({product.reviews} Reviews)</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2">
            {product.originalPrice && (
              <>
                <span className="text-gray-500 text-sm line-through">
                  <SaudiRiyal amount={product.originalPrice} size="sm" />
                </span>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-xl text-gray-900">
                <SaudiRiyal amount={product.price} size="md" />
              </span>
            </div>
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={isInCartStatus}
              className="bg-gradient-to-r from-[#16d6fa] to-[#12d6fa] hover:from-[#14c4e8] hover:to-[#10b8d6] text-black rounded-full w-full sm:w-auto justify-center px-4 sm:px-6 py-2 h-10 text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isInCartStatus ? "Added" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageLayout currentPage="shop-flavor">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-medium mb-8 text-gray-900">Explore Our Premium Flavors</h1>

        <div className="w-full h-[570px] md:h-[350px] mb-12 relative overflow-hidden rounded-2xl shadow-lg">
          {/* Desktop Banner */}
          <Image
            src="/images/banner/flavor banner.webp"
            alt="Flavor Banner"
            fill
            className="object-cover object-center hidden md:block"
            priority
            quality={90}
            sizes="(max-width: 768px) 100vw, 100vw"
            loading="eager"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjVmOSIvPjwvc3ZnPg=="
          />
          {/* Mobile Banner */}
          <Image
            src="/images/banner/flavor mobile.webp"
            alt="Flavor Banner Mobile"
            fill
            className="object-cover object-center md:hidden"
            priority
            quality={90}
            sizes="100vw"
            loading="eager"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjVmOSIvPjwvc3ZnPg=="
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 shadow-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-[#12d6fa] mb-4" />
            <p className="text-gray-600 font-medium">Loading premium products...</p>
          </div>
        ) : (
          <>
            {/* Bundles & Promotions Section */}
            <div className="mb-16">
              <h2 className="text-xl font-medium mb-6 text-gray-900">Bundles & Promotions</h2>
              {bundles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {bundles.map((bundle) => (
                    <div
                      key={bundle._id}
                      className="bg-white rounded-3xl transition-all duration-300 p-6 flex flex-col border border-gray-100 hover:border-gray-200 relative transform hover:-translate-y-1"
                    >
                      <Link href={`/shop/flavor/bundles/${bundle.slug}`} className="block">
                        <div className="relative h-52 bg-white rounded-3xl mb-6 flex items-center justify-center overflow-hidden">
                          <Image
                            src={bundle.image || "/placeholder.svg"}
                            alt={bundle.name}
                            width={180}
                            height={180}
                            className="object-contain h-44 transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              console.log("Image failed to load:", bundle.image)
                              e.currentTarget.src = "/images/01 - Flavors/Strawberry-Lemon-Flavor.png"
                            }}
                          />
                        </div>
                        <h3 className="font-medium text-lg mb-3 line-clamp-2 text-gray-900 hover:text-[#12d6fa] transition-colors">
                          {bundle.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-3 mb-4">
                        {renderStars(bundle.rating)}
                        <span className="text-sm text-gray-600">({bundle.reviews} Reviews)</span>
                      </div>

                      <div className="mt-auto">
                        <p className="text-sm text-gray-600 mb-4">{bundle.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          {bundle.originalPrice && (
                            <>
                              <span className="text-gray-500 text-sm line-through">
                                <SaudiRiyal amount={bundle.originalPrice} size="sm" />
                              </span>
                              <span className="bg-red-50 text-red-500 text-xs font-normal px-2 py-0.5 rounded-full">
                                {Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-xl text-gray-900">
                              <SaudiRiyal amount={bundle.price} size="lg" />
                            </span>
                          </div>
                          <Button
                            onClick={() => handleAddToCart({
                              _id: bundle._id,
                              id: typeof bundle.id === 'number' ? bundle.id : undefined,
                              slug: bundle.slug,
                              name: bundle.name,
                              price: bundle.price,
                              originalPrice: bundle.originalPrice,
                              image: bundle.image,
                              category: "bundle",
                              rating: bundle.rating,
                              reviews: bundle.reviews,
                              description: bundle.description
                            })}
                            disabled={isInCart(bundle._id)}
                            className="bg-gradient-to-r from-[#16d6fa] to-[#12d6fa] hover:from-[#14c4e8] hover:to-[#10b8d6] text-black rounded-full w-full sm:w-auto justify-center px-4 sm:px-6 py-2 h-10 text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {isInCart(bundle._id) ? "Added" : "Add"}
                          </Button>
                        </div>
                      </div>
                      {bundle.badge && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#16d6fa] to-[#12d6fa] text-black text-xs px-3 py-2 rounded-full shadow-lg">
                          {bundle.badge}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl">
                  <p className="text-gray-600">No bundles available for flavors at the moment.</p>
                  <p className="text-sm text-gray-500 mt-2">Check back soon for exciting bundle deals!</p>
                </div>
              )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Mobile filter toggle */}
                <div className="lg:hidden">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    className="w-full flex items-center justify-between py-3 rounded-xl border-gray-200 hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </Button>
                </div>

                {/* Desktop filters */}
                <div className={`${showFilters ? "block" : "hidden"} lg:block space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-8`}>
                  {/* Search */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search flavors..."
                        className="w-full pl-9 pr-3 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#12d6fa]/20 focus:border-[#12d6fa] focus:bg-white text-sm transition-all duration-200"
                      />
                    </div>
                    {(selectedFilter !== "all" || searchQuery) && (
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors duration-200"
                      >
                        <X className="w-3.5 h-3.5" /> Clear
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdown */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">Filters</label>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#12d6fa]/20 focus:border-[#12d6fa] bg-gray-50 focus:bg-white transition-all duration-200"
                    >
                      {filterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sort By</label>
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#12d6fa]/20 focus:border-[#12d6fa] bg-gray-50 focus:bg-white transition-all duration-200"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results count */}
                <div className="text-sm text-gray-600 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                  {(() => {
                    if (selectedFilter === "all") {
                      return `${allFlavors.length} ${allFlavors.length === 1 ? "product" : "products"} found`
                    } else {
                      const selectedSection = subcategorySections.find(section => section._id === selectedFilter)
                      if (!selectedSection) return "0 products found"
                      
                      let filteredProducts = [...selectedSection.products]
                      if (searchQuery.trim()) {
                        const query = searchQuery.trim().toLowerCase()
                        filteredProducts = filteredProducts.filter(product =>
                          product.name.toLowerCase().includes(query) ||
                          product.description?.toLowerCase().includes(query)
                        )
                      }
                      return `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} found`
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Conditional Rendering based on filter selection */}
            {selectedFilter === "all" ? (
              /* Show all subcategories with headlines when "All Flavors" is selected */
              subcategorySections.length > 0 && subcategorySections.map((section) => (
                <div key={section._id} className="mb-16">
                  <h2 className="text-xl font-medium mb-6 text-gray-900">{section.name}</h2>
                  {section.products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                      {section.products.map((product) => renderProductCard(product))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl shadow-inner">
                      <div className="text-gray-400 mb-6">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">No products in this subcategory</h3>
                      <Button onClick={() => router.push("/admin/products")} className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                        Add Products (Admin)
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              /* Show filtered products with subcategory headline when specific subcategory is selected */
              (() => {
                console.log("Selected filter:", selectedFilter)
                console.log("Subcategory sections:", subcategorySections)
                const selectedSection = subcategorySections.find(section => section._id === selectedFilter)
                console.log("Selected section:", selectedSection)
                if (!selectedSection) {
                  console.log("No selected section found, returning null")
                  return null
                }
                
                // Apply search and sort to the selected section's products
                let filteredProducts = [...selectedSection.products]
                console.log("Selected section products:", selectedSection.products)
                console.log("Filtered products before search/sort:", filteredProducts)
                
                // Apply search
                if (searchQuery.trim()) {
                  const query = searchQuery.trim().toLowerCase()
                  filteredProducts = filteredProducts.filter(product =>
                    product.name.toLowerCase().includes(query) ||
                    product.description?.toLowerCase().includes(query)
                  )
                }
                
                // Apply sort
                switch (selectedSort) {
                  case "popularity":
                    filteredProducts.sort((a, b) => b.rating - a.rating)
                    break
                  case "price-high-low":
                    filteredProducts.sort((a, b) => b.price - a.price)
                    break
                  case "price-low-high":
                    filteredProducts.sort((a, b) => a.price - b.price)
                    break
                  case "latest":
                    filteredProducts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                    break
                }
                
                console.log("Final filtered products:", filteredProducts)
                console.log("Filtered products length:", filteredProducts.length)
                
                return filteredProducts.length > 0 ? (
                  <div>
                    {/* Show the selected subcategory headline */}
                    <h2 className="text-xl font-medium mb-6 text-gray-900">
                      {selectedSection.name}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                      {filteredProducts.map((product) => renderProductCard(product))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                    <p className="text-gray-500 mb-4">
                      No products match your current filters. Try adjusting your selection.
                    </p>
                    <Button
                      onClick={clearFilters}
                      className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )
              })()
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}