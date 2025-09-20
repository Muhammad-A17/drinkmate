"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { shopAPI, invalidateCache } from "@/lib/api"
import { useCart } from "@/lib/cart-context"
import { useTranslation } from "@/lib/translation-context"
import { YouTubeVideo, isYouTubeUrl, getYouTubeVideoId } from "@/components/ui/youtube-video"
import YouTubeThumbnail from "@/components/ui/YouTubeThumbnail"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Minus,
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  ChevronLeft,
  Star,
  Check,
  Shield,
  Truck,
  Award,
  Clock,
  Sparkles,
  ArrowLeft,
  Eye,
  TrendingUp,
  Maximize2,
  Bell,
  Copy,
  Facebook,
  Twitter,
  Loader2,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Play,
  MessageCircle,
  Calendar,
  Package,
  Recycle,
  Leaf,
  Gauge,
  Settings,
  Filter,
  X,
  Zap,
  AlertCircle,
  Info,
  Users,
  CheckCircle,
  Link2,
  Instagram,
  Youtube,
  Video,
} from "lucide-react"
import PageLayout from "@/components/layout/PageLayout"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

// Dynamic export to prevent static optimization
export const dynamic = "force-dynamic"

interface BundleItem {
  product: string
  name: string
  price: number
  image?: string
}

interface BundleProduct {
  // Basic product fields
  _id: string
  id?: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  fullDescription?: string
  price: number
  originalPrice?: number
  salePrice?: number
  discount?: number
  bundleDiscount?: number
  sku?: string
  stock?: number
  isActive?: boolean
  isFeatured?: boolean
  isBestSeller?: boolean
  isNewProduct?: boolean
  isNewArrival?: boolean
  isEcoFriendly?: boolean
  averageRating?: number
  rating?: number
  reviewCount?: number
  reviews?: number
  totalReviews?: number

  // Category and classification
  category: string | { _id: string; name: string; slug: string }
  categoryId?: string
  subcategory?: string
  tags?: string[]

  // SEO and marketing
  seoTitle?: string
  seoDescription?: string
  badge?: {
    text: string
    color: string
  }
  brand?: string

  // Media
  image?: string
  images?: (string | any)[] // Support both string and object formats

  // Bundle-specific fields
  items?: BundleItem[]
  isLimited?: boolean

  // Product details
  features?: (string | any)[] // Support both string and object formats
  specifications?: any[] | Record<string, any> // Support both array and object formats
  safetyFeatures?: string[]
  dimensions?: {
    width: number
    height: number
    depth: number
    weight: number
  }
  warranty?: string
  certifications?: string[]
  compatibility?: string[]
  videos?: string[]
  youtubeLinks?: string[]
  documents?: string[]
}

interface Review {
  id: string
  user: string
  avatar: string
  rating: number
  date: string
  verified: boolean
  comment: string
  helpful: number
  images: string[]
  pros: string[]
  cons: string[]
  wouldRecommend: boolean
  purchaseVerified: boolean
}

interface QA {
  id: string
  category: string
  question: string
  answer: string
  helpful: number
  date: string
  answeredBy: string
  tags: string[]
  isAnswered?: boolean
}

// Mock data removed - data will be fetched from API

