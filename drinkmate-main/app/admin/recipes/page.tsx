'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getAuthToken } from '@/lib/auth-context'
import { useTranslation } from '@/lib/translation-context'
import AdminLayout from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Edit, Trash2, Eye, Star, Clock, Users, Filter, Save, X, Image as ImageIcon, ChefHat, TrendingUp, CheckCircle, BarChart3, Download, MoreHorizontal, ChevronLeft, ChevronRight, Loader2, RefreshCw, Upload, Trash } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { uploadImageWithProgress } from '@/lib/cloud-storage'

interface Recipe {
  _id: string
  title: string
  slug: string
  description: string
  category: string
  difficulty: string
  prepTime: number
  cookTime: number
  servings: number
  featured: boolean
  published: boolean
  views: number
  likes: number
  rating: {
    average: number
    count: number
  }
  images: Array<{
    url: string
    alt: string
    isPrimary: boolean
  }>
  ingredients: Array<{
    name: string
    amount: string
    unit: string
  }>
  instructions: Array<{
    step: number
    instruction: string
  }>
  tags: string[]
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
    fiber: number
  }
  createdAt: string
  updatedAt: string
}

interface RecipeFormData {
  title: string
  description: string
  category: string
  difficulty: string
  prepTime: number
  cookTime: number
  servings: number
  featured: boolean
  published: boolean
  ingredients: Array<{
    name: string
    amount: string
    unit: string
  }>
  instructions: Array<{
    step: number
    instruction: string
  }>
  tags: string[]
  images: Array<{
    url: string
    alt: string
    isPrimary: boolean
  }>
}

