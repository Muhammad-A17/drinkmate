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
import styles from "./styles.module.css"

interface SodamakerProduct {
  _id: string
  id?: string // For compatibility with mock data
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
  averageRating: number
  totalReviews: number
  reviewCount?: number // For compatibility with mock data
  categoryId: string
  tags: string[]
  seoTitle?: string
  seoDescription?: string
  rating?: number // For compatibility with mock data
  reviews?: number // For compatibility with mock data
  badge?: string // For compatibility with mock data
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
      "Absolutely outstanding soda maker! The 1L capacity has been a game-changer for our family. We've been using it for 3 months now and the quality is exceptional. The carbonation technology really makes a difference - no more inconsistent sparkling water. The installation was straightforward and the customer service was top-notch. Highly recommend for anyone serious about their soda making!",
    helpful: 24,
    images: ["/placeholder.svg", "/placeholder.svg"],
    pros: ["Long-lasting", "Easy installation", "Consistent carbonation", "Great value"],
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
      "Perfect for our busy household! We go through a lot of sparkling water and this soda maker keeps up with our demand. The CO2 cylinder refill service is incredibly convenient - they even send reminders when it's time for a refill. The eco-friendly aspect was important to us, and DrinkMate delivers on their sustainability promises. Worth every riyal!",
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
      "Solid quality soda maker with reliable performance. Been using it for 6 months without any issues. The pressure indicator is a nice touch - helps me know when it's time for a CO2 refill. Only reason for 4 stars instead of 5 is that I wish there was an even larger capacity option for commercial use. But for home use, this is perfect.",
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
      "The cylinder capacity varies by model and usage. Our Premium cylinder (1L) typically lasts 4-6 weeks for an average family of 4 making 2-3 liters of sparkling water daily. Heavy users might see 3-4 weeks, while light users can get 8-10 weeks. The smart pressure indicator helps you monitor remaining capacity.",
    helpful: 15,
    date: "2024-01-12",
    answeredBy: "DrinkMate Expert Team",
    tags: ["capacity", "duration", "usage"],
  },
  {
    id: 2,
    category: "Installation & Safety",
    question: "Can I refill the CO2 cylinder myself or do I need professional service?",
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
    question: "Are the soda makers halal certified and what quality standards do you follow?",
    answer:
      "Yes, all our soda makers use halal-certified food-grade CO2 gas that meets Islamic dietary requirements. We also have Kosher certification. Our facilities are ISO 9001 certified, and all cylinders meet DOT-3AL and CE safety standards. We conduct regular quality audits and purity testing.",
    helpful: 20,
    date: "2024-01-05",
    answeredBy: "Quality Assurance Team",
    tags: ["halal", "kosher", "certification", "quality"],
  },
]

