"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/contexts/auth-context"

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalProducts: number
  totalRevenue: number
  lowStockProducts: number
  pendingOrders: number
  totalTestimonials: number
  totalBlogPosts: number
  totalContacts: number
  monthlyGrowth: number
  orderGrowth: number
  userGrowth: number
}

interface RecentOrder {
  _id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: string
}

interface RecentProduct {
  _id: string
  name: string
  price: number
  stock: number
  category: string
  isBestSeller: boolean
}

interface DashboardData {
  stats: DashboardStats
  recentOrders: RecentOrder[]
  recentProducts: RecentProduct[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const initialStats: DashboardStats = {
  totalUsers: 0,
  totalOrders: 0,
  totalProducts: 0,
  totalRevenue: 0,
  lowStockProducts: 0,
  pendingOrders: 0,
  totalTestimonials: 0,
  totalBlogPosts: 0,
  totalContacts: 0,
  monthlyGrowth: 0,
  orderGrowth: 0,
  userGrowth: 0
}

export function useDashboardData(): DashboardData {
  const { token } = useAuth()
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)
  const FETCH_THROTTLE = 5000 // 5 seconds minimum between fetches

  const fetchDashboardData = useCallback(async () => {
    try {
      // Throttle requests to prevent rate limiting
      const now = Date.now()
      if (now - lastFetch < FETCH_THROTTLE) {
        return
      }
      
      setIsLoading(true)
      setError(null)
      setLastFetch(now)
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch stats (${statsResponse.status})`)
      }

      const statsData = await statsResponse.json()
      
      if (statsData.success && statsData.data) {
        setStats(statsData.data)
      } else {
        throw new Error('Invalid stats response format')
      }

      // Fetch recent data
      const recentResponse = await fetch('/api/admin/recent-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        if (recentData.success && recentData.data) {
          // Transform orders data
          const transformedOrders = (recentData.data.orders || []).map((order: any) => ({
            _id: order._id,
            orderNumber: `ORD-${order._id.slice(-6).toUpperCase()}`,
            customerName: order.user ? 
              (order.user.fullName || `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Unknown Customer') : 
              'Unknown Customer',
            total: order.total,
            status: order.status,
            createdAt: order.createdAt
          }))
          setRecentOrders(transformedOrders)
          
          // Transform products data
          const transformedProducts = (recentData.data.products || []).map((product: any) => ({
            _id: product._id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            isBestSeller: product.stock < 10
          }))
          setRecentProducts(transformedProducts)
        }
      } else {
        // Handle 404 or other errors gracefully
        if (recentResponse.status === 404) {
          // Endpoint not found, use empty arrays
          setRecentOrders([])
          setRecentProducts([])
        } else {
          // Other errors, also use empty arrays
          setRecentOrders([])
          setRecentProducts([])
        }
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data')
      // Reset to initial state on error
      setStats(initialStats)
      setRecentOrders([])
      setRecentProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [token, lastFetch])

  useEffect(() => {
    if (token) {
      fetchDashboardData()
    }
  }, [token]) // Remove fetchDashboardData from dependencies to prevent infinite loop

  return {
    stats,
    recentOrders,
    recentProducts,
    isLoading,
    error,
    refresh: fetchDashboardData
  }
}
