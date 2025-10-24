"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, Minus, ChevronDown, Star, ShoppingCart, Info, Truck, Shield, RotateCcw, CheckCircle, ArrowRight, Gift } from "lucide-react"
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/contexts/translation-context"
import { useState, useEffect } from "react"
import { useCart } from "@/lib/contexts/cart-context"
import { co2API } from "@/lib/api"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import CylinderCard from "@/components/refill/CylinderCard"
import OrderSummary from "@/components/refill/OrderSummary"
import QuantityControl from "@/components/refill/QuantityControl"
import { toast } from "sonner"
import styles from "./refill-cylinder.module.css"

// Type definition for refill slides
interface RefillSlide {
  headline: string;
  description: string;
  buttonText: string;
  offerText: string;
}

export default function CO2() {
  const { t, isRTL } = useTranslation()
  const { addItem } = useCart()
  
  // Slideshow state (same as shop page)
  const refillSlides: RefillSlide[] = [
    {
      headline: "REFILL MORE. SAVE MORE.",
      description: "Now refill 4 cylinders all together for the price of 55 ﷼ each cylinder.",
      buttonText: "Refill Now",
      offerText: "*Offer valid for whole year*",
    },
    {
      headline: "PREMIUM ITALIAN FLAVORS NOW AVAILABLE",
      description: "Experience authentic taste with our new premium Italian flavor collection.",
      buttonText: "",
      offerText: "",
    },
    {
      headline: "5% OFF ON FIRST ORDER FOR OUR NEW CUSTOMERS",
      description: "Getting into sparkle game? Enjoy 5% off on your first order with drinkmate.",
      buttonText: "",
      offerText: "",
    },
  ]

  const [currentRefillSlide, setCurrentRefillSlide] = useState(0)
  const [selectedCylinder, setSelectedCylinder] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("faqs")
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  
  // New state for button functionality
  const [showBlocks, setShowBlocks] = useState(false)
  const [cylinderType, setCylinderType] = useState("") // "drinkmate" or "non-drinkmate"
  const [nonDrinkmateBrand, setNonDrinkmateBrand] = useState("")

  // Slideshow navigation
  const nextRefillSlide = () => {
    setCurrentRefillSlide((prev) => (prev === refillSlides.length - 1 ? 0 : prev + 1))
  }

  const prevRefillSlide = () => {
    setCurrentRefillSlide((prev) => (prev === 0 ? refillSlides.length - 1 : prev - 1))
  }

  // State for cylinders from API
  const [cylinderBrands, setCylinderBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Fetch cylinders from API
  useEffect(() => {
    const fetchCylinders = async () => {
      try {
        setLoading(true)
        setApiError(null)
        
        // Check if we're online
        const isOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
          ? navigator.onLine
          : true;
          
        if (!isOnline) {
          console.warn('Device appears to be offline, will use fallback data');
        }
        
        // Use refill API for consistency with admin panel
        const response = await fetch('/api/refill/cylinders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Transform API data to match the expected format
          const transformedCylinders = data.cylinders.map((cylinder: any) => ({
            id: cylinder._id || cylinder.id, // Handle both API and fallback data
            name: cylinder.name,
            image: cylinder.image,
            price: cylinder.price,
            originalPrice: cylinder.originalPrice,
            discount: cylinder.discount,
            compatible: true,
            description: cylinder.description,
            brand: cylinder.brand,
            type: cylinder.type,
            capacity: cylinder.capacity
          }))
          setCylinderBrands(transformedCylinders)
          
          // Log when using fallback data
          if (data.message?.includes('fallback')) {
            console.info('Using fallback cylinder data:', data.message);
          }
        } else {
          console.error('Failed to fetch cylinders:', data.message);
          setApiError('Could not retrieve cylinder information. Please try again later.');
        }
      } catch (error: any) {
        console.error('Error fetching cylinders:', error);
        setApiError(`Error loading cylinder data: ${error.message || 'Unknown error'}`);
        
        // Auto-retry once after a short delay for network errors
        if (retryCount === 0 && (!error.response || error.message === 'Network Error')) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            fetchCylinders();
          }, 3000);
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCylinders()
  }, [retryCount])

  // Get selected cylinder data
  const getCylinderData = (cylinderId: string) => {
    // Hardcoded cylinder data for known brands
    const cylinderDataMap: { [key: string]: any } = {
      "drinkmate": {
        id: "drinkmate",
        name: "Drinkmate",
        price: 65,
        originalPrice: 75,
        discount: 13,
        description: "Original Drinkmate CO2 cylinder refill",
        brand: "Drinkmate",
        type: "refill",
        capacity: "60L"
      },
     
      "sodastream": {
        id: "sodastream",
        name: "SodaStream",
        price: 72,
        originalPrice: 85,
        discount: 15,
        description: "SodaStream CO2 cylinder refill",
        brand: "SodaStream",
        type: "refill",
        capacity: "60L"
      },
      "errva": {
        id: "errva",
        name: "Errva",
        price: 68,
        originalPrice: 78,
        discount: 13,
        description: "Errva CO2 cylinder refill",
        brand: "Errva",
        type: "refill",
        capacity: "60L"
      },
      "fawwar": {
        id: "fawwar",
        name: "Fawwar",
        price: 70,
        originalPrice: 82,
        discount: 15,
        description: "Fawwar CO2 cylinder refill",
        brand: "Fawwar",
        type: "refill",
        capacity: "60L"
      },
      "phillips": {
        id: "phillips",
        name: "Phillips",
        price: 75,
        originalPrice: 90,
        discount: 17,
        description: "Phillips CO2 cylinder refill",
        brand: "Phillips",
        type: "refill",
        capacity: "60L"
      },
      "ultima-cosa": {
        id: "ultima-cosa",
        name: "Ultima Cosa",
        price: 80,
        originalPrice: 95,
        discount: 16,
        description: "Ultima Cosa CO2 cylinder refill",
        brand: "Ultima Cosa",
        type: "refill",
        capacity: "60L"
      },
      "bubble-bro": {
        id: "bubble-bro",
        name: "Bubble Bro",
        price: 73,
        originalPrice: 88,
        discount: 17,
        description: "Bubble Bro CO2 cylinder refill",
        brand: "Bubble Bro",
        type: "refill",
        capacity: "60L"
      },
      "yoco-cosa": {
        id: "yoco-cosa",
        name: "Yoco Cosa",
        price: 78,
        originalPrice: 92,
        discount: 15,
        description: "Yoco Cosa CO2 cylinder refill",
        brand: "Yoco Cosa",
        type: "refill",
        capacity: "60L"
      },
      "other-brand": {
        id: "other-brand",
        name: "Other brand cylinders",
        price: 85,
        originalPrice: 100,
        discount: 15,
        description: "Generic CO2 cylinder refill for various brand cylinders",
        brand: "Other",
        type: "refill",
        capacity: "60L"
      }
    }

    return cylinderDataMap[cylinderId] || cylinderBrands.find(brand => brand.id === cylinderId)
  }

  const selectedCylinderData = getCylinderData(selectedCylinder)
  
  // Dynamic pricing based on quantity and brand
  const getCylinderPrice = () => {
    if (!selectedCylinderData) return 65.00
    
    let basePrice = selectedCylinderData.price
    
    // Quantity discounts
    if (quantity >= 4) {
      basePrice = basePrice * 0.85 // 15% off for 4+ cylinders
    } else if (quantity >= 3) {
      basePrice = basePrice * 0.90 // 10% off for 3+ cylinders
    } else if (quantity >= 2) {
      basePrice = basePrice * 0.95 // 5% off for 2+ cylinders
    }
    
    return basePrice
  }

  const cylinderPrice = getCylinderPrice()
  const deliveryCharge = quantity >= 4 ? 0 : 35.00 // Free delivery for 4+ cylinders
  const subtotal = cylinderPrice * quantity
  const total = subtotal + deliveryCharge

  const handleAddToCart = () => {
    if (selectedCylinderData) {
      // Generate unique ID based on cylinder type
      const getCylinderId = (cylinderId: string) => {
        const idMap: { [key: string]: number } = {
          "drinkmate": 1001,
          "sodastream": 1003,
          "errva": 1004,
          "fawwar": 1005,
          "phillips": 1006,
          "ultima-cosa": 1007,
          "bubble-bro": 1008,
          "yoco-cosa": 1009,
          "other-brand": 1010
        }
        return idMap[cylinderId] || 9999
      }

      addItem({
        id: getCylinderId(selectedCylinder),
        name: `${selectedCylinderData.name} CO2 Cylinder Refill/Exchange`,
        price: cylinderPrice,
        quantity: quantity,
        image: selectedCylinderData.image || "/images/co2-cylinder-single.png",
        category: "co2",
      })
      
      // Cart toast will be shown automatically by the cart context
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change)
    setQuantity(newQuantity)
  }

  // Button handlers
  const handleDrinkmateClick = () => {
    setCylinderType("drinkmate")
    setSelectedCylinder("drinkmate")
    setShowBlocks(true)
  }

  const handleNonDrinkmateClick = () => {
    setCylinderType("non-drinkmate")
    setShowBlocks(false) // Don't show blocks until brand is selected
  }

  const handleNonDrinkmateBrandChange = (brand: string) => {
    setNonDrinkmateBrand(brand)
    setSelectedCylinder(brand)
    setShowBlocks(true) // Show blocks after brand selection
  }

  if (loading) {
    return (
      <PageLayout currentPage="co2">
        <div className="flex flex-col items-center justify-center h-64 p-8">
          <div className="w-12 h-12 border-4 border-t-[#12d6fa] border-gray-200 rounded-full animate-spin mb-4"></div>
          <div className="text-lg font-medium">Loading CO2 cylinders...</div>
          <p className="text-gray-500 text-sm mt-2 text-center">Please wait while we retrieve the latest cylinder information.</p>
        </div>
      </PageLayout>
    )
  }
  
  if (apiError && !cylinderBrands.length) {
    return (
      <PageLayout currentPage="co2">
        <div className="flex flex-col items-center justify-center h-64 p-8 max-w-md mx-auto">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Info className="w-6 h-6 text-red-500" />
          </div>
          <div className="text-lg font-medium text-center">Unable to load cylinder data</div>
          <p className="text-gray-500 text-sm mt-2 text-center">{apiError}</p>
          <Button 
            onClick={() => setRetryCount(prev => prev + 1)} 
            className="mt-4 bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
          >
            Retry
          </Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout currentPage="refill-cylinder">
      {/* Enhanced Refill Section Carousel */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-3xl relative h-[280px] md:h-[320px] flex items-center justify-between px-4 md:px-6 overflow-hidden shadow-lg">
          {/* Enhanced Left Navigation Button */}
          <Button
            className="rounded-full w-12 h-12 flex items-center justify-center border-2 border-white bg-white/90 text-gray-700 shadow-lg z-10 hover:bg-white hover:border-[#12d6fa] hover:scale-110 transition-all duration-300 backdrop-blur-sm"
            onClick={prevRefillSlide}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Enhanced Main Content Area */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-8">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {refillSlides[currentRefillSlide].headline}
                </h2>
                <p className="text-gray-700 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                  {refillSlides[currentRefillSlide].headline === "REFILL MORE. SAVE MORE." ? (
                    <>Now refill 4 cylinders all together for the price of <SaudiRiyal amount={55} size="sm" className="font-bold text-[#12d6fa]" /> each cylinder.</>
                  ) : (
                    refillSlides[currentRefillSlide].description
                  )}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                {refillSlides[currentRefillSlide].buttonText && (
                  <Button 
                    onClick={() => window.location.href = refillSlides[currentRefillSlide].buttonText === "Refill Now" ? "/co2" : "/shop"}
                    className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {refillSlides[currentRefillSlide].buttonText}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
                {refillSlides[currentRefillSlide].offerText && (
                  <span className="text-sm text-gray-600 bg-white/80 px-4 py-2 rounded-full border border-gray-200 backdrop-blur-sm">
                    {refillSlides[currentRefillSlide].offerText}
                  </span>
                )}
              </div>
            </div>
          </div>


          {/* Enhanced Right Navigation Button */}
          <Button
            className="rounded-full w-12 h-12 flex items-center justify-center border-2 border-white bg-white/90 text-gray-700 shadow-lg z-10 hover:bg-white hover:border-[#12d6fa] hover:scale-110 transition-all duration-300 backdrop-blur-sm"
            onClick={nextRefillSlide}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Enhanced Slideshow Dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {refillSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentRefillSlide(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentRefillSlide 
                    ? "bg-[#12d6fa] scale-125 shadow-lg" 
                    : "bg-white/60 hover:bg-white/80 hover:scale-110"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                title={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Refill / Exchange Cylinder Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
       
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Side - Premium Visual (7 columns) */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden">
                {/* White Background */}
                <div className="absolute inset-0 bg-white rounded-3xl"></div>
                
                {/* Main Content */}
                <div className="relative bg-white rounded-3xl border border-gray-200 shadow-2xl p-8">
                  <div className="relative">
                    <Image
                      src="https://res.cloudinary.com/da6dzmflp/image/upload/v1757353811/drinkmate/tgxojr9o5oiihkf6tv21.png"
                      alt="CO2 Cylinders"
                      width={600}
                      height={845}
                      className="w-full h-auto object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              </div>
              
              {/* Order Summary - Hidden on mobile, shown on desktop under image */}
              {showBlocks && (
                <div className="mt-8 hidden lg:block">
                <div className="bg-white rounded-3xl border-2 border-[#12d6fa]/20 shadow-2xl p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Order Summary</h3>
                  
                  {/* Selected Cylinder Info */}
                  {selectedCylinderData && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-[#12d6fa] rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {selectedCylinderData.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{selectedCylinderData.name}</h4>
                          <p className="text-sm text-gray-600">CO2 Cylinder Refill/Exchange</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Quantity and Return Info */}
                  <div className="mb-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Quantity:</span>
                      <span className="font-semibold text-gray-900">{quantity} cylinder{quantity > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Return required:</span>
                      <span className="font-semibold text-gray-900">{quantity} empty cylinder{quantity > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Delivery time:</span>
                      <span className="font-semibold text-[#12d6fa]">3-5 business days</span>
                    </div>
                  </div>
                  
                  {/* Pricing Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Unit price:</span>
                      <span className="font-semibold text-gray-900">
                        <SaudiRiyal amount={cylinderPrice} size="sm" />
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal ({quantity} × <SaudiRiyal amount={cylinderPrice} size="sm" />):</span>
                      <span className="font-semibold text-gray-900">
                        <SaudiRiyal amount={subtotal} size="sm" />
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Delivery:</span>
                      <span className={`font-semibold ${deliveryCharge === 0 ? 'text-[#a8f387]' : 'text-gray-900'}`}>
                        {deliveryCharge === 0 ? 'FREE' : <SaudiRiyal amount={deliveryCharge} size="sm" />}
                      </span>
                    </div>
                    {selectedCylinderData && (selectedCylinderData.originalPrice * quantity) - subtotal > 0 && (
                      <div className="flex justify-between items-center text-[#a8f387]">
                        <span className="font-semibold">You save:</span>
                        <span className="font-bold">
                          <SaudiRiyal amount={(selectedCylinderData.originalPrice * quantity) - subtotal} size="sm" />
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-black text-[#12d6fa]">
                        <SaudiRiyal amount={total} size="lg" />
                      </span>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                      * Empty cylinders will be picked up from your location
                    </p>
                  </div>
                </div>
              </div>
              )}

            </div>

            {/* Right Side - Controls (5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Choose Your Cylinder header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                <div>
                  <h2 className="text-3xl font-black text-black tracking-tight">Choose Your Cylinder</h2>
                  <p className="text-gray-600 mt-2">Select your cylinder type</p>
                </div>
                <a 
                  href="/contact" 
                  className="inline-flex items-center space-x-2 text-[#12d6fa] text-sm font-semibold hover:text-[#0bc4e8] transition-colors duration-200"
                >
                  <Info className="w-4 h-4" />
                  <span>Need Help?</span>
                </a>
              </div>

              {/* Two Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleDrinkmateClick}
                  className="flex-1 h-32 bg-[#12d6fa] hover:bg-[#0bc4e8] text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  Drinkmate
                </Button>
                <Button
                  onClick={handleNonDrinkmateClick}
                  className="flex-1 h-32 bg-[#a8f387] hover:bg-[#9ae374] text-black font-bold text-lg rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  Non-Drinkmate
                </Button>
              </div>

              {/* Non-Drinkmate Standard Threaded Option */}
              {cylinderType === "non-drinkmate" && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="standard-threaded"
                      name="thread-type"
                      value="standard-threaded"
                      checked={true}
                      readOnly
                      className="w-4 h-4 text-[#a8f387]"
                    />
                    <label htmlFor="standard-threaded" className="text-lg font-semibold text-gray-900">
                      Standard Threaded
                    </label>
                          </div>

                  {/* Brand Dropdown */}
                  <Select value={nonDrinkmateBrand} onValueChange={handleNonDrinkmateBrandChange}>
                    <SelectTrigger className="w-full h-12 border-2 border-[#a8f387] rounded-xl">
                      <SelectValue placeholder="Select your brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="errva">Errva</SelectItem>
                      <SelectItem value="fawwar">Fawwar</SelectItem>
                      <SelectItem value="phillips">Phillips</SelectItem>
                      <SelectItem value="ultima-cosa">Ultima Cosa</SelectItem>
                      <SelectItem value="bubble-bro">Bubble Bro</SelectItem>
                      <SelectItem value="yoco-cosa">Yoco Cosa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              )}

              {/* Hidden Blocks - Show when button is clicked */}
              {showBlocks && (
                <>
                  {/* Premium Selected Cylinder Info - Only for Drinkmate */}
                  {selectedCylinderData && cylinderType === "drinkmate" && (
                    <div className="p-6 border border-gray-200 rounded-2xl bg-white">
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-[#12d6fa] rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Info className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-xl font-bold text-gray-900">{selectedCylinderData.name}</h4>
                            <div className="px-3 py-1 bg-[#12d6fa] text-white text-xs font-semibold rounded-full">
                            PREMIUM
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">{selectedCylinderData.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-[#a8f387] rounded-full"></div>
                            <span className="text-gray-600">Food Grade CO2</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-[#12d6fa] rounded-full"></div>
                            <span className="text-gray-600">60L Capacity</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-[#12d6fa] rounded-full"></div>
                            <span className="text-gray-600">Premium Quality</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Premium Quantity Control */}
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-black text-black mb-3">
                    Choose Your Quantity
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Select the number of premium cylinders for refill/exchange
                  </p>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-50 rounded-3xl transition-all duration-300"></div>
                  <div className="relative bg-white rounded-3xl border-2 border-[#12d6fa]/30 shadow-2xl p-8 group-hover:shadow-3xl transition-all duration-300">
                    {/* Quantity Selection Form */}
                    <div className="mb-8">
                      <label className="block text-lg font-semibold text-gray-900 mb-4">
                        Number of Cylinders to Refill/Exchange
                      </label>
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 flex items-center justify-center transition-all duration-200"
                          aria-label="Decrease quantity"
                          title="Decrease quantity"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <div className="w-20 h-12 bg-blue-50 rounded-xl flex items-center justify-center border-2 border-blue-200">
                          <span className="text-2xl font-bold text-gray-900">{quantity}</span>
                        </div>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= 10}
                          className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 flex items-center justify-center transition-all duration-200"
                          aria-label="Increase quantity"
                          title="Increase quantity"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-center text-sm text-gray-600 mt-3">
                        Please return {quantity} empty cylinder{quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    {/* Delivery Information */}
                    <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
                      <div className="flex items-center justify-center space-x-2">
                        <Truck className="w-5 h-5 text-[#12d6fa]" />
                        <span className="text-sm font-semibold text-gray-700">
                          Estimated delivery time: 3-5 business days
                        </span>
                      </div>
                    </div>
                    
                    {/* Enhanced Premium Quantity Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className={`text-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                        quantity >= 2 
                          ? 'bg-blue-100 border-blue-300 shadow-lg scale-105' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-300 ${
                          quantity >= 2 
                            ? 'bg-[#a8f387] shadow-lg scale-110' 
                            : 'bg-[#a8f387]/70'
                        }`}>
                          <span className="text-black font-black text-sm">2+</span>
                        </div>
                        <div className={`text-sm font-bold transition-colors duration-300 ${
                          quantity >= 2 ? 'text-[#a8f387]' : 'text-gray-600'
                        }`}>5% OFF</div>
                        <div className="text-xs text-gray-600 font-medium">2+ cylinders</div>
                        {quantity >= 2 && (
                          <div className="mt-1 text-xs font-semibold text-[#a8f387] animate-pulse">
                            ✓ ACTIVE
                          </div>
                        )}
                      </div>
                      <div className={`text-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                        quantity >= 3 
                          ? 'bg-blue-100 border-blue-300 shadow-lg scale-105' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-300 ${
                          quantity >= 3 
                            ? 'bg-[#12d6fa] shadow-lg scale-110' 
                            : 'bg-[#12d6fa]/70'
                        }`}>
                          <span className="text-white font-black text-sm">3+</span>
                        </div>
                        <div className={`text-sm font-bold transition-colors duration-300 ${
                          quantity >= 3 ? 'text-[#12d6fa]' : 'text-gray-600'
                        }`}>10% OFF</div>
                        <div className="text-xs text-gray-600 font-medium">3+ cylinders</div>
                        {quantity >= 3 && (
                          <div className="mt-1 text-xs font-semibold text-[#12d6fa] animate-pulse">
                            ✓ ACTIVE
                          </div>
                        )}
                      </div>
                      <div className={`text-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                        quantity >= 4 
                          ? 'bg-blue-100 border-blue-300 shadow-lg scale-105' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-300 ${
                          quantity >= 4 
                            ? 'bg-[#12d6fa] shadow-lg scale-110' 
                            : 'bg-[#12d6fa]/70'
                        }`}>
                          <span className="text-white font-black text-sm">4+</span>
                        </div>
                        <div className={`text-sm font-bold transition-colors duration-300 ${
                          quantity >= 4 ? 'text-gray-800' : 'text-gray-600'
                        }`}>15% OFF</div>
                        <div className="text-xs text-gray-600 font-medium">+ FREE delivery</div>
                        {quantity >= 4 && (
                          <div className="mt-1 text-xs font-semibold text-[#a8f387] animate-pulse">
                            ✓ ACTIVE
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Premium CTAs */}
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-50 rounded-3xl transition-all duration-300"></div>
                  <Button
                    onClick={handleAddToCart}
                    className="relative w-full bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-10 py-6 rounded-3xl font-black text-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 border-0 group-hover:shadow-3xl"
                  >
                    <ShoppingCart className="w-6 h-6 mr-4 group-hover:animate-bounce" />
                    Add Premium Cylinders to Cart
                    <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="px-8 py-4 border-2 border-[#12d6fa] rounded-2xl font-bold text-lg hover:bg-[#12d6fa] hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  >
                    <Gift className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                    Subscribe & Save 20%
                  </Button>
                  <Button
                    variant="outline"
                    className="px-8 py-4 border-2 border-[#12d6fa] rounded-2xl font-bold text-lg hover:bg-[#12d6fa] hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  >
                    <Star className="w-5 h-5 mr-3 group-hover:animate-spin" />
                    Premium Membership
                  </Button>
                </div>
                
                {/* Additional Premium Features */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">Why Choose Our Premium Service?</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#a8f387] flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">Food-grade CO2 certified</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#12d6fa] flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">3-5 day turnaround</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#a8f387] flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">Home pickup & delivery</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#12d6fa] flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">Quality guaranteed</span>
                    </div>
                  </div>
                </div>

                {/* Order Summary - Mobile only, appears under Why Choose Our Premium Service */}
                <div className="lg:hidden mt-6">
                  <div className="bg-white rounded-3xl border-2 border-[#12d6fa]/20 shadow-2xl p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Order Summary</h3>
                    
                    {/* Selected Cylinder Info */}
                    {selectedCylinderData && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-[#12d6fa] rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {selectedCylinderData.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{selectedCylinderData.name}</h4>
                            <p className="text-sm text-gray-600">CO2 Cylinder Refill/Exchange</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Quantity and Return Info */}
                    <div className="mb-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Quantity:</span>
                        <span className="font-semibold text-gray-900">{quantity} cylinder{quantity > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Return required:</span>
                        <span className="font-semibold text-gray-900">{quantity} empty cylinder{quantity > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Delivery time:</span>
                        <span className="font-semibold text-[#12d6fa]">3-5 business days</span>
                      </div>
                    </div>
                    
                    {/* Pricing Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Unit price:</span>
                        <span className="font-semibold text-gray-900">
                          <SaudiRiyal amount={cylinderPrice} size="sm" />
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Subtotal ({quantity} × <SaudiRiyal amount={cylinderPrice} size="sm" />):</span>
                        <span className="font-semibold text-gray-900">
                          <SaudiRiyal amount={subtotal} size="sm" />
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Delivery:</span>
                        <span className={`font-semibold ${deliveryCharge === 0 ? 'text-[#a8f387]' : 'text-gray-900'}`}>
                          {deliveryCharge === 0 ? 'FREE' : <SaudiRiyal amount={deliveryCharge} size="sm" />}
                        </span>
                      </div>
                      {selectedCylinderData && (selectedCylinderData.originalPrice * quantity) - subtotal > 0 && (
                        <div className="flex justify-between items-center text-[#a8f387]">
                          <span className="font-semibold">You save:</span>
                          <span className="font-bold">
                            <SaudiRiyal amount={(selectedCylinderData.originalPrice * quantity) - subtotal} size="sm" />
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Total */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Total:</span>
                        <span className="text-2xl font-black text-[#12d6fa]">
                          <SaudiRiyal amount={total} size="lg" />
                        </span>
                      </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-6 text-center">
                      <p className="text-xs text-gray-500">
                        * Empty cylinders will be picked up from your location
                      </p>
                    </div>
                  </div>
                </div>
              </div>

                </>
              )}

            </div>
          </div>

          {/* Horizontal Divider */}
          <div className="w-full h-px bg-gray-300 my-12"></div>

          {/* Enhanced How Refill/Exchange Works Section */}
          <div className="py-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
                How Refill/Exchange Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our streamlined process makes cylinder refill and exchange simple and convenient
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-full h-80 bg-blue-50 rounded-3xl mb-6 flex items-center justify-center group-hover:shadow-2xl transition-all duration-300 border-2 border-blue-200">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-[#12d6fa] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <ShoppingCart className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-[#12d6fa] font-bold text-lg">Order Online</p>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Order Online</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Select your cylinder type and quantity, then place your order through our website with just a few clicks.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-full h-80 bg-blue-50 rounded-3xl mb-6 flex items-center justify-center group-hover:shadow-2xl transition-all duration-300 border-2 border-blue-200">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-[#12d6fa] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <Truck className="w-12 h-12 text-black" />
                      </div>
                      <p className="text-[#12d6fa] font-bold text-lg">Schedule Pickup</p>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Schedule Pickup</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We'll schedule a convenient time to pick up your empty cylinders from your location at no extra cost.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-full h-80 bg-blue-50 rounded-3xl mb-6 flex items-center justify-center group-hover:shadow-2xl transition-all duration-300 border-2 border-blue-200">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-[#12d6fa] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <Shield className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-[#12d6fa] font-bold text-lg">Receive Refilled</p>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Receive Refilled Cylinders</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Get your freshly refilled CO2 cylinders delivered to your door within 3-5 business days, ready to use.
                </p>
              </div>
            </div>
            
          </div>

          {/* Horizontal Divider */}
          <div className="w-full h-px bg-gray-300 my-12"></div>

          {/* Enhanced Tab Section */}
          <div className="py-16">
            <div className="max-w-5xl mx-auto">
              {/* Enhanced Tab Headers */}
              <div className="flex w-full mb-12 bg-gray-100 rounded-2xl p-2">
                <button 
                  onClick={() => setActiveTab("faqs")}
                  className={`flex-1 py-4 px-8 font-bold text-center transition-all duration-300 rounded-xl ${
                    activeTab === "faqs" 
                      ? "bg-[#12d6fa] text-white shadow-lg scale-105" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Info className="w-5 h-5" />
                    <span>FAQs</span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab("description")}
                  className={`flex-1 py-4 px-8 font-bold text-center transition-all duration-300 rounded-xl ${
                    activeTab === "description" 
                      ? "bg-[#12d6fa] text-white shadow-lg scale-105" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Description</span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 py-4 px-8 font-bold text-center transition-all duration-300 rounded-xl ${
                    activeTab === "reviews" 
                      ? "bg-[#12d6fa] text-white shadow-lg scale-105" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Reviews</span>
                  </div>
                </button>
              </div>

              {/* Enhanced Tab Content */}
              <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                {activeTab === "faqs" && (
                  <div>
                    <div className="text-center mb-12">
                      <h3 className="text-3xl font-black text-black mb-4">Frequently Asked Questions</h3>
                      <p className="text-gray-600 text-lg">Everything you need to know about our premium cylinder service</p>
                    </div>
                    <div className="space-y-6">
                      {[
                        {
                          question: "How long does the refill/exchange process take?",
                          answer: "Our standard turnaround time is 3-5 business days from pickup to delivery. We'll schedule a convenient pickup time and notify you when your refilled cylinders are ready for delivery."
                        },
                        {
                          question: "What cylinder brands do you accept?",
                          answer: "We accept cylinders from all major brands including Drinkmate, SodaStream, Errva, Fawwar, Phillips, and many others. If you're unsure about compatibility, please contact our support team."
                        },
                        {
                          question: "Is the CO2 food-grade and safe?",
                          answer: "Yes, we only use premium food-grade CO2 that meets all safety and quality standards for beverage use. Each cylinder is thoroughly tested and filled according to industry regulations."
                        },
                        {
                          question: "Do I need to return the same number of cylinders?",
                          answer: "Yes, please ensure you return the same number of empty cylinders as you're ordering refilled ones. This helps us maintain our exchange program efficiently."
                        },
                        {
                          question: "What are the quantity discounts?",
                          answer: "We offer tiered pricing: 5% off for 2+ cylinders, 10% off for 3+ cylinders, and 15% off for 4+ cylinders. Plus, orders of 4+ cylinders get FREE delivery!"
                        }
                      ].map((faq, index) => (
                        <div key={index} className="border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#12d6fa]/30 transition-all duration-300 group">
                          <button
                            onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                            className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-blue-50 transition-all duration-300 group-hover:scale-[1.02]"
                          >
                            <span className="font-bold text-black text-xl group-hover:text-[#12d6fa] transition-colors duration-300">{faq.question}</span>
                            <ChevronDown 
                              className={`w-6 h-6 text-[#12d6fa] transition-all duration-300 group-hover:scale-110 ${
                                openFAQ === index ? "rotate-180" : ""
                              }`} 
                            />
                          </button>
                          {openFAQ === index && (
                            <div className="px-8 pb-6 bg-blue-50 border-t border-blue-200">
                              <p className="text-gray-700 leading-relaxed text-lg pt-2">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "description" && (
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-8">Product Description</h3>
                    <div className="grid md:grid-cols-2 gap-12">
                      {/* Left Side - Text */}
                      <div className="space-y-6">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          Our CO2 cylinder refill and exchange service provides you with fresh, food-grade CO2 
                          for your sparkling water maker. Each cylinder is thoroughly tested and filled to the 
                          highest safety standards.
                        </p>
                        <div>
                          <h4 className="font-bold text-black text-xl mb-4">Key Features:</h4>
                          <div className="space-y-3">
                            {[
                              "Food-grade CO2 certified for beverage use",
                              "Compatible with all major soda maker brands",
                              "Each cylinder carbonates up to 60 liters of water",
                              "Convenient home pickup and delivery service",
                              "3-5 business day turnaround time",
                              "Thoroughly tested for safety and quality",
                              "Quantity discounts for bulk orders",
                              "Free delivery for 4+ cylinders"
                            ].map((feature, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-[#a8f387] rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-gray-700">{feature}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          We ensure that every cylinder meets strict quality and safety standards before delivery. 
                          Our refill process uses only premium CO2 that's perfect for creating delicious sparkling water.
                        </p>
                      </div>
                      
                      {/* Right Side - Image */}
                      <div className="flex items-center justify-center">
                        <div className="bg-gray-50 rounded-2xl p-8 w-full">
                          <Image
                            src="/images/food-grade-co2-text.png"
                            alt="CO2 Cylinder Description"
                            width={300}
                            height={400}
                            className="object-contain w-full h-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-8">Customer Reviews</h3>
                    <div className="space-y-6">
                      {[
                        {
                          name: "Ahmed Al-Hassan",
                          rating: 5,
                          date: "2 weeks ago",
                          review: "Excellent service! The pickup and delivery was right on time, and the refilled cylinders work perfectly. Very convenient and reliable."
                        },
                        {
                          name: "Sarah Mohamed",
                          rating: 5,
                          date: "1 month ago", 
                          review: "Great quality CO2 and fast turnaround time. The exchange process was smooth and hassle-free. Highly recommended!"
                        },
                        {
                          name: "Fatima Al-Zahra",
                          rating: 5,
                          date: "1 week ago",
                          review: "Perfect for our SodaStream! The CO2 quality is excellent and the home pickup service saves so much time. Will definitely use again."
                        }
                      ].map((review, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-black text-lg">{review.name}</h4>
                              <div className="flex items-center space-x-3 mt-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${
                                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}





