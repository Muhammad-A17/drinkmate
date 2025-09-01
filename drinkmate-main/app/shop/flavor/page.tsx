"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import PageLayout from "@/components/layout/PageLayout"
import { Star, Loader2, ShoppingCart, Filter, ChevronDown } from "lucide-react"
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

// Filter and sort options
const filterOptions = [
  { value: "all", label: "All Flavors" },
  { value: "italian", label: "Italian Flavors" },
  { value: "natural", label: "Natural Flavors" },
  { value: "energy", label: "Energy Flavors" },
  { value: "promotion", label: "On Promotion" },
  { value: "bundled", label: "Bundled Items" },
]

const sortOptions = [
  { value: "popularity", label: "Popularity" },
  { value: "price-high-low", label: "Price High to Low" },
  { value: "price-low-high", label: "Price Low to High" },
  { value: "latest", label: "Latest Arrivals" },
]

export default function FlavorPage() {
  const router = useRouter()
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Filter and sort state
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedSort, setSelectedSort] = useState("popularity")
  const [showFilters, setShowFilters] = useState(false)

  // State for all products
  const [allFlavors, setAllFlavors] = useState<Product[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])

  // Define fetch function
  async function fetchProducts() {
    try {
      setIsLoading(true)

      // Fetch bundles
      const bundlesResponse = await shopAPI.getBundles({
        category: "flavors",
        featured: true,
        limit: 4,
      })

      // Format bundles data
      const formattedBundles = bundlesResponse.bundles.map((bundle: any) => ({
        _id: bundle._id,
        id: bundle._id,
        slug: bundle.slug,
        name: bundle.name,
        price: bundle.price,
        originalPrice: bundle.originalPrice,
        image:
          bundle.images && bundle.images.length > 0
            ? bundle.images[0].url
            : "/images/01 - Flavors/Strawberry-Lemon-Flavor.png",
        description: bundle.shortDescription || "Premium Italian flavor bundle",
        rating: bundle.averageRating || 5,
        reviews: bundle.reviewCount || 300,
        badge: bundle.isFeatured ? "POPULAR" : bundle.isLimited ? "SALE" : undefined,
      }))

      setBundles(formattedBundles)

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

      // Format products and add flavor type classification
      const formattedFlavors = flavorProducts.map((product: any) => {
        // Determine flavor type based on name or subcategory
        let flavorType = "italian" // default
        const name = product.name.toLowerCase()
        const subcategory = (product.subcategory?.name || "").toLowerCase()
        
        if (name.includes("natural") || subcategory.includes("natural")) {
          flavorType = "natural"
        } else if (name.includes("energy") || subcategory.includes("energy")) {
          flavorType = "energy"
        } else if (name.includes("italian") || subcategory.includes("italian")) {
          flavorType = "italian"
        }

        return {
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
          flavorType,
          isOnPromotion: product.originalPrice && product.originalPrice > product.price,
          isBundled: false, // Individual products are not bundled
          createdAt: product.createdAt,
        }
      })

      setAllFlavors(formattedFlavors)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to load products. Please try again later.")

      // Fallback to static data if API fails
      const fallbackFlavors = [
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
          flavorType: "italian",
          isOnPromotion: true,
          isBundled: false,
          createdAt: "2024-01-01",
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
          flavorType: "italian",
          isOnPromotion: true,
          isBundled: false,
          createdAt: "2024-01-02",
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
          flavorType: "italian",
          isOnPromotion: true,
          isBundled: false,
          createdAt: "2024-01-03",
        },
      ]

      setAllFlavors(fallbackFlavors)
      setBundles([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    let filteredProducts = [...allFlavors]

    // Apply filter
    if (selectedFilter !== "all") {
      switch (selectedFilter) {
        case "italian":
          filteredProducts = filteredProducts.filter(product => product.flavorType === "italian")
          break
        case "natural":
          filteredProducts = filteredProducts.filter(product => product.flavorType === "natural")
          break
        case "energy":
          filteredProducts = filteredProducts.filter(product => product.flavorType === "energy")
          break
        case "promotion":
          filteredProducts = filteredProducts.filter(product => product.isOnPromotion)
          break
        case "bundled":
          filteredProducts = filteredProducts.filter(product => product.isBundled)
          break
      }
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

  function handleAddToCart(product: Product) {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category,
    })
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
            {product.isOnPromotion && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {discountPercentage}% OFF
              </div>
            )}
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

  const filteredProducts = getFilteredAndSortedProducts()

  return (
    <PageLayout currentPage="shop-flavor">
      <div className="container mx-auto px-4 py-8">
        {/* Hero section - Flavor Banner */}
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

        <h1 className="text-4xl font-bold mb-8 text-gray-900 tracking-tight">Flavors</h1>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Mobile filter toggle */}
            <div className="lg:hidden">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="w-full flex items-center justify-between"
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
              {/* Filter Dropdown */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">Filters</label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] bg-white"
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
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] bg-white"
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
            <div className="text-sm text-gray-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-[#12d6fa] mb-6" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-[#12d6fa]/20"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Loading premium products...</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => renderProductCard(product))}
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
                  onClick={() => {
                    setSelectedFilter("all")
                    setSelectedSort("popularity")
                  }}
                  className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}