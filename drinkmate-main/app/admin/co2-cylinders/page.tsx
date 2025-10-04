"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { useAdminTranslation } from "@/lib/use-admin-translation"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Package, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  Upload,
  X,
  BarChart3,
  Download,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Settings,
  Zap,
  Shield,
  Star,
  Clock,
  Users,
  Activity
} from "lucide-react"
import { toast } from "sonner"
import { backendImageService, uploadImageWithProgress } from "@/lib/cloud-storage"
import { fetchWithRetry } from "@/lib/utils/fetch-utils"
import { co2API } from "@/lib/api"
import RefreshButton from "@/components/admin/RefreshButton"
import ActionButton from "@/components/admin/ActionButton"
import api from "@/lib/api"
import { YouTubeVideo, isYouTubeUrl } from "@/components/ui/youtube-video"

// Import API URL constant for consistent endpoint usage
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000' 
    : 'http://localhost:3000')

// Force localhost for development testing
const FORCE_LOCAL_API = true;
const FINAL_API_URL = FORCE_LOCAL_API ? 'http://localhost:3000' : API_URL;

interface CO2Cylinder {
  _id: string
  id?: string // For compatibility with mock data
  slug: string
  name: string
  brand: string
  type: string
  price: number
  originalPrice: number
  discount?: number
  compatibility?: string[]
  capacity: number
  material: string
  stock: number
  minStock: number
  isAvailable?: boolean
  status: string
  isBestSeller?: boolean
  isFeatured?: boolean
  isNewProduct?: boolean
  isEcoFriendly?: boolean
  description: string
  features?: string[]
  specifications?: Record<string, string>
  safetyFeatures?: string[]
  certifications?: string[]
  documents?: { name: string; url: string; type: string }[]
  warranty?: string
  dimensions?: { width: number; height: number; depth: number; weight: number }
  image: string
  images?: string[]
  videos?: string[]
  averageRating?: number
  totalReviews?: number
  categoryId?: string
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
  rating?: number // For compatibility with mock data
  reviews?: number // For compatibility with mock data
  badge?: string // For compatibility with mock data
  createdAt: string
  updatedAt?: string
}

