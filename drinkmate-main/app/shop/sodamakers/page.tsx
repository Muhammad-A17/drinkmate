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
  color?: string
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
}

export default function SodamakersPage() {
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // State for products and bundles
  const [categories, setCategories] = useState([
    { id: "omnifizz", name: "OmniFizz Soda Makers", description: "Premium carbonation for all beverages" },
    { id: "luxe", name: "Luxe Soda Makers", description: "Luxurious and elegant carbonation experience" },
    { id: "best-seller", name: "Best Seller Soda Makers", description: "Our most popular carbonation machines" }
  ])
  
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [omnifizzMakers, setOmnifizzMakers] = useState<Product[]>([])
  const [luxeMakers, setLuxeMakers] = useState<Product[]>([])
  const [bestSellerMakers, setBestSellerMakers] = useState<Product[]>([])

  // Fetch products and bundles from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        
        // Fetch bundles
        const bundlesResponse = await shopAPI.getBundles({ 
          limit: 20  // Get more bundles to see what's available
        })
        
        console.log('Bundles API Response:', bundlesResponse)
        console.log('Raw bundles:', bundlesResponse.bundles)
        
        // Format bundles data
        const formattedBundles = bundlesResponse.bundles.map((bundle: any) => ({
          _id: bundle._id,
          id: bundle._id,
          name: bundle.name,
          price: bundle.price,
          originalPrice: bundle.originalPrice,
          image: bundle.images && bundle.images.length > 0 
            ? bundle.images[0]  // Backend sends array of strings, not objects
            : "/images/04 - Kits/Starter-Kit---Example---Do-Not-Use.png",
          description: bundle.description || "Premium kit with machine and accessories",
          rating: bundle.averageRating || 4.5,
          reviews: bundle.reviewCount || 300,
          badge: bundle.isFeatured ? "POPULAR" : bundle.isLimited ? "SALE" : undefined
        }))
        
        console.log('Formatted bundles:', formattedBundles)
        setBundles(formattedBundles)
        
        // Fetch all soda maker products (machines category)
        const allProductsResponse = await shopAPI.getProducts({ 
          limit: 50
        })
        
        console.log('API Response:', allProductsResponse)
        
        // Filter products by category name (since we don't have category ID)
        const allProducts = allProductsResponse.products || []
        
        console.log('All Products:', allProducts)
        
        // Filter soda maker products (by category or name)
        const sodaMakerProducts = allProducts.filter((product: any) => 
          product.category === 'sodamakers' || 
          product.category === 'machines' ||
          product.name.toLowerCase().includes('soda') ||
          product.name.toLowerCase().includes('drinkmate') ||
          product.name.toLowerCase().includes('omnifizz') ||
          product.name.toLowerCase().includes('luxe')
        )
        
        console.log('Soda Maker Products:', sodaMakerProducts)
        
        // Filter OmniFizz products (by name or subcategory)
        const omnifizzProducts = sodaMakerProducts.filter((product: any) => 
          product.name.toLowerCase().includes('omnifizz') || 
          (product.subcategory && product.subcategory.toLowerCase().includes('omnifizz'))
        )
        
        console.log('OmniFizz Products:', omnifizzProducts)
        
        // Format OmniFizz products
        const formattedOmnifizz = omnifizzProducts.slice(0, 4).map((product: any) => ({
          _id: product._id,
          id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images && product.images.length > 0 
            ? product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url
            : "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
          category: "machines",
          rating: product.averageRating || 4.7,
          reviews: product.reviewCount || 350,
          color: product.colors && product.colors.length > 0 ? product.colors[0].name : undefined,
          images: product.images
        }))
        
        setOmnifizzMakers(formattedOmnifizz)
        
        // Filter Luxe products
        const luxeProducts = sodaMakerProducts.filter((product: any) => 
          product.name.toLowerCase().includes('luxe') || 
          (product.subcategory && product.subcategory.toLowerCase().includes('luxe'))
        )
        
        // Format Luxe products
        const formattedLuxe = luxeProducts.slice(0, 1).map((product: any) => ({
          _id: product._id,
          id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images && product.images.length > 0 
            ? product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url
            : "/images/02 - Soda Makers/Banner-Luxe-Machine.png",
          category: "machines",
          rating: product.averageRating || 4.9,
          reviews: product.reviewCount || 450,
          color: product.colors && product.colors.length > 0 ? product.colors[0].name : "Stainless Steel",
          images: product.images
        }))
        
        setLuxeMakers(formattedLuxe)
        
        // Filter Best Seller products
        const bestSellerProducts = sodaMakerProducts.filter((product: any) => 
          product.isBestSeller === true
        )
        
        // Format Best Seller products
        const formattedBestSellers = bestSellerProducts.slice(0, 3).map((product: any) => ({
          _id: product._id,
          id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images && product.images.length > 0 
            ? product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url
            : "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
          category: "machines",
          rating: product.averageRating || 4.8,
          reviews: product.reviewCount || 400,
          color: product.colors && product.colors.length > 0 ? product.colors[0].name : undefined,
          images: product.images
        }))
        
        setBestSellerMakers(formattedBestSellers)
        
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Failed to load products. Please try again later.")
        
        // Fallback to static data if API fails
        setOmnifizzMakers([
          {
            _id: "201",
            id: 201,
            name: "OmniFizz Soda Maker - Artic Black",
            price: 599.99,
            originalPrice: 699.99,
            image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
            category: "machines",
            rating: 4.9,
            reviews: 450,
            color: "Black"
          },
          {
            _id: "202",
            id: 202,
            name: "OmniFizz Soda Maker - Artic Blue",
            price: 599.99,
            originalPrice: 699.99,
            image: "/images/02 - Soda Makers/Artic-Blue-Machine---Front.png",
            category: "machines",
            rating: 4.8,
            reviews: 380,
            color: "Blue"
          }
        ])
        
        setLuxeMakers([
          {
            _id: "301",
            id: 301,
            name: "Luxe Soda Maker - Stainless Steel",
            price: 799.99,
            originalPrice: 999.99,
            image: "/images/02 - Soda Makers/Banner-Luxe-Machine.png",
            category: "machines",
            rating: 4.9,
            reviews: 450,
            color: "Stainless Steel"
          }
        ])
        
        setBestSellerMakers([])
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
      color: product.color || undefined
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
      <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col">
        <Link href={`/shop/sodamakers/${product._id}`} className="block">
          <div className="relative h-48 bg-[#f3f3f3] rounded-2xl mb-4 flex items-center justify-center">
            <Image
              src={product.image}
              alt={product.name}
              width={160}
              height={160}
              className="object-contain h-40"
            />
          </div>
          <h3 className="font-medium text-lg mb-2 hover:text-[#12d6fa] transition-colors">{product.name}</h3>
        </Link>
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-1">
            {product.originalPrice && (
              <>
                <span className="text-gray-400 text-xs line-through">
                  <SaudiRiyal amount={product.originalPrice} size="sm" />
                </span>
                <span className="text-gray-400 text-xs">{discountPercentage}% OFF</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="font-medium text-xl">
                <SaudiRiyal amount={product.price} size="lg" />
              </span>
            </div>
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={isInCartStatus}
              className="bg-[#16d6fa] hover:bg-[#14c4e8] text-black font-bold rounded-full px-6 py-1 h-8 text-sm"
            >
              {isInCartStatus ? "ADDED" : "BUY"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {renderStars(product.rating)}
            <span className="text-xs text-gray-600">({product.reviews} Reviews)</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageLayout currentPage="shop-sodamakers">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Explore Our Soda Makers</h1>
        
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
            {/* Top categories section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-[#fac334] rounded-2xl p-6 flex flex-col justify-between h-64">
                <div>
                  <h2 className="text-2xl font-bold mb-2">OmniFizz Soda Makers</h2>
                  <p className="text-gray-800">Premium carbonation for all beverages</p>
                </div>
                <Image
                  src="/images/02 - Soda Makers/Banner-Omni-Fiz.png"
                  alt="OmniFizz Soda Maker"
                  width={200}
                  height={200}
                  className="self-end"
                />
              </div>
              <div className="bg-black rounded-2xl p-6 flex flex-col justify-between h-64">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-white">Luxe Soda Makers</h2>
                  <p className="text-gray-300">Luxurious and elegant carbonation experience</p>
                </div>
                <Image
                  src="/images/02 - Soda Makers/Banner-Luxe-Machine.png"
                  alt="Luxe Soda Maker"
                  width={200}
                  height={200}
                  className="self-end"
                />
              </div>
            </div>

            {/* Bundles & Promotions Section */}
            {bundles.length > 0 ? (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Bundles & Promotions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {bundles.map((bundle) => (
                    <div key={bundle._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col relative">
                      <Link href={`/shop/sodamakers/bundles/${bundle._id}`} className="block">
                        <div className="relative h-48 bg-[#f3f3f3] rounded-2xl mb-4 flex items-center justify-center">
                          <Image
                            src={bundle.image}
                            alt={bundle.name}
                            width={160}
                            height={160}
                            className="object-contain h-40"
                          />
                        </div>
                        <h3 className="font-medium text-lg mb-1 hover:text-[#12d6fa] transition-colors">{bundle.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-3">{bundle.description}</p>
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          {bundle.originalPrice && (
                            <>
                              <span className="text-gray-400 text-xs line-through">
                                <SaudiRiyal amount={bundle.originalPrice} size="sm" />
                              </span>
                              <span className="text-gray-400 text-xs">
                                {Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-xl">
                              <SaudiRiyal amount={bundle.price} size="lg" />
                            </span>
                          </div>
                          <Button 
                            onClick={() => window.location.href = `/shop/sodamakers/bundles/${bundle._id}`}
                            className="bg-[#16d6fa] hover:bg-[#14c4e8] text-black font-bold rounded-full px-6 py-1 h-8 text-sm"
                          >
                            BUY
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(bundle.rating)}
                          <span className="text-xs text-gray-600">({bundle.reviews} Reviews)</span>
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
            ) : (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Bundles & Promotions</h2>
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Bundles Available</h3>
                  <p className="text-gray-500 mb-4">We're working on adding bundles to our collection.</p>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Debug Info:</p>
                    <p>Bundles count: {bundles.length}</p>
                    <p>Check browser console for API response</p>
                  </div>
                </div>
              </div>
            )}

            {/* OmniFizz Soda Makers Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">OmniFizz Soda Makers</h2>
              {omnifizzMakers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {omnifizzMakers.map(product => renderProductCard(product))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No OmniFizz Soda Makers Available</h3>
                  <p className="text-gray-500 mb-4">We're working on adding OmniFizz soda makers to our collection.</p>
                  <Button 
                    onClick={() => window.location.href = '/admin/products'}
                    className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                  >
                    Add Products (Admin)
                  </Button>
                </div>
              )}
            </div>

            {/* Luxe Soda Makers Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Luxe Soda Makers</h2>
              {luxeMakers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {luxeMakers.map(product => renderProductCard(product))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Luxe Soda Makers Available</h3>
                  <p className="text-gray-500 mb-4">We're working on adding Luxe soda makers to our collection.</p>
                  <Button 
                    onClick={() => window.location.href = '/admin/products'}
                    className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                  >
                    Add Products (Admin)
                  </Button>
                </div>
              )}
            </div>

            {/* Best Seller Soda Makers Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Best Seller Soda Makers</h2>
              {bestSellerMakers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {bestSellerMakers.map(product => renderProductCard(product))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Best Seller Soda Makers Available</h3>
                  <p className="text-gray-500 mb-4">We're working on adding best seller soda makers to our collection.</p>
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
