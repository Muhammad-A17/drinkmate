"use client"

import { useState } from "react"
import { useTranslation } from "@/lib/translation-context"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Banner from "@/components/layout/Banner"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { orderAPI } from "@/lib/api"
import { toast } from "sonner"

interface OrderStatus {
  orderNumber: string
  status: string
  estimatedDelivery: string
  trackingNumber?: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  shippingAddress: {
    firstName: string
    lastName: string
    address1: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  createdAt: string
}

export default function TrackOrderPage() {
  const { t, isRTL, isHydrated, language } = useTranslation()
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [order, setOrder] = useState<OrderStatus | null>(null)

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderNumber.trim() || !email.trim()) {
      toast.error(t('trackOrder.form.title') + " - " + t('trackOrder.form.orderNumber') + " & " + t('trackOrder.form.email'))
      return
    }

    setIsLoading(true)
    
    try {
      const response = await orderAPI.trackOrder(orderNumber, email)
      
      if (response.success) {
        setOrder(response.order)
        toast.success(t('trackOrder.results.title') + " " + t('trackOrder.form.trackOrder'))
      } else {
        setOrder(null)
        toast.error(response.message || t('trackOrder.form.trackOrder') + " " + t('trackOrder.form.title'))
      }
    } catch (error) {
      console.error("Error tracking order:", error)
      toast.error(t('trackOrder.form.trackOrder') + " " + t('trackOrder.form.title'))
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />
      case 'shipped':
        return <Truck className="w-5 h-5" />
      case 'processing':
        return <Package className="w-5 h-5" />
      case 'pending':
        return <Clock className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}
      dir={isHydrated && isRTL ? 'rtl' : 'ltr'}
    >
      <Banner />
      <Header />
      
      {/* Hero Section with Background */}
      <section className="relative py-8 md:py-16 bg-white animate-fade-in-up overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151525/banner-1557881_jmax5z.jpg"
            alt="Track Order Background"
            fill
            className="object-cover"
            style={{ objectPosition: 'center 80%' }}
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 md:space-y-6">
            <h1
              className={`text-3xl md:text-5xl font-bold text-white leading-tight ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up tracking-tight`}
            >
              {t('trackOrder.hero.title')}
            </h1>
            <p
              className={`text-base md:text-xl text-gray-200 max-w-3xl mx-auto ${isRTL ? "font-noto-arabic" : "font-noto-sans"} animate-slide-in-up delay-200 leading-relaxed`}
            >
              {t('trackOrder.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Track Order Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('trackOrder.form.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('trackOrder.form.orderNumber')}
                  </label>
                  <Input
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder={t('trackOrder.form.orderNumberPlaceholder')}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('trackOrder.form.email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('trackOrder.form.emailPlaceholder')}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
              >
                {isLoading ? t('trackOrder.form.trackOrder') + "..." : t('trackOrder.form.trackOrder')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('trackOrder.results.title')}</span>
                <Badge className={getStatusColor(order.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('trackOrder.results.orderNumber')}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>{t('trackOrder.results.orderNumber')}:</strong> {order.orderNumber}</p>
                    <p><strong>{t('trackOrder.results.date')}:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>{t('trackOrder.results.estimatedDelivery')}:</strong> {order.estimatedDelivery}</p>
                    {order.trackingNumber && (
                      <p><strong>{t('trackOrder.results.currentLocation')}:</strong> {order.trackingNumber}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('trackOrder.results.currentLocation')}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.address1}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('trackOrder.results.items')}</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{t('trackOrder.results.items')}: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        <SaudiRiyal amount={item.price * item.quantity} language={language} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">{t('trackOrder.results.total')}</span>
                  <span className="text-xl font-bold text-gray-900">
                    <SaudiRiyal amount={order.total} language={language} />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  )
}
