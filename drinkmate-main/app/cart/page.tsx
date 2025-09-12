"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Truck, CheckCircle, AlertCircle, ShoppingCart, LockIcon, Gift, Tag } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Banner from "@/components/layout/Banner"
import { toast } from "sonner"
import { fmt } from "@/lib/money"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import FreeShippingBar from "@/components/cart/FreeShippingBar"
import CartLineItem from "@/components/cart/CartLineItem"
import OrderSummary from "@/components/cart/OrderSummary"

type RecommendedItem = {
  id: number
  name: string
  price: number
  originalPrice: number
  image: string
  reviews: number
  rating: number // 0-5
}

const recommended: RecommendedItem[] = [
  {
    id: 1,
    name: "Italian Cherry Cola Flavor",
    price: 45.0,
    originalPrice: 60.0,
    image: "/images/italian-strawberry-lemon-syrup.png",
    reviews: 450,
    rating: 5,
  },
  {
    id: 2,
    name: "Italian Energy Drink Flavor",
    price: 45.0,
    originalPrice: 60.0,
    image: "/images/italian-strawberry-lemon-syrup.png",
    reviews: 380,
    rating: 4.8,
  },
  {
    id: 3,
    name: "Italian Peach Flavor",
    price: 45.0,
    originalPrice: 60.0,
    image: "/images/italian-strawberry-lemon-syrup.png",
    reviews: 520,
    rating: 4.9,
  },
  {
    id: 4,
    name: "CO2 Cylinder Refill",
    price: 55.0,
    originalPrice: 75.0,
    image: "/images/co2-cylinder-single.png",
    reviews: 1200,
    rating: 4.7,
  },
]