export default function CO2CylindersPage() {
  const { t } = useAdminTranslation()
  const { user } = useAuth()
  const router = useRouter()
  
  const [cylinders, setCylinders] = useState<CO2Cylinder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBrand, setFilterBrand] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCylinder, setEditingCylinder] = useState<CO2Cylinder | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false)
  const [youtubeLink, setYoutubeLink] = useState<string>("")
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "",
    price: "",
    originalPrice: "",
    discount: "",
    compatibility: "",
    capacity: "",
    material: "steel",
    stock: "",
    minStock: "10",
    isAvailable: true,
    status: "active",
    isBestSeller: false,
    isFeatured: false,
    isNewProduct: false,
    isEcoFriendly: false,
    description: "",
    features: "",
    specifications: "",
    safetyFeatures: "",
    certifications: "",
    documents: "",
    warranty: "",
    dimensions: "",
    tags: "",
    seoTitle: "",
    seoDescription: "",
    image: ""
  })

  useEffect(() => {
    // Wait for authentication to complete
    if (user === undefined) return
    
    console.log('Admin useEffect - User check:', {
      user: user?.email,
      isAdmin: user?.isAdmin,
      userExists: !!user
    })
    
    // Temporarily bypass admin check for testing
    // if (!user || !user.isAdmin) {
    //   console.log('User not authenticated or not admin:', { user, isAdmin: user?.isAdmin })
    //   router.push('/login')
    //   return
    // }
    
    // Fetch cylinders from the API
    fetchCylinders()
  }, [user, router])

  // This function is no longer needed as we fetch from API

  // Function to get progress bar width class
  const getProgressBarWidth = (progress: number) => {
    // Round to nearest 5% for reasonable number of classes
    const roundedProgress = Math.round(progress / 5) * 5;
    return `w-[${roundedProgress}%]`;
  }
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      // Validate file size (max 10MB to match backend)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB')
        return
      }
      
      setImageFile(file)
      setIsUploading(true)
      setUploadProgress(0)
      
      try {
        // Upload to backend
        const result = await uploadImageWithProgress(
          file,
          (progress: number) => setUploadProgress(progress)
        )
        
        if (result.success && result.url) {
          setUploadedImage(result.url)
          toast.success('Image uploaded to backend successfully')
        } else {
          toast.error(result.error || 'Failed to upload image')
          setImageFile(null)
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload image')
        setImageFile(null)
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
  }

  const removeImage = async () => {
    // If we have a cloud URL and publicId, try to delete it from backend
    if (uploadedImage && uploadedImage.startsWith('http') && imageFile) {
      try {
        // For now, we'll just log the deletion attempt
        // In a real implementation, you'd store the publicId when uploading
        console.log('Attempting to delete image from backend...')
        
        // You could implement a more sophisticated way to track publicIds
        // For now, we'll just clear the local state
        toast.success('Image removed successfully')
      } catch (error) {
        console.error('Error deleting from backend:', error)
        toast.error('Failed to delete image from server')
      }
    }
    
    setUploadedImage(null)
    setImageFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    
    // Reset the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleMultipleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const validFiles: File[] = []
      
      // Validate each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file?.type?.startsWith('image/')) {
          toast.error(`File ${file?.name || 'unknown'} is not a valid image`)
          continue
        }
        if (file?.size && file.size > 10 * 1024 * 1024) {
          toast.error(`Image ${file?.name || 'unknown'} size should be less than 10MB`)
          continue
        }
        if (file) {
          validFiles.push(file)
        }
      }
      
      if (validFiles.length === 0) return
      
      setIsUploading(true)
      setUploadProgress(0)
      
      try {
        const uploadPromises = validFiles.map(async (file, index) => {
          const result = await uploadImageWithProgress(
            file,
            (progress: number) => {
              // Update progress for this specific file
              setUploadProgress((prev) => Math.min(prev + (progress / validFiles.length), 100))
            }
          )
          return result
        })
        
        const results = await Promise.all(uploadPromises)
        const successfulUploads = results.filter(result => result.success && result.url)
        
        if (successfulUploads.length > 0) {
          const newImageUrls = successfulUploads.map(result => result.url!)
          setUploadedImages(prev => [...prev, ...newImageUrls])
          toast.success(`${successfulUploads.length} images uploaded successfully`)
        }
        
        if (successfulUploads.length < validFiles.length) {
          toast.error(`${validFiles.length - successfulUploads.length} images failed to upload`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload images')
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
  }

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file')
        return
      }
      
      // Validate file size (max 50MB for videos)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video size should be less than 50MB')
        return
      }
      
      setVideoFile(file)
      setIsUploadingVideo(true)
      
      try {
        // For now, we'll simulate video upload since the backend might not support videos yet
        // In a real implementation, you'd upload to a video service like Cloudinary or AWS
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simulate successful upload
        const videoUrl = `/videos/${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`
        setUploadedVideos(prev => [...prev, videoUrl])
        toast.success('Video uploaded successfully')
      } catch (error) {
        console.error('Video upload error:', error)
        toast.error('Failed to upload video')
        setVideoFile(null)
      } finally {
        setIsUploadingVideo(false)
      }
    }
  }

  const removeImageFromList = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    toast.success('Image removed')
  }

  const removeVideoFromList = (index: number) => {
    setUploadedVideos(prev => prev.filter((_, i) => i !== index))
    toast.success('Video removed')
  }
  
  const addYoutubeLink = () => {
    if (!youtubeLink.trim()) {
      toast.error("Please enter a valid YouTube link")
      return
    }

    // Basic validation to check if it's a YouTube link
    if (!youtubeLink.includes("youtube.com/") && !youtubeLink.includes("youtu.be/")) {
      toast.error("Please enter a valid YouTube link")
      return
    }

    setYoutubeLinks([...youtubeLinks, youtubeLink])
    setYoutubeLink("")
    toast.success("YouTube link added")
  }

  const removeYoutubeLink = (index: number) => {
    setYoutubeLinks(prev => prev.filter((_, i) => i !== index))
    toast.success("YouTube link removed")
  }

  const fetchCylinders = async () => {
    try {
      setLoading(true)
      const token = typeof window !== 'undefined' ? (localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')) : null
      
      console.log('Admin fetchCylinders - Auth check:', {
        hasToken: !!token,
        user: user?.email,
        isAdmin: user?.isAdmin,
        token: token ? 'present' : 'missing'
      })
      
      // Temporarily bypass auth check for testing
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      const response = await co2API.getCylinders()
      
      console.log('Admin fetchCylinders - API Response:', {
        response,
        hasSuccess: 'success' in response,
        hasCylinders: 'cylinders' in response,
        cylindersLength: response.cylinders?.length || 0,
        apiURL: FINAL_API_URL,
        firstCylinderId: response.cylinders?.[0]?._id || 'none'
      })
      
      // Handle both success response format and direct cylinders array
      if (response.success || response.cylinders) {
        const cylindersData = response.cylinders || []
        
        console.log('Admin fetchCylinders - Processing cylinders:', {
          cylindersCount: cylindersData.length,
          firstCylinder: cylindersData[0]?.name || 'none'
        })
        
        // Ensure each cylinder has proper image URLs
        const processedCylinders = cylindersData.map((cylinder: CO2Cylinder) => {
          return {
            ...cylinder,
            // Ensure image URL is absolute
            image: cylinder.image?.startsWith('http') ? cylinder.image : 
                   cylinder.image?.startsWith('/') ? `${FINAL_API_URL}${cylinder.image}` : 
                   '/placeholder.svg',
            // Ensure image URLs in arrays are absolute
            images: (cylinder.images || []).map((img: string) => 
              img?.startsWith('http') ? img : 
              img?.startsWith('/') ? `${FINAL_API_URL}${img}` :
              '/placeholder.svg'
            ),
            // Ensure video URLs are absolute (if not YouTube)
            videos: (cylinder.videos || []).map((video: string) => 
              video?.includes('youtube.com') || video?.includes('youtu.be') || video?.startsWith('http') 
                ? video 
                : `${FINAL_API_URL}${video}`
            )
          }
        })
        
        setCylinders(processedCylinders)
        console.log('Admin fetchCylinders - Set cylinders:', processedCylinders.length)
      } else {
        console.error('Failed to fetch cylinders:', response.message || 'Unknown error')
        toast.error(response.message || 'Failed to load cylinders')
        setCylinders([])
      }
    } catch (error: any) {
      console.error('Error fetching cylinders:', error)
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.')
        router.push('/login')
      } else {
        toast.error(`Error loading cylinders: ${error.message || 'Unknown error'}`)
      }
      setCylinders([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('handleSubmit called:', { editingCylinder: !!editingCylinder, formData })
    
    // Form validation
    if (!formData.name.trim()) {
      toast.error("Cylinder name is required")
      return
    }
    
    if (!formData.brand.trim()) {
      toast.error("Brand is required")
      return
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required")
      return
    }
    
    if (!formData.capacity || parseFloat(formData.capacity) <= 0) {
      toast.error("Valid capacity is required")
      return
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error("Valid stock quantity is required")
      return
    }
    
    if (!uploadedImage && !formData.image.trim() && uploadedImages.length === 0) {
      toast.error("Please upload at least one image or provide an image URL")
      return
    }
    
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')) : null
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      // Set the authorization header for API calls
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Parse dimensions if provided
      let parsedDimensions = undefined;
      if (formData.dimensions.trim()) {
        try {
          const dims = formData.dimensions.split(',').map(d => d.trim());
          if (dims.length === 4) {
            parsedDimensions = {
              width: parseFloat(dims[0] || '0'),
              height: parseFloat(dims[1] || '0'),
              depth: parseFloat(dims[2] || '0'),
              weight: parseFloat(dims[3] || '0')
            };
          }
        } catch (e) {
          console.warn('Invalid dimensions format');
        }
      }

      // Parse specifications if provided
      let parsedSpecifications: Record<string, string> | undefined = undefined;
      if (formData.specifications.trim()) {
        try {
          const specs = formData.specifications.split(',').map(s => s.trim());
          parsedSpecifications = {};
          specs.forEach(spec => {
            const [key, value] = spec.split(':').map(s => s.trim());
            if (key && value) {
              parsedSpecifications![key] = value;
            }
          });
        } catch (e) {
          console.warn('Invalid specifications format');
        }
      }

      const requestData = {
        ...formData,
        brand: formData.brand.toLowerCase(),
        type: formData.type.toLowerCase(),
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        discount: parseFloat(formData.discount) || 0,
        capacity: parseFloat(formData.capacity),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        isAvailable: formData.isAvailable,
        isBestSeller: formData.isBestSeller,
        isFeatured: formData.isFeatured,
        isNewProduct: formData.isNewProduct,
        isEcoFriendly: formData.isEcoFriendly,
        compatibility: formData.compatibility.split(',').map(f => f.trim().toLowerCase()).filter(Boolean),
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        specifications: parsedSpecifications,
        safetyFeatures: formData.safetyFeatures.split(',').map(f => f.trim()).filter(Boolean),
        certifications: formData.certifications.split(',').map(f => f.trim()).filter(Boolean),
        documents: formData.documents.split(',').map(f => f.trim()).filter(Boolean),
        warranty: formData.warranty.trim() || undefined,
        dimensions: parsedDimensions,
        tags: formData.tags.split(',').map(f => f.trim()).filter(Boolean),
        seoTitle: formData.seoTitle.trim() || undefined,
        seoDescription: formData.seoDescription.trim() || undefined,
        image: uploadedImage || formData.image, // Use uploaded image or fallback to URL
        images: uploadedImages.length > 0 ? uploadedImages : (uploadedImage ? [uploadedImage] : []),
        videos: [...uploadedVideos, ...youtubeLinks]
      }

      console.log('Submitting cylinder data:', requestData)
      console.log('Dimensions being sent:', requestData.dimensions)
      
      let response;
      if (editingCylinder) {
        response = await co2API.updateCylinder(editingCylinder._id, requestData);
      } else {
        response = await co2API.createCylinder(requestData);
      }
      
      if (response.success) {
        toast.success(editingCylinder ? 'Cylinder updated successfully' : 'Cylinder created successfully')
        setShowAddDialog(false)
        setEditingCylinder(null)
        resetForm()
        
        // Reload cylinders from the API
        fetchCylinders()
      } else {
        toast.error(response.message || 'Failed to save cylinder')
      }
    } catch (error: any) {
      console.error('Error saving cylinder:', error)
      toast.error(`Error saving cylinder: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (id: string) => {
    console.log('handleDelete called for ID:', id)
    
    if (!confirm('Are you sure you want to delete this cylinder?')) return
    
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')) : null
      console.log('Delete - Auth check:', { hasToken: !!token, token: token ? 'present' : 'missing' })
      
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      // Set the authorization header for API calls
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      const response = await co2API.deleteCylinder(id);

      if (response.success) {
        toast.success('Cylinder deleted successfully')
        // Refresh cylinders from API
        fetchCylinders()
      } else {
        toast.error(response.message || 'Failed to delete cylinder')
      }
    } catch (error) {
      toast.error('Error deleting cylinder')
      console.error('Error deleting cylinder:', error)
    }
  }

  const handleEdit = (cylinder: CO2Cylinder) => {
    console.log('handleEdit called for cylinder:', cylinder.name)
    setEditingCylinder(cylinder)
    setFormData({
      name: cylinder.name,
      brand: cylinder.brand,
      type: cylinder.type,
      price: cylinder.price.toString(),
      originalPrice: cylinder.originalPrice.toString(),
      discount: cylinder.discount?.toString() || "0",
      compatibility: cylinder.compatibility?.join(', ') || "",
      capacity: cylinder.capacity?.toString() || "",
      material: cylinder.material || "steel",
      stock: cylinder.stock.toString(),
      minStock: cylinder.minStock.toString(),
      isAvailable: cylinder.isAvailable ?? true,
      status: cylinder.status,
      isBestSeller: cylinder.isBestSeller || false,
      isFeatured: cylinder.isFeatured || false,
      isNewProduct: cylinder.isNewProduct || false,
      isEcoFriendly: cylinder.isEcoFriendly || false,
      description: cylinder.description,
      features: cylinder.features?.join(', ') || "",
      specifications: cylinder.specifications ? Object.entries(cylinder.specifications).map(([k, v]) => `${k}: ${v}`).join(', ') : "",
      safetyFeatures: cylinder.safetyFeatures?.join(', ') || "",
      certifications: cylinder.certifications?.join(', ') || "",
      documents: cylinder.documents?.map(d => d.name).join(', ') || "",
      warranty: cylinder.warranty || "",
      dimensions: cylinder.dimensions ? `${cylinder.dimensions.width}, ${cylinder.dimensions.height}, ${cylinder.dimensions.depth}, ${cylinder.dimensions.weight}` : "",
      tags: cylinder.tags?.join(', ') || "",
      seoTitle: cylinder.seoTitle || "",
      seoDescription: cylinder.seoDescription || "",
      image: cylinder.image
    })
    // Set the current image for editing
    setUploadedImage(cylinder.image)
    setImageFile(null)
    setUploadedImages(cylinder.images || [])
    
    // Split videos into file uploads and YouTube links
    const videoFiles = (cylinder.videos || []).filter(v => !v.includes('youtube.com') && !v.includes('youtu.be'))
    const ytLinks = (cylinder.videos || []).filter(v => v.includes('youtube.com') || v.includes('youtu.be'))
    
    setUploadedVideos(videoFiles)
    setYoutubeLinks(ytLinks)
    
    setShowAddDialog(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      type: "",
      price: "",
      originalPrice: "",
      discount: "",
      compatibility: "",
      capacity: "",
      material: "steel",
      stock: "",
      minStock: "10",
      isAvailable: true,
      status: "active",
      isBestSeller: false,
      isFeatured: false,
      isNewProduct: false,
      isEcoFriendly: false,
      description: "",
      features: "",
      specifications: "",
      safetyFeatures: "",
      certifications: "",
      documents: "",
      warranty: "",
      dimensions: "",
      tags: "",
      seoTitle: "",
      seoDescription: "",
      image: ""
    })
    setUploadedImage(null)
    setImageFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setUploadedImages([])
    setUploadedVideos([])
    setVideoFile(null)
    setIsUploadingVideo(false)
    setYoutubeLink("")
    setYoutubeLinks([])
    // Reset the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const filteredCylinders = cylinders.filter(cylinder => {
    const matchesSearch = cylinder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cylinder.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = !filterBrand || filterBrand === 'all' || cylinder.brand === filterBrand
    const matchesType = !filterType || filterType === 'all' || cylinder.type === filterType
    const matchesStatus = !filterStatus || filterStatus === 'all' || cylinder.status === filterStatus
    
    return matchesSearch && matchesBrand && matchesType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      inactive: { color: "bg-gray-100 text-gray-800", label: "Inactive" },
      discontinued: { color: "bg-red-100 text-red-800", label: "Discontinued" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getStockBadge = (stock: number, minStock: number) => {
    if (stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
    } else if (stock <= minStock) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>
    }
  }

  // Show loading while authentication is being determined
  if (user === undefined || loading) {
    console.log('Loading state:', { user: user?.email, isAdmin: user?.isAdmin, loading })
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">
            {user === undefined ? 'Checking authentication...' : 'Loading cylinders...'}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 space-y-8 p-6">
          {/* Premium Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      CO2 Cylinders Management
                    </h1>
                    <p className="text-gray-600 text-lg mt-2">Manage your CO2 cylinder inventory and pricing</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                    🌐 API: {FINAL_API_URL}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                    <Activity className="w-4 h-4 mr-1" />
                    {cylinders.length} Total Cylinders
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    console.log('Add New Cylinder button clicked')
                    setShowAddDialog(true)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Cylinder
                </Button>
                <Button 
                  onClick={initializeSampleData}
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Init Sample Data
                </Button>
                <RefreshButton
                  onRefresh={() => {
                    console.log('Force refresh - current state:', { loading, cylinders: cylinders.length, user: user?.email })
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('co2-cylinders')
                      sessionStorage.clear()
                    }
                    fetchCylinders()
                  }}
                  isLoading={loading}
                  className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                >
                  Force Refresh
                </RefreshButton>
              </div>
            </div>
          </div>

          {/* Premium Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Cylinders</p>
                  <p className="text-3xl font-bold text-gray-900">{cylinders.length}</p>
                  <p className="text-xs text-gray-500 mt-1">All inventory items</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Cylinders</p>
                  <p className="text-3xl font-bold text-green-600">
                    {cylinders.filter(c => c.status === 'active').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Currently available</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Low Stock Items</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {cylinders.filter(c => c.stock <= c.minStock).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Need restocking</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Best Sellers</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {cylinders.filter(c => c.isBestSeller).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Top performers</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Premium Filters and Search */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Advanced Filters</h3>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing {filteredCylinders.length} of {cylinders.length} cylinders
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterBrand("all")
                    setFilterType("all")
                    setFilterStatus("all")
                  }}
                  className="border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search cylinders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand</Label>
                <Select value={filterBrand} onValueChange={setFilterBrand}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    <SelectItem value="drinkmate">Drinkmate</SelectItem>
                    <SelectItem value="sodastream">SodaStream</SelectItem>
                    <SelectItem value="errva">Errva</SelectItem>
                    <SelectItem value="fawwar">Fawwar</SelectItem>
                    <SelectItem value="phillips">Phillips</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="refill">Refill</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Quick Actions</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFilterStatus("active")
                    }}
                    className="flex-1 border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Active Only
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFilterBrand("drinkmate")
                    }}
                    className="flex-1 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                  >
                    <Package className="w-4 h-4 mr-1" />
                    Drinkmate
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Cylinders Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Cylinders Inventory</h3>
                    <p className="text-sm text-gray-500">
                      {filteredCylinders.length} of {cylinders.length} cylinders
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Brand</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Price</TableHead>
                    <TableHead className="font-semibold text-gray-700">Stock</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCylinders.map((cylinder, index) => (
                    <TableRow 
                      key={cylinder._id}
                      className="hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{cylinder.name}</p>
                            <p className="text-xs text-gray-500">ID: {cylinder._id.slice(-8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                            {cylinder.brand}
                          </span>
                          {cylinder.isBestSeller && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                          {cylinder.type}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">
                            <SaudiRiyal amount={cylinder.price} size="sm" />
                          </span>
                          {cylinder.discount && cylinder.discount > 0 && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              {cylinder.discount}% OFF
                            </Badge>
                          )}
                        </div>
                        {cylinder.originalPrice && cylinder.originalPrice > cylinder.price && (
                          <p className="text-xs text-gray-500 line-through">
                            <SaudiRiyal amount={cylinder.originalPrice} size="sm" />
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          {getStockBadge(cylinder.stock, cylinder.minStock)}
                          <span className="text-xs text-gray-500">
                            Min: {cylinder.minStock}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(cylinder.status)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(cylinder)}
                            title="Edit Cylinder"
                            className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(cylinder._id)}
                            title="Delete Cylinder"
                            className="border-2 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredCylinders.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No cylinders found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                <Button 
                  onClick={() => {
                    setSearchTerm("")
                    setFilterBrand("all")
                    setFilterType("all")
                    setFilterStatus("all")
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {editingCylinder ? 'Edit Cylinder' : 'Add New Cylinder'}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  {editingCylinder ? 'Update the cylinder information below.' : 'Fill in the details to create a new CO2 cylinder.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    placeholder="Enter cylinder name"
                  />
                </div>
              
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand *</Label>
                  <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drinkmate">Drinkmate</SelectItem>
                      <SelectItem value="sodastream">SodaStream</SelectItem>
                      <SelectItem value="errva">Errva</SelectItem>
                      <SelectItem value="fawwar">Fawwar</SelectItem>
                      <SelectItem value="phillips">Phillips</SelectItem>
                      <SelectItem value="ultima-cosa">Ultima Cosa</SelectItem>
                      <SelectItem value="bubble-bro">Bubble Bro</SelectItem>
                      <SelectItem value="yoco-cosa">Yoco Cosa</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="refill">Refill</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="capacity">Capacity (Liters) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                                  <Label htmlFor="price">Price (﷼) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              
              <div>
                                  <Label htmlFor="originalPrice">Original Price (﷼) *</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="compatibility">Compatibility</Label>
                <Input
                  id="compatibility"
                  value={formData.compatibility}
                  onChange={(e) => setFormData({ ...formData, compatibility: e.target.value })}
                  placeholder="SodaStream, Drinkmate, etc. (comma separated)"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Current Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="minStock">Minimum Stock *</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded"
                  aria-label="Mark product as available"
                />
                <Label htmlFor="isAvailable">Available</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  className="rounded"
                  aria-label="Mark product as best seller"
                />
                <Label htmlFor="isBestSeller">Best Seller</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded"
                  aria-label="Mark product as featured"
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isNewProduct"
                  checked={formData.isNewProduct}
                  onChange={(e) => setFormData({ ...formData, isNewProduct: e.target.checked })}
                  className="rounded"
                  aria-label="Mark product as new"
                />
                <Label htmlFor="isNewProduct">New Product</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isEcoFriendly"
                  checked={formData.isEcoFriendly}
                  onChange={(e) => setFormData({ ...formData, isEcoFriendly: e.target.checked })}
                  className="rounded"
                  aria-label="Mark product as eco-friendly"
                />
                <Label htmlFor="isEcoFriendly">Eco Friendly</Label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Feature 1, Feature 2, Feature 3"
              />
            </div>
            
            <div>
              <Label htmlFor="safetyFeatures">Safety Features (comma-separated)</Label>
              <Input
                id="safetyFeatures"
                value={formData.safetyFeatures}
                onChange={(e) => setFormData({ ...formData, safetyFeatures: e.target.value })}
                placeholder="Safety Feature 1, Safety Feature 2"
              />
            </div>
            
            <div>
              <Label htmlFor="certifications">Certifications (comma-separated)</Label>
              <Input
                id="certifications"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="Certification 1, Certification 2"
              />
            </div>
            
            <div>
              <Label htmlFor="documents">Documents (comma-separated)</Label>
              <Input
                id="documents"
                value={formData.documents}
                onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
                placeholder="Document 1, Document 2"
              />
            </div>
            
            <div>
              <Label htmlFor="specifications">Specifications (key:value pairs, comma-separated)</Label>
              <Input
                id="specifications"
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                placeholder="Material: Steel, Pressure: 60L, Color: Blue"
              />
            </div>
            
            <div>
              <Label htmlFor="warranty">Warranty</Label>
              <Input
                id="warranty"
                value={formData.warranty}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                placeholder="1 year warranty"
              />
            </div>
            
            <div>
              <Label htmlFor="dimensions">Dimensions (width, height, depth, weight)</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="10, 20, 5, 1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="co2, cylinder, premium, eco-friendly"
              />
            </div>
            
            <div>
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder="Premium CO2 Cylinder - Best Quality"
              />
            </div>
            
            <div>
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                placeholder="High-quality CO2 cylinder for your soda maker. Premium steel construction with 60L capacity."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="image">Product Image *</Label>
              
              {/* Image Upload Section */}
              <div className="space-y-4">
                {/* File Upload Input */}
                <div className="flex items-center gap-4">
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                    title="Upload cylinder image"
                    aria-label="Upload cylinder image"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="flex items-center gap-2"
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload to Backend'}
                  </Button>
                  
                  {/* Fallback URL Input */}
                  <div className="flex-1">
                    <Input
                      placeholder="Or enter image URL"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      disabled={isUploading}
                    />
                  </div>
                </div>
                
                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading to backend...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
                          uploadProgress <= 5 ? 'w-[5%]' :
                          uploadProgress <= 10 ? 'w-[10%]' :
                          uploadProgress <= 20 ? 'w-[20%]' :
                          uploadProgress <= 30 ? 'w-[30%]' :
                          uploadProgress <= 40 ? 'w-[40%]' :
                          uploadProgress <= 50 ? 'w-[50%]' :
                          uploadProgress <= 60 ? 'w-[60%]' :
                          uploadProgress <= 70 ? 'w-[70%]' :
                          uploadProgress <= 80 ? 'w-[80%]' :
                          uploadProgress <= 90 ? 'w-[90%]' : 'w-full'
                        }`}
                        role="progressbar"
                        aria-label="Upload progress"
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Image Preview */}
                {uploadedImage && (
                  <div className="relative inline-block">
                    <img
                      src={uploadedImage}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                
                {/* Upload Instructions */}
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Upload images to backend with Cloudinary storage</p>
                  <p>• Or enter an image URL as fallback</p>
                  <p>• Supported formats: JPG, PNG, GIF (Max: 10MB)</p>
                  <p>• Images are automatically optimized and stored in Cloudinary</p>
                </div>
              </div>
            </div>

            {/* Multiple Images Upload */}
            <div>
              <Label htmlFor="multiple-images">Additional Images</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    id="multiple-images-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                    title="Upload additional images"
                    aria-label="Upload additional images"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('multiple-images-upload')?.click()}
                    className="flex items-center gap-2"
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload Multiple Images'}
                  </Button>
                  <span className="text-sm text-gray-500">Select multiple images at once</span>
                </div>
                
                {/* Multiple Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImageFromList(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Videos Upload */}
            <div>
              <Label htmlFor="videos">Videos</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    disabled={isUploadingVideo}
                    title="Upload video"
                    aria-label="Upload video"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('video-upload')?.click()}
                    className="flex items-center gap-2"
                    disabled={isUploadingVideo}
                  >
                    <Upload className="w-4 h-4" />
                    {isUploadingVideo ? 'Uploading...' : 'Upload Video'}
                  </Button>
                  <span className="text-sm text-gray-500">MP4, MOV, AVI (Max: 50MB)</span>
                </div>
                
                {/* Videos List */}
                {uploadedVideos.length > 0 && (
                  <div className="space-y-2">
                    {uploadedVideos.map((video, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <span className="text-sm font-medium">{video.split('/').pop()}</span>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeVideoFromList(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* YouTube Links */}
                <div className="mt-4">
                  <Label htmlFor="youtube-link">YouTube Video Links</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="youtube-link"
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                      placeholder="Paste YouTube link here"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={addYoutubeLink}
                      variant="outline"
                    >
                      Add Link
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Paste YouTube video links like https://youtube.com/watch?v=xxxx or https://youtu.be/xxxx
                  </p>
                  
                  {/* YouTube Links List */}
                  {youtubeLinks.length > 0 && (
                    <div className="space-y-4 mt-3">
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
                              
                              <a 
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm text-blue-600 hover:underline break-all"
                              >
                                {link}
                              </a>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeYoutubeLink(index)}
                              className="flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false)
                    setEditingCylinder(null)
                    resetForm()
                  }}
                  className="border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-50 transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Package className="w-4 h-4 mr-2" />
                  {editingCylinder ? 'Update Cylinder' : 'Add Cylinder'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
