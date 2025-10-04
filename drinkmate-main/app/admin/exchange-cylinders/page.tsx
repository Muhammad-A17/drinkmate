"use client"

import { useState, useEffect } from "react"
import { useAuth, getAuthToken } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
  X,
  Package,
  DollarSign,
  Star,
  Calendar
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import CloudinaryImageUpload from "@/components/ui/cloudinary-image-upload"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { toast } from "@/hooks/use-toast"
import { exchangeCylinderAPI } from "@/lib/api/exchange-cylinder-api"
import { sanitizeInput, sanitizeHtml } from "@/lib/api/protected-api"

interface ExchangeCylinder {
  _id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  description: string
  capacity: number
  material: string
  exchangeType: 'instant' | 'scheduled' | 'pickup'
  estimatedTime: string
  rating: number
  reviewCount: number
  inStock: boolean
  badges?: string[]
  weight?: number
  brand?: string
  createdAt: string
  updatedAt: string
}

export default function ExchangeCylindersAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  const [cylinders, setCylinders] = useState<ExchangeCylinder[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [editingCylinder, setEditingCylinder] = useState<ExchangeCylinder | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: 0,
    originalPrice: 0,
    image: "",
    images: [] as string[],
    description: "",
    capacity: 0,
    material: "steel",
    exchangeType: "instant" as "instant" | "scheduled" | "pickup",
    estimatedTime: "Same Day",
    rating: 0,
    reviewCount: 0,
    inStock: true,
    badges: [] as string[],
    weight: 10,
    brand: "drinkmate"
  })

  // Authentication check
  useEffect(() => {
    // Wait for authentication to complete
    if (isLoading) return
    
    // Check if user is authenticated and is admin
    if (!isAuthenticated || !user || !user.isAdmin) {
      console.log('User not authenticated or not admin:', { user, isAuthenticated, isAdmin: user?.isAdmin })
      router.push('/admin/login')
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load exchange cylinders from API
  const loadCylinders = async () => {
    try {
      setLoading(true)
      const response = await exchangeCylinderAPI.getExchangeCylinders({
        page: 1,
        limit: 100 // Load all cylinders for admin
      }) as { success: boolean; cylinders?: ExchangeCylinder[]; message?: string }
      
      if (response.success) {
        setCylinders(response.cylinders || [])
      } else {
        console.error('Failed to load cylinders:', response.message)
        toast({
          title: "Error",
          description: "Failed to load exchange cylinders",
          type: "error"
        })
      }
    } catch (error) {
      console.error('Error loading cylinders:', error)
      toast({
        title: "Error",
        description: "Failed to load exchange cylinders",
        type: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  // Load cylinders on mount
  useEffect(() => {
    if (mounted) {
      loadCylinders()
    }
  }, [mounted])

  const filteredCylinders = cylinders.filter(cylinder => {
    const matchesSearch = cylinder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cylinder.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === "all" || cylinder.exchangeType === filterType
    return matchesSearch && matchesFilter
  })

  // Debug logging
  console.log('Main page - Cylinders:', cylinders.length)
  console.log('Main page - Filtered:', filteredCylinders.length)
  console.log('Main page - Mounted:', mounted)
  console.log('Main page - Loading:', loading)

  // Log when cylinders change
  useEffect(() => {
    console.log('Cylinders state changed:', cylinders.length, cylinders)
  }, [cylinders])


  const handleCreate = () => {
    setIsCreating(true);
    setEditingCylinder(null);
    
    // Initialize with default values
    setFormData({
      name: "",
      slug: "",
      price: 0,
      originalPrice: 0,
      image: "",
      images: [],
      description: "",
      capacity: 0,
      material: "steel",
      exchangeType: "instant",
      estimatedTime: "Same Day",
      rating: 0,
      reviewCount: 0,
      inStock: true,
      badges: [],
      weight: 10,
      brand: "drinkmate"
    });
    
    // Log for debugging
    console.log('Initialized form for creating new cylinder');
    
    setIsDialogOpen(true);
  }

  const handleEdit = (cylinder: ExchangeCylinder) => {
    console.log('handleEdit called with cylinder:', cylinder);
    setEditingCylinder(cylinder);
    setIsCreating(false);
    
    // Process images properly
    const cylinderImages: string[] = [];
    
    // Add the main image if it exists and is not already in images array
    if (cylinder.image) {
      cylinderImages.push(cylinder.image);
    }
    
    // Add any additional images from the images array
    if (cylinder.images && Array.isArray(cylinder.images)) {
      cylinder.images.forEach(img => {
        if (img && !cylinderImages.includes(img)) {
          cylinderImages.push(img);
        }
      });
    }
    
    console.log('Processed images for editing:', cylinderImages);
    
    const formDataToSet = {
      name: cylinder.name || '',
      slug: cylinder.slug || '',
      price: cylinder.price || 0,
      originalPrice: cylinder.originalPrice || 0,
      image: cylinder.image || '',
      images: cylinderImages,
      description: cylinder.description || '',
      capacity: cylinder.capacity || 0,
      material: cylinder.material || "steel",
      exchangeType: cylinder.exchangeType || "instant",
      estimatedTime: cylinder.estimatedTime || "Same Day",
      rating: cylinder.rating || 0,
      reviewCount: cylinder.reviewCount || 0,
      inStock: cylinder.inStock ?? true,
      badges: cylinder.badges || [],
      weight: (cylinder as any).weight || 10,
      brand: (cylinder as any).brand || "drinkmate"
    };
    
    console.log('Setting form data for editing:', formDataToSet);
    setFormData(formDataToSet);
    console.log('Opening dialog for editing');
    setIsDialogOpen(true);
  }

  const handleSave = async () => {
    console.log('=== HANDLE SAVE CALLED ===');
    console.log('Current form data:', formData);
    console.log('Is creating:', isCreating);
    console.log('Editing cylinder:', editingCylinder);
    
    // Enhanced validation for all required fields
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        type: "error"
      })
      return
    }

    if (!formData.slug?.trim()) {
      toast({
        title: "Validation Error",
        description: "Slug is required",
        type: "error"
      })
      return
    }

    if (formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0",
        type: "error"
      })
      return
    }

    if (formData.capacity <= 0) {
      toast({
        title: "Validation Error",
        description: "Capacity must be greater than 0",
        type: "error"
      })
      return
    }

    if (!formData.description?.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        type: "error"
      })
      return
    }

    if (!formData.material?.trim()) {
      toast({
        title: "Validation Error",
        description: "Material is required",
        type: "error"
      })
      return
    }

    // Ensure slug is URL-friendly
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast({
        title: "Validation Error",
        description: "Slug must contain only lowercase letters, numbers, and hyphens",
        type: "error"
      })
      return
    }

    // Validate weight
    if (formData.weight <= 0) {
      toast({
        title: "Validation Error",
        description: "Weight must be greater than 0",
        type: "error"
      })
      return
    }

    // Ensure originalPrice is set properly
    if (formData.originalPrice <= 0) {
      formData.originalPrice = formData.price
    }

    // Make image optional for now to allow testing
    // if (!formData.image && (!formData.images || formData.images.length === 0)) {
    //   toast({
    //     title: "Validation Error",
    //     description: "Please upload at least one image",
    //     type: "error"
    //   })
    //   return
    // }

    try {
      setLoading(true)
      
      // Check if user is authenticated
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to create exchange cylinders",
          type: "error"
        })
        return
      }

      // Validate token format (more flexible)
      if (!token.startsWith('eyJ') && !token.startsWith('demo')) {
        toast({
          title: "Authentication Error",
          description: "Invalid authentication token. Please log in again.",
          type: "error"
        })
        return
      }

      console.log('Authentication token found')
      
      // Prepare images array
      let imagesArray: string[] = [];
      if (formData.images && formData.images.length > 0) {
        imagesArray = formData.images;
      } else if (formData.image) {
        imagesArray = [formData.image];
      }

      // Ensure we have at least one image (use placeholder if none provided)
      if (imagesArray.length === 0) {
        imagesArray = ["/images/placeholder.jpg"];
        console.log('No images provided, using placeholder');
      }

      // Make sure image and images are consistent and sanitize input
      const requestData = {
        name: sanitizeInput(formData.name.trim()),
        slug: sanitizeInput(formData.slug.trim()),
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || Number(formData.price),
        image: imagesArray[0],
        images: imagesArray,
        description: sanitizeHtml(formData.description.trim()),
        capacity: Number(formData.capacity),
        material: sanitizeInput(formData.material.trim()),
        weight: Number(formData.weight) || 10,
        brand: sanitizeInput(formData.brand || "drinkmate"),
        exchangeType: formData.exchangeType,
        estimatedTime: formData.estimatedTime || "Same Day",
        
        // Default values for required fields
        serviceLevel: 'standard',
        status: 'active',
        isAvailable: Boolean(formData.inStock),
        stock: 100,
        minStock: 10,
        exchangeFee: 0,
        deliveryFee: 0,
        pickupFee: 0,
        discount: 0,
        exchangeRadius: 50,
        pickupRequired: false,
        deliveryAvailable: true,
        serviceAreas: [],
        operatingHours: {
          monday: { start: "08:00", end: "18:00", closed: false },
          tuesday: { start: "08:00", end: "18:00", closed: false },
          wednesday: { start: "08:00", end: "18:00", closed: false },
          thursday: { start: "08:00", end: "18:00", closed: false },
          friday: { start: "08:00", end: "18:00", closed: false },
          saturday: { start: "08:00", end: "18:00", closed: false },
          sunday: { start: "08:00", end: "18:00", closed: false }
        },
        emergencyService: false,
        isBestSeller: false,
        isFeatured: false,
        isNewProduct: false,
        isEcoFriendly: false,
        averageRating: 0,
        totalReviews: 0,
        totalExchanges: 0
      };
      
      // Log what we're about to send
      console.log('Preparing to save cylinder with images:', {
        image: requestData.image,
        imagesCount: requestData.images.length,
        images: requestData.images
      });
      
      // Additional validation
      console.log('Form validation check:', {
        hasName: !!requestData.name,
        hasSlug: !!requestData.slug,
        hasPrice: requestData.price > 0,
        hasCapacity: requestData.capacity > 0,
        hasDescription: !!requestData.description,
        hasMaterial: !!requestData.material,
        hasImage: !!requestData.image,
        hasImages: requestData.images.length > 0
      });
      
      if (isCreating) {
        // Create new exchange cylinder
        console.log('Creating cylinder with data:', requestData);
        
        const createResult = await exchangeCylinderAPI.createExchangeCylinder(requestData);
        console.log('Create API result:', createResult);
        
        if (createResult.success) {
          toast({
            title: "Success",
            description: "Exchange cylinder created successfully"
          });
          loadCylinders(); // Reload data from API
        } else {
          console.error('Create failed:', createResult);
          throw new Error(createResult.message || 'Failed to create exchange cylinder');
        }
      } else if (editingCylinder) {
        // Update existing exchange cylinder
        console.log('=== UPDATE PROCESS START ===');
        console.log('Editing cylinder object:', editingCylinder);
        console.log('Editing cylinder ID:', editingCylinder._id);
        console.log('Is creating flag:', isCreating);
        console.log('Update data being sent:', requestData);
        
        const updateResult = await exchangeCylinderAPI.updateExchangeCylinder(editingCylinder._id, requestData);
        console.log('Update API result:', updateResult);
        
        if (updateResult.success) {
          console.log('Update successful, showing success toast');
          toast({
            title: "Success",
            description: "Exchange cylinder updated successfully"
          });
          loadCylinders(); // Reload data from API
        } else {
          console.error('Update failed:', updateResult);
          throw new Error(updateResult.message || 'Failed to update exchange cylinder');
        }
        console.log('=== UPDATE PROCESS END ===');
      } else {
        console.error('Neither creating nor editing - this should not happen');
        console.log('isCreating:', isCreating);
        console.log('editingCylinder:', editingCylinder);
      }
    } catch (error) {
      console.error('Error saving cylinder:', error)
      
      let errorMessage = "Failed to save exchange cylinder";
      let errorDetails = "";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || "";
      } else if (typeof error === 'object' && error !== null) {
        // Handle API error responses
        const apiError = error as any;
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
          errorDetails = `Status: ${apiError.response.status}, Data: ${JSON.stringify(apiError.response.data)}`;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
        
        // Log detailed error information
        console.error('Detailed error information:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          config: apiError.config,
          message: apiError.message
        });
      }
      
      // Show user-friendly error message
      toast({
        title: "Error",
        description: errorMessage,
        type: "error"
      })
      
      // Log detailed error for debugging
      console.error('Full error details:', errorDetails);
    } finally {
      setLoading(false)
      setEditingCylinder(null)
      setIsCreating(false)
      setIsDialogOpen(false)
    }
  }

  const handleCloseDialog = () => {
    setEditingCylinder(null)
    setIsCreating(false)
    setIsDialogOpen(false)
  }

  // Test API connection using standardized approach
  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/exchange-cylinders/cylinders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('API connection test response:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('API connection data:', data)
      
      return {
        success: true,
        status: response.status,
        data
      }
    } catch (error) {
      console.error('API connection test error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Test function to create a minimal exchange cylinder
  const testCreateCylinder = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth-token')
      setLoading(true)
      
      // Check if user is authenticated
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in first",
          type: "error"
        })
        return
      }
      
      console.log('Using token:', token ? 'Present' : 'Missing')
      console.log('API endpoint URL:', `${window.location.origin}/api/exchange-cylinders/cylinders`)
      console.log('Token format check:', token.substring(0, 10) + '...')
      
      // Test API connection first
      const connectionTest = await testApiConnection()
      console.log('API connection test result:', connectionTest)
      
      if (!connectionTest.success) {
        toast({
          title: "API Connection Error",
          description: `API connection test failed: ${connectionTest.error || 'Unknown error'}`,
          type: "error"
        })
        setLoading(false)
        return
      }

      const testData = {
        name: "Test Cylinder " + new Date().toISOString().substring(0, 19),
        slug: "test-cylinder-" + Date.now(),
        price: 50,
        originalPrice: 60,
        description: "Test description",
        capacity: 60,
        material: "steel",
        exchangeType: "instant",
        estimatedTime: "Same Day",
        image: "/images/placeholder.jpg",
        images: ["/images/placeholder.jpg"],
        weight: 10,
        brand: "drinkmate",
        serviceLevel: "standard",
        status: "active",
        isAvailable: true,
        stock: 100,
        minStock: 10,
        exchangeFee: 0,
        deliveryFee: 0,
        pickupFee: 0,
        discount: 0,
        exchangeRadius: 50,
        pickupRequired: false,
        deliveryAvailable: true,
        serviceAreas: [],
        operatingHours: {
          monday: { start: "08:00", end: "18:00", closed: false },
          tuesday: { start: "08:00", end: "18:00", closed: false },
          wednesday: { start: "08:00", end: "18:00", closed: false },
          thursday: { start: "08:00", end: "18:00", closed: false },
          friday: { start: "08:00", end: "18:00", closed: false },
          saturday: { start: "08:00", end: "18:00", closed: false },
          sunday: { start: "08:00", end: "18:00", closed: false }
        },
        emergencyService: false,
        isBestSeller: false,
        isFeatured: false,
        isNewProduct: false,
        isEcoFriendly: false,
        averageRating: 0,
        totalReviews: 0,
        totalExchanges: 0
      }

      console.log('Testing with minimal data:', testData)

      // Use our API method for consistency
      const result = await exchangeCylinderAPI.createExchangeCylinder(testData)
      console.log('Test creation result:', result)

      if (result.success) {
        toast({
          title: "Test Success",
          description: "Test cylinder created successfully"
        })
        loadCylinders()
      } else {
        toast({
          title: "Test Failed",
          description: result.message || "Failed to create test cylinder",
          type: "error"
        })
      }
    } catch (error) {
      console.error('Test error:', error)
      toast({
        title: "Test Error",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error"
      })
    }
  }

  const handleImagesChange = (images: string[]) => {
    console.log('Images changed in CloudinaryImageUpload:', images);
    setFormData(prev => {
      const updated = {
        ...prev,
        images: images,
        // Set the main image to the first image if available
        image: images.length > 0 ? images[0] : prev.image
      };
      console.log('Updated form data with new images:', updated);
      return updated;
    });
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this exchange cylinder?")) {
      try {
        setLoading(true)
        
        const token = localStorage.getItem('token') || localStorage.getItem('auth-token')
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in to delete exchange cylinders",
            type: "error"
          })
          return
        }
        
        const deleteResult = await exchangeCylinderAPI.deleteExchangeCylinder(id)
        console.log('Delete API result:', deleteResult)
        
        if (deleteResult.success) {
          toast({
            title: "Success",
            description: "Exchange cylinder deleted successfully"
          })
          loadCylinders() // Reload data from API
        } else {
          throw new Error(deleteResult.message || 'Failed to delete exchange cylinder')
        }
      } catch (error) {
        console.error('Error deleting cylinder:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete exchange cylinder",
          type: "error"
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const getExchangeTypeIcon = (type: string) => {
    switch (type) {
      case 'instant':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'pickup':
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return <RefreshCw className="w-4 h-4 text-cyan-600" />
    }
  }

  const getExchangeTypeBadge = (type: string) => {
    switch (type) {
      case 'instant':
        return <Badge variant="default" className="bg-green-100 text-green-800">Instant</Badge>
      case 'scheduled':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case 'pickup':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Pickup</Badge>
      default:
        return <Badge variant="outline">Exchange</Badge>
    }
  }

  // Show loading while authenticating
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Authenticating...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Redirect if not authenticated (this shouldn't show due to useEffect redirect)
  if (!isAuthenticated || !user || !user.isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!mounted || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Loading exchange cylinders...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exchange Cylinders Management</h1>
            <p className="text-gray-600 mt-1">Manage CO2 cylinder exchange services and pricing</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={loadCylinders} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Exchange Cylinder
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>{filteredCylinders.length} Exchange Services</span>
            </div>
          </div>
          
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search exchange cylinders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Exchange Cylinder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {isCreating ? "Create New Exchange Cylinder" : "Edit Exchange Cylinder"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., 60L CO2 Cylinder Exchange"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="e.g., 60l-co2-cylinder-exchange"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (SAR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    placeholder="45"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price (SAR)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: Number(e.target.value)})}
                    placeholder="60"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity (L) *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                    placeholder="60"
                  />
                </div>
                <div>
                  <Label htmlFor="material">Material *</Label>
                  <Select value={formData.material} onValueChange={(value) => setFormData({...formData, material: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steel">Steel</SelectItem>
                      <SelectItem value="aluminum">Aluminum</SelectItem>
                      <SelectItem value="composite">Composite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                    placeholder="10"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand *</Label>
                  <Select value={formData.brand} onValueChange={(value) => setFormData({...formData, brand: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drinkmate">DrinkMate</SelectItem>
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
                <div>
                  <Label htmlFor="exchangeType">Exchange Type</Label>
                  <Select value={formData.exchangeType} onValueChange={(value: any) => setFormData({...formData, exchangeType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant Exchange</SelectItem>
                      <SelectItem value="scheduled">Scheduled Exchange</SelectItem>
                      <SelectItem value="pickup">Pickup Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedTime">Estimated Time</Label>
                  <Input
                    id="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                    placeholder="Same Day"
                  />
                </div>
                <div className="md:col-span-2">
                  <CloudinaryImageUpload
                    onImagesChange={handleImagesChange}
                    currentImages={formData.images}
                    maxImages={1}
                    disabled={false}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock || false}
                    onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                    className="rounded"
                    aria-label="In Stock"
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the exchange service..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  {isCreating ? "Create" : "Update"}
                </Button>
                <Button variant="outline" onClick={handleCloseDialog}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Exchange Cylinders List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Exchange Services</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>{filteredCylinders.length} services found</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCylinders.map((cylinder) => (
              <Card key={cylinder._id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-cyan-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="w-4 h-4 text-cyan-600" />
                        {cylinder.name}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-medium">{cylinder.capacity}L</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm">{cylinder.material}</span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cylinder)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cylinder._id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-2xl font-bold text-gray-900">
                          <SaudiRiyal amount={cylinder.price} size="lg" />
                        </span>
                      </div>
                      {cylinder.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          <SaudiRiyal amount={cylinder.originalPrice} size="sm" />
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getExchangeTypeIcon(cylinder.exchangeType)}
                      {getExchangeTypeBadge(cylinder.exchangeType)}
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {cylinder.estimatedTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(cylinder.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({cylinder.reviewCount} reviews)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {cylinder.badges?.map((badge, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {cylinder.description}
                    </p>

                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className={`font-medium flex items-center gap-1 ${cylinder.inStock ? "text-green-600" : "text-red-600"}`}>
                        <div className={`w-2 h-2 rounded-full ${cylinder.inStock ? "bg-green-500" : "bg-red-500"}`}></div>
                        {cylinder.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(cylinder.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredCylinders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exchange cylinders found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterType !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first exchange cylinder"
                }
              </p>
              {!searchQuery && filterType === "all" && (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exchange Cylinder
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </AdminLayout>
  )
}
