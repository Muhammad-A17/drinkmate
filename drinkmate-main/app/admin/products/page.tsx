"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
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
import { adminAPI } from "@/lib/api"
import { sanitizeInput, sanitizeHtml, validateProductName, validatePrice, validateStock, validateSKU, validateDescription } from "@/lib/protected-api"
import { toast } from "sonner"
import { AdminErrorBoundary } from "@/lib/admin-error-handler"
import { useAdminErrorHandler, useAsyncOperation, useFormErrorHandler } from "@/hooks/use-admin-error-handler"

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
  dimensions: string | { length: number; width: number; height: number; unit: string }
}

export default function ProductsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  // Error handling
  const errorHandler = useAdminErrorHandler({
    context: 'ProductsPage',
    defaultOptions: { category: 'server' }
  })
  
  const formErrorHandler = useFormErrorHandler('ProductForm', {
    onValidationError: (errors) => {
      console.error('Validation errors:', errors)
    },
    onSubmitError: (error) => {
      console.error('Submit error:', error)
    }
  })
  
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

  // Authentication check
  useEffect(() => {
    // Wait for authentication to complete
    if (authLoading) return
    
    // Check if user is authenticated and is admin
    if (!isAuthenticated || !user || !user.isAdmin) {
      console.log('User not authenticated or not admin:', { user, isAuthenticated, isAdmin: user?.isAdmin })
      router.push('/admin/login')
      return
    }
  }, [user, isAuthenticated, authLoading, router])

  // Helper function to create category if it doesn't exist
  const createCategoryIfNotExists = async (categoryName: string): Promise<string> => {
    try {
      const categoryData = {
        name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
        slug: categoryName.toLowerCase(),
        description: `${categoryName} products`,
        image: `/images/${categoryName}.png`
      }
      
      // Create category using adminAPI
      const response = await adminAPI.createCategory(categoryData)
      
      if (response.success && response.category) {
        console.log('Created category:', response.category)
        return response.category._id
      } else {
        console.error('Failed to create category:', response.message)
        throw new Error(response.message || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories()
      if (response.success) {
        setCategories(response.categories || [])
        // Create a mapping of category ID to name
        const map: {[key: string]: string} = {}
        response.categories?.forEach((cat: any) => {
          map[cat._id] = cat.name
        })
        setCategoryMap(map)
        // Category map created successfully
      } else {
        errorHandler.handleError(
          new Error(response.message || 'Failed to fetch categories'),
          { category: 'server', retryable: true }
        )
      }
    } catch (error) {
      errorHandler.handleError(error, { 
        category: 'network', 
        retryable: true 
      })
    }
  }

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      errorHandler.clearError()
      
      const response = await adminAPI.getProducts({ limit: 100 })
      if (response.success) {
        setProducts(response.products || [])
      } else {
        errorHandler.handleError(
          new Error(response.message || 'Failed to fetch products'),
          { category: 'server', retryable: true }
        )
      }
    } catch (error) {
      errorHandler.handleError(error, { 
        category: 'network', 
        retryable: true 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create new product
  const handleCreateProduct = async (productData: ProductFormData) => {
    return formErrorHandler.handleSubmit(async () => {
      // Validate input data
      const validationErrors: Record<string, string> = {}
      
      const nameValidation = validateProductName(productData.name)
      if (!nameValidation.valid && nameValidation.error) {
        validationErrors.name = nameValidation.error
      }

      const priceValidation = validatePrice(productData.price)
      if (!priceValidation.valid && priceValidation.error) {
        validationErrors.price = priceValidation.error
      }

      const stockValidation = validateStock(productData.stock)
      if (!stockValidation.valid && stockValidation.error) {
        validationErrors.stock = stockValidation.error
      }

      if (productData.sku) {
        const skuValidation = validateSKU(productData.sku)
        if (!skuValidation.valid && skuValidation.error) {
          validationErrors.sku = skuValidation.error
        }
      }

      if (productData.fullDescription) {
        const descValidation = validateDescription(productData.fullDescription)
        if (!descValidation.valid && descValidation.error) {
          validationErrors.fullDescription = descValidation.error
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          formErrorHandler.setFieldError(field, message)
        })
        throw new Error('Validation failed')
      }
      
      // Prepare the product data for the API with proper sanitization
      const productPayload = {
        name: sanitizeInput(productData.name),
        slug: sanitizeInput(productData.name.toLowerCase().replace(/\s+/g, '-')),
        description: sanitizeHtml(productData.fullDescription || productData.shortDescription || productData.name), // Backend expects 'description'
        shortDescription: sanitizeInput(productData.shortDescription), // Add short description
        fullDescription: sanitizeHtml(productData.fullDescription), // Add full description
        price: parseFloat(productData.price),
        originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : undefined,
        stock: parseInt(productData.stock),
        category: sanitizeInput(productData.category), // Use the category string directly
        subcategory: sanitizeInput(productData.subcategory),
        images: productData.images.map((img: string, index: number) => ({
          url: sanitizeInput(img),
          alt: sanitizeInput(productData.name),
          isPrimary: index === 0
        })),
        colors: productData.colors.map((color: string) => ({
          name: sanitizeInput(color),
          hexCode: '#000000',
          inStock: true
        })),
        bestSeller: productData.isBestSeller,
        newArrival: productData.isNewProduct,
        featured: productData.isFeatured,
        sku: sanitizeInput(productData.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
        weight: productData.weight ? {
          value: parseFloat(productData.weight),
          unit: 'g'
        } : undefined,
        dimensions: productData.dimensions ? (() => {
          if (typeof productData.dimensions === 'string') {
            const parts = productData.dimensions.split(' x ');
            if (parts.length === 3) {
              return {
                length: parseFloat(parts[0]) || 0,
                width: parseFloat(parts[1]) || 0,
                height: parseFloat(parts[2]) || 0,
                unit: 'cm'
              };
            }
          } else if (typeof productData.dimensions === 'object' && productData.dimensions !== null) {
            const dims = productData.dimensions as any;
            return {
              length: dims.length || 0,
              width: dims.width || 0,
              height: dims.height || 0,
              unit: dims.unit || 'cm'
            };
          }
          return undefined;
        })() : undefined,
        status: 'active', // Set default status
        trackInventory: true, // Enable inventory tracking
        lowStockThreshold: 10, // Set default low stock threshold
        currency: 'SAR', // Set default currency
        salesCount: 0, // Initialize sales count
        viewCount: 0, // Initialize view count
        rating: {
          average: 0,
          count: 0
        }
      }

      const response = await adminAPI.createProduct(productPayload)
      
      if (response.success) {
        // Add the new product to the local state immediately
        const newProduct = {
          ...response.product,
          _id: response.product._id || response.product.id,
          category: productData.category,
          subcategory: productData.subcategory,
          isBestSeller: productData.isBestSeller,
          isNewArrival: productData.isNewProduct,
          isFeatured: productData.isFeatured,
          weight: productPayload.weight,
          dimensions: productPayload.dimensions,
          colors: productData.colors.map((color: string) => ({ name: color, hexCode: '#000000' }))
        }
        setProducts(prevProducts => [newProduct, ...prevProducts])
        
        toast.success("Product created successfully")
        setIsAddProductOpen(false)
        formErrorHandler.clearAllValidationErrors()
      } else {
        throw new Error(response.message || 'Failed to create product')
      }
    })
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
        shortDescription: productData.shortDescription, // Add short description
        fullDescription: productData.fullDescription, // Add full description
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
          hexCode: '#000000',
          inStock: true
        })),
        bestSeller: productData.isBestSeller,
        newArrival: productData.isNewProduct,
        featured: productData.isFeatured,
        sku: productData.sku,
        weight: productData.weight ? {
          value: parseFloat(productData.weight),
          unit: 'g'
        } : undefined,
        dimensions: productData.dimensions ? (() => {
          if (typeof productData.dimensions === 'string') {
            const parts = productData.dimensions.split(' x ');
            if (parts.length === 3) {
              return {
                length: parseFloat(parts[0]) || 0,
                width: parseFloat(parts[1]) || 0,
                height: parseFloat(parts[2]) || 0,
                unit: 'cm'
              };
            }
          } else if (typeof productData.dimensions === 'object' && productData.dimensions !== null) {
            const dims = productData.dimensions as any;
            return {
              length: dims.length || 0,
              width: dims.width || 0,
              height: dims.height || 0,
              unit: dims.unit || 'cm'
            };
          }
          return undefined;
        })() : undefined
      }

      console.log('Sending update payload:', productPayload)
      const response = await adminAPI.updateProduct(editingProduct._id, productPayload)
      
      if (response.success) {
        // Update the product in the local state immediately
        const updatedProduct = {
          ...response.product,
          _id: response.product._id || response.product.id,
          category: productData.category,
          subcategory: productData.subcategory,
          isBestSeller: productData.isBestSeller,
          isNewArrival: productData.isNewProduct,
          isFeatured: productData.isFeatured,
          weight: productPayload.weight,
          dimensions: productPayload.dimensions,
          colors: productData.colors.map((color: string) => ({ name: color, hexCode: '#000000' }))
        }
        setProducts(prevProducts => 
          prevProducts.map(p => p._id === editingProduct._id ? updatedProduct : p)
        )
        
        toast.success("Product updated successfully")
        setEditingProduct(null)
      } else {
        throw new Error(response.message || 'Failed to update product')
      }
    } catch (error: any) {
      console.error('Error updating product:', error)
      toast.error(error.message || "Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      console.log('Deleting product with ID:', id)
      const response = await adminAPI.deleteProduct(id)
      
      if (response.success) {
        // Remove the product from the local state immediately
        setProducts(prevProducts => prevProducts.filter(p => p._id !== id))
        
        toast.success("Product deleted successfully")
      } else {
        throw new Error(response.message || 'Failed to delete product')
      }
    } catch (error: any) {
      console.error('Error deleting product:', error)
      toast.error(error.message || "Failed to delete product")
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

  // Authentication checks
  if (authLoading) {
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

  return (
    <AdminErrorBoundary>
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
                            {(product as any).bestSeller || product.isBestSeller ? (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                Best Seller
                              </Badge>
                            ) : null}
                            {(product as any).newArrival || product.isNewArrival ? (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                New
                              </Badge>
                            ) : null}
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
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 5;
                        
                        if (totalPages <= maxVisiblePages) {
                          // Show all pages if total is 5 or less
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(
                              <Button
                                key={`page-${i}`}
                                variant={currentPage === i ? "default" : "outline"}
                                size="icon"
                                onClick={() => paginate(i)}
                                className={currentPage === i ? "bg-[#12d6fa] hover:bg-[#0fb8d9]" : ""}
                              >
                                {i}
                              </Button>
                            );
                          }
                        } else {
                          // Complex pagination for more than 5 pages
                          const showEllipsis = totalPages > 7;
                          const startPage = Math.max(1, currentPage - 2);
                          const endPage = Math.min(totalPages, currentPage + 2);
                          
                          // Track which pages we've already added to avoid duplicates
                          const addedPages = new Set();
                          
                          // Always show first page
                          if (!addedPages.has(1)) {
                            pages.push(
                              <Button
                                key="page-1"
                                variant={currentPage === 1 ? "default" : "outline"}
                                size="icon"
                                onClick={() => paginate(1)}
                                className={currentPage === 1 ? "bg-[#12d6fa] hover:bg-[#0fb8d9]" : ""}
                              >
                                1
                              </Button>
                            );
                            addedPages.add(1);
                          }
                          
                          // Show ellipsis if needed
                          if (showEllipsis && startPage > 2) {
                            pages.push(
                              <span key="ellipsis-start" className="px-2">
                                ...
                              </span>
                            );
                          }
                          
                          // Show middle pages
                          for (let i = startPage; i <= endPage; i++) {
                            if (i !== 1 && i !== totalPages && !addedPages.has(i)) {
                              pages.push(
                                <Button
                                  key={`page-${i}`}
                                  variant={currentPage === i ? "default" : "outline"}
                                  size="icon"
                                  onClick={() => paginate(i)}
                                  className={currentPage === i ? "bg-[#12d6fa] hover:bg-[#0fb8d9]" : ""}
                                >
                                  {i}
                                </Button>
                              );
                              addedPages.add(i);
                            }
                          }
                          
                          // Show ellipsis if needed
                          if (showEllipsis && endPage < totalPages - 1) {
                            pages.push(
                              <span key="ellipsis-end" className="px-2">
                                ...
                              </span>
                            );
                          }
                          
                          // Always show last page
                          if (totalPages > 1 && !addedPages.has(totalPages)) {
                            pages.push(
                              <Button
                                key={`page-${totalPages}`}
                                variant={currentPage === totalPages ? "default" : "outline"}
                                size="icon"
                                onClick={() => paginate(totalPages)}
                                className={currentPage === totalPages ? "bg-[#12d6fa] hover:bg-[#0fb8d9]" : ""}
                              >
                                {totalPages}
                              </Button>
                            );
                            addedPages.add(totalPages);
                          }
                        }
                        
                        return pages;
                      })()}
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
                  Weight: <span className="font-medium">
                    {selectedProduct.weight 
                      ? typeof selectedProduct.weight === 'object' && selectedProduct.weight !== null
                        ? `${(selectedProduct.weight as any).value || 0} ${(selectedProduct.weight as any).unit || 'g'}`
                        : selectedProduct.weight
                      : 'N/A'
                    }
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Dimensions: <span className="font-medium">
                    {selectedProduct.dimensions 
                      ? typeof selectedProduct.dimensions === 'object' && selectedProduct.dimensions !== null
                        ? `${(selectedProduct.dimensions as any).length || 0} × ${(selectedProduct.dimensions as any).width || 0} × ${(selectedProduct.dimensions as any).height || 0} ${(selectedProduct.dimensions as any).unit || 'cm'}`
                        : selectedProduct.dimensions
                      : 'N/A'
                    }
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Colors: <span className="font-medium">
                    {selectedProduct.colors && selectedProduct.colors.length > 0 
                      ? selectedProduct.colors.map((c: any) => c.name || c.color || c).join(', ')
                      : 'N/A'
                    }
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Best Seller: <span className="font-medium">{(selectedProduct as any).bestSeller || selectedProduct.isBestSeller ? 'Yes' : 'No'}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  New Arrival: <span className="font-medium">{(selectedProduct as any).newArrival || (selectedProduct as any).isNewArrival ? 'Yes' : 'No'}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Featured: <span className="font-medium">{(selectedProduct as any).featured || selectedProduct.isFeatured ? 'Yes' : 'No'}</span>
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
    </AdminErrorBoundary>
  )
}
