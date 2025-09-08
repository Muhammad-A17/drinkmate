"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Zap,
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
  Download,
  MessageCircle,
  Award,
  Clock,
  Phone,
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
  Volume2,
  VolumeX,
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
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/translation-context"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

interface CO2Cylinder {
  _id: string
  slug: string
  name: string
  brand: string
  type: string
  price: number
  originalPrice: number
  discount: number
  capacity: number
  material: string
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
  videos: string[]
  documents: { name: string; url: string; type: string }[]
  certifications: string[]
  warranty: string
  dimensions: { width: number; height: number; depth: number; weight: number }
  compatibility: string[]
  safetyFeatures: string[]
  createdAt: string
  updatedAt: string
  averageRating: number
  totalReviews: number
  categoryId: string
  tags: string[]
  seoTitle?: string
  seoDescription?: string
}

const mockCylinders: CO2Cylinder[] = [
  {
    _id: "1",
    slug: "premium-co2-cylinder",
    name: "Premium CO2 Cylinder Pro Max",
    brand: "DrinkMate",
    type: "new",
    price: 199.99,
    originalPrice: 249.99,
    discount: 20,
    capacity: 80,
    material: "steel",
    stock: 25,
    minStock: 5,
    status: "active",
    isBestSeller: true,
    isFeatured: true,
    isNew: true,
    isEcoFriendly: true,
    description:
      "Experience the ultimate in carbonation technology with our Premium CO2 Cylinder Pro Max. Engineered with aerospace-grade materials and featuring our patented SafeFlow™ technology, this cylinder delivers consistent, high-quality carbonation for up to 80 liters of your favorite beverages. The advanced pressure regulation system ensures optimal performance while maintaining the highest safety standards.",
    features: [
      "Extended 80L capacity with precision engineering",
      "Aerospace-grade steel construction with anti-corrosion coating",
      "SafeFlow™ advanced safety valve system with pressure monitoring",
      "Universal compatibility with all DrinkMate and major brand machines",
      "Quick-connect refillable and exchangeable system",
      "Halal and Kosher certified food-grade CO2",
      "Ergonomic lightweight design with premium grip",
      "Extended performance guarantee up to 5 years",
      "Smart pressure indicator with color-coded status",
      "Eco-friendly recyclable materials",
    ],
    specifications: {
      Capacity: "80 Liters",
      Material: "Aerospace-grade Steel",
      "Pressure Rating": "850 PSI",
      "Thread Type": 'Standard 3/8" UNF',
      "Valve Type": "SafeFlow™ Advanced",
      Certification: "DOT-3AL, CE, ISO 9001",
      "Temperature Range": "-10°C to +60°C",
      "Service Life": "15 Years",
      "Refill Cycles": "Unlimited",
      "Safety Features": "Burst Disc, Pressure Relief",
    },
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
    ],
    videos: [
      "/placeholder.mp4?query=co2+cylinder+installation+tutorial",
      "/placeholder.mp4?query=co2+cylinder+safety+demonstration",
    ],
    documents: [
      { name: "Installation Guide", url: "/docs/installation-guide.pdf", type: "PDF" },
      { name: "Safety Manual", url: "/docs/safety-manual.pdf", type: "PDF" },
      { name: "Warranty Information", url: "/docs/warranty.pdf", type: "PDF" },
      { name: "Compatibility Chart", url: "/docs/compatibility.pdf", type: "PDF" },
    ],
    certifications: ["DOT-3AL", "CE Mark", "ISO 9001", "Halal Certified", "Kosher Certified"],
    warranty: "5 Years Limited Warranty",
    dimensions: { width: 8.5, height: 42, depth: 8.5, weight: 1.2 },
    compatibility: ["DrinkMate", "SodaStream", "Aarke", "Philips", "KitchenAid"],
    safetyFeatures: ["Burst Disc Protection", "Pressure Relief Valve", "Anti-Tamper Design", "Leak Detection"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    averageRating: 4.8,
    totalReviews: 1247,
    categoryId: "co2-cylinders",
    tags: ["premium", "professional", "eco-friendly", "bestseller"],
    seoTitle: "Premium CO2 Cylinder Pro Max - Professional Grade Carbonation",
    seoDescription:
      "Experience professional-grade carbonation with our Premium CO2 Cylinder Pro Max. 80L capacity, aerospace-grade steel, 5-year warranty.",
  },
]

