"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useAdminTranslation } from "@/lib/use-admin-translation"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  CreditCard,
  MapPin
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Define Order interface
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentMethod: string;
  deliveryOption: string;
  cardDetails?: {
    cardNumber: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { t } = useAdminTranslation()
  const { user } = useAuth()
  const router = useRouter()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [itemsPerPage] = useState(10)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

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
  }, [user, router, currentPage, statusFilter, paymentFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // For now, use mock data while backend is being set up
      const mockOrders: Order[] = [
        {
          _id: "1",
          orderNumber: "ORD-001",
          user: {
            _id: "user1",
            username: "ahmed_alfarsi",
            email: "ahmed@example.com"
          },
          items: [
            { name: "OmniFizz Soda Maker", quantity: 1, price: 399 },
            { name: "Strawberry Lemon Flavor", quantity: 2, price: 49 },
            { name: "CO2 Cylinder", quantity: 1, price: 89 }
          ],
          shippingAddress: {
            firstName: "Ahmed",
            lastName: "Al-Farsi",
            email: "ahmed@example.com",
            phone: "+966501234567",
            address1: "123 King Fahd Road",
            city: "Riyadh",
            state: "Riyadh",
            postalCode: "12345"
          },
          paymentMethod: "urways",
          deliveryOption: "standard",
          cardDetails: {
            cardNumber: "4111111111111111",
            cardholderName: "Ahmed Al-Farsi",
            expiryMonth: "12",
            expiryYear: "2025",
            cvv: "123"
          },
          subtotal: 586,
          shippingCost: 50,
          tax: 58.6,
          total: 694.6,
          status: "processing",
          paymentStatus: "paid",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z"
        },
        {
          _id: "2",
          orderNumber: "ORD-002",
          user: {
            _id: "user2",
            username: "sara_alqahtani",
            email: "sara@example.com"
          },
          items: [
            { name: "Drinkmate Luxe", quantity: 1, price: 599 }
          ],
          shippingAddress: {
            firstName: "Sara",
            lastName: "Al-Qahtani",
            email: "sara@example.com",
            phone: "+966507654321",
            address1: "456 Prince Sultan Street",
            city: "Jeddah",
            state: "Makkah",
            postalCode: "54321"
          },
          paymentMethod: "tap_payment",
          deliveryOption: "express",
          subtotal: 599,
          shippingCost: 75,
          tax: 59.9,
          total: 733.9,
          status: "shipped",
          paymentStatus: "paid",
          createdAt: "2024-01-14T15:45:00Z",
          updatedAt: "2024-01-15T09:20:00Z"
        },
        {
          _id: "3",
          orderNumber: "ORD-003",
          user: {
            _id: "user3",
            username: "mohammed_otaibi",
            email: "mohammed@example.com"
          },
          items: [
            { name: "Cola Flavor", quantity: 2, price: 39 },
            { name: "Black Bottle 500ml", quantity: 1, price: 79 }
          ],
          shippingAddress: {
            firstName: "Mohammed",
            lastName: "Al-Otaibi",
            email: "mohammed@example.com",
            phone: "+966509876543",
            address1: "789 Al Olaya Street",
            city: "Dammam",
            state: "Eastern Province",
            postalCode: "67890"
          },
          paymentMethod: "cash_on_delivery",
          deliveryOption: "economy",
          subtotal: 157,
          shippingCost: 25,
          tax: 15.7,
          total: 197.7,
          status: "pending",
          paymentStatus: "pending",
          createdAt: "2024-01-16T08:15:00Z",
          updatedAt: "2024-01-16T08:15:00Z"
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Filter mock data based on current filters
      let filteredMockOrders = mockOrders

      if (statusFilter && statusFilter !== 'all') {
        filteredMockOrders = filteredMockOrders.filter(order => order.status === statusFilter)
      }

      if (paymentFilter && paymentFilter !== 'all') {
        filteredMockOrders = filteredMockOrders.filter(order => order.paymentStatus === paymentFilter)
      }

      if (searchTerm) {
        filteredMockOrders = filteredMockOrders.filter(order => 
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shippingAddress.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shippingAddress.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Pagination
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedOrders = filteredMockOrders.slice(startIndex, endIndex)

      setOrders(paginatedOrders)
      setTotalOrders(filteredMockOrders.length)
      setTotalPages(Math.ceil(filteredMockOrders.length / itemsPerPage))

      // Uncomment this when backend is ready:
      /*
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })
      
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (paymentFilter && paymentFilter !== 'all') params.append('paymentStatus', paymentFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/checkout/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
        setTotalPages(data.totalPages)
        setTotalOrders(data.totalOrders)
      } else {
        toast.error(data.message || 'Failed to fetch orders')
      }
      */
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId)
      
      // For now, simulate status update with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        )
      )
      
      toast.success(`Order status updated to ${newStatus}`)

      // Uncomment this when backend is ready:
      /*
      const response = await fetch(`/api/checkout/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      const data = await response.json()
      
      if (data.success) {
        toast.success('Order status updated successfully')
        fetchOrders() // Refresh the orders list
      } else {
        toast.error(data.message || 'Failed to update order status')
      }
      */
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get payment method display name
  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'urways':
        return 'Urways'
      case 'tap_payment':
        return 'Tap Payment'
      case 'credit_card':
        return 'Credit Card'
      case 'debit_card':
        return 'Debit Card'
      case 'cash_on_delivery':
        return 'Cash on Delivery'
      default:
        return method
    }
  }

  // Get delivery option display name
  const getDeliveryOptionDisplay = (option: string) => {
    switch (option) {
      case 'standard':
        return 'Standard (Aramex)'
      case 'express':
        return 'Express (Aramex)'
      case 'economy':
        return 'Economy (Aramex)'
      default:
        return option
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#12d6fa]"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('orders.title')}</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all customer orders
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Export Orders
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'processing').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipped</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'shipped').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Search</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Payment Status</label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All payments</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={fetchOrders}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <SaudiRiyal amount={order.total} />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getPaymentStatusBadgeColor(order.paymentStatus)}>
                              {order.paymentStatus}
                            </Badge>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              {getPaymentMethodDisplay(order.paymentMethod)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getDeliveryOptionDisplay(order.deliveryOption)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* Quick Action Buttons */}
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order._id, 'processing')}
                                disabled={updatingOrderId === order._id}
                                className="h-6 px-2 text-xs"
                              >
                                {updatingOrderId === order._id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#12d6fa]"></div>
                                ) : (
                                  'Process'
                                )}
                              </Button>
                            )}
                            {order.status === 'processing' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order._id, 'shipped')}
                                disabled={updatingOrderId === order._id}
                                className="h-6 px-2 text-xs"
                              >
                                {updatingOrderId === order._id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#12d6fa]"></div>
                                ) : (
                                  'Ship'
                                )}
                              </Button>
                            )}
                            {order.status === 'shipped' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order._id, 'delivered')}
                                disabled={updatingOrderId === order._id}
                                className="h-6 px-2 text-xs"
                              >
                                {updatingOrderId === order._id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#12d6fa]"></div>
                                ) : (
                                  'Deliver'
                                )}
                              </Button>
                            )}
                            
                                                          {/* Dropdown Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0"
                                    disabled={updatingOrderId === order._id}
                                  >
                                  {updatingOrderId === order._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#12d6fa]"></div>
                                  ) : (
                                    <MoreHorizontal className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order._id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateOrderStatus(order._id, 'processing')}
                                  disabled={updatingOrderId === order._id || order.status === 'processing'}
                                  className={order.status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  Mark as Processing
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateOrderStatus(order._id, 'shipped')}
                                  disabled={updatingOrderId === order._id || order.status === 'shipped'}
                                  className={order.status === 'shipped' ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                  <Truck className="mr-2 h-4 w-4" />
                                  Mark as Shipped
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateOrderStatus(order._id, 'delivered')}
                                  disabled={updatingOrderId === order._id || order.status === 'delivered'}
                                  className={order.status === 'delivered' ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark as Delivered
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem 
                                      disabled={updatingOrderId === order._id || order.status === 'cancelled'}
                                      className={order.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Cancel Order
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to cancel order #{order.orderNumber}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>No, keep order</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Yes, cancel order
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
