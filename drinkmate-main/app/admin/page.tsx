"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useAdminTranslation } from "@/lib/use-admin-translation"
import { useTranslation } from "@/lib/translation-context"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/LoadingButton"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  ShoppingBag, 
  Package, 
  TrendingUp,
  DollarSign,
  AlertCircle,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  FileText,
  Activity,
  Utensils,
  LayoutDashboard,
  BarChart2
} from "lucide-react"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import AdminChatDashboard from "@/components/chat/AdminChatDashboard"
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

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

export default function AdminDashboard() {
  const { t } = useAdminTranslation()
  const { isRTL } = useTranslation()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
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
  })

  // Debug info
  useEffect(() => {
    console.log("Admin Dashboard - Auth State:", {
      isAuthenticated,
      isLoading,
      user: user ? { id: user._id, email: user.email, isAdmin: user.isAdmin } : null
    });
  }, [isAuthenticated, isLoading, user]);
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  const { token } = useAuth()
  const router = useRouter()

  // Fetch dashboard stats
  useEffect(() => {
    fetchDashboardData()
  }, [token])

  const fetchDashboardData = async () => {
    try {
      setIsDataLoading(true)
      
      // Fetch real stats from API
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch stats')
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        setStats(data.data)
      } else {
        throw new Error('Invalid response format')
      }

      // Fetch recent data from API
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
          // Transform orders data to match expected format
          const transformedOrders = (recentData.data.orders || []).map((order: any) => ({
            _id: order._id,
            orderNumber: `ORD-${order._id.slice(-6).toUpperCase()}`,
            customerName: order.user ? (order.user.fullName || `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Unknown Customer') : 'Unknown Customer',
            total: order.total,
            status: order.status,
            createdAt: order.createdAt
          }))
          setRecentOrders(transformedOrders)
          
          // Transform products data to match expected format
          const transformedProducts = (recentData.data.products || []).map((product: any) => ({
            _id: product._id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            isBestSeller: product.stock < 10 // Mark low stock as best seller for demo
          }))
          setRecentProducts(transformedProducts)
        }
      } else {
        console.warn('Failed to fetch recent data, using empty arrays')
        setRecentOrders([])
        setRecentProducts([])
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Fallback to basic stats if API fails
      setStats({
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
      })
    } finally {
      setIsDataLoading(false)
    }
  }

  // Refresh dashboard data
  const refreshDashboard = () => {
    fetchDashboardData()
  }

  // Sample data for charts
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales',
        data: [30000, 55000, 42000, 68000, 73000, 82000, 91000, 85000, 78000, 92000, 88000, 95000],
        borderColor: '#12d6fa',
        backgroundColor: 'rgba(18, 214, 250, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const productCategoryData = {
    labels: ['Sodamakers', 'Flavors', 'Accessories', 'CO2', 'Bundles'],
    datasets: [
      {
        label: 'Products by Category',
        data: [28, 34, 18, 16, 12],
        backgroundColor: [
          'rgba(18, 214, 250, 0.8)',
          'rgba(168, 243, 135, 0.8)',
          'rgba(252, 186, 3, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(147, 51, 234, 0.8)'
        ],
        borderColor: [
          'rgba(18, 214, 250, 1)',
          'rgba(168, 243, 135, 1)',
          'rgba(252, 186, 3, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(147, 51, 234, 1)'
        ],
        borderWidth: 2
      }
    ]
  }

  const orderStatusData = {
    labels: ['Completed', 'Processing', 'Shipped', 'Pending', 'Cancelled'],
    datasets: [
      {
        label: 'Orders by Status',
        data: [65, 15, 12, 5, 3],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'shipped': return <Package className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Enhanced chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    }
  }

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          callback: (value: any) => `﷼${Number(value).toLocaleString()}`,
          font: {
            size: 11,
            family: 'SaudiRiyalSymbol, Arial, sans-serif'
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: (context: any) => `Sales: ﷼${Number(context.parsed.y).toLocaleString()}`
        }
      }
    }
  }

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  }

  const doughnutChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11
          }
        }
      }
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-4 md:p-6 relative z-10">
        {/* Premium Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                    <LayoutDashboard className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Welcome back, {user?.fullName || user?.username || 'Admin'}! 👋
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Here's what's happening with your store today.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#12d6fa]">{stats.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
              </div>
            </div>
            
            {/* Temporary Admin Promotion Button - Development Only */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-orange-800">Development Mode</h3>
                    <p className="text-xs text-orange-600">Promote current user to admin to access dashboard data</p>
                  </div>
                  <Button 
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:3000/auth/promote-admin', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ email: user?.email })
                        })
                        
                        if (response.ok) {
                          const data = await response.json()
                          if (data.success) {
                            // Update the token in localStorage
                            localStorage.setItem('auth-token', data.token)
                            // Reload the page to refresh the auth state
                            window.location.reload()
                          }
                        } else {
                          console.error('Failed to promote to admin')
                        }
                      } catch (error) {
                        console.error('Error promoting to admin:', error)
                      }
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    size="sm"
                  >
                    🔧 Promote to Admin
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <LoadingButton
                  onClick={refreshDashboard}
                  className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  loadingText="Refreshing..."
                >
                  <Activity className="h-5 w-5 mr-2" />
                  Refresh Data
                </LoadingButton>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/analytics')}
                  className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 px-6 py-3 rounded-xl transition-all duration-300"
                >
                  <BarChart2 className="h-5 w-5 mr-2" />
                  View Analytics
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setIsChatOpen(true)}
                  className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-300"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Live Chat
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-sm text-gray-600 mt-1">Total Users</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">+{stats.userGrowth}% from last month</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">{stats.totalOrders.toLocaleString()}</div>
                  <p className="text-sm text-gray-600 mt-1">Total Orders</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">+{stats.orderGrowth}% from last month</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-[#12d6fa]">
                    <SaudiRiyal amount={stats.totalRevenue} size="xl" />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">+{stats.monthlyGrowth}% from last month</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600">{stats.totalProducts}</div>
                  <p className="text-sm text-gray-600 mt-1">Total Products</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Across all categories</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600">{stats.lowStockProducts}</div>
                  <p className="text-sm text-gray-600 mt-1">Low Stock Alert</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Products need restocking</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</div>
                  <p className="text-sm text-gray-600 mt-1">Pending Orders</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Awaiting processing</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-indigo-600">{stats.totalTestimonials}</div>
                  <p className="text-sm text-gray-600 mt-1">Testimonials</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-xl">
                  <Star className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Customer reviews</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-teal-600">{stats.totalContacts}</div>
                  <p className="text-sm text-gray-600 mt-1">Contact Messages</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-teal-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">New inquiries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl mr-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Sales Overview</h3>
                  <p className="text-sm text-gray-600">Last 12 Months Performance</p>
                </div>
              </div>
              <div className="h-80">
                <Line 
                  data={salesData} 
                  options={lineChartOptions} 
                />
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl mr-4">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Product Categories</h3>
                  <p className="text-sm text-gray-600">Distribution Analysis</p>
                </div>
              </div>
              <div className="h-80">
                <Bar 
                  data={productCategoryData} 
                  options={barChartOptions} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl mr-4">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Order Status</h3>
                  <p className="text-sm text-gray-600">Distribution Analysis</p>
                </div>
              </div>
              <div className="h-80 flex items-center justify-center">
                <div className="w-64">
                  <Doughnut 
                    data={orderStatusData} 
                    options={doughnutChartOptions} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl mr-4">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-600">Live System Updates</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { user: "Ahmed", action: "placed an order", time: "5 minutes ago", type: "order" },
                  { user: "Sara", action: "registered a new account", time: "2 hours ago", type: "user" },
                  { user: "Admin", action: "added 5 new products", time: "Yesterday", type: "product" },
                  { user: "Mohammed", action: "left a product review", time: "Yesterday", type: "review" },
                  { user: "Fatima", action: "placed an order", time: "2 days ago", type: "order" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center border-b pb-3 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-medium">
                      {activity.user.charAt(0)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Recent Orders and Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl mr-4">
                    <ShoppingBag className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
                    <p className="text-sm text-gray-600">Latest customer orders</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/admin/orders')}
                  className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 px-4 py-2 rounded-xl transition-all duration-300"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/60 rounded-xl border border-gray-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        <SaudiRiyal amount={order.total} size="sm" />
                      </p>
                      <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl mr-4">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Recent Products</h3>
                    <p className="text-sm text-gray-600">Latest product additions</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/admin/products')}
                  className="border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 px-4 py-2 rounded-xl transition-all duration-300"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/60 rounded-xl border border-gray-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        <SaudiRiyal amount={product.price} size="sm" />
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                          Stock: {product.stock}
                        </span>
                        {product.isBestSeller && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Quick Actions */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
          <div className="relative p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl mr-4">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600">Access frequently used features</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex-col space-y-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 rounded-xl border-2"
                onClick={() => router.push('/admin/products')}
              >
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium text-sm">Add Product</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col space-y-3 hover:bg-green-50 hover:border-green-300 transition-all duration-300 transform hover:scale-105 rounded-xl border-2"
                onClick={() => router.push('/admin/users')}
              >
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <span className="font-medium text-sm">Manage Users</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col space-y-3 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 rounded-xl border-2"
                onClick={() => router.push('/admin/orders')}
              >
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
                </div>
                <span className="font-medium text-sm">View Orders</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col space-y-3 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 transform hover:scale-105 rounded-xl border-2"
                onClick={() => router.push('/admin/recipes')}
              >
                <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg">
                  <Utensils className="h-6 w-6 text-orange-600" />
                </div>
                <span className="font-medium text-sm">Manage Recipes</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col space-y-3 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 transform hover:scale-105 rounded-xl border-2"
                onClick={() => router.push('/admin/blog')}
              >
                <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="font-medium text-sm">Create Post</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col space-y-3 hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 transform hover:scale-105 rounded-xl border-2"
                onClick={() => setIsChatOpen(true)}
              >
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-cyan-600" />
                </div>
                <span className="font-medium text-sm">Live Chat</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Notifications & Alerts */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
          <div className="relative p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl mr-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Important Alerts</h3>
                <p className="text-sm text-gray-600">System notifications and warnings</p>
              </div>
            </div>
            <div className="space-y-4">
              {stats.lowStockProducts > 0 && (
                <div className="flex items-center p-4 bg-gradient-to-r from-red-50/80 to-red-100/60 border border-red-200/50 rounded-xl">
                  <div className="p-2 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg mr-4">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-800">
                      {stats.lowStockProducts} products have low stock
                    </p>
                    <p className="text-sm text-red-600">
                      Consider restocking these items to avoid stockouts
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push('/admin/products')}
                    className="border-2 border-red-200 text-red-700 hover:bg-red-100 px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    View Products
                  </Button>
                </div>
              )}
              
              {stats.pendingOrders > 0 && (
                <div className="flex items-center p-4 bg-gradient-to-r from-yellow-50/80 to-yellow-100/60 border border-yellow-200/50 rounded-xl">
                  <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg mr-4">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800">
                      {stats.pendingOrders} orders pending processing
                    </p>
                    <p className="text-sm text-yellow-600">
                      Process these orders to improve customer satisfaction
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push('/admin/orders')}
                    className="border-2 border-yellow-200 text-yellow-700 hover:bg-yellow-100 px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    View Orders
                  </Button>
                </div>
              )}

              {stats.totalContacts > 0 && (
                <div className="flex items-center p-4 bg-gradient-to-r from-blue-50/80 to-blue-100/60 border border-blue-200/50 rounded-xl">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg mr-4">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-blue-800">
                      {stats.totalContacts} new contact messages
                    </p>
                    <p className="text-sm text-blue-600">
                      Respond to customer inquiries promptly
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push('/admin/contact')}
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    View Messages
                  </Button>
                </div>
              )}

              {stats.lowStockProducts === 0 && stats.pendingOrders === 0 && stats.totalContacts === 0 && (
                <div className="flex items-center p-4 bg-gradient-to-r from-green-50/80 to-green-100/60 border border-green-200/50 rounded-xl">
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg mr-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-800">
                      All systems are running smoothly!
                    </p>
                    <p className="text-sm text-green-600">
                      No urgent actions required at this time
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Chat Dashboard */}
      <AdminChatDashboard 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </AdminLayout>
  )
}