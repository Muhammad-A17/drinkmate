"use client"

import { useState, useEffect, useMemo, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { adminAPI, apiCache } from "@/lib/api"
import AdminLayout from "@/components/layout/AdminLayout"
import AdminActionBar, { AdminActions } from "@/components/admin/AdminActionBar"
import AdminTable, { CellRenderers, type TableColumn, type ContextTableAction } from "@/components/admin/AdminTable"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { AdminErrorBoundary } from "@/lib/admin-error-handler"
import { useAdminErrorHandler, useAsyncOperation } from "@/hooks/use-admin-error-handler"
import { 
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Trash2,
  Filter,
  Download,
  MapPin,
  CreditCard,
  Truck,
  Mail,
  Eye,
  Edit,
  XCircle,
  Ship,
  RefreshCw,
  ArrowLeftRight,
  Split,
  RotateCw,
  RotateCcw,
  Plus,
  Loader2
} from "lucide-react"

type OrderStatus = "pending" | "processing" | "confirmed" | "shipped" | "delivered" | "cancelled"
type PaymentStatus = "unpaid" | "paid" | "partial" | "refunded"
type ShippingStatus = "pending" | "processing" | "shipped" | "delivered"

interface NewOrderForm {
  customerName: string
  customerEmail: string
  customerPhone: string
  totalAmount: string
  paymentMethod: string
  shippingMethod: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingStatus: ShippingStatus
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  notes: string
}

interface Order {
  _id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  orderDate: string
  items: Array<{
    _id?: string
    id?: string
    name: string
    quantity: number
    price: number
    image?: string
    sku?: string
  }>
  totalAmount: number
  total?: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  shippingMethod: string
  shippingStatus: ShippingStatus
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    phone?: string
    nationalAddress?: string
    specialInstructions?: string
  }
  trackingNumber?: string
  notes?: string
  createdAt?: string
  paymentDetails?: {
    paymentStatus: string
  }
}

