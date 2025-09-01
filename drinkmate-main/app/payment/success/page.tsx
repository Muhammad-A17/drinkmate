"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Home, ShoppingBag, Receipt } from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { toast } from "sonner"

// Force dynamic rendering for this page since it uses search params
export const dynamic = 'force-dynamic'

// Component that uses search params - needs to be wrapped in Suspense
function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  
  const orderId = searchParams.get('orderId')
  const transactionId = searchParams.get('transaction_id') || searchParams.get('id')

  useEffect(() => {
    // Verify payment status
    const verifyPayment = async () => {
      try {
        if (orderId && transactionId) {
          // Here you would verify the payment with your backend
          // For now, we'll just show success
          setIsLoading(false)
          toast.success("Payment completed successfully!")
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Payment verification error:", error)
        setIsLoading(false)
      }
    }

    verifyPayment()
  }, [orderId, transactionId])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#12d6fa] mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying payment...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your payment has been processed successfully.
        </p>
        
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-semibold text-gray-900">{orderId}</p>
          </div>
        )}
        
        {transactionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Transaction ID</p>
            <p className="font-semibold text-gray-900">{transactionId}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
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
          
          {orderId && (
            <Button
              onClick={() => router.push(`/track-order?orderId=${orderId}`)}
              variant="outline"
              className="w-full"
            >
              <Receipt className="mr-2 w-4 h-4" />
              Track Order
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function PaymentSuccessLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <CheckCircle className="w-8 h-8 text-gray-400" />
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

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <Suspense fallback={<PaymentSuccessLoading />}>
        <PaymentSuccessContent />
      </Suspense>
      
      <Footer />
    </div>
  )
}
