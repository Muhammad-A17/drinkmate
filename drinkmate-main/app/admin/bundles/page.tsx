"use client"

import { useState, useEffect, useRef } from "react"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  DollarSign,
  Tag,
  Calendar,
  Loader2,
  Upload,
  X,
  RefreshCw,
  Search
} from "lucide-react"
import { shopAPI } from "@/lib/api"
import { toast } from "sonner"
import { adminAPI } from "@/lib/api"
import AdminActionBar, { AdminActions } from "@/components/admin/AdminActionBar"
import CloudinaryImageUpload from "@/components/ui/cloudinary-image-upload"
import { YouTubeVideo, isYouTubeUrl } from "@/components/ui/youtube-video"
import { backendImageService, uploadImageWithProgress } from "@/lib/cloud-storage"

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  image?: string
  isActive: boolean
  subcategories: Subcategory[]
}

interface Subcategory {
  _id: string
  name: string
  slug: string
  description: string
  categoryId: string
  isActive: boolean
}

interface Bundle {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  bundleDiscount: number
  category: string
  subcategory?: string
  images: string[]
  videos?: string[]
  youtubeLinks?: string[]
  badge?: {
    text: string
    color: string
  }
  sku?: string
  isActive: boolean
  isFeatured: boolean
  isNewArrival?: boolean
  isBestSeller?: boolean
  isLimited?: boolean
  stock: number
  createdAt: string
  // Specifications and features
  specifications?: string
  features?: string
  warranty?: string
  dimensions?: string
  weight?: string
  // FAQ and Q&A
  faq?: Array<{
    question: string
    answer: string
  }>
}

interface BundleFormData {
  name: string
  description: string
  price: string
  originalPrice: string
  bundleDiscount: string
  category: string
  subcategory: string
  images: string[]
  videos: string[]
  youtubeLinks: string[]
  badge: {
    text: string
    color: string
  }
  sku: string
  isActive: boolean
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  isLimited: boolean
  stock: string
  // Specifications and features
  specifications: string
  features: string
  warranty: string
  dimensions: string
  weight: string
  // FAQ and Q&A
  faq: Array<{
    question: string
    answer: string
  }>
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const [viewingBundle, setViewingBundle] = useState<Bundle | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")



