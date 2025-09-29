"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart, CartItem } from "@/lib/contexts/cart-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { orderAPI, shopAPI, co2API } from "@/lib/api"
import paymentService from "@/lib/services/payment-service"
import { toast } from "sonner"
import { CheckCircle, AlertCircle, LockIcon, CreditCard, Loader2, Truck, MapPin, X } from "lucide-react"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getImageUrl } from "@/lib/utils/image-utils"
import TabbyInfoDialog from "@/components/checkout/TabbyInfoDialog"

export default function CheckoutPage() {
  const router = useRouter()
  const { state, clearCart, removeItem, updateQuantity } = useCart()
  const { user } = useAuth()
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTabbyDialog, setShowTabbyDialog] = useState(false)
  
  // Delivery options state
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("standard")
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    district: "",
    city: "",
    country: "Saudi Arabia",
    nationalAddress: ""
  })
  
  // Shipping address (if different from billing)
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    district: "",
    city: "",
    country: "Saudi Arabia",
    nationalAddress: ""
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

  // Validate cart items and remove invalid ones
  const validateCartItems = useCallback(async () => {
    if (state.items.length === 0) return

    const invalidItems: string[] = []
    
    for (const item of state.items) {
      try {
        let isValid = true // Start with valid assumption
        let validationError = ''
        
        // Only validate if we have the necessary IDs
        if (item.productId && item.productType === 'product') {
          try {
            const response = await shopAPI.getProduct(item.productId)
            if (!response.success || !response.product) {
              isValid = false
              validationError = 'Product not found'
            }
          } catch (error) {
            console.error(`Error validating product ${item.name}:`, error)
            // Don't mark as invalid on API error, just log it
            console.warn(`Skipping validation for product ${item.name} due to API error`)
          }
        } 
        else if (item.bundleId && item.productType === 'bundle') {
          try {
            const response = await shopAPI.getBundle(item.bundleId)
            if (!response.success || !response.bundle) {
              isValid = false
              validationError = 'Bundle not found'
            }
          } catch (error) {
            console.error(`Error validating bundle ${item.name}:`, error)
            // Don't mark as invalid on API error, just log it
            console.warn(`Skipping validation for bundle ${item.name} due to API error`)
          }
        } 
        else if (item.productType === 'cylinder') {
          try {
            const response = await co2API.getCylinder(String(item.id))
            if (!response.success || !response.cylinder) {
              isValid = false
              validationError = 'Cylinder not found'
            }
          } catch (error) {
            console.error(`Error validating cylinder ${item.name}:`, error)
            // Don't mark as invalid on API error, just log it
            console.warn(`Skipping validation for cylinder ${item.name} due to API error`)
          }
        }
        // For items without specific productType or ID, assume they're valid
        // This prevents removing items that might be valid but don't have proper IDs
        else if (!item.id) {
          console.warn(`Cart item ${item.name} has no ID - assuming valid for now`)
          isValid = true
        }
        
        // Only mark as invalid if we have a clear validation error
        if (!isValid && validationError) {
          console.log(`Marking item as invalid: ${item.name} (ID: ${item.id}) - ${validationError}`)
          invalidItems.push(String(item.id))
        }
      } catch (error) {
        console.error(`Error validating cart item ${item.name}:`, error)
        // Don't mark as invalid on general errors, just log them
        console.warn(`Skipping validation for item ${item.name} due to error`)
      }
    }
    
    // Only remove items that are definitely invalid
    if (invalidItems.length > 0) {
      console.log(`Removing ${invalidItems.length} invalid items from cart:`, invalidItems)
      invalidItems.forEach(itemId => {
        if (removeItem && typeof removeItem === 'function') {
          removeItem(itemId)
        }
      })
      
      if (toast && typeof toast.error === 'function') {
        toast.error(`${invalidItems.length} item(s) are no longer available and have been removed from your cart.`)
      }
    }
  }, [state.items, removeItem])

  useEffect(() => {
    console.log("Checkout page loaded, cart items:", state.items.length)
    console.log("Cart state:", state)
    console.log("User authentication state:", { user: !!user, userId: user?._id })
    
    // Set loading to false after a short delay
    const loadingTimer = setTimeout(() => {
      setIsPageLoading(false)
    }, 300)

    if (state.items.length === 0) {
      toast.error("Your cart is empty")
      // Don't redirect - let user stay on checkout page
    } else {
      // Skip automatic validation on page load to prevent items from being removed
      // Validation will happen during payment processing instead
      console.log('Cart loaded with items, skipping automatic validation')
    }

    return () => clearTimeout(loadingTimer)
  }, [state.items.length, router, validateCartItems, user])

  // Auto-fetch user data when user is logged in
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
          if (token) {
            // Check if we have cached profile data
            const cachedProfile = localStorage.getItem('user-profile-cache')
            const cacheTimestamp = localStorage.getItem('user-profile-cache-timestamp')
            const now = Date.now()
            const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity
            
            // Use cached data if it's less than 5 minutes old
            if (cachedProfile && cacheAge < 5 * 60 * 1000) {
              try {
                const userProfile = JSON.parse(cachedProfile)
                
                console.log('Using cached profile data:', userProfile)
                console.log('Cached name:', userProfile.name)
                console.log('Cached district:', userProfile.district)
                console.log('Cached city:', userProfile.city)
                console.log('Cached phone:', userProfile.phone)
                
                // Update delivery address with cached data
                const newDeliveryAddress = {
                  fullName: userProfile.name || user.name || "",
                  email: userProfile.email || user.email || "",
                  phone: userProfile.phone || "",
                  district: userProfile.district || "",
                  city: userProfile.city || "",
                  country: "Saudi Arabia",
                  nationalAddress: userProfile.nationalAddress || ""
                }
                
                console.log('Setting delivery address from cache:', newDeliveryAddress)
                setDeliveryAddress(prev => {
                  console.log('Previous delivery address:', prev)
                  const updated = { ...prev, ...newDeliveryAddress }
                  console.log('Updated delivery address:', updated)
                  return updated
                })
                
                // Also set shipping address to same as delivery if user has address data
                if (userProfile.district && userProfile.city) {
                  const newShippingAddress = {
                    fullName: userProfile.name || user.name || "",
                    email: userProfile.email || user.email || "",
                    phone: userProfile.phone || "",
                    district: userProfile.district || "",
                    city: userProfile.city || "",
                    country: "Saudi Arabia",
                    nationalAddress: userProfile.nationalAddress || ""
                  }
                  
                  console.log('Setting shipping address from cache:', newShippingAddress)
                  setShippingAddress(prev => {
                    console.log('Previous shipping address:', prev)
                    const updated = { ...prev, ...newShippingAddress }
                    console.log('Updated shipping address:', updated)
                    return updated
                  })
                }
                return // Use cached data, don't make API call
              } catch (e) {
                console.error('Error parsing cached profile data:', e)
                // If cached data is corrupted, clear it and fetch fresh
                localStorage.removeItem('user-profile-cache')
                localStorage.removeItem('user-profile-cache-timestamp')
              }
            }

            // Fetch user profile data from API
            const profileResponse = await fetch('/api/user/profile', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })

            if (profileResponse.ok) {
              const profileData = await profileResponse.json()
              
              if (profileData.success && profileData.data) {
                const userProfile = profileData.data
                
                // Debug: Log the profile data to see what we're getting
                console.log('Profile data received:', userProfile)
                console.log('Profile name:', userProfile.name)
                console.log('Profile district:', userProfile.district)
                console.log('Profile city:', userProfile.city)
                console.log('Profile phone:', userProfile.phone)
                console.log('Profile email:', userProfile.email)
                console.log('Profile nationalAddress:', userProfile.nationalAddress)
                
                // Cache the profile data
                localStorage.setItem('user-profile-cache', JSON.stringify(userProfile))
                localStorage.setItem('user-profile-cache-timestamp', now.toString())
                
                // Update delivery address with fetched data
                const newDeliveryAddress = {
                  fullName: userProfile.name || user.name || "",
                  email: userProfile.email || user.email || "",
                  phone: userProfile.phone || "",
                  district: userProfile.district || "",
                  city: userProfile.city || "",
                  country: "Saudi Arabia",
                  nationalAddress: userProfile.nationalAddress || ""
                }
                
                console.log('Setting delivery address with:', newDeliveryAddress)
                setDeliveryAddress(prev => {
                  console.log('Previous delivery address:', prev)
                  const updated = { ...prev, ...newDeliveryAddress }
                  console.log('Updated delivery address:', updated)
                  return updated
                })
                
                // Also set shipping address to same as delivery if user has address data
                if (userProfile.district && userProfile.city) {
                  const newShippingAddress = {
                    fullName: userProfile.name || user.name || "",
                    email: userProfile.email || user.email || "",
                    phone: userProfile.phone || "",
                    district: userProfile.district || "",
                    city: userProfile.city || "",
                    country: "Saudi Arabia",
                    nationalAddress: userProfile.nationalAddress || ""
                  }
                  
                  console.log('Setting shipping address with:', newShippingAddress)
                  setShippingAddress(prev => {
                    console.log('Previous shipping address:', prev)
                    const updated = { ...prev, ...newShippingAddress }
                    console.log('Updated shipping address:', updated)
                    return updated
                  })
                }
              }
            } else if (profileResponse.status === 429) {
              // Rate limited - use cached data if available
              console.warn('Rate limited, using cached data if available')
              if (cachedProfile) {
                try {
                  const userProfile = JSON.parse(cachedProfile)
                  setDeliveryAddress(prev => ({
                    ...prev,
                    fullName: userProfile.name || user.name || "",
                    email: userProfile.email || user.email || "",
                    phone: userProfile.phone || "",
                    district: userProfile.district || "",
                    city: userProfile.city || "",
                    country: "Saudi Arabia",
                    nationalAddress: userProfile.nationalAddress || ""
                  }))
                } catch (e) {
                  // Fallback to basic user data
                  setDeliveryAddress(prev => ({
                    ...prev,
                    fullName: user.name || "",
                    email: user.email || "",
                    phone: (user as any)?.phone || "",
                    district: (user as any)?.district || "",
                    city: (user as any)?.city || "",
                    country: "Saudi Arabia",
                    nationalAddress: (user as any)?.nationalAddress || ""
                  }))
                }
              }
            }
          } else {
            // Fallback to basic user data if no token
            setDeliveryAddress(prev => ({
              ...prev,
              fullName: user.name || "",
              email: user.email || "",
              phone: (user as any)?.phone || ""
            }))
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Fallback to basic user data
          setDeliveryAddress(prev => ({
            ...prev,
            fullName: user.name || "",
            email: user.email || "",
            phone: (user as any)?.phone || ""
          }))
        }
      }
    }

    fetchUserData()
  }, [user])

  // Payment provider configuration (would come from admin panel)
  const paymentProviders = {
    card: {
      name: "Credit/Debit Card",
      description: "Pay securely by credit or debit card through URWAYS payment gateway.",
      logo: "/images/payment-logos/urways-payment.png",
      gateway: "urways"
    },
    tabby: {
      name: "tabby",
      description: "Divide it by 4. Without any interest or fees.",
      logo: "/images/payment-logos/tabby.png",
      gateway: "tabby"
    }
  }

  const handleAddressChange = (field: string, value: string) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleShippingAddressChange = (field: string, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    // Validate main address
    if (!deliveryAddress.fullName || !deliveryAddress.phone || 
        !deliveryAddress.district || !deliveryAddress.city) {
      toast.error("Please fill in all required fields")
      return false
    }

    // For guest users, also validate email
    if (!user && !deliveryAddress.email) {
      toast.error("Please provide your email address")
        return false
      }

    // Validate shipping address if different
    if (shipToDifferentAddress) {
      if (!shippingAddress.fullName || !shippingAddress.phone || 
          !shippingAddress.district || !shippingAddress.city) {
        toast.error("Please fill in all required shipping address fields")
        return false
      }
      
      // For guest users, also validate shipping email
      if (!user && !shippingAddress.email) {
        toast.error("Please provide email for shipping address")
        return false
      }
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions")
      return false
    }

    return true
  }

  // Validate products before checkout
  const validateProducts = useCallback(async (items: CartItem[]) => {
    const validationErrors: string[] = []
    
    console.log('Validating cart items:', items.map(item => ({
      id: item.id,
      name: item.name,
      productId: item.productId,
      bundleId: item.bundleId,
      productType: item.productType
    })))
    
    for (const item of items) {
      try {
        let isValid = false
        
        // Check if it's a product with productId
        if (item.productId && item.productType === 'product') {
          const response = await shopAPI.getProduct(item.productId)
          isValid = response.success && response.product
        }
        // Check if it's a bundle with bundleId
        else if (item.bundleId && item.productType === 'bundle') {
          try {
            const response = await shopAPI.getBundle(item.bundleId)
            isValid = response.success && response.bundle
          } catch (error) {
            console.error(`Error validating bundle ${item.name}:`, error)
            isValid = false
          }
        }
        // Check if it's a cylinder
        else if (item.productType === 'cylinder') {
          const response = await co2API.getCylinder(String(item.id))
          isValid = response.success && response.cylinder
        }
        // For items without specific productType, try to validate using the item ID
        else if (item.id) {
          // Try to validate as a regular product first
          try {
            const productResponse = await shopAPI.getProduct(String(item.id))
            if (productResponse.success && productResponse.product) {
              isValid = true
            } else {
              // Try to validate as a bundle
              const bundleResponse = await shopAPI.getBundle(String(item.id))
              if (bundleResponse.success && bundleResponse.bundle) {
                isValid = true
              } else {
                // Try to validate as a cylinder
                const cylinderResponse = await co2API.getCylinder(String(item.id))
                isValid = cylinderResponse.success && cylinderResponse.cylinder
              }
            }
          } catch (error) {
            console.error(`Error validating item ${item.name} with ID ${item.id}:`, error)
            isValid = false
          }
        }
        // If item has no ID, consider it invalid
        else {
          console.warn(`Cart item ${item.name} has no valid ID for validation`)
          isValid = false
        }
        
        if (!isValid) {
          validationErrors.push(`"${item.name}" is no longer available`)
        }
      } catch (error) {
        console.error(`Error validating ${item.name}:`, error)
        validationErrors.push(`Unable to verify availability of "${item.name}"`)
      }
    }
    
    return validationErrors
  }, [])

  const handlePayment = async () => {
    if (!validateForm()) return
    
    setIsProcessing(true)
    
    try {
      // First validate all products
      console.log('Validating products before checkout...')
      const validationErrors = await validateProducts(state.items)
      
      if (validationErrors.length > 0) {
        if (toast && typeof toast.error === 'function') {
          toast.error(`Some items are no longer available:\n${validationErrors.join('\n')}`)
        }
        setIsProcessing(false)
        return
      }

      // Create the order
      const orderData = {
        items: state.items.map((item: CartItem) => {
          // Map cart items to the format expected by the backend
          const orderItem: any = {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
            image: item.image,
            color: item.color,
            sku: item.sku
          }
          
          // Add either product or bundle ID based on item type
          if (item.productId && item.productType === 'product') {
            orderItem.product = item.productId
          } else if (item.bundleId && item.productType === 'bundle') {
            orderItem.bundle = item.bundleId
          } else if (item.id) {
            // Fallback: use the item ID as product ID if no specific type is set
            orderItem.product = item.id
          }
          
          return orderItem
        }),
        shippingAddress: shipToDifferentAddress ? shippingAddress : deliveryAddress,
        billingAddress: deliveryAddress,
        shipToDifferentAddress: shipToDifferentAddress,
        orderNotes: orderNotes,
        paymentMethod: paymentProviders[selectedPaymentMethod as keyof typeof paymentProviders].gateway,
        deliveryOption: selectedDeliveryOption,
        subtotal: subtotal,
        shippingCost: shippingCost,
        tax: tax,
        total: total
      }

      // Create order via API (authenticated or guest)
      let orderResponse
      if (user && user._id) {
        // Authenticated user
        orderResponse = await orderAPI.createOrder(orderData)
      } else {
        // Guest user - add guest information
        const guestOrderData = {
          ...orderData,
          guestEmail: deliveryAddress.email,
          guestName: deliveryAddress.fullName
        }
        orderResponse = await orderAPI.createGuestOrder(guestOrderData)
      }
      
      if (!orderResponse.success) {
        console.error('Order creation failed:', orderResponse)
        
        // Handle specific error cases
        if (orderResponse.code === 'PRODUCT_NOT_FOUND') {
          toast.error(`Product is no longer available. Please refresh your cart and try again.`)
          // Refresh the page to reload cart data
          window.location.reload()
          return
        }
        
        if (orderResponse.code === 'BUNDLE_NOT_FOUND') {
          toast.error(`Bundle is no longer available. Please refresh your cart and try again.`)
          // Refresh the page to reload cart data
          window.location.reload()
          return
        }
        
        toast.error(orderResponse.message || "Failed to create order")
        return
      }

      // Validate customer data before payment
      const customerName = deliveryAddress.fullName || 'Customer'
      const customerEmail = deliveryAddress.email
      
      if (!customerEmail) {
        toast.error("Customer email is required for payment")
        setIsProcessing(false)
        return
      }
      
      if (!customerName || customerName === 'Customer') {
        toast.error("Customer name is required for payment")
        setIsProcessing(false)
        return
      }

      // Now process payment
      const paymentRequest = {
        amount: total,
        currency: 'SAR',
        orderId: orderResponse.orderId || `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerEmail: customerEmail,
        customerName: customerName,
        description: `DrinkMate Order - ${state.itemCount} items`,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      }

      // Get the selected payment gateway
      const selectedGateway = paymentProviders[selectedPaymentMethod as keyof typeof paymentProviders].gateway

      let paymentResponse: any
      if (selectedGateway === "urways") {
        // Call backend API for URWAYS (uses backend .env file)
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://drinkmates.onrender.com'
        console.log('🚀 Sending URWAYS payment request to backend:', paymentRequest)
        paymentResponse = await fetch(`${backendUrl}/payments/urways/guest`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentRequest)
        })
        
        console.log('🚀 URWAYS payment response status:', paymentResponse.status, paymentResponse.statusText)
      } else if (selectedGateway === "tabby") {
        // Call backend API for Tabby
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://drinkmates.onrender.com'
        paymentResponse = await fetch(`${backendUrl}/payments/tabby`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null}`
          },
          body: JSON.stringify(paymentRequest)
        })
      } else if (selectedGateway === "tap") {
        // Call backend API for Tap
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://drinkmates.onrender.com'
        paymentResponse = await fetch(`${backendUrl}/payments/tap`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null}`
          },
          body: JSON.stringify(paymentRequest)
        })
      } else {
        // Fallback to payment service for other gateways
        paymentResponse = await paymentService.processTapPayment(paymentRequest)
        // Convert to Response-like object for consistency
        paymentResponse = {
          json: () => Promise.resolve(paymentResponse)
        }
      }

      const paymentData = await paymentResponse.json()
      console.log('🚀 Payment response data:', paymentData)

      if (paymentData.success && paymentData.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = paymentData.paymentUrl
      } else {
        console.error('🚀 Payment failed:', paymentData)
        console.error('🚀 URWAYS Response Details:', paymentData.response)
        console.error('🚀 Response Code:', paymentData.responseCode)
        console.error('🚀 Backend Error Data:', paymentData.data)
        const errorMessage = paymentData.message || paymentData.error || paymentData.data?.message || "Payment initiation failed"
        toast.error(errorMessage)
        console.error('🚀 Full error response:', paymentData)
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
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Streamlined Delivery Address Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl px-6 pt-6 pb-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Delivery Information
            </h2>
            
            <div className="space-y-6">
              {/* Full Name Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={deliveryAddress.fullName}
                  onChange={(e) => handleAddressChange("fullName", e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] text-lg"
                  placeholder="Full Name"
                  required
                />
              </div>

              {/* Country (Read-only) */}
                 <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <div className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                  Saudi Arabia
                </div>
              </div>

              {/* District and City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                   <input
                     type="text"
                    value={deliveryAddress.district}
                    onChange={(e) => handleAddressChange("district", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] text-lg"
                    placeholder="District"
                     required
                   />
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                   <input
                     type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] text-lg"
                    placeholder="City"
                     required
                   />
                 </div>
              </div>
              
              {/* National Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Address (<a href="https://splonline.com.sa/en/national-address-1/" target="_blank" rel="noopener noreferrer" className="text-[#12d6fa] hover:text-[#0bc4e8] underline">National Address</a>) (optional)
                </label>
                 <input
                  type="text"
                  value={deliveryAddress.nationalAddress}
                  onChange={(e) => handleAddressChange("nationalAddress", e.target.value.toUpperCase())}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] text-lg font-mono tracking-wider"
                  placeholder="JESA3591"
                  maxLength={8}
                  pattern="[A-Z]{4}[0-9]{4}"
                />
                <p className="text-xs text-gray-500 mt-1">Format: 4 letters followed by 4 numbers (e.g., JESA3591)</p>
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                 <input
                   type="tel"
                   value={deliveryAddress.phone}
                   onChange={(e) => handleAddressChange("phone", e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] text-lg"
                  placeholder="Phone Number"
                   required
                 />
              </div>
              
              {/* Email - Only for guest users */}
              {!user ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={deliveryAddress.email}
                    onChange={(e) => handleAddressChange("email", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] text-lg"
                    placeholder="Email Address"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 flex items-center">
                    <span>{deliveryAddress.email}</span>
                    <span className="ml-2 text-xs text-gray-500">(from your account)</span>
                  </div>
                </div>
              )}

              {/* Ship to Different Address Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="shipToDifferentAddress"
                  checked={shipToDifferentAddress}
                  onChange={(e) => setShipToDifferentAddress(e.target.checked)}
                  className="w-5 h-5 text-[#12d6fa] border-gray-300 rounded focus:ring-[#12d6fa]"
                />
                <label htmlFor="shipToDifferentAddress" className="text-sm font-medium text-gray-700">
                  Ship to a different address?
                </label>
              </div>

              {/* Shipping Address Fields (Conditional) */}
              {shipToDifferentAddress && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                 <input
                   type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleShippingAddressChange("fullName", e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                      placeholder="Full Name"
                   required
                 />
              </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                 <input
                   type="text"
                        value={shippingAddress.district}
                        onChange={(e) => handleShippingAddressChange("district", e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                        placeholder="District"
                        required
                 />
              </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                   <input
                     type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleShippingAddressChange("city", e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                     placeholder="City"
                     required
                   />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Address (<a href="https://splonline.com.sa/en/national-address-1/" target="_blank" rel="noopener noreferrer" className="text-[#12d6fa] hover:text-[#0bc4e8] underline">National Address</a>) (optional)
                    </label>
                   <input
                     type="text"
                      value={shippingAddress.nationalAddress}
                      onChange={(e) => handleShippingAddressChange("nationalAddress", e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] font-mono tracking-wider"
                      placeholder="JESA3591"
                      maxLength={8}
                      pattern="[A-Z]{4}[0-9]{4}"
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: 4 letters followed by 4 numbers (e.g., JESA3591)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleShippingAddressChange("phone", e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                      placeholder="Phone Number"
                     required
                   />
                 </div>
                  {/* Email - Only for guest users */}
                  {!user ? (
                 <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                   <input
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleShippingAddressChange("email", e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                        placeholder="Email Address"
                     required
                   />
                 </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 flex items-center">
                        <span>{shippingAddress.email}</span>
                        <span className="ml-2 text-xs text-gray-500">(from your account)</span>
              </div>
            </div>
                  )}
                </div>
              )}

              {/* Order Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order notes (optional)</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] text-lg"
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Combined Order Summary and Payment Method Card */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-lg self-start">
            {/* Order Summary Section */}
            <div className="mb-8 self-start">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              {/* Headers */}
              <div className="grid grid-cols-12 gap-4 mb-4 pb-2 border-b border-gray-200">
                <div className="col-span-1"></div>
                <div className="col-span-6 text-sm font-medium text-gray-600">Product</div>
                <div className="col-span-2 text-sm font-medium text-gray-600 text-center">Quantity</div>
                <div className="col-span-3 text-sm font-medium text-gray-600 text-right">Price</div>
              </div>
              
              {/* Cart Items */}
              <div className="space-y-0 mb-6">
                {state.items.map((item: CartItem, index: number) => (
                  <div key={item.id}>
                    <div className="grid grid-cols-12 gap-4 items-center py-4">
                      {/* Remove Button */}
                      <div className="col-span-1">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                          aria-label="Remove item"
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                      
                      {/* Product Image and Name - Increased Image Size */}
                      <div className="col-span-6 flex items-center space-x-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          {(() => {
                            const imageUrl = getImageUrl(item.image, '/placeholder.svg')
                            console.log('Checkout - item data:', item)
                            console.log('Checkout - original image:', item.image)
                            console.log('Checkout - processed image:', imageUrl)
                            
                            return imageUrl !== '/placeholder.svg' ? (
                        <Image
                                src={imageUrl} 
                          alt={item.name}
                                fill 
                                className="object-contain" 
                                onError={() => console.log('Checkout image error:', imageUrl)}
                                onLoad={() => console.log('Checkout image loaded:', imageUrl)}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-xs text-gray-400">No Image</span>
                              </div>
                            )
                          })()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        </div>
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-2 text-center">
                        <span className="text-sm text-gray-600">×{item.quantity}</span>
                      </div>
                      
                      {/* Price - Increased Font Size */}
                      <div className="col-span-3 text-right">
                        <span className="text-lg font-semibold text-gray-900">
                          <SaudiRiyal amount={item.price * item.quantity} />
                        </span>
                      </div>
                    </div>
                    
                    {/* Light Separator Line - Only if not last item */}
                    {index < state.items.length - 1 && (
                      <div className="border-b border-gray-200"></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Separator Line */}
              <div className="border-t border-gray-200 mb-6"></div>
              
              {/* Subtotal */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">
                  <SaudiRiyal amount={subtotal} />
                </span>
            </div>

              {/* Shipping Cost */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Shipping Cost</span>
                <span className="text-sm font-medium text-gray-900">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    <SaudiRiyal amount={shippingCost} />
                  )}
                </span>
              </div>
              
              {/* Total */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  <SaudiRiyal amount={total} />
                </span>
              </div>
              
              {/* Tax Included Note */}
              <div className="text-xs text-gray-500 text-right">
                Tax included
              </div>
            </div>

            {/* Enhanced Payment Method Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                {/* Card Payment Option - First */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedPaymentMethod === "card"
                      ? "border-[#12d6fa] bg-[#12d6fa]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPaymentMethod("card")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={selectedPaymentMethod === "card"}
                          onChange={() => setSelectedPaymentMethod("card")}
                          className="w-4 h-4 text-[#12d6fa] border-gray-300 focus:ring-[#12d6fa]"
                          aria-label="Credit Card payment method"
                        />
                        <span className="text-lg font-semibold text-gray-900">{paymentProviders.card.name}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 h-8 bg-white rounded flex items-center justify-center border border-gray-200">
                        <Image
                            src={paymentProviders.card.logo}
                            alt="Payment methods"
                            width={120}
                            height={30}
                          className="object-contain"
                        />
                      </div>
                        </div>
                      </div>
                    </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {paymentProviders.card.description}
                    </p>
                  </div>
                </div>

                {/* Tabby Payment Option - Second */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 relative ${
                    selectedPaymentMethod === "tabby"
                      ? "border-[#12d6fa] bg-[#12d6fa]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPaymentMethod("tabby")}
                >
                  {/* New Badge */}
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    NEW
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment"
                          value="tabby"
                          aria-label="Tabby payment method"
                          checked={selectedPaymentMethod === "tabby"}
                          onChange={() => setSelectedPaymentMethod("tabby")}
                          className="w-4 h-4 text-[#12d6fa] border-gray-300 focus:ring-[#12d6fa]"
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-8 bg-white rounded flex items-center justify-center border border-gray-200">
                        <Image
                              src={paymentProviders.tabby.logo}
                              alt="Tabby"
                              width={70}
                              height={28}
                          className="object-contain"
                        />
                      </div>
                          <span className="text-lg font-semibold text-gray-900">Tabby</span>
                      </div>
                    </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 font-medium">Divide it by 4. Without any interest or fees.</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowTabbyDialog(true)
                          }}
                          className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                        >
                          <span className="text-white text-xs font-bold">i</span>
                        </button>
                  </div>
                </div>
              </div>
              
                  {/* Tabby Benefits */}
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium">No interest</span>
                    </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium">No fees</span>
                    </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium">Pay later</span>
                      </div>
                      </div>
                      </div>
                    </div>
                  </div>
            </div>

            {/* Terms and Conditions */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{" "}
                  <a href="/privacy-policy" className="text-[#12d6fa] hover:underline">
                    privacy policy
                  </a>
                  .
                </p>
                
                <div className="flex items-start space-x-3">
                      <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 text-[#12d6fa] border-gray-300 rounded focus:ring-[#12d6fa] mt-1"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I have read and agree to the website{" "}
                    <a href="/terms-of-service" className="text-[#12d6fa] hover:underline">
                      terms and conditions
                    </a>{" "}
                    *
                  </label>
                      </div>
                  </div>
                </div>
                
              {/* Order button - works for both authenticated and guest users */}
              <div className="w-full mt-6">
                {!user || !user._id ? (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-blue-800 text-sm">
                        You're checking out as a guest. You can also{" "}
                        <button
                          onClick={() => router.push('/login?redirect=/checkout')}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          log in
                        </button>{" "}
                        for faster checkout next time.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 text-sm">
                        Logged in as {user.name || user.email}
                      </span>
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !agreedToTerms}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* Tabby Info Dialog */}
      <TabbyInfoDialog
        isOpen={showTabbyDialog}
        onClose={() => setShowTabbyDialog(false)}
        orderTotal={total}
      />
    </div>
  )
}

