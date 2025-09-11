"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Truck, CheckCircle, AlertCircle, ShoppingCart, LockIcon, Gift, Tag } from "lucide-react"
import { useState } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Banner from "@/components/layout/Banner"
import { toast } from "sonner"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

// Local currency formatter for amounts without symbol
const formatCurrency = (amount: number | undefined | null): string => {
  const formattedAmount = amount === undefined || amount === null ? "0.00" : Number(amount).toFixed(2)

  return formattedAmount
}

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

  const handleQuantityChange = (id: string | number, newQuantity: number) => {
    updateQuantity(id, newQuantity)
    toast.success("Quantity updated", {
      duration: 2000,
      icon: <CheckCircle className="h-5 w-5" />,
    })
  }

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
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-medium text-gray-900 mb-2">Your Cart</h1>
              {state.total >= 150 ? (
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>
                    Only <SaudiRiyal amount={150 - state.total} /> away from Free shipping
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-600">
                  <Truck className="w-5 h-5 mr-2" />
                  <span>
                    Only <SaudiRiyal amount={150 - state.total} /> away from Free shipping
                  </span>
                </div>
              )}
              {state.total < 150 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#00D1FF] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((state.total / 150) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center text-sm text-gray-500">
                <LockIcon className="w-5 h-5 mr-1" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={handleClearCart}
            variant="ghost"
            className={`text-red-600 hover:text-red-700 hover:bg-red-50 text-sm ${showClearCartConfirm ? "bg-red-50" : ""}`}
          >
            {showClearCartConfirm ? "Click again to confirm" : "Clear Cart"}
          </Button>
          <Button
            onClick={() => router.push("/shop")}
            variant="outline"
            className="text-gray-600 hover:text-gray-700 text-sm border-gray-300"
          >
            Continue Shopping
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="hidden md:grid grid-cols-4 py-4 px-6 border-b border-gray-200 text-sm text-gray-600 font-medium bg-gray-50">
            <div>Items</div>
            <div className="text-right">Price</div>
            <div className="text-center">Qty</div>
            <div className="text-right">Total</div>
          </div>

          {state.items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 md:grid-cols-4 py-6 px-6 border-b border-gray-100 last:border-b-0 gap-y-4 md:gap-y-0"
            >
              <div className="flex items-center">
                <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain" />
                </div>
                <div className="ml-4">
                  <p className="text-sm md:text-base font-medium text-gray-900">{item.name}</p>
                  <div className="flex space-x-4 mt-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleSaveForLater(item)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Save for later
                    </button>
                  </div>
                </div>
              </div>
              <div className="md:text-right self-center flex justify-between md:block">
                <span className="md:hidden font-medium text-sm text-gray-600">Price:</span>
                <span className="font-medium text-gray-900">
                  <SaudiRiyal amount={item.price} />
                </span>
              </div>
              <div className="md:text-center self-center flex justify-between md:block">
                <span className="md:hidden font-medium text-sm text-gray-600">Quantity:</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 border-gray-300"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 border-gray-300"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="md:text-right self-center font-medium flex justify-between md:block">
                <span className="md:hidden font-medium text-sm text-gray-600">Total:</span>
                <span className="text-gray-900">
                  <SaudiRiyal amount={item.price * item.quantity} />
                </span>
              </div>
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

        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
          <h2 className="text-lg font-medium mb-6 text-gray-900">Items you may like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommended.map((item) => (
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
                <h3 className="font-medium text-lg mb-3 text-gray-900">{item.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-base">★</span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">({item.reviews} Reviews)</span>
                </div>
                <div className="mb-4">
                  {item.originalPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="font-normal text-lg text-gray-900">
                        <SaudiRiyal amount={item.price} size="md" />
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        <SaudiRiyal amount={item.originalPrice} size="sm" />
                      </span>
                      <span className="bg-red-50 text-red-500 text-xs font-normal px-2 py-0.5 rounded-full">
                        {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="font-normal text-lg text-gray-900">
                      <SaudiRiyal amount={item.price} size="md" />
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => handleAddRecommended(item)}
                  className="bg-gradient-to-r from-[#16d6fa] to-[#12d6fa] hover:from-[#14c4e8] hover:to-[#10b8d6] text-black font-medium rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <ShoppingCart size={20} /> ADD
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
          <p className="text-sm text-gray-700 mb-3 font-medium">Add instructions for packing your order (optional)</p>
          <textarea
            value={packingInstructions}
            onChange={(e) => setPackingInstructions(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#00D1FF] focus:border-[#00D1FF]"
            rows={3}
            placeholder="Special handling instructions..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-base font-medium mb-4 text-gray-900">Apply Coupon Code</p>
            <div className="flex space-x-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#00D1FF] focus:border-[#00D1FF]"
              />
              <Button
                onClick={handleApplyCoupon}
                className="bg-[#00D1FF] hover:bg-[#00bae0] text-white text-sm py-3 px-6 rounded-lg font-medium"
              >
                Apply
              </Button>
            </div>
            {couponError && <p className="text-red-600 text-sm mt-2">{couponError}</p>}
            {appliedCoupon && (
              <div className="flex justify-between items-center mt-4 bg-green-50 p-3 rounded-lg border border-green-200">
                <span className="text-green-700 text-sm font-medium">
                  {appliedCoupon.code} ({appliedCoupon.discount}% off)
                </span>
                <button onClick={handleRemoveCoupon} className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-base font-medium mb-4 text-gray-900">Been referred by a friend?</p>
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Enter referral code"
                className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#00D1FF] focus:border-[#00D1FF]"
              />
              <Button className="bg-[#00D1FF] hover:bg-[#00bae0] text-white text-sm py-3 px-6 rounded-lg font-medium">
                Apply
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-6 text-gray-900">ORDER SUMMARY</h3>

          {state.total >= 150 ? (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Free Shipping Unlocked!</span>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Truck className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Add <SaudiRiyal amount={150 - state.total} /> more for free shipping
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">Subtotal ({state.itemCount} items)</div>
              <div className="text-sm font-medium text-gray-900">
                <SaudiRiyal amount={state.total} />
              </div>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between items-center text-green-600">
                <div className="text-sm">Discount ({appliedCoupon.discount}%)</div>
                <div className="text-sm font-medium">
                  -<SaudiRiyal amount={discountAmount} />
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">Shipping</div>
              <div className="text-sm">
                {state.total >= 150 ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  <span className="text-gray-500">Calculated at checkout</span>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <div className="font-medium text-lg text-gray-900">Total</div>
              <div className="font-medium text-xl text-gray-900">
                <SaudiRiyal amount={finalTotal} />
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-6">Taxes and discount code calculated at checkout</div>

          <Button
            onClick={handleCheckout}
            disabled={state.items.length === 0}
            className={`w-full font-medium py-4 text-base rounded-lg mb-6 ${
              state.items.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#00D1FF] hover:bg-[#00bae0] text-white'
            }`}
          >
            {state.items.length === 0 ? 'Cart is Empty' : `Checkout • ${finalTotal} SAR`}
          </Button>

          <div>
            <p className="text-xs text-gray-500 text-center mb-3 font-medium">CHECKOUT WITH</p>
            <div className="flex flex-wrap justify-center items-center gap-5 p-5 bg-gray-50 rounded-lg border border-gray-200">
              <Image
                src="/images/payment-logos/Mada Logo Vector.svg"
                alt="Mada"
                width={64}
                height={40}
                className="object-contain h-12 opacity-80 hover:opacity-100 transition-opacity duration-200"
              />
              <Image
                src="/images/payment-logos/visa.png"
                alt="Visa"
                width={64}
                height={40}
                className="object-contain h-12 opacity-80 hover:opacity-100 transition-opacity duration-200"
              />
              <Image
                src="/images/payment-logos/mastercard.png"
                alt="Mastercard"
                width={64}
                height={40}
                className="object-contain h-12 opacity-80 hover:opacity-100 transition-opacity duration-200"
              />
              <Image
                src="/images/payment-logos/american-express.png"
                alt="American Express"
                width={64}
                height={40}
                className="object-contain h-12 opacity-80 hover:opacity-100 transition-opacity duration-200"
              />
              <Image
                src="/images/payment-logos/apple-pay.png"
                alt="Apple Pay"
                width={64}
                height={40}
                className="object-contain h-12 opacity-80 hover:opacity-100 transition-opacity duration-200"
              />
              <Image
                src="/images/payment-logos/google-pay.png"
                alt="Google Pay"
                width={64}
                height={40}
                className="object-contain h-12 opacity-80 hover:opacity-100 transition-opacity duration-200"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