export default function AdminRecipesPage() {
  const { user, isAuthenticated } = useAuth()
  const { t, isRTL } = useTranslation()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([])
  const [imageUploadProgress, setImageUploadProgress] = useState<number[]>([])
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    category: 'Classic',
    difficulty: 'Easy',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    featured: false,
    published: true,
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructions: [{ step: 1, instruction: '' }],
    tags: [],
    images: []
  })

  const categories = ['Classic', 'Fruity', 'Creamy', 'Refreshing', 'Seasonal', 'Specialty']
  const difficulties = ['Easy', 'Medium', 'Hard']

  // Fetch recipes
  const fetchRecipes = async () => {
    try {
      setLoading(true)
      const token = getAuthToken() || (typeof window !== 'undefined' ? localStorage.getItem('auth-token') || localStorage.getItem('token') : null)
      const response = await fetch(`http://localhost:3000/recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }
      
      const data = await response.json()
      setRecipes(data.recipes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes')
      toast.error('Failed to fetch recipes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecipes()
    }
  }, [isAuthenticated])

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && recipe.published) ||
                         (statusFilter === 'draft' && !recipe.published)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Check authentication first
      if (!isAuthenticated || !user) {
        toast.error('Please log in to create recipes')
        return
      }

      // Clean up form data - remove empty ingredients and instructions
      const cleanedFormData = {
        ...formData,
        ingredients: formData.ingredients.filter(ing => ing.name.trim() !== ''),
        instructions: formData.instructions.filter(inst => inst.instruction.trim() !== '')
      }
      
            const url = editingRecipe ? `http://localhost:3000/recipes/${editingRecipe._id}` : `http://localhost:3000/recipes`
            const method = editingRecipe ? 'PUT' : 'POST'
      
      const token = getAuthToken() || (typeof window !== 'undefined' ? localStorage.getItem('auth-token') || localStorage.getItem('token') : null)
      
      console.log('Submitting recipe:', cleanedFormData) // Debug log
      console.log('Token found:', !!token) // Debug log
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token') // Debug log
      console.log('User authenticated:', isAuthenticated) // Debug log
      console.log('User is admin:', user?.isAdmin) // Debug log
      
      if (!token) {
        toast.error('Authentication token not found. Please log in again.')
        return
      }
      
      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanedFormData)
      }
      
      console.log('Request URL:', url) // Debug log
      console.log('Request options:', requestOptions) // Debug log
      
      const response = await fetch(url, requestOptions)
      
      console.log('Response status:', response.status) // Debug log
      console.log('Response headers:', Object.fromEntries(response.headers.entries())) // Debug log
      
      const responseData = await response.json()
      console.log('Response:', responseData) // Debug log
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save recipe')
      }
      
      await fetchRecipes()
      setShowForm(false)
      setEditingRecipe(null)
      resetForm()
      toast.success(editingRecipe ? 'Recipe updated successfully' : 'Recipe created successfully')
    } catch (err) {
      console.error('Recipe save error:', err) // Debug log
      setError(err instanceof Error ? err.message : 'Failed to save recipe')
      toast.error(err instanceof Error ? err.message : 'Failed to save recipe')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Classic',
      difficulty: 'Easy',
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      featured: false,
      published: true,
      ingredients: [{ name: '', amount: '', unit: '' }],
      instructions: [{ step: 1, instruction: '' }],
      tags: [],
      images: []
    })
  }

  // Edit recipe
  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setFormData({
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      difficulty: recipe.difficulty,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      featured: recipe.featured,
      published: recipe.published,
      ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', amount: '', unit: '' }],
      instructions: recipe.instructions.length > 0 ? recipe.instructions : [{ step: 1, instruction: '' }],
      tags: recipe.tags || [],
      images: recipe.images || []
    })
    setShowForm(true)
  }

  // Delete recipe
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return
    
    try {
      const token = getAuthToken() || (typeof window !== 'undefined' ? localStorage.getItem('auth-token') || localStorage.getItem('token') : null)
      const response = await fetch(`http://localhost:3000/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete recipe')
      }
      
      await fetchRecipes()
      toast.success('Recipe deleted successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe')
      toast.error('Failed to delete recipe')
    }
  }

  // Add ingredient
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }))
  }

  // Remove ingredient
  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  // Update ingredient
  const updateIngredient = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }))
  }

  // Add instruction
  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { step: prev.instructions.length + 1, instruction: '' }]
    }))
  }

  // Remove instruction
  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }))
  }

  // Update instruction
  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => 
        i === index ? { ...instruction, instruction: value } : instruction
      )
    }))
  }

  // Add tag
  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
    }
  }

  // Handle image upload
  const handleImageUpload = async (file: File, index: number) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    try {
      // Set uploading state
      setUploadingImages(prev => {
        const newState = [...prev]
        newState[index] = true
        return newState
      })

      setImageUploadProgress(prev => {
        const newState = [...prev]
        newState[index] = 0
        return newState
      })

      // Upload image
      const result = await uploadImageWithProgress(file, (progress) => {
        setImageUploadProgress(prev => {
          const newState = [...prev]
          newState[index] = progress
          return newState
        })
      })

      if (result.success && result.url) {
        // Add image to form data
        const newImage = {
          url: result.url,
          alt: file.name,
          isPrimary: formData.images.length === 0, // First image is primary
          publicId: result.publicId
        }

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, newImage]
        }))

        toast.success('Image uploaded successfully')
      } else {
        toast.error(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      // Clear uploading state
      setUploadingImages(prev => {
        const newState = [...prev]
        newState[index] = false
        return newState
      })
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Set primary image
  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }))
  }

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please log in to access this page.</p>
        </div>
      </AdminLayout>
    )
  }

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
                      <ChefHat className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Recipe Management
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Manage your drink recipes with advanced features and analytics
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{filteredRecipes.length}</div>
                    <div className="text-sm text-gray-500">Filtered Recipes</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#12d6fa]">{recipes.length}</div>
                    <div className="text-sm text-gray-500">Total Recipes</div>
                  </div>
                  <Button
                    onClick={() => {
                      setShowForm(true)
                      setEditingRecipe(null)
                      resetForm()
                    }}
                    className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#0fb8d9] hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Recipe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-500"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Recipes</p>
                    <p className="text-3xl font-bold text-gray-900">{recipes.length}</p>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +12% this month
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all duration-500"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Published</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {recipes.filter(r => r.published).length}
                    </p>
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {Math.round((recipes.filter(r => r.published).length / recipes.length) * 100) || 0}% of total
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 group-hover:from-yellow-500/20 group-hover:to-amber-500/20 transition-all duration-500"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Featured</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {recipes.filter(r => r.featured).length}
                    </p>
                    <div className="flex items-center text-sm text-yellow-600">
                      <Star className="h-4 w-4 mr-1" />
                      Premium content
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Views</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {recipes.reduce((sum, r) => sum + r.views, 0).toLocaleString()}
                    </p>
                    <div className="flex items-center text-sm text-purple-600">
                      <Users className="h-4 w-4 mr-1" />
                      {Math.round(recipes.reduce((sum, r) => sum + r.views, 0) / recipes.length) || 0} avg per recipe
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Premium Filters */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-lg">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="hover:bg-gray-50">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" className="hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Search Recipes</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by title, description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20 transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Difficulty</Label>
                  <Select value="all" onValueChange={() => {}}>
                    <SelectTrigger className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20">
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredRecipes.length}</span> of <span className="font-semibold text-gray-900">{recipes.length}</span> recipes
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="hover:bg-gray-50">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Recipe Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/20">
                {/* Premium Modal Header */}
                <div className="relative bg-gradient-to-r from-[#12d6fa]/10 to-blue-600/10 p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                        <ChefHat className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
                        </h2>
                        <p className="text-gray-600">
                          {editingRecipe ? 'Update your recipe details and settings' : 'Add a new delicious recipe to your collection'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowForm(false)
                        setEditingRecipe(null)
                        resetForm()
                      }}
                      className="hover:bg-gray-100 rounded-xl p-2"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <form id="recipe-form" onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-xl p-1">
                        <TabsTrigger 
                          value="basic" 
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#12d6fa]"
                        >
                          Basic Info
                        </TabsTrigger>
                        <TabsTrigger 
                          value="ingredients"
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#12d6fa]"
                        >
                          Ingredients
                        </TabsTrigger>
                        <TabsTrigger 
                          value="instructions"
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#12d6fa]"
                        >
                          Instructions
                        </TabsTrigger>
                        <TabsTrigger 
                          value="media"
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#12d6fa]"
                        >
                          Media & SEO
                        </TabsTrigger>
                      </TabsList>
                  
                      <TabsContent value="basic" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Recipe Title *</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter a delicious recipe title..."
                              className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20 transition-all duration-200"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category *</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                            >
                              <SelectTrigger className="rounded-xl border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Recipe description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map(diff => (
                              <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="prepTime">Prep Time (min)</Label>
                        <Input
                          id="prepTime"
                          type="number"
                          value={formData.prepTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cookTime">Cook Time (min)</Label>
                        <Input
                          id="cookTime"
                          type="number"
                          value={formData.cookTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="servings">Servings</Label>
                        <Input
                          id="servings"
                          type="number"
                          value={formData.servings}
                          onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                          min="1"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                        />
                        <Label htmlFor="featured">Featured Recipe</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="published"
                          checked={formData.published}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                        />
                        <Label htmlFor="published">Published</Label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ingredients" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Ingredients</h3>
                      <Button type="button" onClick={addIngredient} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Ingredient
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label>Name</Label>
                            <Input
                              value={ingredient.name}
                              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                              placeholder="Ingredient name"
                            />
                          </div>
                          <div className="w-24">
                            <Label>Amount</Label>
                            <Input
                              value={ingredient.amount}
                              onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                              placeholder="1"
                            />
                          </div>
                          <div className="w-24">
                            <Label>Unit</Label>
                            <Input
                              value={ingredient.unit}
                              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                              placeholder="cup"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeIngredient(index)}
                            disabled={formData.ingredients.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="instructions" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Instructions</h3>
                      <Button type="button" onClick={addInstruction} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Step
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="w-12 flex-shrink-0">
                            <Label>Step {instruction.step}</Label>
                            <Input
                              value={instruction.step}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                instructions: prev.instructions.map((inst, i) => 
                                  i === index ? { ...inst, step: parseInt(e.target.value) || 1 } : inst
                                )
                              }))}
                              type="number"
                              min="1"
                            />
                          </div>
                          <div className="flex-1">
                            <Label>Instruction</Label>
                            <Textarea
                              value={instruction.instruction}
                              onChange={(e) => updateInstruction(index, e.target.value)}
                              placeholder="Describe this step..."
                              rows={2}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeInstruction(index)}
                              disabled={formData.instructions.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="media" className="space-y-6">
                    {/* Images Section */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Recipe Images</h3>
                      <div className="space-y-4">
                        {/* Current Images */}
                        {formData.images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                  <Image
                                    src={image.url}
                                    alt={image.alt || `Recipe image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                  {image.isPrimary && (
                                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                                      Primary
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="flex gap-2">
                                      {!image.isPrimary && (
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => setPrimaryImage(index)}
                                          className="bg-white text-gray-700 hover:bg-gray-100"
                                        >
                                          <Star className="w-4 h-4" />
                                        </Button>
                                      )}
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => removeImage(index)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        <Trash className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload New Image */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleImageUpload(file, formData.images.length)
                              }
                            }}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-blue-600 hover:text-blue-500">
                                Click to upload
                              </span>
                              {' '}or drag and drop
                            </div>
                            <div className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 5MB
                            </div>
                          </label>
                        </div>

                        {/* Upload Progress */}
                        {uploadingImages.some(uploading => uploading) && (
                          <div className="space-y-2">
                            {uploadingImages.map((uploading, index) => (
                              uploading && (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between text-sm text-gray-600">
                                    <span>Uploading image {index + 1}...</span>
                                    <span>{imageUploadProgress[index] || 0}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${imageUploadProgress[index] || 0}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags Section */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-500"
                              aria-label={`Remove tag ${tag}`}
                              title={`Remove tag ${tag}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTag(e.currentTarget.value)
                              e.currentTarget.value = ''
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement
                            if (input?.value) {
                              addTag(input.value)
                              input.value = ''
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                    </Tabs>
                  </form>
                </div>
                
                {/* Premium Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingRecipe(null)
                      resetForm()
                    }}
                    className="px-6 py-2 rounded-xl border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    form="recipe-form"
                    className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#0fb8d9] hover:to-blue-700 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Premium Recipes List */}
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse overflow-hidden">
                    <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-200 rounded w-8"></div>
                          <div className="h-8 bg-gray-200 rounded w-8"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRecipes.length === 0 ? (
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
                <CardContent className="relative p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                    <ChefHat className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No recipes found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                      : 'Get started by creating your first delicious recipe for your customers.'}
                  </p>
                  <Button
                    onClick={() => {
                      setShowForm(true)
                      setEditingRecipe(null)
                      resetForm()
                    }}
                    className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#0fb8d9] hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Recipe
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <Card key={recipe._id} className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-0 shadow-lg">
                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {recipe.images && recipe.images.length > 0 ? (
                        <Image
                          src={recipe.images[0].url}
                          alt={recipe.images[0].alt || recipe.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <ImageIcon className="w-16 h-16" />
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Status Badges */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {recipe.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge 
                          variant={recipe.published ? "default" : "secondary"}
                          className={recipe.published 
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg" 
                            : "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg"
                          }
                        >
                          {recipe.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      
                      {/* Quick Actions on Hover */}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-white/90 hover:bg-white text-gray-900 shadow-lg"
                            onClick={() => handleEdit(recipe)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/90 hover:bg-white text-gray-900 border-white/50 shadow-lg"
                            onClick={() => handleDelete(recipe._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 line-clamp-2 group-hover:text-[#12d6fa] transition-colors duration-200">
                            {recipe.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mt-2">
                            {recipe.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#12d6fa]" />
                            <span className="font-medium">{recipe.prepTime + recipe.cookTime}m</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#12d6fa]" />
                            <span className="font-medium">{recipe.servings} servings</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{recipe.rating.average.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {recipe.category}
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {recipe.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <div className="text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">{recipe.views.toLocaleString()}</span> views • 
                            <span className="font-semibold text-gray-900 ml-1">{recipe.likes}</span> likes
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(recipe.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}