interface OrderFilters {
  status: string
  paymentStatus: string
  shippingStatus: string
  paymentMethod: string
  dateFrom: string
  dateTo: string
}

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  // Error handling
  const errorHandler = useAdminErrorHandler({
    context: 'OrdersPage',
    defaultOptions: { category: 'server' }
  })
  
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [processingOrders, setProcessingOrders] = useState(false)
  const [cancellingOrders, setCancellingOrders] = useState(false)

  const [filters, setFilters] = useState<OrderFilters>({
    status: "all",
    paymentStatus: "all",
    shippingStatus: "all",
    paymentMethod: "all",
    dateFrom: "",
    dateTo: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  // Stats
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    revenue: 0,
    avgOrderValue: 0,
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Authentication check
  useEffect(() => {
    // Wait for authentication to complete
    if (isLoading) return
    
    // Check if user is authenticated and is admin
    if (!isAuthenticated || !user || !user.isAdmin) {
      console.log('User not authenticated or not admin:', { user, isAuthenticated, isAdmin: user?.isAdmin })
      router.push('/admin/login')
      return
    }
    
    // Fetch orders when authenticated
    fetchOrders()
  }, [user, isAuthenticated, isLoading, router])

  // Auto-refresh orders every 30 seconds to keep data in sync
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) return
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing orders...')
      fetchOrders()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [isAuthenticated, user?.isAdmin])
  
  // Memoized pagination calculations for performance
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredOrders.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex)
    return { totalPages, startIndex, endIndex, paginatedOrders }
  }, [filteredOrders, currentPage, pageSize])
  
  const { totalPages, paginatedOrders } = paginationData

  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [showEditOrder, setShowEditOrder] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [orderForm, setOrderForm] = useState<NewOrderForm>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    totalAmount: "",
    paymentMethod: "Credit Card",
    shippingMethod: "Standard (Aramex)",
    status: "pending",
    paymentStatus: "unpaid",
    shippingStatus: "pending",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Saudi Arabia",
    notes: "",
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    let filtered = orders

    // Text search
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filters
    if (filters.status !== "all") {
      filtered = filtered.filter((order) => order.status === filters.status)
    }
    if (filters.paymentStatus !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === filters.paymentStatus)
    }
    if (filters.shippingStatus !== "all") {
      filtered = filtered.filter((order) => order.shippingStatus === filters.shippingStatus)
    }
    if (filters.paymentMethod !== "all") {
      filtered = filtered.filter((order) => order.paymentMethod === filters.paymentMethod)
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter((order) => new Date(order.orderDate) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter((order) => new Date(order.orderDate) <= new Date(filters.dateTo))
    }

    setFilteredOrders(filtered)
    setCurrentPage(1)
  }, [orders, searchTerm, filters])

  const fetchOrders = async () => {
    try {
      setLoading(true);
      toast.info("Loading orders...");
      
      // Invalidate cache for fresh data
      if (typeof window !== 'undefined') {
        // Clear any cached order data
        const cacheKeys = Array.from(apiCache.keys()).filter(key => key.includes('orders'));
        cacheKeys.forEach(key => apiCache.delete(key));
      }
      
      // Use standardized adminAPI
      const response = await adminAPI.getOrders();
      
      if (response.success && response.orders) {
        // Transform backend data to match frontend interface
        const transformedOrders = response.orders.map((order: any) => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customerFullName || order.guestInfo?.name || 'Guest Customer',
          customerEmail: order.guestInfo?.email || order.shippingAddress?.email || 'No email',
          customerPhone: order.shippingAddress?.phone || order.guestInfo?.phone || '',
          orderDate: order.createdAt || order.orderDate,
          items: order.items || [],
          totalAmount: order.total || order.totalAmount || 0,
          total: order.total || order.totalAmount || 0,
          status: order.status || 'pending',
          paymentStatus: order.paymentDetails?.paymentStatus || order.paymentStatus || 'unpaid',
          paymentMethod: order.paymentMethod || 'unknown',
          shippingMethod: order.shippingMethod || 'standard',
          shippingStatus: order.shippingStatus || 'pending',
          shippingAddress: order.shippingAddress || {},
          trackingNumber: order.trackingNumber || '',
          notes: order.notes || '',
          createdAt: order.createdAt || new Date().toISOString(),
          paymentDetails: order.paymentDetails || { paymentStatus: 'unpaid' },
          // Additional fields for compatibility
          customerFullName: order.customerFullName || order.guestInfo?.name || 'Guest Customer',
          totalItems: order.totalItems || (order.items ? order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) : 0),
          ageInDays: order.ageInDays || 0,
          isGuestOrder: order.isGuestOrder || false,
          guestInfo: order.guestInfo || null
        }));
        
        setOrders(transformedOrders);
        // Update stats
        setOrderStats({
          total: transformedOrders.length,
          pending: transformedOrders.filter((o: Order) => o.status === 'pending').length,
          processing: transformedOrders.filter((o: Order) => o.status === 'processing').length,
          delivered: transformedOrders.filter((o: Order) => o.status === 'delivered').length,
          revenue: transformedOrders.reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0),
          avgOrderValue: transformedOrders.length ? 
            transformedOrders.reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0) / transformedOrders.length : 0
        });
        setLoading(false);
        toast.success(`Loaded ${transformedOrders.length} orders successfully`);
        return;
      } else {
        console.error("Failed to fetch orders:", response.message);
        toast.error(response.message || "Failed to load orders from API");
        setOrders([]);
        setOrderStats({
          total: 0,
          pending: 0,
          processing: 0,
          delivered: 0,
          revenue: 0,
          avgOrderValue: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
      console.log("Order data load complete")
    }
  }

  const handleCreateOrder = () => {
    setOrderForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      totalAmount: "",
      paymentMethod: "Credit Card",
      shippingMethod: "Standard (Aramex)",
      status: "pending",
      paymentStatus: "unpaid",
      shippingStatus: "pending",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Saudi Arabia",
      notes: "",
    })
    setShowCreateOrder(true)
  }

  const handleSubmitCreateOrder = async () => {
    try {
      if (!orderForm.customerName || !orderForm.customerEmail || !orderForm.totalAmount) {
        toast.error("Please fill in all required fields")
        return
      }

      const newOrder: Order = {
        _id: Date.now().toString(),
        orderNumber: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
        customerName: orderForm.customerName,
        customerEmail: orderForm.customerEmail,
        customerPhone: orderForm.customerPhone,
        orderDate: new Date().toISOString().split("T")[0],
        items: [{
          name: "Sample Item",
          quantity: 1,
          price: Number.parseFloat(orderForm.totalAmount)
        }],
        totalAmount: Number.parseFloat(orderForm.totalAmount),
        status: orderForm.status,
        paymentStatus: orderForm.paymentStatus,
        paymentMethod: orderForm.paymentMethod,
        shippingMethod: orderForm.shippingMethod,
        shippingStatus: orderForm.shippingStatus,
        shippingAddress: {
          street: orderForm.street,
          city: orderForm.city,
          state: orderForm.state,
          zipCode: orderForm.zipCode,
          country: orderForm.country,
        },
        notes: orderForm.notes,
      }

      setOrders((prev) => [newOrder, ...prev])
      setShowCreateOrder(false)
      toast.success(`Order ${newOrder.orderNumber} created successfully`)
    } catch (error) {
      toast.error("Failed to create order")
    }
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    
    // Extract customer info from order properties
    const customerName = order.customerName || 'N/A'
    const customerEmail = order.customerEmail || 'N/A'
    const customerPhone = order.customerPhone || order.shippingAddress?.phone || 'N/A'
    
    // Extract total amount with fallback
    const totalAmount = order.totalAmount || order.total || 0
    
    // Extract payment status
    const paymentStatus = order.paymentStatus || 'pending'
    
    setOrderForm({
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      totalAmount: totalAmount.toString(),
      paymentMethod: order.paymentMethod || 'urways',
      shippingMethod: order.shippingMethod || 'standard',
      status: order.status || 'pending',
      paymentStatus: paymentStatus,
      shippingStatus: order.shippingStatus || "pending",
      street: order.shippingAddress?.street || order.shippingAddress?.nationalAddress || "",
      city: order.shippingAddress?.city || "",
      state: order.shippingAddress?.state || "",
      zipCode: order.shippingAddress?.zipCode || "",
      country: order.shippingAddress?.country || "Saudi Arabia",
      notes: order.shippingAddress?.specialInstructions || "",
    })
    setShowEditOrder(true)
  }

  const handleSubmitEditOrder = async () => {
    try {
      if (!editingOrder) return

      const updatedOrder: Order = {
        ...editingOrder,
        customerName: orderForm.customerName,
        customerEmail: orderForm.customerEmail,
        customerPhone: orderForm.customerPhone,
        totalAmount: Number.parseFloat(orderForm.totalAmount),
        status: orderForm.status,
        paymentStatus: orderForm.paymentStatus,
        paymentMethod: orderForm.paymentMethod,
        shippingMethod: orderForm.shippingMethod,
        shippingStatus: orderForm.shippingStatus,
        shippingAddress: {
          street: orderForm.street,
          city: orderForm.city,
          state: orderForm.state,
          zipCode: orderForm.zipCode,
          country: orderForm.country,
        },
        notes: orderForm.notes,
      }

      setOrders((prev) => prev.map((o) => (o._id === editingOrder._id ? updatedOrder : o)))
      setShowEditOrder(false)
      setEditingOrder(null)
      toast.success(`Order ${updatedOrder.orderNumber} updated successfully`)
    } catch (error) {
      toast.error("Failed to update order")
    }
  }

  const handleDeleteOrder = async (order: Order) => {
    if (!confirm(`Are you sure you want to delete order ${order.orderNumber}? This action cannot be undone.`)) return

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://drinkmate-production.up.railway.app'
      const response = await fetch(`${API_URL}/api/orders/${order._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== order._id))
        toast.success(`Order ${order.orderNumber} deleted successfully`)
      } else {
        throw new Error('Failed to delete order')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error("Failed to delete order")
    }
  }

  const handleUpdateStatus = async (order: Order, newStatus: Order["status"]) => {
    try {
      const updatedOrder = { ...order, status: newStatus }

      // Auto-update shipping status based on order status
      if (newStatus === "processing") {
        updatedOrder.shippingStatus = "processing"
      } else if (newStatus === "shipped") {
        updatedOrder.shippingStatus = "shipped"
        if (!updatedOrder.trackingNumber) {
          updatedOrder.trackingNumber = `ARX${Math.random().toString().substr(2, 9)}`
        }
      } else if (newStatus === "delivered") {
        updatedOrder.shippingStatus = "delivered"
      }

      setOrders((prev) => prev.map((o) => (o._id === order._id ? updatedOrder : o)))
      toast.success(`Order ${order.orderNumber} status updated to ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update order status")
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleProcessOrder = async (order: Order) => {
    try {
      // Set loading state for this specific order action
      setActionLoading(prev => ({...prev, [`process-${order._id}`]: true}));
      
      const { orderAPI } = await import('@/lib/api');
      const response = await orderAPI.updateOrderStatus(order._id, { 
        status: 'processing', 
        shippingStatus: 'processing' 
      });
      
      if (response.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === order._id ? { ...o, status: "processing" as const, shippingStatus: "processing" as const } : o,
          ),
        )
        toast.success(`Order ${order.orderNumber} is being processed`)
      } else {
        toast.error(response.message || 'Failed to process order')
      }
    } catch (error) {
      console.error('Error processing order:', error)
      toast.error("Failed to process order")
    } finally {
      // Clear loading state
      setActionLoading(prev => ({...prev, [`process-${order._id}`]: false}));
    }
  }

  const handleShipOrder = async (order: Order) => {
    try {
      // Set loading state for this specific order action
      setActionLoading(prev => ({...prev, [`ship-${order._id}`]: true}));
      
      const trackingNumber = `ARX${Math.random().toString().substr(2, 9)}`
      const { orderAPI } = await import('@/lib/api');
      const response = await orderAPI.updateOrderStatus(order._id, { 
        status: 'shipped', 
        shippingStatus: 'shipped', 
        trackingNumber 
      });
      
      if (response.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === order._id
              ? {
                  ...o,
                  status: "shipped" as const,
                  shippingStatus: "shipped" as const,
                  trackingNumber,
                }
              : o,
          ),
        )
        toast.success(`Order ${order.orderNumber} has been shipped. Tracking: ${trackingNumber}`)
      } else {
        toast.error(response.message || 'Failed to ship order')
      }
    } catch (error) {
      console.error('Error shipping order:', error)
      toast.error("Failed to ship order")
    } finally {
      // Clear loading state
      setActionLoading(prev => ({...prev, [`ship-${order._id}`]: false}));
    }
  }

  const handleDeliverOrder = async (order: Order) => {
    try {
      const { orderAPI } = await import('@/lib/api');
      const response = await orderAPI.updateOrderStatus(order._id, { 
        status: 'delivered', 
        shippingStatus: 'delivered' 
      });
      
      if (response.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === order._id ? { ...o, status: "delivered" as const, shippingStatus: "delivered" as const } : o,
          ),
        )
        toast.success(`Order ${order.orderNumber} has been delivered`)
      } else {
        throw new Error('Failed to mark as delivered')
      }
    } catch (error) {
      console.error('Error delivering order:', error)
      toast.error("Failed to mark as delivered")
    }
  }

  const handleCancelOrder = async (order: Order) => {
    if (!confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) return

    try {
      const { orderAPI } = await import('@/lib/api');
      const response = await orderAPI.updateOrderStatus(order._id, { 
        status: 'cancelled'
      });
      
      if (response.success) {
        setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status: "cancelled" as const } : o)))
        toast.success(`Order ${order.orderNumber} has been cancelled`)
      } else {
        throw new Error('Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error("Failed to cancel order")
    }
  }

  const handleRefundOrder = async (order: Order) => {
    if (!confirm(`Are you sure you want to refund order ${order.orderNumber}?`)) return

    try {
      const { orderAPI } = await import('@/lib/api');
      const response = await orderAPI.updateOrderStatus(order._id, { 
        status: 'cancelled',
        paymentStatus: 'refunded'
      });
      
      if (response.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === order._id ? { ...o, paymentStatus: "refunded" as const, status: "cancelled" as const } : o,
          ),
        )
        toast.success(`Order ${order.orderNumber} has been refunded`)
      } else {
        throw new Error('Failed to refund order')
      }
    } catch (error) {
      console.error('Error refunding order:', error)
      toast.error("Failed to refund order")
    }
  }

  const handleBulkCancel = async () => {
    if (!confirm(`Cancel ${selectedRows.length} orders?`)) return
    
    try {
      setCancellingOrders(true)
      const { orderAPI } = await import('@/lib/api');
      const promises = selectedRows.map(id => 
        orderAPI.updateOrderStatus(id, { status: 'cancelled' })
      );
      
      await Promise.all(promises);
      
      setOrders((prev) => prev.map((o) => (selectedRows.includes(o._id) ? { ...o, status: "cancelled" as const } : o)))
      toast.success(`${selectedRows.length} orders cancelled`)
      setSelectedItems([])
      setSelectedRows([])
    } catch (error) {
      console.error('Error cancelling orders in bulk:', error)
      toast.error("Failed to cancel orders")
    } finally {
      setCancellingOrders(false)
    }
  }

  const handleBulkProcess = async () => {
    try {
      setProcessingOrders(true)
      const { orderAPI } = await import('@/lib/api');
      const promises = selectedRows.map(id => 
        orderAPI.updateOrderStatus(id, { status: 'processing' })
      );
      
      await Promise.all(promises);
      
      setOrders((prev) =>
        prev.map((o) =>
          selectedRows.includes(o._id) ? { ...o, status: "processing" as const, shippingStatus: "processing" as const } : o,
        ),
      )
      toast.success(`${selectedRows.length} orders are being processed`)
      setSelectedItems([])
      setSelectedRows([])
    } catch (error) {
      console.error('Error processing orders in bulk:', error)
      toast.error("Failed to process orders")
    } finally {
      setProcessingOrders(false)
    }
  }

  const handleExportOrders = () => {
    try {
      const csvContent = [
        [
          "Order Number",
          "Customer",
          "Email",
          "Date",
          "Items",
          "Total",
          "Status",
          "Payment Status",
          "Shipping Method",
        ].join(","),
        ...filteredOrders.map((order) =>
          [
            order.orderNumber,
            order.customerName,
            order.customerEmail,
            order.orderDate,
            order.items,
            order.totalAmount,
            order.status,
            order.paymentStatus,
            order.shippingMethod,
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success("Orders exported successfully")
    } catch (error) {
      toast.error("Failed to export orders")
    }
  }

  const resetFilters = () => {
    setFilters({
      status: "all",
      paymentStatus: "all",
      shippingStatus: "all",
      paymentMethod: "all",
      dateFrom: "",
      dateTo: "",
    })
    setSearchTerm("")
    toast.info("Filters reset")
  }

  // Table columns
  const columns: TableColumn<Order>[] = [
    {
      key: "orderNumber",
      label: "Order",
      sortable: true,
      render: (value, row) => (
          <div>
          <div
            className="font-medium text-blue-600 cursor-pointer hover:underline"
            onClick={() => handleViewOrder(row)}
          >
            {value}
          </div>
          {row.trackingNumber && <div className="text-xs text-muted-foreground">Track: {row.trackingNumber}</div>}
          </div>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      render: (value, row) => {
        // Handle both user orders and guest orders
        const customerName = row.customerName || 'N/A'
        const customerEmail = row.customerEmail || 'N/A'
        const customerPhone = row.shippingAddress?.phone || 'N/A'
        
        return (
          <div>
            <div className="font-medium">{customerName}</div>
            <div className="text-xs text-muted-foreground">{customerEmail}</div>
            {customerPhone !== 'N/A' && <div className="text-xs text-muted-foreground">{customerPhone}</div>}
          </div>
        )
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: CellRenderers.date,
      width: "120px",
    },
    {
      key: "items",
      label: "Items",
      render: (value, row) => {
        const itemCount = Array.isArray(value) ? value.length : 0
        return `${itemCount} item${itemCount !== 1 ? "s" : ""}`
      },
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (value, row) => {
        // Use totalAmount from the order, fallback to calculated total
        const total = row.totalAmount || row.total || 0
        return CellRenderers.currency(total, "SAR")
      },
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (value, row) => {
        const paymentStatus = value || 'pending'
        const paymentMethod = row.paymentMethod || 'N/A'
        
        return (
          <div>
            <Badge 
              variant={paymentStatus === "paid" ? "default" : paymentStatus === "refunded" ? "secondary" : "destructive"}
              className={paymentStatus === "pending" || paymentStatus === "failed" ? "bg-red-600 text-white border-red-600" : ""}
            >
              {paymentStatus}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">{paymentMethod}</div>
          </div>
        )
      },
    },
    {
      key: "shippingMethod",
      label: "Shipping",
      render: (value, row) => {
        const shippingStatus = row.shippingStatus || 'pending'
        const shippingMethod = value || 'N/A'
        
        return (
          <div>
            <div className="text-sm">{shippingMethod}</div>
            <Badge variant={shippingStatus === "delivered" ? "default" : shippingStatus === "shipped" ? "secondary" : "outline"} className="text-xs mt-1">
              {shippingStatus}
            </Badge>
          </div>
        )
      },
    },
    {
      key: "status",
      label: "Status",
      render: CellRenderers.status,
    },
  ]

  // Define type-safe context actions
  const contextActions: ContextTableAction<Order>[] = [
    {
      id: "view",
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewOrder,
      condition: () => true,
      priority: 1
    },
    {
      id: "edit",
      label: "Edit Order",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditOrder,
      condition: () => true,
      priority: 2
    },
    {
      id: "process",
      label: "Process Order",
      icon: <Clock className="h-4 w-4" />,
      onClick: (order) => {
        if (actionLoading[`process-${order._id}`]) return;
        handleProcessOrder(order);
      },
      condition: (order) => (order.status === "pending" || order.status === "confirmed") && !actionLoading[`process-${order._id}`],
      variant: "default",
      className: "bg-blue-600 hover:bg-blue-700 text-white",
      priority: 3
    },
    {
      id: "ship",
      label: "Mark Shipped",
      icon: <Ship className="h-4 w-4" />,
      onClick: handleShipOrder,
      condition: (order) => order.status === "processing" || order.status === "confirmed",
      variant: "default",
      className: "bg-green-600 hover:bg-green-700 text-white",
      priority: 4
    },
    {
      id: "deliver",
      label: "Mark Delivered",
      icon: <Truck className="h-4 w-4" />,
      onClick: handleDeliverOrder,
      condition: (order) => order.status === "shipped",
      variant: "default",
      className: "bg-purple-600 hover:bg-purple-700 text-white",
      priority: 5
    },
    {
      id: "cancel",
      label: "Cancel Order",
      icon: <XCircle className="h-4 w-4" />,
      onClick: handleCancelOrder,
      condition: (order) => ["pending", "processing", "confirmed"].includes(order.status),
      variant: "destructive",
      className: "bg-red-600 hover:bg-red-700 text-white border-red-600",
      priority: 8
    },
    {
      id: "refund",
      label: "Refund Order",
      icon: <ArrowLeftRight className="h-4 w-4" />,
      onClick: handleRefundOrder,
      condition: (order) => order.paymentStatus === "paid" && ["delivered", "cancelled"].includes(order.status),
      variant: "destructive",
      className: "bg-red-600 hover:bg-red-700 text-white border-red-600",
      priority: 9
    },
    {
      id: "delete",
      label: "Delete Order",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteOrder,
      condition: () => true,
      variant: "destructive",
      className: "bg-red-600 hover:bg-red-700 text-white border-red-600",
      priority: 10
    }
  ]

  // Authentication checks
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Authenticating...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!isAuthenticated || !user || !user.isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#12d6fa]/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="space-y-8 p-4 md:p-6 relative z-10">
          {/* Premium Order Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{orderStats.total}</div>
                    <p className="text-sm text-gray-600 mt-1">Total Orders</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">
                    {filteredOrders.length !== orderStats.total ? `${filteredOrders.length} filtered` : "All orders"}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-yellow-600">{orderStats.pending}</div>
                    <p className="text-sm text-gray-600 mt-1">Pending Orders</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Awaiting processing</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{orderStats.processing}</div>
                    <p className="text-sm text-gray-600 mt-1">Processing</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Being prepared</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-600">{CellRenderers.currency(orderStats.revenue, "SAR")}</div>
                    <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">From paid orders</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-600">{CellRenderers.currency(orderStats.avgOrderValue, "SAR")}</div>
                    <p className="text-sm text-gray-600 mt-1">Avg Order Value</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Average per order</span>
                </div>
              </div>
            </div>
        </div>

          {/* Premium Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Orders Management
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Manage customer orders, track shipments, and process payments
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{filteredOrders.length}</div>
                    <div className="text-sm text-gray-500">Filtered Orders</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#12d6fa]">{orders.length}</div>
                    <div className="text-sm text-gray-500">Total Orders</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <Button
                    onClick={fetchOrders}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleCreateOrder}
                    className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Order
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={fetchOrders}
                    disabled={loading}
                    className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <RefreshCw className="h-5 w-5 mr-2" />}
                    {loading ? "Refreshing..." : "Refresh"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleExportOrders}
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export CSV
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Search & Filters */}
          {showFilters && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#12d6fa]/20 to-blue-500/20 rounded-xl">
                    <Filter className="h-6 w-6 text-[#12d6fa]" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Advanced Filters
                  </h2>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                  <Label htmlFor="status-filter">Order Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                    name="status-filter"
                    aria-label="Filter by order status"
                  >
                    <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                  <Label htmlFor="payment-filter">Payment Status</Label>
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentStatus: value }))}
                    name="payment-filter"
                    aria-label="Filter by payment status"
                  >
                    <SelectTrigger id="payment-filter">
                    <SelectValue placeholder="All payments" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
                <div>
                  <Label htmlFor="shipping-filter">Shipping Status</Label>
                  <Select
                    value={filters.shippingStatus}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, shippingStatus: value }))}
                    name="shipping-filter"
                    aria-label="Filter by shipping status"
                  >
                    <SelectTrigger id="shipping-filter">
                      <SelectValue placeholder="All shipping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shipping</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="payment-method-filter">Payment Method</Label>
                  <Select
                    value={filters.paymentMethod}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentMethod: value }))}
                    name="payment-method-filter"
                    aria-label="Filter by payment method"
                  >
                    <SelectTrigger id="payment-method-filter">
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Urways">Urways</SelectItem>
                      <SelectItem value="Tap Payment">Tap Payment</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-from">Date From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="date-to">Date To</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={resetFilters} variant="outline">
                  Reset Filters
                </Button>
                <div className="text-sm text-muted-foreground flex items-center">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Premium Orders Table */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30"></div>
            <div className="relative overflow-hidden rounded-2xl">
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <Package className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Orders Directory</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#12d6fa] rounded-full animate-pulse"></div>
                          <span className="text-gray-300">
                            {filteredOrders.length} of {orders.length} orders
                          </span>
                        </div>
                        {selectedItems.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-300">{selectedItems.length} selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedItems.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkProcess}
                          disabled={processingOrders || selectedItems.length === 0}
                          className="text-xs px-3 py-2 bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20 rounded-lg transition-all duration-300"
                        >
                          {processingOrders ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                          {processingOrders ? "Processing..." : "Process Selected"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkCancel}
                          disabled={cancellingOrders || selectedItems.length === 0}
                          className="text-xs px-3 py-2 bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                        >
                          {cancellingOrders ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                          {cancellingOrders ? "Cancelling..." : "Cancel Selected"}
                        </Button>
                      </div>
                    )}
                    <Button 
                      onClick={fetchOrders}
                      variant="outline"
                      size="sm"
                      className="text-xs px-4 py-2 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg transition-all duration-300"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6">
                {loading && (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#12d6fa]/20 to-blue-500/20 rounded-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#12d6fa]" />
                      </div>
                      <span className="text-lg font-medium text-gray-600">Loading orders...</span>
                    </div>
                  </div>
                )}
                {!loading && (
                  <AdminTable
            data={paginatedOrders}
            columns={columns}
          // Selection
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          getRowId={(row) => row._id}
          // Context-aware actions
          contextActions={contextActions}
          actionMode="buttons"
          // Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredOrders.length}
          onPageChange={setCurrentPage}
          // States
          loading={loading}
          emptyMessage="No orders found. Orders will appear here once customers make purchases."
        />
                )}
              </div>
            </div>
          </div>

        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details - {selectedOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant={selectedOrder.status === "delivered" ? "default" : "secondary"} className="text-sm">
                      {(selectedOrder.status || 'pending').toUpperCase()}
                    </Badge>
                    <Badge
                      variant={(selectedOrder.paymentStatus || 'pending') === "paid" ? "default" : "destructive"}
                      className="text-sm"
                    >
                      {(selectedOrder.paymentStatus || 'pending').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Order Date: {new Date(selectedOrder.createdAt || selectedOrder.orderDate || new Date()).toLocaleDateString()}
                  </div>
                </div>

                <Separator />

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Customer Information
                      </CardTitle>
          </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <strong>Name:</strong> {selectedOrder.customerName || 'N/A'}
              </div>
                          <div>
                        <strong>Email:</strong> {selectedOrder.customerEmail || 'N/A'}
                            </div>
                      {(selectedOrder.shippingAddress?.phone || selectedOrder.customerPhone) && (
                        <div>
                          <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || selectedOrder.customerPhone}
                            </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Shipping Information */}
                  {selectedOrder.shippingAddress && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Shipping Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>{selectedOrder.shippingAddress.nationalAddress || selectedOrder.shippingAddress.street || 'N/A'}</div>
                        <div>
                          {selectedOrder.shippingAddress.city || 'N/A'}, {selectedOrder.shippingAddress.state || 'N/A'}
                          </div>
                        <div>{selectedOrder.shippingAddress.zipCode || 'N/A'}</div>
                        <div>{selectedOrder.shippingAddress.country || 'Saudi Arabia'}</div>
                      </CardContent>
                    </Card>
                  )}
                          </div>

                {/* Payment & Shipping Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <strong>Method:</strong> {selectedOrder.paymentMethod || 'N/A'}
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <Badge
                          variant={(selectedOrder.paymentStatus || 'pending') === "paid" ? "default" : "destructive"}
                          className="ml-2"
                        >
                          {selectedOrder.paymentStatus || 'pending'}
                            </Badge>
                            </div>
                      <div>
                        <strong>Total Amount:</strong> {CellRenderers.currency(selectedOrder.totalAmount || selectedOrder.total || 0, "SAR")}
                          </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Shipping Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <strong>Method:</strong> {selectedOrder.shippingMethod || 'Standard'}
                          </div>
                      <div>
                        <strong>Status:</strong>
                        <Badge variant="outline" className="ml-2">
                          {selectedOrder.shippingStatus || 'pending'}
                          </Badge>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div>
                          <strong>Tracking:</strong> {selectedOrder.trackingNumber}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, index) => (
                          <div key={item._id || item.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  SKU: {item.sku || 'N/A'} | Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{CellRenderers.currency(item.price, "SAR")}</p>
                              <p className="text-sm text-muted-foreground">
                                Total: {CellRenderers.currency(item.price * item.quantity, "SAR")}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total Items:</span>
                            <span className="font-medium">{selectedOrder.items.length}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No items found for this order</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedOrder.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedOrder.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                              <Button
                    onClick={() => handleProcessOrder(selectedOrder)}
                    disabled={selectedOrder.status !== "pending"}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Process Order
                              </Button>
                              <Button
                    onClick={() => handleShipOrder(selectedOrder)}
                    disabled={selectedOrder.status !== "processing"}
                                variant="outline"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Ship Order
                              </Button>
                              <Button
                    onClick={() => handleDeliverOrder(selectedOrder)}
                    disabled={selectedOrder.status !== "shipped"}
                                variant="outline"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Delivered
                              </Button>
                                  <Button 
                    onClick={() => handleCancelOrder(selectedOrder)}
                    disabled={selectedOrder.status === "delivered" || selectedOrder.status === "cancelled"}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Order
                                </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Order Dialog */}
        <Dialog open={showCreateOrder} onOpenChange={setShowCreateOrder}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Order
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        id="customerName"
                        value={orderForm.customerName}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, customerName: e.target.value }))}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={orderForm.customerEmail}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      value={orderForm.customerPhone}
                      onChange={(e) => setOrderForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="+966501234567"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalAmount">Total Amount (ر.س) *</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        value={orderForm.totalAmount}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, totalAmount: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground"
                        value={orderForm.paymentMethod}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                        aria-label="Select payment method"
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="Urways">Urways</option>
                        <option value="Tap Payment">Tap Payment</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="status">Order Status</Label>
                      <select
                        id="status"
                        name="status"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground"
                        value={orderForm.status}
                        onChange={(e) =>
                          setOrderForm((prev) => ({ ...prev, status: e.target.value as OrderStatus }))
                        }
                        aria-label="Select order status"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="paymentStatus">Payment Status</Label>
                      <select
                        id="paymentStatus"
                        name="paymentStatus"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground"
                        value={orderForm.paymentStatus}
                        onChange={(e) =>
                          setOrderForm((prev) => ({ ...prev, paymentStatus: e.target.value as PaymentStatus }))
                        }
                        aria-label="Select payment status"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="shippingMethod">Shipping Method</Label>
                      <select
                        id="shippingMethod"
                        name="shippingMethod"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground"
                        value={orderForm.shippingMethod}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, shippingMethod: e.target.value }))}
                        aria-label="Select shipping method"
                      >
                        <option value="Standard (Aramex)">Standard (Aramex)</option>
                        <option value="Express (Aramex)">Express (Aramex)</option>
                        <option value="Economy (Aramex)">Economy (Aramex)</option>
                      </select>
                          </div>
              </div>
          </CardContent>
        </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={orderForm.street}
                      onChange={(e) => setOrderForm((prev) => ({ ...prev, street: e.target.value }))}
                      placeholder="Enter street address"
                    />
            </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={orderForm.city}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={orderForm.state}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, state: e.target.value }))}
                        placeholder="Enter state or province"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={orderForm.zipCode}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="Enter ZIP code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={orderForm.country}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, country: e.target.value }))}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about this order..."
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitCreateOrder}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
              </Button>
                <Button variant="outline" onClick={() => setShowCreateOrder(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog open={showEditOrder} onOpenChange={setShowEditOrder}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Order - {editingOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-customerName">Customer Name *</Label>
                      <Input
                        id="edit-customerName"
                        value={orderForm.customerName}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, customerName: e.target.value }))}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-customerEmail">Email *</Label>
                      <Input
                        id="edit-customerEmail"
                        type="email"
                        value={orderForm.customerEmail}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-customerPhone">Phone Number</Label>
                    <Input
                      id="edit-customerPhone"
                      value={orderForm.customerPhone}
                      onChange={(e) => setOrderForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="+966501234567"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-totalAmount">Total Amount (ر.س) *</Label>
                      <Input
                        id="edit-totalAmount"
                        type="number"
                        step="0.01"
                        value={orderForm.totalAmount}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, totalAmount: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-paymentMethod">Payment Method</Label>
                      <select
                        id="edit-paymentMethod"
                        name="edit-paymentMethod"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground"
                        value={orderForm.paymentMethod}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                        aria-label="Select payment method"
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="Urways">Urways</option>
                        <option value="Tap Payment">Tap Payment</option>
                        <option value="PayPal">PayPal</option>
                        
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-status">Order Status</Label>
                      <select
                        id="edit-status"
                        name="edit-status"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground"
                        value={orderForm.status}
                        onChange={(e) =>
                          setOrderForm((prev) => ({ ...prev, status: e.target.value as OrderStatus }))
                        }
                        aria-label="Select order status"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-paymentStatus">Payment Status</Label>
                      <select
                        id="edit-paymentStatus"
                        name="edit-paymentStatus"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground"
                        value={orderForm.paymentStatus}
                        onChange={(e) =>
                          setOrderForm((prev) => ({ ...prev, paymentStatus: e.target.value as PaymentStatus }))
                        }
                        aria-label="Select payment status"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-shippingMethod">Shipping Method</Label>
                      <select
                        id="edit-shippingMethod"
                        name="edit-shippingMethod"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground"
                        value={orderForm.shippingMethod}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, shippingMethod: e.target.value }))}
                        aria-label="Select shipping method"
                      >
                        <option value="Standard (Aramex)">Standard (Aramex)</option>
                        <option value="Express (Aramex)">Express (Aramex)</option>
                        <option value="Economy (Aramex)">Economy (Aramex)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="edit-street">Street Address</Label>
                    <Input
                      id="edit-street"
                      value={orderForm.street}
                      onChange={(e) => setOrderForm((prev) => ({ ...prev, street: e.target.value }))}
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-city">City</Label>
                      <Input
                        id="edit-city"
                        value={orderForm.city}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-state">State/Province</Label>
                      <Input
                        id="edit-state"
                        value={orderForm.state}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, state: e.target.value }))}
                        placeholder="Enter state or province"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-zipCode">ZIP Code</Label>
                      <Input
                        id="edit-zipCode"
                        value={orderForm.zipCode}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="Enter ZIP code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-country">Country</Label>
                      <Input
                        id="edit-country"
                        value={orderForm.country}
                        onChange={(e) => setOrderForm((prev) => ({ ...prev, country: e.target.value }))}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about this order..."
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitEditOrder}>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Order
                </Button>
                <Button variant="outline" onClick={() => setShowEditOrder(false)}>
                  Cancel
                </Button>
            </div>
          </div>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </AdminLayout>
  )
}
