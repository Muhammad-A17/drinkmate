"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Home, ShoppingBag } from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function OrderSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your order. We've received your payment and will process your order shortly.
            You'll receive an email confirmation with your order details.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-[#12d6fa] hover:bg-[#0bc4e8] text-white py-3 rounded-lg font-semibold"
            >
              <Home className="mr-2 w-4 h-4" />
              Continue Shopping
            </Button>
            
            <Button
              onClick={() => router.push("/shop")}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ShoppingBag className="mr-2 w-4 h-4" />
              Browse More Products
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
