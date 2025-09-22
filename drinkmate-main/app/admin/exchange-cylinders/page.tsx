"use client"

import { useState, useEffect } from "react"
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
  createdAt: string
  updatedAt: string
}

export default function ExchangeCylindersAdmin() {
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
    material: "",
    exchangeType: "instant" as "instant" | "scheduled" | "pickup",
    estimatedTime: "",
    rating: 0,
    reviewCount: 0,
    inStock: true,
    badges: [] as string[]
  })

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data for demonstration
  useEffect(() => {
    if (!mounted) return
    const mockCylinders: ExchangeCylinder[] = [
      {
        _id: "1",
        name: "60L CO2 Cylinder Exchange",
        slug: "60l-co2-cylinder-exchange",
        price: 45,
        originalPrice: 60,
        image: "https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-60l.jpg",
        images: ["https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-60l.jpg"],
        description: "Professional 60L CO2 cylinder exchange service with instant availability",
        capacity: 60,
        material: "Steel",
        exchangeType: "instant",
        estimatedTime: "Same Day",
        rating: 4.8,
        reviewCount: 124,
        inStock: true,
        badges: ["POPULAR", "INSTANT"],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z"
      },
      {
        _id: "2",
        name: "40L CO2 Cylinder Exchange",
        slug: "40l-co2-cylinder-exchange",
        price: 35,
        originalPrice: 45,
        image: "https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-40l.jpg",
        images: ["https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-40l.jpg"],
        description: "Compact 40L CO2 cylinder exchange for smaller operations",
        capacity: 40,
        material: "Steel",
        exchangeType: "scheduled",
        estimatedTime: "1-2 Days",
        rating: 4.6,
        reviewCount: 89,
        inStock: true,
        badges: ["COMPACT"],
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-10T10:00:00Z"
      },
      {
        _id: "3",
        name: "80L CO2 Cylinder Exchange",
        slug: "80l-co2-cylinder-exchange",
        price: 65,
        originalPrice: 80,
        image: "https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-80l.jpg",
        images: ["https://res.cloudinary.com/drinkmate/image/upload/v1704067200/drinkmate/co2-cylinder-80l.jpg"],
        description: "Large capacity 80L CO2 cylinder exchange for high-volume operations",
        capacity: 80,
        material: "Steel",
        exchangeType: "pickup",
        estimatedTime: "2-3 Days",
        rating: 4.9,
        reviewCount: 67,
        inStock: true,
        badges: ["HIGH-VOLUME"],
        createdAt: "2024-01-05T10:00:00Z",
        updatedAt: "2024-01-05T10:00:00Z"
      }
    ]
    
    setCylinders(mockCylinders)
    setLoading(false)
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
    setIsCreating(true)
    setEditingCylinder(null)
    setFormData({
      name: "",
      slug: "",
      price: 0,
      originalPrice: 0,
      image: "",
      images: [],
      description: "",
      capacity: 0,
      material: "",
      exchangeType: "instant",
      estimatedTime: "",
      rating: 0,
      reviewCount: 0,
      inStock: true,
      badges: []
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (cylinder: ExchangeCylinder) => {
    setEditingCylinder(cylinder)
    setIsCreating(false)
    setFormData({
      name: cylinder.name,
      slug: cylinder.slug,
      price: cylinder.price,
      originalPrice: cylinder.originalPrice || 0,
      image: cylinder.image,
      images: cylinder.image ? [cylinder.image] : [],
      description: cylinder.description,
      capacity: cylinder.capacity,
      material: cylinder.material,
      exchangeType: cylinder.exchangeType,
      estimatedTime: cylinder.estimatedTime,
      rating: cylinder.rating,
      reviewCount: cylinder.reviewCount,
      inStock: cylinder.inStock,
      badges: cylinder.badges || []
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.slug || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (isCreating) {
      const newCylinder: ExchangeCylinder = {
        _id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setCylinders([newCylinder, ...cylinders])
      toast({
        title: "Success",
        description: "Exchange cylinder created successfully"
      })
    } else if (editingCylinder) {
      setCylinders(cylinders.map(cylinder => 
        cylinder._id === editingCylinder._id 
          ? { ...cylinder, ...formData, updatedAt: new Date().toISOString() }
          : cylinder
      ))
      toast({
        title: "Success",
        description: "Exchange cylinder updated successfully"
      })
    }

    setEditingCylinder(null)
    setIsCreating(false)
    setIsDialogOpen(false)
  }

  const handleCloseDialog = () => {
    setEditingCylinder(null)
    setIsCreating(false)
    setIsDialogOpen(false)
  }

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: images,
      image: images.length > 0 ? images[0] : "" // Use first image as main image
    }))
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this exchange cylinder?")) {
      setCylinders(cylinders.filter(cylinder => cylinder._id !== id))
      toast({
        title: "Success",
        description: "Exchange cylinder deleted successfully"
      })
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
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>{filteredCylinders.length} Exchange Services</span>
            </div>
          </div>
          
          {/* Debug info */}
          <div className="text-xs text-gray-500 p-2 bg-yellow-100 rounded">
            Debug: Total: {cylinders.length}, Filtered: {filteredCylinders.length}, Mounted: {mounted.toString()}, Loading: {loading.toString()}
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
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => setFormData({...formData, material: e.target.value})}
                    placeholder="Steel"
                  />
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
                    checked={formData.inStock}
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
