"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useAdminTranslation } from "@/lib/use-admin-translation"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Truck,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Edit,
  Save,
  X
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

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
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
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
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

export default function OrderDetailsPage() {
  const { t } = useAdminTranslation()
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<{
    shippingAddress?: Partial<Order['shippingAddress']>;
    status?: string;
    paymentStatus?: string;
    trackingNumber?: string;
    estimatedDeliveryDate?: string;
  }>({})

  useEffect(() => {
    // Wait for authentication to complete
    if (user === undefined) return
    
    // Check if user is authenticated and is admin
    if (!user || !user.isAdmin) {
      console.log('User not authenticated or not admin:', { user, isAdmin: user?.isAdmin })
      router.push('/login')
      return
    }
    
    // User is authenticated and is admin, fetch order data
    fetchOrderDetails()
  }, [user, router, orderId])

  const fetchOrderDetails = async () => {
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
            address2: "Apartment 5B",
            city: "Riyadh",
            state: "Riyadh",
            postalCode: "12345",
            country: "Saudi Arabia"
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
          updatedAt: "2024-01-15T10:30:00Z",
          trackingNumber: "TRK123456789",
          estimatedDeliveryDate: "2024-01-20T10:30:00Z"
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
            postalCode: "54321",
            country: "Saudi Arabia"
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
          updatedAt: "2024-01-15T09:20:00Z",
          trackingNumber: "TRK987654321",
          estimatedDeliveryDate: "2024-01-16T15:45:00Z"
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
            postalCode: "67890",
            country: "Saudi Arabia"
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

      // Find the order by ID
      const foundOrder = mockOrders.find(o => o._id === orderId)
      
      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        toast.error('Order not found')
        router.push('/admin/orders')
      }

      // Uncomment this when backend is ready:
      /*
      const response = await fetch(`/api/checkout/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch order details')
      }

      const data = await response.json()
      
      if (data.success) {
        setOrder(data.order)
      } else {
        toast.error(data.message || 'Failed to fetch order details')
        router.push('/admin/orders')
      }
      */
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Failed to fetch order details')
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    try {
      setUpdating(true)
      
      // For now, simulate status update with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (order) {
        setOrder({
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString()
        })
        toast.success('Order status updated successfully')
      }

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
        fetchOrderDetails() // Refresh the order data
      } else {
        toast.error(data.message || 'Failed to update order status')
      }
      */
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  // Start editing order
  const startEditing = () => {
    if (order) {
      setEditData({
        shippingAddress: { ...order.shippingAddress },
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        estimatedDeliveryDate: order.estimatedDeliveryDate
      })
      setEditing(true)
    }
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditData({})
    setEditing(false)
  }

  // Save edited order
  const saveOrder = async () => {
    try {
      setUpdating(true)
      
      // For now, simulate save with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (order) {
        const updatedOrder = {
          ...order,
          ...editData,
          shippingAddress: {
            ...order.shippingAddress,
            ...editData.shippingAddress
          },
          updatedAt: new Date().toISOString()
        }
        setOrder(updatedOrder)
        setEditing(false)
        setEditData({})
        toast.success('Order updated successfully')
      }

      // Uncomment this when backend is ready:
      /*
      const response = await fetch(`/api/checkout/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editData)
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      const data = await response.json()
      
      if (data.success) {
        toast.success('Order updated successfully')
        fetchOrderDetails() // Refresh the order data
        setEditing(false)
        setEditData({})
      } else {
        toast.error(data.message || 'Failed to update order')
      }
      */
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

  // Handle edit data changes
  const handleEditChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle shipping address changes
  const handleAddressChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value
      }
    }))
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

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Order not found</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/orders')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getStatusBadgeColor(order.status)}>
              {order.status}
            </Badge>
            <Badge className={getPaymentStatusBadgeColor(order.paymentStatus)}>
              {order.paymentStatus}
            </Badge>
            
            {!editing ? (
              <Button
                onClick={startEditing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Order
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={saveOrder}
                  disabled={updating}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </Button>
                <Button
                  onClick={cancelEditing}
                  disabled={updating}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">First Name</label>
                    {editing ? (
                      <Input
                        value={editData.shippingAddress?.firstName || order.shippingAddress.firstName}
                        onChange={(e) => handleAddressChange('firstName', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm">{order.shippingAddress.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                    {editing ? (
                      <Input
                        value={editData.shippingAddress?.lastName || order.shippingAddress.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm">{order.shippingAddress.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    {editing ? (
                      <Input
                        value={editData.shippingAddress?.email || order.shippingAddress.email}
                        onChange={(e) => handleAddressChange('email', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {order.shippingAddress.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    {editing ? (
                      <Input
                        value={editData.shippingAddress?.phone || order.shippingAddress.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Username</label>
                    <p className="text-sm">{order.user.username}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 1</label>
                    {editing ? (
                      <Input
                        value={editData.shippingAddress?.address1 || order.shippingAddress.address1}
                        onChange={(e) => handleAddressChange('address1', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm">{order.shippingAddress.address1}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 2 (Optional)</label>
                    {editing ? (
                      <Input
                        value={editData.shippingAddress?.address2 || order.shippingAddress.address2 || ''}
                        onChange={(e) => handleAddressChange('address2', e.target.value)}
                        className="mt-1"
                        placeholder="Apartment, suite, etc."
                      />
                    ) : (
                      order.shippingAddress.address2 && <p className="text-sm">{order.shippingAddress.address2}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">City</label>
                      {editing ? (
                        <Input
                          value={editData.shippingAddress?.city || order.shippingAddress.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm">{order.shippingAddress.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">State/Province</label>
                      {editing ? (
                        <Input
                          value={editData.shippingAddress?.state || order.shippingAddress.state}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm">{order.shippingAddress.state}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Postal Code</label>
                      {editing ? (
                        <Input
                          value={editData.shippingAddress?.postalCode || order.shippingAddress.postalCode}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm">{order.shippingAddress.postalCode}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Country</label>
                    {editing ? (
                      <Input
                        value={editData.shippingAddress?.country || order.shippingAddress.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm">{order.shippingAddress.country}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          <SaudiRiyal amount={item.price * item.quantity} />
                        </p>
                        <p className="text-sm text-gray-500">
                          <SaudiRiyal amount={item.price} /> each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="text-sm"><SaudiRiyal amount={order.subtotal} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Shipping:</span>
                    <span className="text-sm"><SaudiRiyal amount={order.shippingCost} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tax:</span>
                    <span className="text-sm"><SaudiRiyal amount={order.tax} /></span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span><SaudiRiyal amount={order.total} /></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="text-sm">{getPaymentMethodDisplay(order.paymentMethod)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  {editing ? (
                    <Select
                      value={editData.paymentStatus || order.paymentStatus}
                      onValueChange={(value) => handleEditChange('paymentStatus', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getPaymentStatusBadgeColor(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                  )}
                </div>
                {order.cardDetails && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Card Details</label>
                    <div className="text-sm space-y-1">
                      <p>Cardholder: {order.cardDetails.cardholderName}</p>
                      <p>Card: **** **** **** {order.cardDetails.cardNumber.slice(-4)}</p>
                      <p>Expires: {order.cardDetails.expiryMonth}/{order.cardDetails.expiryYear}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Option</label>
                  <p className="text-sm">{getDeliveryOptionDisplay(order.deliveryOption)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tracking Number</label>
                  {editing ? (
                    <Input
                      value={editData.trackingNumber || order.trackingNumber || ''}
                      onChange={(e) => handleEditChange('trackingNumber', e.target.value)}
                      className="mt-1"
                      placeholder="Enter tracking number"
                    />
                  ) : (
                    order.trackingNumber && <p className="text-sm">{order.trackingNumber}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estimated Delivery Date</label>
                  {editing ? (
                    <Input
                      type="date"
                      value={editData.estimatedDeliveryDate ? 
                        new Date(editData.estimatedDeliveryDate).toISOString().split('T')[0] : 
                        order.estimatedDeliveryDate ? 
                          new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : ''
                      }
                      onChange={(e) => handleEditChange('estimatedDeliveryDate', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    order.estimatedDeliveryDate && (
                      <p className="text-sm">
                        {format(new Date(order.estimatedDeliveryDate), 'MMMM dd, yyyy')}
                      </p>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => updateOrderStatus('processing')}
                  disabled={updating || order.status === 'processing'}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mark as Processing
                </Button>
                <Button
                  onClick={() => updateOrderStatus('shipped')}
                  disabled={updating || order.status === 'shipped'}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Mark as Shipped
                </Button>
                <Button
                  onClick={() => updateOrderStatus('delivered')}
                  disabled={updating || order.status === 'delivered'}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Delivered
                </Button>
                <Button
                  onClick={() => updateOrderStatus('cancelled')}
                  disabled={updating || order.status === 'cancelled'}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