export default function SodamakerProductDetail() {
  const params = useParams()
  const { t } = useTranslation()
  const { addItem } = useCart()
  const router = useRouter()

  const productSlug = params?.slug as string
  const [product, setProduct] = useState<SodamakerProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<SodamakerProduct[]>([])
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
    category: "Usage & Capacity",
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
      
      // Get all sodamakers
      const response = await shopAPI.getProducts();
      
      if (response.success && response.products) {
        // Filter out the current product and get up to 4 other products
        const otherProducts = response.products
          .filter((product: SodamakerProduct) => product._id !== currentProductId)
          .slice(0, 4);
          
        // Process images to ensure they have absolute URLs
        const processedProducts = otherProducts.map((product: SodamakerProduct) => {
          // Handle case where image might be undefined or null
          const safeImage = product.image || '';
          const safeImages = product.images || [];
          
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
        console.log('🔍 Fetching product with slug:', productSlug);
        
        // Mock data for testing when backend is not available
        const mockProducts: Record<string, any> = {
          'drinkmate-soda-maker-machine': {
            _id: 'mock-soda-maker-1',
            name: 'DrinkMate Soda Maker Machine',
            slug: 'drinkmate-soda-maker-machine',
            shortDescription: 'Professional soda maker with advanced carbonation technology',
            fullDescription: 'The DrinkMate Soda Maker Machine is a professional-grade appliance designed for creating restaurant-quality sodas at home. Featuring advanced carbonation technology, this machine delivers consistent results every time.',
            price: 299.99,
            originalPrice: 399.99,
            sku: 'DM-SM-001',
            category: 'sodamakers',
            image: '/images/products/soda-maker-1.jpg',
            images: [
              { url: '/images/products/soda-maker-1.jpg', alt: 'DrinkMate Soda Maker Machine - Front View', isPrimary: true },
              { url: '/images/products/soda-maker-2.jpg', alt: 'DrinkMate Soda Maker Machine - Side View', isPrimary: false }
            ],
            stock: 50,
            isActive: true,
            isFeatured: true,
            isBestSeller: true,
            averageRating: 4.8,
            reviewCount: 127,
            totalReviews: 127,
            features: [
              'Advanced Carbonation Technology - State-of-the-art carbonation system for perfect bubbles every time',
              'Stainless Steel Construction - Premium materials ensure durability and longevity',
              'Easy-to-Use Interface - Intuitive controls make soda making simple and enjoyable',
              'Energy Efficient - Low power consumption for eco-friendly operation',
              'Quiet Operation - Minimal noise for comfortable home use',
              'Professional Results - Restaurant-quality sodas every time'
            ],
            specifications: {
              'Power': '120W',
              'Capacity': '1.5L',
              'Material': 'Stainless Steel',
              'Weight': '3.2kg',
              'Dimensions': '25cm x 20cm x 35cm',
              'Warranty': '2 years',
              'Pressure Rating': '60 PSI',
              'Thread Type': 'Standard 3/8" UNF',
              'Valve Type': 'Precision Flow Control',
              'Certification': 'FDA, CE, ISO 9001',
              'Temperature Range': '4°C to +40°C',
              'Service Life': '10 Years',
              'CO2 Purity': '99.9% Food Grade',
              'Safety Features': 'Pressure Relief Valve'
            },
            colors: [
              { name: 'Silver', hexCode: '#C0C0C0', inStock: true },
              { name: 'Black', hexCode: '#000000', inStock: true }
            ],
            tags: ['soda-maker', 'professional', 'stainless-steel', 'carbonation']
          },
          'drinkmate-premium-flavor-pack': {
            _id: 'mock-flavor-pack-1',
            name: 'DrinkMate Premium Flavor Pack',
            slug: 'drinkmate-premium-flavor-pack',
            shortDescription: 'Premium Italian flavor syrups collection',
            fullDescription: 'The DrinkMate Premium Flavor Pack features six carefully selected Italian flavor syrups, each crafted with authentic ingredients and traditional recipes.',
            price: 49.99,
            originalPrice: 69.99,
            sku: 'DM-FP-001',
            category: 'sodamakers',
            image: '/images/products/flavor-pack-1.jpg',
            images: [
              { url: '/images/products/flavor-pack-1.jpg', alt: 'DrinkMate Premium Flavor Pack - Collection View', isPrimary: true },
              { url: '/images/products/flavor-pack-2.jpg', alt: 'DrinkMate Premium Flavor Pack - Individual Bottles', isPrimary: false }
            ],
            stock: 100,
            isActive: true,
            isFeatured: false,
            isBestSeller: true,
            averageRating: 4.6,
            reviewCount: 89,
            totalReviews: 89,
            features: [
              '6 Premium Italian Flavors - Carefully selected authentic Italian flavor syrups',
              'Natural Ingredients - Made with real fruit extracts and natural flavors',
              'No Artificial Preservatives - Pure ingredients for authentic taste',
              'Long Shelf Life - 24-month shelf life for extended use',
              'Easy to Use - Simple mixing instructions for perfect results',
              'Professional Quality - Restaurant-grade syrups for home use'
            ],
            specifications: {
              'Flavors': '6 varieties',
              'Volume': '750ml each',
              'Ingredients': 'Natural',
              'Shelf Life': '24 months',
              'Storage': 'Room temperature',
              'Origin': 'Italy',
              'Certification': 'FDA Approved',
              'Allergens': 'None',
              'Sugar Content': 'Natural sugars only',
              'Preservatives': 'None',
              'Color': 'Natural colors',
              'Packaging': 'Glass bottles'
            },
            colors: [
              { name: 'Mixed', hexCode: '#FF6B6B', inStock: true }
            ],
            tags: ['flavors', 'italian', 'premium', 'natural']
          }
        };

        // Check if we have mock data for this slug
        if (mockProducts[productSlug as keyof typeof mockProducts]) {
          console.log('📦 Using mock data for:', productSlug);
          const productData = mockProducts[productSlug as keyof typeof mockProducts];
          console.log('📋 Mock product data:', productData);
          
          // Process the mock product data
          const processedProduct = {
            ...productData,
            // Ensure image URLs are absolute
            image: productData.image?.startsWith('http') ? productData.image : 
                   productData.image?.startsWith('/') ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}${productData.image}` : 
                   '/placeholder.svg',
            // Ensure image URLs in arrays are absolute
            images: (productData.images || []).map((img: any) => 
              img?.url?.startsWith('http') ? img.url : 
              img?.url?.startsWith('/') ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}${img.url}` : 
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
          return;
        }
        
        // Try to get product details using shopAPI
        const response = await shopAPI.getProductFlexible(productSlug);
        console.log('📦 API Response:', response);
        
        // Handle both response formats: { success: true, product: data } and direct data
        const productData = response.success ? response.product : response;
        console.log('📋 Processed product data:', productData);
        
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
          fetchRelatedProducts(productData._id);
        } else {
          // Set empty product if API fails
          console.log('❌ No product data found in response');
          setProduct(null)
          
          // No related products to fetch when product is null
        }
        setLoading(false)
      } catch (error) {
        // Error fetching product - show error state
        console.error('💥 Error fetching product:', error);
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
      category: 'sodamakers'
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

  // Create combined media array (images + videos)
  const combinedMedia = useMemo(() => {
    const media: Array<{ type: 'image' | 'video', src: string, index: number }> = []
    
    // Add images
    if (product?.images) {
      product.images.forEach((image, index) => {
        media.push({ type: 'image', src: image, index })
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
      category: "Usage & Capacity",
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
      case "new":
        return "New Soda Maker"
      case "refill":
        return "Refill Service"
      case "subscription":
        return "Subscription Service"
      default:
        return "Soda Maker Service"
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
              <Link href="/shop/sodamakers" className="inline-flex items-center text-[#12d6fa] hover:text-[#0fb8d9] font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Soda Makers
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
                        src={product.images?.[selectedImage] || "/placeholder.svg"}
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
                            {isYouTubeUrl(media.src) ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_YOUTUBE_THUMBNAIL_BASE || 'https://img.youtube.com/vi'}/${getYouTubeVideoId(media.src)}/mqdefault.jpg`}
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

                {/* Enhanced Product Info */}
                <div className="space-y-6">
                  {/* Product Header */}
                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="text-[#12d6fa] border-[#12d6fa] text-xs sm:text-sm">
                        {product.brand}
                      </Badge>
                      {product.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="capitalize text-xs sm:text-sm">
                          {tag}
                        </Badge>
                      ))}
                      {product.tags && product.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          +{product.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 text-balance leading-tight">{product.name}</h1>

                    {/* Enhanced Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                i < Math.floor(product.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-sm sm:text-base">{product.averageRating}</span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          ({(product.totalReviews || product.reviewCount || 0).toLocaleString()} reviews)
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4 hidden sm:block" />
                      <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{Math.floor((product.totalReviews || product.reviewCount || 0) * 1.2).toLocaleString()} sold</span>
                      </div>
                    </div>

                    {/* Enhanced Pricing */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#12d6fa]">
                        <SaudiRiyal amount={product.price} size="lg" />
                      </span>
                      {product.originalPrice > product.price && (
                        <div className="flex items-center gap-2 sm:gap-4">
                          <span className="text-lg sm:text-xl text-muted-foreground line-through">
                            <SaudiRiyal amount={product.originalPrice} size="md" />
                          </span>
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm">
                            Save <SaudiRiyal amount={calculateSavings()} size="sm" />
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Stock and Badges */}
                    <div className="flex items-center flex-wrap gap-2 mb-6">
                      <Badge variant={product.stock > 0 ? "default" : "destructive"} className={`${getStockColor()} text-xs sm:text-sm`}>
                        <Package className="w-3 h-3 mr-1" />
                        {stockMessage}
                      </Badge>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">
                        <Truck className="w-3 h-3 mr-1" />
                        Free Shipping
                      </Badge>
                      {product.isFeatured && (
                        <Badge variant="outline" className="border-amber-200 text-amber-700 text-xs sm:text-sm">
                          <Award className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs sm:text-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        {getEstimatedUsage()} usage
                      </Badge>
                    </div>
                  </div>

                  {/* Enhanced Service Type */}
                  <Card className="border-l-4 border-l-[#12d6fa]">
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-semibold mb-2 flex items-center text-sm sm:text-base">
                        <Settings className="w-4 h-4 mr-2 text-[#12d6fa] flex-shrink-0" />
                        <span className="truncate">Service Type: {getServiceTypeText(product.type)}</span>
                      </h3>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                          {product.type === "new" && "Brand new soda maker with full warranty and premium packaging"}
                          {product.type === "refill" &&
                            "Professional CO2 refill service with quality guarantee and pickup/delivery"}
                          {product.type === "subscription" &&
                            "Convenient monthly subscription with automatic delivery and priority support"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Capacity Info */}
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-semibold mb-2 flex items-center text-sm sm:text-base">
                        <Gauge className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                        <span className="truncate">Capacity: {getCapacityText(product.capacity)}</span>
                      </h3>
                      <div className="bg-green-50 p-3 rounded-lg space-y-2">
                        <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
                          This soda maker can carbonate approximately {product.capacity} liters of water, lasting{" "}
                          {Math.round(product.capacity / 15)}-{Math.round(product.capacity / 10)} weeks for an average
                          family.
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs text-green-700">
                          <span>Light Use: {Math.round(product.capacity / 10)} weeks</span>
                          <span>Heavy Use: {Math.round(product.capacity / 20)} weeks</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

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
                          disabled={quantity >= (product.stock || 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <div>
                          Total:{" "}
                          <span className="font-semibold text-base sm:text-lg text-[#12d6fa]">
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
                    <div className="flex flex-col sm:flex-row gap-3">
                      {product.stock > 0 ? (
                        <Button
                          onClick={isInCart ? () => router.push('/cart') : handleAddToCart}
                          className={`flex-1 bg-[#12d6fa] hover:bg-[#0fb8d9] text-white shadow-lg hover:shadow-xl transition-all duration-200 ${
                            cartAnimation ? "animate-pulse" : ""
                          }`}
                          size="lg"
                        >
                          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="text-sm sm:text-base">{isInCart ? "Go to Cart" : "Add to Cart"}</span>
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
                              <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Share this product</div>
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
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span className="hidden sm:inline">Videos ({product.videos?.length || 0})</span>
                    <span className="sm:hidden">Videos</span>
                    <span className="sm:hidden text-xs ml-1">({product.videos?.length || 0})</span>
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
                        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#12d6fa] flex-shrink-0" />
                          Key Features
                        </h3>
                        <ul className="space-y-3">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#12d6fa] mt-0.5 flex-shrink-0" />
                              <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 flex-shrink-0" />
                          Safety Features
                        </h3>
                        <ul className="space-y-3">
                          {product.safetyFeatures?.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <h3 className="text-lg sm:text-xl font-semibold mb-4 mt-6 flex items-center">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-500 flex-shrink-0" />
                          Certifications
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.certifications?.map((cert) => (
                            <Badge key={cert} variant="outline" className="border-amber-200 text-amber-700 text-xs sm:text-sm">
                              {cert}
                            </Badge>
                          ))}
                        </div>
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
                        {(() => {
                          const specs = product.specifications || {};
                          const specEntries = Object.entries(specs);
                          
                          if (specEntries.length === 0) {
                            // Show default specifications if none are provided
                            const defaultSpecs = {
                              'Capacity': product.capacity ? `${product.capacity}L` : '1L',
                              'Material': product.material || 'Food-grade Stainless Steel',
                              'Pressure Rating': '60 PSI',
                              'Thread Type': 'Standard 3/8" UNF',
                              'Valve Type': 'Precision Flow Control',
                              'Certification': 'FDA, CE, ISO 9001',
                              'Temperature Range': '4°C to +40°C',
                              'Service Life': '10 Years',
                              'CO2 Purity': '99.9% Food Grade',
                              'Safety Features': 'Pressure Relief Valve'
                            };
                            
                            return Object.entries(defaultSpecs).map(([key, value]) => (
                              <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <span className="font-medium text-gray-600">{key}</span>
                                <span className="text-gray-900">{value}</span>
                              </div>
                            ));
                          }
                          
                          return specEntries.map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                              <span className="font-medium text-gray-600">{key}</span>
                              <span className="text-gray-900">{value}</span>
                            </div>
                          ));
                        })()}
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
                            {product.dimensions?.width ? `${product.dimensions.width}" (${(product.dimensions.width * 2.54).toFixed(1)} cm)` : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Height</span>
                          <span className="text-gray-900">
                            {product.dimensions?.height ? `${product.dimensions.height}" (${(product.dimensions.height * 2.54).toFixed(1)} cm)` : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Depth</span>
                          <span className="text-gray-900">
                            {product.dimensions?.depth ? `${product.dimensions.depth}" (${(product.dimensions.depth * 2.54).toFixed(1)} cm)` : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-medium text-gray-600">Weight</span>
                          <span className="text-gray-900">
                            {product.dimensions?.weight ? `${product.dimensions.weight} kg (${(product.dimensions.weight * 2.2).toFixed(1)} lbs)` : 'Not specified'}
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
                              Based on {(product.totalReviews || product.reviewCount || 0).toLocaleString()} reviews
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {product.videos.map((video, index) => {
                          // Find the index in combinedMedia for this video
                          const combinedIndex = combinedMedia.findIndex(media => 
                            media.type === 'video' && media.src === video
                          )
                          return (
                          <Card key={index} className="overflow-hidden cursor-pointer h-80 sm:h-96 lg:h-[28rem] xl:h-[32rem] border-0 shadow-lg">
                            <CardContent className="p-0 h-full flex flex-col" onClick={() => {
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
                                </div>
                              ) : (
                                <div className="flex-1 aspect-video bg-gray-100 relative group">
                                  <video
                                    className="w-full h-full object-cover"
                                    poster="/placeholder.svg"
                                  >
                                    <source src={video} type="video/mp4" />
                                    <source src={video} type="video/webm" />
                                    <source src={video} type="video/ogg" />
                                    Your browser does not support the video tag.
                                  </video>
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                      <Play className="w-6 h-6 text-gray-800 ml-1" />
                                    </div>
                                  </div>
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
                          )
                        })}
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
                                placeholder="What would you like to know about this product?"
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
                                    <SelectItem value="Usage & Capacity">Usage & Capacity</SelectItem>
                                    <SelectItem value="Installation & Safety">Installation & Safety</SelectItem>
                                    <SelectItem value="Warranty & Support">Warranty & Support</SelectItem>
                                    <SelectItem value="Certification & Quality">Certification & Quality</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                                <Input
                                  value={newQuestion.tags}
                                  onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                                  placeholder="capacity, installation, safety"
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
                    <Link key={relatedProduct.id} href={`/shop/sodamakers/${relatedProduct.slug}`} className="block group">
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No related products found</h3>
                    <p className="text-gray-500">Check out our other products in the shop</p>
                    <Button className="mt-4 bg-[#12d6fa] hover:bg-[#0fbfe0] text-white">
                      <Link href="/shop/sodamakers">Browse All Soda Makers</Link>
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
                        title={`${product.name} - Product Video`}
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
