"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { XCircle, Home, ShoppingBag, ArrowLeft } from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

// Force dynamic rendering for this page since it uses search params
export const dynamic = 'force-dynamic'

// Component that uses search params - needs to be wrapped in Suspense
function PaymentCancelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-semibold text-gray-900">{orderId}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/cart")}
            className="w-full bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Return to Cart
          </Button>
          
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            <Home className="mr-2 w-4 h-4" />
            Continue Shopping
          </Button>
          
          <Button
            onClick={() => router.push("/shop")}
            variant="outline"
            className="w-full"
          >
            <ShoppingBag className="mr-2 w-4 h-4" />
            Browse Products
          </Button>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function PaymentCancelLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <XCircle className="w-8 h-8 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <Suspense fallback={<PaymentCancelLoading />}>
        <PaymentCancelContent />
      </Suspense>
      
      <Footer />
    </div>
  )
}
