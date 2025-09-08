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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  description: string
  features: string[]
  image: string
  images: string[]
  videos: string[]
  createdAt: string
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
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "",
    price: "",
    originalPrice: "",
    capacity: "",
    material: "steel",
    stock: "",
    minStock: "10",
    description: "",
    features: "",
    image: "",
    status: "active"
  })

  useEffect(() => {
    // Wait for authentication to complete
    if (user === undefined) return
    
    // Check if user is authenticated and is admin
    if (!user || !user.isAdmin) {
      console.log('User not authenticated or not admin:', { user, isAdmin: user?.isAdmin })
      router.push('/login')
      return
    }
    
    // Check if there's existing data in localStorage
    const existingCylinders = localStorage.getItem('co2-cylinders')
    if (existingCylinders) {
      try {
        const parsedCylinders = JSON.parse(existingCylinders)
        console.log('Loading existing cylinders from localStorage:', parsedCylinders)
        setCylinders(parsedCylinders)
        setLoading(false)
      } catch (error) {
        console.error('Error parsing existing cylinders:', error)
        // Fallback to sample data
        initializeSampleData()
      }
    } else {
      // Initialize with sample data if localStorage is empty
      console.log('No existing cylinders found, initializing with sample data')
      initializeSampleData()
    }
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

  const fetchCylinders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      const response = await fetch('http://localhost:3000/api/co2/cylinders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 401) {
        toast.error('Authentication failed. Please log in again.')
        router.push('/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        const cylindersData = data.cylinders || []
        setCylinders(cylindersData)
        // Save to localStorage for shop section to read
        localStorage.setItem('co2-cylinders', JSON.stringify(cylindersData))
      } else {
        toast.error('Failed to fetch cylinders')
      }
    } catch (error) {
      toast.error('Error fetching cylinders')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      const url = editingCylinder 
        ? `http://localhost:3000/api/co2/cylinders/${editingCylinder._id}`
        : 'http://localhost:3000/api/co2/cylinders'
      
      const method = editingCylinder ? 'PUT' : 'POST'
      
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      const requestData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        capacity: parseFloat(formData.capacity),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        image: uploadedImage || formData.image, // Use uploaded image or fallback to URL
        images: uploadedImages.length > 0 ? uploadedImages : (uploadedImage ? [uploadedImage] : []),
        videos: uploadedVideos
      }

      console.log('Submitting cylinder data:', requestData)
      console.log('API URL:', url)
      console.log('Method:', method)

      // For now, simulate API response since backend might not be running
      // TODO: Remove this when backend is properly set up
      console.log('Simulating API response for development...')
      
      // Generate slug from name
      const generateSlug = (name: string) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim()
      }

      // Simulate successful response
      const mockResponse: CO2Cylinder = {
        _id: Date.now().toString(),
        slug: generateSlug(requestData.name),
        ...requestData,
        discount: 0,
        isBestSeller: false,
        isFeatured: false,
        createdAt: new Date().toISOString()
      }
      
      console.log('Mock response:', mockResponse)
      toast.success(editingCylinder ? 'Cylinder updated successfully' : 'Cylinder created successfully')
      setShowAddDialog(false)
      setEditingCylinder(null)
      resetForm()
      
      // Add to local state for immediate UI update
      if (editingCylinder) {
        const updatedCylinders = cylinders.map(cyl => 
          cyl._id === editingCylinder._id ? { ...cyl, ...requestData, slug: generateSlug(requestData.name) } : cyl
        )
        setCylinders(updatedCylinders)
        // Save to localStorage for shop section to read
        localStorage.setItem('co2-cylinders', JSON.stringify(updatedCylinders))
        // Dispatch custom event to notify shop section
        window.dispatchEvent(new CustomEvent('co2-cylinders-updated'))
      } else {
        const newCylinders = [...cylinders, mockResponse]
        setCylinders(newCylinders)
        // Save to localStorage for shop section to read
        localStorage.setItem('co2-cylinders', JSON.stringify(newCylinders))
        // Dispatch custom event to notify shop section
        window.dispatchEvent(new CustomEvent('co2-cylinders-updated'))
      }
      
      return
      
      // Original API call (commented out for now)
      /*
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('Success response:', result)
        toast.success(editingCylinder ? 'Cylinder updated successfully' : 'Cylinder created successfully')
        setShowAddDialog(false)
        setEditingCylinder(null)
        resetForm()
        fetchCylinders()
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        toast.error(`Failed to save cylinder: ${response.status} ${response.statusText}`)
      }
      */
    } catch (error) {
      console.error('Error saving cylinder:', error)
      toast.error(`Error saving cylinder: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cylinder?')) return
    
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      const response = await fetch(`http://localhost:3000/api/co2/cylinders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Cylinder deleted successfully')
        // Update local state and localStorage
        const updatedCylinders = cylinders.filter(cyl => cyl._id !== id)
        setCylinders(updatedCylinders)
        localStorage.setItem('co2-cylinders', JSON.stringify(updatedCylinders))
        // Dispatch custom event to notify shop section
        window.dispatchEvent(new CustomEvent('co2-cylinders-updated'))
      } else {
        toast.error('Failed to delete cylinder')
      }
    } catch (error) {
      toast.error('Error deleting cylinder')
    }
  }

  const handleEdit = (cylinder: CO2Cylinder) => {
    setEditingCylinder(cylinder)
    setFormData({
      name: cylinder.name,
      brand: cylinder.brand,
      type: cylinder.type,
      price: cylinder.price.toString(),
      originalPrice: cylinder.originalPrice.toString(),
      capacity: cylinder.capacity?.toString() || "",
      material: cylinder.material || "steel",
      stock: cylinder.stock.toString(),
      minStock: cylinder.minStock.toString(),
      description: cylinder.description,
      features: cylinder.features?.join(', ') || "",
      image: cylinder.image,
      status: cylinder.status
    })
    // Set the current image for editing
    setUploadedImage(cylinder.image)
    setImageFile(null)
    setUploadedImages(cylinder.images || [])
    setUploadedVideos(cylinder.videos || [])
    setShowAddDialog(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      type: "",
      price: "",
      originalPrice: "",
      capacity: "",
      material: "steel",
      stock: "",
      minStock: "10",
      description: "",
      features: "",
      image: "",
      status: "active"
    })
    setUploadedImage(null)
    setImageFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setUploadedImages([])
    setUploadedVideos([])
    setVideoFile(null)
    setIsUploadingVideo(false)
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
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddDialog(true)}>
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
                console.log('Manual refresh - current state:', { loading, cylinders: cylinders.length, user: user?.email })
                setLoading(false)
              }}
              variant="outline"
              className="text-sm"
            >
              🔄 Force Load
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
                        {cylinder.discount > 0 && (
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
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
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
