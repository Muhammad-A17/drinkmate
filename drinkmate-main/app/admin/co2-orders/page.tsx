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
  Users
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">CO2 Orders Management</h1>
            <p className="text-gray-600">Manage CO2 refill and exchange orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                              <div className="text-2xl font-bold">
                  <SaudiRiyal amount={stats.totalRevenue} size="xl" />
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
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
              
              <div>
                <Label htmlFor="orderType">Order Type</Label>
                <Select value={filterOrderType} onValueChange={setFilterOrderType}>
                  <SelectTrigger>
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
              
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                  <SelectTrigger>
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
              
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
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
              
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
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
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                                 onClick={() => {
                   setSearchTerm("")
                   setFilterStatus("all")
                   setFilterOrderType("all")
                   setFilterPaymentStatus("all")
                   setStartDate(undefined)
                   setEndDate(undefined)
                 }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cylinder</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.userId.name}</div>
                        <div className="text-sm text-gray-500">{order.userId.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getOrderTypeBadge(order.orderType)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.cylinderType.name}</div>
                        <div className="text-sm text-gray-500">{order.cylinderType.brand}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>
                                        <div className="font-medium">
                    <SaudiRiyal amount={order.total} size="sm" />
                  </div>
                  {order.discount > 0 && (
                    <div className="text-sm text-green-600">
                      -<SaudiRiyal amount={order.discount} size="sm" />
                    </div>
                  )}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowOrderDialog(true)
                          }}
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
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
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

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select 
                value={statusUpdateData.status} 
                onValueChange={(value) => setStatusUpdateData({ ...statusUpdateData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
            
            <div>
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={statusUpdateData.notes}
                onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
                placeholder="Add any notes about this status change..."
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowStatusDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedOrder) {
                    updateOrderStatus(selectedOrder._id, statusUpdateData.status, statusUpdateData.notes)
                  }
                }}
              >
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
