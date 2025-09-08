"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Minus, ChevronDown, Star, ShoppingCart, Info, Truck, Shield, RotateCcw, CheckCircle } from "lucide-react"
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/translation-context"
import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import { co2API } from "@/lib/api"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

export default function CO2() {
  const { t, isRTL } = useTranslation()
  const { addItem } = useCart()
  
  // Slideshow state (same as shop page)
  const refillSlides = [
    {
      headline: "REFILL MORE. SAVE MORE.",
      description: "Now refill 4 cylinders all together for the price of 55 ﷼ each cylinder.",
      buttonText: "Refill Now",
      offerText: "*Offer valid for whole year*",
      imageSrc: "/images/co2-cylinders.png",
      imageAlt: "CO2 Cylinders",
      showYellowCircle: true,
      yellowCircleData: {
        carbonatesUpto: "Carbonates up to",
        liters: "60",
        litersOfDrink: "Liters of Drink",
      },
      multiImages: [],
    },
    {
      headline: "PREMIUM ITALIAN FLAVORS NOW AVAILABLE",
      description: "Experience authentic taste with our new premium Italian flavor collection.",
      buttonText: "",
      offerText: "",
      imageSrc: "/images/energy-cola-flavors.png",
      imageAlt: "Energy Drink & Cola Flavor",
      showYellowCircle: false,
      yellowCircleData: null,
      multiImages: [],
    },
    {
      headline: "5% OFF ON FIRST ORDER FOR OUR NEW CUSTOMERS",
      description: "Getting into sparkle game? Enjoy 5% off on your first order with drinkmate.",
      buttonText: "",
      offerText: "",
      imageSrc: null,
      imageAlt: "Drinkmate products",
      showYellowCircle: false,
      yellowCircleData: null,
      multiImages: [
        {
          src: "/images/drinkmate-machine.png",
          alt: "Drinkmate Machine",
          width: 121,
          height: 345,
          top: 18,
          left: 824,
          zIndex: 2,
        },
        {
          src: "/images/co2-cylinder-single.png",
          alt: "CO2 Cylinder",
          width: 340,
          height: 340,
          top: 28,
          left: 781,
          zIndex: 1,
        },
        {
          src: "/images/strawberry-lemon-flavor.png",
          alt: "Strawberry Lemon Flavor",
          width: 55,
          height: 157,
          top: 135,
          left: 984,
          zIndex: 3,
        },
      ],
    },
  ]

  const [currentRefillSlide, setCurrentRefillSlide] = useState(0)
  const [selectedCylinder, setSelectedCylinder] = useState("drinkmate")
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("faqs")
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

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

  // Fetch cylinders from API
  useEffect(() => {
    const fetchCylinders = async () => {
      try {
        setLoading(true)
        // Use co2API instead of direct fetch
        const response = await co2API.getCylinders();
        
        if (response.success) {
          // Transform API data to match the expected format
          const transformedCylinders = response.cylinders.map((cylinder: any) => ({
            id: cylinder._id,
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
        } else {
          console.error('Failed to fetch cylinders:', response.message)
        }
      } catch (error) {
        console.error('Error fetching cylinders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCylinders()
  }, [])

  // Get selected cylinder data
  const selectedCylinderData = cylinderBrands.find(brand => brand.id === selectedCylinder)
  
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
      addItem({
        id: 999 + cylinderBrands.findIndex(brand => brand.id === selectedCylinder), // Unique ID for each cylinder type
        name: `${selectedCylinderData.name} CO2 Cylinder Refill/Exchange`,
        price: cylinderPrice,
        quantity: quantity,
        image: selectedCylinderData.image,
        category: "co2",
      })
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change)
    setQuantity(newQuantity)
  }

  if (loading) {
    return (
      <PageLayout currentPage="co2">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading CO2 cylinders...</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout currentPage="refill-cylinder">
      {/* Refill Section Carousel - Same as shop page */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto bg-[#f3f3f3] rounded-3xl relative h-[250px] flex items-center justify-between px-6">
          {/* Left Navigation Button */}
          <Button
            className="rounded-full w-10 h-10 flex items-center justify-center border border-gray-300 bg-white text-gray-700 shadow-sm z-10 hover:bg-gray-100 hover:border-gray-400"
            onClick={prevRefillSlide}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Main Content Area */}
          <div className="absolute" style={{ top: "44px", left: "125px" }}>
            <div className="w-[520px] h-[138px] flex flex-col justify-between">
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-black leading-tight">{refillSlides[currentRefillSlide].headline}</h2>
                                 <p className="text-gray-700 text-[15px] whitespace-nowrap">
                   {refillSlides[currentRefillSlide].headline === "REFILL MORE. SAVE MORE." ? (
                     <>Now refill 4 cylinders all together for the price of <SaudiRiyal amount={55} size="sm" /> each cylinder.</>
                   ) : (
                     refillSlides[currentRefillSlide].description
                   )}
                 </p>
              </div>
              <div className="flex items-center space-x-4">
                {refillSlides[currentRefillSlide].buttonText && (
                  <Button 
                    onClick={() => window.location.href = refillSlides[currentRefillSlide].buttonText === "Refill Now" ? "/co2" : "/shop"}
                    className="bg-[#a8f387] hover:bg-[#9ae374] text-black font-medium px-6 py-3 rounded-full"
                  >
                    {refillSlides[currentRefillSlide].buttonText}
                  </Button>
                )}
                {refillSlides[currentRefillSlide].offerText && <span className="text-sm text-gray-500">{refillSlides[currentRefillSlide].offerText}</span>}
              </div>
            </div>
          </div>

          {/* Product Image Container */}
          {refillSlides[currentRefillSlide].imageSrc ? (
            <div className="absolute right-[100px] h-full flex justify-center items-center">
              <Image
                src={refillSlides[currentRefillSlide].imageSrc || "/placeholder.svg"}
                alt={refillSlides[currentRefillSlide].imageAlt}
                width={300}
                height={200}
                className="object-cover w-auto h-full"
              />
              {/* Yellow 60 Liters Circle */}
              {refillSlides[currentRefillSlide].showYellowCircle && refillSlides[currentRefillSlide].yellowCircleData && (
                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full w-28 h-28 flex flex-col items-center justify-center text-white font-bold text-center p-2 shadow-md">
                  <span className="text-[10px]">{refillSlides[currentRefillSlide].yellowCircleData.carbonatesUpto}</span>
                  <span className="text-4xl">{refillSlides[currentRefillSlide].yellowCircleData.liters}</span>
                  <span className="text-[10px]">{refillSlides[currentRefillSlide].yellowCircleData.litersOfDrink}</span>
                </div>
              )}
            </div>
          ) : (
            // Multi-image container for the third slide, positioned absolutely within the main gray container
            <div className="absolute inset-0">
              {refillSlides[currentRefillSlide].multiImages &&
                refillSlides[currentRefillSlide].multiImages.map((img, index) => (
                  <Image
                    key={index}
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    className="absolute object-contain"
                    style={{ top: `${img.top}px`, left: `${img.left}px`, zIndex: img.zIndex }}
                  />
                ))}
            </div>
          )}

          {/* Right Navigation Button */}
          <Button
            className="rounded-full w-10 h-10 flex items-center justify-center border border-gray-300 bg-white text-gray-700 shadow-sm z-10 hover:bg-gray-100 hover:border-gray-400"
            onClick={nextRefillSlide}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Slideshow Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {refillSlides.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${index === currentRefillSlide ? "bg-yellow-400" : "bg-gray-300"}`}
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* Refill / Exchange Cylinder Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-black text-center mb-8">
            Refill / Exchange Cylinder
          </h1>
          
          {/* Horizontal Divider */}
          <div className="w-full h-px bg-gray-300 mb-12"></div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side - Large Cylinder Image */}
            <div className="flex items-center justify-center">
              <div className="w-[600px] h-[845px] rounded-[20px] overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <Image
                  src="/images/co2-cylinder-new.png"
                  alt="CO2 Cylinders"
                  width={600}
                  height={845}
                  className="object-contain w-full h-full p-8"
                />
              </div>
            </div>

            {/* Right Side - Cylinder Selection */}
            <div>
              {/* Select a cylinder header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">Select a cylinder</h2>
                <a href="#" className="text-blue-600 text-sm hover:underline">Need Help?</a>
              </div>

              {/* Drinkmate Cylinder Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-black mb-4">Drinkmate Cylinder</h3>
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <button 
                    onClick={() => setSelectedCylinder("drinkmate")}
                    className={`w-[150px] h-[150px] rounded-[10px] border-2 transition-all flex flex-col items-center justify-center ${
                      selectedCylinder === "drinkmate" 
                        ? "border-[#a8f387] bg-[#a8f387]/20" 
                        : "border-gray-200 bg-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src="/images/co2-cylinder.png"
                      alt="Drinkmate cylinder"
                      width={60}
                      height={60}
                      className="mb-2 object-contain"
                    />
                    <p className="text-sm font-medium text-black">Drinkmate</p>
                                         <p className="text-xs text-green-600 font-semibold"><SaudiRiyal amount={65} size="sm" /></p>
                  </button>
                  <button 
                    onClick={() => setSelectedCylinder("other-to-drinkmate")}
                    className={`w-[150px] h-[150px] rounded-[10px] border-2 transition-all flex flex-col items-center justify-center ${
                      selectedCylinder === "other-to-drinkmate" 
                        ? "border-[#a8f387] bg-[#a8f387]/20" 
                        : "border-gray-200 bg-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src="/images/co2-cylinder-single.png"
                      alt="Other brand cylinder"
                      width={60}
                      height={60}
                      className="mb-2 object-contain"
                    />
                    <p className="text-xs font-medium text-black text-center px-2">Other brand to Drinkmate</p>
                                         <p className="text-xs text-green-600 font-semibold"><SaudiRiyal amount={75} size="sm" /></p>
                  </button>
                </div>
              </div>

              {/* Other brand cylinders */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Other brand cylinders</h3>
                <div className="grid grid-cols-3 gap-4">
                  {cylinderBrands.slice(2).map((brand) => (
                    <button 
                      key={brand.id}
                      onClick={() => setSelectedCylinder(brand.id)}
                      className={`w-[120px] h-[120px] rounded-[10px] border-2 transition-all flex flex-col items-center justify-center ${
                        selectedCylinder === brand.id 
                          ? "border-[#a8f387] bg-[#a8f387]/20" 
                          : "border-gray-200 bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={brand.image}
                        alt={`${brand.name} cylinder`}
                        width={40}
                        height={40}
                        className="mb-2 object-contain"
                      />
                      <p className="text-xs font-medium text-black text-center">{brand.name}</p>
                                             <p className="text-xs text-green-600 font-semibold"><SaudiRiyal amount={brand.price} size="sm" /></p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Cylinder Info */}
              {selectedCylinderData && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">{selectedCylinderData.name}</h4>
                      <p className="text-sm text-blue-800">{selectedCylinderData.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                                                 <span className="text-lg font-bold text-blue-900"><SaudiRiyal amount={selectedCylinderData.price} size="lg" /></span>
                         <span className="text-sm text-blue-600 line-through"><SaudiRiyal amount={selectedCylinderData.originalPrice} size="sm" /></span>
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium">
                          {selectedCylinderData.discount}% OFF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Horizontal Divider */}
          <div className="w-full h-px bg-gray-300 my-12"></div>

          {/* Quantity and Pricing Section */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side - Text and Info */}
            <div>
              <h3 className="text-xl font-bold text-black mb-6">
                How many cylinders would you like to refill/exchange?
              </h3>
              
              <div className="flex items-center space-x-4 mb-6">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-3xl font-bold text-black w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Quantity Benefits */}
              <div className="space-y-3 mb-6">
                {quantity >= 2 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">5% off for 2+ cylinders</span>
                  </div>
                )}
                {quantity >= 3 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">10% off for 3+ cylinders</span>
                  </div>
                )}
                {quantity >= 4 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">15% off for 4+ cylinders + FREE delivery</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>Please make sure to return {quantity} empty cylinder{quantity > 1 ? 's' : ''}</p>
                <p>Estimated delivery time 3-5 business days</p>
              </div>
            </div>

            {/* Right Side - Buttons and Pricing */}
            <div className="space-y-6">
              {/* Buttons at the top */}
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleAddToCart}
                  className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-8 py-3 rounded-lg font-medium"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  ADD TO CART
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium"
                >
                  Subscribe to save
                </Button>
              </div>

              {/* Free delivery text */}
              {quantity >= 4 ? (
                <p className="text-green-600 text-sm font-medium flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  FREE delivery unlocked! 🎉
                </p>
              ) : (
                <p className="text-blue-600 text-sm">Add {4 - quantity} more cylinder{4 - quantity > 1 ? 's' : ''} for FREE delivery</p>
              )}
              
              {/* Pricing section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-black">Total</span>
                  <span className="text-2xl font-bold text-black"><SaudiRiyal amount={total} size="xl" /></span>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <p className="text-gray-500 text-xs mb-3 font-medium">Cost breakdown</p>
                  <div className="flex justify-between items-center">
                    <span>Refill / Exchange cylinder</span>
                    <span className="text-gray-800 font-medium">×{quantity}</span>
                                         <span className="text-right font-medium"><SaudiRiyal amount={subtotal} size="sm" /></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Charges</span>
                    <span></span>
                    <span className={`text-right font-medium ${deliveryCharge === 0 ? 'text-green-600' : ''}`}>
                                             {deliveryCharge === 0 ? 'FREE' : <SaudiRiyal amount={deliveryCharge} size="sm" />}
                    </span>
                  </div>
                  {quantity >= 2 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Quantity Discount</span>
                      <span></span>
                      <span className="text-right font-medium">
                                                 -<SaudiRiyal amount={((selectedCylinderData?.price || 0) * quantity - subtotal)} size="sm" />
                      </span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Savings</span>
                    <span></span>
                    <span className="text-right text-green-600">
                      {selectedCylinderData ? 
                        ((selectedCylinderData.originalPrice * quantity) - subtotal).toFixed(2) 
                                                 : '0.00'} <SaudiRiyal amount={0} size="sm" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Divider */}
          <div className="w-full h-px bg-gray-300 my-12"></div>

          {/* How Refill/Exchange Works Section */}
          <div className="py-12">
            <h2 className="text-3xl font-bold text-black text-center mb-12">
              How Refill/Exchange Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-blue-600 font-medium">Order Online</p>
                  </div>
                </div>
                <div className="bg-[#a8f387] text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Order Online</h3>
                <p className="text-gray-600 text-sm">
                  Select your cylinder type and quantity, then place your order through our website.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-full h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Truck className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-green-600 font-medium">Schedule Pickup</p>
                  </div>
                </div>
                <div className="bg-[#a8f387] text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Schedule Pickup</h3>
                <p className="text-gray-600 text-sm">
                  We'll schedule a convenient time to pick up your empty cylinders from your location.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-full h-64 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-10 h-10 text-purple-600" />
                    </div>
                    <p className="text-purple-600 font-medium">Receive Refilled</p>
                  </div>
                </div>
                <div className="bg-[#a8f387] text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Receive Refilled Cylinders</h3>
                <p className="text-gray-600 text-sm">
                  Get your freshly refilled CO2 cylinders delivered to your door within 3-5 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Horizontal Divider */}
          <div className="w-full h-px bg-gray-300 my-12"></div>

          {/* Tab Section */}
          <div className="py-12">
            <div className="max-w-4xl mx-auto">
              {/* Tab Headers */}
              <div className="flex w-full mb-8">
                <button 
                  onClick={() => setActiveTab("faqs")}
                  className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 ${
                    activeTab === "faqs" 
                      ? "bg-[#f4c430] text-black shadow-lg" 
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  } rounded-l-xl`}
                >
                  FAQS
                </button>
                <button 
                  onClick={() => setActiveTab("description")}
                  className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 ${
                    activeTab === "description" 
                      ? "bg-[#f4c430] text-black shadow-lg" 
                      : "bg-white text-gray-600 hover:bg-gray-50 border-t border-b border-gray-200"
                  }`}
                >
                  Description
                </button>
                <button 
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 ${
                    activeTab === "reviews" 
                      ? "bg-[#f4c430] text-black shadow-lg" 
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  } rounded-r-xl`}
                >
                  Reviews
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                {activeTab === "faqs" && (
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-8">Frequently Asked Questions</h3>
                    <div className="space-y-4">
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
                        <div key={index} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
                          <button
                            onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                            className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                          >
                            <span className="font-semibold text-black text-lg">{faq.question}</span>
                            <ChevronDown 
                              className={`w-5 h-5 text-[#12d6fa] transition-transform duration-200 ${
                                openFAQ === index ? "rotate-180" : ""
                              }`} 
                            />
                          </button>
                          {openFAQ === index && (
                            <div className="px-6 pb-5 bg-gray-50">
                              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
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