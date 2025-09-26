'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/contexts/translation-context'
import { Order, OrderStatus } from '@/types/account'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  CheckCircle, 
  X, 
  RefreshCw, 
  Clock,
  Eye,
  Download,
  Star,
  TrendingUp,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Price } from '@/components/account/Price'
import SaudiRiyal from '@/components/ui/SaudiRiyal'

export default function OrdersPage() {
  const { language, isRTL } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    from: '',
    to: ''
  })

  // Mock data - replace with actual API call
  const mockOrders: Order[] = [
    {
      id: '1',
      number: 'DM-2024-001',
      createdAt: '2024-01-15T10:30:00Z',
      status: 'delivered',
      total: 299.99,
      itemsCount: 3,
      items: [
        { name: 'DrinkMate OmniFizz', quantity: 1, price: 199.99 },
        { name: 'CO₂ Cylinder', quantity: 2, price: 50.00 }
      ],
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2024-01-20T00:00:00Z'
    },
    {
      id: '2',
      number: 'DM-2024-002',
      createdAt: '2024-01-10T14:20:00Z',
      status: 'shipped',
      total: 149.99,
      itemsCount: 1,
      items: [
        { name: 'Premium Flavor Pack', quantity: 1, price: 149.99 }
      ],
      trackingNumber: 'TRK987654321',
      estimatedDelivery: '2024-01-18T00:00:00Z'
    },
    {
      id: '3',
      number: 'DM-2024-003',
      createdAt: '2024-01-05T09:15:00Z',
      status: 'processing',
      total: 89.99,
      itemsCount: 2,
      items: [
        { name: 'Extra CO₂ Cylinder', quantity: 2, price: 89.99 }
      ],
      trackingNumber: null,
      estimatedDelivery: '2024-01-12T00:00:00Z'
    },
    {
      id: '4',
      number: 'DM-2024-004',
      createdAt: '2024-01-01T16:45:00Z',
      status: 'cancelled',
      total: 199.99,
      itemsCount: 1,
      items: [
        { name: 'Starter Kit', quantity: 1, price: 199.99 }
      ],
      trackingNumber: null,
      estimatedDelivery: null
    },
    {
      id: '5',
      number: 'DM-2024-005',
      createdAt: '2023-12-28T11:30:00Z',
      status: 'returned',
      total: 79.99,
      itemsCount: 1,
      items: [
        { name: 'Flavor Syrup', quantity: 1, price: 79.99 }
      ],
      trackingNumber: null,
      estimatedDelivery: null
    }
  ]

  useEffect(() => {
    // Simulate API call
    const fetchOrders = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOrders(mockOrders)
      setLoading(false)
    }

    fetchOrders()
  }, [])

  const getStatusLabel = (status: OrderStatus) => {
    const statusMap = {
      processing: { en: 'Processing', ar: 'قيد المعالجة' },
      shipped: { en: 'Shipped', ar: 'تم الشحن' },
      delivered: { en: 'Delivered', ar: 'تم التسليم' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
      returned: { en: 'Returned', ar: 'مرتجع' }
    }
    return statusMap[status] || { en: status, ar: status }
  }

  const getStatusColor = (status: OrderStatus) => {
    const colorMap = {
      processing: 'bg-amber-100 text-amber-800 border-amber-200',
      shipped: 'bg-blue-100 text-blue-800 border-blue-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      returned: 'bg-red-100 text-red-800 border-red-200'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: OrderStatus) => {
    const iconMap = {
      processing: <RefreshCw className="h-4 w-4" />,
      shipped: <Truck className="h-4 w-4" />,
      delivered: <CheckCircle className="h-4 w-4" />,
      cancelled: <X className="h-4 w-4" />,
      returned: <RefreshCw className="h-4 w-4" />
    }
    return iconMap[status] || <Clock className="h-4 w-4" />
  }

  // Calculate statistics
  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    totalValue: orders.reduce((sum, order) => sum + order.total, 0)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const filteredOrders = orders.filter(order => {
    if (filters.status && filters.status !== 'all' && order.status !== filters.status) return false
    if (filters.search && !order.number.toLowerCase().includes(filters.search.toLowerCase())) return false
    // Add date filtering logic here
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-600">
                {language === 'AR' ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/account">
            <Button variant="outline" className="hover:bg-orange-50 hover:border-orange-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'AR' ? 'العودة إلى الحساب' : 'Back to Account'}
            </Button>
          </Link>
        </div>

        {/* Header with Stats */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {language === 'AR' ? 'الطلبات والإرجاع' : 'Orders & Returns'}
                </h1>
                <p className="text-orange-100 text-lg">
                  {language === 'AR' 
                    ? 'إدارة طلباتك وتتبع حالة الشحن'
                    : 'Manage your orders and track shipping status'
                  }
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <div className="text-orange-100 text-sm">
                    {language === 'AR' ? 'إجمالي الطلبات' : 'Total Orders'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.delivered}</div>
                  <div className="text-orange-100 text-sm">
                    {language === 'AR' ? 'تم التسليم' : 'Delivered'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold flex items-center justify-center gap-1">
                    <SaudiRiyal amount={stats.totalValue} size="lg" />
                  </div>
                  <div className="text-orange-100 text-sm">
                    {language === 'AR' ? 'إجمالي القيمة' : 'Total Value'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'AR' ? 'قيد المعالجة' : 'Processing'}
                  </p>
                  <p className="text-2xl font-bold text-amber-600">{stats.processing}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'AR' ? 'تم الشحن' : 'Shipped'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'AR' ? 'تم التسليم' : 'Delivered'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'AR' ? 'إجمالي القيمة' : 'Total Value'}
                  </p>
                  <div className="text-2xl font-bold text-purple-600">
                    <SaudiRiyal amount={stats.totalValue} size="lg" />
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Filter className="h-6 w-6 text-gray-600" />
              </div>
              {language === 'AR' ? 'تصفية الطلبات' : 'Filter Orders'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={language === 'AR' ? 'البحث برقم الطلب...' : 'Search by order number...'}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {/* Status Filter */}
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                  <SelectValue placeholder={language === 'AR' ? 'حالة الطلب' : 'Order Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'AR' ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                  <SelectItem value="processing">{getStatusLabel('processing')[language.toLowerCase() as 'en' | 'ar']}</SelectItem>
                  <SelectItem value="shipped">{getStatusLabel('shipped')[language.toLowerCase() as 'en' | 'ar']}</SelectItem>
                  <SelectItem value="delivered">{getStatusLabel('delivered')[language.toLowerCase() as 'en' | 'ar']}</SelectItem>
                  <SelectItem value="cancelled">{getStatusLabel('cancelled')[language.toLowerCase() as 'en' | 'ar']}</SelectItem>
                  <SelectItem value="returned">{getStatusLabel('returned')[language.toLowerCase() as 'en' | 'ar']}</SelectItem>
                </SelectContent>
              </Select>

              {/* Date From */}
              <Input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
                placeholder={language === 'AR' ? 'من تاريخ' : 'From Date'}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />

              {/* Date To */}
              <Input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
                placeholder={language === 'AR' ? 'إلى تاريخ' : 'To Date'}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-orange-600" />
              </div>
              {language === 'AR' ? 'قائمة الطلبات' : 'Orders List'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'AR' ? 'لا توجد طلبات' : 'No orders found'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {language === 'AR' 
                    ? 'لم يتم العثور على طلبات تطابق معايير البحث الخاصة بك'
                    : 'No orders found matching your search criteria'
                  }
                </p>
                <Link href="/shop">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    {language === 'AR' ? 'تسوق الآن' : 'Start Shopping'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 bg-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {order.number}
                          </h3>
                          <Badge className={cn(
                            "px-3 py-1 text-sm font-medium border",
                            getStatusColor(order.status)
                          )}>
                            <span className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              {getStatusLabel(order.status)[language.toLowerCase() as 'en' | 'ar']}
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>{order.itemsCount} {language === 'AR' ? 'عنصر' : 'items'}</span>
                          </div>
                          {order.trackingNumber && (
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              <span className="font-mono text-xs">{order.trackingNumber}</span>
                            </div>
                          )}
                        </div>

                        {/* Order Items Preview */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {language === 'AR' ? 'المنتجات' : 'Items'}
                          </h4>
                          <div className="space-y-1">
                            {order.items?.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.name} (x{item.quantity})
                                </span>
                                <span className="font-medium">
                                  <SaudiRiyal amount={item.price} size="sm" />
                                </span>
                              </div>
                            ))}
                            {order.items && order.items.length > 2 && (
                              <div className="text-xs text-gray-500 pt-1">
                                +{order.items.length - 2} {language === 'AR' ? 'عناصر أخرى' : 'more items'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-4 ml-6">
                        <div className="text-right">
                          <Price value={order.total} size="lg" />
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/account/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="hover:bg-orange-50 hover:border-orange-200">
                              <Eye className="h-4 w-4 mr-2" />
                              {language === 'AR' ? 'عرض التفاصيل' : 'View Details'}
                            </Button>
                          </Link>
                          {order.trackingNumber && (
                            <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                              <Truck className="h-4 w-4 mr-2" />
                              {language === 'AR' ? 'تتبع' : 'Track'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
