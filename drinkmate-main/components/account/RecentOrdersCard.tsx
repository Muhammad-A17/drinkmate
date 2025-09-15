'use client'

import { useTranslation } from '@/lib/translation-context'
import { Order } from '@/types/account'
import { Button } from '@/components/ui/button'
import { Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Price } from './Price'

interface RecentOrdersCardProps {
  orders: Order[]
}

export default function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  const { language, isRTL } = useTranslation()

  const getStatusLabel = (status: string) => {
    const statusMap = {
      processing: { en: 'Processing', ar: 'قيد المعالجة' },
      shipped: { en: 'Shipped', ar: 'تم الشحن' },
      delivered: { en: 'Delivered', ar: 'تم التسليم' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
      returned: { en: 'Returned', ar: 'مرتجع' }
    }
    return statusMap[status as keyof typeof statusMap] || { en: status, ar: status }
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      processing: 'bg-amber-100 text-amber-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      returned: 'bg-red-100 text-red-800'
    }
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 lg:p-8 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {language === 'AR' ? 'الطلبات الأخيرة' : 'Recent Orders'}
          </h3>
        </div>
        <Link href="/account/orders">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            {language === 'AR' ? 'عرض الكل' : 'View All'}
            <ArrowRight className={cn(
              "w-4 h-4 ml-1",
              isRTL ? "ml-0 mr-1 rotate-180" : ""
            )} />
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {language === 'AR' ? 'لا توجد طلبات بعد' : 'No orders yet'}
          </p>
          <Link href="/shop">
            <Button variant="outline" size="sm" className="mt-3">
              {language === 'AR' ? 'تسوق الآن' : 'Start Shopping'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">
                    {order.number}
                  </span>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    getStatusColor(order.status)
                  )}>
                    {getStatusLabel(order.status)[language.toLowerCase() as 'en' | 'ar']}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{formatDate(order.createdAt)}</span>
                  <span>{order.itemsCount} {language === 'AR' ? 'عنصر' : 'items'}</span>
                </div>
              </div>
              <div className="text-right">
                <Price value={order.total} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
