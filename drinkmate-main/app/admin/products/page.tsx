"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { SafeImage } from "@/components/ui/safe-image"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Eye,
  RefreshCw,
  X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ProductForm from "@/components/admin/ProductForm"
import { shopAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Define types for better type safety
interface Product {
  _id: string
  name: string
  category: string
  subcategory?: string
  price: number
  stock: number
  images: Array<{url: string, alt: string, isPrimary?: boolean}> | string[]
  shortDescription?: string
  description?: string
  sku?: string
  weight?: string
  dimensions?: string
  colors?: Array<{name: string, code: string}>
  isBestSeller?: boolean
  isNewArrival?: boolean
  isFeatured?: boolean
}

interface ProductFormData {
  name: string
  category: string
  subcategory: string
  price: string
  originalPrice: string
  stock: string
  shortDescription: string
  fullDescription: string
  sku: string
  images: string[]
  colors: string[]
  isBestSeller: boolean
  isNewProduct: boolean
  isFeatured: boolean
  weight: string
  dimensions: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [categoryMap, setCategoryMap] = useState<{[key: string]: string}>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isViewProductOpen, setIsViewProductOpen] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  // Helper function to create category if it doesn't exist
  const createCategoryIfNotExists = async (categoryName: string): Promise<string> => {
    try {
      // For now, we'll create a simple category object
      // In a real app, you'd call an API endpoint to create categories
      const categoryData = {
        name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
        slug: categoryName.toLowerCase(),
        description: `${categoryName} products`,
        image: `/images/${categoryName}.png`
      }
      
      // Since we don't have a createCategory API yet, we'll use a mock ID
      // This is a temporary solution for development
      const mockCategoryId = `mock_${categoryName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('Created mock category ID:', mockCategoryId)
      
      return mockCategoryId
    } catch (error) {
      console.error('Error creating category:', error)
      // Return a fallback ID
      return `fallback_${categoryName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await shopAPI.getCategories()
      if (response.success) {
        setCategories(response.categories || [])
        // Create a mapping of category ID to name
        const map: {[key: string]: string} = {}
        response.categories?.forEach((cat: any) => {
          map[cat._id] = cat.name
        })
        setCategoryMap(map)
        // Category map created successfully
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching categories:', error)
      }
    }
  }

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      // Fetching products...
      const response = await shopAPI.getProducts({ limit: 100 })
      if (response.success) {
        setProducts(response.products || [])
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch products:', response)
        }
        toast({
          title: "Failed to Load Products",
          description: response.message || "Unable to retrieve products from the server. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching products:', error)
      }
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create new product
  const handleCreateProduct = async (productData: ProductFormData) => {
    try {
      setIsSubmitting(true)
      
      // Prepare the product data for the API
      const productPayload = {
        name: productData.name,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
        description: productData.fullDescription || productData.shortDescription || productData.name, // Backend expects 'description'
        price: parseFloat(productData.price),
        originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : undefined,
        stock: parseInt(productData.stock),
        category: productData.category, // Use the category string directly
        subcategory: productData.subcategory,
        images: productData.images.map((img: string, index: number) => ({
          url: img,
          alt: productData.name,
          isPrimary: index === 0
        })),
        colors: productData.colors.map((color: string) => ({
          name: color,
          hexCode: '#000000' // Default color
        })),
        isBestSeller: productData.isBestSeller,
        isNewArrival: productData.isNewProduct,
        isFeatured: productData.isFeatured,
        sku: productData.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        weight: productData.weight ? parseFloat(productData.weight) : undefined,
        dimensions: productData.dimensions
      }

      const response = await shopAPI.createProduct(productPayload)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Product created successfully"
        })
        setIsAddProductOpen(false)
        fetchProducts() // Refresh the product list
      } else {
        throw new Error(response.message || 'Failed to create product')
      }
    } catch (error: any) {
      console.error('Error creating product:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update existing product
  const handleUpdateProduct = async (productData: ProductFormData) => {
    if (!editingProduct) return
    
    try {
      console.log('Updating product with data:', productData)
      setIsSubmitting(true)
      
      const productPayload = {
        name: productData.name,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
        description: productData.fullDescription || productData.shortDescription || productData.name, // Backend expects 'description'
        price: parseFloat(productData.price),
        originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : undefined,
        stock: parseInt(productData.stock),
        category: productData.category,
        subcategory: productData.subcategory,
        images: productData.images.map((img: string, index: number) => ({
          url: img,
          alt: productData.name,
          isPrimary: index === 0
        })),
        colors: productData.colors.map((color: string) => ({
          name: color,
          hexCode: '#000000'
        })),
        isBestSeller: productData.isBestSeller,
        isNewArrival: productData.isNewProduct,
        isFeatured: productData.isFeatured,
        sku: productData.sku,
        weight: productData.weight ? parseFloat(productData.weight) : undefined,
        dimensions: productData.dimensions
      }

      console.log('Sending update payload:', productPayload)
      const response = await shopAPI.updateProduct(editingProduct._id, productPayload)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Product updated successfully"
        })
        setEditingProduct(null)
        fetchProducts() // Refresh the product list
      } else {
        throw new Error(response.message || 'Failed to update product')
      }
    } catch (error: any) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      console.log('Deleting product with ID:', id)
      const response = await shopAPI.deleteProduct(id)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully"
        })
        fetchProducts() // Refresh the product list
      } else {
        throw new Error(response.message || 'Failed to delete product')
      }
    } catch (error: any) {
      console.error('Error deleting product:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      })
    }
  }

  // Filter products based on search term and category - memoized for performance
  const filteredProducts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase()
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchLower)
      const matchesCategory = categoryFilter && categoryFilter !== "all" ? product.category === categoryFilter : true
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

  // Calculate pagination - memoized for performance
  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
    return { indexOfLastItem, indexOfFirstItem, currentItems }
  }, [currentPage, itemsPerPage, filteredProducts])

  const { indexOfLastItem, indexOfFirstItem, currentItems } = paginationData
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

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
          {/* Premium Header */}
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
                        Products Management
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Manage your product catalog with advanced features and analytics
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{filteredProducts.length}</div>
                    <div className="text-sm text-gray-500">Filtered Products</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#12d6fa]">{products.length}</div>
                    <div className="text-sm text-gray-500">Total Products</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                      </DialogHeader>
                      <ProductForm 
                        onSubmit={handleCreateProduct}
                        onCancel={() => setIsAddProductOpen(false)}
                        isSubmitting={isSubmitting}
                      />
                    </DialogContent>
                  </Dialog>
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
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Search className="h-4 w-4 text-[#12d6fa]" />
                    Search Products
                  </label>
                  <div className="relative group">
                    <Input
                      placeholder="Search by name, SKU, or description..."
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
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#12d6fa]" />
                    Category Filter
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-4 focus:ring-[#12d6fa]/20 rounded-xl py-3 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-[#12d6fa]/50">
                      <SelectValue placeholder="All Categories" />
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
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Quick Actions
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setCategoryFilter("all")
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
                      onClick={() => fetchProducts()}
                      className="text-xs px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Refresh
                      </div>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#12d6fa] rounded-full"></div>
                    Results
                  </label>
                  <div className="text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    {filteredProducts.length} of {products.length} products
                    {searchTerm && ` • Filtered by "${searchTerm}"`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Products Table */}
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
                      <h2 className="text-3xl font-bold text-white">Products Catalog</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#12d6fa] rounded-full animate-pulse"></div>
                          <span className="text-gray-300">
                            {filteredProducts.length} of {products.length} products
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
                      onClick={() => fetchProducts()}
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#12d6fa]/20 to-blue-500/20 rounded-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#12d6fa]" />
                      </div>
                      <span className="text-lg font-medium text-gray-600">Loading products...</span>
                    </div>
                  </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                                                         <div className="w-10 h-10 relative bg-gray-100 rounded overflow-hidden">
                               {product.images && product.images.length > 0 ? (
                                 <SafeImage
                                   src={product.images[0]}
                                   alt={product.name}
                                   fill
                                   className="object-contain"
                                   onError={(e: any) => {
                                     console.error('Image failed to load:', e.currentTarget.src)
                                   }}
                                 />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                   No Image
                                 </div>
                               )}
                             </div>
                            <span className="line-clamp-1">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {categoryMap[product.category] || product.category}
                        </TableCell>
                        <TableCell className="text-right">
                          <SaudiRiyal amount={product.price} size="sm" />
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${product.stock < 10 ? 'text-red-500' : ''}`}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {product.isBestSeller && (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                Best Seller
                              </Badge>
                            )}
                            {product.isNewArrival && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                New
                              </Badge>
                            )}
                            {product.stock < 10 && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                                Low Stock
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('View button clicked for product:', product)
                                setSelectedProduct(product)
                                setIsViewProductOpen(true)
                              }}
                              className="h-8 px-3"
                              title="View Product"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Edit button clicked for product:', product)
                                setEditingProduct(product)
                              }}
                              className="h-8 px-3"
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Delete button clicked for product:', product)
                                if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                  handleDeleteProduct(product._id)
                                }
                              }}
                              className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20">
                        <div className="relative">
                          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                            <Package className="h-16 w-16 text-gray-400" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#12d6fa] to-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                        <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                          {searchTerm ? `No products match your search "${searchTerm}"` : "Create your first product to get started"}
                        </p>
                        {!searchTerm && (
                          <Button 
                            onClick={() => setIsAddProductOpen(true)}
                            className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Add First Product
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-500">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        // Show first page, last page, current page, and pages around current
                        let pageToShow = i + 1;
                        if (totalPages > 5) {
                          if (currentPage > 3 && i === 0) {
                            pageToShow = 1;
                          } else if (currentPage > 3 && i === 1) {
                            return (
                              <span key="ellipsis-start" className="px-2">
                                ...
                              </span>
                            );
                          } else if (currentPage > 3 && i < 4) {
                            pageToShow = currentPage + i - 2;
                          } else if (i === 4) {
                            if (currentPage + 2 >= totalPages) {
                              pageToShow = totalPages;
                            } else {
                              return (
                                <span key="ellipsis-end" className="px-2">
                                  ...
                                </span>
                              );
                            }
                          }
                        }
                        
                        if (pageToShow <= totalPages) {
                          return (
                            <Button
                              key={pageToShow}
                              variant={currentPage === pageToShow ? "default" : "outline"}
                              size="icon"
                              onClick={() => paginate(pageToShow)}
                              className={currentPage === pageToShow ? "bg-[#12d6fa] hover:bg-[#0fb8d9]" : ""}
                            >
                              {pageToShow}
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product: {editingProduct.name}</DialogTitle>
            </DialogHeader>
            <ProductForm 
              product={editingProduct}
              onSubmit={handleUpdateProduct}
              onCancel={() => setEditingProduct(null)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Product Dialog */}
      {selectedProduct && (
        <Dialog open={isViewProductOpen} onOpenChange={setIsViewProductOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Product: {selectedProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full h-48 relative bg-gray-100 rounded overflow-hidden">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <SafeImage
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    fill
                    className="object-contain"
                    onError={(e: any) => {
                      console.error('Image failed to load:', e.currentTarget.src)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Short Description</h3>
                  <p className="text-lg text-gray-800">
                    {selectedProduct.shortDescription || 'No short description available'}
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  <SaudiRiyal amount={selectedProduct.price} size="xl" />
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Stock: <span className={`font-medium ${selectedProduct.stock < 10 ? 'text-red-500' : ''}`}>{selectedProduct.stock}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Category: <span className="font-medium">{selectedProduct.category}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Subcategory: <span className="font-medium">{selectedProduct.subcategory || 'N/A'}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  SKU: <span className="font-medium">{selectedProduct.sku || 'N/A'}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Weight: <span className="font-medium">{selectedProduct.weight || 'N/A'}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Dimensions: <span className="font-medium">{selectedProduct.dimensions || 'N/A'}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Colors: <span className="font-medium">
                    {selectedProduct.colors && selectedProduct.colors.length > 0 
                      ? selectedProduct.colors.map((c: {name: string, code: string}) => c.name).join(', ')
                      : 'N/A'
                    }
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Best Seller: <span className="font-medium">{selectedProduct.isBestSeller ? 'Yes' : 'No'}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  New Arrival: <span className="font-medium">{selectedProduct.isNewArrival ? 'Yes' : 'No'}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Featured: <span className="font-medium">{selectedProduct.isFeatured ? 'Yes' : 'No'}</span>
                </p>
              </div>
            </div>
            
            {/* Full Description */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Product Description</h3>
                {selectedProduct.description && (
                  <span className="text-sm text-gray-500">
                    {selectedProduct.description.length} characters
                  </span>
                )}
              </div>
              {selectedProduct.description ? (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedProduct.description}</p>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-dashed">
                  <p className="text-gray-500 italic text-center">No detailed description available for this product.</p>
                </div>
              )}
            </div>
            
            {/* Product Images Gallery */}
            {selectedProduct.images && selectedProduct.images.length > 1 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Product Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedProduct.images.map((image, index) => (
                    <div key={index} className="w-full h-24 relative bg-gray-100 rounded overflow-hidden">
                      <SafeImage
                        src={image}
                        alt={`${selectedProduct.name} - Image ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setIsViewProductOpen(false)} className="mr-2">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  )
}
