"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import PageLayout from "@/components/layout/PageLayout"
import { Star, Loader2, Check, Heart, Share2, Plus, Minus, Truck, Shield, Zap, Award, Users, Package, Settings, Filter, X, ChevronLeft, ChevronRight, Maximize2, Bell, Clock, CheckCircle, AlertCircle, Info, Sparkles, TrendingUp, MessageCircle, Play, Eye, ArrowLeft, ThumbsUp, ChevronDown, ChevronUp, Copy, Facebook, Twitter, ShoppingCart } from "lucide-react"
import { shopAPI } from "@/lib/api"
import { YouTubeVideo, isYouTubeUrl, getYouTubeVideoId } from "@/components/ui/youtube-video"
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
import { Badge } from "@/components/ui/badge"
import styles from "./styles.module.css"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import FeedbackSection from "@/components/product/FeedbackSection"
import { useTranslation } from "@/lib/translation-context"
import { useRouter } from "next/navigation"

// Define bundle type
interface Bundle {
  _id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  videos?: string[]
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

// Mock bundle data for fallback
const mockBundle = {
  _id: "mock-bundle-001",
  name: "Aqualine Starter Kit Soda Maker",
  price: 499.00,
  originalPrice: 549.00,
  discount: 50.00,
  images: ["/images/04 - Kits/Starter-Kit---Example---Do-Not-Use.png"],
  videos: [],
  category: "Soda Maker Bundle",
  description: "Complete starter kit for home soda making with everything you need to get started.",
  badge: {
    text: "Bundle Deal",
    color: "blue"
  },
  items: [
    {
      product: "soda-maker-001",
      name: "Aqualine Soda Maker Machine",
      price: 299.00,
      image: "/images/placeholder.svg"
    },
    {
      product: "co2-cylinder-001",
      name: "CO2 Cylinder (80L)",
      price: 149.00,
      image: "/images/placeholder.svg"
    },
    {
      product: "flavor-syrup-001",
      name: "Flavor Syrup Set (6 bottles)",
      price: 89.00,
      image: "/images/placeholder.svg"
    },
    {
      product: "accessories-001",
      name: "Accessories Kit",
      price: 39.00,
      image: "/images/placeholder.svg"
    }
  ],
  stock: 25,
  sku: "AQSMB-001",
  averageRating: 4.5,
  reviewCount: 24,
  isLimited: false,
  isFeatured: true
}

// Mock data for bundle reviews
const bundleReviews = [
  {
    id: 1,
    user: "Ahmed Al-Rashid",
    avatar: "/male-user-avatar.png",
    rating: 5,
    date: "2024-01-15",
    verified: true,
    comment:
      "Excellent bundle! This complete soda maker kit has everything I needed to start making sparkling drinks at home. The quality is outstanding and the setup was incredibly easy. The CO2 cylinder included is perfect for my needs. Highly recommend for anyone looking to save money and get professional results!",
    helpful: 24,
    images: ["/placeholder.svg", "/placeholder.svg"],
    pros: ["Complete kit", "Easy setup", "Great quality", "Good value"],
    cons: ["Slightly heavy"],
    wouldRecommend: true,
    purchaseVerified: true,
  },
  {
    id: 2,
    user: "Fatima Hassan",
    avatar: "/female-user-avatar.png",
    rating: 5,
    date: "2024-01-10",
    verified: true,
    comment:
      "Perfect starter bundle for home carbonation! I was hesitant at first, but this kit exceeded my expectations. Everything works perfectly together and the instructions are clear. The flavor options included are great too. My family loves making different sparkling drinks now!",
    helpful: 18,
    images: [],
    pros: ["Easy to use", "Great variety", "Quality components", "Good instructions"],
    cons: [],
    wouldRecommend: true,
    purchaseVerified: true,
  },
  {
    id: 3,
    user: "Mohammed Al-Zahra",
    avatar: "/user-avatar-male-2.jpg",
    rating: 4,
    date: "2023-12-28",
    verified: true,
    comment:
      "Solid bundle with good value. The soda maker works well and the CO2 cylinder lasts longer than expected. Only minor issue is that some parts could be easier to clean, but overall very satisfied. Would recommend for beginners looking to try home carbonation.",
    helpful: 12,
    images: ["/placeholder.svg"],
    pros: ["Good value", "Reliable performance", "Long-lasting CO2", "Easy operation"],
    cons: ["Cleaning could be easier"],
    wouldRecommend: true,
    purchaseVerified: true,
  },
]

const bundleQA = [
  {
    id: 1,
    category: "Setup & Usage",
    question: "How long does it take to set up the soda maker bundle?",
    answer:
      "Setup typically takes 15-30 minutes. The bundle includes everything you need with clear instructions. Most users can have their first sparkling drink ready within 30 minutes of unboxing. Our customer support team is also available if you need any assistance during setup.",
    helpful: 15,
    date: "2024-01-12",
    answeredBy: "DrinkMate Support Team",
    tags: ["setup", "installation", "beginner"],
  },
  {
    id: 2,
    category: "CO2 Cylinder",
    question: "How long does the included CO2 cylinder last?",
    answer:
      "The CO2 cylinder capacity depends on usage. For an average family making 2-3 liters of sparkling drinks daily, it typically lasts 4-6 weeks. Heavy users might need refills every 3-4 weeks, while light users can get 8-10 weeks. We offer convenient refill services when you're ready.",
    helpful: 12,
    date: "2024-01-08",
    answeredBy: "Technical Support",
    tags: ["co2", "duration", "refill"],
  },
  {
    id: 3,
    category: "Maintenance & Care",
    question: "How do I clean and maintain the soda maker?",
    answer:
      "Regular cleaning is important for best performance. Rinse the bottle and carbonation components with warm water after each use. For deep cleaning, use the included cleaning brush and mild dish soap. The machine exterior can be wiped with a damp cloth. Avoid submerging the main unit in water.",
    helpful: 8,
    date: "2023-12-15",
    answeredBy: "Product Care Specialist",
    tags: ["cleaning", "maintenance", "care"],
  },
  {
    id: 4,
    category: "Warranty & Support",
    question: "What's covered under the bundle warranty?",
    answer:
      "The bundle comes with a comprehensive warranty. The soda maker has a 1-year warranty covering manufacturing defects. The CO2 cylinder has a 5-year warranty. Flavor bottles and accessories have a 6-month warranty. All warranties cover normal household use and exclude misuse or accidents.",
    helpful: 20,
    date: "2024-01-05",
    answeredBy: "Warranty Team",
    tags: ["warranty", "support", "coverage"],
  },
]

export default function BundleDetailPage() {
  const params = useParams()
  const { t } = useTranslation()
  const { addItem, isInCart } = useCart()
  const router = useRouter()

  const bundleSlug = params?.slug as string
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Bundle[]>([])
  const [loadingRelated, setLoadingRelated] = useState(true)

  // Enhanced state management with more features
  const [selectedImage, setSelectedImage] = useState(0)
  const [isShowingVideo, setIsShowingVideo] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [activeTab, setActiveTab] = useState("description")
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showNotifyMe, setShowNotifyMe] = useState(false)
  const [expandedQA, setExpandedQA] = useState<number[]>([])
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
  const [reviews, setReviews] = useState(bundleReviews)
  const [qaData, setQAData] = useState(bundleQA)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "Setup & Usage",
    tags: ""
  })

  const [showImageGallery, setShowImageGallery] = useState(false)
  const [reviewFilter, setReviewFilter] = useState("all")
  const [reviewSort, setReviewSort] = useState("newest")
  const [qaFilter, setQAFilter] = useState("all")
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [cartAnimation, setCartAnimation] = useState(false)
  const [wishlistAnimation, setWishlistAnimation] = useState(false)

  const toggleQA = useCallback((id: number) => {
    setExpandedQA((prev) => {
      if (prev.includes(id)) {
        return prev.filter((qaId) => qaId !== id)
      } else {
        return [...prev, id]
      }
    })
  }, [])
  
  // Function to fetch related products
  const fetchRelatedProducts = useCallback(async (currentBundleId: string) => {
    try {
      setLoadingRelated(true)
      
      // Get all bundles
      const response = await shopAPI.getBundles()
      
      if (response.success && response.bundles) {
        // Filter out the current bundle and get up to 4 other bundles
        const otherBundles = response.bundles
          .filter((bundle: Bundle) => bundle._id !== currentBundleId)
          .slice(0, 4)
          
        // Process images to ensure they have absolute URLs
        const processedBundles = otherBundles.map((bundle: Bundle) => {
          // Handle case where images might be undefined or null
          const safeImages = bundle.images || []
          
          return {
            ...bundle,
            // Ensure image URLs in arrays are absolute
            images: safeImages.map((img: string) => 
              img.startsWith('http') ? img : 
              img.startsWith('/') ? `${window.location.origin}${img}` : 
              '/placeholder.svg'
            )
          }
        })
        
        setRelatedProducts(processedBundles)
      }
    } catch (error) {
      console.error('Error fetching related bundles:', error)
    } finally {
      setLoadingRelated(false)
    }
  }, [])

  // Fetch bundle data
  const fetchBundle = useCallback(async () => {
    try {
      setLoading(true)
      const response = await shopAPI.getBundleFlexible(bundleSlug)
      
      if (response.success && response.bundle) {
        // Use API data if available and complete
        const bundleData = response.bundle.items && response.bundle.items.length > 0 
          ? response.bundle 
          : { ...response.bundle, ...mockBundle, _id: response.bundle._id || mockBundle._id }
        
        setBundle(bundleData)
        
        // Set default selected image
        if (bundleData.images && bundleData.images.length > 0) {
          setSelectedImage(0)
        }
        
        // Fetch related products
        fetchRelatedProducts(bundleData._id)
      } else {
        // Use mock data as fallback
        setBundle(mockBundle)
        setSelectedImage(0)
        fetchRelatedProducts(mockBundle._id)
      }
    } catch (error) {
      console.error("Error fetching sodamaker bundle:", error)
      // Use mock data as fallback on error
      setBundle(mockBundle)
      setSelectedImage(0)
      fetchRelatedProducts(mockBundle._id)
    } finally {
      setLoading(false)
    }
  }, [bundleSlug, fetchRelatedProducts])

  useEffect(() => {
    if (bundleSlug) {
      fetchBundle()
    }
  }, [bundleSlug, fetchBundle])

  const handleAddToCart = useCallback(() => {
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
  }, [bundle, quantity, addItem])

  const handleAddToWishlist = useCallback(() => {
    if (!bundle) return

    setWishlistAnimation(true)
    setIsInWishlist(!isInWishlist)

    setTimeout(() => {
      setWishlistAnimation(false)
    }, 500)
  }, [bundle, isInWishlist])

  const handleQuantityChange = useCallback((change: number) => {
    const newQuantity = Math.max(1, Math.min(bundle?.stock || 1, quantity + change))
    setQuantity(newQuantity)
  }, [bundle?.stock, quantity])

  const handleShare = useCallback((platform: string) => {
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
      case "copy":
        if (typeof window !== "undefined") {
          navigator.clipboard.writeText(url)
        }
        break
    }
    setShowShareMenu(false)
  }, [bundle])

  const handleNotifyMe = useCallback(() => {
    if (!notifyEmail) return
    // Handle notify me logic here
    setShowNotifyMe(false)
    setNotifyEmail("")
  }, [notifyEmail])

  const handleSubmitReview = useCallback(() => {
    if (!newReview.comment || !newReview.name) return
    
    const review = {
      id: reviews.length + 1,
      user: newReview.name,
      avatar: "/user-avatar-default.jpg",
      rating: newReview.rating,
      date: new Date().toISOString().split('T')[0],
      verified: false,
      comment: newReview.comment,
      helpful: 0,
      images: [],
      pros: newReview.pros ? newReview.pros.split(',').map(p => p.trim()) : [],
      cons: newReview.cons ? newReview.cons.split(',').map(c => c.trim()) : [],
      wouldRecommend: newReview.wouldRecommend,
      purchaseVerified: false,
    }
    
    setReviews([review, ...reviews])
    setShowReviewForm(false)
    setNewReview({
      rating: 5,
      comment: "",
      name: "",
      pros: "",
      cons: "",
      wouldRecommend: true,
    })
  }, [newReview, reviews])

  const handleSubmitQuestion = useCallback(() => {
    if (!newQuestion.question) return
    
    const question = {
      id: qaData.length + 1,
      category: newQuestion.category,
      question: newQuestion.question,
      answer: "Thank you for your question! Our customer service team will respond within 24 hours.",
      helpful: 0,
      date: new Date().toISOString().split('T')[0],
      answeredBy: "DrinkMate Support",
      tags: newQuestion.tags ? newQuestion.tags.split(',').map(t => t.trim()) : []
    }
    
    setQAData([question, ...qaData])
    setShowQuestionForm(false)
    setNewQuestion({
      question: "",
      category: "Setup & Usage",
      tags: ""
    })
  }, [newQuestion, qaData])

  // Combined media array for images and videos
  const mediaArray = useMemo(() => {
    if (!bundle) return []
    
    const images = bundle.images || []
    const videos = bundle.videos || []
    
    const mediaItems = [
      ...images.map((img, index) => ({
        type: 'image' as const,
        url: img,
        index
      })),
      ...videos.map((video, index) => ({
        type: 'video' as const,
        url: video,
        index: images.length + index
      }))
    ]
    
    return mediaItems
  }, [bundle])

  const currentMedia = mediaArray[selectedImage]

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviews
    
    if (reviewFilter !== "all") {
      filtered = filtered.filter(review => {
        if (reviewFilter === "verified") return review.verified
        if (reviewFilter === "with-images") return review.images.length > 0
        if (reviewFilter === "recommended") return review.wouldRecommend
        return true
      })
    }
    
    if (reviewSort === "newest") {
      filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else if (reviewSort === "oldest") {
      filtered = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else if (reviewSort === "highest") {
      filtered = filtered.sort((a, b) => b.rating - a.rating)
    } else if (reviewSort === "lowest") {
      filtered = filtered.sort((a, b) => a.rating - b.rating)
    } else if (reviewSort === "most-helpful") {
      filtered = filtered.sort((a, b) => b.helpful - a.helpful)
    }
    
    return filtered
  }, [reviews, reviewFilter, reviewSort])

  // Filter Q&A
  const filteredQA = useMemo(() => {
    if (qaFilter === "all") return qaData
    return qaData.filter(qa => qa.category.toLowerCase().includes(qaFilter.toLowerCase()))
  }, [qaData, qaFilter])

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }, [reviews])

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }, [reviews])

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading bundle details...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!bundle) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Bundle Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The bundle you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/shop/sodamakers")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sodamakers
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const handleImageClick = (index: number) => {
    setSelectedImage(index)
    setIsShowingVideo(false)
  }

  const handleVideoClick = (index: number) => {
    setSelectedImage(index)
    setIsShowingVideo(true)
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

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading bundle details...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!bundle) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Bundle Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The bundle you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/shop/sodamakers")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sodamakers
              </Button>
            </div>
          </div>
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
      <TooltipProvider>
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
              <Link href="/shop" className="hover:text-[#12d6fa] transition-colors">
                Shop
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/shop/sodamakers" className="hover:text-[#12d6fa] transition-colors">
                Soda Makers
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/shop/sodamakers/bundles" className="hover:text-[#12d6fa] transition-colors">
                Bundles
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">{bundle.name}</span>
            </nav>
          </div>

          <div className="flex gap-8">
            {/* Enhanced Sidebar Controls */}
            <div className="w-16 flex flex-col space-y-4">
              {/* 3D View Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 group"
                    onClick={() => alert("3D View coming soon!")}
                    aria-label="View product in 3D"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>360° 3D View</p>
                </TooltipContent>
              </Tooltip>

              {/* Enhanced Favorite Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 group ${
                      isInWishlist
                        ? "border-[#12d6fa] bg-[#12d6fa] text-white shadow-lg"
                        : "border-gray-300 hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white"
                    } ${wishlistAnimation ? "animate-pulse" : ""}`}
                    onClick={handleAddToWishlist}
                    aria-label={isInWishlist ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      className={`w-5 h-5 group-hover:scale-110 transition-transform ${isInWishlist ? "fill-current" : ""}`}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</p>
                </TooltipContent>
              </Tooltip>

              {/* Compare Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 group"
                    onClick={() => alert("Compare feature coming soon!")}
                    aria-label="Compare products"
                  >
                    <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compare Products</p>
                </TooltipContent>
              </Tooltip>

              {/* Quick View Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 group"
                    onClick={() => alert("Quick view feature coming soon!")}
                    aria-label="Quick view product details"
                  >
                    <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quick View</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
                {/* Enhanced Bundle Images */}
                <div className="space-y-4">
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden cursor-zoom-in group shadow-lg"
                       onMouseEnter={() => !isShowingVideo && setIsZoomed(true)}
                       onMouseLeave={() => setIsZoomed(false)}
                       onMouseMove={!isShowingVideo ? handleImageZoom : undefined}
                       onClick={() => setShowImageGallery(true)}>
                    {isShowingVideo ? (
                      <div className="w-full h-full">
                        {mediaArray[selectedImage] && isYouTubeUrl(mediaArray[selectedImage].url) ? (
                          <YouTubeVideo
                            videoUrl={mediaArray[selectedImage].url}
                            title={`${bundle.name} - Bundle Video`}
                            className="w-full h-full"
                            showThumbnail={false}
                            autoplay={true}
                            controls={true}
                          />
                        ) : (
                          <video
                            className="w-full h-full object-cover"
                            controls
                            poster="/placeholder.svg"
                          >
                            <source src={mediaArray[selectedImage]?.url} type="video/mp4" />
                            <source src={mediaArray[selectedImage]?.url} type="video/webm" />
                            <source src={mediaArray[selectedImage]?.url} type="video/ogg" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    ) : (
                      <Image
                        src={mediaArray[selectedImage]?.url || (bundle.images && bundle.images.length > 0 ? bundle.images[0] : "/images/04 - Kits/Starter-Kit---Example---Do-Not-Use.png")}
                        alt={bundle.name}
                        fill
                        className={`${styles.productImageZoom} ${isZoomed ? styles.zoomedImage : styles.defaultImage} ${isZoomed ? styles.customTransformOrigin : ''}`}
                        ref={(el) => {
                          if (el && isZoomed) {
                            el.style.setProperty('--transform-origin-x', `${zoomPosition.x}%`);
                            el.style.setProperty('--transform-origin-y', `${zoomPosition.y}%`);
                          }
                        }}
                      />
                    )}

                    {/* Enhanced Badges */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {bundle.originalPrice && bundle.originalPrice > bundle.price && (
                        <Badge className="bg-red-500 text-white shadow-lg animate-pulse">{discountPercentage}% OFF</Badge>
                      )}
                      {bundle.isFeatured && (
                        <Badge className="bg-blue-500 text-white shadow-lg">
                          <Award className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {bundle.isLimited && (
                        <Badge className="bg-orange-500 text-white shadow-lg">
                          <Clock className="w-3 h-3 mr-1" />
                          Limited
                        </Badge>
                      )}
                    </div>

                    {/* Zoom Indicator */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 text-white p-2 rounded-full">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Image Navigation */}
                    {mediaArray.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const newIndex = selectedImage > 0 ? selectedImage - 1 : mediaArray.length - 1
                            setSelectedImage(newIndex)
                            const media = mediaArray[newIndex]
                            setIsShowingVideo(media?.type === 'video')
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                          aria-label="Previous media"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const newIndex = selectedImage < mediaArray.length - 1 ? selectedImage + 1 : 0
                            setSelectedImage(newIndex)
                            const media = mediaArray[newIndex]
                            setIsShowingVideo(media?.type === 'video')
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                          aria-label="Next media"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Enhanced Media Thumbnails */}
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {mediaArray.map((media, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImage(index)
                          setIsShowingVideo(media.type === 'video')
                        }}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
                          selectedImage === index
                            ? "border-[#12d6fa] shadow-lg scale-105"
                            : "border-gray-200 hover:border-gray-300 hover:scale-102"
                        }`}
                      >
                        {media.type === 'video' ? (
                          <>
                            {isYouTubeUrl(media.url) ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_YOUTUBE_THUMBNAIL_BASE || 'https://img.youtube.com/vi'}/${getYouTubeVideoId(media.url)}/mqdefault.jpg`}
                                alt="Video thumbnail"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                className="w-full h-full object-cover"
                                muted
                              >
                                <source src={media.url} type="video/mp4" />
                                <source src={media.url} type="video/webm" />
                                <source src={media.url} type="video/ogg" />
                              </video>
                            )}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <Play className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <Image
                            src={media.url || "/placeholder.svg"}
                            alt={`${bundle.name} ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}

                  </div>
                </div>

                {/* Enhanced Bundle Info */}
                <div className="space-y-6">
                  {/* Bundle Header */}
                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="text-[#12d6fa] border-[#12d6fa] text-xs sm:text-sm">
                        Bundle
                      </Badge>
                      {bundle.category && (
                        <Badge variant="secondary" className="capitalize text-xs sm:text-sm">
                          {bundle.category}
                        </Badge>
                      )}
                      {bundle.isLimited && (
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          Limited Edition
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 text-balance leading-tight">{bundle.name}</h1>

                    {/* Enhanced Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                i < Math.floor(bundle.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-sm sm:text-base">{bundle.averageRating}</span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          ({bundle.reviewCount.toLocaleString()} reviews)
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4 hidden sm:block" />
                      <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{Math.floor(bundle.reviewCount * 1.2).toLocaleString()} sold</span>
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 h-auto sm:h-12 gap-1 sm:gap-0">
            <TabsTrigger
              value="description"
              className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
            >
              <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Description</span>
              <span className="sm:hidden">Info</span>
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
                {filteredReviews.map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-[#12d6fa] rounded-full flex items-center justify-center text-white font-semibold">
                          {review.user?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{review.user || 'Anonymous'}</h4>
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
                  {loading ? (
                    // Loading skeleton for bundle items
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0"></div>
                      </div>
                    ))
                  ) : bundle.items?.length > 0 ? (
                    <>
                      {bundle.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">{item.name}</div>
                            {item.price && (
                              <div className="text-xs text-gray-600">
                                <SaudiRiyal amount={item.price} size="sm" />
                              </div>
                            )}
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        </div>
                      ))}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700">Total Value:</span>
                          <span className="font-bold text-[#12d6fa]">
                            <SaudiRiyal 
                              amount={bundle.items.reduce((total, item) => total + (item.price || 0), 0)} 
                              size="sm" 
                            />
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-gray-600">Bundle Price:</span>
                          <span className="font-bold text-green-600">
                            <SaudiRiyal amount={bundle.price} size="sm" />
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1 font-medium">
                          <span className="text-gray-700">You Save:</span>
                          <span className="text-green-600">
                            <SaudiRiyal 
                              amount={bundle.items.reduce((total, item) => total + (item.price || 0), 0) - bundle.price} 
                              size="sm" 
                            />
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No bundle items information available</p>
                    </div>
                  )}
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

        {/* Enhanced Modals and Dialogs */}

        {/* Media Gallery Modal */}
        <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 w-[95vw] sm:w-full">
            <div className="relative">
              {isShowingVideo ? (
                <div className="w-full h-[60vh] sm:h-[80vh]">
                  {mediaArray[selectedImage] && isYouTubeUrl(mediaArray[selectedImage].url) ? (
                    <YouTubeVideo
                      videoUrl={mediaArray[selectedImage].url}
                      title={`${bundle.name} - Bundle Video`}
                      className="w-full h-full"
                      showThumbnail={false}
                      autoplay={true}
                      controls={true}
                    />
                  ) : (
                    <video
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      poster="/placeholder.svg"
                    >
                      <source src={mediaArray[selectedImage]?.url} type="video/mp4" />
                      <source src={mediaArray[selectedImage]?.url} type="video/webm" />
                      <source src={mediaArray[selectedImage]?.url} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ) : (
                <img
                  src={mediaArray[selectedImage]?.url || (bundle.images && bundle.images.length > 0 ? bundle.images[0] : "/images/04 - Kits/Starter-Kit---Example---Do-Not-Use.png")}
                  alt={bundle.name}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={() => setShowImageGallery(false)}
              >
                <X className="w-4 h-4" />
              </Button>

              {mediaArray.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => {
                      const newIndex = selectedImage > 0 ? selectedImage - 1 : mediaArray.length - 1
                      setSelectedImage(newIndex)
                      setIsShowingVideo(mediaArray[newIndex]?.type === 'video')
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => {
                      const newIndex = selectedImage < mediaArray.length - 1 ? selectedImage + 1 : 0
                      setSelectedImage(newIndex)
                      setIsShowingVideo(mediaArray[newIndex]?.type === 'video')
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Enhanced Thumbnails in Modal */}
              {mediaArray.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/50 rounded-lg p-2">
                  {mediaArray.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImage(index)
                        setIsShowingVideo(media.type === 'video')
                      }}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded border-2 transition-all duration-200 ${
                        selectedImage === index
                          ? "border-[#12d6fa] scale-110"
                          : "border-white/50 hover:border-white"
                      }`}
                    >
                      {media.type === 'video' ? (
                        <>
                          {isYouTubeUrl(media.url) ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_YOUTUBE_THUMBNAIL_BASE || 'https://img.youtube.com/vi'}/${getYouTubeVideoId(media.url)}/mqdefault.jpg`}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <video
                              className="w-full h-full object-cover rounded"
                              muted
                            >
                              <source src={media.url} type="video/mp4" />
                              <source src={media.url} type="video/webm" />
                              <source src={media.url} type="video/ogg" />
                            </video>
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded">
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={media.url || "/placeholder.svg"}
                          alt={`${bundle.name} ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      
        </div>
      </TooltipProvider>
    </PageLayout>
  )
}