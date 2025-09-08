"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

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
  isNew?: boolean
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

  // Manual refresh function with useCallback for performance
  const handleManualRefresh = useCallback(() => {
    fetchCylinders()
  }, [])

  useEffect(() => {
    fetchCylinders()
    
    // Listen for changes in localStorage from admin panel
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'co2-cylinders' && e.newValue) {
        try {
          const parsedCylinders = JSON.parse(e.newValue)
          const activeCylinders = parsedCylinders
            .filter((cylinder: CO2Cylinder) => cylinder.status === 'active')
            .slice(0, 3)
          setCylinders(activeCylinders)
        } catch (error) {
          console.error('Error parsing updated cylinders:', error)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      const savedCylinders = localStorage.getItem('co2-cylinders')
      if (savedCylinders) {
        try {
          const parsedCylinders = JSON.parse(savedCylinders)
          const activeCylinders = parsedCylinders
            .filter((cylinder: CO2Cylinder) => cylinder.status === 'active')
            .slice(0, 3)
          setCylinders(activeCylinders)
        } catch (error) {
          console.error('Error parsing updated cylinders:', error)
        }
      }
    }
    
    window.addEventListener('co2-cylinders-updated', handleCustomStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('co2-cylinders-updated', handleCustomStorageChange)
    }
  }, [])

  const fetchCylinders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if there are any cylinders saved in localStorage from admin panel
      const savedCylinders = localStorage.getItem('co2-cylinders')
      
      if (savedCylinders) {
        try {
          const parsedCylinders = JSON.parse(savedCylinders)
          
          // Filter only active cylinders and limit to 3 for display
          const activeCylinders = parsedCylinders
            .filter((cylinder: CO2Cylinder) => cylinder.status === 'active')
            .slice(0, 3)
          
          setCylinders(activeCylinders)
          return
        } catch (error) {
          console.error('Error parsing saved cylinders:', error)
          setError('Failed to load saved cylinders')
        }
      }
      
      // Fallback to default mock data if no saved cylinders
      setCylinders(getMockCylinders)
      
      // Original API call (commented out for now)
      /*
      const response = await fetch('http://localhost:3000/api/co2/cylinders')
      
      if (response.ok) {
        const data = await response.json()
        // Filter only active cylinders and limit to 3 for display
        const activeCylinders = data.cylinders
          ?.filter((cylinder: CO2Cylinder) => cylinder.status === 'active')
          ?.slice(0, 3) || []
        setCylinders(activeCylinders)
      } else {
        console.error('Failed to fetch cylinders')
        // Fallback to mock data if API fails
        setCylinders(getMockCylinders())
      }
      */
    } catch (error) {
      console.error('Error fetching cylinders:', error)
      setError('Failed to load cylinders')
      // Fallback to mock data if API fails
      setCylinders(getMockCylinders)
    } finally {
      setLoading(false)
    }
  }, [])

  const getMockCylinders = useMemo((): CO2Cylinder[] => [
    {
      _id: "1",
      slug: "cylinder-subscription-service",
      name: "Cylinder Subscription Service",
      brand: "DrinkMate",
      type: "subscription",
      price: 150.00,
      originalPrice: 200.00,
      discount: 25,
      capacity: 60,
      material: "steel",
      stock: 50,
      minStock: 10,
      status: "active",
      isBestSeller: true,
      isFeatured: true,
      description: "A customised service that provides cylinder service as per your needs.",
      features: ["Monthly delivery", "Quality guarantee", "24/7 support"],
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      createdAt: new Date().toISOString()
    },
    {
      _id: "2",
      slug: "refill-exchange-cylinder",
      name: "Refill / Exchange Cylinder",
      brand: "DrinkMate",
      type: "refill",
      price: 65.00,
      originalPrice: 89.99,
      discount: 28,
      capacity: 60,
      material: "steel",
      stock: 25,
      minStock: 5,
      status: "active",
      isBestSeller: true,
      isFeatured: true,
      description: "Refill / exchange your empty cylinder for a full cylinder and only pay for the refill.",
      features: ["Quick refill", "Quality tested", "Safe handling"],
      image: "/images/02 - Soda Makers/Purple-Machine---Front.png",
      createdAt: new Date().toISOString()
    },
    {
      _id: "3",
      slug: "new-spare-cylinder",
      name: "New / Spare Cylinder",
      brand: "DrinkMate",
      type: "new",
      price: 175.00,
      originalPrice: 199.99,
      discount: 12,
      capacity: 60,
      material: "steel",
      stock: 15,
      minStock: 5,
      status: "active",
      isBestSeller: false,
      isFeatured: true,
      description: "Have a spare cylinder so you never run out of sparkling drinks.",
      features: ["Brand new", "Full capacity", "Warranty included"],
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      createdAt: new Date().toISOString()
    }
  ], [])

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cylinders.map((cylinder) => (
          <Link
            key={cylinder._id}
            href={`/co2/${cylinder.slug}`}
            className="block"
          >
            <div
              className="bg-white rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg cursor-pointer"
              onMouseEnter={() => setHoveredCard(parseInt(cylinder._id))}
              onMouseLeave={() => setHoveredCard(null)}
            >
            <div className="text-center space-y-4">
              <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mx-auto overflow-hidden">
                <img 
                  src={cylinder.image || (getServiceType(cylinder.type) === "subscription" 
                    ? "/images/02 - Soda Makers/Artic-Black-Machine---Front.png"
                    : getServiceType(cylinder.type) === "refill" 
                      ? "/images/02 - Soda Makers/Purple-Machine---Front.png" 
                      : "/images/02 - Soda Makers/Artic-Black-Machine---Front.png")} 
                  alt={cylinder.name}
                  className="w-40 h-40 object-contain"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-black mb-2 font-montserrat tracking-tight">{cylinder.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-noto-sans mb-4">{cylinder.description}</p>
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
