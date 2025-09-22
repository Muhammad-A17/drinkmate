"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/AdminLayout"

interface ExchangeCylinder {
  _id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  image: string
  description: string
  capacity: number
  material: string
  exchangeType: 'instant' | 'scheduled' | 'pickup'
  estimatedTime: string
  rating: number
  reviewCount: number
  inStock: boolean
  badges?: string[]
  createdAt: string
  updatedAt: string
}

export default function TestExchangeCylinders() {
  console.log('TestExchangeCylinders component rendering')
  const [cylinders, setCylinders] = useState<ExchangeCylinder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('useEffect running - setting up mock data')
    const mockCylinders: ExchangeCylinder[] = [
      {
        _id: "1",
        name: "60L CO2 Cylinder Exchange",
        slug: "60l-co2-cylinder-exchange",
        price: 45,
        originalPrice: 60,
        image: "https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-60l.jpg",
        description: "Professional 60L CO2 cylinder exchange service with instant availability",
        capacity: 60,
        material: "Steel",
        exchangeType: "instant",
        estimatedTime: "Same Day",
        rating: 4.8,
        reviewCount: 124,
        inStock: true,
        badges: ["POPULAR", "INSTANT"],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z"
      },
      {
        _id: "2",
        name: "40L CO2 Cylinder Exchange",
        slug: "40l-co2-cylinder-exchange",
        price: 35,
        originalPrice: 45,
        image: "https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-40l.jpg",
        description: "Compact 40L CO2 cylinder exchange for smaller operations",
        capacity: 40,
        material: "Steel",
        exchangeType: "scheduled",
        estimatedTime: "1-2 Days",
        rating: 4.6,
        reviewCount: 89,
        inStock: true,
        badges: ["COMPACT"],
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-10T10:00:00Z"
      }
    ]
    
    console.log('Setting mock data:', mockCylinders.length, 'cylinders')
    setCylinders(mockCylinders)
    setLoading(false)
    console.log('Loading set to false')
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 animate-spin border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>Loading exchange cylinders...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Test Exchange Cylinders</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>Total cylinders: {cylinders.length}</p>
        <p>Loading: {loading.toString()}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cylinders.map((cylinder) => (
          <div key={cylinder._id} className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold">{cylinder.name}</h3>
            <p className="text-gray-600">Price: {cylinder.price} SAR</p>
            <p className="text-gray-600">Type: {cylinder.exchangeType}</p>
            <p className="text-gray-600">Description: {cylinder.description}</p>
          </div>
        ))}
      </div>
      
      {cylinders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No cylinders found</p>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
