"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { getAuthToken } from "@/lib/auth-context"
import { SafeImage } from "@/components/ui/safe-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import CloudinaryImageUpload from "@/components/ui/cloudinary-image-upload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  Loader2
} from "lucide-react"

interface ProductFormProps {
  product?: any
  isBundle?: boolean
  onSubmit: (data: any) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function ProductForm({
  product,
  isBundle = false,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ProductFormProps) {
  const isEditing = !!product

  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || "",
    subcategory: product?.subcategory || "",
    price: product?.price || "",
    originalPrice: product?.originalPrice || "",
    stock: product?.stock || "",
    shortDescription: product?.shortDescription || "",
    fullDescription: product?.fullDescription || "",
    sku: product?.sku || "",
    images: product?.images ? (Array.isArray(product.images) ? 
      product.images.map((img: any) => {
        if (typeof img === 'string') return img
        if (img && typeof img === 'object') {
          return img.url || img._id || ''
        }
        return ''
      }).filter((url: string) => url && url.trim() !== '') : 
      []) : [],
    colors: product?.colors || [],
    isBestSeller: product?.isBestSeller || false,
    isNew: product?.isNew || false,
    isFeatured: product?.isFeatured || false,
    weight: product?.weight || "",
    dimensions: product?.dimensions || "",
    // Bundle specific fields
    products: product?.products || [],
    bundleDiscount: product?.bundleDiscount || "",
  })

