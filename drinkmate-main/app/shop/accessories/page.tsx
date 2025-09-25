"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
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
