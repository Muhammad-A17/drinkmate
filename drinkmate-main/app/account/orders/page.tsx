'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'
import { Order, OrderStatus } from '@/types/account'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Calendar, Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Price } from '@/components/account/Price'

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
      itemsCount: 3
    },
    {
      id: '2',
      number: 'DM-2024-002',
      createdAt: '2024-01-10T14:20:00Z',
      status: 'shipped',
      total: 149.99,
      itemsCount: 1
    },
    {
      id: '3',
      number: 'DM-2024-003',
      createdAt: '2024-01-05T09:15:00Z',
      status: 'processing',
      total: 89.99,
      itemsCount: 2
    },
    {
      id: '4',
      number: 'DM-2024-004',
      createdAt: '2024-01-01T16:45:00Z',
      status: 'cancelled',
      total: 199.99,
      itemsCount: 1
    },
    {
      id: '5',
      number: 'DM-2024-005',
      createdAt: '2023-12-28T11:30:00Z',
      status: 'returned',
      total: 79.99,
      itemsCount: 1
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
      processing: 'bg-amber-100 text-amber-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      returned: 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
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
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'AR' ? 'الطلبات والإرجاع' : 'Orders & Returns'}
        </h1>
        <p className="text-gray-600 mt-1">
          {language === 'AR' 
            ? 'إدارة طلباتك وتتبع حالة الشحن'
            : 'Manage your orders and track shipping status'
          }
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={language === 'AR' ? 'البحث برقم الطلب...' : 'Search by order number...'}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
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
          />

          {/* Date To */}
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
            placeholder={language === 'AR' ? 'إلى تاريخ' : 'To Date'}
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'AR' ? 'لا توجد طلبات' : 'No orders found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'AR' 
                ? 'لم يتم العثور على طلبات تطابق معايير البحث الخاصة بك'
                : 'No orders found matching your search criteria'
              }
            </p>
            <Link href="/shop">
              <Button>
                {language === 'AR' ? 'تسوق الآن' : 'Start Shopping'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {order.number}
                      </h3>
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        getStatusColor(order.status)
                      )}>
                        {getStatusLabel(order.status)[language.toLowerCase() as 'en' | 'ar']}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {order.itemsCount} {language === 'AR' ? 'عنصر' : 'items'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Price value={order.total} size="lg" />
                    </div>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        {language === 'AR' ? 'عرض التفاصيل' : 'View Details'}
                        <ArrowRight className={cn(
                          "w-4 h-4 ml-2",
                          isRTL ? "ml-0 mr-2 rotate-180" : ""
                        )} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
