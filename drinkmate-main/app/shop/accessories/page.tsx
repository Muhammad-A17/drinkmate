"use client"

import React, { useState, useEffect } from "react"
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
  images?: Array<{url: string, alt: string, isPrimary: boolean}>
}

interface Bundle {
  _id: string
  id?: number
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
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // State for products and bundles
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [accessoriesProducts, setAccessoriesProducts] = useState<Product[]>([])
  const [bottleProducts, setBottleProducts] = useState<Product[]>([])
  
  // Fetch products and bundles from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        
        // Fetch bundles
        const bundlesResponse = await shopAPI.getBundles({ 
          category: "accessories",
          featured: true,
          limit: 4
        })
        
        // Format bundles data
        const formattedBundles = bundlesResponse.bundles.map((bundle: any) => ({
          _id: bundle._id,
          id: bundle._id,
          name: bundle.name,
          price: bundle.price,
          originalPrice: bundle.originalPrice,
          image: bundle.images && bundle.images.length > 0 
            ? bundle.images[0].url 
            : "/images/empty-drinkmate-bottle.png",
          description: bundle.shortDescription || "Accessories bundle pack",
          rating: bundle.averageRating || 5,
          reviews: bundle.reviewCount || 320,
          badge: bundle.isFeatured ? "POPULAR" : bundle.isLimited ? "SALE" : undefined
        }))
        
        setBundles(formattedBundles)
        
        // Get categories using public API (no login required)
        let categoriesResponse
        try {
          categoriesResponse = await shopAPI.getCategories()
        } catch (error) {
          console.log('Could not fetch categories, will use fallback filtering')
          categoriesResponse = { categories: [] }
        }
        
        const accessoriesCategory = categoriesResponse.categories?.find(
          (cat: any) => cat.name === 'Accessories' || cat.slug === 'accessories'
        )
        
        console.log('Accessories category:', accessoriesCategory)
        
        // Fetch all products and filter by category
        const allProductsResponse = await shopAPI.getProducts({ 
          limit: 50
        })
        
        console.log('All products response:', allProductsResponse)
        
        // Filter products by category
        const allProducts = allProductsResponse.products || []
        
        // Debug: Log first few products to see their structure
        if (allProducts.length > 0) {
          console.log('Sample product structure:', {
            first: allProducts[0],
            category: allProducts[0].category,
            categoryType: typeof allProducts[0].category
          })
        }
        
        let accessoriesProducts
        if (accessoriesCategory) {
          // Filter by specific Accessories category
          accessoriesProducts = allProducts.filter((product: any) => {
            // Handle both populated category objects and category IDs
            if (product.category && typeof product.category === 'object') {
              // Category is populated (has name, slug, etc.)
              return product.category._id === accessoriesCategory._id || 
                     product.category.name === 'Accessories' || 
                     product.category.slug === 'accessories'
            } else if (typeof product.category === 'string') {
              // Category is just an ID string
              return product.category === accessoriesCategory._id
            }
            return false
          })
        } else {
          // Fallback: show all products if we can't determine categories
          console.log('No Accessories category found, showing all products as fallback')
          accessoriesProducts = allProducts
        }
        
        console.log('Accessories products found:', accessoriesProducts.length)
        console.log('All categories available:', categoriesResponse.categories?.map((cat: any) => ({ name: cat.name, slug: cat.slug, _id: cat._id })))
        console.log('Filtered accessories products:', accessoriesProducts)
        
        // Format accessories products
        const formattedAccessories = accessoriesProducts.map((product: any) => ({
          _id: product._id,
          id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images && product.images.length > 0 
            ? product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url
            : "/images/empty-drinkmate-bottle.png",
          category: "accessories",
          rating: product.averageRating || 5,
          reviews: product.reviewCount || 300,
          description: product.shortDescription,
          images: product.images
        }))
        
        setAccessoriesProducts(formattedAccessories)
        
