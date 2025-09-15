'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from '@/lib/translation-context'
import { Order, OrderLineItem, Shipment, Invoice } from '@/types/account'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, Truck, FileText, RotateCcw, ShoppingCart, Download } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Price } from '@/components/account/Price'

export default function OrderDetailPage() {
  const params = useParams()
  const { language, isRTL } = useTranslation()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API call
  const mockOrder: Order = {
    id: params.id as string,
    number: 'DM-2024-001',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'delivered',
    total: 299.99,
    itemsCount: 3,
    lineItems: [
      {
        id: '1',
        productId: 'prod-1',
        productName: 'Starter Kit - Arctic Blue',
        variant: 'Arctic Blue',
        quantity: 1,
        price: 199.99,
        image: '/images/starter-kit-blue.jpg'
      },
      {
        id: '2',
        productId: 'prod-2',
        productName: 'CO₂ Cylinder',
        quantity: 2,
        price: 25.99,
        image: '/images/co2-cylinder.jpg'
      }
    ],
    shipments: [
      {
        id: '1',
        trackingNumber: 'TRK123456789',
        carrier: 'Aramex',
        status: 'delivered',
        estimatedDelivery: '2024-01-18T00:00:00Z',
        actualDelivery: '2024-01-17T14:30:00Z'
      }
    ],
    invoices: [
      {
        id: '1',
        number: 'INV-2024-001',
        url: '/invoices/inv-2024-001.pdf',
        createdAt: '2024-01-15T10:30:00Z'
      }
    ]
  }

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOrder(mockOrder)
      setLoading(false)
    }

    fetchOrder()
  }, [params.id])

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

  const getShipmentStatusLabel = (status: string) => {
    const statusMap = {
      pending: { en: 'Pending', ar: 'معلق' },
      in_transit: { en: 'In Transit', ar: 'في الطريق' },
      delivered: { en: 'Delivered', ar: 'تم التسليم' }
    }
    return statusMap[status as keyof typeof statusMap] || { en: status, ar: status }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {language === 'AR' ? 'الطلب غير موجود' : 'Order not found'}
        </h3>
        <p className="text-gray-600 mb-6">
          {language === 'AR' 
            ? 'لم يتم العثور على الطلب المطلوب'
            : 'The requested order could not be found'
          }
        </p>
        <Link href="/account/orders">
          <Button>
            {language === 'AR' ? 'العودة للطلبات' : 'Back to Orders'}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/account/orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className={cn(
              "w-4 h-4 mr-2",
              isRTL ? "ml-2 mr-0 rotate-180" : ""
            )} />
            {language === 'AR' ? 'العودة' : 'Back'}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {order.number}
          </h1>
          <p className="text-gray-600">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge className={cn(
          "ml-auto",
          getStatusColor(order.status)
        )}>
          {getStatusLabel(order.status)[language.toLowerCase() as 'en' | 'ar']}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'AR' ? 'عناصر الطلب' : 'Order Items'}
            </h2>
            <div className="space-y-4">
              {order.lineItems?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.productName}
                    </h3>
                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        {language === 'AR' ? 'المتغير:' : 'Variant:'} {item.variant}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {language === 'AR' ? 'الكمية:' : 'Quantity:'} {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <Price value={item.price} size="lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Tracking */}
          {order.shipments && order.shipments.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'AR' ? 'تتبع الشحن' : 'Shipment Tracking'}
              </h2>
              {order.shipments.map((shipment) => (
                <div key={shipment.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {shipment.carrier}
                        </p>
                        <p className="text-sm text-gray-500">
                          {shipment.trackingNumber}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(shipment.status)}>
                      {getShipmentStatusLabel(shipment.status)[language.toLowerCase() as 'en' | 'ar']}
                    </Badge>
                  </div>
                  {shipment.actualDelivery && (
                    <p className="text-sm text-gray-600">
                      {language === 'AR' 
                        ? `تم التسليم في: ${formatDate(shipment.actualDelivery)}`
                        : `Delivered on: ${formatDate(shipment.actualDelivery)}`
                      }
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'AR' ? 'ملخص الطلب' : 'Order Summary'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {language === 'AR' ? 'المجموع الفرعي:' : 'Subtotal:'}
                </span>
                <Price value={order.total} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {language === 'AR' ? 'الشحن:' : 'Shipping:'}
                </span>
                <span className="text-sm text-green-600">
                  {language === 'AR' ? 'مجاني' : 'Free'}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>{language === 'AR' ? 'المجموع:' : 'Total:'}</span>
                  <Price value={order.total} size="lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'AR' ? 'الإجراءات' : 'Actions'}
            </h3>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {language === 'AR' ? 'إعادة الطلب' : 'Reorder'}
              </Button>
              
              {order.status === 'delivered' && (
                <Button className="w-full" variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {language === 'AR' ? 'إرجاع' : 'Return'}
                </Button>
              )}

              {order.invoices && order.invoices.length > 0 && (
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'AR' ? 'تحميل الفاتورة' : 'Download Invoice'}
                </Button>
              )}
            </div>
          </div>

          {/* Invoices */}
          {order.invoices && order.invoices.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'AR' ? 'الفواتير' : 'Invoices'}
              </h3>
              <div className="space-y-2">
                {order.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {invoice.number}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