const relatedProducts = [
  {
    id: "2",
    slug: "standard-co2-cylinder",
    name: "Standard CO2 Cylinder",
    price: 89.99,
    originalPrice: 119.99,
    image: "/placeholder.svg",
    rating: 4.6,
    reviews: 892,
    badge: "Popular Choice",
  },
  {
    id: "3",
    slug: "compact-co2-cylinder",
    name: "Compact CO2 Cylinder",
    price: 149.99,
    originalPrice: 179.99,
    image: "/placeholder.svg",
    rating: 4.4,
    reviews: 456,
    badge: "Space Saver",
  },
  {
    id: "4",
    slug: "drinkmate-carbonator",
    name: "DrinkMate Carbonator Pro",
    price: 299.99,
    originalPrice: 399.99,
    image: "/placeholder.svg",
    rating: 4.8,
    reviews: 1203,
    badge: "Best Seller",
  },
  {
    id: "5",
    slug: "co2-refill-service",
    name: "CO2 Refill Service Plan",
    price: 45.99,
    originalPrice: 59.99,
    image: "/placeholder.svg",
    rating: 4.7,
    reviews: 2341,
    badge: "Subscription",
  },
]

const frequentlyBoughtTogether = [
  {
    id: "2",
    slug: "standard-co2-cylinder",
    name: "Standard CO2 Cylinder",
    price: 89.99,
    originalPrice: 119.99,
    image: "/placeholder.svg",
    savings: 15.0,
  },
  {
    id: "6",
    slug: "co2-refill-service",
    name: "CO2 Refill Service Plan",
    price: 45.99,
    originalPrice: 59.99,
    image: "/placeholder.svg",
    savings: 10.0,
  },
]

const productReviews = [
  {
    id: 1,
    user: "Ahmed Al-Rashid",
    avatar: "/male-user-avatar.png",
    rating: 5,
    date: "2024-01-15",
    verified: true,
    comment:
      "Absolutely outstanding CO2 cylinder! The 80L capacity has been a game-changer for our family. We've been using it for 3 months now and the quality is exceptional. The SafeFlow™ technology really makes a difference - no more inconsistent carbonation. The installation was straightforward and the customer service was top-notch. Highly recommend for anyone serious about their carbonated drinks!",
    helpful: 24,
    images: ["/placeholder.svg", "/placeholder.svg"],
    pros: ["Long-lasting", "Easy installation", "Consistent pressure", "Great value"],
    cons: ["Slightly heavier than expected"],
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
      "Perfect for our busy household! We go through a lot of sparkling water and this cylinder keeps up with our demand. The refill service is incredibly convenient - they even send reminders when it's time for a refill. The eco-friendly aspect was important to us, and DrinkMate delivers on their sustainability promises. Worth every riyal!",
    helpful: 18,
    images: [],
    pros: ["Eco-friendly", "Convenient refill service", "High capacity", "Reliable performance"],
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
      "Solid quality cylinder with reliable performance. Been using it for 6 months without any issues. The pressure indicator is a nice touch - helps me know when it's time for a refill. Only reason for 4 stars instead of 5 is that I wish there was an even larger capacity option for commercial use. But for home use, this is perfect.",
    helpful: 12,
    images: ["/placeholder.svg"],
    pros: ["Reliable", "Good build quality", "Pressure indicator", "Easy to use"],
    cons: ["Could use larger capacity option"],
    wouldRecommend: true,
    purchaseVerified: true,
  },
]

