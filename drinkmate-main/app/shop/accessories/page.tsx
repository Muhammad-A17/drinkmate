"use client"

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
import BundleStyleProductCard from "@/components/shop/BundleStyleProductCard"

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

export default function AccessoriesPage() {
  const router = useRouter()
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // State for products and bundles
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [bundleSubcategorySections, setBundleSubcategorySections] = useState<Array<{ _id: string; name: string; bundles: Bundle[] }>>([])
  const [allAccessories, setAllAccessories] = useState<Product[]>([])
  const [subcategorySections, setSubcategorySections] = useState<Array<{ _id: string; name: string; products: Product[] }>>([])

  // Filter and sort state
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedSort, setSelectedSort] = useState("popularity")
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter and sort options based on subcategories
  const filterOptions = [
    { value: "all", label: "All Accessories" },
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

  // Fetch products and bundles from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)

        // Fetch bundles for accessories category only
        console.log("Fetching bundles for accessories category...")
        const bundlesResponse = await shopAPI.getBundles({
          category: "accessories",
          limit: 4,
        })
        console.log("Accessories bundles response:", bundlesResponse)
        console.log("Accessories bundles array:", bundlesResponse.bundles)
        console.log("Number of accessories bundles found:", bundlesResponse.bundles?.length || 0)

        // Format bundles data - only use accessories bundles
        const bundlesToUse = bundlesResponse.bundles || []
        console.log("Using accessories bundles:", bundlesToUse.length, "bundles")
        
        const formattedBundles = bundlesToUse.map((bundle: any) => {
          console.log("Processing bundle:", bundle.name, "Full bundle object:", bundle)
          return {
          _id: bundle._id,
          id: bundle._id,
          slug: bundle.slug,
          name: bundle.name,
          price: bundle.price,
          originalPrice: bundle.originalPrice,
          subcategory: bundle.subcategory || "Bundles & Promotions of Accessories",
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
            return "/images/empty-drinkmate-bottle.png"
          })(),
          description: bundle.shortDescription || "Accessories bundle pack",
          rating: bundle.averageRating || 5,
          reviews: bundle.reviewCount || 320,
          badge: bundle.isFeatured ? "POPULAR" : bundle.isLimited ? "SALE" : undefined,
        }
        })

        setBundles(formattedBundles)
        console.log("Formatted bundles for accessories:", formattedBundles)

        // Organize bundles by subcategory
        const bundleBySubcategory: Record<string, Bundle[]> = {}
        for (const bundle of formattedBundles) {
          const subcategory = bundle.subcategory || "Bundles & Promotions of Accessories"
          if (!bundleBySubcategory[subcategory]) {
            bundleBySubcategory[subcategory] = []
          }
          bundleBySubcategory[subcategory].push(bundle)
        }
        
        const bundleSections = Object.entries(bundleBySubcategory).map(([subcategory, bundles]) => ({
          _id: subcategory.toLowerCase().replace(/\s+/g, '-'),
          name: subcategory,
          bundles
        }))
        
        setBundleSubcategorySections(bundleSections)
        console.log("Bundle subcategory sections:", bundleSections)

        // Get categories using public API (no login required)
        let categoriesResponse
        try {
          categoriesResponse = await shopAPI.getCategories()
        } catch (error) {
          console.log("Could not fetch categories, will use fallback filtering")
          categoriesResponse = { categories: [] }
        }

        const accessoriesCategory = categoriesResponse.categories?.find(
          (cat: any) => cat.name === "Accessories" || cat.slug === "accessories",
        )

        console.log("Accessories category:", accessoriesCategory)

        // Fetch all products and filter by category
        const allProductsResponse = await shopAPI.getProducts({
          limit: 50,
        })

        console.log("All products response:", allProductsResponse)

        // Instead of filtering locally, fetch by category using slug (ensures subcategory field present)
        const byCategoryResp = await shopAPI.getProductsByCategory('accessories', { limit: 100 })
        const accessoriesProducts = byCategoryResp.products || []

        // Helper to pick first/primary image
        const pickImage = (imgs: any): string => {
          if (!imgs || imgs.length === 0) return "/images/empty-drinkmate-bottle.png"
          const first = imgs[0]
          if (typeof first === 'string') return first
          return (imgs.find((img: any) => img.isPrimary)?.url) || first.url || "/images/empty-drinkmate-bottle.png"
        }

        // Format accessories products and capture subcategory
        const formattedAccessories = accessoriesProducts.map((product: any) => ({
          _id: product._id,
          id: product._id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: pickImage(product.images),
          category: "accessories",
          subcategory: (typeof product.subcategory === 'string' ? product.subcategory : product.subcategory?._id) || product.subcategory,
          rating: product.averageRating || 5,
          reviews: product.reviewCount || 300,
          description: product.shortDescription,
          images: product.images,
        }))

        setAllAccessories(formattedAccessories)

        // Build sections by subcategory
        const subs = (accessoriesCategory?.subcategories || []) as Array<{ _id: string; name: string }>
        const bySubId: Record<string, Product[]> = {}
        for (const p of formattedAccessories) {
          const sid = p.subcategory || ''
          if (!bySubId[sid]) bySubId[sid] = []
          bySubId[sid].push(p)
        }
        const sections: Array<{ _id: string; name: string; products: Product[] }> = []
        for (const sc of subs) {
          sections.push({ _id: sc._id, name: sc.name, products: (bySubId[sc._id] || []) })
        }
        const otherProducts = Object.entries(bySubId)
          .filter(([sid]) => !subs.find(s => s._id === sid))
          .flatMap(([_, arr]) => arr)
        if (otherProducts.length > 0) {
          sections.push({ _id: 'others', name: 'Other Accessories', products: otherProducts })
        }
        setSubcategorySections(sections)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Failed to load products. Please try again later.")

        // Fallback to static data if API fails
        setBundles([
          {
            _id: "601",
            id: 601,
            slug: "bottles-pack-of-3",
            name: "Bottles Pack of 3",
            price: 599.99,
            originalPrice: 699.99,
            image: "/images/empty-drinkmate-bottle.png",
            category: "accessories",
            rating: 5,
            reviews: 320,
            description: "3 x Carbonating Bottles for Drinkmate",
          },
          {
            _id: "602",
            id: 602,
            slug: "bottles-pack-of-3-2",
            name: "Bottles Pack of 3",
            price: 599.99,
            originalPrice: 699.99,
            image: "/images/empty-drinkmate-bottle.png",
            category: "accessories",
            rating: 5,
            reviews: 320,
            description: "3 x Carbonating Bottles for Drinkmate",
          },
        ])

        setAllAccessories([
          {
            _id: "501",
            id: 501,
            slug: "500ml-bottle-black",
            name: "500ml Bottle - Black",
            price: 42.99,
            originalPrice: 49.99,
            image: "/images/empty-drinkmate-bottle.png",
            category: "accessories",
            subcategory: undefined,
            rating: 5,
            reviews: 320,
            description: "BPA-free carbonating bottle for your Drinkmate",
          },
          {
            _id: "502",
            id: 502,
            slug: "1l-bottle-black",
            name: "1L Bottle - Black",
            price: 75.0,
            originalPrice: 85.0,
            image: "/images/empty-drinkmate-bottle.png",
            category: "accessories",
            subcategory: undefined,
            rating: 5,
            reviews: 280,
            description: "Compact BPA-free carbonating bottle",
          },
        ])
        setSubcategorySections([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = (product: Product) => {
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
    let filteredProducts = [...allAccessories]

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
  const renderStars = (rating: number) => {
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

  // Function to render product cards using bundle-style ProductCard component
  const renderProductCard = (product: Product) => {
    const handleAddToCart = (item: any) => {
      addItem(item)
    }

    const handleAddToWishlist = (product: any) => {
      // Add wishlist functionality if needed
    }

    const handleAddToComparison = (product: any) => {
      // Add comparison functionality if needed
    }

    const handleProductView = (product: any) => {
      // Add product view functionality if needed
    }

    return (
      <BundleStyleProductCard
        key={product._id}
        product={{
          _id: product._id,
          id: product._id,
          name: product.name,
          slug: (product as any).slug || product._id,
          title: product.name,
          image: product.image,
          price: product.price,
          compareAtPrice: product.originalPrice,
          rating: product.rating || 0,
          reviewCount: product.reviews || 0,
          description: product.description,
          category: product.category,
          inStock: true,
          badges: (product as any).badge ? [(product as any).badge] : undefined,
          // Pass the images array as well for better image handling
          images: product.images
        }}
        onAddToCart={({ productId, qty }: { productId: string; qty: number }) => {
          handleAddToCart({
            _id: productId,
            name: product.name,
            price: product.price,
            quantity: qty,
            image: product.image,
            category: product.category,
          })
        }}
        onAddToWishlist={handleAddToWishlist}
        onAddToComparison={handleAddToComparison}
        onProductView={handleProductView}
        className="h-full"
      />
    )
  }

  return (
    <PageLayout currentPage="shop-accessories">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-medium mb-6 sm:mb-8 text-gray-900">Explore Our Accessories</h1>

        {/* Hero section - Accessories Banner */}
        <div className="w-full h-[300px] sm:h-[400px] md:h-[350px] mb-8 sm:mb-12 relative overflow-hidden rounded-2xl shadow-lg">
          {/* Desktop Banner */}
          <Image
            src="/images/banner/WhatsApp Image 2025-08-27 at 7.09.33 PM (1).webp"
            alt="Accessories Banner"
            fill
            className="object-cover object-center hidden md:block"
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
          />
          {/* Mobile Banner */}
          <Image
            src="/images/banner/WhatsApp Image 2025-08-27 at 7.09.32 PM (1).webp"
            alt="Accessories Banner Mobile"
            fill
            className="object-cover object-center md:hidden"
            priority
            sizes="100vw"
          />
        </div>

        {/* Error message */}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-6 sm:mb-8 shadow-sm">{error}</div>}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-[#12d6fa] mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600 font-medium">Loading premium accessories...</p>
          </div>
        ) : (
          <>
            {/* Bundles & Promotions Section */}
            <div className="mb-12 sm:mb-16">
             
              {bundleSubcategorySections.length > 0 ? (
                <div className="space-y-8 sm:space-y-12">
                  {bundleSubcategorySections.map((section) => (
                    <div key={section._id} className="space-y-4 sm:space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        {section.name}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {section.bundles.map((bundle) => (
                          <BundleStyleProductCard
                            key={bundle._id}
                            product={{
                              _id: bundle._id,
                              id: bundle._id,
                              name: bundle.name,
                              slug: bundle.slug,
                              title: bundle.name,
                              image: bundle.image || "/placeholder.svg",
                              price: bundle.price,
                              compareAtPrice: bundle.originalPrice,
                              rating: bundle.rating || 0,
                              reviewCount: bundle.reviews || 0,
                              description: bundle.description,
                              category: "bundle",
                              inStock: true,
                              badges: bundle.badge ? [bundle.badge] : undefined,
                            }}
                            onAddToCart={({ productId, qty }: { productId: string; qty: number }) => {
                              handleAddToCart({
                                _id: productId,
                                id: bundle.id && typeof bundle.id === 'number' ? bundle.id : undefined,
                                slug: bundle.slug || '',
                                name: bundle.name,
                                price: bundle.price,
                                originalPrice: bundle.originalPrice,
                                image: bundle.image || '/placeholder.svg',
                                category: "bundle",
                                rating: bundle.rating || 5,
                                reviews: bundle.reviews || 0,
                                description: bundle.description || ''
                              })
                            }}
                            onAddToWishlist={() => {}}
                            onAddToComparison={() => {}}
                            onProductView={() => {}}
                            className="h-full"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl">
                  <p className="text-gray-600">No bundles available for accessories at the moment.</p>
                  <p className="text-sm text-gray-500 mt-2">Check back soon for exciting bundle deals!</p>
                </div>
              )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                {/* Mobile filter toggle */}
                <div className="lg:hidden">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    className="w-full flex items-center justify-between py-2.5 sm:py-3 rounded-xl border-gray-200 hover:bg-gray-50 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </Button>
                </div>

                {/* Desktop filters */}
                <div className={`${showFilters ? "block" : "hidden"} lg:flex space-y-3 sm:space-y-4 lg:space-y-0 lg:items-center lg:gap-6 xl:gap-8`}>
                  {/* Search */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search accessories..."
                        className="w-full pl-9 pr-3 py-2.5 sm:py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#12d6fa]/20 focus:border-[#12d6fa] focus:bg-white text-sm transition-all duration-200"
                      />
                    </div>
                    {(selectedFilter !== "all" || searchQuery) && (
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors duration-200"
                      >
                        <X className="w-3.5 h-3.5" /> Clear
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdown */}
                  <div className="flex flex-col space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Filters</label>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#12d6fa]/20 focus:border-[#12d6fa] bg-gray-50 focus:bg-white transition-all duration-200"
                      title="Filter accessories by category"
                    >
                      {filterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div className="flex flex-col space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Sort By</label>
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#12d6fa]/20 focus:border-[#12d6fa] bg-gray-50 focus:bg-white transition-all duration-200"
                      title="Sort accessories by"
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
                <div className="text-xs sm:text-sm text-gray-600 font-medium bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                  {(() => {
                    if (selectedFilter === "all") {
                      return `${allAccessories.length} ${allAccessories.length === 1 ? "product" : "products"} found`
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
              /* Show all subcategories with headlines when "All Accessories" is selected */
              subcategorySections.length > 0 && subcategorySections.map((section) => (
                <div key={section._id} className="mb-12 sm:mb-16">
                  <h2 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-gray-900">{section.name}</h2>
                  {section.products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                      {section.products.map((product) => renderProductCard(product))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-lg text-gray-900 mb-2">No products in this subcategory</h3>
                      <p className="text-gray-500 mb-4">We're working on adding more products.</p>
                      <Button onClick={() => router.push("/admin/products")} className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white">
                        Add Products (Admin)
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              /* Show filtered products with subcategory headline when specific subcategory is selected */
              (() => {
                const selectedSection = subcategorySections.find(section => section._id === selectedFilter)
                if (!selectedSection) return null
                
                // Apply search and sort to the selected section's products
                let filteredProducts = [...selectedSection.products]
                
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
                
                return filteredProducts.length > 0 ? (
                  <div>
                    {/* Show the selected subcategory headline */}
                    <h2 className="text-2xl font-medium mb-6 text-gray-900">
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
