"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import PageLayout from "@/components/layout/PageLayout"
import { Star, Loader2, Check, Heart, Share2, Plus, Minus, Truck, Shield, Zap, Award, Users, Package, Recycle, Leaf, Gauge, Settings, Filter, X, ChevronLeft, ChevronRight, Maximize2, Bell, Clock, CheckCircle, AlertCircle, Info, Sparkles, TrendingUp, Calendar, MessageCircle, Play, Eye, ArrowLeft, ThumbsUp, ChevronDown, ChevronUp, Copy, Facebook, Twitter, ShoppingCart } from "lucide-react"
import { shopAPI } from "@/lib/api"
import FeedbackSection from "@/components/product/FeedbackSection"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define bundle type
interface Bundle {
  _id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  category: string
  description: string
  badge?: {
    text: string
    color: string
  }
  items: Array<{
    product: string
    name: string
    price: number
    image?: string
  }>
  stock: number
  sku: string
  averageRating: number
  reviewCount: number
  isLimited: boolean
  isFeatured: boolean
}

// FAQ data for bundles
const bundleFAQ = [
  {
    id: 1,
    question: "What's included in this bundle?",
    answer: "This bundle includes all the essential components to get you started with making sparkling drinks at home. Check the 'Bundle Contents' section for a complete list of items.",
  },
  {
    id: 2,
    question: "How much can I save with this bundle?",
    answer: "Bundle savings vary by product, but typically you can save 15-30% compared to buying items individually. The exact savings are shown in the pricing section.",
  },
  {
    id: 3,
    question: "Is this bundle suitable for beginners?",
    answer: "Yes! Our bundles are designed to be beginner-friendly and include everything you need to start making sparkling drinks immediately.",
  },
  {
    id: 4,
    question: "Can I customize this bundle?",
    answer: "While bundles are pre-configured for the best value, you can contact our support team to discuss customization options for your specific needs.",
  },
]

// Benefits data for bundles
const bundleBenefits = [
  {
    id: 1,
    title: "Complete Solution",
    description: "Everything you need in one package",
    icon: (
      <Package className="w-7 h-7 text-[#12d6fa]" />
    ),
  },
  {
    id: 2,
    title: "Best Value",
    description: "Save money with bundle pricing",
    icon: (
      <Award className="w-7 h-7 text-[#12d6fa]" />
    ),
  },
  {
    id: 3,
    title: "Easy Setup",
    description: "Ready to use out of the box",
    icon: (
      <Zap className="w-7 h-7 text-[#12d6fa]" />
    ),
  },
  {
    id: 4,
    title: "Quality Guaranteed",
    description: "Premium products with warranty",
    icon: (
      <Shield className="w-7 h-7 text-[#12d6fa]" />
    ),
  },
]

