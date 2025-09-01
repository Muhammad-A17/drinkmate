"use client"

// Sodamakers Page - Displays all soda maker products with filtering options
// Version: 1.1.0
// Last updated: September 1, 2025

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import PageLayout from "@/components/layout/PageLayout"
import { Star, Loader2, ShoppingCart, ChevronDown } from "lucide-react"
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
}

interface Bundle {
  _id: string
  id?: string | number
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

export default function SodamakersPage() {
  const router = useRouter()
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // State for products and bundles
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [allSodaMakers, setAllSodaMakers] = useState<Product[]>([])
  const [subcategorySections, setSubcategorySections] = useState<Array<{ _id: string; name: string; products: Product[] }>>([])

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
      
      // Now fetch with sodamakers category
      console.log("Fetching bundles for sodamakers category...")
      const bundlesResponse = await shopAPI.getBundles({
        category: "sodamakers",
        featured: true,
        limit: 4,
      })
      console.log("Sodamakers bundles response:", bundlesResponse)
      console.log("Sodamakers bundles array:", bundlesResponse.bundles)
      console.log("Number of sodamakers bundles found:", bundlesResponse.bundles?.length || 0)

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
          return "/images/02 - Soda Makers/Artic-Black-Machine---Front.png"
        })(),
        description: bundle.shortDescription || "Premium soda maker bundle",
        rating: bundle.averageRating || 5,
        reviews: bundle.reviewCount || 300,
        badge: bundle.isFeatured ? "POPULAR" : bundle.isLimited ? "SALE" : undefined,
      }
      })

      setBundles(formattedBundles)
      console.log("Formatted bundles for sodamakers:", formattedBundles)

      // Fetch categories and find Soda Makers category
      const categoriesResp = await shopAPI.getCategories()
      const categoriesWithSubs = categoriesResp.categories || []
      const sodaMakersCat = categoriesWithSubs.find((c: any) => {
        const name = (c.name || '').toLowerCase()
        const slug = (c.slug || '').toLowerCase()
        return name.includes('soda') || name.includes('machine') || slug.includes('sodamaker') || slug.includes('machine')
      })
      const sodaMakersSlug = sodaMakersCat?.slug || 'sodamakers'

      // Fetch products by category (returns subcategory field)
      const byCategoryResp = await shopAPI.getProductsByCategory(sodaMakersSlug, { limit: 100 })
      const sodaMakerProducts = byCategoryResp.products || []

      // Helper to pick first/primary image
      const pickImage = (imgs: any): string => {
        if (!imgs || imgs.length === 0) return "/images/02 - Soda Makers/Artic-Black-Machine---Front.png"
        const first = imgs[0]
        if (typeof first === 'string') return first
        return (imgs.find((img: any) => img.isPrimary)?.url) || first.url || "/images/02 - Soda Makers/Artic-Black-Machine---Front.png"
      }

      // Format products and capture subcategory
      const formattedSodaMakers = sodaMakerProducts.map((product: any) => ({
        _id: product._id,
        id: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: pickImage(product.images),
        category: "sodamakers",
        subcategory: (typeof product.subcategory === 'string' ? product.subcategory : product.subcategory?._id) || product.subcategory,
        rating: product.averageRating || 5,
        reviews: product.reviewCount || 300,
        description: product.shortDescription,
        images: product.images,
      }))

      setAllSodaMakers(formattedSodaMakers)

      // Build sections by subcategory
      const subs = (sodaMakersCat?.subcategories || []) as Array<{ _id: string; name: string }>
      const bySubId: Record<string, Product[]> = {}
      for (const p of formattedSodaMakers) {
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
        sections.push({ _id: 'others', name: 'Other Soda Makers', products: otherProducts })
      }
      setSubcategorySections(sections)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to load products. Please try again later.")

      // Fallback to static data if API fails
      setAllSodaMakers([
        {
          _id: "201",
          id: 201,
          slug: "omnifizz-soda-maker-artic-black",
          name: "OmniFizz Soda Maker - Artic Black",
          price: 599.99,
          originalPrice: 699.99,
          image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
          category: "sodamakers",
          subcategory: undefined,
          rating: 5,
          reviews: 320,
          description: "Premium carbonation for all beverages",
        },
        {
          _id: "202",
          id: 202,
          slug: "omnifizz-soda-maker-artic-blue",
          name: "OmniFizz Soda Maker - Artic Blue",
          price: 599.99,
          originalPrice: 699.99,
          image: "/images/02 - Soda Makers/Artic-Blue-Machine---Front.png",
          category: "sodamakers",
          subcategory: undefined,
          rating: 5,
          reviews: 380,
          description: "Premium carbonation for all beverages",
        },
        {
          _id: "301",
          id: 301,
          slug: "luxe-soda-maker-stainless-steel",
          name: "Luxe Soda Maker - Stainless Steel",
          price: 799.99,
          originalPrice: 999.99,
          image: "/images/02 - Soda Makers/Banner-Luxe-Machine.png",
          category: "sodamakers",
          subcategory: undefined,
          rating: 5,
          reviews: 450,
          description: "Luxurious and elegant carbonation experience",
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
        <Link href={`/shop/sodamakers/${(product as any).slug || product._id}`} className="block">
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
    <PageLayout currentPage="shop-sodamakers">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-medium mb-8 text-gray-900">Explore Our Premium Soda Makers</h1>

     

        {/* Category Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* OmniFizz Banner */}
          <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-orange-400 to-orange-500">
            <div className="flex items-center justify-between h-full p-6">
              <div className="text-black flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-2">OmniFizz Soda Makers</h2>
                <p className="text-sm md:text-base opacity-80">Premium carbonation for all beverages</p>
              </div>
              <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 ml-4">
                <Image
                  src="/images/02 - Soda Makers/Artic-Black-Machine---Front.png"
                  alt="OmniFizz Soda Maker"
                  fill
                  className="object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>

          {/* Luxe Banner */}
          <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden shadow-lg bg-black">
            <div className="flex items-center justify-between h-full p-6">
              <div className="text-white flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-2">Luxe Soda Makers</h2>
                <p className="text-sm md:text-base opacity-90">Luxurious and elegant carbonation experience</p>
              </div>
              <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 ml-4">
                <Image
                  src="/images/02 - Soda Makers/Banner-Luxe-Machine.png"
                  alt="Luxe Soda Maker"
                  fill
                  className="object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
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
                      <Link href={`/shop/sodamakers/bundles/${bundle.slug}`} className="block">
                        <div className="relative h-52 bg-white rounded-3xl mb-6 flex items-center justify-center overflow-hidden">
                          <Image
                            src={bundle.image || "/placeholder.svg"}
                            alt={bundle.name}
                            width={180}
                            height={180}
                            className="object-contain h-44 transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              console.log("Image failed to load:", bundle.image)
                              e.currentTarget.src = "/images/02 - Soda Makers/Artic-Black-Machine---Front.png"
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
                              id: bundle.id || bundle._id,
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
                  <p className="text-gray-600">No bundles available for soda makers at the moment.</p>
                  <p className="text-sm text-gray-500 mt-2">Check back soon for exciting bundle deals!</p>
                </div>
              )}
            </div>

            {/* Subcategory Sections (Parent-wise display) */}
            {subcategorySections.length > 0 && subcategorySections.map((section) => (
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
            ))}
          </>
        )}
      </div>
    </PageLayout>
  )
}
