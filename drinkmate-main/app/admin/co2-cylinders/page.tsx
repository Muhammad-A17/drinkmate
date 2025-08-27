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
  MoreHorizontal
} from "lucide-react"
import { toast } from "sonner"

interface CO2Cylinder {
  _id: string
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
        setCylinders(data.cylinders || [])
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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: parseFloat(formData.originalPrice),
          capacity: parseFloat(formData.capacity),
          stock: parseInt(formData.stock),
          minStock: parseInt(formData.minStock),
          features: formData.features.split(',').map(f => f.trim()).filter(Boolean)
        })
      })

      if (response.ok) {
        toast.success(editingCylinder ? 'Cylinder updated successfully' : 'Cylinder created successfully')
        setShowAddDialog(false)
        setEditingCylinder(null)
        resetForm()
        fetchCylinders()
      } else {
        toast.error('Failed to save cylinder')
      }
    } catch (error) {
      toast.error('Error saving cylinder')
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
        fetchCylinders()
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
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Cylinder
          </Button>
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
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(cylinder._id)}
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
              <Label htmlFor="image">Image URL *</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
              />
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
