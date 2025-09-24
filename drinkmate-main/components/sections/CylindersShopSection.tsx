"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { fetchWithRetry } from "@/lib/fetch-utils"
import { co2API } from "@/lib/api"
import { exchangeCylinderAPI } from "@/lib/exchange-cylinder-api"
import { logger } from "@/lib/logger"
import BundleStyleProductCard from "@/components/shop/BundleStyleProductCard"
import ExchangeCylinderCard from "@/components/shop/ExchangeCylinderCard"
import styles from "./CylindersShopSection.module.css"

interface CO2Cylinder {
  _id: string
  slug: string
  name: string
  brand: string
  type: string
  price: number
  originalPrice: number
  discount: number
  capacity: number
  material: string
  stock: number
  minStock: number
  status: string
  isBestSeller: boolean
  isFeatured: boolean
  isNewProduct?: boolean
  isEcoFriendly?: boolean
  description: string
  features: string[]
  image: string
  images?: string[]
  videos?: string[]
  averageRating?: number
  totalReviews?: number
  createdAt: string
  // Exchange-specific fields
  exchangeType?: string
  estimatedTime?: string
}

interface CylindersShopSectionProps {
  type?: 'exchange' | 'refill' | 'all'
}

export function CylindersShopSection({ type = 'all' }: CylindersShopSectionProps) {
  const [cylinders, setCylinders] = useState<CO2Cylinder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCylinders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let response;
      
      // Use different API based on type
      if (type === 'exchange') {
        // Use exchange cylinder API for exchange type
        response = await exchangeCylinderAPI.getExchangeCylinders();
        logger.debug('EXCHANGE CYLINDERS DEBUG - Raw Response:', JSON.stringify(response));
      } else {
        // Use regular CO2 API for other types
        response = await co2API.getCylinders();
        logger.debug('CO2 CYLINDERS DEBUG - Raw Response:', JSON.stringify(response));
      }
      
      // Debug - check exactly what we're getting
      logger.debug('CYLINDERS DEBUG - Has success:', response.success !== undefined);
      logger.debug('CYLINDERS DEBUG - Has cylinders:', response.cylinders !== undefined);
      
      // Handle the response regardless of whether success field is present
      // as long as we have cylinders data
      if (response.cylinders) {
        // Get all cylinders from the database
        const allCylinders = response.cylinders || []
          
        // Ensure image URLs are absolute
        const processedCylinders = allCylinders.map((cylinder: CO2Cylinder) => {
          // Handle case where image might be undefined or null
          const safeImage = cylinder.image || '';
          const safeImages = cylinder.images || [];
          
          return {
            ...cylinder,
            // Ensure image URL is absolute
            image: safeImage.startsWith('http') ? safeImage : 
                   safeImage.startsWith('/') ? `${window.location.origin}${safeImage}` : 
                   '/placeholder.svg',
            // Ensure image URLs in arrays are absolute
            images: safeImages.map((img: string) => 
              img?.startsWith('http') ? img : 
              img?.startsWith('/') ? `${window.location.origin}${img}` : 
              '/placeholder.svg'
            )
          }
        })
        
        // Filter cylinders based on type
        let filteredCylinders = processedCylinders
        if (type !== 'all') {
          if (type === 'exchange') {
            // For exchange type, we're already getting exchange cylinders from the API
            // No additional filtering needed
            filteredCylinders = processedCylinders
          } else {
            // For other types, filter based on cylinder type
            filteredCylinders = processedCylinders.filter((cylinder: CO2Cylinder) => {
              const serviceType = getServiceType(cylinder.type)
              if (type === 'refill') {
                return serviceType === 'refill' // Refill cylinders have type 'refill'
              }
              return true
            })
          }
        }
        
        setCylinders(filteredCylinders)
      } else {
        const errorMessage = response.message || response.error || 'Failed to load cylinders'
        console.error('Failed to fetch cylinders:', errorMessage)
        setError(errorMessage)
        setCylinders([])
      }
    } catch (error: any) {
      console.error('CYLINDERS DEBUG - Error object:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load cylinders'
      console.error('Error fetching cylinders:', errorMessage)
      setError(errorMessage)
      setCylinders([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Manual refresh function with useCallback for performance
  const handleManualRefresh = useCallback(() => {
    setLoading(true)
    fetchCylinders()
  }, [fetchCylinders])

  useEffect(() => {
    fetchCylinders()
    
    // Setup a refresh interval
    const refreshInterval = setInterval(() => {
      fetchCylinders()
    }, 300000) // Refresh every 5 minutes
    
    return () => {
      clearInterval(refreshInterval)
    }
  }, [fetchCylinders])

  const getServiceType = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'subscription'
      case 'refill':
        return 'refill'
      case 'exchange':
        return 'exchange'
      case 'new':
        return 'new'
      case 'conversion':
        return 'conversion'
      default:
        return 'refill'
    }
  }

  const getPriceText = (type: string) => {
    switch (type) {
      case 'subscription':
        return "Subscriptions starts from"
      case 'refill':
        return "Refill / Exchange starts from"
      case 'new':
        return "Buy a new cylinder just for"
      default:
        return "Price starts from"
    }
  }

  // Skeleton loading component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 animate-pulse">
      <div className="w-48 h-48 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  )

  const getSectionTitle = () => {
    switch (type) {
      case 'exchange':
        return 'Exchange Cylinders'
      case 'refill':
        return 'Refill Cylinders'
      default:
        return 'Shop CO2 Cylinders'
    }
  }

  const getSectionDescription = () => {
    switch (type) {
      case 'exchange':
        return 'Quick and easy cylinder exchange service'
      case 'refill':
        return 'Get your empty cylinders refilled with premium CO2'
      default:
        return 'Choose the perfect CO2 solution for your needs'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black font-montserrat mb-3 sm:mb-4 tracking-tight">
            {getSectionTitle()}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
            {getSectionDescription()}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black font-montserrat mb-3 sm:mb-4 tracking-tight">
          {getSectionTitle()}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
          {getSectionDescription()}
        </p>
        
        {/* Error display */}
        {error && (
          <div className="mt-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={handleManualRefresh}
              className="ml-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              Try again
            </button>
          </div>
        )}
        
        {/* Results count */}
        <div className="mt-2 text-xs sm:text-sm text-gray-500">
          Found {cylinders.length} cylinder{cylinders.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
        {cylinders.map((cylinder) => {
          const serviceType = getServiceType(cylinder.type)
          
          // Use ExchangeCylinderCard for exchange type or refill type
          if (type === "exchange" || (serviceType === "refill" && type === "refill")) {
            return (
              <ExchangeCylinderCard
                key={`exchange-${cylinder._id}`}
                product={{
                  id: cylinder._id,
                  slug: cylinder.slug,
                  title: cylinder.name,
                  image: cylinder.image || "/placeholder.svg",
                  price: cylinder.price,
                  compareAtPrice: cylinder.originalPrice,
                  rating: cylinder.averageRating || 0,
                  reviewCount: cylinder.totalReviews || 0,
                  description: cylinder.description,
                  category: "co2-cylinder",
                  inStock: cylinder.stock > 0,
                  badges: cylinder.isBestSeller ? ["BESTSELLER"] : cylinder.isFeatured ? ["FEATURED"] : undefined,
                  capacity: cylinder.capacity,
                  material: cylinder.material,
                  exchangeType: type === "exchange" ? (cylinder.exchangeType as "instant" | "scheduled" | "pickup" || "instant") : "scheduled",
                  estimatedTime: type === "exchange" ? (cylinder.estimatedTime || "Same Day") : "1-2 Days"
                }}
                onAddToCart={({ productId, qty }: { productId: string; qty: number }) => {
                  console.log('Add CO2 cylinder to cart:', productId, qty);
                }}
                onAddToWishlist={() => {}}
                onAddToComparison={() => {}}
                onProductView={() => {}}
                className="h-full"
              />
            )
          }
          
          // Use BundleStyleProductCard for other types
          return (
            <BundleStyleProductCard
              key={cylinder._id}
              product={{
                _id: cylinder._id,
                id: cylinder._id,
                name: cylinder.name,
                slug: cylinder.slug,
                title: cylinder.name,
                image: cylinder.image || "/placeholder.svg",
                price: cylinder.price,
                compareAtPrice: cylinder.originalPrice,
                rating: cylinder.averageRating || 0,
                reviewCount: cylinder.totalReviews || 0,
                description: cylinder.description,
                category: "co2-cylinder",
                inStock: cylinder.stock > 0,
                badges: cylinder.isBestSeller ? ["BESTSELLER"] : cylinder.isFeatured ? ["FEATURED"] : undefined,
              }}
              onAddToCart={({ productId, qty }: { productId: string; qty: number }) => {
                console.log('Add CO2 cylinder to cart:', productId, qty);
              }}
              onAddToWishlist={() => {}}
              onAddToComparison={() => {}}
              onProductView={() => {}}
              className="h-full"
            />
          )
        })}
      </div>
    </div>
  )
}