export default function BundleDetailPage() {
  const { slug } = useParams() as { slug: string }
  const { addItem, isInCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [activeImage, setActiveImage] = useState("")
  const [reviews, setReviews] = useState<any[]>([])
  
  // Enhanced state management
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [activeTab, setActiveTab] = useState("description")
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showNotifyMe, setShowNotifyMe] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState("")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    name: "",
    pros: "",
    cons: "",
    wouldRecommend: true,
  })
  const [reviewFilter, setReviewFilter] = useState("all")
  const [reviewSort, setReviewSort] = useState("newest")
  const [cartAnimation, setCartAnimation] = useState(false)
  const [wishlistAnimation, setWishlistAnimation] = useState(false)
  
  // Additional state for enhanced functionality
  const [selectedImage, setSelectedImage] = useState(0)
  const [isShowingVideo, setIsShowingVideo] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [expandedQA, setExpandedQA] = useState<number[]>([])
  const [qaData, setQAData] = useState<any[]>([])
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "General",
    tags: ""
  })
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [qaFilter, setQAFilter] = useState("all")
  const [isVideoMuted, setIsVideoMuted] = useState(true)

  // Fetch bundle data
  const fetchBundle = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching sodamaker bundle details for slug:', slug);
      
  const response = await shopAPI.getBundleFlexible(slug)
      console.log('Sodamaker bundle fetch successful:', response.bundle?.name);
      console.log('Bundle API Response:', response)
      console.log('Bundle data:', response.bundle)
      console.log('Bundle items:', response.bundle.items)
      
      setBundle(response.bundle)
      setReviews(response.reviews || [])
      
      // Set default active image
      if (response.bundle.images && response.bundle.images.length > 0) {
        setActiveImage(response.bundle.images[0])
      }
      
    } catch (error) {
      console.error("Error fetching sodamaker bundle:", error)
      setError("Failed to load bundle. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (slug) {
      fetchBundle()
    }
  }, [slug])

  const handleAddToCart = () => {
    if (!bundle) return
    
    setCartAnimation(true)
    
    // Add the bundle as a single item
    addItem({
      id: bundle._id,
      name: bundle.name,
      price: bundle.price,
      quantity: quantity,
      image: bundle.images[0],
      category: "bundle",
      isBundle: true
    })
    
    setTimeout(() => {
      setCartAnimation(false)
    }, 1000)
  }

  const handleAddToWishlist = () => {
    if (!bundle) return

    setWishlistAnimation(true)
    setIsInWishlist(!isInWishlist)

    setTimeout(() => {
      setWishlistAnimation(false)
    }, 500)
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, Math.min(bundle?.stock || 1, quantity + change))
    setQuantity(newQuantity)
  }

  const handleShare = (platform: string) => {
    if (!bundle) return
    const url = typeof window !== "undefined" ? window.location.href : ""
    const text = `Check out this amazing ${bundle.name} - ${bundle.description.substring(0, 100)}...`

    switch (platform) {
      case "facebook":
        if (typeof window !== "undefined") {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        }
        break
      case "twitter":
        if (typeof window !== "undefined") {
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          )
        }
        break
      case "whatsapp":
        if (typeof window !== "undefined") {
          window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`)
        }
        break
      case "copy":
        if (typeof window !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(url)
          alert("Link copied to clipboard!")
        }
        break
    }
    setShowShareMenu(false)
  }

  const stockMessage = () => {
    if (!bundle) return "In stock"
    if (bundle.stock === 0) return "Out of stock"
    if (bundle.stock <= 5) return `Only ${bundle.stock} left in stock!`
    if (bundle.stock <= 10) return `${bundle.stock} in stock`
    return "In stock"
  }

  const getStockColor = () => {
    if (!bundle) return "text-green-600"
    if (bundle.stock === 0) return "text-red-600"
    if (bundle.stock <= 5) return "text-orange-600"
    return "text-green-600"
  }

  const filteredReviews = () => {
    let filtered = reviews

    if (reviewFilter !== "all") {
      const rating = Number.parseInt(reviewFilter)
      filtered = filtered.filter((review) => review.rating === rating)
    }

    switch (reviewSort) {
      case "newest":
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      case "oldest":
        return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      case "highest":
        return filtered.sort((a, b) => b.rating - a.rating)
      case "lowest":
        return filtered.sort((a, b) => a.rating - b.rating)
      case "helpful":
        return filtered.sort((a, b) => b.helpful - a.helpful)
      default:
        return filtered
    }
  }

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      )
    }
    return <div className="flex">{stars}</div>
  }

  if (isLoading) {
    return (
      <PageLayout currentPage="shop-sodamakers">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#12d6fa] mb-4" />
            <p className="text-gray-600">Loading bundle...</p>
          </div>
        </div>
      </PageLayout>
    )
  }
  
  if (error || !bundle) {
    return (
      <PageLayout currentPage="shop-sodamakers">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            {error || "Bundle not found"}
          </div>
          <Link href="/shop/sodamakers" className="text-blue-600 hover:underline">
            &larr; Back to Soda Makers
          </Link>
        </div>
      </PageLayout>
    )
  }
  
  // Calculate discount percentage
  const discountPercentage = bundle.originalPrice 
    ? Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100) 
    : 0

  // Calculate savings amount
  const savingsAmount = bundle.originalPrice 
    ? bundle.originalPrice - bundle.price
    : 0
  
  return (
    <PageLayout currentPage="shop-sodamakers">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Back Button with breadcrumb */}
        <div className="mb-6 space-y-4">
          <Link
            href="/shop/sodamakers"
            className="inline-flex items-center text-[#12d6fa] hover:text-[#0fb8d9] transition-all duration-200 hover:translate-x-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Soda Makers
          </Link>

          {/* Enhanced Breadcrumb */}
          <nav className="text-sm text-muted-foreground flex items-center space-x-2">
            <Link href="/" className="hover:text-[#12d6fa] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop/sodamakers" className="hover:text-[#12d6fa] transition-colors">
              Soda Makers
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop/sodamakers" className="hover:text-[#12d6fa] transition-colors">
              Bundles
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{bundle.name}</span>
          </nav>
        </div>

        <div className="flex gap-8">
          {/* Enhanced Sidebar Controls */}
          <div className="w-16 flex flex-col space-y-4">
            {/* Favorite Button */}
            <button
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 group"
              onClick={() => alert("Wishlist feature coming soon!")}
              aria-label="Add to favorites"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Share Button */}
            <button
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 group"
              onClick={() => alert("Share feature coming soon!")}
              aria-label="Share product"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Compare Button */}
            <button
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 group"
              onClick={() => alert("Compare feature coming soon!")}
              aria-label="Compare products"
            >
              <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {/* Enhanced Bundle Images */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={activeImage || (bundle.images && bundle.images.length > 0 ? bundle.images[0] : "/images/04 - Kits/Starter-Kit---Example---Do-Not-Use.png")}
                alt={bundle.name}
                    fill
                    className="object-contain"
                  />
                  
                  {/* Enhanced Badges */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    {bundle.originalPrice && bundle.originalPrice > bundle.price && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        {discountPercentage}% OFF
                      </span>
                    )}
                    {bundle.isFeatured && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        <Award className="w-3 h-3 mr-1 inline" />
                        Featured
                      </span>
                    )}
                    {bundle.isLimited && (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        <Clock className="w-3 h-3 mr-1 inline" />
                        Limited
                      </span>
                    )}
                  </div>
            </div>
            
            {/* Thumbnail images */}
            {bundle.images && bundle.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {bundle.images.map((image, index) => (
                  <div 
                    key={index}
                        className={`border-2 rounded-lg p-2 cursor-pointer transition-all duration-200 ${
                          activeImage === image ? 'border-[#12d6fa] shadow-md' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    onClick={() => setActiveImage(image)}
                  >
                    <Image
                      src={image}
                      alt={bundle.name}
                      width={80}
                      height={80}
                          className="object-contain h-16 w-full rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
              {/* Enhanced Bundle Info */}
              <div className="space-y-6">
          <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{bundle.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              {renderStars(bundle.averageRating || 4.8)}
              <span className="text-sm text-gray-600">({bundle.reviewCount || 0} Reviews)</span>
            </div>
            
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-gray-900">
                        <SaudiRiyal amount={bundle.price} size="lg" />
                      </span>
                {bundle.originalPrice && (
                  <>
                          <span className="text-gray-400 text-lg line-through">
                            <SaudiRiyal amount={bundle.originalPrice} size="lg" />
                    </span>
                  </>
                )}
              </div>
              {savingsAmount > 0 && (
                      <div className="text-green-600 font-medium">
                        You save: <SaudiRiyal amount={savingsAmount} size="sm" />
                </div>
              )}
            </div>
            
                  <p className="text-gray-700 mb-6 leading-relaxed">{bundle.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <Check className="w-4 h-4 text-green-500" />
                    <span>In Stock ({bundle.stock} available)</span>
              </div>
            </div>
            
                {/* Enhanced Pricing */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#12d6fa]">
                    <SaudiRiyal amount={bundle.price} size="lg" />
                  </span>
                  {bundle.originalPrice && bundle.originalPrice > bundle.price && (
                    <div className="flex items-center gap-2 sm:gap-4">
                      <span className="text-lg sm:text-xl text-muted-foreground line-through">
                        <SaudiRiyal amount={bundle.originalPrice} size="md" />
                      </span>
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm">
                        Save <SaudiRiyal amount={savingsAmount} size="sm" />
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Enhanced Stock and Badges */}
                <div className="flex items-center flex-wrap gap-2 mb-6">
                  <Badge variant={bundle.stock > 0 ? "default" : "destructive"} className={`${getStockColor()} text-xs sm:text-sm`}>
                    <Package className="w-3 h-3 mr-1" />
                    {stockMessage()}
                  </Badge>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">
                    <Truck className="w-3 h-3 mr-1" />
                    Free Shipping
                  </Badge>
                  {bundle.isFeatured && (
                    <Badge variant="outline" className="border-amber-200 text-amber-700 text-xs sm:text-sm">
                      <Award className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs sm:text-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    Bundle Deal
                  </Badge>
                </div>

                {/* Enhanced Quantity and Actions */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center border-2 border-gray-200 rounded-lg hover:border-[#12d6fa] transition-colors w-fit">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-2 sm:p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 sm:px-6 py-2 sm:py-3 font-semibold text-base sm:text-lg min-w-[50px] sm:min-w-[60px] text-center">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-2 sm:p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity >= (bundle.stock || 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <div>
                        Total:{" "}
                        <span className="font-semibold text-base sm:text-lg text-[#12d6fa]">
                          <SaudiRiyal amount={bundle.price * quantity} size="md" />
                        </span>
                      </div>
                      {quantity > 1 && (
                        <div className="text-xs">
                          <SaudiRiyal amount={bundle.price} size="sm" /> each
                        </div>
                      )}
              </div>
            </div>
            
                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {bundle.stock > 0 ? (
              <Button
                        onClick={isInCart(bundle._id) ? () => window.location.href = '/cart' : handleAddToCart}
                        className={`flex-1 bg-[#12d6fa] hover:bg-[#0fb8d9] text-white shadow-lg hover:shadow-xl transition-all duration-200 ${
                          cartAnimation ? "animate-pulse" : ""
                        }`}
                        size="lg"
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="text-sm sm:text-base">{isInCart(bundle._id) ? "Go to Cart" : "Add to Cart"}</span>
                      </Button>
                    ) : (
                      <Dialog open={showNotifyMe} onOpenChange={setShowNotifyMe}>
                        <DialogTrigger asChild>
                          <Button
                            className="flex-1 bg-[#12d6fa] hover:bg-[#0fb8d9] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            size="lg"
                          >
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            <span className="text-sm sm:text-base">Notify When Available</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center">
                              <Bell className="w-5 h-5 mr-2 text-[#12d6fa]" />
                              Get Notified
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Enter your email to be notified when this bundle is back in stock.
                            </p>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              value={notifyEmail}
                              onChange={(e) => setNotifyEmail(e.target.value)}
                            />
              <Button
                              onClick={() => {
                                setShowNotifyMe(false)
                                alert("You will be notified when this bundle is back in stock!")
                              }}
                              className="w-full bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                            >
                              Notify Me
              </Button>
            </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Button
                      variant="outline"
                      onClick={handleAddToWishlist}
                      className={`border-2 transition-all duration-200 ${
                        isInWishlist
                          ? "text-[#12d6fa] border-[#12d6fa] bg-[#12d6fa]/10"
                          : "hover:border-[#12d6fa] hover:text-[#12d6fa]"
                      } ${wishlistAnimation ? "animate-pulse" : ""}`}
                      size="lg"
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist ? "fill-current" : ""}`} />
                    </Button>

                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="border-2 hover:border-[#12d6fa] hover:text-[#12d6fa] transition-all duration-200"
                        size="lg"
                      >
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>

                      {showShareMenu && (
                        <div className="absolute right-0 top-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl p-3 z-10 min-w-[180px] sm:min-w-[200px]">
                          <div className="space-y-2">
                            <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Share this bundle</div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleShare("facebook")}
                                className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Facebook className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">Facebook</span>
                              </button>
                              <button
                                onClick={() => handleShare("twitter")}
                                className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Twitter className="w-4 h-4 text-blue-400" />
                                <span className="text-sm">Twitter</span>
                              </button>
                              <button
                                onClick={() => handleShare("whatsapp")}
                                className="flex items-center space-x-2 p-2 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <MessageCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">WhatsApp</span>
                              </button>
                              <button
                                onClick={() => handleShare("copy")}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <Copy className="w-4 h-4 text-gray-600" />
                                <span className="text-sm">Copy Link</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
            </div>
          </div>
        </div>

                {/* Bundle Details */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{bundle.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">Soda Maker Bundle</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items in Bundle:</span>
                    <span className="font-medium">{bundle.items?.length || 0} items</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Product Details Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto sm:h-12 gap-1 sm:gap-0">
            <TabsTrigger
              value="description"
              className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
            >
              <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Description</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="contents"
              className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
            >
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Contents</span>
              <span className="sm:hidden">Items</span>
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
            >
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Reviews ({reviews.length})</span>
              <span className="sm:hidden">Reviews</span>
              <span className="sm:hidden text-xs ml-1">({reviews.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Specifications</span>
              <span className="sm:hidden">Specs</span>
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Videos</span>
              <span className="sm:hidden">Video</span>
            </TabsTrigger>
            <TabsTrigger
              value="qa"
              className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Q&A</span>
              <span className="sm:hidden">Q&A</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6 sm:mt-8">
            <div className="prose max-w-none">
              <div className="bg-gradient-to-r from-[#12d6fa]/10 to-blue-50 p-4 sm:p-6 rounded-xl mb-6">
                <p className="text-base sm:text-lg leading-relaxed text-gray-700">{bundle.description}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#12d6fa] flex-shrink-0" />
                    Key Features
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#12d6fa] mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">Complete soda making solution</span>
                    </li>
                    <li className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#12d6fa] mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">Premium quality components</span>
                    </li>
                    <li className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#12d6fa] mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">Easy setup and operation</span>
                    </li>
                    <li className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#12d6fa] mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">Money-saving bundle pricing</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 flex-shrink-0" />
                    What's Included
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">Soda maker machine</span>
                    </li>
                    <li className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">CO2 cylinder</span>
                    </li>
                    <li className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">Flavor syrups</span>
                    </li>
                    <li className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">User manual and guides</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contents" className="mt-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Bundle Contents</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-5 h-5" />
                  <span>{bundle.items?.length || 0} items included</span>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6">
                    {bundle.items?.map((item, index) => (
                      <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="w-20 h-20 bg-white rounded-lg mr-6 flex items-center justify-center shadow-sm">
                    <Image
                      src={item.image || "/images/placeholder.svg"}
                      alt={item.name}
                            width={60}
                            height={60}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600">Individual item</p>
                  </div>
                  <div className="text-right">
                          <div className="font-bold text-lg">
                            <SaudiRiyal amount={item.price} size="sm" />
                          </div>
                          <div className="text-sm text-gray-500">1x included</div>
                  </div>
                </div>
              ))}
            </div>
            
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-semibold text-gray-900">Total Individual Value:</div>
                        <div className="text-2xl font-bold text-gray-900">
                          <SaudiRiyal amount={bundle.originalPrice || bundle.price} size="lg" />
                        </div>
              </div>
              {bundle.originalPrice && (
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-lg font-semibold text-[#12d6fa]">Bundle Price:</div>
                          <div className="text-2xl font-bold text-[#12d6fa]">
                            <SaudiRiyal amount={bundle.price} size="lg" />
                          </div>
                </div>
              )}
                      {savingsAmount > 0 && (
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-semibold text-green-600">You Save:</div>
                          <div className="text-2xl font-bold text-green-600">
                            <SaudiRiyal amount={savingsAmount} size="lg" />
            </div>
          </div>
                      )}
        </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <div className="space-y-8">
              {/* Enhanced Review Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#12d6fa] mb-2">{bundle.averageRating || 4.8}</div>
                      <div className="flex items-center justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${
                              i < Math.floor(bundle.averageRating || 4.8)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Based on {(bundle.reviewCount || 0).toLocaleString()} reviews
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter((r) => r.rating === rating).length
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                        return (
                          <div key={rating} className="flex items-center space-x-3">
                            <span className="text-sm w-8">{rating}★</span>
                            <Progress value={percentage} className="flex-1 h-2" />
                            <span className="text-sm text-muted-foreground w-12">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Review Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Filter by rating:</span>
                    </div>
                    <Select value={reviewFilter} onValueChange={setReviewFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All ratings</SelectItem>
                        <SelectItem value="5">5 stars</SelectItem>
                        <SelectItem value="4">4 stars</SelectItem>
                        <SelectItem value="3">3 stars</SelectItem>
                        <SelectItem value="2">2 stars</SelectItem>
                        <SelectItem value="1">1 star</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Sort by:</span>
                    </div>
                    <Select value={reviewSort} onValueChange={setReviewSort}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="highest">Highest rated</SelectItem>
                        <SelectItem value="lowest">Lowest rated</SelectItem>
                        <SelectItem value="helpful">Most helpful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Write a Review Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Star className="w-5 h-5 mr-2 text-[#12d6fa]" />
                      Write a Review
                    </h3>
                    <Button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                    >
                      {showReviewForm ? "Cancel" : "Write Review"}
                    </Button>
                  </div>

                  {showReviewForm && (
                    <div className="space-y-6 border-t pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Your Name *</label>
                          <Input
                            value={newReview.name}
                            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                            placeholder="Enter your name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Rating *</label>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                className="focus:outline-none transition-transform hover:scale-110"
                                aria-label={`Rate ${star} stars`}
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    star <= newReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Your Review *</label>
                        <Textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Tell us about your experience with this bundle..."
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Pros (optional)</label>
                          <Input
                            value={newReview.pros}
                            onChange={(e) => setNewReview({ ...newReview, pros: e.target.value })}
                            placeholder="What did you like most?"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Cons (optional)</label>
                          <Input
                            value={newReview.cons}
                            onChange={(e) => setNewReview({ ...newReview, cons: e.target.value })}
                            placeholder="What could be improved?"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setShowReviewForm(false)
                          alert("Thank you for your review! It will be published after moderation.")
                        }}
                        className="w-full bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                      >
                        Submit Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="space-y-4">
                {filteredReviews().map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-[#12d6fa] rounded-full flex items-center justify-center text-white font-semibold">
                          {review.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{review.name || 'Anonymous'}</h4>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                          {review.pros && (
                            <div className="text-sm">
                              <span className="font-medium text-green-600">Pros: </span>
                              <span className="text-gray-600">{review.pros}</span>
                            </div>
                          )}
                          {review.cons && (
                            <div className="text-sm">
                              <span className="font-medium text-red-600">Cons: </span>
                              <span className="text-gray-600">{review.cons}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-[#12d6fa]" />
                    Bundle Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Bundle Type</span>
                    <span className="text-gray-900">Soda Maker Starter Kit</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Items Included</span>
                    <span className="text-gray-900">{bundle.items?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Total Weight</span>
                    <span className="text-gray-900">~5.5 kg</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Package Dimensions</span>
                    <span className="text-gray-900">45 x 35 x 25 cm</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Warranty</span>
                    <span className="text-gray-900">2 Years</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-gray-600">Compatibility</span>
                    <span className="text-gray-900">Universal</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2 text-green-500" />
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bundle.items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-8">
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Videos</h2>
                <p className="text-lg text-gray-600">Watch how to use your soda maker bundle</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-[#12d6fa] mx-auto mb-4" />
                        <p className="text-gray-600">Setup Guide</p>
                        <p className="text-sm text-gray-500">Coming Soon</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">How to Set Up Your Soda Maker Bundle</h3>
                    <p className="text-gray-600">Learn how to properly set up and use your complete soda maker bundle for the best results.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-[#12d6fa] mx-auto mb-4" />
                        <p className="text-gray-600">Maintenance Tips</p>
                        <p className="text-sm text-gray-500">Coming Soon</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Soda Maker Maintenance</h3>
                    <p className="text-gray-600">Keep your soda maker in perfect condition with proper maintenance and cleaning techniques.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="qa" className="mt-8">
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions & Answers</h2>
                <p className="text-lg text-gray-600">Get answers to common questions about soda maker bundles</p>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-[#12d6fa] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        Q
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">What's included in this soda maker bundle?</h3>
                        <p className="text-gray-600">This bundle includes a complete soda maker setup. Check the 'Bundle Contents' section for a detailed list of all included items with individual pricing.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-[#12d6fa] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        Q
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">How easy is it to use the soda maker?</h3>
                        <p className="text-gray-600">Our soda makers are designed for ease of use. Simply add water, insert CO2 cylinder, and press the button to carbonate. Detailed instructions are included.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-[#12d6fa] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        Q
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">How long does the CO2 cylinder last?</h3>
                        <p className="text-gray-600">A standard CO2 cylinder can make 60-130 liters of sparkling water, depending on the carbonation level you prefer. This typically lasts 1-2 months for regular use.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-[#12d6fa] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        Q
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Is the soda maker easy to clean?</h3>
                        <p className="text-gray-600">Yes, our soda makers are designed for easy cleaning. Most parts are dishwasher safe, and we include cleaning accessories in the bundle for convenience.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>


        {/* Benefits Section */}
        <section className="py-16 bg-gradient-to-b from-white to-[#f3f3f3] mb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black font-montserrat mb-4 tracking-tight">
                Bundle Benefits
              </h2>
              <p className="text-lg md:text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
                Why choose our bundles for your sparkling drink needs
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bundleBenefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className="bg-white rounded-2xl h-[280px] flex items-center justify-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg"
                >
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#12d6fa]/20 to-[#12d6fa]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3 font-montserrat tracking-tight">{benefit.title}</h3>
                    <p className="text-gray-600 text-base leading-relaxed font-noto-sans">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gradient-to-b from-[#f3f3f3] to-white mb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black font-montserrat mb-4 tracking-tight">
                How to Use Your Bundle
              </h2>
              <p className="text-lg md:text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
                Simple steps to start making sparkling drinks
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-br from-[#12d6fa]/20 to-[#12d6fa]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-[#12d6fa] font-montserrat">1</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-3 font-montserrat tracking-tight">Unbox & Setup</h3>
                <p className="text-gray-600 text-base leading-relaxed font-noto-sans">
                  Unpack your bundle and follow the quick setup guide
                </p>
            </div>
            
              <div className="bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-br from-[#12d6fa]/20 to-[#12d6fa]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-[#12d6fa] font-montserrat">2</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-3 font-montserrat tracking-tight">Add Water & CO2</h3>
                <p className="text-gray-600 text-base leading-relaxed font-noto-sans">
                  Fill with water and carbonate using the included CO2 cylinder
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-br from-[#12d6fa]/20 to-[#12d6fa]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-[#12d6fa] font-montserrat">3</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-3 font-montserrat tracking-tight">Add Flavor & Enjoy</h3>
                <p className="text-gray-600 text-base leading-relaxed font-noto-sans">
                  Mix in your favorite flavor and enjoy refreshing sparkling drinks
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white mb-16">
          <div className="max-w-7xl mx-auto px-4">
            <header className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-bold text-black text-3xl md:text-4xl mb-4 tracking-tight">Bundle FAQ</h2>
              <p className="font-semibold text-black text-lg md:text-xl">All the answers to your bundle questions</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bundleFAQ.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-gray-200"
                >
                  <h3 className="text-lg font-bold text-black mb-3 tracking-tight">{card.question}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{card.answer}</p>
                </div>
              ))}
          </div>
        </div>
        </section>

        {/* Enhanced Related Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-[#12d6fa]" />
            You Might Also Like
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-full">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-200 animate-pulse rounded-lg mb-4"></div>
                  <div className="h-5 bg-gray-200 animate-pulse rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-4 w-1/2"></div>
                  <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <FeedbackSection 
          rating={bundle.averageRating} 
          reviewCount={bundle.reviewCount} 
          reviews={reviews} 
          bundleId={bundle._id}
          onReviewAdded={() => {
            // Refresh bundle data to get updated reviews
            fetchBundle()
          }}
        />
      </div>
    </PageLayout>
  )
}