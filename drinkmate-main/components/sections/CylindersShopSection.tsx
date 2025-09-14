"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { fetchWithRetry } from "@/lib/fetch-utils"
import { co2API } from "@/lib/api"
import { logger } from "@/lib/logger"
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
}

export function CylindersShopSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [cylinders, setCylinders] = useState<CO2Cylinder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCylinders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the co2API to fetch cylinders
      const response = await co2API.getCylinders();
      
      // Debug - check exactly what we're getting
      logger.debug('CYLINDERS DEBUG - Raw Response:', JSON.stringify(response));
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
        
        setCylinders(processedCylinders)
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
      case 'new':
        return 'new'
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black font-montserrat mb-4 tracking-tight">
            Shop CO2 Cylinders
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
            Choose the perfect CO2 solution for your needs
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-black font-montserrat mb-4 tracking-tight">
          Shop CO2 Cylinders
        </h2>
        <p className="text-lg md:text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
          Choose the perfect CO2 solution for your needs
        </p>
        
        {/* Error display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button 
              onClick={handleManualRefresh}
              className="ml-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}
        
        {/* Debug info */}
        <div className="mt-2 text-sm text-gray-500">
          Found {cylinders.length} cylinders
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cylinders.map((cylinder) => (
          <Link
            key={cylinder._id}
            href={`/co2/${cylinder.slug}`}
            className="block"
          >
            <div
              className="bg-white rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-102 hover:shadow-lg cursor-pointer h-full"
              onMouseEnter={() => setHoveredCard(parseInt(cylinder._id))}
              onMouseLeave={() => setHoveredCard(null)}
            >
            <div className="text-center space-y-4">
              <div className="w-36 h-36 bg-white rounded-2xl flex items-center justify-center mx-auto overflow-hidden">
                <img 
                  src={cylinder.image || (getServiceType(cylinder.type) === "subscription" 
                    ? "/images/02 - Soda Makers/Artic-Black-Machine---Front.png"
                    : getServiceType(cylinder.type) === "refill" 
                      ? "/images/02 - Soda Makers/Purple-Machine---Front.png" 
                      : "/images/02 - Soda Makers/Artic-Black-Machine---Front.png")} 
                  alt={cylinder.name}
                  width="120"
                  height="120"
                  className={`w-32 h-32 object-contain ${styles.productImage}`}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback if image fails to load
                    const target = e.currentTarget;
                    logger.warn("Image failed to load:", target.src);
                    // Set a fallback image
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-black mb-1 font-montserrat tracking-tight line-clamp-1">{cylinder.name}</h3>
                <p className="text-gray-600 text-xs leading-relaxed font-noto-sans mb-3 line-clamp-2">{cylinder.description}</p>
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">
                    {getPriceText(cylinder.type)}
                  </p>
                  <div className="text-2xl font-bold text-black font-montserrat">
                    <SaudiRiyal amount={cylinder.price} size="sm" />
                  </div>
                  {cylinder.originalPrice > cylinder.price && (
                    <div className="text-xs text-gray-500 line-through mt-1">
                      <SaudiRiyal amount={cylinder.originalPrice} size="sm" />
                    </div>
                  )}
                </div>

                <button
                  className={`w-full py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform text-sm ${
                    hoveredCard === parseInt(cylinder._id)
                      ? "bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] text-white scale-105 shadow-xl"
                      : "bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] text-white hover:scale-105 shadow-lg hover:shadow-xl"
                  }`}
                >
                  View Details
                </button>
              </div>
            </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}