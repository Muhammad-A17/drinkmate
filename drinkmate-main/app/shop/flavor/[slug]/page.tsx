"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Plus,
  Minus,
  Facebook,
  Twitter,
  Copy,
  Bell,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ArrowLeft,
  Eye,
  Play,
  MessageCircle,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  Package,
  Recycle,
  Leaf,
  Gauge,
  Settings,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Truck,
  Shield,
  Zap,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SaudiRiyalSymbol from "@/components/ui/SaudiRiyalSymbol"
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
import { YouTubeVideo, isYouTubeUrl, getYouTubeVideoId } from "@/components/ui/youtube-video"
import { useCart } from "@/lib/cart-context"
import { useTranslation } from "@/lib/translation-context"
import { useRouter } from "next/navigation"
import PageLayout from "@/components/layout/PageLayout"
import { shopAPI } from "@/lib/api"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import FeedbackSection from "@/components/product/FeedbackSection"
import ProductOverview from "@/components/product/ProductOverview"
import styles from "./styles.module.css"

// Define product type
interface Product {
  _id: string
  id?: string // For compatibility with mock data
  slug: string
  name: string
  brand: string
  type: string
  price: number
  originalPrice: number
  discount: number
  capacity?: number
  material?: string
  stock: number
  minStock: number
  status: string
  isBestSeller: boolean
  isFeatured: boolean
  isNew: boolean
  isEcoFriendly: boolean
  description: string
  features: string[]
  specifications: Record<string, string>
  images: string[]
  image?: string // For compatibility with mock data
  videos: string[]
  documents: { name: string; url: string; type: string }[]
  certifications: string[]
  warranty: string
  dimensions: { width: number; height: number; depth: number; weight: number }
  compatibility: string[]
  safetyFeatures: string[]
  createdAt: string
  updatedAt: string
  // Legacy fields for compatibility
  category: {
    _id: string
    name: string
    slug: string
  }
  rating: number
  reviews: number
  shortDescription: string
  fullDescription: string
  colors?: Array<{name: string, hexCode: string, inStock: boolean}>
  sku: string
  howToUse?: {
    title: string
    steps: Array<{id: string, title: string, description: string, image?: string}>
  }
  relatedProducts?: Array<any>
  averageRating: number
  reviewCount: number
}

// Sample data for enhanced features
const productReviews = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    comment: "Amazing flavor! Perfect for my soda maker.",
    date: "2024-01-15",
    helpful: 12,
    pros: "Great taste, easy to use",
    cons: "None",
    wouldRecommend: true,
  },
  {
    id: 2,
    name: "Ahmed K.",
    rating: 4,
    comment: "Good quality flavor, would buy again.",
    date: "2024-01-10",
    helpful: 8,
    pros: "Natural ingredients",
    cons: "A bit expensive",
    wouldRecommend: true,
  },
]

const productQA = [
  {
    id: 1,
    category: "Usage",
    question: "How much flavor should I use per liter?",
    answer: "We recommend 1-2 tablespoons per liter of water for the best taste.",
    helpful: 15,
    date: "2024-01-12",
    answeredBy: "Flavor Expert",
    tags: ["usage", "quantity", "taste"],
  },
  {
    id: 2,
    category: "Storage",
    question: "How should I store the flavor?",
    answer: "Store in a cool, dry place away from direct sunlight. Refrigeration is not required but can extend shelf life.",
    helpful: 8,
    date: "2024-01-08",
    answeredBy: "Product Team",
    tags: ["storage", "shelf-life", "preservation"],
  },
]

