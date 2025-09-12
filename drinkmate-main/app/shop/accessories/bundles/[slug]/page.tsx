"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { YouTubeVideo, isYouTubeUrl, getYouTubeVideoId } from "@/components/ui/youtube-video"
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/translation-context"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { shopAPI } from "@/lib/api"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

interface Bundle {
  _id: string
  id?: string // For compatibility with mock data
  slug: string
  name: string
  brand: string
  type: string
  price: number
  originalPrice: number
  discount: number
  category: string
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
  items: Array<{
    product: string
    name: string
    price: number
    image?: string
  }>
  createdAt: string
  updatedAt: string
  averageRating: number
  totalReviews: number
  categoryId: string
  tags: string[]
  seoTitle?: string
  seoDescription?: string
  rating?: number // For compatibility with mock data
  reviews?: number // For compatibility with mock data
  badge?: string // For compatibility with mock data
  sku: string
}

const productReviews = [
  {
    id: 1,
    user: "Ahmed Al-Rashid",
    avatar: "/male-user-avatar.png",
    rating: 5,
    date: "2024-01-15",
    verified: true,
    comment:
      "Absolutely outstanding accessories bundle! This complete setup has been a game-changer for our soda making. We've been using it for 3 months now and the quality is exceptional. All the accessories work perfectly together and the convenience of having everything in one bundle is unbeatable. The customer service was top-notch. Highly recommend for anyone serious about their carbonated drinks!",
    helpful: 24,
    images: ["/placeholder.svg", "/placeholder.svg"],
    pros: ["Complete setup", "High quality accessories", "Convenient packaging", "Great value"],
    cons: ["Slightly bulkier packaging"],
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
      "Perfect for our busy household! We needed all the essential accessories and this bundle had everything we required. The quality of each item is excellent and they all work seamlessly together. The eco-friendly aspect was important to us, and DrinkMate delivers on their sustainability promises. Worth every riyal!",
    helpful: 18,
    images: [],
    pros: ["Eco-friendly", "Complete accessories set", "High quality", "Reliable performance"],
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
      "Solid quality bundle with reliable accessories. Been using it for 6 months without any issues. All the components work well together and the build quality is excellent. Only reason for 4 stars instead of 5 is that I wish there were more customization options for specific needs. But for general home use, this is perfect.",
    helpful: 12,
    images: ["/placeholder.svg"],
    pros: ["Reliable", "Good build quality", "Complete set", "Easy to use"],
    cons: ["Limited customization options"],
    wouldRecommend: true,
    purchaseVerified: true,
  },
]

const productQA = [
  {
    id: 1,
    category: "Usage & Compatibility",
    question: "What accessories are included in this bundle?",
    answer:
      "This bundle includes all essential accessories for your soda making setup: premium bottles, carbonation caps, cleaning brushes, measuring tools, and storage containers. Each item is designed for durability and optimal performance with our soda makers.",
    helpful: 15,
    date: "2024-01-12",
    answeredBy: "DrinkMate Expert Team",
    tags: ["accessories", "contents", "compatibility"],
  },
  {
    id: 2,
    category: "Maintenance & Care",
    question: "How do I clean and maintain these accessories?",
    answer:
      "Most accessories can be cleaned with warm soapy water and rinsed thoroughly. For carbonation caps and bottles, we recommend using our cleaning tablets regularly. Store accessories in a cool, dry place away from direct sunlight. Detailed care instructions are included with each item.",
    helpful: 12,
    date: "2024-01-08",
    answeredBy: "Product Specialist",
    tags: ["maintenance", "cleaning", "care"],
  },
  {
    id: 3,
    category: "Warranty & Support",
    question: "What's covered under the warranty for bundle items?",
    answer:
      "Each accessory in the bundle comes with a 1-year limited warranty covering manufacturing defects. The warranty doesn't cover normal wear, misuse, or accidental damage. Contact our support team with your purchase receipt for warranty claims. We offer replacement or repair within the warranty period.",
    helpful: 8,
    date: "2023-12-15",
    answeredBy: "Customer Support",
    tags: ["warranty", "support", "claims"],
  },
  {
    id: 4,
    category: "Compatibility & Setup",
    question: "Are these accessories compatible with all DrinkMate soda makers?",
    answer:
      "Yes, all accessories in this bundle are designed to be fully compatible with our entire range of DrinkMate soda makers. The universal threading and standardized measurements ensure perfect fit and optimal performance across all models.",
    helpful: 20,
    date: "2024-01-05",
    answeredBy: "Technical Support",
    tags: ["compatibility", "models", "universal"],
  },
]

