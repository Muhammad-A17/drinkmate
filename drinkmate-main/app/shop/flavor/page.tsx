"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import PageLayout from "@/components/layout/PageLayout"
import { Star, Loader2 } from "lucide-react"
import { shopAPI } from "@/lib/api"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

// Define product types
interface Product {
  _id: string
  id?: number
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  category: string
  rating: number
  reviews: number
  description?: string
  images?: Array<{ url: string; alt: string; isPrimary: boolean }>
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
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // State for products and bundles
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [flavorProducts, setFlavorProducts] = useState<Product[]>([])
  const [premiumSyrups, setPremiumSyrups] = useState<Product[]>([])
  const [shopSyrups, setShopSyrups] = useState<Product[]>([])

  // Fetch products and bundles from API
  useEffect(() => {
    const fetchProducts = async () => {
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

        // Fetch all products and filter by category
        const allProductsResponse = await shopAPI.getProducts({
          limit: 50,
        })

        console.log("All products response:", allProductsResponse)

        // Filter products by category
        const allProducts = allProductsResponse.products || []
        const flavorProducts = allProducts.filter(
          (product: any) => product.category === "flavors" || product.category === "flavor",
        )

        console.log("Flavor products found:", flavorProducts.length)

        // Format flavor products
        const formattedFlavors = flavorProducts.map((product: any) => ({
          _id: product._id,
          id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image:
            product.images && product.images.length > 0
              ? product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url
              : "/images/01 - Flavors/Strawberry-Lemon-Flavor.png",
          category: "flavors",
          rating: product.averageRating || 5,
          reviews: product.reviewCount || 300,
          description: product.shortDescription,
          images: product.images,
        }))

        setFlavorProducts(formattedFlavors)

        // Filter by subcategory for premium syrups
        const premiumSyrups = flavorProducts.filter(
          (product: any) =>
            product.subcategory === "premium" ||
            product.name.toLowerCase().includes("premium") ||
            product.name.toLowerCase().includes("italian"),
        )

        // Format premium syrups
        const formattedPremium = premiumSyrups.map((product: any) => ({
          _id: product._id,
          id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image:
            product.images && product.images.length > 0
              ? product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url
              : "/images/01 - Flavors/Cola-Flavor.png",
          category: "flavors",
          rating: product.averageRating || 5,
          reviews: product.reviewCount || 280,
          description: product.shortDescription,
          images: product.images,
        }))

        setPremiumSyrups(formattedPremium)

        // Filter by subcategory for shop syrups
        const shopSyrups = flavorProducts.filter(
          (product: any) =>
            product.subcategory === "standard" ||
            !product.name.toLowerCase().includes("premium") ||
            !product.name.toLowerCase().includes("italian"),
        )

        // Format shop syrups
        const formattedSyrups = shopSyrups.map((product: any) => ({
          _id: product._id,
          id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image:
            product.images && product.images.length > 0
              ? product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url
              : "/images/01 - Flavors/Mojito-Mocktails.png",
          category: "flavors",
          rating: product.averageRating || 5,
          reviews: product.reviewCount || 350,
          description: product.shortDescription,
          images: product.images,
        }))

        setShopSyrups(formattedSyrups)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Failed to load products. Please try again later.")

        // Fallback to static data if API fails
        setFlavorProducts([
          {
            _id: "401",
            id: 401,
            name: "Italian Strawberry Lemon",
            price: 49.99,
            originalPrice: 59.99,
            image: "/images/01 - Flavors/Strawberry-Lemon-Flavor.png",
            category: "flavors",
            rating: 5,
            reviews: 320,
            description: "Natural premium Italian flavor syrup",
          },
          {
            _id: "402",
            id: 402,
            name: "Italian Cola",
            price: 49.99,
            originalPrice: 59.99,
            image: "/images/01 - Flavors/Cola-Flavor.png",
            category: "flavors",
            rating: 5,
            reviews: 280,
            description: "Classic cola flavor for your carbonated drinks",
          },
          {
            _id: "403",
            id: 403,
            name: "Italian Mojito Mocktail",
            price: 49.99,
            originalPrice: 59.99,
            image: "/images/01 - Flavors/Mojito-Mocktails.png",
            category: "flavors",
            rating: 5,
            reviews: 350,
            description: "Refreshing mojito flavor without the alcohol",
          },
          {
            _id: "404",
            id: 404,
            name: "Italian Strawberry Lemon",
            price: 49.99,
            originalPrice: 59.99,
            image: "/images/01 - Flavors/Strawberry-Lemon-Flavor.png",
            category: "flavors",
            rating: 5,
            reviews: 290,
            description: "Natural premium Italian flavor syrup",
          },
        ])

        setPremiumSyrups([])
        setShopSyrups([])
        setBundles([])
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
        key={product.id}
        className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
      >
        <Link href={`/shop/flavor/${product._id}`} className="block">
          <div className="relative h-48 bg-white mb-3 flex items-center justify-center rounded-t-xl overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={120}
              height={120}
              className="object-contain h-40 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-semibold text-sm px-4 mb-2 hover:text-[#12d6fa] transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>
        <div className="px-4 pb-4 flex-1 flex flex-col justify-end">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="font-bold text-base text-gray-900">
                <SaudiRiyal amount={product.price} />
              </span>
            </div>
            {product.originalPrice && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs line-through">
                  <SaudiRiyal amount={product.originalPrice} size="sm" />
                </span>
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
                  {discountPercentage}% OFF
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {renderStars(product.rating)}
              <span className="text-xs text-gray-500 font-medium">({product.reviews})</span>
            </div>
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={isInCartStatus}
              className="bg-[#16d6fa] hover:bg-[#14c4e8] text-black font-bold rounded-lg px-4 py-2 h-8 text-xs shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isInCartStatus ? "ADDED" : "BUY"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageLayout currentPage="shop-flavor">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-gray-900">Explore Our Premium Italian Syrups</h1>

        {/* Hero section - Flavor Banner */}
        <div className="w-full h-[570px] mb-12 relative overflow-hidden rounded-2xl shadow-lg">
          {/* Desktop Banner */}
          <Image
            src="/images/banner/flavor banner.webp"
            alt="Flavor Banner"
            fill
            className="object-cover object-center hidden md:block"
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
          />
          {/* Mobile Banner */}
          <Image
            src="/images/banner/flavor mobile.webp"
            alt="Flavor Banner Mobile"
            fill
            className="object-cover object-center md:hidden"
            priority
            sizes="100vw"
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
            {bundles.length > 0 && (
              <div className="mb-16">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Bundles & Promotions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {bundles.map((bundle) => (
                    <div
                      key={bundle._id}
                      className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative group"
                    >
                      <Link href={`/shop/flavor/bundles/${bundle.slug}`} className="block">
                        <div className="relative h-48 bg-white mb-3 flex items-center justify-center rounded-t-xl overflow-hidden">
                          <Image
                            src={bundle.image || "/placeholder.svg"}
                            alt={bundle.name}
                            width={120}
                            height={120}
                            className="object-contain h-40 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-semibold text-sm px-4 mb-2 hover:text-[#12d6fa] transition-colors leading-tight">
                          {bundle.name}
                        </h3>
                      </Link>
                      <div className="px-4 pb-4 flex-1 flex flex-col justify-end">
                        <p className="text-sm text-gray-600 mb-3 font-medium">{bundle.description}</p>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-base text-gray-900">
                              <SaudiRiyal amount={bundle.price} />
                            </span>
                          </div>
                          {bundle.originalPrice && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-xs line-through">
                                <SaudiRiyal amount={bundle.originalPrice} size="sm" />
                              </span>
                              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
                                {Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {renderStars(bundle.rating)}
                            <span className="text-xs text-gray-500 font-medium">({bundle.reviews})</span>
                          </div>
                          <Button
                            onClick={() => (window.location.href = `/shop/flavor/bundles/${bundle.slug}`)}
                            className="bg-[#16d6fa] hover:bg-[#14c4e8] text-black font-bold rounded-lg px-4 py-2 h-8 text-xs shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            BUY
                          </Button>
                        </div>
                      </div>
                      {bundle.badge && (
                        <div className="absolute top-3 right-3 bg-[#16d6fa] text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          {bundle.badge}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Premium Italian Syrups Section */}
            <div className="mb-16">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Premium Italian Syrups</h2>
              {premiumSyrups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {premiumSyrups.map((product) => renderProductCard(product))}
                </div>
              ) : flavorProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {flavorProducts.slice(0, 4).map((product) => renderProductCard(product))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl shadow-inner">
                  <div className="text-gray-400 mb-6">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Premium Syrups Available</h3>
                  <p className="text-gray-600 mb-6 font-medium">
                    We're working on adding premium Italian syrups to our collection.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/admin/products")}
                    className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white font-bold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Add Products (Admin)
                  </Button>
                </div>
              )}
            </div>

            {/* Shop Syrups Section */}
            <div className="mb-16">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Shop Syrups</h2>
              {shopSyrups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {shopSyrups.map((product) => renderProductCard(product))}
                </div>
              ) : flavorProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {flavorProducts.slice(4, 8).map((product) => renderProductCard(product))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl shadow-inner">
                  <div className="text-gray-400 mb-6">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Shop Syrups Available</h3>
                  <p className="text-gray-600 mb-6 font-medium">
                    We're working on adding shop syrups to our collection.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/admin/products")}
                    className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white font-bold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Add Products (Admin)
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  )
}
