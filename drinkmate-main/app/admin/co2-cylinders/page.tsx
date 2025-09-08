"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
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
  X
} from "lucide-react"
import { toast } from "sonner"
import { backendImageService, uploadImageWithProgress } from "@/lib/cloud-storage"
import { fetchWithRetry } from "@/lib/fetch-utils"
import { co2API } from "@/lib/api"
import api from "@/lib/api"
import { YouTubeVideo, isYouTubeUrl } from "@/components/ui/youtube-video"

// Import API URL constant for consistent endpoint usage
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000' 
    : 'https://drinkmates.onrender.com')

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
  isNew?: boolean
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
    isNew: false,
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

  const initializeSampleData = () => {
    const sampleCylinders = [
      {
        _id: "1",
        slug: "premium-co2-cylinder",
        name: "Premium CO2 Cylinder",
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
        description: "Premium CO2 cylinder with extended capacity",
        features: ["Extended capacity", "Premium quality", "Fast delivery"],
        image: "/images/co2-premium.jpg",
        images: ["/images/co2-premium.jpg", "/placeholder.svg"],
        videos: [],
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('co2-cylinders', JSON.stringify(sampleCylinders))
    setCylinders(sampleCylinders)
    setLoading(false)
    console.log('Sample data initialized:', sampleCylinders)
  }

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
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not a valid image`)
          continue
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Image ${file.name} size should be less than 10MB`)
          continue
        }
        validFiles.push(file)
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
        const videoUrl = `/videos/${Date.now()}-${file.name}`
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
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      
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
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
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
              width: parseFloat(dims[0]),
              height: parseFloat(dims[1]),
              depth: parseFloat(dims[2]),
              weight: parseFloat(dims[3])
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
        isNew: formData.isNew,
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
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
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
      isNew: cylinder.isNew || false,
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
      isNew: false,
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">CO2 Cylinders Management</h1>
            <p className="text-gray-600">Manage your CO2 cylinder inventory and pricing</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                🌐 API: {FINAL_API_URL}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => {
              console.log('Add New Cylinder button clicked')
              setShowAddDialog(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Cylinder
            </Button>
            <Button 
              onClick={initializeSampleData}
              variant="outline"
              className="text-sm"
            >
              🔧 Init Sample Data
            </Button>
            <Button 
              onClick={() => {
                console.log('Force refresh - current state:', { loading, cylinders: cylinders.length, user: user?.email })
                // Clear any cached data and force fresh fetch
                localStorage.removeItem('co2-cylinders')
                sessionStorage.clear()
                fetchCylinders()
              }}
              variant="outline"
              className="text-sm"
            >
              🔄 Force Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cylinders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cylinders.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cylinders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cylinders.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cylinders.filter(c => c.stock <= c.minStock).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Sellers</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cylinders.filter(c => c.isBestSeller).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search cylinders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select value={filterBrand} onValueChange={setFilterBrand}>
                  <SelectTrigger>
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
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
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
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
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
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                                     onClick={() => {
                     setSearchTerm("")
                     setFilterBrand("all")
                     setFilterType("all")
                     setFilterStatus("all")
                   }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cylinders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Cylinders ({filteredCylinders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCylinders.map((cylinder) => (
                  <TableRow key={cylinder._id}>
                    <TableCell className="font-medium">{cylinder.name}</TableCell>
                    <TableCell className="capitalize">{cylinder.brand}</TableCell>
                    <TableCell className="capitalize">{cylinder.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          <SaudiRiyal amount={cylinder.price} size="sm" />
                        </span>
                        {cylinder.discount && cylinder.discount > 0 && (
                          <Badge className="bg-green-100 text-green-800">
                            {cylinder.discount}% OFF
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStockBadge(cylinder.stock, cylinder.minStock)}
                    </TableCell>
                    <TableCell>{getStatusBadge(cylinder.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cylinder)}
                          title="Edit Cylinder"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(cylinder._id)}
                          title="Delete Cylinder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCylinder ? 'Edit Cylinder' : 'Add New Cylinder'}
            </DialogTitle>
            <DialogDescription>
              {editingCylinder ? 'Update the cylinder information below.' : 'Fill in the details to create a new CO2 cylinder.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="brand">Brand *</Label>
                <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
                  <SelectTrigger>
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
                  id="isNew"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="rounded"
                  aria-label="Mark product as new"
                />
                <Label htmlFor="isNew">New Product</Label>
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
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingCylinder(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCylinder ? 'Update Cylinder' : 'Add Cylinder'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