        // Filter by subcategory for bottle products
        const bottleProducts = accessoriesProducts.filter((product: any) => 
          product.subcategory === 'bottles' || 
          product.name.toLowerCase().includes('bottle') ||
          product.name.toLowerCase().includes('500ml') ||
          product.name.toLowerCase().includes('1l')
        )
        
        // Format bottle products
        const formattedBottles = bottleProducts.map((product: any) => ({
          _id: product._id,
          id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images && product.images.length > 0 
            ? product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url
            : "/images/empty-drinkmate-bottle.png",
          category: "accessories",
          rating: product.averageRating || 5,
          reviews: product.reviewCount || 280,
          description: product.shortDescription,
          images: product.images
        }))
        
        setBottleProducts(formattedBottles)
        
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Failed to load products. Please try again later.")
        
        // Fallback to static data if API fails
        setBundles([
          {
            _id: "601",
            id: 601,
            name: "Bottles Pack of 3",
            price: 599.99,
            originalPrice: 699.99,
            image: "/images/empty-drinkmate-bottle.png",
            category: "accessories",
            rating: 5,
            reviews: 320,
            description: "3 x Carbonating Bottles for Drinkmate"
          },
          {
            _id: "602",
            id: 602,
            name: "Bottles Pack of 3",
            price: 599.99,
            originalPrice: 699.99,
            image: "/images/empty-drinkmate-bottle.png",
            category: "accessories",
            rating: 5,
            reviews: 320,
            description: "3 x Carbonating Bottles for Drinkmate"
          }
        ])
        
        setAccessoriesProducts([
          {
            _id: "501",
            id: 501,
            name: "500ml Bottle - Black",
            price: 42.99,
            originalPrice: 49.99,
            image: "/images/empty-drinkmate-bottle.png",
            category: "accessories",
            rating: 5,
            reviews: 320,
            description: "BPA-free carbonating bottle for your Drinkmate"
          },
          {
            _id: "502",
            id: 502,
            name: "1L Bottle - Black",
            price: 75.00,
            originalPrice: 85.00,
            image: "/images/empty-drinkmate-bottle.png",
            category: "accessories",
            rating: 5,
            reviews: 280,
            description: "Compact BPA-free carbonating bottle"
          }
        ])
        
