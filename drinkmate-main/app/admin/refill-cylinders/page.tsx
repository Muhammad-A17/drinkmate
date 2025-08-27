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
  RefreshCw
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
      
      // For now, using mock data since we don't have a refill cylinders API yet
      const mockCylinders: RefillCylinder[] = [
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
      
      setCylinders(mockCylinders)
    } catch (error) {
      console.error("Error fetching refill cylinders:", error)
      toast.error("Failed to fetch refill cylinders")
    } finally {
      setLoading(false)
    }
  }

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
      const cylinderData = {
        ...formData,
        refillPrice: parseFloat(formData.refillPrice),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        capacity: parseFloat(formData.capacity),
        availableForRefill: parseInt(formData.availableForRefill),
        minStock: parseInt(formData.minStock),
        features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
        isBestSeller: false,
        isFeatured: false
      }

      if (editingCylinder) {
        // Update existing cylinder
        const updatedCylinders = cylinders.map(cyl => 
          cyl._id === editingCylinder._id 
            ? { ...editingCylinder, ...cylinderData }
            : cyl
        )
        setCylinders(updatedCylinders)
        toast.success("Refill cylinder updated successfully")
      } else {
        // Add new cylinder
        const newCylinder: RefillCylinder = {
          _id: Date.now().toString(),
          ...cylinderData,
          createdAt: new Date().toISOString()
        }
        setCylinders(prev => [...prev, newCylinder])
        toast.success("Refill cylinder added successfully")
      }

      setShowAddDialog(false)
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Refill Cylinder Management</h1>
            <p className="text-muted-foreground">
              Manage CO2 cylinder refill services and pricing
            </p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Refill Service
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search cylinders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select value={filterBrand} onValueChange={setFilterBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All brands</SelectItem>
                    <SelectItem value="DrinkMate">DrinkMate</SelectItem>
                    <SelectItem value="Generic">Generic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
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
          </CardContent>
        </Card>

        {/* Refill Cylinders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Refill Cylinders ({filteredCylinders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCylinders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No refill cylinders found</p>
                <p className="text-sm text-gray-400">Add your first refill service to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Refill Price</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCylinders.map((cylinder) => (
                    <TableRow key={cylinder._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cylinder.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {cylinder.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cylinder.brand}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cylinder.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            <SaudiRiyal amount={cylinder.refillPrice} size="sm" />
                          </span>
                          {cylinder.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              <SaudiRiyal amount={cylinder.originalPrice} size="sm" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cylinder.capacity}L</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cylinder.availableForRefill > 0 ? "default" : "destructive"}>
                          {cylinder.availableForRefill > 0 ? `${cylinder.availableForRefill} available` : "Out of stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(cylinder.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(cylinder)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(cylinder._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCylinder ? "Edit Refill Cylinder" : "Add New Refill Service"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Cylinder Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Standard CO2 Refill"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g., DrinkMate"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="refillPrice">Refill Price (﷼)</Label>
                  <Input
                    id="refillPrice"
                    type="number"
                    step="0.01"
                    value={formData.refillPrice}
                    onChange={(e) => setFormData({ ...formData, refillPrice: e.target.value })}
                    placeholder="29.99"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price (﷼)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="89.99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacity (L)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    step="0.1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="60"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Select value={formData.material} onValueChange={(value) => setFormData({ ...formData, material: value })}>
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
                  <Label htmlFor="availableForRefill">Available for Refill</Label>
                  <Input
                    id="availableForRefill"
                    type="number"
                    value={formData.availableForRefill}
                    onChange={(e) => setFormData({ ...formData, availableForRefill: e.target.value })}
                    placeholder="25"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description of the refill service..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="refillInstructions">Refill Instructions</Label>
                <Textarea
                  id="refillInstructions"
                  value={formData.refillInstructions}
                  onChange={(e) => setFormData({ ...formData, refillInstructions: e.target.value })}
                  placeholder="Instructions for customers on how to get their cylinder refilled..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Quick refill, Quality tested, Safe handling"
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isBestSeller"
                  checked={formData.status === "active"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "active" : "inactive" })}
                  className="rounded"
                />
                <Label htmlFor="isBestSeller">Active</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                >
                  {editingCylinder ? "Update" : "Add"} Refill Service
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