export default function AccessoriesBundleDetail() {
  const params = useParams()
  const { t } = useTranslation()
  const { addItem } = useCart()
  const router = useRouter()

  const productSlug = params?.slug as string
  const [product, setProduct] = useState<Bundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Bundle[]>([])
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
  const [reviews, setReviews] = useState(productReviews)
  const [qaData, setQAData] = useState(productQA)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "Usage & Compatibility",
    tags: ""
  })

  const [showImageGallery, setShowImageGallery] = useState(false)
  const [reviewFilter, setReviewFilter] = useState("all")
  const [reviewSort, setReviewSort] = useState("newest")
  const [qaFilter, setQAFilter] = useState("all")
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [cartAnimation, setCartAnimation] = useState(false)
  const [wishlistAnimation, setWishlistAnimation] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false)

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

      // Get all bundles
      const response = await shopAPI.getBundles()

      if (response.success && response.bundles) {
        // Filter out the current product and get up to 4 other products
        const otherProducts = response.bundles
          .filter((product: Bundle) => product._id !== currentProductId)
          .slice(0, 4)

        // Process images to ensure they have absolute URLs
        const processedProducts = otherProducts.map((product: Bundle) => {
          // Handle case where image might be undefined or null
          const safeImage = product.image || ''
          const safeImages = product.images || []

          return {
            ...product,
            // Ensure image URL is absolute
            image: safeImage.startsWith('http') ? safeImage :
                   safeImage.startsWith('/') ? `${window.location.origin}${safeImage}` :
                   '/placeholder.svg',
            // Ensure image URLs in arrays are absolute
            images: safeImages.map((img: string) =>
              img?.startsWith('http') ? img :
              img?.startsWith('/') ? `${window.location.origin}${img}` :
              '/placeholder.svg'
            )
          }
        })

        setRelatedProducts(processedProducts)
      } else {
        // No related products found
        setRelatedProducts([])
      }
    } catch (error) {
      // Error fetching related products - continue without them
      // Set empty array on error
      setRelatedProducts([])
    } finally {
      setLoadingRelated(false)
    }
  }, [])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        console.log('🔍 Fetching bundle with slug:', productSlug)

        // Mock data for testing when backend is not available
        const mockBundles: Record<string, any> = {
          'premium-accessories-bundle': {
            _id: 'mock-bundle-1',
            name: 'Premium Accessories Bundle',
            slug: 'premium-accessories-bundle',
            shortDescription: 'Complete set of premium accessories for your soda maker',
            fullDescription: 'The Premium Accessories Bundle includes everything you need for the perfect soda making experience. From carbonation bottles to cleaning tools, this comprehensive set ensures you have all the essential accessories.',
            price: 149.99,
            originalPrice: 199.99,
            sku: 'DM-AB-001',
            category: 'accessories',
            image: '/images/products/accessories-bundle-1.jpg',
            images: [
              { url: '/images/products/accessories-bundle-1.jpg', alt: 'Premium Accessories Bundle - Complete Set', isPrimary: true },
              { url: '/images/products/accessories-bundle-2.jpg', alt: 'Premium Accessories Bundle - Individual Items', isPrimary: false }
            ],
            stock: 50,
            isActive: true,
            isFeatured: true,
            isBestSeller: true,
            averageRating: 4.8,
            reviewCount: 127,
            totalReviews: 127,
            features: [
              'Complete Accessory Set - Everything you need for soda making',
              'Premium Quality Materials - Durable and long-lasting components',
              'Universal Compatibility - Works with all DrinkMate soda makers',
              'Easy Storage Solutions - Organized packaging and storage containers',
              'Cleaning Tools Included - Keep your equipment in perfect condition',
              'Professional Results - Restaurant-quality soda making at home'
            ],
            specifications: {
              'Items Included': '8 premium accessories',
              'Material': 'BPA-free plastic, stainless steel',
              'Compatibility': 'All DrinkMate models',
              'Warranty': '1 year on all items',
              'Weight': '2.5kg total',
              'Dimensions': '30cm x 25cm x 15cm',
              'Care Instructions': 'Dishwasher safe (most items)',
              'Storage': 'Compact and organized',
              'Certifications': 'Food-grade materials',
              'Origin': 'Made in Saudi Arabia',
              'Service Life': '5+ years with proper care'
            },
            items: [
              { product: 'carbonation-bottle-1', name: 'Premium Carbonation Bottle (500ml)', price: 25.00, image: '/images/products/bottle-1.jpg' },
              { product: 'carbonation-bottle-2', name: 'Premium Carbonation Bottle (1L)', price: 30.00, image: '/images/products/bottle-2.jpg' },
              { product: 'carbonation-cap', name: 'Universal Carbonation Cap', price: 15.00, image: '/images/products/cap-1.jpg' },
              { product: 'cleaning-brush', name: 'Professional Cleaning Brush Set', price: 12.00, image: '/images/products/brush-1.jpg' },
              { product: 'measuring-tool', name: 'Precision Measuring Tools', price: 8.00, image: '/images/products/measure-1.jpg' },
              { product: 'storage-container', name: 'Accessory Storage Container', price: 18.00, image: '/images/products/storage-1.jpg' },
              { product: 'flavor-dispenser', name: 'Flavor Concentrate Dispenser', price: 22.00, image: '/images/products/dispenser-1.jpg' },
              { product: 'maintenance-kit', name: 'Maintenance and Care Kit', price: 20.00, image: '/images/products/maintenance-1.jpg' }
            ],
            colors: [
              { name: 'Mixed Set', hexCode: '#FF6B6B', inStock: true }
            ],
            tags: ['accessories', 'bundle', 'premium', 'complete-set']
          }
        }

        // Check if we have mock data for this slug
        if (mockBundles[productSlug as keyof typeof mockBundles]) {
          console.log('📦 Using mock data for:', productSlug)
          const productData = mockBundles[productSlug as keyof typeof mockBundles]
          console.log('📋 Mock bundle data:', productData)

          // Process the mock product data
          const processedProduct = {
            ...productData,
            // Ensure image URLs are absolute
            image: productData.image?.startsWith('http') ? productData.image :
                   productData.image?.startsWith('/') ? `${window.location.origin}${productData.image}` :
                   '/placeholder.svg',
            // Ensure image URLs in arrays are absolute
            images: (productData.images || []).map((img: any) =>
              img?.url?.startsWith('http') ? img.url :
              img?.url?.startsWith('/') ? `${window.location.origin}${img.url}` :
              '/placeholder.svg'
            ),
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
          setLoading(false)
          return
        }

        // Try to get bundle details using shopAPI
        const response = await shopAPI.getBundle(productSlug)
        console.log('📦 API Response:', response)

        // Handle both response formats: { success: true, bundle: data } and direct data
        const productData = response.success ? response.bundle : response
        console.log('📋 Processed bundle data:', productData)

        if (productData && (productData._id || productData.id)) {

          // Ensure image URLs are absolute
          const processedProduct = {
            ...productData,
            // Ensure image URL is absolute
            image: productData.image?.startsWith('http') ? productData.image :
                   productData.image?.startsWith('/') ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}${productData.image}` :
                   '/placeholder.svg',
            // Ensure image URLs in arrays are absolute
            images: (productData.images || []).map((img: string) =>
              img?.startsWith('http') ? img :
              img?.startsWith('/') ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}${img}` :
              '/placeholder.svg'
            ),
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
          fetchRelatedProducts(productData._id)
        } else {
          // Set empty product if API fails
          console.log('❌ No bundle data found in response')
          setProduct(null)

          // No related products to fetch when product is null
        }
        setLoading(false)
      } catch (error) {
        // Error fetching product - show error state
        console.error('💥 Error fetching bundle:', error)
        setProduct(null)
        setLoading(false)

        // No related products to fetch when product is null
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
      price: product.price,
      image: product.image || product.images?.[0] || '/placeholder.svg',
      quantity: quantity,
      category: 'accessories'
    })

    // Show success feedback
    setTimeout(() => {
      setCartAnimation(false)
      // You could add a toast notification here
      console.log(`Added ${quantity} x ${product.name} to cart`)
    }, 1000)
  }, [product, quantity, addItem, productSlug])

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

  // Create combined media array (images + videos)
  const combinedMedia = useMemo(() => {
    const media: Array<{ type: 'image' | 'video', src: string, index: number, title?: string }> = []

    // Add images first
    if (product?.images && product.images.length > 0) {
      product.images.forEach((image, index) => {
        if (image && image.trim()) {
          media.push({ 
            type: 'image', 
            src: image, 
            index,
            title: `${product.name} - Image ${index + 1}`
          })
        }
      })
    }

    // Add videos after images
    if (product?.videos && product.videos.length > 0) {
      product.videos.forEach((video, index) => {
        if (video && video.trim()) {
          media.push({ 
            type: 'video', 
            src: video, 
            index: media.length,
            title: `${product.name} - Video ${index + 1}`
          })
        }
      })
    }

    return media
  }, [product?.images, product?.videos, product?.name])

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImage(index)
    const media = combinedMedia[index]
    setIsShowingVideo(media?.type === 'video')
    // Clear any previous errors and loading states when switching media
    setVideoError(null)
    setImageError(null)
    setIsLoadingVideo(false)
    setIsLoadingImage(false)
  }, [combinedMedia])

  const handleImageZoom = useCallback((e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }, [])

  const handleShare = useCallback(
    (platform: string) => {
      if (!product) return
      const url = typeof window !== "undefined" ? window.location.href : ""
      const text = `Check out this amazing ${product.name} - ${product.description ? product.description.substring(0, 100) : 'No description available'}...`

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
      user: newReview.name,
      avatar: "/diverse-user-avatars.png",
      rating: newReview.rating,
      date: new Date().toISOString().split("T")[0],
      verified: false,
      comment: newReview.comment,
      helpful: 0,
      images: [],
      pros: newReview.pros
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      cons: newReview.cons
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
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
      category: "Usage & Compatibility",
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

  const getDeliveryDate = useMemo(() => {
    const today = new Date()
    const deliveryDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
    return deliveryDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  }, [])

  const getServiceTypeText = useCallback((type: string) => {
    switch (type) {
      case "bundle":
        return "Accessories Bundle"
      case "individual":
        return "Individual Accessory"
      default:
        return "Accessory Service"
    }
  }, [])

  const calculateSavings = useCallback(() => {
    if (!product) return 0
    return product.originalPrice - product.price
  }, [product])

  const getEstimatedUsage = useCallback(() => {
    if (!product) return ""
    return "Long-term use with proper care"
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
              <Link href="/shop/accessories" className="inline-flex items-center text-[#12d6fa] hover:text-[#0fb8d9] font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Accessories
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Back Button with breadcrumb */}
          <div className="mb-6 space-y-4">
            <Link
              href="/shop/accessories"
              className="inline-flex items-center text-[#12d6fa] hover:text-[#0fb8d9] transition-all duration-200 hover:translate-x-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Accessories
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
              <Link href="/shop/accessories" className="hover:text-[#12d6fa] transition-colors">
                Accessories
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
                    aria-label="View bundle in 3D"
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
                    aria-label="Compare bundles"
                  >
                    <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compare Bundles</p>
                </TooltipContent>
              </Tooltip>

              {/* Quick View Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 group"
                        onClick={() => {}}
                    aria-label="Quick view bundle details"
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
                    className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden group shadow-lg"
                  >
                    {isShowingVideo ? (
                      <div className="w-full h-full">
                        {combinedMedia[selectedImage] && isYouTubeUrl(combinedMedia[selectedImage].src) ? (
                          <YouTubeVideo
                            videoUrl={combinedMedia[selectedImage].src}
                            title={combinedMedia[selectedImage].title || `${product.name} - Bundle Video`}
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
                            preload="metadata"
                            onError={(e) => {
                              console.error('Video load error:', e)
                              setVideoError('Failed to load video')
                              setIsLoadingVideo(false)
                              // Fallback to showing image instead
                              setIsShowingVideo(false)
                            }}
                            onLoad={() => {
                              setVideoError(null)
                              setIsLoadingVideo(false)
                            }}
                          >
                            <source src={combinedMedia[selectedImage]?.src} type="video/mp4" />
                            <source src={combinedMedia[selectedImage]?.src} type="video/webm" />
                            <source src={combinedMedia[selectedImage]?.src} type="video/ogg" />
                            <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                              <div className="text-center">
                                <Play className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p>Video not available</p>
                                <p className="text-sm">Your browser does not support this video format</p>
                              </div>
                            </div>
                          </video>
                        )}
                      </div>
                    ) : (
                      <img
                        src={product.images?.[selectedImage] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          console.error('Image load error:', e)
                          e.currentTarget.src = '/placeholder.svg'
                          setImageError('Failed to load image')
                          setIsLoadingImage(false)
                        }}
                        onLoad={() => {
                          setImageError(null)
                          setIsLoadingImage(false)
                        }}
                        onLoadStart={() => setIsLoadingImage(true)}
                      />
                    )}

                    {/* Enhanced Badges */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {product.originalPrice > product.price && (
                        <Badge className="bg-red-500 text-white shadow-lg animate-pulse">{product.discount}% OFF</Badge>
                      )}
                      {product.isBestSeller && (
                        <Badge className="bg-orange-500 text-white shadow-lg">Best Seller</Badge>
                      )}
                      {product.isNew && (
                        <Badge className="bg-green-500 text-white shadow-lg">New</Badge>
                      )}
                      {product.isEcoFriendly && (
                        <Badge className="bg-blue-500 text-white shadow-lg flex items-center">
                          <Leaf className="w-3 h-3 mr-1" />
                          Eco-Friendly
                        </Badge>
                      )}
                    </div>

                    {/* Video Play Button Overlay */}
                    {combinedMedia.length > 0 && combinedMedia[selectedImage]?.type === 'video' && !isShowingVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsLoadingVideo(true)
                            setIsShowingVideo(true)
                          }}
                          className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                          aria-label={`Play ${combinedMedia[selectedImage]?.title || 'video'}`}
                          title={`Play ${combinedMedia[selectedImage]?.title || 'video'}`}
                        >
                          {isLoadingVideo ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          ) : (
                            <Play className="w-6 h-6 text-gray-900 ml-1" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Zoom Indicator */}
                    {!isShowingVideo && (
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center">
                          <Maximize2 className="w-3 h-3 mr-1" />
                          Click to zoom
                        </div>
                      </div>
                    )}
                    
                    {/* Loading indicator */}
                    {(isLoadingImage || isLoadingVideo) && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          Loading...
                        </div>
                      </div>
                    )}
                    
                    {/* Error indicator */}
                    {(imageError || videoError) && !isLoadingImage && !isLoadingVideo && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {imageError || videoError}
                        </div>
                      </div>
                    )}
                    
                    {/* Clickable overlay for zoom */}
                    <button
                      className="absolute inset-0 w-full h-full cursor-zoom-in"
                      onClick={() => setShowImageGallery(true)}
                      onMouseEnter={() => !isShowingVideo && setIsZoomed(true)}
                      onMouseLeave={() => setIsZoomed(false)}
                      onMouseMove={!isShowingVideo ? handleImageZoom : undefined}
                      aria-label="View product images and videos in full screen"
                    >
                      <span className="sr-only">Click to view full screen</span>
                    </button>
                  </div>

                  {/* Thumbnail Gallery */}
                  {combinedMedia.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2" aria-label="Product media gallery">
                      {combinedMedia.map((media, index) => (
                        <button
                          key={index}
                          onClick={() => handleImageSelect(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImage === index ? "border-[#12d6fa] shadow-lg" : "border-gray-200 hover:border-[#12d6fa]"
                          }`}
                          aria-label={`View ${media.type} ${index + 1}`}
                          title={`View ${media.type} ${index + 1}`}
                        >
                          {media.type === 'video' ? (
                            <>
                              {isYouTubeUrl(media.src) ? (
                                <img
                                  src={`https://img.youtube.com/vi/${getYouTubeVideoId(media.src)}/mqdefault.jpg`}
                                  alt={media.title || "Video thumbnail"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to placeholder if YouTube thumbnail fails
                                    e.currentTarget.src = '/placeholder.svg'
                                  }}
                                />
                              ) : (
                                <video
                                  className="w-full h-full object-cover"
                                  muted
                                  preload="metadata"
                                  onError={(e) => {
                                    // Hide video and show placeholder if it fails to load
                                    e.currentTarget.style.display = 'none'
                                  }}
                                >
                                  <source src={media.src} type="video/mp4" />
                                  <source src={media.src} type="video/webm" />
                                  <source src={media.src} type="video/ogg" />
                                </video>
                              )}
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Play className="w-3 h-3 text-white" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={media.src || "/placeholder.svg"}
                              alt={media.title || `${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg'
                              }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enhanced Product Information */}
                <div className="space-y-6">
                  {/* Product Title and Rating */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.floor(product.averageRating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium ml-2">{product.averageRating}</span>
                        <span className="text-sm text-muted-foreground">({product.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-[#12d6fa]">
                        <SaudiRiyal amount={product.price} />
                      </span>
                      {product.originalPrice > product.price && (
                        <>
                          <span className="text-xl text-muted-foreground line-through">
                            <SaudiRiyal amount={product.originalPrice} />
                          </span>
                          <Badge className="bg-red-500 text-white">
                            Save <SaudiRiyal amount={calculateSavings()} />
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stockMessage}
                    </p>
                  </div>

                  {/* Bundle Items Preview */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2 text-[#12d6fa]" />
                      What's Included ({product.items?.length || 0} items)
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {product.items?.slice(0, 4).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{item.name}</span>
                          <span className="text-muted-foreground">
                            (<SaudiRiyal amount={item.price} size="sm" />)
                          </span>
                        </div>
                      ))}
                      {product.items && product.items.length > 4 && (
                        <div className="text-sm text-muted-foreground">
                          +{product.items.length - 4} more items...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Add to Cart */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={quantity <= 1}
                          aria-label="Decrease quantity"
                          title="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-medium">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={quantity >= (product.stock || 1)}
                          aria-label="Increase quantity"
                          title="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.stock} available
                      </span>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      className={`w-full py-3 text-lg font-semibold transition-all duration-200 ${
                        cartAnimation ? "animate-pulse" : ""
                      } ${isInCart ? "bg-green-500 hover:bg-green-600" : "bg-[#12d6fa] hover:bg-[#0fb8d9]"}`}
                      size="lg"
                    >
                      {isInCart ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Add Bundle to Cart
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Delivery Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck className="w-5 h-5 text-[#12d6fa]" />
                      <span className="font-semibold">Free Delivery</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get it by {getDeliveryDate} • Free shipping on orders over 200 SAR
                    </p>
                  </div>

                  {/* Share and Wishlist */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="flex items-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </Button>

                      {showShareMenu && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                          <div className="p-2">
                            <button
                              onClick={() => handleShare("facebook")}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center space-x-2"
                            >
                              <Facebook className="w-4 h-4" />
                              <span>Facebook</span>
                            </button>
                            <button
                              onClick={() => handleShare("twitter")}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center space-x-2"
                            >
                              <Twitter className="w-4 h-4" />
                              <span>Twitter</span>
                            </button>
                            <button
                              onClick={() => handleShare("copy")}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center space-x-2"
                            >
                              <Copy className="w-4 h-4" />
                              <span>Copy Link</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleAddToWishlist}
                      className={`flex items-center space-x-2 transition-all duration-200 ${
                        wishlistAnimation ? "animate-pulse" : ""
                      } ${isInWishlist ? "border-[#12d6fa] text-[#12d6fa]" : ""}`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
                      <span>{isInWishlist ? "In Wishlist" : "Add to Wishlist"}</span>
                    </Button>
                  </div>

                  {/* Key Features */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features && product.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Enhanced Tabs Section */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="videos">Videos ({product.videos?.length || 0})</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({product.totalReviews})</TabsTrigger>
                  <TabsTrigger value="qa">Q&A</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-8">
                  <div className="space-y-6">
                    {/* Product Description */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-4">About This Bundle</h3>
                        <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

                        {/* Bundle Items Detailed List */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-[#12d6fa]" />
                            Complete Bundle Contents
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.items?.map((item, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded border">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">{item.name}</h5>
                                  <p className="text-[#12d6fa] font-semibold">
                                    <SaudiRiyal amount={item.price} size="sm" />
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Bundle Total Value:</span>
                              <span className="text-lg font-bold text-[#12d6fa]">
                                <SaudiRiyal amount={product.items?.reduce((sum, item) => sum + item.price, 0) || 0} />
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="font-semibold">You Save:</span>
                              <span className="text-lg font-bold text-green-600">
                                <SaudiRiyal amount={(product.items?.reduce((sum, item) => sum + item.price, 0) || 0) - product.price} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Features */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Features & Benefits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.features && product.features.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="mt-8">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-6">Technical Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <span className="font-medium text-gray-900">{key}</span>
                            <span className="text-gray-700">{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-8">
                  <div className="space-y-6">
                    {/* Review Summary */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-semibold">Customer Reviews</h3>
                          <Button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            variant="outline"
                            className="border-[#12d6fa] text-[#12d6fa] hover:bg-[#12d6fa] hover:text-white bg-transparent"
                          >
                            Write a Review
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-[#12d6fa] mb-2">{product.averageRating}</div>
                            <div className="flex items-center justify-center mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= Math.floor(product.averageRating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm text-muted-foreground">{product.totalReviews} reviews</div>
                          </div>

                          <div className="col-span-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = filteredReviews().filter((r) => r.rating === rating).length
                              const percentage = product.totalReviews > 0 ? (count / product.totalReviews) * 100 : 0
                              return (
                                <div key={rating} className="flex items-center space-x-2 mb-2">
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

                    {/* Review Filters */}
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

                    {/* Write Review Form */}
                    {showReviewForm && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center">
                              <Star className="w-5 h-5 mr-2 text-[#12d6fa]" />
                              Write a Review
                            </h3>

                            <div>
                              <label className="block text-sm font-medium mb-2">Your Rating *</label>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    className={`w-8 h-8 ${
                                      star <= newReview.rating ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                  >
                                    <Star className="w-full h-full fill-current" />
                                  </button>
                                ))}
                              </div>
                            </div>

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
                                <label className="block text-sm font-medium mb-2">Would you recommend this bundle?</label>
                                <div className="flex items-center space-x-4">
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name="recommend"
                                      checked={newReview.wouldRecommend}
                                      onChange={() => setNewReview({ ...newReview, wouldRecommend: true })}
                                    />
                                    <span className="text-sm">Yes</span>
                                  </label>
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name="recommend"
                                      checked={!newReview.wouldRecommend}
                                      onChange={() => setNewReview({ ...newReview, wouldRecommend: false })}
                                    />
                                    <span className="text-sm">No</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Your Review *</label>
                              <Textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                placeholder="Share your experience with this bundle..."
                                className="min-h-[120px]"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Pros (comma separated)</label>
                                <Input
                                  value={newReview.pros}
                                  onChange={(e) => setNewReview({ ...newReview, pros: e.target.value })}
                                  placeholder="Complete set, good quality, convenient"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Cons (comma separated)</label>
                                <Input
                                  value={newReview.cons}
                                  onChange={(e) => setNewReview({ ...newReview, cons: e.target.value })}
                                  placeholder="Packaging could be better"
                                />
                              </div>
                            </div>

                            <Button
                              onClick={handleSubmitReview}
                              className="w-full bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                              size="lg"
                            >
                              Submit Review
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {filteredReviews().map((review) => (
                        <Card key={review.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={review.avatar} alt={review.user} />
                                  <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold">{review.user}</span>
                                    {review.verified && (
                                      <Badge variant="outline" className="text-xs">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Verified Purchase
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`w-4 h-4 ${
                                            star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">{review.date}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                            {review.pros && review.pros.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-medium text-green-700 mb-2">What I liked:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {review.pros.map((pro, index) => (
                                    <Badge key={index} variant="outline" className="text-green-700 border-green-300">
                                      {pro}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {review.cons && review.cons.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-medium text-red-700 mb-2">What could be improved:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {review.cons.map((con, index) => (
                                    <Badge key={index} variant="outline" className="text-red-700 border-red-300">
                                      {con}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => {
                                    const updatedReviews = reviews.map((r) =>
                                      r.id === review.id ? { ...r, helpful: r.helpful + 1 } : r,
                                    )
                                    // This would normally update the backend
                                  }}
                                  className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>Helpful ({review.helpful})</span>
                                </button>

                                {review.wouldRecommend && (
                                  <div className="flex items-center space-x-1 text-sm text-green-600">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>Recommends</span>
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

                <TabsContent value="videos" className="mt-8">
                  <div className="space-y-6">
                    {/* Video Gallery */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-6 flex items-center">
                          <Play className="w-6 h-6 mr-2 text-[#12d6fa]" />
                          Product Videos
                        </h3>
                        
                        {product.videos && product.videos.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {product.videos.map((video, index) => (
                              <div key={index} className="space-y-4">
                                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                                  {isYouTubeUrl(video) ? (
                                    <YouTubeVideo
                                      videoUrl={video}
                                      title={`${product.name} - Video ${index + 1}`}
                                      className="w-full h-full"
                                      showThumbnail={true}
                                      autoplay={false}
                                      controls={true}
                                    />
                                  ) : (
                                    <video
                                      className="w-full h-full object-cover"
                                      controls
                                      poster="/placeholder.svg"
                                      preload="metadata"
                                    >
                                      <source src={video} type="video/mp4" />
                                      <source src={video} type="video/webm" />
                                      <source src={video} type="video/ogg" />
                                      Your browser does not support the video tag.
                                    </video>
                                  )}
                                  
                                  {/* Video overlay with play button */}
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <button
                                      onClick={() => {
                                        setSelectedImage(index)
                                        setIsShowingVideo(true)
                                        setShowImageGallery(true)
                                      }}
                                      className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                                      aria-label={`Play video ${index + 1}`}
                                    >
                                      <Play className="w-6 h-6 text-gray-900 ml-1" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="text-center">
                                  <h4 className="font-medium text-gray-900">
                                    {product.name} - Video {index + 1}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {isYouTubeUrl(video) ? 'YouTube Video' : 'Product Demonstration'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <Play className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">No Videos Available</h4>
                            <p className="text-gray-500">Videos for this bundle will be added soon.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Video Features */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Video Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium">Product Demonstrations</h4>
                              <p className="text-sm text-muted-foreground">See how to use each accessory in the bundle</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium">Setup Instructions</h4>
                              <p className="text-sm text-muted-foreground">Step-by-step guide for assembly and usage</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium">Maintenance Tips</h4>
                              <p className="text-sm text-muted-foreground">Learn how to care for your accessories</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium">Troubleshooting</h4>
                              <p className="text-sm text-muted-foreground">Common issues and solutions</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="qa" className="mt-8">
                  <div className="space-y-6">
                    {/* Q&A Filters */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filter by category:</span>
                          </div>
                          <Select value={qaFilter} onValueChange={setQAFilter}>
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All categories</SelectItem>
                              <SelectItem value="Usage & Compatibility">Usage & Compatibility</SelectItem>
                              <SelectItem value="Maintenance & Care">Maintenance & Care</SelectItem>
                              <SelectItem value="Warranty & Support">Warranty & Support</SelectItem>
                              <SelectItem value="Compatibility & Setup">Compatibility & Setup</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            onClick={() => setShowQuestionForm(!showQuestionForm)}
                            variant="outline"
                            className="ml-auto border-[#12d6fa] text-[#12d6fa] hover:bg-[#12d6fa] hover:text-white bg-transparent"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {showQuestionForm ? "Cancel" : "Ask a Question"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Ask a Question Form */}
                    {showQuestionForm && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center">
                              <MessageCircle className="w-5 h-5 mr-2 text-[#12d6fa]" />
                              Ask a Question
                            </h3>

                            <div>
                              <label className="block text-sm font-medium mb-2">Your Question *</label>
                              <Textarea
                                value={newQuestion.question}
                                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                placeholder="What would you like to know about this bundle?"
                                className="min-h-[120px]"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Category *</label>
                                <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Usage & Compatibility">Usage & Compatibility</SelectItem>
                                    <SelectItem value="Maintenance & Care">Maintenance & Care</SelectItem>
                                    <SelectItem value="Warranty & Support">Warranty & Support</SelectItem>
                                    <SelectItem value="Compatibility & Setup">Compatibility & Setup</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                                <Input
                                  value={newQuestion.tags}
                                  onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                                  placeholder="compatibility, setup, maintenance"
                                />
                              </div>
                            </div>

                            <Button
                              onClick={handleSubmitQuestion}
                              className="w-full bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                              size="lg"
                            >
                              Submit Question
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Q&A List */}
                    <div className="space-y-4">
                      {filteredQA().map((qa) => (
                        <Card key={qa.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <button
                              onClick={() => toggleQA(qa.id)}
                              className="flex items-center justify-between w-full text-left group"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {qa.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{qa.tags?.join(", ")}</span>
                                </div>
                                <span className="font-semibold text-lg group-hover:text-[#12d6fa] transition-colors">
                                  {qa.question}
                                </span>
                              </div>
                              <div className="ml-4">
                                {expandedQA.includes(qa.id) ? (
                                  <ChevronUp className="w-5 h-5 text-[#12d6fa]" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-[#12d6fa] transition-colors" />
                                )}
                              </div>
                            </button>

                            {expandedQA.includes(qa.id) && (
                              <div className="mt-6 pt-6 border-t space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <p className="text-gray-700 leading-relaxed">{qa.answer}</p>
                                </div>

                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>{qa.date}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Award className="w-4 h-4" />
                                      <span>{qa.answeredBy}</span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => {
                                      const updatedQA = qaData.map((q) =>
                                        q.id === qa.id ? { ...q, helpful: q.helpful + 1 } : q,
                                      )
                                      setQAData(updatedQA)
                                    }}
                                    className="flex items-center space-x-1 hover:text-foreground transition-colors"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>Helpful ({qa.helpful})</span>
                                  </button>
                                </div>
                              </div>
                            )}
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
                          <div className="aspect-square bg-gray-200 animate-pulse rounded-lg mb-4"></div>
                          <div className="h-5 bg-gray-200 animate-pulse rounded mb-2 w-3/4"></div>
                          <div className="h-4 bg-gray-200 animate-pulse rounded mb-4 w-1/2"></div>
                          <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : relatedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((relatedProduct) => (
                    <Link key={relatedProduct.id} href={`/shop/accessories/bundles/${relatedProduct.slug}`} className="block group">
                      <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full">
                        <CardContent className="p-4">
                          <div className="relative aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                            <img
                              src={relatedProduct.image || "/placeholder.svg"}
                              alt={relatedProduct.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {relatedProduct.badge && (
                              <Badge className="absolute top-2 left-2 bg-[#12d6fa] text-white">
                                {relatedProduct.badge}
                              </Badge>
                            )}
                            {relatedProduct.originalPrice > relatedProduct.price && (
                              <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                                {Math.round(
                                  ((relatedProduct.originalPrice - relatedProduct.price) /
                                    relatedProduct.originalPrice) *
                                    100,
                                )}%
                                OFF
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold mb-2 group-hover:text-[#12d6fa] transition-colors line-clamp-2">
                            {relatedProduct.name}
                          </h3>

                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-[#12d6fa]">
                                <SaudiRiyal amount={relatedProduct.price} size="sm" />
                              </span>
                              {relatedProduct.originalPrice > relatedProduct.price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  <SaudiRiyal amount={relatedProduct.originalPrice} size="sm" />
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{relatedProduct.rating}</span>
                              <span className="text-xs text-muted-foreground">({relatedProduct.reviews})</span>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              className="opacity-0 group-hover:opacity-100 transition-opacity border-[#12d6fa] text-[#12d6fa] hover:bg-[#12d6fa] hover:text-white bg-transparent"
                              onClick={(e) => {
                                e.preventDefault()
                                alert(`Added ${relatedProduct.name} to cart!`)
                              }}
                            >
                              <ShoppingCart className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No related bundles found</h3>
                    <p className="text-gray-500">Check out our other accessories in the shop</p>
                    <Button className="mt-4 bg-[#12d6fa] hover:bg-[#0fbfe0] text-white">
                      <Link href="/shop/accessories">Browse All Accessories</Link>
                    </Button>
                  </div>
                )}
                </div>
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
                    {combinedMedia[selectedImage] && isYouTubeUrl(combinedMedia[selectedImage].src) ? (
                      <YouTubeVideo
                        videoUrl={combinedMedia[selectedImage].src}
                        title={`${product.name} - Bundle Video`}
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
                        <source src={combinedMedia[selectedImage]?.src} type="video/mp4" />
                        <source src={combinedMedia[selectedImage]?.src} type="video/webm" />
                        <source src={combinedMedia[selectedImage]?.src} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ) : (
                  <img
                    src={product.images?.[selectedImage] || "/placeholder.svg"}
                    alt={product.name}
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

      
      </TooltipProvider>
    </PageLayout>
  );
}
    