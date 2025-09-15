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
  RefreshCw,
  BarChart3,
  Download,
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
  Activity,
  X,
  Upload,
  Save
} from "lucide-react"
import { toast } from "sonner"

interface RefillCylinder {
  _id: string
  name: string
  brand: string
  type: string
  refillPrice: number
  originalPrice?: number
  discount?: number
  capacity: number
  material: string
  availableForRefill: number
  minStock: number
  status: string
  isBestSeller: boolean
  isFeatured: boolean
  description: string
  features: string[]
  image: string
  refillInstructions: string
  createdAt: string
}

export default function RefillCylindersPage() {
  const { t } = useAdminTranslation()
  const { user } = useAuth()
  const router = useRouter()
  
  const [cylinders, setCylinders] = useState<RefillCylinder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBrand, setFilterBrand] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCylinder, setEditingCylinder] = useState<RefillCylinder | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "",
    refillPrice: "",
    originalPrice: "",
    capacity: "",
    material: "steel",
    availableForRefill: "",
    minStock: "10",
    description: "",
    features: "",
    image: "",
    refillInstructions: "",
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
    
    // User is authenticated and is admin, fetch data
    fetchCylinders()
  }, [user, router])

  const fetchCylinders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      // For now, using mock data since we need a separate refill cylinders API
      // TODO: Create /api/refill/cylinders endpoint
      const mockCylinders: RefillCylinder[] = getMockCylinders()
      setCylinders(mockCylinders)
    } catch (error) {
      console.error("Error fetching refill cylinders:", error)
      toast.error("Failed to fetch refill cylinders")
      // Fallback to mock data if API fails
      setCylinders(getMockCylinders())
    } finally {
      setLoading(false)
    }
  }

  const getMockCylinders = (): RefillCylinder[] => [
    {
      _id: "1",
      name: "Standard CO2 Refill",
      brand: "DrinkMate",
      type: "Standard",
      refillPrice: 29.99,
      originalPrice: 89.99,
      discount: 15,
      capacity: 60,
      material: "steel",
      availableForRefill: 25,
      minStock: 10,
      status: "active",
      isBestSeller: true,
      isFeatured: true,
      description: "Standard CO2 cylinder refill service for all DrinkMate machines",
      features: ["Quick refill", "Quality tested", "Safe handling"],
      image: "/images/co2-refill-standard.jpg",
      refillInstructions: "Bring your empty cylinder to any authorized refill station",
      createdAt: new Date().toISOString()
    },
    {
      _id: "2",
      name: "Premium CO2 Refill",
      brand: "DrinkMate",
      type: "Premium",
      refillPrice: 39.99,
      originalPrice: 119.99,
      discount: 20,
      capacity: 80,
      material: "aluminum",
      availableForRefill: 15,
      minStock: 5,
      status: "active",
      isBestSeller: false,
      isFeatured: true,
      description: "Premium CO2 cylinder refill with extended capacity",
      features: ["Extended capacity", "Premium quality", "Fast service"],
      image: "/images/co2-refill-premium.jpg",
      refillInstructions: "Premium refill service with extended capacity and quality guarantee",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Cylinder name is required")
      return
    }
    
    if (!formData.brand.trim()) {
      toast.error("Brand is required")
      return
    }
    
    if (!formData.refillPrice || parseFloat(formData.refillPrice) <= 0) {
      toast.error("Valid refill price is required")
      return
    }
    
    if (!formData.capacity || parseFloat(formData.capacity) <= 0) {
      toast.error("Valid capacity is required")
      return
    }
    
    if (!formData.availableForRefill || parseInt(formData.availableForRefill) < 0) {
      toast.error("Valid available for refill quantity is required")
      return
    }

    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        toast.error('No authentication token found. Please log in.')
        router.push('/login')
        return
      }

      // Transform data to RefillCylinder format for API
      const cylinderData = {
        name: formData.name,
        brand: formData.brand,
        type: formData.type,
        refillPrice: parseFloat(formData.refillPrice),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.refillPrice),
        capacity: parseFloat(formData.capacity),
        material: formData.material,
        availableForRefill: parseInt(formData.availableForRefill),
        minStock: parseInt(formData.minStock),
        status: formData.status,
        description: formData.description,
        features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
        image: formData.image,
        refillInstructions: formData.refillInstructions,
        isBestSeller: false,
        isFeatured: false
      }

      // TODO: Create separate refill API endpoints
      // For now, using mock data updates
      if (editingCylinder) {
        // Update existing cylinder in mock data
        const updatedCylinders = cylinders.map(cyl => 
          cyl._id === editingCylinder._id 
            ? { ...editingCylinder, ...cylinderData }
            : cyl
        )
        setCylinders(updatedCylinders)
        toast.success("Refill cylinder updated successfully")
      } else {
        // Add new cylinder to mock data
        const newCylinder: RefillCylinder = {
          _id: Date.now().toString(),
          ...cylinderData,
          createdAt: new Date().toISOString()
        }
        setCylinders(prev => [...prev, newCylinder])
        toast.success("Refill cylinder added successfully")
      }

      setShowAddDialog(false)
      setEditingCylinder(null)
      resetForm()
    } catch (error: any) {
      console.error("Error saving refill cylinder:", error)
      toast.error(error.message || "Failed to save refill cylinder")
    }
  }

  const handleEdit = (cylinder: RefillCylinder) => {
    setEditingCylinder(cylinder)
    setFormData({
      name: cylinder.name,
      brand: cylinder.brand,
      type: cylinder.type,
      refillPrice: cylinder.refillPrice.toString(),
      originalPrice: cylinder.originalPrice?.toString() || "",
      capacity: cylinder.capacity.toString(),
      material: cylinder.material,
      availableForRefill: cylinder.availableForRefill.toString(),
      minStock: cylinder.minStock.toString(),
      description: cylinder.description,
      features: cylinder.features.join(", "),
      image: cylinder.image,
      refillInstructions: cylinder.refillInstructions,
      status: cylinder.status
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this refill cylinder?")) return

    try {
      // TODO: Create separate refill API endpoints
      // For now, using mock data updates
      setCylinders(prev => prev.filter(cyl => cyl._id !== id))
      toast.success("Refill cylinder deleted successfully")
    } catch (error: any) {
      console.error("Error deleting refill cylinder:", error)
      toast.error(error.message || "Failed to delete refill cylinder")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      type: "",
      refillPrice: "",
      originalPrice: "",
      capacity: "",
      material: "steel",
      availableForRefill: "",
      minStock: "10",
      description: "",
      features: "",
      image: "",
      refillInstructions: "",
      status: "active"
    })
    setEditingCylinder(null)
  }

  const filteredCylinders = cylinders.filter(cylinder => {
    const matchesSearch = cylinder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cylinder.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cylinder.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = filterBrand === "all" || cylinder.brand === filterBrand
    const matchesType = filterType === "all" || cylinder.type === filterType
    const matchesStatus = filterStatus === "all" || cylinder.status === filterStatus
    return matchesSearch && matchesBrand && matchesType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#12d6fa]"></div>
            <span className="text-lg">Loading refill cylinders...</span>
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
                    <RefreshCw className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Refill Cylinder Management
                    </h1>
                    <p className="text-gray-600 text-lg mt-2">Manage CO2 cylinder refill services and pricing</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                    <Activity className="w-4 h-4 mr-1" />
                    {cylinders.length} Total Refill Services
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {cylinders.filter(c => c.status === 'active').length} Active
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Refill Service
                </Button>
                <Button 
                  onClick={fetchCylinders}
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Refill Services</p>
                  <p className="text-3xl font-bold text-gray-900">{cylinders.length}</p>
                  <p className="text-xs text-gray-500 mt-1">All refill services</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Services</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Available for Refill</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {cylinders.reduce((sum, c) => sum + c.availableForRefill, 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total cylinders ready</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <Package className="h-6 w-6 text-white" />
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
                  Showing {filteredCylinders.length} of {cylinders.length} refill services
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search refill services..."
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
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All brands</SelectItem>
                    <SelectItem value="DrinkMate">DrinkMate</SelectItem>
                    <SelectItem value="Generic">Generic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Premium Refill Cylinders Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Refill Services Inventory</h3>
                    <p className="text-sm text-gray-500">
                      {filteredCylinders.length} of {cylinders.length} refill services
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
              {filteredCylinders.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No refill services found</h3>
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
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">Service Details</TableHead>
                      <TableHead className="font-semibold text-gray-700">Brand</TableHead>
                      <TableHead className="font-semibold text-gray-700">Type</TableHead>
                      <TableHead className="font-semibold text-gray-700">Refill Price</TableHead>
                      <TableHead className="font-semibold text-gray-700">Capacity</TableHead>
                      <TableHead className="font-semibold text-gray-700">Available</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCylinders.map((cylinder) => (
                      <TableRow 
                        key={cylinder._id}
                        className="hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100"
                      >
                        <TableCell className="font-medium py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{cylinder.name}</p>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {cylinder.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {cylinder.brand}
                            </span>
                            {cylinder.isBestSeller && (
                              <Star className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {cylinder.type}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              <SaudiRiyal amount={cylinder.refillPrice} size="sm" />
                            </span>
                            {cylinder.originalPrice && cylinder.originalPrice > cylinder.refillPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                <SaudiRiyal amount={cylinder.originalPrice} size="sm" />
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            {cylinder.capacity}L
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Badge variant={cylinder.availableForRefill > 0 ? "default" : "destructive"} className="text-xs">
                              {cylinder.availableForRefill > 0 ? `${cylinder.availableForRefill} available` : "Out of stock"}
                            </Badge>
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
                              title="Edit Refill Service"
                              className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(cylinder._id)}
                              title="Delete Refill Service"
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
              )}
            </div>
          </div>

          </div>
        </div>

        {/* Premium Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {editingCylinder ? 'Edit Refill Service' : 'Add New Refill Service'}
                </DialogTitle>
                <p className="text-gray-600 mt-1">
                  {editingCylinder ? 'Update the refill service information below.' : 'Fill in the details to create a new refill service.'}
                </p>
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
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    placeholder="Enter refill service name"
                    required
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
                  <Label htmlFor="type" className="text-gray-700 font-medium">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20">
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
                  <Label htmlFor="capacity" className="text-gray-700 font-medium">Capacity (Liters) *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    step="0.1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="refillPrice" className="text-gray-700 font-medium">Price (ريال) *</Label>
                  <Input
                    id="refillPrice"
                    type="number"
                    step="0.01"
                    value={formData.refillPrice}
                    onChange={(e) => setFormData({ ...formData, refillPrice: e.target.value })}
                    className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice" className="text-gray-700 font-medium">Original Price (ريال) *</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availableForRefill" className="text-gray-700 font-medium">Current Stock *</Label>
                  <Input
                    id="availableForRefill"
                    type="number"
                    value={formData.availableForRefill}
                    onChange={(e) => setFormData({ ...formData, availableForRefill: e.target.value })}
                    className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minStock" className="text-gray-700 font-medium">Minimum Stock *</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20"
                  required
                />
              </div>

              <div>
                <Label htmlFor="features" className="text-gray-700 font-medium">Features (comma-separated)</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20"
                />
              </div>

              <div>
                <Label htmlFor="image" className="text-gray-700 font-medium">Image URL *</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20"
                  required
                />
              </div>

              <div>
                <Label htmlFor="status" className="text-gray-700 font-medium">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20">
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
                  <Save className="w-4 h-4 mr-2" />
                  {editingCylinder ? 'Update Refill Service' : 'Add Refill Service'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
        </Dialog>
    </AdminLayout>
  )
}