const productQA = [
  {
    id: 1,
    category: "Usage & Capacity",
    question: "How long does the CO2 cylinder last with regular use?",
    answer:
      "The cylinder capacity varies by model and usage. Our Premium cylinder (80L) typically lasts 4-6 weeks for an average family of 4 making 2-3 liters of sparkling water daily. Heavy users might see 3-4 weeks, while light users can get 8-10 weeks. The smart pressure indicator helps you monitor remaining capacity.",
    helpful: 15,
    date: "2024-01-12",
    answeredBy: "DrinkMate Expert Team",
    tags: ["capacity", "duration", "usage"],
  },
  {
    id: 2,
    category: "Installation & Safety",
    question: "Can I refill the cylinder myself or do I need professional service?",
    answer:
      "For safety and quality assurance, we strongly recommend using our authorized refill centers or exchange program. Our technicians ensure proper pressure levels, purity standards, and safety checks. DIY refilling can be dangerous and may void your warranty. We offer convenient pickup/delivery service in most areas.",
    helpful: 12,
    date: "2024-01-08",
    answeredBy: "Safety Specialist",
    tags: ["safety", "refill", "service"],
  },
  {
    id: 3,
    category: "Warranty & Support",
    question: "What's covered under the warranty and how do I claim it?",
    answer:
      "Our 5-year limited warranty covers manufacturing defects, valve malfunctions, and structural integrity. It doesn't cover normal wear, misuse, or accidental damage. To claim warranty, contact our support team with your purchase receipt and cylinder serial number. We offer free replacement or repair within warranty period.",
    helpful: 8,
    date: "2023-12-15",
    answeredBy: "Customer Support",
    tags: ["warranty", "support", "claims"],
  },
  {
    id: 4,
    category: "Certification & Quality",
    question: "Are the cylinders halal certified and what quality standards do you follow?",
    answer:
      "Yes, all our CO2 cylinders use halal-certified food-grade CO2 gas that meets Islamic dietary requirements. We also have Kosher certification. Our facilities are ISO 9001 certified, and all cylinders meet DOT-3AL and CE safety standards. We conduct regular quality audits and purity testing.",
    helpful: 20,
    date: "2024-01-05",
    answeredBy: "Quality Assurance Team",
    tags: ["halal", "kosher", "certification", "quality"],
  },
]