export default function FlavorDetailPage() {
  const params = useParams()
  const { t } = useTranslation()
  const { addItem, isInCart } = useCart()
  const router = useRouter()
  
  const productSlug = params?.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loadingRelated, setLoadingRelated] = useState(true)
  const [error, setError] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState("")
  const [reviews, setReviews] = useState(productReviews)
  
  // Enhanced state management with more features
  const [selectedImage, setSelectedImage] = useState(0)
  const [isShowingVideo, setIsShowingVideo] = useState(false)
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
  const [qaData, setQAData] = useState(productQA)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "General",
    tags: ""
  })
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [reviewFilter, setReviewFilter] = useState("all")
  const [reviewSort, setReviewSort] = useState("newest")
  const [qaFilter, setQAFilter] = useState("all")
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [cartAnimation, setCartAnimation] = useState(false)
  const [wishlistAnimation, setWishlistAnimation] = useState(false)

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    if (!productSlug) return

    try {
      setLoading(true)
      setError("")
      console.log('Fetching flavor product details for slug:', productSlug);
      
      const response = await shopAPI.getProductFlexible(productSlug)
      console.log('Flavor product fetch successful:', response.product?.name);
      
      if (response.success && response.product) {
        setProduct(response.product)
        setReviews(response.reviews || [])
        
        // Set default color if available
        if (response.product.colors && response.product.colors.length > 0) {
          setSelectedColor(response.product.colors[0].name)
        }
        
        // Set default active image
        if (response.product.images && response.product.images.length > 0) {
          const primaryImage = response.product.images.find((img: any) => img.isPrimary)
          setActiveImage(primaryImage ? primaryImage.url : response.product.images[0].url)
        }
      } else {
        setError("Product not found")
      }
    } catch (error) {
      console.error("Error fetching flavor product:", error)
      setError("Failed to load product. Please try again later.")
    } finally {
      setLoading(false)
    }
  }, [productSlug])

  // Fetch related products
  const fetchRelatedProducts = useCallback(async () => {
    if (!product) return

    try {
      setLoadingRelated(true)
      const response = await shopAPI.getProducts({ 
        category: product.category?.slug,
        limit: 4,
        exclude: product._id 
      })
      
      if (response.success && response.data) {
        setRelatedProducts(response.data.products || [])
      }
    } catch (error) {
      console.error("Error fetching related products:", error)
    } finally {
      setLoadingRelated(false)
    }
  }, [product])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  useEffect(() => {
    if (product) {
      fetchRelatedProducts()
    }
  }, [product, fetchRelatedProducts])

  // Create combined media array (images + videos)
  const combinedMedia = useMemo(() => {
    const media: Array<{ type: 'image' | 'video', src: string, index: number }> = []
    
    // Add images
    if (product?.images) {
      product.images.forEach((image, index) => {
        const imageUrl = typeof image === 'string' ? image : (image as any).url || image
        media.push({ type: 'image', src: imageUrl, index })
      })
    }
    
    // Add videos
    if (product?.videos) {
      product.videos.forEach((video, index) => {
        media.push({ type: 'video', src: video, index })
      })
    }
    
    return media
  }, [product?.images, product?.videos])

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImage(index)
    const media = combinedMedia[index]
    setIsShowingVideo(media?.type === 'video')
  }, [combinedMedia])

  const handleImageZoom = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }, [])

  const handleAddToCart = useCallback(() => {
    if (!product) return
    
    setCartAnimation(true)
    
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0] as any)?.url || product.image || "",
      category: "flavors",
      color: selectedColor
    })
    
    setTimeout(() => {
      setCartAnimation(false)
      // Navigate to cart page
      router.push('/cart')
    }, 1000)
  }, [product, quantity, addItem, selectedColor, router])

  const handleAddToWishlist = useCallback(() => {
    if (!product) return

    setWishlistAnimation(true)
    setIsInWishlist(!isInWishlist)

    setTimeout(() => {
      setWishlistAnimation(false)
    }, 500)
  }, [product, isInWishlist])

  const handleQuantityChange = useCallback(
    (change: number) => {
      const newQuantity = Math.max(1, Math.min(product?.stock || 1, quantity + change))
      setQuantity(newQuantity)
    },
    [quantity, product?.stock],
  )

  const handleShare = useCallback(
    (platform: string) => {
      if (!product) return
      const url = typeof window !== "undefined" ? window.location.href : ""
      const text = `Check out this amazing ${product.name} - ${product.description.substring(0, 100)}...`

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
        case "linkedin":
          if (typeof window !== "undefined") {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)
          }
          break
        case "instagram":
          if (typeof window !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(url)
            alert("Link copied to clipboard! You can now share it on Instagram.")
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
    },
    [product],
  )

  const handleSubmitReview = useCallback(() => {
    if (!newReview.comment.trim() || !newReview.name.trim()) {
      alert("Please fill in all required fields")
      return
    }

    const review = {
      id: Date.now(),
      name: newReview.name,
      user: newReview.name,
      avatar: "/diverse-user-avatars.png",
      rating: newReview.rating,
      date: new Date().toISOString().split("T")[0],
      verified: false,
      comment: newReview.comment,
      helpful: 0,
      images: [],
      pros: newReview.pros,
      cons: newReview.cons,
      wouldRecommend: newReview.wouldRecommend,
      purchaseVerified: false,
    }

    setReviews([review, ...reviews])
    setNewReview({ rating: 5, comment: "", name: "", pros: "", cons: "", wouldRecommend: true })
    setShowReviewForm(false)
    alert("Thank you for your review! It will be published after moderation.")
  }, [newReview, reviews])

  const handleSubmitQuestion = useCallback(() => {
    if (!newQuestion.question.trim()) {
      alert("Please enter your question")
      return
    }

    const question = {
      id: Date.now(),
      category: newQuestion.category,
      question: newQuestion.question,
      answer: "",
      helpful: 0,
      date: new Date().toISOString().split("T")[0],
      answeredBy: "",
      tags: newQuestion.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isAnswered: false,
    }

    setQAData([question, ...qaData])
    setNewQuestion({
      question: "",
      category: "General",
      tags: ""
    })
    setShowQuestionForm(false)
    alert("Thank you for your question! We'll get back to you soon.")
  }, [newQuestion, qaData])

  const stockMessage = useMemo(() => {
    if (!product) return "In stock"
    if (product.stock === 0) return "Out of stock"
    if (product.stock <= 5) return `Only ${product.stock} left in stock!`
    if (product.stock <= 10) return `${product.stock} in stock`
    return "In stock"
  }, [product?.stock])

  const getStockColor = useCallback(() => {
    if (!product) return "text-green-600"
    if (product.stock === 0) return "text-red-600"
    if (product.stock <= 5) return "text-orange-600"
    return "text-green-600"
  }, [product])

  const filteredReviews = useCallback(() => {
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
  }, [reviews, reviewFilter, reviewSort])

  const filteredQA = useCallback(() => {
    if (qaFilter === "all") return qaData
    return qaData.filter((qa) => qa.category === qaFilter)
  }, [qaData, qaFilter])

  const toggleQA = useCallback((id: number) => {
    setExpandedQA(prev => 
      prev.includes(id) 
        ? prev.filter(qaId => qaId !== id)
        : [...prev, id]
    )
  }, [])

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
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

  // Show enhanced loading state
  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#12d6fa] mx-auto"></div>
              <div className="text-lg font-medium">Loading premium product details...</div>
              <div className="text-sm text-muted-foreground">Preparing the best experience for you</div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Show error if product not found
  if (!product) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h1 className="text-2xl font-bold">Product Not Found</h1>
              <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
              <Link href="/shop/flavor" className="inline-flex items-center text-[#12d6fa] hover:text-[#0fb8d9] font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Flavors
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Calculate discount percentage
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0

  return (
    <PageLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Back Button with breadcrumb */}
          <div className="mb-6 space-y-4">
            <Link
              href="/shop/flavor"
              className="inline-flex items-center text-[#12d6fa] hover:text-[#0fb8d9] transition-all duration-200 hover:translate-x-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Flavors
            </Link>

            {/* Enhanced Breadcrumb */}
            <nav className="text-sm text-muted-foreground flex items-center space-x-2">
              <Link href="/" className="hover:text-[#12d6fa] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/shop/flavor" className="hover:text-[#12d6fa] transition-colors">
                Flavors
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">{product.name}</span>
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
                    onClick={() => {}}
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
                    onClick={() => {}}
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
                {/* Enhanced Product Images */}
                <div className="space-y-4">
                  <div
                    className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden cursor-zoom-in group shadow-lg"
                    onMouseEnter={() => !isShowingVideo && setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={!isShowingVideo ? handleImageZoom : undefined}
                    onClick={() => setShowImageGallery(true)}
                  >
                    {isShowingVideo ? (
                      <div className="w-full h-full">
                        {combinedMedia[selectedImage] && isYouTubeUrl(combinedMedia[selectedImage].src) ? (
                          <YouTubeVideo
                            videoUrl={combinedMedia[selectedImage].src}
                            title={`${product.name} - Product Video`}
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
                            <source src={combinedMedia[selectedImage]?.src} type="video/mp4" />
                            <source src={combinedMedia[selectedImage]?.src} type="video/webm" />
                            <source src={combinedMedia[selectedImage]?.src} type="video/ogg" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    ) : (
                      <img
                        src={product.images?.[selectedImage] || product.image || "/placeholder.svg"}
                        alt={product.name}
                        className={`${styles.productImageZoom} ${
                          isZoomed ? styles.zoomedImage : styles.defaultImage
                        } ${isZoomed ? styles.customTransformOrigin : ''}`}
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
                      {product.originalPrice > product.price && (
                        <Badge className="bg-red-500 text-white shadow-lg animate-pulse">{product.discount}% OFF</Badge>
                      )}
                      {product.isBestSeller && (
                        <Badge className="bg-amber-500 text-white shadow-lg">
                          <Award className="w-3 h-3 mr-1" />
                          Best Seller
                        </Badge>
                      )}
                      {product.isNew && (
                        <Badge className="bg-green-500 text-white shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {product.isEcoFriendly && (
                        <Badge className="bg-emerald-500 text-white shadow-lg">
                          <Leaf className="w-3 h-3 mr-1" />
                          Eco-Friendly
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
                    {combinedMedia.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageSelect(selectedImage > 0 ? selectedImage - 1 : combinedMedia.length - 1)
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                          aria-label="Previous media"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageSelect(selectedImage < combinedMedia.length - 1 ? selectedImage + 1 : 0)
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                          aria-label="Next media"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {combinedMedia.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {combinedMedia.map((media, index) => (
                        <button
                          key={index}
                          onClick={() => handleImageSelect(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImage === index
                              ? "border-[#12d6fa] ring-2 ring-[#12d6fa]/20"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {media.type === 'video' ? (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Play className="w-4 h-4 text-gray-500" />
                            </div>
                          ) : (
                            <img
                              src={media.src}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Enhanced Product Info */}
                <div className="space-y-6">
                  {/* Product Header */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.brand || product.category?.name}
                      </Badge>
                      {product.isFeatured && (
                        <Badge className="bg-[#12d6fa] text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <p className="text-gray-600 text-lg">{product.description}</p>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(product.averageRating || product.rating || 0)}
                      <span className="text-sm text-gray-600 ml-2">
                        ({product.reviewCount || product.reviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{product.reviewCount || product.reviews || 0} customers</span>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-[#12d6fa]">
                        <SaudiRiyal amount={product.price} size="lg" />
                      </span>
                      {product.originalPrice > product.price && (
                        <>
                          <span className="text-xl text-gray-500 line-through">
                            <SaudiRiyal amount={product.originalPrice} size="md" />
                          </span>
                          <Badge className="bg-red-500 text-white">
                            Save {discountPercentage}%
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {stockMessage} • Free shipping on orders over 200 <SaudiRiyalSymbol size="xs" />
                    </p>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStockColor().replace('text-', 'bg-')}`}></div>
                    <span className={`text-sm font-medium ${getStockColor()}`}>
                      {stockMessage}
                    </span>
                  </div>

                  {/* Quantity Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-10 h-10 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= (product.stock || 0)}
                        className="w-10 h-10 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className={`w-full h-12 text-lg font-semibold transition-all duration-200 ${
                        cartAnimation ? "animate-pulse bg-green-600" : ""
                      }`}
                    >
                      {cartAnimation ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Added to Cart!
                        </>
                      ) : product.stock === 0 ? (
                        "Out of Stock"
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={handleAddToWishlist}
                        className={`h-10 transition-all duration-200 ${
                          wishlistAnimation ? "animate-pulse" : ""
                        }`}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? "fill-current text-red-500" : ""}`} />
                        {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowShareMenu(true)}
                        className="h-10"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Product Features */}
                  {product.features && product.features.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">Key Features</h3>
                      <ul className="space-y-2">
                        {product.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{typeof feature === 'string' ? feature : (feature as any).title || feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Delivery Info */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Truck className="w-4 h-4 text-[#12d6fa]" />
                      <span className="font-medium">Free Delivery</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Estimated delivery: 2-3 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Product Details Tabs */}
          <div className="mt-16 mb-16">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="qa">Q&A</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6 sm:mt-8">
              <div className="prose max-w-none">
                <div className="bg-gradient-to-r from-[#12d6fa]/10 to-blue-50 p-4 sm:p-6 rounded-xl mb-6">
                  <p className="text-base sm:text-lg leading-relaxed text-gray-700">{product.description}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#12d6fa] flex-shrink-0" />
                      Key Features
                    </h3>
                    <ul className="space-y-3">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#12d6fa] mt-0.5 flex-shrink-0" />
                          <span className="text-sm sm:text-base text-gray-700">
                            {typeof feature === 'string' ? feature : (feature as any).title || feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 flex-shrink-0" />
                      Quality Assurance
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-700">Premium quality ingredients</span>
                      </li>
                      <li className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-700">Food-grade certified</span>
                      </li>
                      <li className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-700">No artificial preservatives</span>
                      </li>
                    </ul>

                    <h3 className="text-lg sm:text-xl font-semibold mb-4 mt-6 flex items-center">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-500 flex-shrink-0" />
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-amber-200 text-amber-700 text-xs sm:text-sm">
                        Halal Certified
                      </Badge>
                      <Badge variant="outline" className="border-amber-200 text-amber-700 text-xs sm:text-sm">
                        Food Grade
                      </Badge>
                      <Badge variant="outline" className="border-amber-200 text-amber-700 text-xs sm:text-sm">
                        Quality Assured
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(product.specifications) ? product.specifications.map((spec: any, index: number) => (
                        <div key={index} className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-600">{spec.name || spec.title}</span>
                          <span className="text-gray-900">{spec.value || spec.description}</span>
                        </div>
                      )) : Object.entries(product.specifications).map(([key, value], index) => (
                        <div key={index} className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-600">{key}</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Customer Reviews</h3>
                      <Button onClick={() => setShowReviewForm(true)}>
                        Write a Review
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{product.averageRating || product.rating || 0}</div>
                        <div className="flex items-center">{renderStars(product.averageRating || product.rating || 0)}</div>
                        <div className="text-sm text-gray-600">{product.reviewCount || product.reviews || 0} reviews</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {filteredReviews().map((review: any) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <Avatar>
                              <AvatarImage src={review.avatar} />
                              <AvatarFallback>{review.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.name}</div>
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-600">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <button className="flex items-center space-x-1 hover:text-[#12d6fa]">
                              <ThumbsUp className="w-4 h-4" />
                              <span>Helpful ({review.helpful})</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Product Videos</h3>
                    {product.videos && product.videos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.videos.map((video, index) => (
                          <div key={index} className="aspect-video">
                            {isYouTubeUrl(video) ? (
                              <YouTubeVideo
                                videoUrl={video}
                                title={`${product.name} - Video ${index + 1}`}
                                className="w-full h-full"
                              />
                            ) : (
                              <video
                                className="w-full h-full object-cover rounded-lg"
                                controls
                                poster="/placeholder.svg"
                              >
                                <source src={video} type="video/mp4" />
                                <source src={video} type="video/webm" />
                                <source src={video} type="video/ogg" />
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No videos available for this product.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Questions & Answers</h3>
                      <Button onClick={() => setShowQuestionForm(true)}>
                        Ask a Question
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {filteredQA().map((qa: any) => (
                        <div key={qa.id} className="border rounded-lg p-4">
                          <button
                            onClick={() => toggleQA(qa.id)}
                            className="w-full text-left flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium text-gray-900">{qa.question}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {qa.category} • {qa.helpful} people found this helpful
                              </div>
                            </div>
                            {expandedQA.includes(qa.id) ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                          
                          {expandedQA.includes(qa.id) && qa.answer && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="text-gray-700">{qa.answer}</div>
                              <div className="text-sm text-gray-600 mt-2">
                                Answered by {qa.answeredBy} on {qa.date}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </div>

          {/* Enhanced Share Menu Dialog */}
          <Dialog open={showShareMenu} onOpenChange={setShowShareMenu}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share this product</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleShare("facebook")}>
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" onClick={() => handleShare("twitter")}>
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" onClick={() => handleShare("whatsapp")}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={() => handleShare("copy")}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Enhanced Review Form Dialog */}
          <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="text-2xl"
                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= newReview.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Review</label>
                  <Textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience with this product"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Pros</label>
                    <Input
                      value={newReview.pros}
                      onChange={(e) => setNewReview({ ...newReview, pros: e.target.value })}
                      placeholder="What you liked"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cons</label>
                    <Input
                      value={newReview.cons}
                      onChange={(e) => setNewReview({ ...newReview, cons: e.target.value })}
                      placeholder="What could be improved"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newReview.wouldRecommend}
                    onCheckedChange={(checked) =>
                      setNewReview({ ...newReview, wouldRecommend: checked })
                    }
                  />
                  <label className="text-sm">I would recommend this product</label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitReview}>Submit Review</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Enhanced Question Form Dialog */}
          <Dialog open={showQuestionForm} onOpenChange={setShowQuestionForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ask a Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question</label>
                  <Textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    placeholder="What would you like to know about this product?"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select
                    value={newQuestion.category}
                    onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Usage">Usage</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                      <SelectItem value="Shipping">Shipping</SelectItem>
                      <SelectItem value="Warranty">Warranty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tags (optional)</label>
                  <Input
                    value={newQuestion.tags}
                    onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                    placeholder="e.g., taste, quality, packaging"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowQuestionForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitQuestion}>Submit Question</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Enhanced Image Gallery Dialog */}
          <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <DialogHeader className="p-4 border-b">
                <DialogTitle className="flex items-center justify-between">
                  <span>{product.name} - Media Gallery</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowImageGallery(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              
              <div className="relative">
                <div className="aspect-video bg-black flex items-center justify-center">
                  {isShowingVideo ? (
                    <div className="w-full h-full">
                      {combinedMedia[selectedImage] && isYouTubeUrl(combinedMedia[selectedImage].src) ? (
                        <YouTubeVideo
                          videoUrl={combinedMedia[selectedImage].src}
                          title={`${product.name} - Product Video`}
                          className="w-full h-full"
                          showThumbnail={false}
                          autoplay={true}
                          controls={true}
                        />
                      ) : (
                        <video
                          className="w-full h-full object-cover"
                          controls
                          autoPlay
                          muted={isVideoMuted}
                        >
                          <source src={combinedMedia[selectedImage]?.src} type="video/mp4" />
                          <source src={combinedMedia[selectedImage]?.src} type="video/webm" />
                          <source src={combinedMedia[selectedImage]?.src} type="video/ogg" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  ) : (
                    <img
                      src={combinedMedia[selectedImage]?.src || "/placeholder.svg"}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>

                {combinedMedia.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={() =>
                        handleImageSelect(selectedImage > 0 ? selectedImage - 1 : combinedMedia.length - 1)
                      }
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={() =>
                        handleImageSelect(selectedImage < combinedMedia.length - 1 ? selectedImage + 1 : 0)
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>

              <div className="p-4 border-t">
                <div className="flex space-x-2 overflow-x-auto">
                  {combinedMedia.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden relative ${
                        selectedImage === index ? "border-[#12d6fa]" : "border-gray-200"
                      }`}
                    >
                      {media.type === 'video' ? (
                        <>
                          {isYouTubeUrl(media.src) ? (
                            <img
                              src={`https://img.youtube.com/vi/${getYouTubeVideoId(media.src)}/mqdefault.jpg`}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              className="w-full h-full object-cover"
                              muted
                            >
                              <source src={media.src} type="video/mp4" />
                              <source src={media.src} type="video/webm" />
                              <source src={media.src} type="video/ogg" />
                            </video>
                          )}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={media.src || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </PageLayout>
  )
}