        setBottleProducts([
          {
            _id: "503",
            id: 503,
            name: "500ml Bottle - Black",
            price: 42.99,
            originalPrice: 49.99,
            image: "/images/empty-drinkmate-bottle.png",
            category: "accessories",
            rating: 5,
            reviews: 150,
            description: "BPA-free carbonating bottle for your Drinkmate"
          },
          {
            _id: "504",
            id: 504,
            name: "500ml Bottle - Black",
            price: 30.00,
            originalPrice: 35.00,
            image: "/images/empty-drinkmate-bottle.png",
            category: "accessories",
            rating: 5,
            reviews: 190,
            description: "BPA-free carbonating bottle for your Drinkmate"
          }
        ])
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
      category: product.category
    })
  }

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
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
      <div key={product.id} className="bg-white border border-gray-100 hover:shadow-sm transition-shadow flex flex-col">
        <Link href={`/shop/accessories/${product._id}`} className="block">
          <div className="relative h-48 bg-white mb-2 flex items-center justify-center">
            <Image
              src={product.image}
              alt={product.name}
              width={120}
              height={120}
              className="object-contain h-40"
            />
          </div>
          <h3 className="font-medium text-sm px-3 mb-1 hover:text-[#12d6fa] transition-colors">{product.name}</h3>
        </Link>
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <span className="font-medium text-base">
                <SaudiRiyal amount={product.price} />
              </span>
            </div>
            {product.originalPrice && (
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs line-through">
                  <SaudiRiyal amount={product.originalPrice} size="sm" />
                </span>
                <span className="text-xs bg-red-100 text-red-600 px-1 rounded">{discountPercentage}% OFF</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {renderStars(product.rating)}
              <span className="text-xs text-gray-500">({product.reviews})</span>
            </div>
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={isInCartStatus}
              className="bg-[#16d6fa] hover:bg-[#14c4e8] text-black font-bold rounded-sm px-3 py-1 h-6 text-xs"
            >
              {isInCartStatus ? "ADDED" : "BUY"}
            </Button>
          </div>
        </div>
      </div>
    )
  }



  return (
    <PageLayout currentPage="shop-accessories">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-xl font-medium mb-6">Explore Our Accessories</h1>

        {/* Hero section - Accessories Banner */}
        <div className="w-full h-[570px] mb-8 relative overflow-hidden rounded-lg">
          {/* Desktop Banner */}
          <Image
            src="/images/banner/flavor banner.webp"
            alt="Accessories Banner"
            fill
            className="object-cover object-center hidden md:block"
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
          />
          {/* Mobile Banner */}
          <Image
            src="/images/banner/flavor mobile.webp"
            alt="Accessories Banner Mobile"
            fill
            className="object-cover object-center md:hidden"
            priority
            sizes="100vw"
          />
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-[#12d6fa] mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Bundles & Promotions Section */}
            {bundles.length > 0 && (
              <div className="mb-12">
                <h2 className="text-lg font-medium mb-4">Bundles & Promotions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bundles.map((bundle) => (
                    <div key={bundle._id} className="bg-white border border-gray-100 hover:shadow-sm transition-shadow flex flex-col relative">
                      <Link href={`/shop/accessories/bundles/${bundle._id}`} className="block">
                        <div className="relative h-48 bg-white mb-2 flex items-center justify-center">
                          <Image
                            src={bundle.image}
                            alt={bundle.name}
                            width={120}
                            height={120}
                            className="object-contain h-40"
                          />
                        </div>
                        <h3 className="font-medium text-sm px-3 mb-1 hover:text-[#12d6fa] transition-colors">{bundle.name}</h3>
                      </Link>
                      <div className="px-3 pb-3">
                        <p className="text-sm text-gray-600 mb-2">{bundle.description}</p>
                        <div className="flex items-center justify-between mb-1">
                                                      <div className="flex items-center gap-1">
                              <span className="font-medium text-base">
                                <SaudiRiyal amount={bundle.price} />
                              </span>
                            </div>
                                                      {bundle.originalPrice && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400 text-xs line-through">
                                  <SaudiRiyal amount={bundle.originalPrice} size="sm" />
                                </span>
                                <span className="text-xs bg-red-100 text-red-600 px-1 rounded">
                                  {Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)}% OFF
                                </span>
                              </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {renderStars(bundle.rating)}
                            <span className="text-xs text-gray-500">({bundle.reviews})</span>
                          </div>
                          <Button 
                            onClick={() => window.location.href = `/shop/accessories/bundles/${bundle._id}`}
                            className="bg-[#16d6fa] hover:bg-[#14c4e8] text-black font-bold rounded-sm px-3 py-1 h-6 text-xs"
                          >
                            BUY
                          </Button>
                        </div>
                      </div>
                      {bundle.badge && (
                        <div className="absolute top-2 right-2 bg-[#16d6fa] text-black text-xs font-bold px-2 py-1 rounded-full">
                          {bundle.badge}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accessories Section */}
            <div className="mb-12">
              <h2 className="text-lg font-medium mb-4">Accessories</h2>
              {accessoriesProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {accessoriesProducts.map(product => renderProductCard(product))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Accessories Available</h3>
                  <p className="text-gray-500 mb-4">We're working on adding accessories to our collection.</p>
                  <Button 
                    onClick={() => window.location.href = '/admin/products'}
                    className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                  >
                    Add Products (Admin)
                  </Button>
                </div>
              )}
            </div>

            {/* Shop Bottles Section */}
            <div className="mb-12">
              <h2 className="text-lg font-medium mb-4">Shop Bottles</h2>
              {bottleProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bottleProducts.map(product => renderProductCard(product))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Bottles Available</h3>
                  <p className="text-gray-500 mb-4">We're working on adding bottles to our collection.</p>
                  <Button 
                    onClick={() => window.location.href = '/admin/products'}
                    className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
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
