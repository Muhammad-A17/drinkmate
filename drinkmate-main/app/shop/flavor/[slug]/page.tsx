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
  features?: Array<{title: string, description: string, icon?: string}>
  specifications?: Array<{name: string, value: string}>
  stock: number
  sku: string
  relatedProducts?: Array<any>
  averageRating: number
  reviewCount: number
}

export default function FlavorDetailPage() {
  const { slug } = useParams() as { slug: string }
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState("")
  const [reviews, setReviews] = useState([])

  // Fetch product data
  const fetchProduct = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching flavor product details for slug:', slug);
      
      const response = await shopAPI.getProductFlexible(slug)
      console.log('Flavor product fetch successful:', response.product?.name);
      setProduct(response.product)
      setReviews(response.reviews || [])
      
      // Set default active image
      if (response.product.images && response.product.images.length > 0) {
        const primaryImage = response.product.images.find((img: any) => img.isPrimary)
        setActiveImage(primaryImage ? primaryImage.url : response.product.images[0].url)
      }
      
    } catch (error) {
      console.error("Error fetching flavor product:", error)
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
      category: "flavors"
    })
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
      <PageLayout currentPage="shop-flavor">
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
      <PageLayout currentPage="shop-flavor">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            {error || "Product not found"}
          </div>
          <Link href="/shop/flavor" className="text-blue-600 hover:underline">
            &larr; Back to Flavors
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
    <PageLayout currentPage="shop-flavor">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#12d6fa]">Home</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <Link href="/shop/flavor" className="hover:text-[#12d6fa]">Flavors</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg mb-4 flex items-center justify-center h-96">
              <Image
                src={activeImage || (product.images && product.images.length > 0 ? product.images[0].url : "/images/01 - Flavors/Strawberry-Lemon-Flavor.png")}
                alt={product.name}
                width={300}
                height={300}
                className="object-contain max-h-80"
              />
            </div>
            
            {/* Thumbnail images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`border rounded-md p-2 cursor-pointer ${activeImage === image.url ? 'border-[#12d6fa]' : 'border-gray-200'}`}
                    onClick={() => setActiveImage(image.url)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      width={80}
                      height={80}
                      className="object-contain h-16 w-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              {renderStars(product.averageRating || 5)}
              <span className="text-sm text-gray-600">({product.reviewCount || 0} Reviews)</span>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{product.price.toFixed(2)} ﷼</span>
                {product.originalPrice && (
                  <>
                    <span className="text-gray-400 text-lg line-through">{product.originalPrice.toFixed(2)} ﷼</span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="border-t border-b py-4 my-6">
              <p className="text-gray-700 mb-4">{product.shortDescription}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                <span>In Stock</span>
              </div>
            </div>
            
            {/* Quantity selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center">
                <button 
                  className="border border-gray-300 rounded-l-md px-3 py-2"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  className="border-t border-b border-gray-300 text-center w-16 py-2"
                  min={1}
                  max={product.stock}
                />
                <button 
                  className="border border-gray-300 rounded-r-md px-3 py-2"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={!!(product.stock && quantity >= product.stock)}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Add to cart button */}
            <div className="mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={isInCart(product._id)}
                className="bg-[#16d6fa] hover:bg-[#14c4e8] text-black font-bold rounded-full px-8 py-3 w-full"
              >
                {isInCart(product._id) ? "ADDED TO CART" : "ADD TO CART"}
              </Button>
            </div>
            
            {/* SKU */}
            <div className="text-sm text-gray-500">
              SKU: {product.sku}
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Product Description</h2>
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
          </div>
        </div>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  {feature.icon && (
                    <div className="w-12 h-12 bg-[#e6f9fd] rounded-full flex items-center justify-center text-[#12d6fa]">
                      <span className="text-xl">{feature.icon}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="mb-16">
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
                <div key={relatedProduct._id} className="bg-white border border-gray-100 hover:shadow-sm transition-shadow flex flex-col">
                  <Link href={`/shop/flavor/${relatedProduct.slug || relatedProduct._id}`} className="block">
                    <div className="relative h-48 bg-white mb-2 flex items-center justify-center">
                      <Image
                        src={relatedProduct.images && relatedProduct.images.length > 0 
                          ? relatedProduct.images[0].url 
                          : "/images/01 - Flavors/Strawberry-Lemon-Flavor.png"}
                        alt={relatedProduct.name}
                        width={120}
                        height={120}
                        className="object-contain h-40"
                      />
                    </div>
                    <h3 className="font-medium text-sm px-3 mb-1 hover:text-[#12d6fa] transition-colors">{relatedProduct.name}</h3>
                  </Link>
                  <div className="px-3 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-base">{relatedProduct.price.toFixed(2)}</span>
                        <span className="text-xs">﷼</span>
                      </div>
                      {relatedProduct.originalPrice && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 text-xs line-through">{relatedProduct.originalPrice.toFixed(2)}</span>
                          <span className="text-xs bg-red-100 text-red-600 px-1 rounded">
                            {Math.round(((relatedProduct.originalPrice - relatedProduct.price) / relatedProduct.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(relatedProduct.averageRating || 5)}
                      <span className="text-xs text-gray-500">({relatedProduct.reviewCount || 0})</span>
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