"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Star } from "lucide-react"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

interface ProductOverviewProps {
  product: any // Using any for flexibility with different product structures
  activeImage: string
  setActiveImage: (url: string) => void
  selectedColor: string
  handleColorChange: (color: string) => void
  quantity: number
  handleQuantityChange: (quantity: number) => void
  handleAddToCart: () => void
  isInCart: boolean
  discountPercentage: number
  renderStars: (rating: number) => JSX.Element
}

export default function ProductOverview({ 
  product, 
  activeImage, 
  setActiveImage, 
  selectedColor, 
  handleColorChange,
  quantity,
  handleQuantityChange,
  handleAddToCart,
  isInCart,
  discountPercentage,
  renderStars
}: ProductOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      {/* Product Images */}
      <div>
        <div className="bg-white rounded-lg mb-4 flex items-center justify-center h-96">
          <Image
            src={activeImage || (product.images && product.images.length > 0 ? product.images[0].url : "/images/placeholder.jpg")}
            alt={product.name}
            width={300}
            height={300}
            className="object-contain max-h-80"
          />
        </div>
        
        {/* Thumbnail images */}
        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image: any, index: number) => (
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
            <span className="text-3xl font-bold">
              <SaudiRiyal amount={product.price} size="xl" />
            </span>
            {product.originalPrice && (
              <>
                <span className="text-gray-400 text-lg line-through">
                  <SaudiRiyal amount={product.originalPrice} size="lg" />
                </span>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="border-t border-b py-4 my-6">
          <p className="text-gray-700 mb-4">{product.shortDescription}</p>
        </div>
        
        {/* Color Selection */}
        {product.colors && product.colors.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color: any) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  className={`w-8 h-8 rounded-full ${selectedColor === color.name ? 'ring-2 ring-[#12d6fa]' : ''}`}
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}
        
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
              disabled={product.stock && quantity >= product.stock}
            >
              +
            </button>
          </div>
        </div>
        
        {/* Add to cart button */}
        <div className="mb-6">
          <Button
            onClick={handleAddToCart}
            disabled={isInCart}
            className="bg-[#16d6fa] hover:bg-[#14c4e8] text-black font-bold rounded-full px-8 py-3 w-full"
          >
            {isInCart ? "ADDED TO CART" : "ADD TO CART"}
          </Button>
        </div>
        
        {/* SKU */}
        <div className="text-sm text-gray-500">
          SKU: {product.sku}
        </div>
      </div>
    </div>
  )
}