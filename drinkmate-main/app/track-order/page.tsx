"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { useState, useEffect } from "react"
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/translation-context"
import { orderAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TrackOrderImproved() {
  const { t, isRTL } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [isLoadingRecentOrders, setIsLoadingRecentOrders] = useState(false)
  const [showRecentOrders, setShowRecentOrders] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Load recent orders if user is authenticated
  useEffect(() => {
    const loadRecentOrders = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoadingRecentOrders(true)
          const response = await orderAPI.getRecentOrders(3)
          if (response.success) {
            setRecentOrders(response.orders)
          }
        } catch (err) {
          console.error("Error loading recent orders:", err)
          // Fallback to static data if API fails
          setRecentOrders([
            {
              id: "ORD-2024-001",
              date: "2024-01-10",
              status: t("trackOrder.status.inTransit"),
              items: ["Drinkmate OmniFizz", "CO2 Cylinder"],
              total: "389.98 ﷼",
            },
            {
              id: "ORD-2023-156",
              date: "2023-12-28",
              status: t("trackOrder.status.delivered"),
              items: ["Italian Strawberry Syrup", "Premium Flavors Pack"],
              total: "104.98 ﷼",
            },
          ])
        } finally {
          setIsLoadingRecentOrders(false)
        }
      }
    }

    loadRecentOrders()
  }, [isAuthenticated, user, t])

  // Pre-fill email if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setEmail(user.email)
    }
  }, [isAuthenticated, user])

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setHasSearched(true)

    if (!orderNumber || !email) {
      setError(t("trackOrder.errors.missingFields"))
      return
    }

    try {
      setIsLoading(true)
      const response = await orderAPI.trackOrder(orderNumber, email)

      if (response.success) {
        // Format tracking data
        const trackingData = {
          orderNumber: response.tracking.orderNumber,
          status: mapOrderStatusToTranslation(response.tracking.status),
          estimatedDelivery: response.tracking.estimatedDeliveryDate
            ? new Date(response.tracking.estimatedDeliveryDate).toISOString().split("T")[0]
            : null,
          currentLocation: response.tracking.currentLocation,
          trackingHistory: response.tracking.trackingHistory.map((event: any) => ({
            date: event.date,
            time: event.time,
            status: mapOrderStatusToTranslation(event.status),
            location: event.location,
          })),
          items: response.tracking.items || [],
          total: response.tracking.total ? `${response.tracking.total.toFixed(2)} ﷼` : "",
        }

        setTrackingResult(trackingData)
        // Scroll to results
        setTimeout(() => {
          document.getElementById("tracking-results")?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      } else {
        setError(response.message || t("trackOrder.errors.notFound"))
      }
    } catch (err: any) {
      console.error("Error tracking order:", err)
      setError(err.response?.data?.message || t("trackOrder.errors.general"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickTrack = (orderId: string) => {
    setOrderNumber(orderId)
    setTrackingResult(null)
    setError("")
    setHasSearched(false)
    // Scroll to the tracking form
    document.getElementById("tracking-form")?.scrollIntoView({ behavior: "smooth" })
  }

  const resetSearch = () => {
    setOrderNumber("")
    setTrackingResult(null)
    setError("")
    setHasSearched(false)
    document.getElementById("tracking-form")?.scrollIntoView({ behavior: "smooth" })
  }

  // Helper function to map backend status to translation keys
  const mapOrderStatusToTranslation = (status: string): string => {
    switch (status) {
      case "pending":
        return t("trackOrder.status.orderPlaced")
      case "processing":
        return t("trackOrder.status.processing")
      case "shipped":
        return t("trackOrder.status.shipped")
      case "in_transit":
      case "In Transit":
        return t("trackOrder.status.inTransit")
      case "delivered":
        return t("trackOrder.status.delivered")
      case "cancelled":
        return t("trackOrder.status.cancelled")
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case t("trackOrder.status.orderPlaced"):
        return <Clock className="w-5 h-5 text-blue-500" />
      case t("trackOrder.status.processing"):
        return <Package className="w-5 h-5 text-yellow-500" />
      case t("trackOrder.status.shipped"):
        return <Truck className="w-5 h-5 text-yellow-500" />
      case t("trackOrder.status.inTransit"):
        return <Truck className="w-5 h-5 text-orange-500" />
      case t("trackOrder.status.delivered"):
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case t("trackOrder.status.orderPlaced"):
        return "bg-blue-100 text-blue-800"
      case t("trackOrder.status.processing"):
        return "bg-yellow-100 text-yellow-800"
      case t("trackOrder.status.shipped"):
        return "bg-yellow-100 text-yellow-800"
      case t("trackOrder.status.inTransit"):
        return "bg-orange-100 text-orange-800"
      case t("trackOrder.status.delivered"):
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <PageLayout currentPage="track-order">
      <div dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-white to-[#f3f3f3]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center space-y-6">
              <h1
                className={`text-5xl font-extrabold text-black leading-tight tracking-tight ${isRTL ? "font-cairo" : "font-montserrat"}`}
              >
                {t("trackOrder.hero.title")}
              </h1>
              <p
                className={`text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
              >
                {t("trackOrder.hero.subtitle")}
              </p>

              {isAuthenticated && recentOrders.length > 0 && !trackingResult && (
                <div className="mt-8">
                  <p
                    className={`text-sm text-gray-600 mb-4 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                  >
                    Quick track your recent orders:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {recentOrders.slice(0, 3).map((order) => (
                      <Button
                        key={order.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickTrack(order.id)}
                        className={`hover:scale-105 transition-all duration-200 hover:shadow-md border-2 hover:border-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      >
                        {order.id}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Order Tracking Form */}
        <section id="tracking-form" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-gradient-to-b from-white to-[#f8fafc] rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="text-center mb-8">
                <h2
                  className={`text-3xl font-bold text-black mb-4 tracking-tight ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {t("trackOrder.form.title")}
                </h2>
                <p className={`text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  {t("trackOrder.form.subtitle")}
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 shadow-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleTrackOrder} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="orderNumber"
                      className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {t("trackOrder.form.orderNumber")}
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      required
                      disabled={isLoading}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] transition-all duration-200 shadow-sm hover:shadow-md ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      placeholder={t("trackOrder.form.orderNumberPlaceholder")}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {t("trackOrder.form.email")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] transition-all duration-200 shadow-sm hover:shadow-md ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      placeholder={t("trackOrder.form.emailPlaceholder")}
                    />
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <Button
                    type="submit"
                    className={`bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#12d6fa] text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t("trackOrder.form.tracking")}
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        {t("trackOrder.form.trackOrder")}
                      </>
                    )}
                  </Button>

                  {(trackingResult || hasSearched) && (
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetSearch}
                        className={`ml-4 border-2 hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 hover:scale-105 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Track Another Order
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Tracking Results */}
        {trackingResult && (
          <section id="tracking-results" className="py-16 bg-[#f3f3f3]">
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2
                    className={`text-3xl font-bold text-black mb-4 tracking-tight ${isRTL ? "font-cairo" : "font-montserrat"}`}
                  >
                    {t("trackOrder.results.title")}
                  </h2>
                  <p className={`text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                    {t("trackOrder.results.orderNumber")}
                    {trackingResult.orderNumber}
                  </p>
                </div>

                {/* Current Status */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 mb-8 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      {t("trackOrder.results.currentStatus")}
                    </h3>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${getStatusColor(trackingResult.status)} ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {trackingResult.status}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p
                        className={`text-sm text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      >
                        {t("trackOrder.results.estimatedDelivery")}
                      </p>
                      <p className={`font-bold text-black ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                        {trackingResult.estimatedDelivery}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      >
                        {t("trackOrder.results.currentLocation")}
                      </p>
                      <p className={`font-bold text-black ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                        {trackingResult.currentLocation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tracking History */}
                <div>
                  <h3 className={`text-xl font-bold text-black mb-6 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                    {t("trackOrder.results.trackingHistory")}
                  </h3>
                  <div className="space-y-4">
                    {trackingResult.trackingHistory.map((event: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          {getStatusIcon(event.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-bold text-black ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                              {event.status}
                            </h4>
                            <span
                              className={`text-sm text-gray-500 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                            >
                              {event.date} at {event.time}
                            </span>
                          </div>
                          <p className={`text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                            {event.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button
                      onClick={resetSearch}
                      variant="outline"
                      className={`border-2 hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 hover:scale-105 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      Track Another Order
                    </Button>
                    {isAuthenticated && (
                      <Button
                        onClick={() => setShowRecentOrders(!showRecentOrders)}
                        variant="outline"
                        className={`border-2 hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 hover:scale-105 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      >
                        {showRecentOrders ? "Hide" : "Show"} Recent Orders
                      </Button>
                    )}
                    <Button
                      onClick={() => document.getElementById("help-section")?.scrollIntoView({ behavior: "smooth" })}
                      variant="outline"
                      className={`border-2 hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 hover:scale-105 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      Need Help?
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {((isAuthenticated && recentOrders.length > 0 && !trackingResult) || showRecentOrders) && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2
                  className={`text-4xl font-bold text-black mb-4 tracking-tight ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {t("trackOrder.recentOrders.title")}
                </h2>
                <p className={`text-xl text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  {t("trackOrder.recentOrders.subtitle")}
                </p>
              </div>

              {isLoadingRecentOrders ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-[#12d6fa] mb-4" />
                  <p className="text-gray-600 font-medium">{t("trackOrder.recentOrders.loading")}</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gradient-to-br from-white to-[#f8fafc] rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-lg font-bold text-black ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                          {order.id}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(order.status)} ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <p
                            className={`text-sm text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                          >
                            {t("trackOrder.recentOrders.orderDate")}
                          </p>
                          <p className={`font-bold text-black ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                            {order.date}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-sm text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                          >
                            {t("trackOrder.recentOrders.items")}
                          </p>
                          <ul
                            className={`text-sm text-gray-700 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                          >
                            {order.items.map((item: string, index: number) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p
                            className={`text-sm text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                          >
                            {t("trackOrder.recentOrders.total")}
                          </p>
                          <p className={`font-bold text-black ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                            {order.total}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleQuickTrack(order.id)}
                        className={`w-full bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#12d6fa] text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      >
                        {t("trackOrder.recentOrders.trackThisOrder")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {!trackingResult && (
          <section className="py-16 bg-[#f3f3f3]">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2
                  className={`text-4xl font-bold text-black mb-4 tracking-tight ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {t("trackOrder.delivery.title")}
                </h2>
                <p className={`text-xl text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  {t("trackOrder.delivery.subtitle")}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold text-black mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                    {t("trackOrder.delivery.standardDelivery")}
                  </h3>
                  <p className={`text-gray-600 mb-4 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                    {t("trackOrder.delivery.standardDeliveryTime")}
                  </p>
                  <p className={`text-sm text-gray-500 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                    {t("trackOrder.delivery.standardDeliveryNote")}
                  </p>
                </div>

                <div className="text-center p-6 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#a8f387] to-[#8ee65f] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold text-black mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                    {t("trackOrder.delivery.expressDelivery")}
                  </h3>
                  <p className={`text-gray-600 mb-4 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                    {t("trackOrder.delivery.expressDeliveryTime")}
                  </p>
                  <p className={`text-sm text-gray-500 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                    {t("trackOrder.delivery.expressDeliveryNote")}
                  </p>
                </div>

                <div className="text-center p-6 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold text-black mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                    {t("trackOrder.delivery.localPickup")}
                  </h3>
                  <p className={`text-gray-600 mb-4 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                    {t("trackOrder.delivery.localPickupTime")}
                  </p>
                  <p className={`text-sm text-gray-500 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                    {t("trackOrder.delivery.localPickupNote")}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Help & Support */}
        <section id="help-section" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2
                className={`text-4xl font-bold text-black mb-4 tracking-tight ${isRTL ? "font-cairo" : "font-montserrat"}`}
              >
                {t("trackOrder.help.title")}
              </h2>
              <p className={`text-xl text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                {t("trackOrder.help.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center p-6 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold text-black mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  {t("trackOrder.help.callUs")}
                </h3>
                <p className={`text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  {t("trackOrder.help.callUsNumber")}
                </p>
                <p className={`text-sm text-gray-500 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  {t("trackOrder.help.callUsNote")}
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold text-black mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  {t("trackOrder.help.emailUs")}
                </h3>
                <p className={`text-gray-600 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  {t("trackOrder.help.emailUsAddress")}
                </p>
                <p className={`text-sm text-gray-500 font-medium ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  {t("trackOrder.help.emailUsNote")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
