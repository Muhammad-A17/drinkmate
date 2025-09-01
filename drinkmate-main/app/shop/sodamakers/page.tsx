"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import PageLayout from "@/components/layout/PageLayout"
import { Star, Loader2, Filter, ChevronDown } from "lucide-react"
import { shopAPI } from "@/lib/api"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

// Define product types
interface Product {
  _id: string
  id?: number
  slug: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  category: string
  rating: number
  reviews: number
  color?: string
  description?: string
  images?: Array<{ url: string; alt: string; isPrimary: boolean }>
  machineType?: string
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
}

// Filter and sort options
const machineTypeOptions = [
  { value: "all", label: "All" },
  { value: "omnifizz", label: "Omni-Fizz Soda Maker" },
  { value: "luxe", label: "Luxe Soda Maker" },
]

const sortOptions = [
  { value: "popularity", label: "Popularity" },
  { value: "price-high-low", label: "Price High to Low" },
  { value: "price-low-high", label: "Price Low to High" },
  { value: "latest", label: "Latest Arrivals" },
  { value: "promotion", label: "On Promotion" },
  { value: "bundled", label: "Bundled Items" },
]

export default function SodamakersPage() {
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Filter and sort state
  const [selectedMachineType, setSelectedMachineType] = useState("all")
  const [selectedSort, setSelectedSort] = useState("popularity")
  const [showFilters, setShowFilters] = useState(false)

  // State for all products
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])

  // Fetch products and bundles from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)

        // Fetch bundles
        const bundlesResponse = await shopAPI.getBundles({
          limit: 20,
        })

        console.log("Bundles API Response:", bundlesResponse)
        console.log("Raw bundles:", bundlesResponse.bundles)

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
              ? bundle.images[0]
              : "/images/04 - Kits/Starter-Kit---Example---Do-Not-Use.png",
          description: bundle.description || "Premium kit with machine and accessories",
          rating: bundle.averageRating || 4.5,
          reviews: bundle.reviewCount || 300,
          badge: bundle.isFeatured ? "POPULAR" : bundle.isLimited ? "SALE" : undefined,
        }))

        console.log("Formatted bundles:", formattedBundles)
        setBundles(formattedBundles)

        // Fetch all soda maker products
        const allProductsResponse = await shopAPI.getProducts({
          limit: 50,
        })

        console.log("API Response:", allProductsResponse)

        // Filter products by category name
        const allProducts = allProductsResponse.products || []

        console.log("All Products:", allProducts)

        // Filter soda maker products and add machine type classification
        const sodaMakerProducts = allProducts
          .filter(
            (product: any) =>
              product.category === "sodamakers" ||
              product.category === "machines" ||
              product.name.toLowerCase().includes("soda") ||
              product.name.toLowerCase().includes("drinkmate") ||
              product.name.toLowerCase().includes("omnifizz") ||
              product.name.toLowerCase().includes("luxe"),
          )
          .map((product: any) => {
            // Determine machine type
            let machineType = "omnifizz" // default
            if (product.name.toLowerCase().includes("luxe")) {
              machineType = "luxe"
            } else if (product.name.toLowerCase().includes("omnifizz")) {
              machineType = "omnifizz"
            }

            return {
              _id: product._id,
              id: product._id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              image:
                product.images && product.images.length > 0
                  ? product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url
                  : "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
              category: "machines",
              rating: product.averageRating || 4.7,
              reviews: product.reviewCount || 350,
              color: product.colors && product.colors.length > 0 ? product.colors[0].name : undefined,
              images: product.images,
              machineType,
              isOnPromotion: product.originalPrice && product.originalPrice > product.price,
              isBundled: false, // Individual products are not bundled
              createdAt: product.createdAt,
            }
          })

        console.log("Soda Maker Products with machine types:", sodaMakerProducts)
        setAllProducts(sodaMakerProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Failed to load products. Please try again later.")

        // Fallback to static data if API fails
        const fallbackProducts = [
          {
            _id: "201",
            id: 201,
            slug: "omnifizz-soda-maker-artic-black",
            name: "OmniFizz Soda Maker - Artic Black",
            price: 599.99,
            originalPrice: 699.99,
            image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
            category: "machines",
            rating: 4.9,
            reviews: 450,
            color: "Black",
            machineType: "omnifizz",
            isOnPromotion: true,
            isBundled: false,
            createdAt: "2024-01-01",
          },
          {
            _id: "202",
            id: 202,
            slug: "omnifizz-soda-maker-artic-blue",
            name: "OmniFizz Soda Maker - Artic Blue",
            price: 599.99,
            originalPrice: 699.99,
            image: "/images/02 - Soda Makers/Artic-Blue-Machine---Front.png",
            category: "machines",
            rating: 4.8,
            reviews: 380,
            color: "Blue",
            machineType: "omnifizz",
            isOnPromotion: true,
            isBundled: false,
            createdAt: "2024-01-02",
          },
          {
            _id: "301",
            id: 301,
            slug: "luxe-soda-maker-stainless-steel",
            name: "Luxe Soda Maker - Stainless Steel",
            price: 799.99,
            originalPrice: 999.99,
            image: "/images/02 - Soda Makers/Banner-Luxe-Machine.png",
            category: "machines",
            rating: 4.9,
            reviews: 450,
            color: "Stainless Steel",
            machineType: "luxe",
            isOnPromotion: true,
            isBundled: false,
            createdAt: "2024-01-03",
          },
        ]

        setAllProducts(fallbackProducts)
        setBundles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    let filteredProducts = [...allProducts]

    // Apply machine type filter
    if (selectedMachineType !== "all") {
      filteredProducts = filteredProducts.filter(product => product.machineType === selectedMachineType)
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
      case "promotion":
        filteredProducts = filteredProducts.filter(product => product.isOnPromotion)
        break
      case "bundled":
        filteredProducts = filteredProducts.filter(product => product.isBundled)
        break
      default:
        filteredProducts.sort((a, b) => b.rating - a.rating)
    }

    return filteredProducts
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category,
      color: product.color || undefined,
    })
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

  // Function to render product cards
  const renderProductCard = (product: Product) => {
    const isInCartStatus = isInCart(product._id)
    const discountPercentage = product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0

    return (
      <div
        key={product._id}
        className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
      >
        <Link href={`/shop/sodamakers/${product._id}`} className="block">
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
          <h3 className="font-bold text-xl mb-3 hover:text-[#12d6fa] transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2">
            {product.originalPrice && (
              <>
                <span className="text-gray-500 text-sm line-through font-medium">
                  <SaudiRiyal amount={product.originalPrice} size="sm" />
                </span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <span className="font-bold text-2xl text-gray-900">
                <SaudiRiyal amount={product.price} size="lg" />
              </span>
            </div>
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={isInCartStatus}
              className="bg-gradient-to-r from-[#16d6fa] to-[#12d6fa] hover:from-[#14c4e8] hover:to-[#10b8d6] text-black font-bold rounded-full px-8 py-2 h-10 text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInCartStatus ? "ADDED" : "BUY"}
            </Button>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            {renderStars(product.rating)}
            <span className="text-sm text-gray-600 font-medium">({product.reviews} Reviews)</span>
          </div>
        </div>
      </div>
    )
  }

  const filteredProducts = getFilteredAndSortedProducts()

  return (
    <PageLayout currentPage="shop-sodamakers">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 tracking-tight">Soda Makers</h1>

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
              {/* Machine Type Filter */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">Machine Type</label>
                <div className="flex flex-wrap gap-2">
                  {machineTypeOptions.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => setSelectedMachineType(option.value)}
                      variant={selectedMachineType === option.value ? "default" : "outline"}
                      className={`text-sm px-4 py-2 rounded-full transition-all ${
                        selectedMachineType === option.value
                          ? "bg-[#12d6fa] text-white border-[#12d6fa]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#12d6fa] hover:text-[#12d6fa]"
                      }`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
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
                    setSelectedMachineType("all")
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