  // Categories management states
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false)
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false)

  // Video and media states
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [youtubeLink, setYoutubeLink] = useState<string>("")
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([])

  const [formData, setFormData] = useState<BundleFormData>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    bundleDiscount: "",
    category: "",
    subcategory: "",
    images: [],
    videos: [],
    youtubeLinks: [],
    badge: {
      text: "",
      color: "#12d6fa"
    },
    sku: "",
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isLimited: false,
    stock: "",
    // Specifications and features
    specifications: "",
    features: "",
    warranty: "",
    dimensions: "",
    weight: "",
    // FAQ and Q&A
    faq: []
  })

  // Category form data
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  })

  // Fetch bundles on component mount
  useEffect(() => {
    fetchBundles()
    fetchCategories()
  }, [])


  // Set first category as default when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({
        ...prev,
        category: categories[0]._id
      }))
    }
  }, [categories, formData.category])

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories()
      
      if (response.success) {
        setCategories(response.categories || [])
        
        // Categories loaded successfully
      } else {
        console.error('Failed to fetch categories:', response)
        toast.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to fetch categories')
    }
  }


  const fetchBundles = async () => {
    try {
      setLoading(true)
      const response = await shopAPI.getBundles()
      
      if (response.success) {
        setBundles(response.bundles || [])
      } else {
        // For testing, add sample data if API fails
        setBundles([
          {
            _id: "1",
            name: "Starter Kit Bundle",
            description: "Perfect starter kit for beginners including soda maker, CO2 cylinder, and flavor pack",
            price: 399.99,
            originalPrice: 499.99,
            bundleDiscount: 20,
            category: "starter",
            images: ["/images/starter-kit.jpg"],
            isActive: true,
            isFeatured: true,
            stock: 15,
            createdAt: new Date().toISOString()
          },
          {
            _id: "2",
            name: "Premium Flavor Collection",
            description: "Complete collection of premium Italian flavors with bonus accessories",
            price: 149.99,
            originalPrice: 199.99,
            bundleDiscount: 25,
            category: "premium",
            images: ["/images/flavor-collection.jpg"],
            isActive: true,
            isFeatured: false,
            stock: 8,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ])
      }
    } catch (error) {
      console.error("Error fetching bundles:", error)
      toast.error("Failed to fetch bundles")
      // Add sample data for testing
        setBundles([
          {
            _id: "1",
            name: "Starter Kit Bundle",
            description: "Perfect starter kit for beginners including soda maker, CO2 cylinder, and flavor pack",
            price: 399.99,
            originalPrice: 499.99,
            bundleDiscount: 20,
            category: "starter",
            images: ["/images/starter-kit.jpg"],
            isActive: true,
            isFeatured: true,
            stock: 15,
            createdAt: new Date().toISOString()
          }
        ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Form validation
    if (!formData.name.trim()) {
      toast.error("Bundle name is required")
      return
    }
    
    if (!formData.category) {
      toast.error("Category is required")
      return
    }
    
    if (!formData.description.trim()) {
      toast.error("Bundle description is required")
      return
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required")
      return
    }
    
    if (!formData.bundleDiscount || parseFloat(formData.bundleDiscount) < 0) {
      toast.error("Valid discount percentage is required")
      return
    }
    
    if (!formData.stock || parseInt(formData.stock) <= 0) {
      toast.error("Valid stock quantity is required")
      return
    }

    setIsSubmitting(true)

    try {
      const bundleData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        bundleDiscount: parseFloat(formData.bundleDiscount),
        subcategory: "default", // Temporary fix until backend is deployed
        stock: parseInt(formData.stock)
      }

      if (editingBundle) {
        const response = await shopAPI.updateBundle(editingBundle._id, bundleData)
        if (response.success) {
          toast.success("Bundle updated successfully")
        } else {
          throw new Error(response.message || "Failed to update bundle")
        }
      } else {
        const response = await shopAPI.createBundle(bundleData)
        if (response.success) {
          toast.success("Bundle created successfully")
        } else {
          throw new Error(response.message || "Failed to create bundle")
        }
      }

      setIsDialogOpen(false)
      resetForm()
      fetchBundles()
    } catch (error: any) {
      console.error("Error saving bundle:", error)
      toast.error(error.message || "Failed to save bundle")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleView = (bundle: Bundle) => {
    try {
      setViewingBundle(bundle)
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error('Error in handleView:', error)
      toast.error('Failed to open bundle view')
    }
  }

  const handleEdit = (bundle: Bundle) => {
    try {
      setEditingBundle(bundle)
      
      const newFormData = {
        name: bundle.name || "",
        description: bundle.description || "",
        price: bundle.price?.toString() || "0",
        originalPrice: bundle.originalPrice?.toString() || "",
        bundleDiscount: bundle.bundleDiscount?.toString() || "0",
        category: bundle.category || "",
        subcategory: bundle.subcategory || "",
        images: bundle.images || [],
        videos: bundle.videos || [],
        youtubeLinks: bundle.youtubeLinks || [],
        badge: bundle.badge || { text: "", color: "#12d6fa" },
        sku: bundle.sku || "",
        isActive: bundle.isActive || false,
        isFeatured: bundle.isFeatured || false,
        isNewArrival: bundle.isNewArrival || false,
        isBestSeller: bundle.isBestSeller || false,
        isLimited: bundle.isLimited || false,
        stock: bundle.stock?.toString() || "0",
        // Specifications and features
        specifications: bundle.specifications || "",
        features: bundle.features || "",
        warranty: bundle.warranty || "",
        dimensions: bundle.dimensions || "",
        weight: bundle.weight || "",
        // FAQ and Q&A
        faq: bundle.faq || []
      }
      
      setFormData(newFormData)
      setUploadedVideos(bundle.videos || [])
      setYoutubeLinks(bundle.youtubeLinks || [])
      setIsDialogOpen(true)
    } catch (error) {
      console.error('Error in handleEdit:', error)
      toast.error('Failed to open bundle edit form')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) {
      return
    }

    try {
      const response = await shopAPI.deleteBundle(id)
      
      if (response.success) {
        toast.success("Bundle deleted successfully")
        await fetchBundles()
      } else {
        throw new Error(response.message || "Failed to delete bundle")
      }
    } catch (error: any) {
      console.error("Error deleting bundle:", error)
      toast.error(error.message || "Failed to delete bundle")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      bundleDiscount: "",
      category: "",
      subcategory: "",
      images: [],
      videos: [],
      youtubeLinks: [],
      badge: {
        text: "",
        color: "#12d6fa"
      },
      sku: "",
      isActive: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      isLimited: false,
      stock: "",
      // Specifications and features
      specifications: "",
      features: "",
      warranty: "",
      dimensions: "",
      weight: "",
      // FAQ and Q&A
      faq: []
    })
    setUploadedVideos([])
    setYoutubeLinks([])
    setYoutubeLink("")
    setEditingBundle(null)

  }




  // Helper functions for categories
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category ? category.name : categoryId
  }

  const getShopPageInfo = (category: string) => {
    switch (category) {
      case 'sodamakers':
        return { 
          icon: '🏠', 
          url: '/shop/sodamakers/bundles', 
          name: 'Soda Maker Bundles', 
          color: 'text-blue-600',
          subcategoryPrefix: 'Bundles & Promotions of Soda Makers'
        };
      case 'flavor':
        return { 
          icon: '🍓', 
          url: '/shop/flavor/bundles', 
          name: 'Flavor Bundles', 
          color: 'text-pink-600',
          subcategoryPrefix: 'Bundles & Promotions of Flavors'
        };
      case 'accessories':
        return { 
          icon: '🔧', 
          url: '/shop/accessories/bundles', 
          name: 'Accessories Bundles', 
          color: 'text-green-600',
          subcategoryPrefix: 'Bundles & Promotions of Accessories'
        };
      case 'co2-cylinders':
        return { 
          icon: '💨', 
          url: '/shop/co2-cylinders', 
          name: 'CO2 Cylinders', 
          color: 'text-purple-600',
          subcategoryPrefix: 'Bundles & Promotions of CO2'
        };
      default:
        return { 
          icon: '📦', 
          url: 'Custom Category', 
          name: 'Custom Category', 
          color: 'text-gray-600',
          subcategoryPrefix: 'Bundles & Promotions'
        };
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId
    }))
  }

  // Video upload functions
  const handleVideoUpload = async (file: File) => {
    try {
      setIsUploadingVideo(true)
      setUploadProgress(0)
      
      const result = await uploadImageWithProgress(
        file,
        (progress) => setUploadProgress(progress)
      )
      
      if (result.success && result.url) {
        setUploadedVideos(prev => [...prev, result.url!])
        setFormData(prev => ({
          ...prev,
          videos: [...prev.videos, result.url!]
        }))
        toast.success("Video uploaded successfully!")
      } else {
        throw new Error(result.error || "Video upload failed")
      }
    } catch (error) {
      console.error("Video upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload video")
    } finally {
      setIsUploadingVideo(false)
      setUploadProgress(0)
    }
  }

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('video/')) {
        toast.error("Please select a valid video file")
        return
      }
      
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video file size must be less than 100MB")
        return
      }
      
      setVideoFile(file)
      handleVideoUpload(file)
    }
  }

  const removeVideo = (index: number) => {
    setUploadedVideos(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }))
  }

  // YouTube link functions
  const addYouTubeLink = () => {
    if (youtubeLink.trim() && isYouTubeUrl(youtubeLink)) {
      setYoutubeLinks(prev => [...prev, youtubeLink.trim()])
      setFormData(prev => ({
        ...prev,
        youtubeLinks: [...prev.youtubeLinks, youtubeLink.trim()]
      }))
      setYoutubeLink("")
      toast.success("YouTube link added!")
    } else {
      toast.error("Please enter a valid YouTube URL")
    }
  }

  const removeYouTubeLink = (index: number) => {
    setYoutubeLinks(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      youtubeLinks: prev.youtubeLinks.filter((_, i) => i !== index)
    }))
  }

  // Categories management functions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryFormData.name.trim()) {
      toast.error("Category name is required")
      return
    }
    if (!categoryFormData.slug.trim()) {
      toast.error("Category slug is required")
      return
    }
    if (!categoryFormData.description.trim()) {
      toast.error("Category description is required")
      return
    }

    setIsCategorySubmitting(true)
    try {
      // Call the API to create the category
      const response = await adminAPI.createCategory({
        name: categoryFormData.name.trim(),
        slug: categoryFormData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: categoryFormData.description.trim(),
        isActive: categoryFormData.isActive
      })

      if (response.success) {
        toast.success("Category added successfully")
        setIsAddCategoryDialogOpen(false)
        resetCategoryForm()
        // Refresh categories to get the updated data
        await fetchCategories()
      } else {
        throw new Error(response.message || "Failed to create category")
      }
    } catch (error: any) {
      console.error("Error adding category:", error)
      toast.error(error.message || "Failed to add category")
    } finally {
      setIsCategorySubmitting(false)
    }
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingCategory) return
    
    if (!categoryFormData.name.trim()) {
      toast.error("Category name is required")
      return
    }
    if (!categoryFormData.slug.trim()) {
      toast.error("Category slug is required")
      return
    }
    if (!categoryFormData.description.trim()) {
      toast.error("Category description is required")
      return
    }

    setIsCategorySubmitting(true)
    try {
      // Call the API to update the category
      const response = await adminAPI.updateCategory(editingCategory._id, {
        name: categoryFormData.name.trim(),
        slug: categoryFormData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: categoryFormData.description.trim(),
        isActive: categoryFormData.isActive
      })

      if (response.success) {
        toast.success("Category updated successfully")
        setIsAddCategoryDialogOpen(false)
        resetCategoryForm()
        setEditingCategory(null)
        // Refresh categories to get the updated data
        await fetchCategories()
      } else {
        throw new Error(response.message || "Failed to update category")
      }
    } catch (error: any) {
      console.error("Error updating category:", error)
      toast.error(error.message || "Failed to update category")
    } finally {
      setIsCategorySubmitting(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This will also delete all its subcategories.")) return

    try {
      // Call the API to delete the category
      const response = await adminAPI.deleteCategory(categoryId, true) // Force delete with subcategories
      
      if (response.success) {
        toast.success("Category deleted successfully")
        // Refresh categories to get the updated data
        await fetchCategories()
      } else {
        throw new Error(response.message || "Failed to delete category")
      }
    } catch (error: any) {
      console.error("Error deleting category:", error)
      toast.error(error.message || "Failed to delete category")
    }
  }


  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true
    })
    setEditingCategory(null)
  }

  const openEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive
    })
    setIsAddCategoryDialogOpen(true)
  }

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  const handleCategoryNameChange = (name: string) => {
    setCategoryFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }


  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bundle.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || bundle.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading bundles...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#12d6fa]/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="space-y-8 p-4 md:p-6 relative z-10">
        {/* Premium Header with enhanced actions */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Bundle Management
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Create and manage premium product bundles with advanced categorization
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{filteredBundles.length}</div>
                  <div className="text-sm text-gray-500">Active Bundles</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#12d6fa]">{bundles.length}</div>
                  <div className="text-sm text-gray-500">Total Bundles</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Bundle
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setIsCategoriesDialogOpen(true)}
                  className="border-2 border-gray-300 hover:border-[#12d6fa] hover:bg-[#12d6fa]/5 px-6 py-3 rounded-xl transition-all duration-300"
                >
                  <Tag className="h-5 w-5 mr-2" />
                  Manage Categories
                </Button>
                
                <Button
                  variant="outline"
                  onClick={fetchCategories}
                  className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 px-6 py-3 rounded-xl transition-all duration-300"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Search & Filters */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-[#12d6fa]/20 to-blue-500/20 rounded-xl">
                <Search className="h-6 w-6 text-[#12d6fa]" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Search & Filters
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label htmlFor="search" className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#12d6fa]" />
                  Search Bundles
                </Label>
                <div className="relative group">
                  <Input
                    id="search"
                    placeholder="Search by name, description, or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-4 focus:ring-[#12d6fa]/20 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 group-hover:border-[#12d6fa]/50"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#12d6fa] transition-colors duration-300" />
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="category" className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#12d6fa]" />
                  Category Filter
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-4 focus:ring-[#12d6fa]/20 rounded-xl py-3 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-[#12d6fa]/50">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                    <SelectItem value="all" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#12d6fa] to-blue-500" />
                        All Categories
                      </div>
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div 
                            className="color-swatch shadow-sm"
                            style={{ '--color-hex': (category as any).color || '#6b7280' } as React.CSSProperties}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Status Filter
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedCategory === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(selectedCategory === "active" ? "all" : "active")}
                    className={`text-xs px-4 py-2 rounded-lg transition-all duration-300 ${
                      selectedCategory === "active" 
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg" 
                        : "border-2 border-gray-200 hover:border-green-500 hover:bg-green-50"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${selectedCategory === "active" ? "bg-white" : "bg-green-500"}`}></div>
                      Active
                    </div>
                  </Button>
                  <Button
                    variant={selectedCategory === "inactive" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(selectedCategory === "inactive" ? "all" : "inactive")}
                    className={`text-xs px-4 py-2 rounded-lg transition-all duration-300 ${
                      selectedCategory === "inactive" 
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg" 
                        : "border-2 border-gray-200 hover:border-red-500 hover:bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${selectedCategory === "inactive" ? "bg-white" : "bg-red-500"}`}></div>
                      Inactive
                    </div>
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#12d6fa] rounded-full"></div>
                  Quick Actions
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                    }}
                    className="text-xs px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Clear All
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchBundles()}
                    className="text-xs px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Premium Bundles Table */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30"></div>
          <div className="relative overflow-hidden rounded-2xl">
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                    <Package className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Product Bundles</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#12d6fa] rounded-full animate-pulse"></div>
                        <span className="text-gray-300">
                          {filteredBundles.length} of {bundles.length} bundles
                        </span>
                      </div>
                      {searchTerm && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-yellow-300">Filtered by "{searchTerm}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => fetchBundles()}
                    variant="outline"
                    size="sm"
                    className="text-xs px-4 py-2 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg transition-all duration-300"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-white p-6">
              {filteredBundles.length === 0 ? (
                <div className="text-center py-20">
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#12d6fa] to-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No bundles found</h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    {searchTerm ? `No bundles match your search "${searchTerm}"` : "Create your first premium bundle to get started"}
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Premium Bundle
                    </Button>
                  )}
                </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700 py-4">Bundle Details</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Category</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Subcategory & Shop Page</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Pricing</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Discount</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Stock</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Created</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredBundles.map((bundle, index) => (
                    <TableRow 
                      key={bundle._id} 
                      className={`hover:bg-gray-50/50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <TableCell className="py-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#12d6fa]/10 to-[#0fb8d6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-6 w-6 text-[#12d6fa]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 text-lg mb-1">{bundle.name}</div>
                            <div className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {bundle.description}
                            </div>
                            {bundle.sku && (
                              <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                SKU: {bundle.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center gap-2">
                          <div 
                            className="color-swatch" 
                            style={{ '--color-hex': (categories.find(c => c._id === bundle.category) as any)?.color || '#6b7280' } as React.CSSProperties}
                          />
                          <Badge 
                            variant="secondary" 
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            {getCategoryName(bundle.category)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-900">
                            {bundle.subcategory || (
                              <span className="text-gray-400 italic">No subcategory</span>
                            )}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${getShopPageInfo(bundle.category).color}`}>
                            {getShopPageInfo(bundle.category).icon} {getShopPageInfo(bundle.category).url}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="space-y-1">
                          <div className="font-semibold text-lg text-gray-900">
                            <SaudiRiyal amount={bundle.price} size="sm" />
                          </div>
                          {bundle.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              <SaudiRiyal amount={bundle.originalPrice} size="sm" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="destructive" 
                            className="bg-red-100 text-red-700 hover:bg-red-200 font-semibold"
                          >
                            {bundle.bundleDiscount}% OFF
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={bundle.stock > 0 ? "default" : "destructive"}
                            className={`font-semibold ${
                              bundle.stock > 0 
                                ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            {bundle.stock > 0 ? `${bundle.stock} in stock` : "Out of stock"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex flex-col gap-2">
                          <Badge 
                            variant={bundle.isActive ? "default" : "secondary"}
                            className={`font-semibold ${
                              bundle.isActive 
                                ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {bundle.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {bundle.isFeatured && (
                            <Badge 
                              variant="outline" 
                              className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 font-semibold"
                            >
                              ⭐ Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="text-sm text-gray-600 font-medium">
                          {new Date(bundle.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(bundle.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleView(bundle)
                            }}
                            className="h-9 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 transition-all duration-200"
                            title="View Bundle Details"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleEdit(bundle)
                            }}
                            className="h-9 px-4 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 transition-all duration-200"
                            title="Edit Bundle"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDelete(bundle._id)
                            }}
                            className="h-9 px-4 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300 transition-all duration-200"
                            title="Delete Bundle"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Add/Edit Bundle Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            resetForm()
          }
        }}>
          <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] overflow-y-auto z-[9999] bg-white rounded-2xl shadow-2xl border-0">
            <DialogHeader className="pb-6 bg-gradient-to-r from-gray-50 to-gray-100 -m-6 mb-0 p-6 rounded-t-2xl border-b">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-[#12d6fa]/10 rounded-lg">
                  <Package className="h-6 w-6 text-[#12d6fa]" />
                </div>
                {editingBundle ? `Edit Bundle: ${editingBundle.name}` : "Create New Bundle"}
              </DialogTitle>
              <div className="text-sm text-gray-500 mt-2">
                {editingBundle ? "Update the bundle details below" : "Fill in the details below to create a new bundle"}
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Bundle Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Shop Category (Controls which page bundle appears on)</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shop category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sodamakers">
                        <div className="flex flex-col">
                          <span className="font-medium">Soda Makers</span>
                          <span className="text-xs text-gray-500">Appears on /shop/sodamakers/bundles</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="flavor">
                        <div className="flex flex-col">
                          <span className="font-medium">Flavors</span>
                          <span className="text-xs text-gray-500">Appears on /shop/flavor/bundles</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="accessories">
                        <div className="flex flex-col">
                          <span className="font-medium">Accessories</span>
                          <span className="text-xs text-gray-500">Appears on /shop/accessories/bundles</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="co2-cylinders">
                        <div className="flex flex-col">
                          <span className="font-medium">CO2 Cylinders</span>
                          <span className="text-xs text-gray-500">Appears on /shop/co2-cylinders</span>
                        </div>
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-xs text-gray-500">Custom category</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Choose which shop section this bundle will appear in. This controls the URL and page where customers can find your bundle.
                  </p>
                  
                  {/* Category Preview */}
                  {formData.category && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-900">Bundle will appear on:</span>
                      </div>
                      <div className="text-sm text-blue-800">
                        {(() => {
                          const pageInfo = getShopPageInfo(formData.category);
                          return (
                            <span>
                              {pageInfo.icon} <strong>{pageInfo.url}</strong> - {pageInfo.name} page
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <div className="space-y-2">
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="e.g., Starter Kit, Premium Bundle"
                    />
                    {formData.category && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Suggested format:</span> {getShopPageInfo(formData.category).subcategoryPrefix}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-2 h-6 px-2 text-xs"
                          onClick={() => setFormData({ ...formData, subcategory: getShopPageInfo(formData.category).subcategoryPrefix })}
                        >
                          Use This
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., BNDL-SM-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="badgeText">Badge Text</Label>
                  <Input
                    id="badgeText"
                    value={formData.badge.text}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      badge: { ...formData.badge, text: e.target.value }
                    })}
                    placeholder="e.g., Bundle Deal, Limited Edition"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badgeColor">Badge Color</Label>
                  <Input
                    id="badgeColor"
                    type="color"
                    value={formData.badge.color}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      badge: { ...formData.badge, color: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (﷼)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (﷼)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bundleDiscount">Discount (%)</Label>
                  <Input
                    id="bundleDiscount"
                    type="number"
                    step="0.01"
                    value={formData.bundleDiscount}
                    onChange={(e) => setFormData({ ...formData, bundleDiscount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>


              {/* Image Management */}
              <CloudinaryImageUpload
                onImagesChange={(images) => {
                  setFormData(prev => ({ ...prev, images }))
                }}
                currentImages={formData.images}
                maxImages={5}
                disabled={isSubmitting}
              />

              {/* Video Upload Section */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Video Content</Label>
                
                {/* Video File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="video-upload">Upload Video Files</Label>
                  <div className="flex items-center gap-4">
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      disabled={isUploadingVideo || isSubmitting}
                      className="hidden"
                    />
                    <label
                      htmlFor="video-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingVideo ? "Uploading..." : "Choose Video File"}
                    </label>
                    {isUploadingVideo && (
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="progress-bar"
                            style={{ '--progress-width': `${uploadProgress}%` } as React.CSSProperties}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Supported formats: MP4, MOV, AVI, WebM. Max size: 100MB per file.
                  </p>
                </div>

                {/* Uploaded Videos Display */}
                {uploadedVideos.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Uploaded Videos</Label>
                    {uploadedVideos.map((video, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-gray-700">Video {index + 1}</span>
                            </div>
                            <video 
                              src={video} 
                              controls 
                              className="w-full max-w-xs rounded"
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVideo(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* YouTube Links Section */}
                <div className="space-y-2">
                  <Label htmlFor="youtube-link">YouTube Links</Label>
                  <div className="flex gap-2">
                    <Input
                      id="youtube-link"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      onClick={addYouTubeLink}
                      disabled={!youtubeLink.trim() || isSubmitting}
                      size="sm"
                    >
                      Add Link
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter YouTube video URLs to embed them in your bundle.
                  </p>
                </div>

                {/* YouTube Links Display */}
                {youtubeLinks.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">YouTube Videos</Label>
                    {youtubeLinks.map((link, index) => (
                      <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-gray-700">YouTube Video {index + 1}</span>
                            </div>
                            
                            {/* YouTube Video Preview */}
                            <div className="mb-2">
                              <YouTubeVideo
                                videoUrl={link}
                                title={`YouTube Video ${index + 1}`}
                                className="w-full max-w-xs"
                                showThumbnail={true}
                              />
                            </div>
                            
                            <div className="text-xs text-gray-600 break-all">
                              {link}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeYouTubeLink(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Bundle Status</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isActive" 
                      checked={formData.isActive}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, isActive: checked === true})
                      }
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isFeatured" 
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, isFeatured: checked === true})
                      }
                    />
                    <Label htmlFor="isFeatured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isNewArrival" 
                      checked={formData.isNewArrival}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, isNewArrival: checked === true})
                      }
                    />
                    <Label htmlFor="isNewArrival">New Arrival</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isBestSeller" 
                      checked={formData.isBestSeller}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, isBestSeller: checked === true})
                      }
                    />
                    <Label htmlFor="isBestSeller">Best Seller</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isLimited" 
                      checked={formData.isLimited}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, isLimited: checked === true})
                      }
                    />
                    <Label htmlFor="isLimited">Limited Edition</Label>
                  </div>
                </div>
              </div>

              {/* Specifications and Features */}
              <div className="space-y-6">
                <Label className="text-lg font-semibold">Specifications & Features</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="specifications">Specifications (JSON format)</Label>
                    <Textarea
                      id="specifications"
                      value={formData.specifications}
                      onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                      placeholder='{"Material": "Stainless Steel", "Capacity": "1L", "Power": "220V"}'
                      rows={4}
                    />
                    <p className="text-xs text-gray-500">
                      Enter specifications as JSON object. Each key-value pair will be displayed in the specifications tab.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="features">Features (one per line)</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      placeholder="Easy to use&#10;BPA-free materials&#10;Compact design"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500">
                      Enter each feature on a new line. They will be displayed as bullet points.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="warranty">Warranty</Label>
                    <Input
                      id="warranty"
                      value={formData.warranty}
                      onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                      placeholder="2 years manufacturer warranty"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      placeholder="25cm x 15cm x 30cm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="2.5 kg"
                    />
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Frequently Asked Questions</Label>
                <div className="space-y-4">
                  {formData.faq.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`faq-question-${index}`}>Question {index + 1}</Label>
                          <Input
                            id={`faq-question-${index}`}
                            value={item.question}
                            onChange={(e) => {
                              const newFaq = [...formData.faq]
                              newFaq[index] = { ...item, question: e.target.value }
                              setFormData({ ...formData, faq: newFaq })
                            }}
                            placeholder="What is included in this bundle?"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`faq-answer-${index}`}>Answer {index + 1}</Label>
                          <div className="flex gap-2">
                            <Textarea
                              id={`faq-answer-${index}`}
                              value={item.answer}
                              onChange={(e) => {
                                const newFaq = [...formData.faq]
                                newFaq[index] = { ...item, answer: e.target.value }
                                setFormData({ ...formData, faq: newFaq })
                              }}
                              placeholder="This bundle includes..."
                              rows={2}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newFaq = formData.faq.filter((_, i) => i !== index)
                                setFormData({ ...formData, faq: newFaq })
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        faq: [...formData.faq, { question: "", answer: "" }]
                      })
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ Item
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                >
                  {isSubmitting ? "Saving..." : editingBundle ? "Update Bundle" : "Create Bundle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Bundle Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle>View Bundle: {viewingBundle?.name}</DialogTitle>
            </DialogHeader>
            {viewingBundle && (
              <div className="space-y-6">
                {/* Bundle Images */}
                {viewingBundle.images && viewingBundle.images.length > 0 && (
                  <div className="space-y-2">
                    <Label>Bundle Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {viewingBundle.images.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Bundle image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bundle Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Bundle Name</Label>
                      <p className="text-lg font-semibold">{viewingBundle.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      <p className="text-gray-700">{viewingBundle.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Category</Label>
                      <Badge variant="secondary">{getCategoryName(viewingBundle.category)}</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Price</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">
                          <SaudiRiyal amount={viewingBundle.price} size="xl" />
                        </span>
                        {viewingBundle.originalPrice && (
                          <span className="text-lg text-gray-500 line-through">
                            <SaudiRiyal amount={viewingBundle.originalPrice} size="lg" />
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Discount</Label>
                      <Badge variant="destructive" className="text-lg">
                        {viewingBundle.bundleDiscount}% OFF
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Stock</Label>
                      <Badge variant={viewingBundle.stock > 0 ? "default" : "destructive"}>
                        {viewingBundle.stock > 0 ? `${viewingBundle.stock} in stock` : "Out of stock"}
                      </Badge>
                    </div>
                  </div>
                </div>


                {/* Bundle Status */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Bundle Status</Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="view-isActive" 
                        checked={viewingBundle.isActive}
                        disabled
                      />
                      <Label htmlFor="view-isActive">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="view-isFeatured" 
                        checked={viewingBundle.isFeatured}
                        disabled
                      />
                      <Label htmlFor="view-isFeatured">Featured</Label>
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                  <p className="text-gray-700">
                    {new Date(viewingBundle.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Categories Management Dialog */}
        <Dialog open={isCategoriesDialogOpen} onOpenChange={setIsCategoriesDialogOpen}>
          <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle>Categories Management</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 pb-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{categories.length}</p>
                        <p className="text-sm text-gray-600">Total Categories</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Checkbox className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold">
                          {categories.filter(cat => cat.isActive).length}
                        </p>
                        <p className="text-sm text-gray-600">Active Categories</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add Category Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Categories</h3>
                <Button 
                  onClick={() => setIsAddCategoryDialogOpen(true)}
                  className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>

              {/* Categories List - Scrollable */}
              <div className="space-y-4">
                {categories.map((category) => (
                  <Card key={category._id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <h4 className="text-lg font-semibold">{category.name}</h4>
                          </div>
                          <span className="text-sm text-gray-500">({category.slug})</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditCategory(category)}
                            title="Edit Category"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCategory(category._id)}
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600">{category.description}</p>
                    </CardHeader>
                    
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Category Dialog */}
        <Dialog open={isAddCategoryDialogOpen} onOpenChange={(open) => {
          setIsAddCategoryDialogOpen(open)
          if (!open) {
            resetCategoryForm()
          }
        }}>
          <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={editingCategory ? handleEditCategory : handleAddCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={categoryFormData.name}
                    onChange={(e) => handleCategoryNameChange(e.target.value)}
                    placeholder="e.g., Soda Makers"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categorySlug">Category Slug</Label>
                  <Input
                    id="categorySlug"
                    value={categoryFormData.slug}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                    placeholder="e.g., soda-makers"
                    required
                  />
                  <p className="text-xs text-gray-500">URL-friendly version of the name (lowercase, hyphens instead of spaces)</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="categoryIsActive" 
                  checked={categoryFormData.isActive}
                  onCheckedChange={(checked) => 
                    setCategoryFormData({...categoryFormData, isActive: checked === true})
                  }
                />
                <Label htmlFor="categoryIsActive">Active</Label>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddCategoryDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCategorySubmitting}
                  className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                >
                  {isCategorySubmitting ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        </div>
      </div>
    </AdminLayout>
  )
}
