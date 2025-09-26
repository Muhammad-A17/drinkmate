"use client"

// Sodamakers Page - Displays all soda maker products with filtering options
// Version: 1.1.0
// Last updated: September 1, 2025

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/contexts/cart-context"
import PageLayout from "@/components/layout/PageLayout"
import { Star, Loader2, ShoppingCart } from "lucide-react"
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
  const [bundleSubcategorySections, setBundleSubcategorySections] = useState<Array<{ _id: string; name: string; bundles: Bundle[] }>>([])
  const [allSodaMakers, setAllSodaMakers] = useState<Product[]>([])
  const [subcategorySections, setSubcategorySections] = useState<Array<{ _id: string; name: string; products: Product[] }>>([])


  // Define fetch function
  async function fetchProducts() {
    try {
      setIsLoading(true)

      // Fetch bundles for sodamakers category only
      console.log("Fetching bundles for sodamakers category...")
      const bundlesResponse = await shopAPI.getBundles({
        category: "sodamakers",
        limit: 4,
      })
      console.log("Sodamakers bundles response:", bundlesResponse)
      console.log("Sodamakers bundles array:", bundlesResponse.bundles)
      console.log("Number of sodamakers bundles found:", bundlesResponse.bundles?.length || 0)

      // Format bundles data - only use sodamakers bundles
      const bundlesToUse = bundlesResponse.bundles || []
      console.log("Using sodamakers bundles:", bundlesToUse.length, "bundles")
      
      const formattedBundles = bundlesToUse.map((bundle: any) => {
        console.log("Processing bundle:", bundle.name, "Full bundle object:", bundle)
        return {
        _id: bundle._id,
        id: bundle._id,
        slug: bundle.slug,
        name: bundle.name,
        price: bundle.price,
        originalPrice: bundle.originalPrice,
        subcategory: bundle.subcategory || "Bundles & Promotions of Soda Makers",
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

      // Organize bundles by subcategory
      const bundleBySubcategory: Record<string, Bundle[]> = {}
      for (const bundle of formattedBundles) {
        const subcategory = bundle.subcategory || "Bundles & Promotions of Soda Makers"
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

  // Function to render product cards using bundle-style ProductCard component
  function renderProductCard(product: Product) {
    const handleAddToCart = (payload: { productId: string; variantId?: string; qty: number; isBundle?: boolean }) => {
      // Convert payload to proper cart item format
      const cartItem = {
        id: payload.productId,
        name: product.name,
        price: product.price,
        quantity: payload.qty,
        image: product.image || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url || '/placeholder.svg'),
        category: typeof product.category === 'string' ? product.category : (product.category as any)?.name || 'Product',
        productId: payload.isBundle ? undefined : payload.productId,
        bundleId: payload.isBundle ? payload.productId : undefined,
        productType: payload.isBundle ? 'bundle' as const : 'product' as const,
        isBundle: payload.isBundle || false
      }
      addItem(cartItem)
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
          const cartItem = {
            id: productId,
            name: product.name,
            price: product.price,
            quantity: qty,
            image: product.image || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url || '/placeholder.svg'),
            category: typeof product.category === 'string' ? product.category : (product.category as any)?.name || 'Product',
            productId: productId,
            productType: 'product' as const
          }
          addItem(cartItem)
        }}
        onAddToWishlist={handleAddToWishlist}
        onAddToComparison={handleAddToComparison}
        onProductView={handleProductView}
        className="h-full"
      />
    )
  }

  return (
    <PageLayout currentPage="shop-sodamakers">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-medium mb-6 sm:mb-8 text-gray-900">Explore Our Premium Soda Makers</h1>

     

        {/* Category Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* OmniFizz Banner */}
          <div className="relative h-40 sm:h-48 md:h-56 rounded-2xl overflow-hidden shadow-lg bg-[#ffc232]">
            <div className="flex items-center justify-between h-full p-4 sm:p-6">
              <div className="text-black flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">OmniFizz Soda Makers</h2>
                <p className="text-xs sm:text-sm md:text-base opacity-80">Premium carbonation for all beverages</p>
              </div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0 ml-2 sm:ml-4">
                <Image
                  src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756559856/Banner-Omni-Fiz_yjehil.png"
                  alt="OmniFizz Soda Maker"
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
                  className="object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>

          {/* Luxe Banner */}
          <div className="relative h-40 sm:h-48 md:h-56 rounded-2xl overflow-hidden shadow-lg bg-black">
            <div className="flex items-center justify-between h-full p-4 sm:p-6">
              <div className="text-white flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">Luxe Soda Makers</h2>
                <p className="text-xs sm:text-sm md:text-base opacity-90">Luxurious and elegant carbonation experience</p>
              </div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0 ml-2 sm:ml-4">
                <Image
                  src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756559856/Banner-Luxe-Machine_obvfmq.png"
                  alt="Luxe Soda Maker"
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
                  className="object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-6 sm:mb-8 shadow-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-[#12d6fa] mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600 font-medium">Loading premium products...</p>
          </div>
        ) : (
          <>
            {/* Bundles & Promotions Section */}
            {bundleSubcategorySections.filter(section => section.bundles.length > 0).length > 0 && (
              <div className="mb-12 sm:mb-16">
                <div className="space-y-8 sm:space-y-12">
                  {bundleSubcategorySections.filter(section => section.bundles.length > 0).map((section) => (
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
                              const cartItem = {
                                id: productId,
                                name: bundle.name,
                                price: bundle.price,
                                quantity: qty,
                                image: bundle.image || '/placeholder.svg',
                                category: typeof bundle.category === 'string' ? bundle.category : (bundle.category as any)?.name || 'Bundle',
                                bundleId: productId,
                                productType: 'bundle' as const,
                                isBundle: true
                              }
                              addItem(cartItem)
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
              </div>
            )}


            {/* Product Sections */}
            {subcategorySections.filter(section => section.products.length > 0).map((section) => (
              <div key={section._id} className="mb-12 sm:mb-16">
                <h2 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-gray-900">{section.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {section.products.map((product) => renderProductCard(product))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </PageLayout>
  )
}
