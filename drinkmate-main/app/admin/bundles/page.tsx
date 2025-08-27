"use client"

import { useState, useEffect, useRef } from "react"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  DollarSign,
  Tag,
  Calendar,
  Loader2
} from "lucide-react"
import { shopAPI } from "@/lib/api"
import { toast } from "sonner"
import { adminAPI } from "@/lib/api"
import CloudinaryImageUpload from "@/components/ui/cloudinary-image-upload"

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  image?: string
  isActive: boolean
  subcategories: Subcategory[]
}

interface Subcategory {
  _id: string
  name: string
  slug: string
  description: string
  categoryId: string
  isActive: boolean
}

interface Bundle {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  bundleDiscount: number
  category: string
  subcategory: string
  items: Array<{
    product: string
    name: string
    price: number
    image?: string
  }>
  images: string[]
  isActive: boolean
  isFeatured: boolean
  stock: number
  createdAt: string
}

interface BundleFormData {
  name: string
  description: string
  price: string
  originalPrice: string
  bundleDiscount: string
  category: string
  subcategory: string
  items: Array<{
    product: string
    name: string
    price: number
  }>
  images: string[]
  isActive: boolean
  isFeatured: boolean
  stock: string
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const [viewingBundle, setViewingBundle] = useState<Bundle | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSubcategory, setSelectedSubcategory] = useState("all")


  // Flag to prevent multiple category creation attempts
  const [hasAttemptedCategoryCreation, setHasAttemptedCategoryCreation] = useState(false)

  // Categories management states
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false)
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
  const [isAddSubcategoryDialogOpen, setIsAddSubcategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState<string>("")
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false)
  const [isSubcategorySubmitting, setIsSubcategorySubmitting] = useState(false)

  const [formData, setFormData] = useState<BundleFormData>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    bundleDiscount: "",
    category: "",
    subcategory: "",
    items: [],
    images: [],
    isActive: true,
    isFeatured: false,
    stock: ""
  })

  // Category and subcategory form data
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  })

  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    isActive: true
  })

  // Fetch bundles on component mount
  useEffect(() => {
    fetchBundles()
    fetchCategories()
  }, [])

  // Auto-set category when adding subcategory from categories dialog
  useEffect(() => {
    if (selectedCategoryForSubcategory && isAddSubcategoryDialogOpen && !editingSubcategory) {
      setSubcategoryFormData(prev => ({
        ...prev,
        categoryId: selectedCategoryForSubcategory
      }))
    }
  }, [selectedCategoryForSubcategory, isAddSubcategoryDialogOpen, editingSubcategory])

  // Set first category as default when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({
        ...prev,
        category: categories[0]._id
      }))
    }
  }, [categories, formData.category])

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories...')
      const response = await adminAPI.getCategories()
      console.log('📡 API Response:', response)
      
      if (response.success) {
        console.log('✅ Categories fetched successfully:', response.categories)
        setCategories(response.categories || [])
        
        // If no categories exist and we haven't tried to create them yet, create default ones
        if (response.categories && response.categories.length === 0 && !hasAttemptedCategoryCreation) {
          console.log('📝 No categories found, creating default ones...')
          setHasAttemptedCategoryCreation(true)
          await createDefaultCategories()
        }
      } else {
        console.error('❌ Failed to fetch categories:', response)
        toast.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('💥 Error fetching categories:', error)
      toast.error('Failed to fetch categories')
    }
  }

  const createDefaultCategories = async (forceReset = false) => {
    try {
      console.log(`🚀 Creating default categories${forceReset ? ' (force reset)' : ''}...`)
      
      // Get auth token
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        toast.error('Please log in first to create categories')
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
      console.log('📡 Create categories response:', data)
      
      if (data.success) {
        toast.success('Default categories created successfully!')
        // Refresh categories after creation
        setHasAttemptedCategoryCreation(false) // Reset flag for future use
        await fetchCategories()
      } else if (response.status === 400 && data.message === 'Categories already exist') {
        // Categories already exist, this is not an error - just refresh to get them
        console.log('ℹ️ Categories already exist, refreshing...')
        toast.info('Categories already exist, loading them...')
        setHasAttemptedCategoryCreation(false) // Reset flag since we know categories exist
        await fetchCategories()
      } else {
        toast.error(data.message || 'Failed to create default categories')
        console.error('API Error:', data)
        // Reset flag on error so we can try again
        setHasAttemptedCategoryCreation(false)
      }
    } catch (error) {
      console.error('💥 Error creating default categories:', error)
      toast.error('Failed to create default categories: ' + (error as any).message)
      // Reset flag on exception so we can try again
      setHasAttemptedCategoryCreation(false)
    }
  }

  const fetchBundles = async () => {
    try {
      setLoading(true)
      const response = await shopAPI.getBundles()
      if (response.success) {
        setBundles(response.bundles || [])
      } else {
        // For testing, add sample data if API fails
        setBundles([
          {
            _id: "1",
            name: "Starter Kit Bundle",
            description: "Perfect starter kit for beginners including soda maker, CO2 cylinder, and flavor pack",
            price: 399.99,
            originalPrice: 499.99,
            bundleDiscount: 20,
            category: "starter",
            subcategory: "sodamakers",
            items: [
              { product: "1", name: "Artic Black Soda Maker", price: 299.99 },
              { product: "2", name: "CO2 Cylinder", price: 19.99 },
              { product: "3", name: "Cola Flavor Pack", price: 24.99 }
            ],
            images: ["/images/starter-kit.jpg"],
            isActive: true,
            isFeatured: true,
            stock: 15,
            createdAt: new Date().toISOString()
          },
          {
            _id: "2",
            name: "Premium Flavor Collection",
            description: "Complete collection of premium Italian flavors with bonus accessories",
            price: 149.99,
            originalPrice: 199.99,
            bundleDiscount: 25,
            category: "premium",
            subcategory: "flavors",
            items: [
              { product: "4", name: "Strawberry Lemon Flavor", price: 24.99 },
              { product: "5", name: "Mojito Mocktail", price: 24.99 },
              { product: "6", name: "Premium Bottle Set", price: 49.99 }
            ],
            images: ["/images/flavor-collection.jpg"],
            isActive: true,
            isFeatured: false,
            stock: 8,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ])
      }
    } catch (error) {
      console.error("Error fetching bundles:", error)
      toast.error("Failed to fetch bundles")
      // Add sample data for testing
      setBundles([
        {
          _id: "1",
          name: "Starter Kit Bundle",
          description: "Perfect starter kit for beginners including soda maker, CO2 cylinder, and flavor pack",
          price: 399.99,
          originalPrice: 499.99,
          bundleDiscount: 20,
          category: "starter",
          subcategory: "sodamakers",
          items: [
            { product: "1", name: "Artic Black Soda Maker", price: 299.99 },
            { product: "2", name: "CO2 Cylinder", price: 19.99 },
            { product: "3", name: "Cola Flavor Pack", price: 24.99 }
          ],
          images: ["/images/starter-kit.jpg"],
          isActive: true,
          isFeatured: true,
          stock: 15,
          createdAt: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission started')
    console.log('Form data:', formData)
    
    // Form validation with detailed logging
    console.log('Validating form...')
    
    if (!formData.name.trim()) {
      console.log('❌ Validation failed: Bundle name is required')
      toast.error("Bundle name is required")
      return
    }
    console.log('✅ Bundle name validation passed')
    
    if (!formData.category) {
      console.log('❌ Validation failed: Category is required')
      toast.error("Category is required")
      return
    }
    console.log('✅ Category validation passed')
    
    if (!formData.subcategory) {
      console.log('❌ Validation failed: Subcategory is required')
      toast.error("Subcategory is required")
      return
    }
    console.log('✅ Subcategory validation passed')
    
    if (!formData.description.trim()) {
      console.log('❌ Validation failed: Bundle description is required')
      toast.error("Bundle description is required")
      return
    }
    console.log('✅ Description validation passed')
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      console.log('❌ Validation failed: Valid price is required')
      toast.error("Valid price is required")
      return
    }
    console.log('✅ Price validation passed')
    
    if (!formData.bundleDiscount || parseFloat(formData.bundleDiscount) < 0) {
      console.log('❌ Validation failed: Valid discount percentage is required')
      toast.error("Valid discount percentage is required")
      return
    }
    console.log('✅ Discount validation passed')
    
    if (!formData.stock || parseInt(formData.stock) <= 0) {
      console.log('❌ Validation failed: Valid stock quantity is required')
      toast.error("Valid stock quantity is required")
      return
    }
    console.log('✅ Stock validation passed')
    
    console.log('Items array:', formData.items)
    console.log('Items length:', formData.items.length)
    
    if (formData.items.length === 0) {
      console.log('❌ Validation failed: At least one bundle item is required')
      toast.error("At least one bundle item is required")
      return
    }
    console.log('✅ Items validation passed')
    
    if (!validateBundleItems()) {
      console.log('❌ Validation failed: Bundle items validation failed')
      return
    }
    console.log('✅ Bundle items validation passed')

    console.log('Form validation passed')

    setIsSubmitting(true)

    try {
      const bundleData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        bundleDiscount: parseFloat(formData.bundleDiscount),
        stock: parseInt(formData.stock)
      }

      console.log('Bundle data to send:', bundleData)

      if (editingBundle) {
        console.log('Updating existing bundle:', editingBundle._id)
        const response = await shopAPI.updateBundle(editingBundle._id, bundleData)
        console.log('Update response:', response)
        if (response.success) {
          toast.success("Bundle updated successfully")
        } else {
          throw new Error(response.message || "Failed to update bundle")
        }
      } else {
        console.log('Creating new bundle')
        console.log('Calling shopAPI.createBundle with:', bundleData)
        const response = await shopAPI.createBundle(bundleData)
        console.log('Create response:', response)
        if (response.success) {
          toast.success("Bundle created successfully")
        } else {
          throw new Error(response.message || "Failed to create bundle")
        }
      }

      setIsDialogOpen(false)
      resetForm()
      fetchBundles()
    } catch (error: any) {
      console.error("Error saving bundle:", error)
      toast.error(error.message || "Failed to save bundle")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleView = (bundle: Bundle) => {
    setViewingBundle(bundle)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (bundle: Bundle) => {
    setEditingBundle(bundle)
    setFormData({
      name: bundle.name,
      description: bundle.description,
      price: bundle.price.toString(),
      originalPrice: bundle.originalPrice?.toString() || "",
      bundleDiscount: bundle.bundleDiscount.toString(),
      category: bundle.category,
      subcategory: bundle.subcategory,
      items: bundle.items,
      images: bundle.images,
      isActive: bundle.isActive,
      isFeatured: bundle.isFeatured,
      stock: bundle.stock.toString()
    })

    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return

    try {
      const response = await shopAPI.deleteBundle(id)
      if (response.success) {
        toast.success("Bundle deleted successfully")
        fetchBundles()
      } else {
        throw new Error(response.message || "Failed to delete bundle")
      }
    } catch (error: any) {
      console.error("Error deleting bundle:", error)
      toast.error(error.message || "Failed to delete bundle")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      bundleDiscount: "",
      category: "",
      subcategory: "",
      items: [],
      images: [],
      isActive: true,
      isFeatured: false,
      stock: ""
    })
    setEditingBundle(null)

  }

  const handleAddItem = () => {
    console.log('Adding bundle item...')
    console.log('Current items before adding:', formData.items)
    
    setFormData(prev => {
      const newItems = [...prev.items, { product: "", name: "", price: 0 }]
      console.log('New items array:', newItems)
      return {
        ...prev,
        items: newItems
      }
    })
    
    console.log('Item added successfully')
  }

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    console.log(`Updating item ${index}, field: ${field}, value:`, value)
    console.log('Current items before update:', formData.items)
    
    setFormData(prev => {
      const updatedItems = prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
      console.log('Updated items array:', updatedItems)
      return {
        ...prev,
        items: updatedItems
      }
    })
  }

  const validateBundleItems = () => {
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i]
      if (!item.name.trim()) {
        toast.error(`Item ${i + 1}: Product name is required`)
        return false
      }
      if (!item.price || item.price <= 0) {
        toast.error(`Item ${i + 1}: Valid price is required`)
        return false
      }
    }
    return true
  }



  // Helper functions for categories
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category ? category.name : categoryId
  }

  const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    if (category) {
      const subcategory = category.subcategories.find(sub => sub._id === subcategoryId)
      return subcategory ? subcategory.name : subcategoryId
    }
    return subcategoryId
  }

  const getSubcategoriesForCategory = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category ? category.subcategories : []
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      subcategory: "" // Reset subcategory when category changes
    }))
  }

  // Categories management functions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryFormData.name.trim()) {
      toast.error("Category name is required")
      return
    }
    if (!categoryFormData.slug.trim()) {
      toast.error("Category slug is required")
      return
    }
    if (!categoryFormData.description.trim()) {
      toast.error("Category description is required")
      return
    }

    setIsCategorySubmitting(true)
    try {
      const newCategory: Category = {
        _id: `cat${Date.now()}`,
        name: categoryFormData.name.trim(),
        slug: categoryFormData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: categoryFormData.description.trim(),
        isActive: categoryFormData.isActive,
        subcategories: []
      }

      setCategories(prev => [...prev, newCategory])
      toast.success("Category added successfully")
      setIsAddCategoryDialogOpen(false)
      resetCategoryForm()
    } catch (error: any) {
      console.error("Error adding category:", error)
      toast.error(error.message || "Failed to add category")
    } finally {
      setIsCategorySubmitting(false)
    }
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingCategory) return
    
    if (!categoryFormData.name.trim()) {
      toast.error("Category name is required")
      return
    }
    if (!categoryFormData.slug.trim()) {
      toast.error("Category slug is required")
      return
    }
    if (!categoryFormData.description.trim()) {
      toast.error("Category description is required")
      return
    }

    setIsCategorySubmitting(true)
    try {
      const updatedCategory: Category = {
        ...editingCategory,
        name: categoryFormData.name.trim(),
        slug: categoryFormData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: categoryFormData.description.trim(),
        isActive: categoryFormData.isActive
      }

      setCategories(prev => prev.map(cat => 
        cat._id === editingCategory._id ? updatedCategory : cat
      ))
      toast.success("Category updated successfully")
      setIsAddCategoryDialogOpen(false)
      resetCategoryForm()
      setEditingCategory(null)
    } catch (error: any) {
      console.error("Error updating category:", error)
      toast.error(error.message || "Failed to update category")
    } finally {
      setIsCategorySubmitting(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This will also delete all its subcategories.")) return

    try {
      setCategories(prev => prev.filter(cat => cat._id !== categoryId))
      toast.success("Category deleted successfully")
    } catch (error: any) {
      console.error("Error deleting category:", error)
      toast.error(error.message || "Failed to delete category")
    }
  }

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subcategoryFormData.name.trim()) {
      toast.error("Subcategory name is required")
      return
    }
    if (!subcategoryFormData.slug.trim()) {
      toast.error("Subcategory slug is required")
      return
    }
    if (!subcategoryFormData.description.trim()) {
      toast.error("Subcategory description is required")
      return
    }
    if (!subcategoryFormData.categoryId) {
      toast.error("Please select a category")
      return
    }

    setIsSubcategorySubmitting(true)
    try {
      const newSubcategory: Subcategory = {
        _id: `sub${Date.now()}`,
        name: subcategoryFormData.name.trim(),
        slug: subcategoryFormData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: subcategoryFormData.description.trim(),
        categoryId: subcategoryFormData.categoryId,
        isActive: subcategoryFormData.isActive
      }

      setCategories(prev => prev.map(cat => 
        cat._id === subcategoryFormData.categoryId 
          ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
          : cat
      ))
      toast.success("Subcategory added successfully")
      setIsAddSubcategoryDialogOpen(false)
      resetSubcategoryForm()
    } catch (error: any) {
      console.error("Error adding subcategory:", error)
      toast.error(error.message || "Failed to add subcategory")
    } finally {
      setIsSubcategorySubmitting(false)
    }
  }

  const handleEditSubcategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingSubcategory) return
    
    if (!subcategoryFormData.name.trim()) {
      toast.error("Subcategory name is required")
      return
    }
    if (!subcategoryFormData.slug.trim()) {
      toast.error("Subcategory slug is required")
      return
    }
    if (!subcategoryFormData.description.trim()) {
      toast.error("Subcategory description is required")
      return
    }
    if (!subcategoryFormData.categoryId) {
      toast.error("Please select a category")
      return
    }

    setIsSubcategorySubmitting(true)
    try {
      const updatedSubcategory: Subcategory = {
        ...editingSubcategory,
        name: subcategoryFormData.name.trim(),
        slug: subcategoryFormData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: subcategoryFormData.description.trim(),
        categoryId: subcategoryFormData.categoryId,
        isActive: subcategoryFormData.isActive
      }

      setCategories(prev => prev.map(cat => ({
        ...cat,
        subcategories: cat.subcategories.map(sub => 
          sub._id === editingSubcategory._id ? updatedSubcategory : sub
        )
      })))
      toast.success("Subcategory updated successfully")
      setIsAddSubcategoryDialogOpen(false)
      resetSubcategoryForm()
      setEditingSubcategory(null)
    } catch (error: any) {
      console.error("Error updating subcategory:", error)
      toast.error(error.message || "Failed to update subcategory")
    } finally {
      setIsSubcategorySubmitting(false)
    }
  }

  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return

    try {
      setCategories(prev => prev.map(cat => 
        cat._id === categoryId 
          ? { ...cat, subcategories: cat.subcategories.filter(sub => sub._id !== subcategoryId) }
          : cat
      ))
      toast.success("Subcategory deleted successfully")
    } catch (error: any) {
      console.error("Error deleting subcategory:", error)
      toast.error(error.message || "Failed to delete subcategory")
    }
  }

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true
    })
    setEditingCategory(null)
  }

  const resetSubcategoryForm = () => {
    setSubcategoryFormData({
      name: "",
      slug: "",
      description: "",
      categoryId: "",
      isActive: true
    })
    setEditingSubcategory(null)
  }

  const openEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive
    })
    setIsAddCategoryDialogOpen(true)
  }

  const openEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory)
    setSubcategoryFormData({
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description,
      categoryId: subcategory.categoryId,
      isActive: subcategory.isActive
    })
    setIsAddSubcategoryDialogOpen(true)
  }

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  const handleCategoryNameChange = (name: string) => {
    setCategoryFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubcategoryNameChange = (name: string) => {
    setSubcategoryFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bundle.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || bundle.category === selectedCategory
    const matchesSubcategory = selectedSubcategory === "all" || bundle.subcategory === selectedSubcategory
    return matchesSearch && matchesCategory && matchesSubcategory
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading bundles...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bundle Management</h1>
            <p className="text-muted-foreground">
              Create and manage product bundles with categories and subcategories
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsCategoriesDialogOpen(true)}
            >
              <Tag className="h-4 w-4 mr-2" />
              Manage Categories
            </Button>
            <Button 
              variant="outline"
              onClick={fetchCategories}
            >
              🔄 Refresh Categories
            </Button>
                         <Button 
               variant="outline"
               onClick={() => createDefaultCategories()}
               className="bg-green-600 hover:bg-green-700 text-white"
             >
               🚀 Create Default Categories
             </Button>
             <Button 
               variant="outline"
               onClick={() => createDefaultCategories(true)}
               className="bg-red-600 hover:bg-red-700 text-white"
             >
               🔄 Force Reset & Create Defaults
             </Button>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bundle
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search bundles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={(value) => {
                  setSelectedCategory(value)
                  setSelectedSubcategory("all") // Reset subcategory when category changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select 
                  value={selectedSubcategory} 
                  onValueChange={setSelectedSubcategory}
                  disabled={selectedCategory === "all"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCategory === "all" ? "Select category first" : "All subcategories"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subcategories</SelectItem>
                    {selectedCategory !== "all" && 
                      getSubcategoriesForCategory(selectedCategory).map((subcategory) => (
                        <SelectItem key={subcategory._id} value={subcategory._id}>
                          {subcategory.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Total bundles: {bundles.length}</p>
              <p>Filtered bundles: {filteredBundles.length}</p>
              <p>Total categories: {categories.length}</p>
              <p>Search term: "{searchTerm}"</p>
              <p>Selected category: {selectedCategory}</p>
              <p>Selected subcategory: {selectedSubcategory}</p>
              <p>Dialog open: {isDialogOpen ? 'Yes' : 'No'}</p>
              <p>Editing bundle: {editingBundle ? editingBundle.name : 'None'}</p>
              <p>Viewing bundle: {viewingBundle ? viewingBundle.name : 'None'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Bundles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bundles ({filteredBundles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBundles.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No bundles found</p>
                <p className="text-sm text-gray-400">Create your first bundle to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBundles.map((bundle) => (
                    <TableRow key={bundle._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bundle.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {bundle.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getCategoryName(bundle.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getSubcategoryName(bundle.category, bundle.subcategory)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            <SaudiRiyal amount={bundle.price} size="sm" />
                          </span>
                          {bundle.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              <SaudiRiyal amount={bundle.originalPrice} size="sm" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{bundle.bundleDiscount}% OFF</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={bundle.stock > 0 ? "default" : "destructive"}>
                          {bundle.stock > 0 ? `${bundle.stock} in stock` : "Out of stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant={bundle.isActive ? "default" : "secondary"}>
                            {bundle.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {bundle.isFeatured && (
                            <Badge variant="outline">Featured</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(bundle.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(bundle)}
                            className="h-8 px-3"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(bundle)}
                            className="h-8 px-3"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(bundle._id)}
                            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
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

        {/* Add/Edit Bundle Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            resetForm()
          }
        }}>
          <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle>
                {editingBundle ? "Edit Bundle" : "Create New Bundle"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Bundle Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={handleCategoryChange}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select 
                    value={formData.subcategory} 
                    onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                    disabled={!formData.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.category ? "Select subcategory" : "Select category first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.category && getSubcategoriesForCategory(formData.category).map((subcategory) => (
                        <SelectItem key={subcategory._id} value={subcategory._id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (﷼)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (﷼)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bundleDiscount">Discount (%)</Label>
                  <Input
                    id="bundleDiscount"
                    type="number"
                    step="0.01"
                    value={formData.bundleDiscount}
                    onChange={(e) => setFormData({ ...formData, bundleDiscount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Bundle Items</Label>
                    <Badge variant="secondary">{formData.items.length} item(s)</Badge>
                  </div>
                  <Button type="button" variant="outline" onClick={handleAddItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
                
                {formData.items.length === 0 && (
                  <div className="text-center py-4 text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <p>No bundle items added yet</p>
                    <p>Click "Add Item" to add products to this bundle</p>
                  </div>
                )}
                
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-end p-4 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <Label>Product Name</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        placeholder="Product name"
                        required
                      />
                    </div>
                    <div className="w-40">
                      <Label>Price (﷼)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value))}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Image Management */}
              <CloudinaryImageUpload
                onImagesChange={(images) => {
                  setFormData(prev => ({ ...prev, images }))
                }}
                currentImages={formData.images}
                maxImages={5}
                disabled={isSubmitting}
              />

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isActive" 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, isActive: checked === true})
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isFeatured" 
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, isFeatured: checked === true})
                    }
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                >
                  {isSubmitting ? "Saving..." : editingBundle ? "Update Bundle" : "Create Bundle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Bundle Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle>View Bundle: {viewingBundle?.name}</DialogTitle>
            </DialogHeader>
            {viewingBundle && (
              <div className="space-y-6">
                {/* Bundle Images */}
                {viewingBundle.images && viewingBundle.images.length > 0 && (
                  <div className="space-y-2">
                    <Label>Bundle Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {viewingBundle.images.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Bundle image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bundle Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Bundle Name</Label>
                      <p className="text-lg font-semibold">{viewingBundle.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      <p className="text-gray-700">{viewingBundle.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Category</Label>
                      <Badge variant="secondary">{getCategoryName(viewingBundle.category)}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Subcategory</Label>
                      <Badge variant="outline">{getSubcategoryName(viewingBundle.category, viewingBundle.subcategory)}</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Price</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">
                          <SaudiRiyal amount={viewingBundle.price} size="xl" />
                        </span>
                        {viewingBundle.originalPrice && (
                          <span className="text-lg text-gray-500 line-through">
                            <SaudiRiyal amount={viewingBundle.originalPrice} size="lg" />
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Discount</Label>
                      <Badge variant="destructive" className="text-lg">
                        {viewingBundle.bundleDiscount}% OFF
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Stock</Label>
                      <Badge variant={viewingBundle.stock > 0 ? "default" : "destructive"}>
                        {viewingBundle.stock > 0 ? `${viewingBundle.stock} in stock` : "Out of stock"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Bundle Items */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Bundle Items</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewingBundle.items.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Item {index + 1}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              <SaudiRiyal amount={item.price} size="sm" />
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bundle Status */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Bundle Status</Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="view-isActive" 
                        checked={viewingBundle.isActive}
                        disabled
                      />
                      <Label htmlFor="view-isActive">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="view-isFeatured" 
                        checked={viewingBundle.isFeatured}
                        disabled
                      />
                      <Label htmlFor="view-isFeatured">Featured</Label>
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                  <p className="text-gray-700">
                    {new Date(viewingBundle.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Categories Management Dialog */}
        <Dialog open={isCategoriesDialogOpen} onOpenChange={setIsCategoriesDialogOpen}>
          <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle>Categories & Subcategories Management</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 pb-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{categories.length}</p>
                        <p className="text-sm text-gray-600">Total Categories</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">
                          {categories.reduce((total, cat) => total + cat.subcategories.length, 0)}
                        </p>
                        <p className="text-sm text-gray-600">Total Subcategories</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Checkbox className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold">
                          {categories.filter(cat => cat.isActive).length}
                        </p>
                        <p className="text-sm text-gray-600">Active Categories</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add Category Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Categories</h3>
                <Button 
                  onClick={() => setIsAddCategoryDialogOpen(true)}
                  className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>

              {/* Categories List - Scrollable */}
              <div className="space-y-4">
                {categories.map((category) => (
                  <Card key={category._id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <h4 className="text-lg font-semibold">{category.name}</h4>
                          </div>
                          <span className="text-sm text-gray-500">({category.slug})</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditCategory(category)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCategoryForSubcategory(category._id)
                              setIsAddSubcategoryDialogOpen(true)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Subcategory
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCategory(category._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600">{category.description}</p>
                    </CardHeader>
                    
                    {/* Subcategories */}
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-700">Subcategories ({category.subcategories.length})</h5>
                        {category.subcategories.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No subcategories yet</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {category.subcategories.map((subcategory) => (
                              <div key={subcategory._id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={subcategory.isActive ? "outline" : "secondary"}>
                                      {subcategory.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                    <span className="font-medium truncate">{subcategory.name}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">{subcategory.description}</p>
                                  <span className="text-xs text-gray-500">({subcategory.slug})</span>
                                </div>
                                <div className="flex gap-1 ml-2 flex-shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditSubcategory(subcategory)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteSubcategory(category._id, subcategory._id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Category Dialog */}
        <Dialog open={isAddCategoryDialogOpen} onOpenChange={(open) => {
          setIsAddCategoryDialogOpen(open)
          if (!open) {
            resetCategoryForm()
          }
        }}>
          <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={editingCategory ? handleEditCategory : handleAddCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={categoryFormData.name}
                    onChange={(e) => handleCategoryNameChange(e.target.value)}
                    placeholder="e.g., Soda Makers"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categorySlug">Category Slug</Label>
                  <Input
                    id="categorySlug"
                    value={categoryFormData.slug}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                    placeholder="e.g., soda-makers"
                    required
                  />
                  <p className="text-xs text-gray-500">URL-friendly version of the name (lowercase, hyphens instead of spaces)</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="categoryIsActive" 
                  checked={categoryFormData.isActive}
                  onCheckedChange={(checked) => 
                    setCategoryFormData({...categoryFormData, isActive: checked === true})
                  }
                />
                <Label htmlFor="categoryIsActive">Active</Label>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddCategoryDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCategorySubmitting}
                  className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                >
                  {isCategorySubmitting ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Subcategory Dialog */}
        <Dialog open={isAddSubcategoryDialogOpen} onOpenChange={(open) => {
          setIsAddSubcategoryDialogOpen(open)
          if (!open) {
            resetSubcategoryForm()
          }
        }}>
          <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle>
                {editingSubcategory ? "Edit Subcategory" : "Add New Subcategory"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={editingSubcategory ? handleEditSubcategory : handleAddSubcategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subcategoryCategory">Parent Category</Label>
                  <Select 
                    value={subcategoryFormData.categoryId} 
                    onValueChange={(value) => setSubcategoryFormData({ ...subcategoryFormData, categoryId: value })}
                    disabled={!!editingSubcategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                
                <div className="space-y-2">
                  <Label htmlFor="subcategoryName">Subcategory Name</Label>
                  <Input
                    id="subcategoryName"
                    value={subcategoryFormData.name}
                    onChange={(e) => handleSubcategoryNameChange(e.target.value)}
                    placeholder="e.g., Artic Series"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subcategorySlug">Subcategory Slug</Label>
                  <Input
                    id="subcategorySlug"
                    value={subcategoryFormData.slug}
                    onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, slug: e.target.value })}
                    placeholder="e.g., artic-series"
                    required
                  />
                  <p className="text-xs text-gray-500">URL-friendly version of the name (lowercase, hyphens instead of spaces)</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subcategoryDescription">Description</Label>
                  <Textarea
                    id="subcategoryDescription"
                    value={subcategoryFormData.description}
                    onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                    placeholder="Brief description of this subcategory"
                    rows={4}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="subcategoryIsActive" 
                  checked={subcategoryFormData.isActive}
                  onCheckedChange={(checked) => 
                    setSubcategoryFormData({...subcategoryFormData, isActive: checked === true})
                  }
                />
                <Label htmlFor="subcategoryIsActive">Active</Label>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddSubcategoryDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubcategorySubmitting}
                  className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                >
                  {isSubcategorySubmitting ? "Saving..." : editingSubcategory ? "Update Subcategory" : "Add Subcategory"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