export default function CartPage() {
  const router = useRouter()
  const { state, updateQuantity, removeItem, addItem, clearCart } = useCart()
  const [packingInstructions, setPackingInstructions] = useState("")
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false)
  const [savedItems, setSavedItems] = useState<Array<{ id: number; name: string; price: number; image: string }>>([])
  const [showSavedItems, setShowSavedItems] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState("")
  const [isSavingInstructions, setIsSavingInstructions] = useState(false)

  const handleQuantityChange = useCallback((id: string | number, newQuantity: number) => {
    updateQuantity(id, newQuantity)
    // Toast will be handled by the component
  }, [updateQuantity])

  // Auto-save packing instructions with debounce
  useEffect(() => {
    if (packingInstructions.length === 0) return

    setIsSavingInstructions(true)
    const timeoutId = setTimeout(() => {
      // Simulate API call - replace with actual API call
      // await api.cart.saveNote(packingInstructions)
      setIsSavingInstructions(false)
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [packingInstructions])

  const handleAddRecommended = (item: RecommendedItem) => {
    // Check if item already exists in cart
    const existingItem = state.items.find((cartItem) => cartItem.id === item.id)

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    })

    if (existingItem) {
      toast.success(`${item.name} quantity increased to ${existingItem.quantity + 1}`, {
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />,
      })
    } else {
      toast.success(`${item.name} added to cart`, {
        duration: 3000,
        icon: <ShoppingCart className="h-5 w-5" />,
      })
    }
  }

  const handleCheckout = () => {
    console.log("Checkout clicked, cart items:", state.items.length)
    console.log("Cart state:", state)
    
    if (state.items.length > 0) {
      console.log("Navigating to checkout...")
      router.push("/checkout")
    } else {
      console.log("Cart is empty, cannot checkout")
      toast.error("Your cart is empty. Please add items before checkout.")
    }
  }

  const handleClearCart = () => {
    if (showClearCartConfirm) {
      clearCart()
      setShowClearCartConfirm(false)
      toast.success("Cart cleared", {
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />,
      })
    } else {
      setShowClearCartConfirm(true)
      // Auto-hide the confirmation after 3 seconds
      setTimeout(() => setShowClearCartConfirm(false), 3000)
    }
  }

  const handleContinueShopping = () => {
    router.push("/shop")
  }

  const handleSaveForLater = (item: any) => {
    // Add to saved items
    setSavedItems((prev) => [
      ...prev,
      {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
      },
    ])
    // Remove from cart
    removeItem(item.id)
    toast.success(`${item.name} saved for later`, {
      duration: 3000,
      icon: <CheckCircle className="h-5 w-5" />,
    })
  }

  const handleMoveToCart = (item: any, index: number) => {
    // Check if item already exists in cart
    const existingItem = state.items.find((cartItem) => cartItem.id === item.id)

    // Add back to cart
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    })

    // Remove from saved items
    setSavedItems((prev) => prev.filter((_, i) => i !== index))

    if (existingItem) {
      toast.success(`${item.name} moved to cart, quantity increased to ${existingItem.quantity + 1}`, {
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />,
      })
    } else {
      toast.success(`${item.name} moved to cart`, {
        duration: 3000,
        icon: <ShoppingCart className="h-5 w-5" />,
      })
    }
  }

  const handleApplyCoupon = () => {
    // Reset any previous error
    setCouponError("")

    // Simple validation
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      toast.error("Please enter a coupon code", {
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }

    // Mock coupon codes
    const validCoupons = [
      { code: "WELCOME10", discount: 10 },
      { code: "DRINKMATE20", discount: 20 },
      { code: "SUMMER15", discount: 15 },
    ]

    const foundCoupon = validCoupons.find((c) => c.code.toLowerCase() === couponCode.trim().toLowerCase())

    if (foundCoupon) {
      setAppliedCoupon(foundCoupon)
      setCouponCode("")
      toast.success(`Coupon ${foundCoupon.code} applied: ${foundCoupon.discount}% discount`, {
        duration: 4000,
        icon: <CheckCircle className="h-5 w-5" />,
      })
    } else {
      setCouponError("Invalid coupon code")
      toast.error("Invalid coupon code", {
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const handleRemoveCoupon = () => {
    const removedCode = appliedCoupon?.code
    setAppliedCoupon(null)
    setCouponCode("")
    setCouponError("")
    toast.info(`Coupon ${removedCode} removed`, {
      duration: 3000,
    })
  }

  // Calculate discount amount if coupon is applied
  const discountAmount = appliedCoupon ? (state.total * appliedCoupon.discount) / 100 : 0

  // Calculate final total after discount
  const finalTotal = state.total - discountAmount

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Banner />
        <Header currentPage="cart" />
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto bg-white rounded-lg p-12 border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-medium mb-4 text-gray-900">Your cart is currently empty.</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Button
              onClick={() => router.push("/shop/sodamakers")}
              className="bg-[#00D1FF] hover:bg-[#00bae0] text-white font-medium px-8 py-3 rounded-lg"
            >
              Continue browsing
            </Button>
          </div>

          <div className="mt-16">
            <h2 className="text-xl font-medium mb-8 text-center text-gray-900">Products You Might Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  id: 201,
                  name: "Drinkmate OmniFizz Machine",
                  price: 599.99,
                  image: "/images/drinkmate-machine-red.png",
                },
                {
                  id: 202,
                  name: "Italian Strawberry Lemon Syrup",
                  price: 49.99,
                  image: "/images/italian-strawberry-lemon-syrup.png",
                },
                {
                  id: 203,
                  name: "CO2 Cylinder - 60L",
                  price: 39.99,
                  image: "/images/italian-strawberry-lemon-syrup.png",
                },
                {
                  id: 204,
                  name: "Flavor Bundle - Summer Edition",
                  price: 99.99,
                  originalPrice: 129.99,
                  image: "/images/italian-strawberry-lemon-syrup.png",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
                >
                  <div className="relative h-52 bg-white rounded-3xl mb-6 flex items-center justify-center overflow-hidden">
                    <Image 
                      src={item.image || "/placeholder.svg"} 
                      alt={item.name} 
                      width={180}
                      height={180}
                      className="object-contain h-44 transition-transform duration-300 hover:scale-105" 
                    />
                  </div>
                  <h3 className="font-medium text-lg mb-3 line-clamp-2 text-gray-900">{item.name}</h3>
                  <div className="mb-4">
                    {item.originalPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-md text-gray-900">
                          <SaudiRiyal amount={item.price} size="md" />
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          <SaudiRiyal amount={item.originalPrice} size="md" />
                        </span>
                        <span className="bg-red-50 text-red-500 text-xs font-normal px-2 py-0.5 rounded-full">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    ) : (
                      <span className="font-normal text-sm text-gray-900">
                        <SaudiRiyal amount={item.price} size="sm" />
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      // Check if item already exists in cart
                      const existingItem = state.items.find((cartItem) => cartItem.id === item.id)

                      addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                        image: item.image,
                      })

                      if (existingItem) {
                        toast.success(`${item.name} quantity increased to ${existingItem.quantity + 1}`, {
                          duration: 3000,
                          icon: <CheckCircle className="h-5 w-5" />,
                        })
                      } else {
                        toast.success(`${item.name} added to cart`, {
                          duration: 3000,
                          icon: <ShoppingCart className="h-5 w-5" />,
                        })
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#16d6fa] to-[#12d6fa] hover:from-[#14c4e8] hover:to-[#10b8d6] text-black font-medium rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} /> Add to Cart
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner />
      <Header currentPage="cart" />
      <main className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
        {/* Cart Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-black/10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-black mb-4 tracking-tight">Your Cart</h1>
              <FreeShippingBar 
                subtotal={state.total} 
                threshold={150} 
                className="max-w-md"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center text-sm text-black/60">
                <LockIcon className="w-4 h-4 mr-1" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={handleClearCart}
            variant="ghost"
            className={`h-10 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium transition-colors duration-200 ${
              showClearCartConfirm ? "bg-red-50" : ""
            }`}
          >
            {showClearCartConfirm ? "Click again to confirm" : "Clear Cart"}
          </Button>
          <Button
            onClick={() => router.push("/shop")}
            variant="outline"
            className="h-10 px-4 text-gray-600 hover:text-gray-700 text-sm border-gray-300 hover:border-gray-400 font-medium transition-colors duration-200"
          >
            Continue Shopping
          </Button>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {state.items.map((item) => (
            <div key={item.id} className="cart-fade-in">
              <CartLineItem
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={removeItem}
                onSaveForLater={handleSaveForLater}
              />
            </div>
          ))}
        </div>

        {state.total >= 100 && state.total < 150 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Tag className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-green-800">Select a FREE product</h3>
            </div>
            <p className="text-sm text-green-700 mb-6">
              You qualify for one free product! Choose from the options below.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  id: 101,
                  name: "Drinkmate Flavor Sachet - Cherry",
                  image: "/images/italian-strawberry-lemon-syrup.png",
                  originalPrice: 15.0,
                },
                {
                  id: 102,
                  name: "Drinkmate Flavor Sachet - Lemon",
                  image: "/images/italian-strawberry-lemon-syrup.png",
                  originalPrice: 15.0,
                },
                {
                  id: 103,
                  name: "Drinkmate Flavor Sachet - Peach",
                  image: "/images/italian-strawberry-lemon-syrup.png",
                  originalPrice: 15.0,
                },
              ].map((freeItem) => (
                <div
                  key={freeItem.id}
                  className="bg-white rounded-3xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
                >
                  <div className="relative h-52 bg-white rounded-3xl mb-6 flex items-center justify-center overflow-hidden">
                    <Image
                      src={freeItem.image || "/placeholder.svg"}
                      alt={freeItem.name}
                      width={180}
                      height={180}
                      className="object-contain h-44 transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h4 className="font-medium text-lg mb-3 text-gray-900">{freeItem.name}</h4>
                  <div className="flex items-center mb-3">
                    <span className="text-green-600 font-medium mr-3">FREE</span>
                    <span className="text-xs text-gray-400 line-through">
                      <SaudiRiyal amount={freeItem.originalPrice} size="sm" />
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      // Check if item already exists in cart
                      const existingItem = state.items.find((cartItem) => cartItem.id === freeItem.id)

                      addItem({
                        id: freeItem.id,
                        name: freeItem.name,
                        price: 0,
                        quantity: 1,
                        image: freeItem.image,
                        isFree: true,
                      })

                      if (existingItem) {
                        toast.success(`${freeItem.name} quantity increased to ${existingItem.quantity + 1}`, {
                          duration: 3000,
                          icon: <CheckCircle className="h-5 w-5" />,
                        })
                      } else {
                        toast.success(`${freeItem.name} added to cart`, {
                          duration: 3000,
                          icon: <Gift size={20} />,
                        })
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#16d6fa] to-[#12d6fa] hover:from-[#14c4e8] hover:to-[#10b8d6] text-black font-medium rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Gift size={20} /> Add Free Item
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {savedItems.length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Saved for Later ({savedItems.length})</h2>
              <button
                onClick={() => setShowSavedItems(!showSavedItems)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showSavedItems ? "Hide items" : "Show items"}
              </button>
            </div>
            {showSavedItems && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-3xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
                  >
                    <div className="relative h-52 bg-white rounded-3xl mb-6 flex items-center justify-center overflow-hidden">
                      <Image 
                        src={item.image || "/placeholder.svg"} 
                        alt={item.name} 
                        width={180}
                        height={180}
                        className="object-contain h-44 transition-transform duration-300 hover:scale-105" 
                      />
                    </div>
                    <h3 className="font-medium text-lg mb-3 text-gray-900">{item.name}</h3>
                    <div className="mb-4">
                      <span className="font-normal text-lg text-gray-900">
                        <SaudiRiyal amount={item.price} size="md" />
                      </span>
                    </div>
                    <Button
                      onClick={() => handleMoveToCart(item, index)}
                      className="w-full bg-gradient-to-r from-[#16d6fa] to-[#12d6fa] hover:from-[#14c4e8] hover:to-[#10b8d6] text-black font-medium rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} /> Move to Cart
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* Packing Instructions */}
        <div className="bg-white rounded-2xl p-6 border border-black/10 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-black font-medium">Add instructions for packing your order (optional)</p>
            <div className="flex items-center gap-2 text-xs text-black/50">
              <span className="tabular-nums">{packingInstructions.length}/300</span>
              {packingInstructions.length > 0 && (
                <span className={`font-medium ${isSavingInstructions ? 'text-sky-600' : 'text-emerald-600'}`}>
                  {isSavingInstructions ? 'Saving...' : 'Saved ✓'}
                </span>
              )}
            </div>
          </div>
          <textarea
            value={packingInstructions}
            onChange={(e) => setPackingInstructions(e.target.value)}
            className="w-full border border-black/20 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
            rows={3}
            maxLength={300}
            placeholder="Special handling instructions..."
          />
          <p className="text-xs text-black/60 mt-2">Instructions will be saved automatically as you type</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Free Product Section */}
            {state.total >= 100 && state.total < 150 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <Tag className="h-5 w-5 text-emerald-600 mr-2" />
                  <h3 className="text-lg font-semibold text-emerald-800">Select a FREE product</h3>
                </div>
                <p className="text-sm text-emerald-700 mb-6">
                  You qualify for one free product! Choose from the options below.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      id: 101,
                      name: "Drinkmate Flavor Sachet - Cherry",
                      image: "/images/italian-strawberry-lemon-syrup.png",
                      originalPrice: 15.0,
                    },
                    {
                      id: 102,
                      name: "Drinkmate Flavor Sachet - Lemon",
                      image: "/images/italian-strawberry-lemon-syrup.png",
                      originalPrice: 15.0,
                    },
                    {
                      id: 103,
                      name: "Drinkmate Flavor Sachet - Peach",
                      image: "/images/italian-strawberry-lemon-syrup.png",
                      originalPrice: 15.0,
                    },
                  ].map((freeItem) => (
                    <div
                      key={freeItem.id}
                      className="bg-white rounded-2xl p-4 border border-emerald-200 hover:border-emerald-300 transition-all duration-200"
                    >
                      <div className="relative h-32 bg-white rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                        <Image
                          src={freeItem.image || "/placeholder.svg"}
                          alt={freeItem.name}
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      </div>
                      <h4 className="font-medium text-sm mb-2 text-black">{freeItem.name}</h4>
                      <div className="flex items-center mb-3">
                        <span className="text-emerald-600 font-semibold mr-2">FREE</span>
                        <span className="text-xs text-gray-400 line-through">
                          {fmt(freeItem.originalPrice)}
                        </span>
                      </div>
                      <Button
                        onClick={() => {
                          addItem({
                            id: freeItem.id,
                            name: freeItem.name,
                            price: 0,
                            quantity: 1,
                            image: freeItem.image,
                            isFree: true,
                          })
                          toast.success(`${freeItem.name} added to cart`, {
                            duration: 3000,
                            icon: <Gift size={20} />,
                          })
                        }}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl px-4 py-2 text-sm"
                      >
                        <Gift size={16} className="mr-2" />
                        Add Free Item
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Items */}
            {savedItems.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-black/10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-black">Saved for Later ({savedItems.length})</h2>
                  <button
                    onClick={() => setShowSavedItems(!showSavedItems)}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    {showSavedItems ? "Hide items" : "Show items"}
                  </button>
                </div>
                {showSavedItems && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedItems.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                      >
                        <div className="relative h-32 bg-white rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                          <Image 
                            src={item.image || "/placeholder.svg"} 
                            alt={item.name} 
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                        <h3 className="font-medium text-sm mb-2 text-black">{item.name}</h3>
                        <div className="mb-4">
                          <span className="font-semibold text-black">
                            {fmt(item.price)}
                          </span>
                        </div>
                        <Button
                          onClick={() => handleMoveToCart(item, index)}
                          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl px-4 py-2 text-sm"
                        >
                          <ShoppingCart size={16} className="mr-2" />
                          Move to Cart
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            <section aria-labelledby="you-may-like" className="bg-white rounded-2xl p-6 border border-black/10">
              <h2 id="you-may-like" className="text-lg font-semibold mb-6 text-black tracking-tight">Items you may like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommended.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                  >
                    <div className="relative h-24 bg-white rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      <Image 
                        src={item.image || "/placeholder.svg"} 
                        alt={item.name} 
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="font-medium text-sm mb-2 text-black line-clamp-2">{item.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="text-xs">★</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">({item.reviews})</span>
                    </div>
                    <div className="mb-3">
                      {item.originalPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-black text-sm">
                            <SaudiRiyal amount={item.price} size="sm" />
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            <SaudiRiyal amount={item.originalPrice} size="xs" />
                          </span>
                          <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-black text-sm">
                          <SaudiRiyal amount={item.price} size="sm" />
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleAddRecommended(item)}
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl px-3 py-2 text-xs"
                    >
                      <ShoppingCart size={14} className="mr-1" />
                      ADD
                    </Button>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <OrderSummary
                subtotal={state.total}
                itemCount={state.itemCount}
                shipping={state.total >= 150 ? 0 : null}
                discount={discountAmount}
                total={finalTotal}
                freeShippingThreshold={150}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                onCheckout={handleCheckout}
                isCheckoutDisabled={state.items.length === 0}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