export default function CO2ProductDetail() {
  const params = useParams()
  const { t } = useTranslation()

  const productSlug = params?.slug as string
  const [product, setProduct] = useState<CO2Cylinder | null>(null)
  const [loading, setLoading] = useState(true)

  // Enhanced state management with more features
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isInCart, setIsInCart] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [activeTab, setActiveTab] = useState("description")
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showNotifyMe, setShowNotifyMe] = useState(false)
  const [expandedQA, setExpandedQA] = useState<number[]>([])
  const [showSizeGuide, setShowSizeGuide] = useState(false)
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

  const [showImageGallery, setShowImageGallery] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState("")
  const [showComparison, setShowComparison] = useState(false)
  const [showInstallationGuide, setShowInstallationGuide] = useState(false)
  const [reviewFilter, setReviewFilter] = useState("all")
  const [reviewSort, setReviewSort] = useState("newest")
  const [qaFilter, setQAFilter] = useState("all")
  const [showPriceHistory, setShowPriceHistory] = useState(false)
  const [showStockAlert, setShowStockAlert] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [cartAnimation, setCartAnimation] = useState(false)
  const [wishlistAnimation, setWishlistAnimation] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const [selectedFrequentItems, setSelectedFrequentItems] = useState<string[]>([])

  const toggleQA = useCallback((id: number) => {
    setExpandedQA((prev) => {
      if (prev.includes(id)) {
        return prev.filter((qaId) => qaId !== id)
      } else {
        return [...prev, id]
      }
    })
  }, [])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)

        // Simulate API delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 500))

        // First try to get from localStorage (admin panel data)
        const savedCylinders = localStorage.getItem("co2-cylinders")
        if (savedCylinders) {
          const cylinders = JSON.parse(savedCylinders)
          const foundProduct = cylinders.find((p: CO2Cylinder) => p.slug === productSlug)
          if (foundProduct) {
            // Enhance with mock data structure
            const enhancedProduct = {
              ...mockCylinders[0],
              ...foundProduct,
              images: foundProduct.images && foundProduct.images.length > 0 ? foundProduct.images : (foundProduct.image ? [foundProduct.image] : mockCylinders[0].images),
              specifications: foundProduct.specifications || mockCylinders[0].specifications,
              videos: foundProduct.videos || mockCylinders[0].videos,
              documents: foundProduct.documents || mockCylinders[0].documents,
              certifications: foundProduct.certifications || mockCylinders[0].certifications,
              dimensions: foundProduct.dimensions || mockCylinders[0].dimensions,
              compatibility: foundProduct.compatibility || mockCylinders[0].compatibility,
              safetyFeatures: foundProduct.safetyFeatures || mockCylinders[0].safetyFeatures,
              averageRating: foundProduct.averageRating || 4.8,
              totalReviews: foundProduct.totalReviews || 1247,
            }
            setProduct(enhancedProduct)
            setLoading(false)
            return
          }
        }

        // Fallback to enhanced mock data
        const mockProduct = mockCylinders.find((p) => p.slug === productSlug) || mockCylinders[0]
        setProduct(mockProduct)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching product:", error)
        const mockProduct = mockCylinders.find((p) => p.slug === productSlug) || mockCylinders[0]
        setProduct(mockProduct)
        setLoading(false)
      }
    }

    if (productSlug) {
      fetchProduct()
    }
  }, [productSlug])

  const handleAddToCart = useCallback(() => {
    if (!product) return

    setCartAnimation(true)
    setIsInCart(true)

    // Simulate cart API call
    setTimeout(() => {
      setCartAnimation(false)
      // Show success notification
      console.log(`Added ${quantity} ${product.name} to cart`)
    }, 1000)
  }, [product, quantity])

  const handleAddToWishlist = useCallback(() => {
    if (!product) return

    setWishlistAnimation(true)
    setIsInWishlist(!isInWishlist)

    setTimeout(() => {
      setWishlistAnimation(false)
      console.log(`${isInWishlist ? "Removed from" : "Added to"} wishlist: ${product.name}`)
    }, 500)
  }, [product, isInWishlist])

  const handleQuantityChange = useCallback(
    (change: number) => {
      const newQuantity = Math.max(1, Math.min(product?.stock || 1, quantity + change))
      setQuantity(newQuantity)
    },
    [quantity, product?.stock],
  )

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImage(index)
  }, [])

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

  const getStockMessage = useCallback(() => {
    if (!product) return "In stock"
    if (product.stock === 0) return "Out of stock"
    if (product.stock <= 5) return `Only ${product.stock} left in stock!`
    if (product.stock <= 10) return `${product.stock} in stock`
    return "In stock"
  }, [product])

  const getStockColor = useCallback(() => {
    if (!product) return "text-green-600"
    if (product.stock === 0) return "text-red-600"
    if (product.stock <= 5) return "text-orange-600"
    return "text-green-600"
  }, [product])

  const getDeliveryDate = useCallback(() => {
    const today = new Date()
    const deliveryDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
    return deliveryDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  }, [])

  const getServiceTypeText = useCallback((type: string) => {
    switch (type) {
      case "new":
        return "New Cylinder"
      case "refill":
        return "Refill Service"
      case "subscription":
        return "Subscription Service"
      default:
        return "CO2 Service"
    }
  }, [])

  const getCapacityText = useCallback((capacity: number) => {
    return `${capacity}L capacity`
  }, [])

  const calculateSavings = useCallback(() => {
    if (!product) return 0
    return product.originalPrice - product.price
  }, [product])

  const getEstimatedUsage = useCallback(() => {
    if (!product) return ""
    const weeksLow = Math.floor(product.capacity / 20)
    const weeksHigh = Math.floor(product.capacity / 10)
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
              <Link href="/co2" className="inline-flex items-center text-[#12d6fa] hover:text-[#0fb8d9] font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to CO2 Cylinders
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <TooltipProvider>
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Back Button with breadcrumb */}
          <div className="mb-6 space-y-4">
            <Link
              href="/co2"
              className="inline-flex items-center text-[#12d6fa] hover:text-[#0fb8d9] transition-all duration-200 hover:translate-x-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to CO2 Cylinders
            </Link>

            {/* Enhanced Breadcrumb */}
            <nav className="text-sm text-muted-foreground flex items-center space-x-2">
              <Link href="/" className="hover:text-[#12d6fa] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/co2" className="hover:text-[#12d6fa] transition-colors">
                CO2 Cylinders
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

              {/* Video Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 group"
                    onClick={() => setShowVideoPlayer(true)}
                  >
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Watch Product Video</p>
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
                    onClick={() => setShowComparison(true)}
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
                    onClick={() => setShowQuickView(true)}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Enhanced Product Images */}
                <div className="space-y-4">
                  <div
                    className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden cursor-zoom-in group shadow-lg"
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleImageZoom}
                    onClick={() => setShowImageGallery(true)}
                  >
                    <img
                      src={product.images?.[selectedImage] || "/placeholder.svg"}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        isZoomed ? "scale-150" : "scale-100 group-hover:scale-105"
                      }`}
                      style={
                        isZoomed
                          ? {
                              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            }
                          : {}
                      }
                    />

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
                    {product.images && product.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageSelect(selectedImage > 0 ? selectedImage - 1 : product.images!.length - 1)
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageSelect(selectedImage < product.images!.length - 1 ? selectedImage + 1 : 0)
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Enhanced Image Thumbnails */}
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {product.images?.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageSelect(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          selectedImage === index
                            ? "border-[#12d6fa] shadow-lg scale-105"
                            : "border-gray-200 hover:border-gray-300 hover:scale-102"
                        }`}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}

                    {/* Video Thumbnail */}
                    {product.videos && product.videos.length > 0 && (
                      <button
                        onClick={() => setShowVideoPlayer(true)}
                        className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#12d6fa] transition-all duration-200 bg-black/10 flex items-center justify-center group"
                      >
                        <Play className="w-6 h-6 text-[#12d6fa] group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Enhanced Product Info */}
                <div className="space-y-6">
                  {/* Product Header */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-[#12d6fa] border-[#12d6fa]">
                        {product.brand}
                      </Badge>
                      {product.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="capitalize">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <h1 className="text-3xl font-bold mb-3 text-balance">{product.name}</h1>

                    {/* Enhanced Rating */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(product.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{product.averageRating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({product.totalReviews.toLocaleString()} reviews)
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{Math.floor(product.totalReviews * 1.2).toLocaleString()} sold</span>
                      </div>
                    </div>

                    {/* Enhanced Pricing */}
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="text-4xl font-bold text-[#12d6fa]">
                        <SaudiRiyal amount={product.price} size="lg" />
                      </span>
                      {product.originalPrice > product.price && (
                        <>
                          <span className="text-xl text-muted-foreground line-through">
                            <SaudiRiyal amount={product.originalPrice} size="md" />
                          </span>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Save <SaudiRiyal amount={calculateSavings()} size="sm" />
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Enhanced Stock and Badges */}
                    <div className="flex items-center space-x-2 mb-6 flex-wrap gap-2">
                      <Badge variant={product.stock > 0 ? "default" : "destructive"} className={getStockColor()}>
                        <Package className="w-3 h-3 mr-1" />
                        {getStockMessage()}
                      </Badge>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        <Truck className="w-3 h-3 mr-1" />
                        Free Shipping
                      </Badge>
                      {product.isFeatured && (
                        <Badge variant="outline" className="border-amber-200 text-amber-700">
                          <Award className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {getEstimatedUsage()} usage
                      </Badge>
                    </div>
                  </div>

                  {/* Enhanced Service Type */}
                  <Card className="border-l-4 border-l-[#12d6fa]">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Settings className="w-4 h-4 mr-2 text-[#12d6fa]" />
                        Service Type: {getServiceTypeText(product.type)}
                      </h3>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {product.type === "new" && "Brand new CO2 cylinder with full warranty and premium packaging"}
                          {product.type === "refill" &&
                            "Professional refill service with quality guarantee and pickup/delivery"}
                          {product.type === "subscription" &&
                            "Convenient monthly subscription with automatic delivery and priority support"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Capacity Info */}
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Gauge className="w-4 h-4 mr-2 text-green-500" />
                        Capacity: {getCapacityText(product.capacity)}
                      </h3>
                      <div className="bg-green-50 p-3 rounded-lg space-y-2">
                        <p className="text-sm text-green-800">
                          This cylinder can carbonate approximately {product.capacity} liters of water, lasting{" "}
                          {Math.round(product.capacity / 15)}-{Math.round(product.capacity / 10)} weeks for an average
                          family.
                        </p>
                        <div className="flex items-center justify-between text-xs text-green-700">
                          <span>Light Use: {Math.round(product.capacity / 10)} weeks</span>
                          <span>Heavy Use: {Math.round(product.capacity / 20)} weeks</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Quantity and Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border-2 border-gray-200 rounded-lg hover:border-[#12d6fa] transition-colors">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-6 py-3 font-semibold text-lg min-w-[60px] text-center">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={quantity >= (product.stock || 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <div>
                          Total:{" "}
                          <span className="font-semibold text-lg text-[#12d6fa]">
                            <SaudiRiyal amount={product.price * quantity} size="md" />
                          </span>
                        </div>
                        {quantity > 1 && (
                          <div className="text-xs">
                            <SaudiRiyal amount={product.price} size="sm" /> each
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="flex space-x-3">
                      {product.stock > 0 ? (
                        <Button
                          onClick={handleAddToCart}
                          className={`flex-1 bg-[#12d6fa] hover:bg-[#0fb8d9] text-white shadow-lg hover:shadow-xl transition-all duration-200 ${
                            cartAnimation ? "animate-pulse" : ""
                          }`}
                          disabled={isInCart}
                          size="lg"
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          {isInCart ? "Added to Cart" : "Add to Cart"}
                        </Button>
                      ) : (
                        <Dialog open={showNotifyMe} onOpenChange={setShowNotifyMe}>
                          <DialogTrigger asChild>
                            <Button
                              className="flex-1 bg-[#12d6fa] hover:bg-[#0fb8d9] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                              size="lg"
                            >
                              <Bell className="w-5 h-5 mr-2" />
                              Notify When Available
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
                                Enter your email to be notified when this product is back in stock.
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
                                  alert("You will be notified when this product is back in stock!")
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
                        <Heart className={`w-5 h-5 ${isInWishlist ? "fill-current" : ""}`} />
                      </Button>

                      <div className="relative">
                        <Button
                          variant="outline"
                          onClick={() => setShowShareMenu(!showShareMenu)}
                          className="border-2 hover:border-[#12d6fa] hover:text-[#12d6fa] transition-all duration-200"
                          size="lg"
                        >
                          <Share2 className="w-5 h-5" />
                        </Button>

                        {showShareMenu && (
                          <div className="absolute right-0 top-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl p-3 z-10 min-w-[200px]">
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700 mb-2">Share this product</div>
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

                    {/* Buy Now Button */}
                    {product.stock > 0 && (
                      <Button
                        variant="outline"
                        className="w-full border-2 border-[#12d6fa] text-[#12d6fa] hover:bg-[#12d6fa] hover:text-white transition-all duration-200 bg-transparent"
                        size="lg"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        Buy Now - Express Checkout
                      </Button>
                    )}
                  </div>

                  {/* Enhanced Delivery Info */}
                  <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Truck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Free Express Delivery</div>
                          <div className="text-sm text-muted-foreground">
                            Order by 2 PM for delivery by {getDeliveryDate()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{product.warranty}</div>
                          <div className="text-sm text-muted-foreground">
                            Full manufacturer warranty with premium support
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-full">
                          <RotateCcw className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-semibold">30 Days Easy Returns</div>
                          <div className="text-sm text-muted-foreground">
                            Hassle-free returns and exchanges with free pickup
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Phone className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold">24/7 Premium Support</div>
                          <div className="text-sm text-muted-foreground">
                            Dedicated customer service and technical support
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center space-x-6 py-4 border-t border-b">
                    {product.certifications?.slice(0, 3).map((cert) => (
                      <div key={cert} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Product Details Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
                <TabsList className="grid w-full grid-cols-5 h-12">
                  <TabsTrigger
                    value="description"
                    className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Description
                  </TabsTrigger>
                  <TabsTrigger
                    value="specifications"
                    className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Reviews ({reviews.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="videos"
                    className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Videos ({product.videos?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="qa"
                    className="data-[state=active]:bg-[#12d6fa] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Q&A ({qaData.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-8">
                  <div className="prose max-w-none">
                    <div className="bg-gradient-to-r from-[#12d6fa]/10 to-blue-50 p-6 rounded-xl mb-6">
                      <p className="text-lg leading-relaxed text-gray-700">{product.description}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                          <Zap className="w-5 h-5 mr-2 text-[#12d6fa]" />
                          Key Features
                        </h3>
                        <ul className="space-y-3">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-[#12d6fa] mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-green-500" />
                          Safety Features
                        </h3>
                        <ul className="space-y-3">
                          {product.safetyFeatures?.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                              <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <h3 className="text-xl font-semibold mb-4 mt-6 flex items-center">
                          <Award className="w-5 h-5 mr-2 text-amber-500" />
                          Certifications
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.certifications?.map((cert) => (
                            <Badge key={cert} variant="outline" className="border-amber-200 text-amber-700">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Product Images Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <img
                        src="/placeholder.svg"
                        alt="How to install CO2 cylinder"
                        className="rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setShowInstallationGuide(true)}
                      />
                      <img
                        src="/co2-cylinder-maintenance-tips.jpg"
                        alt="CO2 cylinder maintenance"
                        className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      />
                      <img
                        src="/co2-cylinder-storage-safety.jpg"
                        alt="CO2 cylinder storage"
                        className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      />
                    </div>

                    {/* Documents Section */}
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Download className="w-5 h-5 mr-2 text-blue-500" />
                        Documentation
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.documents?.map((doc) => (
                          <Card key={doc.name} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4 flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded">
                                <Download className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{doc.name}</div>
                                <div className="text-sm text-muted-foreground">{doc.type}</div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="mt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Settings className="w-5 h-5 mr-2 text-[#12d6fa]" />
                          Technical Specifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {Object.entries(product.specifications || {}).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <span className="font-medium text-gray-600">{key}</span>
                            <span className="text-gray-900">{value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Package className="w-5 h-5 mr-2 text-green-500" />
                          Physical Dimensions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Width</span>
                          <span className="text-gray-900">
                            {product.dimensions?.width}" ({(product.dimensions?.width * 2.54).toFixed(1)} cm)
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Height</span>
                          <span className="text-gray-900">
                            {product.dimensions?.height}" ({(product.dimensions?.height * 2.54).toFixed(1)} cm)
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Depth</span>
                          <span className="text-gray-900">
                            {product.dimensions?.depth}" ({(product.dimensions?.depth * 2.54).toFixed(1)} cm)
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-medium text-gray-600">Weight</span>
                          <span className="text-gray-900">
                            {product.dimensions?.weight} kg ({(product.dimensions?.weight * 2.2).toFixed(1)} lbs)
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
                          Compatibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {product.compatibility?.map((brand) => (
                            <div key={brand} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">{brand}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Recycle className="w-5 h-5 mr-2 text-green-500" />
                          Environmental Impact
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2 text-green-700">
                          <Leaf className="w-4 h-4" />
                          <span className="text-sm">100% Recyclable Materials</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-700">
                          <Recycle className="w-4 h-4" />
                          <span className="text-sm">Carbon Neutral Production</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-700">
                          <Leaf className="w-4 h-4" />
                          <span className="text-sm">Eco-Friendly Packaging</span>
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-[#12d6fa] mb-2">{product.averageRating}</div>
                            <div className="flex items-center justify-center mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-6 h-6 ${
                                    i < Math.floor(product.averageRating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Based on {product.totalReviews.toLocaleString()} reviews
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
                                placeholder="Share your experience with this product..."
                                className="min-h-[120px]"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Pros (comma separated)</label>
                                <Input
                                  value={newReview.pros}
                                  onChange={(e) => setNewReview({ ...newReview, pros: e.target.value })}
                                  placeholder="Great quality, Easy to use, Good value"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Cons (comma separated)</label>
                                <Input
                                  value={newReview.cons}
                                  onChange={(e) => setNewReview({ ...newReview, cons: e.target.value })}
                                  placeholder="Heavy, Expensive"
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={newReview.wouldRecommend}
                                onCheckedChange={(checked) => setNewReview({ ...newReview, wouldRecommend: checked })}
                              />
                              <label className="text-sm font-medium">I would recommend this product</label>
                            </div>

                            <Button
                              onClick={handleSubmitReview}
                              className="w-full bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                              size="lg"
                            >
                              Submit Review
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Enhanced Reviews List */}
                    <div className="space-y-6">
                      {filteredReviews().map((review) => (
                        <Card key={review.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={review.avatar || "/placeholder.svg"} />
                                <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                              </Avatar>

                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-semibold">{review.user}</span>
                                      {review.verified && (
                                        <Badge variant="outline" className="text-green-600 border-green-200">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Verified
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2 mt-1">
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
                                  </div>
                                </div>

                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>

                                {/* Pros and Cons */}
                                {(review.pros?.length > 0 || review.cons?.length > 0) && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {review.pros?.length > 0 && (
                                      <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="font-medium text-green-800 mb-2 flex items-center">
                                          <ThumbsUp className="w-4 h-4 mr-1" />
                                          Pros
                                        </div>
                                        <ul className="space-y-1">
                                          {review.pros.map((pro, index) => (
                                            <li key={index} className="text-sm text-green-700 flex items-center">
                                              <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                                              {pro}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {review.cons?.length > 0 && (
                                      <div className="bg-red-50 p-3 rounded-lg">
                                        <div className="font-medium text-red-800 mb-2 flex items-center">
                                          <X className="w-4 h-4 mr-1" />
                                          Cons
                                        </div>
                                        <ul className="space-y-1">
                                          {review.cons.map((con, index) => (
                                            <li key={index} className="text-sm text-red-700 flex items-center">
                                              <X className="w-3 h-3 mr-2 flex-shrink-0" />
                                              {con}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {review.images && review.images.length > 0 && (
                                  <div className="flex space-x-2 mt-4">
                                    {review.images.map((image, index) => (
                                      <img
                                        key={index}
                                        src={image || "/placeholder.svg"}
                                        alt="Review"
                                        className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => setShowImageGallery(true)}
                                      />
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t">
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <button
                                      onClick={() => {
                                        const updatedReviews = reviews.map((r) =>
                                          r.id === review.id ? { ...r, helpful: r.helpful + 1 } : r,
                                        )
                                        setReviews(updatedReviews)
                                      }}
                                      className="flex items-center space-x-1 hover:text-foreground transition-colors"
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                      <span>Helpful ({review.helpful})</span>
                                    </button>

                                    {review.wouldRecommend && (
                                      <div className="flex items-center space-x-1 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Recommends this product</span>
                                      </div>
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
                    {product.videos && product.videos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {product.videos.map((video, index) => (
                          <Card key={index} className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="aspect-video bg-gray-100 relative">
                                <video
                                  controls
                                  className="w-full h-full object-cover"
                                  poster="/placeholder.svg"
                                >
                                  <source src={video} type="video/mp4" />
                                  <source src={video} type="video/webm" />
                                  <source src={video} type="video/ogg" />
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold text-lg mb-2">
                                  {video.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Video ${index + 1}`}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Product demonstration and usage guide
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Videos Available</h3>
                          <p className="text-gray-600">
                            Product videos will be added soon. Check back later for demonstrations and usage guides.
                          </p>
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
                              <SelectItem value="Usage & Capacity">Usage & Capacity</SelectItem>
                              <SelectItem value="Installation & Safety">Installation & Safety</SelectItem>
                              <SelectItem value="Warranty & Support">Warranty & Support</SelectItem>
                              <SelectItem value="Certification & Quality">Certification & Quality</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            className="ml-auto border-[#12d6fa] text-[#12d6fa] hover:bg-[#12d6fa] hover:text-white bg-transparent"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Ask a Question
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <Link key={relatedProduct.id} href={`/co2/${relatedProduct.slug}`} className="block group">
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
                                )}
                                % OFF
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
              </div>
            </div>
          </div>

          {/* Enhanced Modals and Dialogs */}

          {/* Image Gallery Modal */}
          <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <div className="relative">
                <img
                  src={product.images?.[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                  onClick={() => setShowImageGallery(false)}
                >
                  <X className="w-4 h-4" />
                </Button>

                {product.images && product.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={() =>
                        handleImageSelect(selectedImage > 0 ? selectedImage - 1 : product.images!.length - 1)
                      }
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={() =>
                        handleImageSelect(selectedImage < product.images!.length - 1 ? selectedImage + 1 : 0)
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>

              <div className="p-4 border-t">
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images?.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                        selectedImage === index ? "border-[#12d6fa]" : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Video Player Modal */}
          <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
            <DialogContent className="max-w-4xl p-0">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  className="w-full h-auto"
                  controls
                  muted={isVideoMuted}
                  autoPlay
                  poster="/co2-cylinder-video-thumbnail.jpg"
                >
                  <source src="/placeholder.mp4?query=co2+cylinder+demo" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white border-white/20"
                  onClick={() => setShowVideoPlayer(false)}
                >
                  <X className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 text-white border-white/20"
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                >
                  {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageLayout>
    </TooltipProvider>
  )
}
