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
import ProductOverview from "@/components/product/ProductOverview"
import HowToUseSection from "@/components/product/HowToUseSection"
import FeedbackSection from "@/components/product/FeedbackSection"

// Define product type
interface Product {
  _id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  images: Array<{url: string, alt: string, isPrimary: boolean}>
  category: {
    _id: string
    name: string
    slug: string
  }
  rating: number
  reviews: number
  shortDescription: string
  fullDescription: string
  colors?: Array<{name: string, hexCode: string, inStock: boolean}>
  features?: Array<{title: string, description: string, icon?: string}>
  specifications?: Array<{name: string, value: string}>
  stock: number
  sku: string
  howToUse?: {
    title: string
    steps: Array<{id: string, title: string, description: string, image?: string}>
  }
  relatedProducts?: Array<any>
  averageRating: number
  reviewCount: number
}

export default function ProductDetailPage() {
  const { slug } = useParams() as { slug: string }
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState("")
  const [reviews, setReviews] = useState([])

  // Fetch product data
  const fetchProduct = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching sodamaker product details for slug:', slug);
      
  const response = await shopAPI.getProductFlexible(slug)
      console.log('Sodamaker product fetch successful:', response.product?.name);
      setProduct(response.product)
      setReviews(response.reviews || [])
      
      // Set default color if available
      if (response.product.colors && response.product.colors.length > 0) {
        setSelectedColor(response.product.colors[0].name)
      }
      
      // Set default active image
      if (response.product.images && response.product.images.length > 0) {
        const primaryImage = response.product.images.find((img: any) => img.isPrimary)
        setActiveImage(primaryImage ? primaryImage.url : response.product.images[0].url)
      }
      
    } catch (error) {
      console.error("Error fetching sodamaker product:", error)
      setError("Failed to load product. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const handleAddToCart = () => {
    if (!product) return
    
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images[0].url,
      category: "machines",
      color: selectedColor
    })
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    if (product && product.stock && newQuantity > product.stock) return
    setQuantity(newQuantity)
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
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </PageLayout>
    )
  }
  
  if (error || !product) {
    return (
      <PageLayout currentPage="shop-sodamakers">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            {error || "Product not found"}
          </div>
          <Link href="/shop/sodamakers" className="text-blue-600 hover:underline">
            &larr; Back to Soda Makers
          </Link>
        </div>
      </PageLayout>
    )
  }

  // Calculate discount percentage
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
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
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Product Overview */}
        <ProductOverview
          product={product}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          selectedColor={selectedColor}
          handleColorChange={handleColorChange}
          quantity={quantity}
          handleQuantityChange={handleQuantityChange}
          handleAddToCart={handleAddToCart}
          isInCart={isInCart(product._id)}
          discountPercentage={discountPercentage}
          renderStars={renderStars}
        />

        {/* How to Use Section */}
        {product.howToUse && (
          <HowToUseSection howToUse={product.howToUse} />
        )}

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-16 mb-16">
            <h2 className="text-2xl font-bold mb-6">Specifications</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex">
                    <div className="w-1/3 font-medium text-gray-600">{spec.name}</div>
                    <div className="w-2/3">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
      <FeedbackSection 
          rating={product.averageRating} 
          reviewCount={product.reviewCount} 
          reviews={reviews} 
          productId={product._id}
          onReviewAdded={fetchProduct}
        />

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {product.relatedProducts.map((relatedProduct: any) => (
                <div key={relatedProduct._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col">
                  <Link href={`/shop/sodamakers/${relatedProduct.slug || relatedProduct._id}`} className="block">
                    <div className="relative h-48 bg-[#f3f3f3] rounded-2xl mb-4 flex items-center justify-center">
                      <Image
                        src={relatedProduct.images && relatedProduct.images.length > 0 
                          ? relatedProduct.images[0].url 
                          : "/images/02 - Soda Makers/Artic-Black-Machine---Front.png"}
                        alt={relatedProduct.name}
                        width={160}
                        height={160}
                        className="object-contain h-40"
                      />
                    </div>
                    <h3 className="font-medium text-lg mb-2 hover:text-[#12d6fa] transition-colors">{relatedProduct.name}</h3>
                  </Link>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-1">
                      {relatedProduct.originalPrice && (
                        <>
                          <span className="text-gray-400 text-xs line-through">{relatedProduct.originalPrice.toFixed(2)} ﷼</span>
                          <span className="text-gray-400 text-xs">
                            {Math.round(((relatedProduct.originalPrice - relatedProduct.price) / relatedProduct.originalPrice) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-xl">{relatedProduct.price.toFixed(2)}</span>
                        <span className="text-sm">﷼</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(relatedProduct.averageRating || 4.5)}
                      <span className="text-xs text-gray-600">({relatedProduct.reviewCount || 0} Reviews)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}