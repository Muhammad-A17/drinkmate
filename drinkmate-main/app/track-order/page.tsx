"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "@/lib/translation-context"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  Download,
  MessageCircle,
  Copy,
  ExternalLink,
  Calendar,
  User,
  Loader2
} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Banner from "@/components/layout/Banner"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { orderAPI } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

interface OrderSummary {
  items: Array<{
    name: string
    qty: number
    thumb: string
    price: number
  }>
  address: string
  totals: {
    subtotal: number
    shipping: number
    tax: number
    total: number
  }
}

interface TrackingActions {
  canCancel: boolean
  canChangeAddress: boolean
}

interface TrackingData {
  orderId: string
  status: string
  eta: string
  lastUpdated: string
  carrier: Carrier
  checkpoints: TrackingCheckpoint[]
  summary: OrderSummary
  actions: TrackingActions
}

// Order number mask component
function OrderNumberInput({ value, onChange, placeholder, className }: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  const formatOrderNumber = (input: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = input.replace(/[^A-Za-z0-9]/g, '')
    
    // If it starts with ORD, keep it, otherwise add ORD-2024-
    if (cleaned.startsWith('ORD')) {
      return cleaned.replace(/(ORD)(\d{4})(\d+)/, '$1-$2-$3')
    } else if (cleaned.length > 0) {
      return `ORD-2024-${cleaned}`
    }
    return cleaned
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatOrderNumber(e.target.value)
    onChange(formatted)
  }

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      maxLength={15}
    />
  )
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
        <span className="font-medium">Order Progress</span>
        <span className="text-gray-500">{Math.round(progress)}% Complete</span>
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
  const { language, isRTL } = useTranslation()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'OUT_FOR_DELIVERY': return <Truck className="w-4 h-4 text-blue-600" />
      case 'IN_TRANSIT': return <Truck className="w-4 h-4 text-blue-500" />
      case 'PROCESSING': return <Package className="w-4 h-4 text-yellow-600" />
      case 'RECEIVED': return <Package className="w-4 h-4 text-gray-600" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

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
      <h3 className="font-semibold text-gray-900">Tracking Timeline</h3>
      <div className="space-y-3">
        {checkpoints.map((checkpoint, index) => (
          <div key={index} className={cn(
            "flex gap-3 p-3 rounded-lg border",
            index === 0 ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
          )}>
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(checkpoint.status)}
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

// Skeleton loading component
function SkeletonTrack() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  const { t, isRTL, isHydrated, language } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recentOrders, setRecentOrders] = useState<Array<{id: string, number: string}>>([])

  // Prefill email if user is logged in
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setEmail(user.email)
    }
  }, [isAuthenticated, user?.email])

  // Mock recent orders for logged-in users
  useEffect(() => {
    if (isAuthenticated) {
      setRecentOrders([
        { id: '1', number: 'ORD-2024-00123' },
        { id: '2', number: 'ORD-2024-00124' },
        { id: '3', number: 'ORD-2024-00125' },
        { id: '4', number: 'ORD-2024-00126' },
        { id: '5', number: 'ORD-2024-00127' }
      ])
    }
  }, [isAuthenticated])

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderNumber.trim() || !email.trim()) {
      toast.error("Please enter both order number and email")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock tracking data
      const mockData: TrackingData = {
        orderId: orderNumber,
        status: 'OUT_FOR_DELIVERY',
        eta: '2024-01-20T17:00:00Z',
        lastUpdated: '2024-01-19T11:42:18Z',
        carrier: {
          name: 'Aramex',
          code: 'aramex',
          trackingNumber: '123456789',
          trackingUrl: 'https://www.aramex.com/track/123456789'
        },
        checkpoints: [
          {
            ts: '2024-01-19T10:10:00Z',
            status: 'OUT_FOR_DELIVERY',
            city: 'Riyadh',
            message: 'Courier left the facility'
          },
          {
            ts: '2024-01-18T21:35:00Z',
            status: 'IN_TRANSIT',
            city: 'Riyadh Hub',
            message: 'Arrived at sorting center'
          },
          {
            ts: '2024-01-18T15:20:00Z',
            status: 'SHIPPED',
            city: 'Jeddah',
            message: 'Package dispatched from origin'
          },
          {
            ts: '2024-01-17T09:30:00Z',
            status: 'PROCESSING',
            city: 'Jeddah',
            message: 'Order received and being prepared'
          }
        ],
        summary: {
          items: [
            { name: 'CO₂ Cylinder Refill', qty: 1, thumb: '/images/co2-cylinder.jpg', price: 100.00 },
            { name: 'Flavor Syrup Pack', qty: 2, thumb: '/images/syrup-pack.jpg', price: 25.00 }
          ],
          address: '123 King Fahd Road, Al Olaya, Riyadh 12345, Saudi Arabia',
          totals: { subtotal: 150.00, shipping: 35.00, tax: 27.75, total: 212.75 }
        },
        actions: {
          canCancel: false,
          canChangeAddress: false
        }
      }
      
      setTrackingData(mockData)
      toast.success("Order tracking information loaded successfully")
    } catch (err) {
      console.error("Error tracking order:", err)
      setError("Failed to load tracking information. Please try again.")
      toast.error("Failed to load tracking information")
    } finally {
      setIsLoading(false)
    }
  }

  const formatETA = (eta: string) => {
    const date = new Date(eta)
    return date.toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Banner />
      <Header />
      
      {/* Enhanced Hero Section with Better Contrast */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#0a9bb8] via-[#0894a8] to-[#067a8a] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/images/track-order-pattern.svg')] opacity-5"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-semibold shadow-lg">
              <Package className="w-4 h-4" />
              Track Your Orders
            </div>
            <h1
              className={`text-4xl md:text-6xl font-bold text-white leading-tight ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight drop-shadow-lg`}
            >
              {t('trackOrder.hero.title')}
            </h1>
            <p
              className={`text-xl md:text-2xl text-white max-w-3xl mx-auto ${isRTL ? "font-noto-arabic" : "font-noto-sans"} leading-relaxed drop-shadow-md`}
            >
              Get real-time updates on your order status, delivery timeline, and tracking information
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-white/10">
                <Truck className="w-8 h-8 text-white mx-auto mb-3 drop-shadow-md" />
                <div className="text-2xl font-bold text-white drop-shadow-md">24/7</div>
                <div className="text-white text-sm font-medium">Live Tracking</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-white/10">
                <CheckCircle className="w-8 h-8 text-white mx-auto mb-3 drop-shadow-md" />
                <div className="text-2xl font-bold text-white drop-shadow-md">99.9%</div>
                <div className="text-white text-sm font-medium">Delivery Success</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-white/10">
                <Clock className="w-8 h-8 text-white mx-auto mb-3 drop-shadow-md" />
                <div className="text-2xl font-bold text-white drop-shadow-md">2-3</div>
                <div className="text-white text-sm font-medium">Days Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Enhanced Track Order Form */}
        <Card className="mb-8 shadow-lg border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Search className="w-5 h-5 text-[#12d6fa]" />
              Track Your Order
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleTrackOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="orderNumber" className="block text-sm font-semibold text-gray-900">
                    Order Number
                  </label>
                  <OrderNumberInput
                    value={orderNumber}
                    onChange={setOrderNumber}
                    placeholder="ORD-2024-00000"
                    className="w-full border-gray-300 focus:border-[#12d6fa] focus:ring-[#12d6fa]"
                  />
                  <p className="text-xs text-gray-600 font-medium">Format: ORD-2024-00000</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full border-gray-300 focus:border-[#12d6fa] focus:ring-[#12d6fa]"
                  />
                  {isAuthenticated && (
                    <p className="text-xs text-green-700 flex items-center gap-1 font-medium">
                      <User className="w-3 h-3" />
                      Prefilled from your account
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Orders Dropdown for Logged-in Users */}
              {isAuthenticated && recentOrders.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Or select from recent orders
                  </label>
                  <Select onValueChange={(value) => setOrderNumber(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a recent order" />
                    </SelectTrigger>
                    <SelectContent>
                      {recentOrders.map((order) => (
                        <SelectItem key={order.id} value={order.number}>
                          {order.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !orderNumber.trim() || !email.trim()}
                className="w-full bg-[#12d6fa] hover:bg-[#0bc4e8] text-white h-12 text-base font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Tracking Order...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track Order
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && <SkeletonTrack />}

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Tracking Error</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button 
                onClick={() => {
                  setError(null)
                  setTrackingData(null)
                }}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State - When no tracking data and no error */}
        {!trackingData && !error && !isLoading && (
          <div className="text-center py-20">
            <div className="w-40 h-40 bg-gradient-to-br from-[#12d6fa]/30 to-[#0bc4e8]/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Package className="w-20 h-20 text-[#12d6fa]" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Ready to Track Your Order?</h3>
            <p className="text-gray-700 max-w-lg mx-auto mb-10 text-lg font-medium">
              Enter your order number and email address above to get started with real-time tracking updates.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-3 text-base text-gray-700 font-medium">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Real-time updates</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700 font-medium">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Delivery notifications</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700 font-medium">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        )}

        {/* Helpful Information Section */}
        {!trackingData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* How to Track Guide */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-lg">
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Search className="w-5 h-5" />
                  How to Track Your Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 shadow-md">1</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">Find Your Order Number</p>
                      <p className="text-sm text-gray-700 mt-1">Check your email confirmation or account orders page</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 shadow-md">2</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">Enter Your Details</p>
                      <p className="text-sm text-gray-700 mt-1">Use the same email address you used when placing the order</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 shadow-md">3</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">Get Real-Time Updates</p>
                      <p className="text-sm text-gray-700 mt-1">View live tracking, delivery status, and estimated arrival time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Guide */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-lg">
              <CardHeader className="bg-green-600 text-white">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="w-5 h-5" />
                  Order Status Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-600 rounded-full shadow-sm"></div>
                    <span className="text-sm font-semibold text-gray-900">Received</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-600 rounded-full shadow-sm"></div>
                    <span className="text-sm font-semibold text-gray-900">Processing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-600 rounded-full shadow-sm"></div>
                    <span className="text-sm font-semibold text-gray-900">Shipped</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-600 rounded-full shadow-sm"></div>
                    <span className="text-sm font-semibold text-gray-900">Out for Delivery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-600 rounded-full shadow-sm"></div>
                    <span className="text-sm font-semibold text-gray-900">Delivered</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-green-200 rounded-lg border border-green-300">
                  <p className="text-sm text-green-900 font-medium">
                    <strong>Tip:</strong> Orders typically ship within 1-2 business days and arrive in 2-3 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact Support Section */}
        {!trackingData && (
          <Card className="mb-8 bg-gradient-to-r from-[#12d6fa]/10 to-[#0bc4e8]/10 border-[#12d6fa]/30 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-[#12d6fa] rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Need Help?</h3>
                <p className="text-gray-700 max-w-2xl mx-auto text-lg font-medium">
                  Can't find your order or having trouble tracking? Our support team is here to help you 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white font-semibold px-6 py-3 shadow-lg">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Support
                  </Button>
                  <Button variant="outline" className="border-2 border-[#12d6fa] text-[#12d6fa] hover:bg-[#12d6fa] hover:text-white font-semibold px-6 py-3">
                    <Mail className="w-5 h-5 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline" className="border-2 border-[#12d6fa] text-[#12d6fa] hover:bg-[#12d6fa] hover:text-white font-semibold px-6 py-3">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Live Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        {!trackingData && (
          <Card className="mb-8 shadow-lg border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-center text-3xl font-bold text-gray-900">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="border-l-4 border-[#12d6fa] pl-6 py-2 bg-blue-50 rounded-r-lg">
                    <h4 className="font-bold text-gray-900 text-lg">How long does delivery take?</h4>
                    <p className="text-gray-700 mt-2 font-medium">Most orders are delivered within 2-3 business days after shipping.</p>
                  </div>
                  <div className="border-l-4 border-[#12d6fa] pl-6 py-2 bg-blue-50 rounded-r-lg">
                    <h4 className="font-bold text-gray-900 text-lg">Can I change my delivery address?</h4>
                    <p className="text-gray-700 mt-2 font-medium">Address changes can be made before the order ships. Contact support for assistance.</p>
                  </div>
                  <div className="border-l-4 border-[#12d6fa] pl-6 py-2 bg-blue-50 rounded-r-lg">
                    <h4 className="font-bold text-gray-900 text-lg">What if I'm not home during delivery?</h4>
                    <p className="text-gray-700 mt-2 font-medium">The courier will attempt delivery 3 times. After that, you can arrange pickup.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="border-l-4 border-[#12d6fa] pl-6 py-2 bg-blue-50 rounded-r-lg">
                    <h4 className="font-bold text-gray-900 text-lg">How do I get tracking updates?</h4>
                    <p className="text-gray-700 mt-2 font-medium">You'll receive email notifications at each major milestone of your order.</p>
                  </div>
                  <div className="border-l-4 border-[#12d6fa] pl-6 py-2 bg-blue-50 rounded-r-lg">
                    <h4 className="font-bold text-gray-900 text-lg">Can I track without an account?</h4>
                    <p className="text-gray-700 mt-2 font-medium">Yes! Just enter your order number and email address to track any order.</p>
                  </div>
                  <div className="border-l-4 border-[#12d6fa] pl-6 py-2 bg-blue-50 rounded-r-lg">
                    <h4 className="font-bold text-gray-900 text-lg">What if my order is delayed?</h4>
                    <p className="text-gray-700 mt-2 font-medium">We'll notify you of any delays and work to resolve them quickly.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Status Header with Progress */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Order {trackingData.orderId}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated {formatLastUpdated(trackingData.lastUpdated)}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                    {trackingData.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ProgressBar status={trackingData.status} checkpoints={trackingData.checkpoints} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ETA Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5" />
                    Delivery ETA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {formatETA(trackingData.eta)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Updated {formatLastUpdated(trackingData.lastUpdated)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Courier Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="w-5 h-5" />
                    Courier Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{trackingData.carrier.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(trackingData.carrier.trackingUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Track
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Tracking Number:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {trackingData.carrier.trackingNumber}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(trackingData.carrier.trackingNumber)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // Refresh tracking data
                      toast.success("Refreshing tracking information...")
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </Button>
                </CardContent>
              </Card>

              {/* Order Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {trackingData.summary.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                        </div>
                        <SaudiRiyal amount={item.price * item.qty} language={language} />
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <SaudiRiyal amount={trackingData.summary.totals.subtotal} language={language} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <SaudiRiyal amount={trackingData.summary.totals.shipping} language={language} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <SaudiRiyal amount={trackingData.summary.totals.tax} language={language} />
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <SaudiRiyal amount={trackingData.summary.totals.total} language={language} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <Card>
              <CardContent className="p-6">
                <Timeline checkpoints={trackingData.checkpoints} />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Invoice
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}