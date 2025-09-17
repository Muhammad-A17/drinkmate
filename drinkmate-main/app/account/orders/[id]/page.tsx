'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/translation-context'
import { useCart } from '@/hooks/use-cart'
import { Order, OrderLineItem, Shipment, Invoice } from '@/types/account'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  FileText, 
  RotateCcw, 
  ShoppingCart, 
  Download,
  CheckCircle,
  Clock,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Copy,
  ExternalLink,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  Star,
  TrendingUp,
  Eye,
  X
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Price } from '@/components/account/Price'
import { toast } from 'sonner'

// Enhanced types for better tracking data
interface TrackingCheckpoint {
  ts: string
  status: string
  city?: string
  message: string
  location?: string
}

interface Carrier {
  name: string
  code: string
  trackingNumber: string
  trackingUrl: string
  logo?: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language, isRTL } = useTranslation()
  const { addItem, totalItems } = useCart()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReordering, setIsReordering] = useState(false)

  // Mock data - replace with actual API call
  const mockOrder: Order = {
    id: params.id as string,
    number: 'DM-2024-001',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'delivered',
    total: 299.99,
    itemsCount: 3,
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-01-18T00:00:00Z',
    items: [
      {
        name: 'DrinkMate OmniFizz - Arctic Blue',
        quantity: 1,
        price: 199.99
      },
      {
        name: 'CO₂ Cylinder',
        quantity: 2,
        price: 50.00
      }
    ],
    lineItems: [
      {
        id: '1',
        productId: 'prod-1',
        productName: 'DrinkMate OmniFizz - Arctic Blue',
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

  // Mock tracking checkpoints
  const mockCheckpoints: TrackingCheckpoint[] = [
    {
      ts: '2024-01-17T14:30:00Z',
      status: 'DELIVERED',
      city: 'Riyadh',
      message: 'Package delivered successfully',
      location: '123 King Fahd Road, Al Olaya, Riyadh'
    },
    {
      ts: '2024-01-17T10:15:00Z',
      status: 'OUT_FOR_DELIVERY',
      city: 'Riyadh',
      message: 'Package out for delivery',
      location: 'Riyadh Distribution Center'
    },
    {
      ts: '2024-01-16T21:35:00Z',
      status: 'IN_TRANSIT',
      city: 'Riyadh Hub',
      message: 'Arrived at sorting center',
      location: 'Riyadh Hub'
    },
    {
      ts: '2024-01-16T15:20:00Z',
      status: 'SHIPPED',
      city: 'Jeddah',
      message: 'Package dispatched from origin',
      location: 'Jeddah Warehouse'
    },
    {
      ts: '2024-01-15T14:30:00Z',
      status: 'PROCESSING',
      city: 'Jeddah',
      message: 'Order received and being prepared',
      location: 'Jeddah Processing Center'
    }
  ]

  const mockCarrier: Carrier = {
    name: 'Aramex',
    code: 'aramex',
    trackingNumber: 'TRK123456789',
    trackingUrl: 'https://www.aramex.com/track/TRK123456789'
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
      processing: 'bg-amber-100 text-amber-800 border-amber-200',
      shipped: 'bg-blue-100 text-blue-800 border-blue-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      returned: 'bg-red-100 text-red-800 border-red-200'
    }
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    const iconMap = {
      processing: <RefreshCw className="h-4 w-4" />,
      shipped: <Truck className="h-4 w-4" />,
      delivered: <CheckCircle className="h-4 w-4" />,
      cancelled: <X className="h-4 w-4" />,
      returned: <RefreshCw className="h-4 w-4" />
    }
    return iconMap[status as keyof typeof iconMap] || <Clock className="h-4 w-4" />
  }

  const getShipmentStatusLabel = (status: string) => {
    const statusMap = {
      pending: { en: 'Pending', ar: 'معلق' },
      in_transit: { en: 'In Transit', ar: 'في الطريق' },
      delivered: { en: 'Delivered', ar: 'تم التسليم' }
    }
    return statusMap[status as keyof typeof statusMap] || { en: status, ar: status }
  }

  const getTrackingStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'OUT_FOR_DELIVERY': return <Truck className="w-4 h-4 text-blue-600" />
      case 'IN_TRANSIT': return <Truck className="w-4 h-4 text-blue-500" />
      case 'SHIPPED': return <Package className="w-4 h-4 text-blue-600" />
      case 'PROCESSING': return <Package className="w-4 h-4 text-yellow-600" />
      case 'RECEIVED': return <Package className="w-4 h-4 text-gray-600" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const formatLastUpdated = (lastUpdated: string) => {
    const date = new Date(lastUpdated)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`
    return `${Math.floor(diffMinutes / 1440)} days ago`
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

  const handleReorder = async () => {
    if (!order?.lineItems) return
    
    setIsReordering(true)
    try {
      // Add each item from the order to the cart
      for (const item of order.lineItems) {
        const cartItem = {
          id: item.productId,
          name: item.productName,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: 'reorder',
          color: item.variant || undefined
        }
        addItem(cartItem)
      }
      
      // Show success message
      toast.success(
        language === 'AR' 
          ? `تم إضافة ${order.lineItems.length} عنصر إلى السلة` 
          : `Added ${order.lineItems.length} items to cart`,
        {
          description: language === 'AR' 
            ? 'يمكنك الآن المتابعة إلى السلة لإتمام الطلب' 
            : 'You can now proceed to cart to complete your order'
        }
      )
      
      // Optional: Navigate to cart after a short delay
      setTimeout(() => {
        router.push('/cart')
      }, 2000)
      
    } catch (error) {
      toast.error(
        language === 'AR' 
          ? 'حدث خطأ أثناء إعادة الطلب' 
          : 'Error occurred while reordering'
      )
    } finally {
      setIsReordering(false)
    }
  }

  const handleReturn = () => {
    // Redirect to contact page for returns
    router.push('/contact?subject=return&order=' + order?.number)
  }

  const handleContactSupport = () => {
    // Redirect to contact page for support
    router.push('/contact?subject=support&order=' + order?.number)
  }

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      // Create a mock PDF blob for demonstration
      // In a real app, this would fetch the actual invoice from the server
      const mockPdfContent = `Invoice ${invoice.number}\nOrder: ${order?.number}\nDate: ${invoice.createdAt}\nAmount: $${order?.total}`
      const blob = new Blob([mockPdfContent], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoice.number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(
        language === 'AR' 
          ? `تم تحميل الفاتورة ${invoice.number}` 
          : `Downloaded invoice ${invoice.number}`
      )
    } catch (error) {
      toast.error(
        language === 'AR' 
          ? 'حدث خطأ أثناء تحميل الفاتورة' 
          : 'Error downloading invoice'
      )
    }
  }

  // Progress bar component
  function ProgressBar({ status, checkpoints }: { status: string, checkpoints: TrackingCheckpoint[] }) {
    const statusSteps = [
      { key: 'RECEIVED', label: 'Received', icon: Package },
      { key: 'PROCESSING', label: 'Processing', icon: Clock },
      { key: 'PACKED', label: 'Packed', icon: Package },
      { key: 'SHIPPED', label: 'Shipped', icon: Truck },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
      { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle }
    ]

    const currentStepIndex = statusSteps.findIndex(step => step.key === status)
    const progress = currentStepIndex >= 0 ? ((currentStepIndex + 1) / statusSteps.length) * 100 : 0

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {language === 'AR' ? 'تقدم الطلب' : 'Order Progress'}
          </span>
          <span className="text-gray-500">{Math.round(progress)}% {language === 'AR' ? 'مكتمل' : 'Complete'}</span>
        </div>
        <div className="relative">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index <= currentStepIndex
              const isCurrent = index === currentStepIndex
              
              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                    isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500",
                    isCurrent && "ring-4 ring-blue-200"
                  )}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span className={cn(
                    "text-xs mt-1 text-center max-w-16",
                    isActive ? "text-blue-600 font-medium" : "text-gray-500"
                  )}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-10">
            <div 
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Timeline component
  function Timeline({ checkpoints }: { checkpoints: TrackingCheckpoint[] }) {
    const formatTimestamp = (ts: string) => {
      const date = new Date(ts)
      return date.toLocaleString(language === 'AR' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">
          {language === 'AR' ? 'جدول التتبع' : 'Tracking Timeline'}
        </h3>
        <div className="space-y-3">
          {checkpoints.map((checkpoint, index) => (
            <div key={index} className={cn(
              "flex gap-3 p-4 rounded-lg border",
              index === 0 ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
            )}>
              <div className="flex-shrink-0 mt-0.5">
                {getTrackingStatusIcon(checkpoint.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {checkpoint.message}
                    </p>
                    {checkpoint.city && (
                      <p className="text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {checkpoint.city}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimestamp(checkpoint.ts)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-600">
                {language === 'AR' ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'AR' ? 'الطلب غير موجود' : 'Order not found'}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              {language === 'AR' 
                ? 'لم يتم العثور على الطلب المطلوب'
                : 'The requested order could not be found'
              }
            </p>
            <Link href="/account/orders">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {language === 'AR' ? 'العودة للطلبات' : 'Back to Orders'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/account/orders">
              <Button variant="outline" size="sm" className="hover:bg-blue-50">
                <ArrowLeft className={cn(
                  "w-4 h-4 mr-2",
                  isRTL ? "ml-2 mr-0 rotate-180" : ""
                )} />
                {language === 'AR' ? 'العودة' : 'Back'}
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {order.number}
              </h1>
              <p className="text-gray-600 text-lg">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge className={cn(
              "px-4 py-2 text-sm font-medium border",
              getStatusColor(order.status)
            )}>
              <span className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                {getStatusLabel(order.status)[language.toLowerCase() as 'en' | 'ar']}
              </span>
            </Badge>
          </div>
        </div>

        {/* Status Header with Progress */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              {language === 'AR' ? 'حالة الطلب' : 'Order Status'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ProgressBar status={order.status.toUpperCase()} checkpoints={mockCheckpoints} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  {language === 'AR' ? 'عناصر الطلب' : 'Order Items'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {order.lineItems?.map((item) => (
                    <div key={item.id} className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {item.productName}
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-600 mb-1">
                            {language === 'AR' ? 'المتغير:' : 'Variant:'} {item.variant}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {language === 'AR' ? 'الكمية:' : 'Quantity:'} {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <Price value={item.price} size="lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipment Tracking */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Truck className="h-6 w-6 text-purple-600" />
                  </div>
                  {language === 'AR' ? 'تتبع الشحن' : 'Shipment Tracking'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Carrier Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {mockCarrier.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {language === 'AR' ? 'شركة الشحن' : 'Shipping Carrier'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => window.open(mockCarrier.trackingUrl, '_blank')}
                        className="hover:bg-blue-50 hover:border-blue-200"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {language === 'AR' ? 'تتبع' : 'Track'}
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'AR' ? 'رقم التتبع:' : 'Tracking Number:'}
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="bg-white px-3 py-1 rounded-lg text-sm font-mono border">
                            {mockCarrier.trackingNumber}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(mockCarrier.trackingNumber)}
                            className="hover:bg-blue-100"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {order.trackingNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {language === 'AR' ? 'آخر تحديث:' : 'Last Updated:'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatLastUpdated(order.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <Timeline checkpoints={mockCheckpoints} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  {language === 'AR' ? 'ملخص الطلب' : 'Order Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
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
                    <span className="text-sm text-green-600 font-medium">
                      {language === 'AR' ? 'مجاني' : 'Free'}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>{language === 'AR' ? 'المجموع:' : 'Total:'}</span>
                      <Price value={order.total} size="lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <RefreshCw className="h-6 w-6 text-indigo-600" />
                  </div>
                  {language === 'AR' ? 'الإجراءات' : 'Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 relative"
                    onClick={handleReorder}
                    disabled={isReordering}
                  >
                    {isReordering ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <div className="relative">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {totalItems > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {totalItems > 99 ? '99+' : totalItems}
                          </span>
                        )}
                      </div>
                    )}
                    {isReordering 
                      ? (language === 'AR' ? 'جاري الإضافة...' : 'Adding to cart...')
                      : (language === 'AR' ? 'إعادة الطلب' : 'Reorder')
                    }
                  </Button>
                  
                  {order.status === 'delivered' && (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handleReturn}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {language === 'AR' ? 'إرجاع' : 'Return'}
                    </Button>
                  )}

                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleContactSupport}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {language === 'AR' ? 'اتصل بالدعم' : 'Contact Support'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Invoices */}
            {order.invoices && order.invoices.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    {language === 'AR' ? 'الفواتير' : 'Invoices'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {order.invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <span className="font-medium text-gray-900">
                              {invoice.number}
                            </span>
                            <p className="text-xs text-gray-500">
                              {formatDate(invoice.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-blue-100"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
