"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { orderAPI } from "@/lib/api"
import paymentService from "@/lib/payment-service"
import { toast } from "sonner"
import { CheckCircle, AlertCircle, LockIcon, CreditCard, Loader2, Truck, MapPin } from "lucide-react"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function CheckoutPage() {
  const router = useRouter()
  const { state, clearCart } = useCart()
  const { user } = useAuth()
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("urways")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  // Card details state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: ""
  })
  
  // Delivery options state
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("standard")
  const [deliveryAddress, setDeliveryAddress] = useState({
    firstName: (user as any)?.firstName || "",
    lastName: (user as any)?.lastName || "",
    email: user?.email || "",
    phone: (user as any)?.phone || "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Saudi Arabia"
  })

  // Calculate delivery costs based on Aramex options
  const getDeliveryCost = () => {
    switch (selectedDeliveryOption) {
      case "express":
        return 75
      case "standard":
        return subtotal >= 150 ? 0 : 50
      case "economy":
        return 25
      default:
        return subtotal >= 150 ? 0 : 50
    }
  }

  const subtotal = state.total
  const shippingCost = getDeliveryCost()
  const tax = subtotal * 0.15
  const total = subtotal + shippingCost + tax

  useEffect(() => {
    console.log("Checkout page loaded, cart items:", state.items.length)
    console.log("Cart state:", state)
    
    // Set loading to false after a short delay
    const loadingTimer = setTimeout(() => {
      setIsPageLoading(false)
    }, 300)

    if (state.items.length === 0) {
      toast.error("Your cart is empty")
      // Don't redirect - let user stay on checkout page
    }

    return () => clearTimeout(loadingTimer)
  }, [state.items.length, router])

  const handleCardDetailsChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!deliveryAddress.firstName || !deliveryAddress.lastName || !deliveryAddress.email || 
        !deliveryAddress.phone || !deliveryAddress.address1 || !deliveryAddress.city || 
        !deliveryAddress.state || !deliveryAddress.postalCode) {
      toast.error("Please fill in all required delivery address fields")
      return false
    }

    if (selectedPaymentMethod === "urways" || selectedPaymentMethod === "tap") {
      if (!cardDetails.cardNumber || !cardDetails.cardholderName || 
          !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv) {
        toast.error("Please fill in all card details")
        return false
      }
    }

    return true
  }

  const handlePayment = async () => {
    if (!validateForm()) return
    
    setIsProcessing(true)
    
    try {
      // First create the order
      const orderData = {
        items: state.items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: deliveryAddress,
        paymentMethod: selectedPaymentMethod === "urways" ? "urways" : "tap_payment",
        deliveryOption: selectedDeliveryOption,
        cardDetails: selectedPaymentMethod === "urways" || selectedPaymentMethod === "tap" ? cardDetails : null,
        subtotal: subtotal,
        shippingCost: shippingCost,
        tax: tax,
        total: total
      }

      // Create order via API
      const orderResponse = await orderAPI.createOrder(orderData)
      
      if (!orderResponse.success) {
        toast.error(orderResponse.message || "Failed to create order")
        return
      }

      // Now process payment
      const paymentRequest = {
        amount: total,
        currency: 'SAR',
        orderId: orderResponse.orderId || `ORDER-${Date.now()}`,
        customerEmail: deliveryAddress.email,
        customerName: `${deliveryAddress.firstName} ${deliveryAddress.lastName}`,
        description: `DrinkMate Order - ${state.itemCount} items`,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      }

      let paymentResponse
      if (selectedPaymentMethod === "urways") {
        // Call backend API directly
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
        paymentResponse = await fetch(`${backendUrl}/payments/urways`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          },
          body: JSON.stringify(paymentRequest)
        })
      } else {
        // For Tap, use the payment service
        paymentResponse = await paymentService.processTapPayment(paymentRequest)
        // Convert to Response-like object for consistency
        paymentResponse = {
          json: () => Promise.resolve(paymentResponse)
        }
      }

      const paymentData = await paymentResponse.json()

      if (paymentData.success && paymentData.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = paymentData.paymentUrl
      } else {
        toast.error(paymentData.error || "Payment initiation failed")
      }
      
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Show loading screen while page initializes
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#12d6fa]" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Show empty cart message if no items
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Please add items to your cart before checkout</p>
          <Button 
            onClick={() => router.push("/shop")}
            className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
             <div className="max-w-6xl mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
         
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Delivery Address */}
           <div className="bg-white rounded-2xl p-6 shadow-lg">
             <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
               <MapPin className="w-6 h-6" />
               Delivery Address
             </h2>
             
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                   <input
                     type="text"
                     value={deliveryAddress.firstName}
                     onChange={(e) => handleAddressChange("firstName", e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                     aria-label="First Name"
                     placeholder="First Name"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                   <input
                     type="text"
                     value={deliveryAddress.lastName}
                     onChange={(e) => handleAddressChange("lastName", e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                     aria-label="Last Name"
                     placeholder="Last Name"
                     required
                   />
                 </div>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                 <input
                   type="email"
                   value={deliveryAddress.email}
                   onChange={(e) => handleAddressChange("email", e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                   aria-label="Email"
                   placeholder="Email"
                   required
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                 <input
                   type="tel"
                   value={deliveryAddress.phone}
                   onChange={(e) => handleAddressChange("phone", e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                   aria-label="Phone"
                   placeholder="Phone"
                   required
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                 <input
                   type="text"
                   value={deliveryAddress.address1}
                   onChange={(e) => handleAddressChange("address1", e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                   aria-label="Address Line 1"
                   placeholder="Address Line 1"
                   required
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                 <input
                   type="text"
                   value={deliveryAddress.address2}
                   onChange={(e) => handleAddressChange("address2", e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                   aria-label="Address Line 2"
                   placeholder="Address Line 2 (optional)"
                 />
               </div>
               
               <div className="grid grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                   <input
                     type="text"
                     value={deliveryAddress.city}
                     onChange={(e) => handleAddressChange("city", e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                     aria-label="City"
                     placeholder="City"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                   <input
                     type="text"
                     value={deliveryAddress.state}
                     onChange={(e) => handleAddressChange("state", e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                     aria-label="State"
                     placeholder="State"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                   <input
                     type="text"
                     value={deliveryAddress.postalCode}
                     onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                     aria-label="Postal Code"
                     placeholder="Postal Code"
                     required
                   />
                 </div>
               </div>
             </div>
           </div>

           {/* Order Summary */}
           <div className="bg-white rounded-2xl p-6 shadow-lg">
             <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
             
             <div className="space-y-4">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-600">Subtotal ({state.itemCount} items)</span>
                 <span className="font-medium"><SaudiRiyal amount={subtotal} /></span>
                     </div>
               
               <div className="flex justify-between text-sm">
                 <span className="text-gray-600">
                   {selectedDeliveryOption === "express" ? "Express Delivery (Aramex)" :
                    selectedDeliveryOption === "economy" ? "Economy Delivery (Aramex)" :
                    "Standard Delivery (Aramex)"}
                 </span>
                 <span className="font-medium">
                   {shippingCost === 0 ? (
                     <span className="text-green-600">FREE</span>
                   ) : (
                     <SaudiRiyal amount={shippingCost} />
                   )}
                 </span>
               </div>

               <div className="flex justify-between text-sm">
                 <span className="text-gray-600">Tax (15% VAT)</span>
                 <span className="font-medium"><SaudiRiyal amount={tax} /></span>
               </div>

               <div className="border-t border-gray-200 pt-4">
                 <div className="flex justify-between text-lg font-bold">
                   <span>Total</span>
                   <span><SaudiRiyal amount={total} /></span>
                 </div>
               </div>
             </div>

             <div className="mt-6 space-y-3 text-sm text-gray-600">
               <div className="flex items-center gap-2">
                 <Truck className="w-4 h-4" />
                 <p>Delivery by Aramex</p>
               </div>
               <div className="flex items-center gap-2">
                 <LockIcon className="w-4 h-4" />
                 <p>Secure payment via {selectedPaymentMethod === "urways" ? "Urways" : "Tap Payment"}</p>
               </div>
             </div>
           </div>

           {/* Payment Methods */}
           <div className="bg-white rounded-2xl p-6 shadow-lg">
             <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
            
            {/* Urways - Priority */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 mb-4 ${
                selectedPaymentMethod === "urways"
                  ? "border-[#12d6fa] bg-[#12d6fa]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedPaymentMethod("urways")}
            >
              <div className="flex items-center justify-between">
                                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-8 rounded flex items-center justify-center">
                     <Image
                       src="/images/payment-logos/urways-logo.svg"
                       alt="Urways"
                       width={48}
                       height={32}
                       className="object-contain"
                     />
                   </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">Urways</h3>
                      <span className="bg-[#12d6fa] text-white text-xs px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Secure payment gateway with instant processing</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedPaymentMethod === "urways"
                    ? "border-[#12d6fa] bg-[#12d6fa]"
                    : "border-gray-300"
                }`}>
                  {selectedPaymentMethod === "urways" && (
                    <div className="w-full h-full rounded-full bg-[#12d6fa] flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tap Payment */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedPaymentMethod === "tap"
                  ? "border-[#12d6fa] bg-[#12d6fa]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedPaymentMethod("tap")}
            >
              <div className="flex items-center justify-between">
                                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-8 rounded flex items-center justify-center">
                     <Image
                       src="/images/payment-logos/tap-logo.svg"
                       alt="Tap Payment"
                       width={48}
                       height={32}
                       className="object-contain"
                     />
                   </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Tap Payment</h3>
                    <p className="text-sm text-gray-600">Fast and secure digital payments</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedPaymentMethod === "tap"
                    ? "border-[#12d6fa] bg-[#12d6fa]"
                    : "border-gray-300"
                }`}>
                  {selectedPaymentMethod === "tap" && (
                    <div className="w-full h-full rounded-full bg-[#12d6fa] flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
                         </div>

             {/* Card Details Form */}
             {(selectedPaymentMethod === "urways" || selectedPaymentMethod === "tap") && (
               <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                   <CreditCard className="w-5 h-5" />
                   Card Details
                 </h3>
                 
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                     <input
                       type="text"
                       value={cardDetails.cardNumber}
                       onChange={(e) => handleCardDetailsChange("cardNumber", e.target.value)}
                       placeholder="1234 5678 9012 3456"
                       maxLength={19}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                       required
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                     <input
                       type="text"
                       value={cardDetails.cardholderName}
                       onChange={(e) => handleCardDetailsChange("cardholderName", e.target.value)}
                       placeholder="John Doe"
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                       required
                     />
                   </div>
                   
                   <div className="grid grid-cols-3 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                       <select
                         value={cardDetails.expiryMonth}
                         onChange={(e) => handleCardDetailsChange("expiryMonth", e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                         aria-label="Expiry Month"
                         required
                       >
                         <option value="">MM</option>
                         {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                           <option key={month} value={month.toString().padStart(2, '0')}>
                             {month.toString().padStart(2, '0')}
                           </option>
                         ))}
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                       <select
                         value={cardDetails.expiryYear}
                         onChange={(e) => handleCardDetailsChange("expiryYear", e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                         aria-label="Expiry Year"
                         required
                       >
                         <option value="">YYYY</option>
                         {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                           <option key={year} value={year}>
                             {year}
                           </option>
                         ))}
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                       <input
                         type="text"
                         value={cardDetails.cvv}
                         onChange={(e) => handleCardDetailsChange("cvv", e.target.value)}
                         placeholder="123"
                         maxLength={4}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                         required
                       />
                     </div>
                   </div>
                 </div>
               </div>
             )}

             <Button
               onClick={handlePayment}
               disabled={isProcessing}
               className="w-full mt-6 bg-[#12d6fa] hover:bg-[#0bc4e8] text-white py-3 rounded-lg font-semibold disabled:opacity-50"
             >
               {isProcessing ? (
                 <>
                   <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                   Processing Payment...
                 </>
               ) : (
                 <>
                   <LockIcon className="mr-2 w-4 h-4" />
                   Pay <SaudiRiyal amount={total} />
                 </>
               )}
             </Button>
           </div>

        </div>
      </div>
      
      <Footer />
    </div>
  )
}