export default function BundleDetailPage() {
  const params = useParams()
  const { t } = useTranslation()
  const { addItem } = useCart()
  const router = useRouter()

  const productSlug = params?.slug as string
  const [product, setProduct] = useState<BundleProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<BundleProduct[]>([])
  const [loadingRelated, setLoadingRelated] = useState(true)

  // Enhanced state management with more features
  const [selectedImage, setSelectedImage] = useState(0)
  const [isShowingVideo, setIsShowingVideo] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isInCart, setIsInCart] = useState(false)
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
  const [reviews, setReviews] = useState<Review[]>([])
  const [qaData, setQAData] = useState<QA[]>([])
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "Usage & Features",
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
  const fetchRelatedProducts = useCallback(async (currentProductId: string) => {
    try {
      setLoadingRelated(true)

      // Get related bundles
      const response = await shopAPI.getProducts({
        category: 'bundles',
        limit: 4,
        exclude: currentProductId
      });

      if (response.success && response.products) {
        // Process images to ensure they have absolute URLs
        const processedProducts = response.products.map((bundle: BundleProduct) => {
          // Handle case where image might be undefined or null
          const safeImage = bundle.image || ''
          const safeImages = bundle.images || []

          return {
            ...bundle,
            // Ensure image URL is absolute
            image: safeImage.startsWith('http') ? safeImage :
                   safeImage.startsWith('/') ? `http://localhost:3000${safeImage}` :
                   '/placeholder.svg',
            // Ensure image URLs in arrays are absolute
            images: safeImages.map((img: any) => {
              const imageUrl = typeof img === 'string' ? img : img?.url || img
              return imageUrl?.startsWith('http') ? imageUrl :
                     imageUrl?.startsWith('/') ? `http://localhost:3000${imageUrl}` :
                     '/placeholder.svg'
            })
          }
        });

        setRelatedProducts(processedProducts);
      } else {
        // No related products found
        setRelatedProducts([]);
      }
    } catch (error) {
      // Error fetching related products - continue without them
      // Set empty array on error
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  }, [])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)

        // Clear cache to ensure we get fresh data
        invalidateCache(`bundle-flexible-${productSlug}`)

        // Get bundle product details using shopAPI
        const response = await shopAPI.getBundleFlexible(productSlug, true); // bypassCache = true

        // Handle API response format
        if (response.success && response.bundle) {
          const productData = response.bundle

          // Ensure image URLs are absolute
          const processedProduct = {
            ...productData,
            // Ensure image URL is absolute
            image: productData.image?.startsWith('http') ? productData.image :
                   productData.image?.startsWith('/') ? `http://localhost:3000${productData.image}` :
                   '/placeholder.svg',
            // Ensure image URLs in arrays are absolute
            images: (productData.images || []).map((img: any) => {
              const imageUrl = typeof img === 'string' ? img : img?.url || img
              return imageUrl?.startsWith('http') ? imageUrl :
                     imageUrl?.startsWith('/') ? `http://localhost:3000${imageUrl}` :
                     '/placeholder.svg'
            }),
            // Add any missing properties with default values
            specifications: productData.specifications || {},
            videos: productData.videos || [],
            documents: productData.documents || [],
            certifications: productData.certifications || [],
            dimensions: productData.dimensions || { width: 0, height: 0, depth: 0, weight: 0 },
            compatibility: productData.compatibility || [],
            safetyFeatures: productData.safetyFeatures || [],
          }

          setProduct(processedProduct)

          // Fetch related products after getting the current product
          fetchRelatedProducts(productData._id);
        } else {
          // Set empty product if API fails
          setProduct(null)
          setReviews([])
          setQAData([])
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching bundle:', error)
        // Error fetching product - show error state
        setProduct(null)
        setReviews([])
        setQAData([])
        setLoading(false)
      }
    }

    if (productSlug) {
      fetchProduct()
    }
  }, [productSlug, fetchRelatedProducts])

  const handleAddToCart = useCallback(() => {
    if (!product) return

    setCartAnimation(true)
    setIsInCart(true)

    // Add item to cart context
    addItem({
      id: product._id || product.id || productSlug,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.image || (() => {
        const img = product.images?.[0]
        return typeof img === 'string' ? img : img?.url || '/placeholder.svg'
      })(),
      quantity: quantity,
      category: 'bundles'
    })

    // Simulate cart API call
    setTimeout(() => {
      setCartAnimation(false)
      // Navigate to cart page
      router.push('/cart')
    }, 1000)
  }, [product, quantity, addItem, router])

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

  // Create combined media array (images + videos + YouTube links)
  const combinedMedia = useMemo(() => {
    const media: Array<{ type: 'image' | 'video' | 'youtube', src: string, index: number }> = []

    // Add images
    if (product?.images) {
      product.images.forEach((image, index) => {
        const imageUrl = typeof image === 'string' ? image : image?.url || ''
        media.push({ type: 'image', src: imageUrl, index })
      })
    }

    // Add videos
    if (product?.videos) {
      product.videos.forEach((video, index) => {
        media.push({ type: 'video', src: video, index })
      })
    }

    // Add YouTube links
    if (product?.youtubeLinks) {
      product.youtubeLinks.forEach((link, index) => {
        media.push({ type: 'youtube', src: link, index })
      })
    }

    return media
  }, [product?.images, product?.videos, product?.youtubeLinks])

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImage(index)
    const media = combinedMedia[index]
    setIsShowingVideo(media?.type === 'video' || media?.type === 'youtube')
  }, [combinedMedia])

  const handleImageZoom = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }, [])

  const handleShare = useCallback(
    (platform: string) => {
      if (!product) return
      const url = typeof window !== "undefined" ? window.location.href : ""
      const text = `Check out this amazing ${product.name} - ${product.description?.substring(0, 100) || 'No description available'}...`

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

  const handleSubmitReview = useCallback(async () => {
    if (!newReview.comment.trim() || !newReview.name.trim()) {
      alert("Please fill in all required fields")
      return
    }

    if (!product) {
      alert("Product not found")
      return
    }

    try {
      // Submit review to API
      const reviewData = {
        rating: newReview.rating,
        comment: newReview.comment,
        name: newReview.name,
        pros: newReview.pros
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        cons: newReview.cons
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        wouldRecommend: newReview.wouldRecommend,
      }

      // For now, we'll add it locally since we don't have a review API endpoint yet
      const review = {
        id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: newReview.name,
        avatar: "/diverse-user-avatars.png",
        rating: newReview.rating,
        date: new Date().toISOString().split("T")[0],
        verified: false,
        comment: newReview.comment,
        helpful: 0,
        images: [],
        pros: reviewData.pros,
        cons: reviewData.cons,
        wouldRecommend: newReview.wouldRecommend,
        purchaseVerified: false,
      }

      setReviews([review, ...reviews])
      setNewReview({ rating: 5, comment: "", name: "", pros: "", cons: "", wouldRecommend: true })
      setShowReviewForm(false)
      alert("Thank you for your review! It will be published after moderation.")
    } catch (error) {
      console.error('Error submitting review:', error)
      alert("Failed to submit review. Please try again.")
    }
  }, [newReview, reviews, product])

  const handleSubmitQuestion = useCallback(() => {
    if (!newQuestion.question.trim()) {
      alert("Please enter your question")
      return
    }

    // For now, we'll add it locally since we don't have a Q&A API endpoint yet
    const question = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      category: "Usage & Features",
      tags: ""
    })
    setShowQuestionForm(false)
    alert("Thank you for your question! We'll get back to you soon.")
  }, [newQuestion, qaData])

  const stockMessage = useMemo(() => {
    if (!product || product.stock === undefined || product.stock === null) return "In stock"
    if (product.stock === 0) return "Out of stock"
    if (product.stock <= 5) return `Only ${product.stock} left in stock!`
    if (product.stock <= 10) return `${product.stock} in stock`
    return "In stock"
  }, [product?.stock])

  const getStockColor = useCallback(() => {
    if (!product || product.stock === undefined || product.stock === null) return "text-green-600"
    if (product.stock === 0) return "text-red-600"
    if (product.stock <= 5) return "text-orange-600"
    return "text-green-600"
  }, [product])

  const getDeliveryDate = useMemo(() => {
    const today = new Date()
    const deliveryDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
    return deliveryDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  }, [])

  const getServiceTypeText = useCallback((type: string) => {
    switch (type) {
      case "new":
        return "New Product"
      case "refurbished":
        return "Refurbished"
      case "subscription":
        return "Subscription Service"
      default:
        return "Product Service"
    }
  }, [])

  const getCapacityText = useCallback((capacity: number) => {
    return `${capacity} units capacity`
  }, [])

  const calculateSavings = useCallback(() => {
    if (!product) return 0
    const originalPrice = product.originalPrice || product.price
    const currentPrice = product.salePrice || product.price
    return originalPrice - currentPrice
  }, [product])

  const getEstimatedUsage = useCallback(() => {
    if (!product) return ""
    const weeksLow = Math.floor((product.stock || 10) / 20)
    const weeksHigh = Math.floor((product.stock || 10) / 10)
    return `${weeksLow}-${weeksHigh} weeks`
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
        return filtered.sort((a, b) => a.rating - a.rating)
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

  // Show enhanced loading state
  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#12d6fa] mx-auto"></div>
              <div className="text-lg font-medium">Loading premium bundle details...</div>
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
              <h1 className="text-2xl font-bold">Bundle Not Found</h1>
              <p className="text-gray-600 mb-4">The bundle you're looking for doesn't exist or has been removed.</p>
              <Link href="/shop/flavor/bundles" className="inline-flex items-center text-[#12d6fa] hover:text-[#0fb8d9] font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bundles
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    // Type assertion: product is guaranteed to exist here since we checked earlier
    <PageLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Back Button with breadcrumb */}
          <div className="mb-6 space-y-4">
            <Link
              href="/shop/flavor/bundles"
              className="inline-flex items-center text-[#12d6fa] hover:text-[#0fb8d9] transition-all duration-200 hover:translate-x-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Flavor Bundles
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
              <Link href="/shop/flavor/bundles" className="hover:text-[#12d6fa] transition-colors">
                Flavor Bundles
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
                          />
                        ) : (
                          <video
                            className="w-full h-full object-cover"
                            controls
                            poster="/placeholder.svg"
                          >
                            <source src={combinedMedia[selectedImage]?.src || ''} type="video/mp4" />
                            <source src={combinedMedia[selectedImage]?.src || ''} type="video/webm" />
                            <source src={combinedMedia[selectedImage]?.src || ''} type="video/ogg" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={(() => {
                            // First try to get URL from combinedMedia
                            const mediaUrl = combinedMedia[selectedImage]?.src;
                            if (mediaUrl && mediaUrl.trim() !== '') {
                              console.log('Using combinedMedia URL:', mediaUrl);
                              return mediaUrl;
                            }
                            
                            // Fallback to product images array
                            const img = product.images?.[selectedImage];
                            const imgUrl = typeof img === 'string' ? img : img?.url;
                            if (imgUrl && imgUrl.trim() !== '') {
                              console.log('Using product.images URL:', imgUrl);
                              return imgUrl;
                            }
                            
                            // Final fallback to default image
                            console.log('Using fallback image');
                            return "/images/04 - Kits/Starter-Kit---Example---Do-Not-Use.png";
                          })()}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          style={{ backgroundColor: '#f0f0f0' }}
                          onError={(e) => {
                            console.error('Main image failed to load:', {
                              selectedImage,
                              combinedMedia: combinedMedia[selectedImage],
                              productImages: product.images,
                              error: e
                            })
                            // Try to load fallback
                            e.currentTarget.src = "/images/04 - Kits/Starter-Kit---Example---Do-Not-Use.png";
                          }}
                          onLoad={() => {
                            console.log('Main image loaded successfully:', {
                              selectedImage,
                              combinedMedia: combinedMedia[selectedImage]
                            })
                          }}
                        />
                        {/* Fallback text if image fails */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                          {(!combinedMedia[selectedImage]?.src || combinedMedia[selectedImage]?.src?.trim() === '') && (!product?.images?.[selectedImage] || (typeof product.images[selectedImage] === 'string' ? product.images[selectedImage].trim() === '' : product.images[selectedImage]?.url?.trim() === '')) && "No image available"}
                        </div>
                        {/* Debug overlay */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs p-1 rounded z-10">
                            Debug: {combinedMedia[selectedImage]?.src ? 'Has URL' : 'No URL'} | Index: {selectedImage} | Total: {combinedMedia.length}
                            <br />
                            Product Images: {product?.images?.length || 0}
                            <br />
                            Current URL: {(() => {
                              const mediaUrl = combinedMedia[selectedImage]?.src;
                              if (mediaUrl && mediaUrl.trim() !== '') return mediaUrl;
                              const img = product?.images?.[selectedImage];
                              const imgUrl = typeof img === 'string' ? img : img?.url;
                              if (imgUrl && imgUrl.trim() !== '') return imgUrl;
                              return "fallback";
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Enhanced Badges */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {/* @ts-ignore - product exists at this point since we checked earlier */}
                      {(product.originalPrice || product.salePrice) && (product.originalPrice || product.salePrice) > (product.salePrice || product.price) && (
                        <Badge className="bg-red-500 text-white shadow-lg animate-pulse">
                          {/* @ts-ignore */}
                          {product.discount || Math.round(((product.originalPrice || product.salePrice) - (product.salePrice || product.price)) / (product.originalPrice || product.salePrice) * 100)}% OFF
                        </Badge>
                      )}
                      {product.isBestSeller && (
                        <Badge className="bg-amber-500 text-white shadow-lg">
                          <Award className="w-3 h-3 mr-1" />
                          Best Seller
                        </Badge>
                      )}
                      {product.isNewProduct && (
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
                      {product.isLimited && (
                        <Badge className="bg-purple-500 text-white shadow-lg">
                          <Clock className="w-3 h-3 mr-1" />
                          Limited Edition
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
                            const newIndex = selectedImage > 0 ? selectedImage - 1 : combinedMedia.length - 1
                            handleImageSelect(newIndex)
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                          aria-label="Previous media"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const newIndex = selectedImage < combinedMedia.length - 1 ? selectedImage + 1 : 0
                            handleImageSelect(newIndex)
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
                    {combinedMedia.map((media, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageSelect(index)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
                          selectedImage === index
                            ? "border-[#12d6fa] shadow-lg scale-105"
                            : "border-gray-200 hover:border-gray-300 hover:scale-102"
                        }`}
                      >
                        {media.type === 'video' ? (
                          <>
                            <img
                              src={media.src || "/placeholder.svg"}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <img
                            src={media.src || "/placeholder.svg"}
                            alt={`${product?.name || 'Product'} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Product Info */}
                <div className="space-y-6">
                  {/* Product Header */}
                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="text-[#12d6fa] border-[#12d6fa] text-sm sm:text-base">
                        {typeof product.category === 'object' ? product.category.name : (product.category || "Flavor Bundle")}
                      </Badge>
                      {product.brand && (
                        <Badge variant="outline" className="border-gray-300 text-xs sm:text-sm">
                          {product.brand}
                        </Badge>
                      )}
                      {product.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs sm:text-sm">
                          {tag}
                        </Badge>
                      ))}
                      {product.tags && product.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          +{product.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-balance leading-tight">{product.name}</h1>

                    {/* Enhanced Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                star <= (product.averageRating || product.rating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm sm:text-base font-medium">
                          {product.averageRating || product.rating || 0}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({product.totalReviews || product.reviews || 0} reviews)
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4 hidden sm:block" />
                      <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{product.totalReviews || product.reviews || 0} reviews</span>
                      </div>
                    </div>

                    {/* Enhanced Pricing */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#12d6fa]">
                        <SaudiRiyal amount={product.salePrice || product.price} size="lg" />
                      </span>
                      {/* @ts-ignore - product exists at this point since we checked earlier */}
                      {(product.originalPrice || product.salePrice) && (product.originalPrice || product.salePrice) > (product.salePrice || product.price) && (
                        <span className="text-base text-muted-foreground line-through">
                          <SaudiRiyal amount={product.originalPrice || product.salePrice} size="md" />
                        </span>
                      )}
                      {calculateSavings() > 0 && (
                        <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
                          Save <SaudiRiyal amount={calculateSavings()} size="sm" />
                        </Badge>
                      )}
                    </div>

                    {/* Enhanced Stock and Badges */}
                    <div className="flex items-center flex-wrap gap-2 mb-6">
                      <Badge variant={(product.stock ?? 0) > 0 ? "default" : "destructive"} className={`${getStockColor()} text-xs sm:text-sm`}>
                        <Package className="w-3 h-3 mr-1" />
                        {stockMessage}
                      </Badge>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">
                        <Truck className="w-3 h-3 mr-1" />
                        Free Shipping
                      </Badge>
                      {product.isFeatured && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs sm:text-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        Est. delivery: {getDeliveryDate}
                      </Badge>
                    </div>

                    {/* Bundle Contents */}
                    {product.items && product.items.length > 0 && (
                      <Card className="border-l-4 border-l-[#12d6fa]">
                        <CardContent className="p-3 sm:p-4">
                          <h3 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                            <Package className="w-4 h-4 mr-2 text-[#12d6fa] flex-shrink-0" />
                            Bundle Contents ({Array.isArray(product.items) ? product.items.length : 0} items)
                          </h3>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {Array.isArray(product.items) && product.items.length > 0 ? (
                              product.items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                  <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      <SaudiRiyal amount={item.price} size="sm" />
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                No items available
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Enhanced Quantity and Actions */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center border-2 border-gray-200 rounded-lg hover:border-[#12d6fa] transition-colors w-fit">
                          <button
                            onClick={() => handleQuantityChange(-1)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                            disabled={quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(1)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                            disabled={quantity >= (product.stock || 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {(product.stock ?? 0) > 0 ? (
                            <span className="text-green-600">
                              ✓ {product.stock} available
                            </span>
                          ) : (
                            <span className="text-red-600">
                              ✗ Out of stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {(product.stock ?? 0) > 0 ? (
                          <Button
                            onClick={handleAddToCart}
                            className={`flex-1 bg-[#12d6fa] hover:bg-[#0fb8d9] text-white transition-all duration-200 ${
                              cartAnimation ? "animate-pulse scale-105" : ""
                            }`}
                            size="lg"
                          >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Add to Cart
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setShowNotifyMe(true)}
                            variant="outline"
                            className="flex-1 border-2 border-[#12d6fa] text-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200"
                            size="lg"
                          >
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Notify When Available
                          </Button>
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
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <div className="p-2">
                                <button
                                  onClick={() => handleShare("facebook")}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                >
                                  <Facebook className="w-4 h-4 mr-2" />
                                  Facebook
                                </button>
                                <button
                                  onClick={() => handleShare("twitter")}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                >
                                  <Twitter className="w-4 h-4 mr-2" />
                                  Twitter
                                </button>
                                <button
                                  onClick={() => handleShare("copy")}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Link
                                </button>
                              </div>
                            </div>
                          )}
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
                    value="specifications"
                    className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Specifications</span>
                    <span className="sm:hidden">Specs</span>
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
                    value="videos"
                    className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
                  >
                    <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Videos ({(product.videos?.length || 0) + (product.youtubeLinks?.length || 0)})</span>
                    <span className="sm:hidden">Videos</span>
                    <span className="sm:hidden text-xs ml-1">({(product.videos?.length || 0) + (product.youtubeLinks?.length || 0)})</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="qa"
                    className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
                  >
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Q&A ({qaData.length})</span>
                    <span className="sm:hidden">Q&A</span>
                    <span className="sm:hidden text-xs ml-1">({qaData.length})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-6 sm:mt-8">
                  <div className="prose max-w-none">
                    <div className="bg-gradient-to-r from-[#12d6fa]/10 to-blue-50 p-4 sm:p-6 rounded-xl mb-6">
                      <p className="text-base sm:text-lg leading-relaxed text-gray-700">{product.description}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                          Key Features
                        </h3>
                        <ul className="space-y-3">
                          {Array.isArray(product.features) && product.features.length > 0 ? (
                            product.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <Check className="w-4 h-4 text-[#12d6fa] mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="text-gray-700 font-medium">{typeof feature === 'string' ? feature : feature.title}</span>
                                  {typeof feature === 'object' && feature.description && (
                                    <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                                  )}
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="flex items-start">
                              <Check className="w-4 h-4 text-[#12d6fa] mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">Premium quality ingredients</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-blue-500" />
                          Safety & Quality
                        </h3>
                        <ul className="space-y-3">
                          {Array.isArray(product.safetyFeatures) && product.safetyFeatures.length > 0 ? (
                            product.safetyFeatures.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <Shield className="w-4 h-4 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))
                          ) : (
                            <>
                              <li className="flex items-start">
                                <Shield className="w-4 h-4 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">Quality tested and certified</span>
                              </li>
                              <li className="flex items-start">
                                <Shield className="w-4 h-4 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">Safe for everyday use</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Bundle Contents Detail */}
                    {product.items && product.items.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#12d6fa] flex-shrink-0" />
                          What's Included in This Bundle
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.isArray(product.items) && product.items.length > 0 ? (
                            product.items.map((item, index) => (
                              <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                />
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    <SaudiRiyal amount={item.price} size="sm" />
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No items available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="mt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Settings className="w-5 h-5 mr-2 text-[#12d6fa]" />
                          Technical Specifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {product.specifications && Array.isArray(product.specifications) ? product.specifications.map((spec, index) => (
                          <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <span className="font-medium text-gray-700">{spec.name}</span>
                            <span className="text-gray-600">{spec.value}</span>
                          </div>
                        )) : product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <span className="font-medium text-gray-700">{key}</span>
                            <span className="text-gray-600">{String(value)}</span>
                          </div>
                        )) || (
                          <>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="font-medium text-gray-700">Bundle Type</span>
                              <span className="text-gray-600">{product.subcategory || "Bundles & Promotions of Flavors"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="font-medium text-gray-700">Items Included</span>
                              <span className="text-gray-600">{product.items?.length || 0} flavors</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="font-medium text-gray-700">Total Weight</span>
                              <span className="text-gray-600">{product.dimensions?.weight ? `${product.dimensions.weight} kg` : "Lightweight"}</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Award className="w-5 h-5 mr-2 text-green-500" />
                          Certifications & Warranty
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-700">Warranty</span>
                          <span className="text-gray-600">{product.warranty || "1 Year"}</span>
                        </div>
                        <div className="py-2 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium text-gray-700 block mb-2">Certifications</span>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(product.certifications) && product.certifications.length > 0 ? (
                              product.certifications.map((cert) => (
                                <Badge key={cert} variant="secondary" className="text-xs">
                                  {cert}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="secondary" className="text-xs">Halal Certified</Badge>
                            )}
                          </div>
                        </div>
                        <div className="py-2 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium text-gray-700 block mb-2">Compatibility</span>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(product.compatibility) && product.compatibility.length > 0 ? (
                              product.compatibility.map((comp) => (
                                <Badge key={comp} variant="outline" className="text-xs">
                                  {comp}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">Universal</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-8">
                  <div className="space-y-8">
                    {/* Enhanced Review Summary */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-[#12d6fa] mb-2">
                              {product.averageRating || product.rating || 0}
                            </div>
                            <div className="flex items-center justify-center mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= (product.averageRating || product.rating || 0)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Based on {product.totalReviews || product.reviews || 0} reviews
                            </div>
                          </div>
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = reviews.filter((r) => r.rating === rating).length
                              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                              return (
                                <div key={rating} className="flex items-center space-x-2">
                                  <span className="text-sm w-8">{rating}★</span>
                                  <Progress value={percentage} className="flex-1 h-2" />
                                  <span className="text-sm text-muted-foreground w-8">{count}</span>
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
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <Select value={reviewFilter} onValueChange={setReviewFilter}>
                              <SelectTrigger>
                                <SelectValue placeholder="Filter by rating" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Reviews</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="1">1 Star</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Select value={reviewSort} onValueChange={setReviewSort}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sort reviews" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="highest">Highest Rated</SelectItem>
                                <SelectItem value="lowest">Lowest Rated</SelectItem>
                                <SelectItem value="helpful">Most Helpful</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Write a Review Section */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Write a Review</h3>
                          <Button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            variant="outline"
                            size="sm"
                          >
                            {showReviewForm ? "Cancel" : "Write Review"}
                          </Button>
                        </div>

                        {showReviewForm && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                placeholder="Your name"
                                value={newReview.name}
                                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                              />
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">Rating:</span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => setNewReview({ ...newReview, rating: star })}
                                      className="text-yellow-400 hover:text-yellow-500"
                                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    >
                                      <Star className={`w-5 h-5 ${star <= newReview.rating ? "fill-current" : ""}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <Textarea
                              placeholder="Share your experience with this product..."
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              rows={4}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                placeholder="Pros (comma separated)"
                                value={newReview.pros}
                                onChange={(e) => setNewReview({ ...newReview, pros: e.target.value })}
                              />
                              <Input
                                placeholder="Cons (comma separated)"
                                value={newReview.cons}
                                onChange={(e) => setNewReview({ ...newReview, cons: e.target.value })}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={newReview.wouldRecommend}
                                onCheckedChange={(checked) => setNewReview({ ...newReview, wouldRecommend: checked })}
                              />
                              <span className="text-sm">I would recommend this product</span>
                            </div>
                            <Button onClick={handleSubmitReview} className="bg-[#12d6fa] hover:bg-[#0fb8d9]">
                              Submit Review
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Enhanced Reviews List */}
                    <div className="space-y-6">
                      {filteredReviews().map((review) => (
                        <Card key={review.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarImage src={review.avatar} alt={review.user} />
                                <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{review.user}</span>
                                    {review.verified && (
                                      <Badge variant="secondary" className="text-xs">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Verified Purchase
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-sm text-muted-foreground">{review.date}</span>
                                </div>
                                <div className="flex items-center space-x-1 mb-3">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-gray-700 mb-4">{review.comment}</p>
                                {review.pros && review.pros.length > 0 && (
                                  <div className="mb-3">
                                    <span className="font-medium text-green-600">Pros:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {review.pros.map((pro, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs bg-green-50 text-green-700">
                                          {pro}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {review.cons && review.cons.length > 0 && (
                                  <div className="mb-3">
                                    <span className="font-medium text-red-600">Cons:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {review.cons.map((con, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs bg-red-50 text-red-700">
                                          {con}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-[#12d6fa]">
                                      <ThumbsUp className="w-4 h-4" />
                                      <span>Helpful ({review.helpful})</span>
                                    </button>
                                    {review.wouldRecommend && (
                                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                        Would Recommend
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="mt-8">
                  <div className="space-y-6">
                    {(product.videos && product.videos.length > 0) || (product.youtubeLinks && product.youtubeLinks.length > 0) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {/* All Videos (including YouTube) */}
                        {[...(product.videos || []), ...(product.youtubeLinks || [])].map((video, index) => (
                          <Card key={`video-${index}`}>
                            <CardContent className="p-0 h-full flex flex-col" onClick={() => {
                              const combinedIndex = combinedMedia.findIndex(media => media.src === video);
                              if (combinedIndex !== -1) {
                                handleImageSelect(combinedIndex)
                              }
                            }}>
                              {isYouTubeUrl(video) ? (
                                <div className="flex-1 relative">
                                  <YouTubeVideo
                                    videoUrl={video}
                                    title={`${product.name} - Video ${index + 1}`}
                                    className="w-full h-full"
                                    showThumbnail={true}
                                  />
                                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                                    YouTube
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 relative">
                                  <video
                                    className="w-full h-64 object-cover rounded-t-lg"
                                    controls
                                    poster="/placeholder.svg"
                                  >
                                    <source src={video} type="video/mp4" />
                                    <source src={video} type="video/webm" />
                                    <source src={video} type="video/ogg" />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              )}
                              <div className="p-3 sm:p-4 lg:p-6 bg-white border-t border-gray-100">
                                <h3 className="font-semibold text-xs sm:text-sm lg:text-base mb-1 sm:mb-2 lg:mb-3 text-gray-800 line-clamp-1">
                                  {isYouTubeUrl(video) 
                                    ? `Video ${index + 1}`
                                    : video.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Video ${index + 1}`
                                  }
                                </h3>
                                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-2 sm:mb-3 lg:mb-4 leading-relaxed line-clamp-2">
                                  Product demonstration and usage guide
                                </p>
                                {isYouTubeUrl(video) && (
                                  <a 
                                    href={video} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 sm:gap-2 lg:gap-3 bg-red-600 text-white text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 rounded-md font-medium w-full sm:w-auto justify-center"
                                  >
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                    <span className="hidden sm:inline">Watch on YouTube</span>
                                    <span className="sm:hidden">YouTube</span>
                                  </a>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos available</h3>
                          <p className="text-gray-500">Videos for this product will be available soon.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="qa" className="mt-8">
                  <div className="space-y-6">
                    {/* Q&A Filters */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <Select value={qaFilter} onValueChange={setQAFilter}>
                              <SelectTrigger>
                                <SelectValue placeholder="Filter by category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Questions</SelectItem>
                                <SelectItem value="Usage & Features">Usage & Features</SelectItem>
                                <SelectItem value="Installation & Setup">Installation & Setup</SelectItem>
                                <SelectItem value="Warranty & Support">Warranty & Support</SelectItem>
                                <SelectItem value="Quality & Certification">Quality & Certification</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Button
                              onClick={() => setShowQuestionForm(!showQuestionForm)}
                              variant="outline"
                              className="w-full"
                            >
                              Ask a Question
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Ask a Question Form */}
                    {showQuestionForm && (
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Ask a Question</h3>
                          <div className="space-y-4">
                            <Select
                              value={newQuestion.category}
                              onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Usage & Features">Usage & Features</SelectItem>
                                <SelectItem value="Installation & Setup">Installation & Setup</SelectItem>
                                <SelectItem value="Warranty & Support">Warranty & Support</SelectItem>
                                <SelectItem value="Quality & Certification">Quality & Certification</SelectItem>
                              </SelectContent>
                            </Select>
                            <Textarea
                              placeholder="Type your question here..."
                              value={newQuestion.question}
                              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                              rows={3}
                            />
                            <Input
                              placeholder="Tags (comma separated)"
                              value={newQuestion.tags}
                              onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                            />
                            <Button onClick={handleSubmitQuestion} className="bg-[#12d6fa] hover:bg-[#0fb8d9]">
                              Submit Question
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Q&A List */}
                    <div className="space-y-4">
                      {filteredQA().map((qa) => (
                        <Card key={qa.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarFallback>Q</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {qa.category}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">{qa.date}</span>
                                </div>
                                <h4 className="font-medium mb-3">{qa.question}</h4>
                                {qa.answer ? (
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarFallback className="text-xs">A</AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm font-medium">{qa.answeredBy}</span>
                                    </div>
                                    <p className="text-gray-700">{qa.answer}</p>
                                  </div>
                                ) : (
                                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <p className="text-yellow-800">This question is awaiting an answer from our experts.</p>
                                  </div>
                                )}
                                <div className="flex items-center justify-between mt-4">
                                  <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-[#12d6fa]">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>Helpful ({qa.helpful})</span>
                                  </button>
                                  {qa.tags && qa.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {qa.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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

                {loadingRelated ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="h-full">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : relatedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((relatedProduct) => (
                      <Link key={relatedProduct._id} href={`/shop/flavor/bundles/${relatedProduct.slug}`} className="block group">
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full">
                          <CardContent className="p-0">
                            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg overflow-hidden">
                              <img
                                src={relatedProduct.image || (() => {
                                  const img = relatedProduct.images?.[0]
                                  return typeof img === 'string' ? img : img?.url || "/placeholder.svg"
                                })()}
                                alt={relatedProduct.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-[#12d6fa] transition-colors">
                                {relatedProduct.name}
                              </h3>
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-3 h-3 ${
                                        star <= (relatedProduct.averageRating || relatedProduct.rating || 0)
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  ({relatedProduct.totalReviews || relatedProduct.reviews || 0})
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-[#12d6fa]">
                                  <SaudiRiyal amount={relatedProduct.salePrice || relatedProduct.price} size="sm" />
                                </span>
                                {(relatedProduct?.originalPrice || relatedProduct?.salePrice) && (relatedProduct?.originalPrice || relatedProduct?.salePrice)! > (relatedProduct?.salePrice || relatedProduct?.price)! && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    <SaudiRiyal amount={relatedProduct?.originalPrice || relatedProduct?.salePrice} size="sm" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No related products found</h3>
                    <p className="text-gray-500">Check out our other flavor bundles</p>
                    <Button className="mt-4 bg-[#12d6fa] hover:bg-[#0fbfe0] text-white">
                      <Link href="/shop/flavor/bundles">Browse All Bundles</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Modals and Dialogs */}

          {/* Media Gallery Modal */}
          <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 w-[95vw] sm:w-full">
              <div className="relative">
                {isShowingVideo ? (
                  <div className="w-full h-[60vh] sm:h-[80vh]">
                    {combinedMedia[selectedImage] && combinedMedia[selectedImage].src && isYouTubeUrl(combinedMedia[selectedImage].src) ? (
                      <YouTubeVideo
                        videoUrl={combinedMedia[selectedImage].src}
                        title={`${product?.name || 'Product'} - Product Video`}
                        className="w-full h-full"
                        showThumbnail={false}
                        autoplay={true}
                      />
                    ) : (
                      <video
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        poster="/placeholder.svg"
                      >
                        <source src={combinedMedia[selectedImage]?.src || ''} type="video/mp4" />
                        <source src={combinedMedia[selectedImage]?.src || ''} type="video/webm" />
                        <source src={combinedMedia[selectedImage]?.src || ''} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ) : (
                  <img
                    src={(() => {
                      // First try to get URL from combinedMedia
                      const mediaUrl = combinedMedia[selectedImage]?.src;
                      if (mediaUrl && mediaUrl.trim() !== '') return mediaUrl;
                      
                      // Fallback to product images array
                      const img = product?.images?.[selectedImage];
                      const imgUrl = typeof img === 'string' ? img : img?.url;
                      if (imgUrl && imgUrl.trim() !== '') return imgUrl;
                      
                      // Final fallback to default image
                      return "/images/04 - Kits/Starter-Kit---Example---Do-Not-Use.png";
                    })()}
                    alt={product?.name || 'Product'}
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
                          <img
                            src={media.src || "/placeholder.svg"}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={media.src || "/placeholder.svg"}
                          alt={`${product?.name || 'Product'} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Notify Me Modal */}
          <Dialog open={showNotifyMe} onOpenChange={setShowNotifyMe}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Notify Me When Available</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we'll notify you as soon as this product is back in stock.
                </p>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNotifyMe(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (notifyEmail) {
                        alert("We'll notify you when this product is available!")
                        setShowNotifyMe(false)
                        setNotifyEmail("")
                      }
                    }}
                    className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                  >
                    Notify Me
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </PageLayout>
  )
}
    
   