  const [uploadedImages, setUploadedImages] = useState<string[]>(
    product?.images ? (Array.isArray(product.images) ? 
      product.images.map((img: any) => {
        if (typeof img === 'string') return img
        if (img && typeof img === 'object') {
          return img.url || img._id || ''
        }
        return ''
      }).filter((url: string) => url && url.trim() !== '') : 
      []) : []
  )
  const [newColor, setNewColor] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [hasAttemptedCategoryCreation, setHasAttemptedCategoryCreation] = useState(false)
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Set first category as default when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({
        ...prev,
        category: categories[0]._id
      }))
    }
  }, [categories, formData.category])

  // Initialize form data when product prop changes (for editing)
  useEffect(() => {
    if (product) {
      // Convert image objects to strings for the form
      const imageUrls = product.images ? product.images.map((img: any) => {
        if (typeof img === 'string') return img
        if (img && typeof img === 'object') {
          return img.url || img._id || ''
        }
        return ''
      }).filter((url: string) => url && url.trim() !== '') : []
      
      setFormData({
        name: product.name || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        price: product.price || "",
        originalPrice: product.originalPrice || "",
        stock: product.stock || "",
        shortDescription: product.shortDescription || "",
        fullDescription: product.fullDescription || "",
        sku: product.sku || "",
        images: imageUrls,
        colors: product.colors || [],
        isBestSeller: product.isBestSeller || false,
        isNew: product.isNew || false,
        isFeatured: product.isFeatured || false,
        weight: product.weight || "",
        dimensions: product.dimensions || "",
        products: product.products || [],
        bundleDiscount: product.bundleDiscount || "",
      })
      
      // Initialize uploadedImages for editing mode
      if (imageUrls.length > 0) {
        setUploadedImages(imageUrls)
      }
    }
  }, [product])

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      console.log('🔍 ProductForm: Fetching categories...')
      const response = await adminAPI.getCategories()
      console.log('📡 ProductForm: API Response:', response)
      
      if (response.success) {
        console.log('✅ ProductForm: Categories fetched successfully:', response.categories)
        setCategories(response.categories || [])
        
        // If no categories exist and we haven't tried to create them yet, create default ones
        if (response.categories && response.categories.length === 0 && !hasAttemptedCategoryCreation) {
          console.log('📝 No categories found, creating default ones...')
          setHasAttemptedCategoryCreation(true)
          await createDefaultCategories()
        }
      } else {
        console.error('❌ ProductForm: Failed to fetch categories:', response)
      }
    } catch (error) {
      console.error('💥 ProductForm: Error fetching categories:', error)
    }
  }

  // Create default categories if none exist
  const createDefaultCategories = async (forceReset = false) => {
    try {
      console.log(`🚀 ProductForm: Creating default categories${forceReset ? ' (force reset)' : ''}...`)
      
      // Get auth token
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        console.error('No auth token found')
        return
      }
      
      const url = forceReset 
        ? 'http://localhost:3000/api/admin/create-default-categories?forceReset=true'
        : 'http://localhost:3000/api/admin/create-default-categories';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      console.log('📡 ProductForm: Create categories response:', data)
      
      if (data.success) {
        // Refresh categories after creation
        setHasAttemptedCategoryCreation(false) // Reset flag for future use
        await fetchCategories()
      } else if (response.status === 400 && data.message === 'Categories already exist') {
        // Categories already exist, this is not an error - just refresh to get them
        console.log('ℹ️ Categories already exist, refreshing...')
        setHasAttemptedCategoryCreation(false) // Reset flag since we know categories exist
        await fetchCategories()
      } else {
        console.error('API Error:', data)
        // Don't show error to user for "already exist" case
        if (response.status !== 400 || data.message !== 'Categories already exist') {
          console.error('Unexpected error creating categories:', data)
        }
        // Reset flag on error so we can try again
        setHasAttemptedCategoryCreation(false)
      }
    } catch (error) {
      console.error('💥 ProductForm: Error creating default categories:', error)
      // Reset flag on exception so we can try again
      setHasAttemptedCategoryCreation(false)
    }
  }

  // Get subcategories for selected category
  const getSubcategoriesForCategory = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category?.subcategories || []
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }



  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData({
        ...formData,
        colors: [...formData.colors, newColor]
      })
      setNewColor("")
    }
  }

  const removeColor = (index: number) => {
    const newColors = [...formData.colors]
    newColors.splice(index, 1)
    setFormData({
      ...formData,
      colors: newColors
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Generate SKU if not provided
    let finalFormData = { ...formData }
    if (!finalFormData.sku.trim()) {
      const timestamp = Date.now().toString().slice(-6)
      const nameSlug = finalFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4)
      finalFormData.sku = `${nameSlug}-${timestamp}`
    }
    
    // Synchronize images from uploadedImages to formData.images
    finalFormData.images = [...uploadedImages]
    
    // Clean up images array - remove any undefined, null, or empty values
    if (finalFormData.images && Array.isArray(finalFormData.images)) {
      finalFormData.images = finalFormData.images.filter((img: any) => {
        if (typeof img === 'string') return img && img.trim() !== ''
        if (img && typeof img === 'object') return img.url && img.url.trim() !== ''
        return false
      })
    } else {
      finalFormData.images = []
    }
    
            console.log('Original form data:', formData)
        console.log('Final form data with SKU:', finalFormData)
        console.log('Uploaded images:', uploadedImages)
        console.log('Form data images before sync:', formData.images)
        console.log('Images array after sync:', finalFormData.images)
        console.log('Images array type:', typeof finalFormData.images)
        console.log('Images array length:', finalFormData.images?.length)
        if (finalFormData.images && finalFormData.images.length > 0) {
          finalFormData.images.forEach((img: any, index: number) => {
            console.log(`Image ${index}:`, { value: img, type: typeof img, isString: typeof img === 'string', isObject: typeof img === 'object' })
          })
        }
        
        onSubmit(finalFormData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {isEditing ? `Edit ${isBundle ? 'Bundle' : 'Product'}` : `Add New ${isBundle ? 'Bundle' : 'Product'}`}
          </h1>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
                         <Button 
               type="submit" 
               className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
               disabled={isSubmitting}
             >
               {isSubmitting ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Saving...
                 </>
               ) : (
                 <>
                   <Save className="mr-2 h-4 w-4" />
                   Save {isBundle ? 'Bundle' : 'Product'}
                 </>
               )}
             </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Images</TabsTrigger>
            {isBundle && <TabsTrigger value="bundle">Bundle Items</TabsTrigger>}
            {!isBundle && <TabsTrigger value="variants">Variants</TabsTrigger>}
          </TabsList>
          
          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.category && (
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select 
                      value={formData.subcategory} 
                      onValueChange={(value) => handleSelectChange("subcategory", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSubcategoriesForCategory(formData.category).map((subcategory: any) => (
                          <SelectItem key={subcategory._id} value={subcategory._id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (﷼)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (﷼)</Label>
                    <Input
                      id="originalPrice"
                      name="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isBestSeller" 
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, isBestSeller: checked === true})
                      }
                    />
                    <Label htmlFor="isBestSeller">Best Seller</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isNew" 
                      name="isNew"
                      checked={formData.isNew}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, isNew: checked === true})
                      }
                    />
                    <Label htmlFor="isNew">New Product</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isFeatured" 
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, isFeatured: checked === true})
                      }
                    />
                    <Label htmlFor="isFeatured">Featured</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Full Description</Label>
                  <Textarea
                    id="fullDescription"
                    name="fullDescription"
                    value={formData.fullDescription}
                    onChange={handleChange}
                    rows={6}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (g)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions (cm)</Label>
                    <Input
                      id="dimensions"
                      name="dimensions"
                      placeholder="L x W x H"
                      value={formData.dimensions}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {isBundle && (
                  <div className="space-y-2">
                    <Label htmlFor="bundleDiscount">Bundle Discount (%)</Label>
                    <Input
                      id="bundleDiscount"
                      name="bundleDiscount"
                      type="number"
                      value={formData.bundleDiscount}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Images Tab */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <CloudinaryImageUpload
                  onImagesChange={(images) => {
                    setFormData(prev => ({ ...prev, images }))
                    setUploadedImages(images)
                  }}
                  currentImages={formData.images}
                  maxImages={5}
                  disabled={isSubmitting}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Variants Tab */}
          <TabsContent value="variants">
            <Card>
              <CardHeader>
                <CardTitle>Color Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add color (e.g., Red, Blue)"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={addColor}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  
                  {formData.colors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                                             {formData.colors.map((color: string, index: number) => (
                        <div 
                          key={index} 
                          className="flex items-center bg-gray-100 rounded-full pl-3 pr-2 py-1"
                        >
                          <span className="text-sm">{color}</span>
                          <button
                            type="button"
                            className="ml-2 text-gray-500 hover:text-red-500"
                            onClick={() => removeColor(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No colors added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Bundle Items Tab */}
          {isBundle && (
            <TabsContent value="bundle">
              <Card>
                <CardHeader>
                  <CardTitle>Bundle Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-4">
                    Select products to include in this bundle
                  </p>
                  
                  {/* This would be a product selector in a real application */}
                  <div className="space-y-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full border-dashed"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Products to Bundle
                    </Button>
                    
                    {formData.products.length > 0 ? (
                      <div className="space-y-2">
                                                 {formData.products.map((bundleProduct: any, index: number) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between border rounded-md p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-md"></div>
                              <div>
                                <p className="font-medium">{bundleProduct.name}</p>
                                <p className="text-sm text-gray-500">﷼{bundleProduct.price}</p>
                              </div>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-md">
                        <p className="text-gray-500">No products added to this bundle yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </form>
  )
}
