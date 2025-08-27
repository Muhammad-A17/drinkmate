"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useAdminTranslation } from "@/lib/use-admin-translation"
import { useTranslation } from "@/lib/translation-context"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Activity
} from "lucide-react"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
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
  
  const { token } = useAuth()
  const router = useRouter()

  // Fetch dashboard stats
  useEffect(() => {
    fetchDashboardData()
  }, [token])

  const fetchDashboardData = async () => {
    try {
      setIsDataLoading(true)
      
      // TODO: Replace with real API calls when endpoints are ready
      // const [usersRes, ordersRes, productsRes, testimonialsRes, blogRes, contactsRes] = await Promise.all([
      //   fetch('/api/admin/users/count'),
      //   fetch('/api/admin/orders/count'),
      //   fetch('/api/admin/products/count'),
      //   fetch('/api/admin/testimonials/count'),
      //   fetch('/api/admin/blog/count'),
      //   fetch('/api/admin/contacts/count')
      // ])
      
      // Enhanced mock data with realistic values
      setStats({
        totalUsers: 1247,
        totalOrders: 15432,
        totalProducts: 156,
        totalRevenue: 287500,
        lowStockProducts: 18,
        pendingOrders: 47,
        totalTestimonials: 89,
        totalBlogPosts: 23,
        totalContacts: 156,
        monthlyGrowth: 12.5,
        orderGrowth: 8.3,
        userGrowth: 15.7
      })

      // Mock recent orders with realistic data
      setRecentOrders([
        {
          _id: "1",
          orderNumber: "ORD-2024-001",
          customerName: "Ahmed Al-Farsi",
          total: 299.99,
          status: "pending",
          createdAt: new Date().toISOString()
        },
        {
          _id: "2",
          orderNumber: "ORD-2024-002",
          customerName: "Sara Al-Qahtani",
          total: 199.99,
          status: "processing",
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: "3",
          orderNumber: "ORD-2024-003",
          customerName: "Mohammed Al-Otaibi",
          total: 399.99,
          status: "shipped",
          createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          _id: "4",
          orderNumber: "ORD-2024-004",
          customerName: "Fatima Al-Harbi",
          total: 149.99,
          status: "completed",
          createdAt: new Date(Date.now() - 10800000).toISOString()
        }
      ])

      // Mock recent products with realistic data
      setRecentProducts([
        {
          _id: "1",
          name: "Artic Black Soda Maker",
          price: 299.99,
          stock: 15,
          category: "sodamakers",
          isBestSeller: true
        },
        {
          _id: "2",
          name: "Cola Flavor Pack",
          price: 24.99,
          stock: 45,
          category: "flavors",
          isBestSeller: true
        },
        {
          _id: "3",
          name: "CO2 Cylinder",
          price: 19.99,
          stock: 8,
          category: "co2",
          isBestSeller: false
        },
        {
          _id: "4",
          name: "Premium Bottle Set",
          price: 49.99,
          stock: 22,
          category: "accessories",
          isBestSeller: false
        }
      ])
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
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.username || 'Admin'}! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your store today.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshDashboard}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{stats.userGrowth}%</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{stats.orderGrowth}%</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  <SaudiRiyal amount={stats.totalRevenue} size="xl" />
                </h3>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalProducts}</h3>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">Across all categories</span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock Alert</p>
                <h3 className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</h3>
                <p className="text-sm text-gray-500">Products need restocking</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <h3 className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</h3>
                <p className="text-sm text-gray-500">Awaiting processing</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Testimonials</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalTestimonials}</h3>
                <p className="text-sm text-gray-500">Customer reviews</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <Star className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Messages</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalContacts}</h3>
                <p className="text-sm text-gray-500">New inquiries</p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <MessageSquare className="h-8 w-8 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Sales Overview (Last 12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line 
                data={salesData} 
                options={lineChartOptions} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Product Categories Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar 
                data={productCategoryData} 
                options={barChartOptions} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2 text-purple-600" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="w-64">
                <Doughnut 
                  data={orderStatusData} 
                  options={doughnutChartOptions} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-orange-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: "Ahmed", action: "placed an order", time: "5 minutes ago", type: "order" },
                { user: "Sara", action: "registered a new account", time: "2 hours ago", type: "user" },
                { user: "Admin", action: "added 5 new products", time: "Yesterday", type: "product" },
                { user: "Mohammed", action: "left a product review", time: "Yesterday", type: "review" },
                { user: "Fatima", action: "placed an order", time: "2 days ago", type: "order" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center border-b pb-3 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
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
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-green-600" />
                Recent Orders
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
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
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-600" />
                Recent Products
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/products')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
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
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => router.push('/admin/products')}
            >
              <Plus className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Add Product</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-green-50 hover:border-green-200 transition-colors"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="h-6 w-6 text-green-600" />
              <span className="font-medium">Manage Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-purple-50 hover:border-purple-200 transition-colors"
              onClick={() => router.push('/admin/orders')}
            >
              <ShoppingBag className="h-6 w-6 text-purple-600" />
              <span className="font-medium">View Orders</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-orange-50 hover:border-orange-200 transition-colors"
              onClick={() => router.push('/admin/blog')}
            >
              <FileText className="h-6 w-6 text-orange-600" />
              <span className="font-medium">Create Post</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications & Alerts */}
      <Card className="shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            Important Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.lowStockProducts > 0 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
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
                  className="border-red-200 text-red-700 hover:bg-red-100"
                >
                  View Products
                </Button>
              </div>
            )}
            
            {stats.pendingOrders > 0 && (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
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
                  className="border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                >
                  View Orders
                </Button>
              </div>
            )}

            {stats.totalContacts > 0 && (
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
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
                  className="border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  View Messages
                </Button>
              </div>
            )}

            {stats.lowStockProducts === 0 && stats.pendingOrders === 0 && stats.totalContacts === 0 && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
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
        </CardContent>
      </Card>
    </AdminLayout>
  )
}