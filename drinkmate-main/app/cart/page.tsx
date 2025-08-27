"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Truck, CheckCircle, AlertCircle, ShoppingCart, Lock as LockIcon, Gift, Tag } from "lucide-react"
import { useState } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Banner from "@/components/layout/Banner"
import { toast } from "sonner"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

// Local currency formatter for amounts without symbol
const formatCurrency = (amount: number | undefined | null): string => {
  const formattedAmount = amount === undefined || amount === null 
    ? '0.00' 
    : Number(amount).toFixed(2);
  
  return formattedAmount;
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
    price: 45.00,
    originalPrice: 60.00,
    image: "/images/italian-strawberry-lemon-syrup.png",
    reviews: 450,
    rating: 5,
  },
  {
    id: 2,
    name: "Italian Energy Drink Flavor",
    price: 45.00,
    originalPrice: 60.00,
    image: "/images/italian-strawberry-lemon-syrup.png",
    reviews: 380,
    rating: 4.8,
  },
  {
    id: 3,
    name: "Italian Peach Flavor",
    price: 45.00,
    originalPrice: 60.00,
    image: "/images/italian-strawberry-lemon-syrup.png",
    reviews: 520,
    rating: 4.9,
  },
  {
    id: 4,
    name: "CO2 Cylinder Refill",
    price: 55.00,
    originalPrice: 75.00,
    image: "/images/co2-cylinder-single.png",
    reviews: 1200,
    rating: 4.7,
  }
]

