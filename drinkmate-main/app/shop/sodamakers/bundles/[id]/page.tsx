"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import PageLayout from "@/components/layout/PageLayout"
import { Star, Loader2, Check, ChevronRight } from "lucide-react"
import { shopAPI } from "@/lib/api"
import FeedbackSection from "@/components/product/FeedbackSection"

// Define bundle type
interface Bundle {
  _id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  category: string
  description: string
  badge?: {
    text: string
    color: string
  }
  items: Array<{
    product: string
    name: string
    price: number
    image?: string
  }>
  stock: number
  sku: string
  averageRating: number
  reviewCount: number
  isLimited: boolean
  isFeatured: boolean
}

export default function BundleDetailPage() {
  const { id } = useParams()
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [activeImage, setActiveImage] = useState("")
  const [reviews, setReviews] = useState([])

  // Fetch bundle data
  const fetchBundle = async () => {
    try {
      setIsLoading(true)
      
      const response = await shopAPI.getBundle(id as string)
      console.log('Bundle API Response:', response)
      console.log('Bundle data:', response.bundle)
      console.log('Bundle items:', response.bundle.items)
      
      setBundle(response.bundle)
      setReviews(response.reviews || [])
      
      // Set default active image
      if (response.bundle.images && response.bundle.images.length > 0) {
        setActiveImage(response.bundle.images[0])
      }
      
    } catch (error) {
      console.error("Error fetching bundle:", error)
      setError("Failed to load bundle. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchBundle()
    }
  }, [id])

  const handleAddToCart = () => {
    if (!bundle) return
    
    // Add the bundle as a single item
    addItem({
      id: bundle._id,
      name: bundle.name,
      price: bundle.price,
      quantity: 1,
      image: bundle.images[0],
      category: "bundle",
      isBundle: true
    })
  }

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      )
    }
    return <div className="flex">{stars}</div>
  }

  if (isLoading) {
    return (
      <PageLayout currentPage="shop-sodamakers">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#12d6fa] mb-4" />
            <p className="text-gray-600">Loading bundle...</p>
          </div>
        </div>
      </PageLayout>
    )
  }
  
  if (error || !bundle) {
    return (
      <PageLayout currentPage="shop-sodamakers">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            {error || "Bundle not found"}
          </div>
          <Link href="/shop/sodamakers" className="text-blue-600 hover:underline">
            &larr; Back to Soda Makers
          </Link>
        </div>
      </PageLayout>
    )
  }
  
  // Calculate discount percentage
  const discountPercentage = bundle.originalPrice 
    ? Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100) 
    : 0

  // Calculate savings amount
  const savingsAmount = bundle.originalPrice 
    ? bundle.originalPrice - bundle.price
    : 0
  
  return (
    <PageLayout currentPage="shop-sodamakers">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#12d6fa]">Home</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <Link href="/shop/sodamakers" className="hover:text-[#12d6fa]">Soda Makers</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <Link href="/shop/sodamakers" className="hover:text-[#12d6fa]">Bundles</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-900">{bundle.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Bundle Images */}
          <div>
            <div className="bg-white rounded-lg mb-4 flex items-center justify-center h-96">
              <Image
                src={activeImage || (bundle.images && bundle.images.length > 0 ? bundle.images[0] : "/images/04 - Kits/Starter-Kit---Example---Do-Not-Use.png")}
                alt={bundle.name}
                width={300}
                height={300}
                className="object-contain max-h-80"
              />
            </div>
            
            {/* Thumbnail images */}
            {bundle.images && bundle.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {bundle.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`border rounded-md p-2 cursor-pointer ${activeImage === image ? 'border-[#12d6fa]' : 'border-gray-200'}`}
                    onClick={() => setActiveImage(image)}
                  >
                    <Image
                      src={image}
                      alt={bundle.name}
                      width={80}
                      height={80}
                      className="object-contain h-16 w-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Bundle Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {bundle.isLimited && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                  LIMITED OFFER
                </span>
              )}
              {bundle.isFeatured && !bundle.isLimited && (
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-medium">
                  POPULAR
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{bundle.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              {renderStars(bundle.averageRating || 4.8)}
              <span className="text-sm text-gray-600">({bundle.reviewCount || 0} Reviews)</span>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{bundle.price.toFixed(2)} ﷼</span>
                {bundle.originalPrice && (
                  <>
                    <span className="text-gray-400 text-lg line-through">{bundle.originalPrice.toFixed(2)} ﷼</span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              {savingsAmount > 0 && (
                <div className="text-green-600 font-medium mt-2">
                  You save: {savingsAmount.toFixed(2)} ﷼
                </div>
              )}
            </div>
            
            <div className="border-t border-b py-4 my-6">
              <p className="text-gray-700 mb-4">{bundle.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                <span>In Stock</span>
              </div>
            </div>
            
            {/* Add to cart button */}
            <div className="mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={isInCart(bundle._id)}
                className="bg-[#16d6fa] hover:bg-[#14c4e8] text-black font-bold rounded-full px-8 py-3 w-full"
              >
                {isInCart(bundle._id) ? "ADDED TO CART" : "ADD BUNDLE TO CART"}
              </Button>
            </div>
            
            {/* SKU */}
            <div className="text-sm text-gray-500">
              SKU: {bundle.sku}
            </div>
          </div>
        </div>

        {/* Bundle Contents */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Bundle Contents</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 gap-4">
              {bundle.items.map((item, index) => (
                <div key={index} className="flex items-center border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="w-16 h-16 bg-white rounded-md mr-4 flex items-center justify-center">
                    <Image
                      src={item.image || "/images/placeholder.svg"}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">{item.name}</div>
                    {/* item.color is removed from interface, so this line is removed */}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">1x</div>
                    <div className="text-sm text-gray-500">{item.price.toFixed(2)} ﷼</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="font-bold">Total Value:</div>
                <div className="font-bold">{bundle.originalPrice ? bundle.originalPrice.toFixed(2) : bundle.price.toFixed(2)} ﷼</div>
              </div>
              {bundle.originalPrice && (
                <div className="flex justify-between items-center mt-2 text-green-600">
                  <div className="font-medium">Bundle Price:</div>
                  <div className="font-medium">{bundle.price.toFixed(2)} ﷼</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <FeedbackSection 
          rating={bundle.averageRating} 
          reviewCount={bundle.reviewCount} 
          reviews={reviews} 
          bundleId={bundle._id}
          onReviewAdded={() => {
            // Refresh bundle data to get updated reviews
            fetchBundle()
          }}
        />
      </div>
    </PageLayout>
  )
}