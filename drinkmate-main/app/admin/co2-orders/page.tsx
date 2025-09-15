"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useAdminTranslation } from "@/lib/use-admin-translation"
import { co2OrdersAPI } from "@/lib/api"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  Truck,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Zap,
  Shield,
  Star,
  Activity,
  X,
  Upload,
  Save,
  RefreshCw,
  Plus,
  Trash2
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface CO2Order {
  _id: string
  orderNumber: string
  userId: {
    _id: string
    name: string
    email: string
    phone: string
  }
  orderType: string
  cylinderType: {
    _id: string
    name: string
    brand: string
    price: number
  }
  quantity: number
  unitPrice: number
  subtotal: number
  deliveryCharge: number
  discount: number
  total: number
  status: string
  paymentStatus: string
  preferredPickupDate?: string
  preferredDeliveryDate?: string
  actualPickupDate?: string
  actualDeliveryDate?: string
  createdAt: string
  cylinders: Array<{
    cylinderId: string
    status: string
    pickupDate?: string
    refillDate?: string
    deliveryDate?: string
    notes?: string
  }>
}

export default function CO2OrdersPage() {
  const { t } = useAdminTranslation()
  const { user } = useAuth()
  const router = useRouter()
  
  const [orders, setOrders] = useState<CO2Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterOrderType, setFilterOrderType] = useState("all")
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedOrder, setSelectedOrder] = useState<CO2Order | null>(null)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: "",
    notes: ""
  })

  useEffect(() => {
    // Wait for authentication to complete
    if (user === undefined) return
    
    // Check if user is authenticated and is admin
    if (!user || !user.isAdmin) {
      console.log('User not authenticated or not admin:', { user, isAdmin: user?.isAdmin })
      router.push('/login')
      return
    }
    
    // User is authenticated and is admin, fetch data
    fetchOrders()
  }, [user, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      // Use co2OrdersAPI instead of direct fetch
      const response = await co2OrdersAPI.getOrders();
      
      if (response.success) {
        setOrders(response.orders || [])
      } else {
        toast.error(response.message || 'Failed to fetch orders')
      }
    } catch (error) {
      toast.error('Error fetching orders')
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      // Use co2OrdersAPI instead of direct fetch
      const response = await co2OrdersAPI.updateOrderStatus(orderId, status);

      if (response.success) {
        toast.success('Order status updated successfully')
        setShowStatusDialog(false)
        setStatusUpdateData({ status: "", notes: "" })
        fetchOrders()
      } else {
        toast.error(response.message || 'Failed to update order status')
      }
    } catch (error) {
      toast.error('Error updating order status')
      console.error('Error updating order status:', error)
    }
  }

  const schedulePickup = async (orderId: string, pickupDate: Date) => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      // Use co2OrdersAPI instead of direct fetch
      const response = await co2OrdersAPI.updatePickupDetails(orderId, { 
        pickupDate: pickupDate.toISOString() 
      });

      if (response.success) {
        toast.success('Pickup scheduled successfully')
        fetchOrders()
      } else {
        toast.error(response.message || 'Failed to schedule pickup')
      }
    } catch (error) {
      toast.error('Error scheduling pickup')
      console.error('Error scheduling pickup:', error)
    }
  }

  const scheduleDelivery = async (orderId: string, deliveryDate: Date) => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      // Use co2OrdersAPI instead of direct fetch
      const response = await co2OrdersAPI.updateDeliveryDetails(orderId, { 
        deliveryDate: deliveryDate.toISOString() 
      });

      if (response.success) {
        toast.success('Delivery scheduled successfully')
        fetchOrders()
      } else {
        toast.error(response.message || 'Failed to schedule delivery')
      }
    } catch (error) {
      toast.error('Error scheduling delivery')
      console.error('Error scheduling delivery:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      pickup_scheduled: { color: "bg-purple-100 text-purple-800", label: "Pickup Scheduled" },
      picked_up: { color: "bg-indigo-100 text-indigo-800", label: "Picked Up" },
      refilling: { color: "bg-orange-100 text-orange-800", label: "Refilling" },
      ready_for_delivery: { color: "bg-green-100 text-green-800", label: "Ready for Delivery" },
      delivery_scheduled: { color: "bg-teal-100 text-teal-800", label: "Delivery Scheduled" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      refunded: { color: "bg-gray-100 text-gray-800", label: "Refunded" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
      refunded: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
      partially_refunded: { color: "bg-orange-100 text-orange-800", label: "Partial Refund" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getOrderTypeBadge = (type: string) => {
    const typeConfig = {
      refill: { color: "bg-blue-100 text-blue-800", label: "Refill" },
      exchange: { color: "bg-green-100 text-green-800", label: "Exchange" },
      new: { color: "bg-purple-100 text-purple-800", label: "New" },
      subscription: { color: "bg-orange-100 text-orange-800", label: "Subscription" }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.refill
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.userId.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || filterStatus === 'all' || order.status === filterStatus
    const matchesOrderType = !filterOrderType || filterOrderType === 'all' || order.orderType === filterOrderType
    const matchesPaymentStatus = !filterPaymentStatus || filterPaymentStatus === 'all' || order.paymentStatus === filterPaymentStatus
    
    let matchesDate = true
    if (startDate && endDate) {
      const orderDate = new Date(order.createdAt)
      matchesDate = orderDate >= startDate && orderDate <= endDate
    }
    
    return matchesSearch && matchesStatus && matchesOrderType && matchesPaymentStatus && matchesDate
  })

  const getStats = () => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length
    const completedOrders = orders.filter(o => o.status === 'delivered').length
    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
    
    return { totalOrders, pendingOrders, completedOrders, totalRevenue }
  }

  // Show loading while authentication is being determined
  if (user === undefined || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">
            {user === undefined ? 'Checking authentication...' : 'Loading orders...'}
          </div>
        </div>
      </AdminLayout>
    )
  }

  const stats = getStats()

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 space-y-8 p-6">
          {/* Premium Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      CO2 Orders Management
                    </h1>
                    <p className="text-gray-600 text-lg mt-2">Manage CO2 refill and exchange orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                    <Activity className="w-4 h-4 mr-1" />
                    {orders.length} Total Orders
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {stats.completedOrders} Completed
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={fetchOrders}
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">All orders</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Orders</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed Orders</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">
                    <SaudiRiyal amount={stats.totalRevenue} size="lg" />
                  </p>
                  <p className="text-xs text-gray-500 mt-1">From completed orders</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Premium Filters and Search */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Advanced Filters</h3>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing {filteredOrders.length} of {orders.length} orders
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterStatus("all")
                    setFilterOrderType("all")
                    setFilterPaymentStatus("all")
                    setStartDate(undefined)
                    setEndDate(undefined)
                  }}
                  className="border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pickup_scheduled">Pickup Scheduled</SelectItem>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="refilling">Refilling</SelectItem>
                    <SelectItem value="ready_for_delivery">Ready for Delivery</SelectItem>
                    <SelectItem value="delivery_scheduled">Delivery Scheduled</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="orderType" className="text-sm font-medium text-gray-700">Order Type</Label>
                <Select value={filterOrderType} onValueChange={setFilterOrderType}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="refill">Refill</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700">Payment Status</Label>
                <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All Payment Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Premium Orders Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Orders Management</h3>
                    <p className="text-sm text-gray-500">
                      {filteredOrders.length} of {orders.length} orders
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Order Details</TableHead>
                    <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Cylinder</TableHead>
                    <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                    <TableHead className="font-semibold text-gray-700">Total</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Payment</TableHead>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow 
                      key={order._id}
                      className="hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            <Truck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">ID: {order._id.slice(-8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{order.userId.name}</p>
                          <p className="text-xs text-gray-500">{order.userId.email}</p>
                          <p className="text-xs text-gray-500">{order.userId.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getOrderTypeBadge(order.orderType)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{order.cylinderType.name}</p>
                          <p className="text-xs text-gray-500">{order.cylinderType.brand}</p>
                          <p className="text-xs text-gray-500">
                            <SaudiRiyal amount={order.cylinderType.price} size="sm" /> each
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {order.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">
                            <SaudiRiyal amount={order.total} size="sm" />
                          </div>
                          {order.discount > 0 && (
                            <div className="text-xs text-green-600">
                              -<SaudiRiyal amount={order.discount} size="sm" /> discount
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            Subtotal: <SaudiRiyal amount={order.subtotal} size="sm" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="py-4">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-900">
                          {format(new Date(order.createdAt), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(order.createdAt), "HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowOrderDialog(true)
                            }}
                            title="View Order Details"
                            className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setStatusUpdateData({ status: order.status, notes: "" })
                              setShowStatusDialog(true)
                            }}
                            title="Update Order Status"
                            className="border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredOrders.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                <Button 
                  onClick={() => {
                    setSearchTerm("")
                    setFilterStatus("all")
                    setFilterOrderType("all")
                    setFilterPaymentStatus("all")
                    setStartDate(undefined)
                    setEndDate(undefined)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Premium Order Details Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Order Details - {selectedOrder?.orderNumber}
                  </DialogTitle>
                  <p className="text-gray-600 mt-1">Complete order information and tracking</p>
                </div>
              </div>
            </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Order Number:</span> {selectedOrder.orderNumber}</div>
                    <div><span className="font-medium">Order Type:</span> {getOrderTypeBadge(selectedOrder.orderType)}</div>
                    <div><span className="font-medium">Status:</span> {getStatusBadge(selectedOrder.status)}</div>
                    <div><span className="font-medium">Created:</span> {format(new Date(selectedOrder.createdAt), "PPP")}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedOrder.userId.name}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.userId.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedOrder.userId.phone}</div>
                  </div>
                </div>
              </div>
              
              {/* Cylinder Information */}
              <div>
                <h3 className="font-semibold mb-3">Cylinder Information</h3>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <div><span className="font-medium">Name:</span> {selectedOrder.cylinderType.name}</div>
                    <div><span className="font-medium">Brand:</span> {selectedOrder.cylinderType.brand}</div>
                    <div><span className="font-medium">Unit Price:</span> <SaudiRiyal amount={selectedOrder.cylinderType.price} size="sm" /></div>
                  </div>
                  <div>
                    <div><span className="font-medium">Quantity:</span> {selectedOrder.quantity}</div>
                    <div><span className="font-medium">Subtotal:</span> <SaudiRiyal amount={selectedOrder.subtotal} size="sm" /></div>
                    <div><span className="font-medium">Delivery:</span> <SaudiRiyal amount={selectedOrder.deliveryCharge} size="sm" /></div>
                  </div>
                </div>
              </div>
              
              {/* Pricing */}
              <div>
                <h3 className="font-semibold mb-3">Pricing</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Subtotal:</span>
                    <span><SaudiRiyal amount={selectedOrder.subtotal} size="sm" /></span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Delivery Charge:</span>
                    <span><SaudiRiyal amount={selectedOrder.deliveryCharge} size="sm" /></span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between items-center mb-2 text-green-600">
                      <span>Discount:</span>
                      <span>-<SaudiRiyal amount={selectedOrder.discount} size="sm" /></span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between items-center font-semibold">
                    <span>Total:</span>
                    <span><SaudiRiyal amount={selectedOrder.total} size="sm" /></span>
                  </div>
                </div>
              </div>
              
              {/* Cylinder Status Tracking */}
              <div>
                <h3 className="font-semibold mb-3">Cylinder Status Tracking</h3>
                <div className="space-y-3">
                  {selectedOrder.cylinders.map((cylinder, index) => (
                    <div key={cylinder.cylinderId} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Cylinder {index + 1}</span>
                        <Badge>{cylinder.status}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Pickup:</span>
                          <div>{cylinder.pickupDate ? format(new Date(cylinder.pickupDate), "MMM dd, yyyy") : "Not scheduled"}</div>
                        </div>
                        <div>
                          <span className="font-medium">Refill:</span>
                          <div>{cylinder.refillDate ? format(new Date(cylinder.refillDate), "MMM dd, yyyy") : "Not completed"}</div>
                        </div>
                        <div>
                          <span className="font-medium">Delivery:</span>
                          <div>{cylinder.deliveryDate ? format(new Date(cylinder.deliveryDate), "MMM dd, yyyy") : "Not delivered"}</div>
                        </div>
                      </div>
                      {cylinder.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {cylinder.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowOrderDialog(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowOrderDialog(false)
                    setStatusUpdateData({ status: selectedOrder.status, notes: "" })
                    setShowStatusDialog(true)
                  }}
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

        {/* Premium Status Update Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Update Order Status
                  </DialogTitle>
                  <p className="text-gray-600 mt-1">Change order status and add admin notes</p>
                </div>
              </div>
            </DialogHeader>
          
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">New Status *</Label>
                <Select 
                  value={statusUpdateData.status} 
                  onValueChange={(value) => setStatusUpdateData({ ...statusUpdateData, status: value })}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pickup_scheduled">Pickup Scheduled</SelectItem>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="refilling">Refilling</SelectItem>
                    <SelectItem value="ready_for_delivery">Ready for Delivery</SelectItem>
                    <SelectItem value="delivery_scheduled">Delivery Scheduled</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Admin Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={statusUpdateData.notes}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
                  placeholder="Add any notes about this status change..."
                  className="border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowStatusDialog(false)}
                  className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedOrder) {
                      updateOrderStatus(selectedOrder._id, statusUpdateData.status, statusUpdateData.notes)
                    }
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