export default function CartPage() {
  const router = useRouter()
  const { state, updateQuantity, removeItem, addItem, clearCart } = useCart()
  const [packingInstructions, setPackingInstructions] = useState("")
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false)
  const [savedItems, setSavedItems] = useState<Array<{id: number, name: string, price: number, image: string}>>([])
  const [showSavedItems, setShowSavedItems] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null)
  const [couponError, setCouponError] = useState("")

  const handleQuantityChange = (id: number, newQuantity: number) => {
    updateQuantity(id, newQuantity)
    toast.success("Quantity updated", {
      duration: 2000,
      icon: <CheckCircle className="h-5 w-5" />
    })
  }

  const handleAddRecommended = (item: RecommendedItem) => {
    // Check if item already exists in cart
    const existingItem = state.items.find(cartItem => cartItem.id === item.id)
    
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
        icon: <CheckCircle className="h-5 w-5" />
      })
    } else {
      toast.success(`${item.name} added to cart`, {
        duration: 3000,
        icon: <ShoppingCart className="h-5 w-5" />
      })
    }
  }

  const handleCheckout = () => {
    if (state.items.length > 0) {
      // Navigate to checkout page (you can implement this later)
      toast.info("Checkout functionality coming soon!", {
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5" />
      })
    }
  }
  
  const handleClearCart = () => {
    if (showClearCartConfirm) {
      clearCart()
      setShowClearCartConfirm(false)
      toast.success("Cart cleared", {
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />
      })
    } else {
      setShowClearCartConfirm(true)
      // Auto-hide the confirmation after 3 seconds
      setTimeout(() => setShowClearCartConfirm(false), 3000)
    }
  }
  
  const handleContinueShopping = () => {
    router.push('/shop')
  }
  
  const handleSaveForLater = (item: any) => {
    // Add to saved items
    setSavedItems(prev => [...prev, {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    }])
    // Remove from cart
    removeItem(item.id)
    toast.success(`${item.name} saved for later`, {
      duration: 3000,
      icon: <CheckCircle className="h-5 w-5" />
    })
  }
  
  const handleMoveToCart = (item: any, index: number) => {
    // Check if item already exists in cart
    const existingItem = state.items.find(cartItem => cartItem.id === item.id)
    
    // Add back to cart
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    })
    
    // Remove from saved items
    setSavedItems(prev => prev.filter((_, i) => i !== index))
    
    if (existingItem) {
      toast.success(`${item.name} moved to cart, quantity increased to ${existingItem.quantity + 1}`, {
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />
      })
    } else {
      toast.success(`${item.name} moved to cart`, {
        duration: 3000,
        icon: <ShoppingCart className="h-5 w-5" />
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
        icon: <AlertCircle className="h-5 w-5" />
      })
      return
    }
    
    // Mock coupon codes
    const validCoupons = [
      { code: "WELCOME10", discount: 10 },
      { code: "DRINKMATE20", discount: 20 },
      { code: "SUMMER15", discount: 15 }
    ]
    
    const foundCoupon = validCoupons.find(
      c => c.code.toLowerCase() === couponCode.trim().toLowerCase()
    )
    
    if (foundCoupon) {
      setAppliedCoupon(foundCoupon)
      setCouponCode("")
      toast.success(`Coupon ${foundCoupon.code} applied: ${foundCoupon.discount}% discount`, {
        duration: 4000,
        icon: <CheckCircle className="h-5 w-5" />
      })
    } else {
      setCouponError("Invalid coupon code")
      toast.error("Invalid coupon code", {
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5" />
      })
    }
  }
  
  const handleRemoveCoupon = () => {
    const removedCode = appliedCoupon?.code
    setAppliedCoupon(null)
    setCouponCode("")
    setCouponError("")
    toast.info(`Coupon ${removedCode} removed`, {
      duration: 3000
    })
  }
  
  // Calculate discount amount if coupon is applied
  const discountAmount = appliedCoupon 
    ? (state.total * appliedCoupon.discount / 100) 
    : 0
    
  // Calculate final total after discount
  const finalTotal = state.total - discountAmount

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Banner />
        <Header currentPage="cart" />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Button 
              onClick={() => router.push('/shop/sodamakers')}
              className="rounded-full bg-[#00D1FF] hover:bg-[#00bae0] text-white font-medium px-8 py-3 text-base"
            >
              Start Shopping
            </Button>
          </div>
          
          {/* Recommended Products for Empty Cart */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-xl md:text-2xl font-medium mb-6 text-center">Products You Might Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { id: 201, name: "Drinkmate OmniFizz Machine", price: 599.99, image: "/images/drinkmate-machine-red.png" },
                { id: 202, name: "Italian Strawberry Lemon Syrup", price: 49.99, image: "/images/italian-strawberry-lemon-syrup.png" },
                { id: 203, name: "CO2 Cylinder - 60L", price: 39.99, image: "/images/italian-strawberry-lemon-syrup.png" },
                { id: 204, name: "Flavor Bundle - Summer Edition", price: 99.99, originalPrice: 129.99, image: "/images/italian-strawberry-lemon-syrup.png" }
              ].map(item => (
                <div key={item.id} className="flex flex-col border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="relative h-28 sm:h-32 mb-2">
                    <Image src={item.image} alt={item.name} fill className="object-contain" />
                  </div>
                  <h3 className="text-xs font-medium mb-1 line-clamp-2 h-8">{item.name}</h3>
                  <div className="mb-2 mt-auto">
                    {item.originalPrice ? (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-red-600"><SaudiRiyal amount={item.price} /></span>
                        <span className="text-xs text-gray-500 line-through ml-1"><SaudiRiyal amount={item.originalPrice} /></span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium"><SaudiRiyal amount={item.price} /></span>
                    )}
                  </div>
                  <Button 
                    onClick={() => {
                      // Check if item already exists in cart
                      const existingItem = state.items.find(cartItem => cartItem.id === item.id);
                      
                      addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                        image: item.image,
                      });
                      
                      if (existingItem) {
                        toast.success(`${item.name} quantity increased to ${existingItem.quantity + 1}`, {
                          duration: 3000,
                          icon: <CheckCircle className="h-5 w-5" />
                        });
                      } else {
                        toast.success(`${item.name} added to cart`, {
                          duration: 3000,
                          icon: <ShoppingCart className="h-5 w-5" />
                        });
                      }
                    }}
                    className="w-full rounded-md bg-[#00D1FF] hover:bg-[#00bae0] text-white text-xs py-1"
                  >
                    Add to Cart
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
    <div className="min-h-screen bg-white">
      <Banner />
      <Header currentPage="cart" />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Your Cart</h1>
          {state.total >= 150 ? (
            <div className="flex items-center text-sm text-green-600 mt-1 font-medium">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Free Shipping unlocked</span>
            </div>
          ) : (
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Truck className="w-4 h-4 mr-1" />
              <span><SaudiRiyal amount={150 - state.total} /> away from free shipping</span>
            </div>
          )}
          {/* Free Shipping Progress Bar */}
          {state.total < 150 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Free Shipping at 150 ﷼</span>
                <span>{Math.round((state.total / 150) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((state.total / 150) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <SaudiRiyal amount={150 - state.total} /> more needed
              </div>
            </div>
          )}

          <div className="flex items-center text-xs text-gray-500 mt-1">
            <LockIcon className="w-3 h-3 mr-1" />
            <span>Secure Checkout</span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
         
          <Button 
            onClick={handleCheckout}
            className="rounded-full bg-[#00D1FF] hover:bg-[#00bae0] text-white font-medium px-8 py-2 flex-1 sm:flex-none"
          >
            Checkout
          </Button>
        </div>
      </div>

      {/* Cart Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleClearCart}
            variant="ghost" 
            className={`text-red-500 hover:text-red-700 hover:bg-red-50 text-sm ${showClearCartConfirm ? 'bg-red-50' : ''}`}
          >
            {showClearCartConfirm ? 'Click again to confirm' : 'Clear Cart'}
          </Button>
          <Button 
            onClick={() => router.push('/shop')}
            variant="outline"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm"
          >
            Continue Shopping
          </Button>
          {state.items.length > 0 && (
            <Button 
              onClick={() => {
                // Save current cart to localStorage as backup
                localStorage.setItem('drinkmate-cart-backup', JSON.stringify(state.items))
                toast.success("Cart saved as backup", {
                  icon: <CheckCircle className="h-4 w-4" />
                })
              }}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-sm"
            >
              Save Cart
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <ShoppingCart className="h-4 w-4" />
            <span>{state.itemCount} {state.itemCount === 1 ? 'item' : 'items'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Total:</span>
            <span className="font-medium text-gray-700"><SaudiRiyal amount={state.total} /></span>
          </div>
        </div>
      </div>

      {/* Cart Items Table */}
      <div className="mt-6">
        {/* Table Headers */}
        <div className="hidden md:grid grid-cols-4 pb-2 border-b border-gray-200 text-sm text-gray-500">
          <div>Items</div>
          <div className="text-right">Price</div>
          <div className="text-center">Qty</div>
          <div className="text-right">Total</div>
        </div>

        {/* Cart Items */}
        {state.items.map(item => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 py-6 border-b border-gray-200 gap-y-4 md:gap-y-0">
            <div className="flex items-center">
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-contain" />
              </div>
              <div className="ml-4">
                <p className="text-sm md:text-base font-medium">{item.name}</p>
                <div className="flex space-x-3 mt-1">
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                  <button 
                    onClick={() => handleSaveForLater(item)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Save for later
                  </button>
                </div>
              </div>
            </div>
            <div className="md:text-right self-center flex justify-between md:block">
              <span className="md:hidden font-medium text-sm">Price:</span>
              <span><SaudiRiyal amount={item.price} /></span>
            </div>
            <div className="md:text-center self-center flex justify-between md:block">
              <span className="md:hidden font-medium text-sm">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(Number(item.id), Math.max(1, item.quantity - 1))}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
                  disabled={item.quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(Number(item.id), item.quantity + 1)}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
                >
                  +
                </Button>
              </div>
            </div>
            <div className="md:text-right self-center font-medium flex justify-between md:block">
              <span className="md:hidden font-medium text-sm">Total:</span>
              <span><SaudiRiyal amount={item.price * item.quantity} /></span>
            </div>
          </div>
        ))}
        
        {/* Free Products Section - Show when cart total is over 100 ﷼ */}
        {state.total >= 100 && state.total < 150 && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center mb-4">
              <Tag className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-medium">Select a FREE product</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              You qualify for one free product! Choose from the options below.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: 101, name: "Drinkmate Flavor Sachet - Cherry", image: "/images/italian-strawberry-lemon-syrup.png", originalPrice: 15.00 },
                { id: 102, name: "Drinkmate Flavor Sachet - Lemon", image: "/images/italian-strawberry-lemon-syrup.png", originalPrice: 15.00 },
                { id: 103, name: "Drinkmate Flavor Sachet - Peach", image: "/images/italian-strawberry-lemon-syrup.png", originalPrice: 15.00 }
              ].map(freeItem => (
                <div key={freeItem.id} className="border border-gray-200 rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow">
                  <div className="relative h-32 mb-3">
                    <Image src={freeItem.image} alt={freeItem.name} fill className="object-contain" />
                  </div>
                  <h4 className="text-sm font-medium mb-1">{freeItem.name}</h4>
                  <div className="flex items-center mb-2">
                    <span className="text-green-600 font-medium mr-2">FREE</span>
                    <span className="text-xs text-gray-500 line-through"><SaudiRiyal amount={freeItem.originalPrice} /></span>
                  </div>
                  <Button 
                    onClick={() => {
                      // Check if item already exists in cart
                      const existingItem = state.items.find(cartItem => cartItem.id === freeItem.id)
                      
                      addItem({
                        id: freeItem.id,
                        name: freeItem.name,
                        price: 0,
                        quantity: 1,
                        image: freeItem.image,
                        isFree: true
                      });
                      
                      if (existingItem) {
                        toast.success(`${freeItem.name} quantity increased to ${existingItem.quantity + 1}`, {
                          duration: 3000,
                          icon: <CheckCircle className="h-5 w-5" />
                        });
                      } else {
                        toast.success(`${freeItem.name} added to cart`, {
                          duration: 3000,
                          icon: <Gift className="h-5 w-5" />
                        });
                      }
                    }}
                    className="mt-auto text-xs py-1 rounded-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    Add Free Item
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Saved for Later Items */}
      {savedItems.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-medium">Saved for Later ({savedItems.length})</h2>
            <button 
              onClick={() => setShowSavedItems(!showSavedItems)}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              {showSavedItems ? 'Hide items' : 'Show items'}
            </button>
          </div>
          
          {showSavedItems && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {savedItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow">
                  <div className="relative h-32 sm:h-40 mb-3">
                    <Image src={item.image} alt={item.name} fill className="object-contain" />
                  </div>
                  <h3 className="text-sm font-medium mb-2 line-clamp-2">{item.name}</h3>
                  <div className="text-sm font-semibold mb-3"><SaudiRiyal amount={item.price} /></div>
                  <Button 
                    onClick={() => handleMoveToCart(item, index)}
                    className="mt-auto text-xs py-1 rounded-full bg-[#00D1FF] hover:bg-[#00bae0] text-white"
                  >
                    Move to Cart
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items you may like */}
      <div className="mt-12">
        <h2 className="text-xl md:text-2xl font-medium mb-6">Items you may like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {recommended.map(item => (
            <div key={item.id} className="flex flex-col border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="relative h-40 sm:h-48 mb-3">
                <Image src={item.image} alt={item.name} fill className="object-contain" />
              </div>
              <h3 className="text-sm md:text-base font-medium mb-1">{item.name}</h3>
              <div className="flex items-center mb-1">
                <div className="flex text-yellow-400">
                  {Array.from({length: 5}).map((_, i) => (
                    <span key={i} className="text-xs">★</span>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">({item.reviews} Reviews)</span>
              </div>
              <div className="mb-3">
                <span className="text-sm font-medium"><SaudiRiyal amount={item.price} /></span>
                {item.originalPrice && (
                  <span className="text-xs text-gray-500 line-through ml-2"><SaudiRiyal amount={item.originalPrice} /></span>
                )}
              </div>
              <Button 
                onClick={() => handleAddRecommended(item)}
                className="rounded-full bg-[#00D1FF] hover:bg-[#00bae0] text-white text-xs py-1 px-4 self-start"
              >
                ADD
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Packing Instructions */}
      <div className="mt-12">
        <p className="text-sm text-gray-600 mb-2">Add instructions for packing your order (optional)</p>
        <textarea
          value={packingInstructions}
          onChange={(e) => setPackingInstructions(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 text-sm"
          rows={2}
        />
      </div>

      {/* Coupon and Referral Code Sections - Side by Side */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coupon Code Card */}
        <div className="border border-gray-200 rounded-lg p-6">
          <p className="text-base font-medium mb-3">Apply Coupon Code</p>
          <div className="flex space-x-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
            />
            <Button
              onClick={handleApplyCoupon}
              className="bg-[#00D1FF] hover:bg-[#00bae0] text-white text-sm py-2 px-4"
            >
              Apply
            </Button>
          </div>
          {couponError && (
            <p className="text-red-500 text-xs mt-2">{couponError}</p>
          )}
          {appliedCoupon && (
            <div className="flex justify-between items-center mt-3 bg-green-50 p-3 rounded-md">
              <div className="flex items-center">
                <span className="text-green-600 text-sm font-medium">
                  {appliedCoupon.code} ({appliedCoupon.discount}% off)
                </span>
              </div>
              <button 
                onClick={handleRemoveCoupon}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Referral Code Card */}
        <div className="border border-gray-200 rounded-lg p-6">
          <p className="text-sm font-medium mb-3">Been referred by a friend?</p>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter referral code"
              className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
            />
            <Button
              className="bg-[#00D1FF] hover:bg-[#00bae0] text-white text-sm py-2 px-4"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="mt-8">
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            ORDER SUMMARY
          </h3>
          
          {/* Free Shipping Status */}
          {state.total >= 150 ? (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Free Shipping Unlocked! 🎉</span>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Truck className="h-4 w-4" />
                <span className="text-sm">
                  Add <SaudiRiyal amount={150 - state.total} /> more for free shipping
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">Subtotal ({state.itemCount} items)</div>
              <div className="text-sm font-medium"><SaudiRiyal amount={state.total} /></div>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between items-center text-green-600">
                <div className="text-sm">Discount ({appliedCoupon.discount}%)</div>
                <div className="text-sm font-medium">-<SaudiRiyal amount={discountAmount} /></div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">Shipping</div>
              <div className="text-sm font-medium">
                {state.total >= 150 ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  <span className="text-gray-500">Calculated at checkout</span>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <div className="font-medium text-lg">Total</div>
              <div className="font-bold text-xl text-gray-900"><SaudiRiyal amount={finalTotal} /></div>
            </div>
          </div>
          
          {/* Savings Summary */}
          {state.total >= 150 && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-center text-green-700">
                <span className="text-sm font-medium">You're saving on shipping! 🚚</span>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mb-4">Taxes and discount code calculated at checkout</div>

          {/* Checkout Button */}
          <Button 
            onClick={handleCheckout}
            className="w-full rounded-full bg-[#00D1FF] hover:bg-[#00bae0] text-white font-medium py-3 text-base"
          >
            Checkout {appliedCoupon ? (
              <> • <SaudiRiyal amount={finalTotal} /></>
            ) : (
              <> • <SaudiRiyal amount={state.total} /></>
            )}
          </Button>

          {/* Payment Methods */}
          <div className="mt-6">
            <p className="text-xs text-gray-500 text-center mb-3">CHECKOUT WITH</p>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <Image src="/images/payment-logos/Mada Logo Vector.svg" alt="Mada" width={40} height={25} className="object-contain h-6" />
              <Image src="/images/payment-logos/visa.png" alt="Visa" width={40} height={25} className="object-contain h-6" />
              <Image src="/images/payment-logos/mastercard.png" alt="Mastercard" width={40} height={25} className="object-contain h-6" />
              <Image src="/images/payment-logos/american-express.png" alt="American Express" width={40} height={25} className="object-contain h-6" />
              <Image src="/images/payment-logos/apple-pay.png" alt="Apple Pay" width={40} height={25} className="object-contain h-6" />
              <Image src="/images/payment-logos/google-pay.png" alt="Google Pay" width={40} height={25} className="object-contain h-6" />
              <Image src="/images/payment-logos/samsung-pay.svg" alt="Samsung Pay" width={40} height={25} className="object-contain h-6" />
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  )
}
