'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
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
import { Plus, Search, Edit, Trash2, Eye, Star, Clock, Users, Filter } from 'lucide-react'
import Image from 'next/image'

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
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    category: 'Classic',
    difficulty: 'Easy',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    featured: false,
    published: false,
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
      const response = await fetch('/api/recipes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }
      
      const data = await response.json()
      setRecipes(data.recipes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes')
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
      const url = editingRecipe ? `/api/recipes/${editingRecipe._id}` : '/api/recipes'
      const method = editingRecipe ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save recipe')
      }
      
      await fetchRecipes()
      setShowForm(false)
      setEditingRecipe(null)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe')
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
      published: false,
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
      ingredients: [{ name: '', amount: '', unit: '' }], // Simplified for demo
      instructions: [{ step: 1, instruction: '' }], // Simplified for demo
      tags: [],
      images: recipe.images
    })
    setShowForm(true)
  }

  // Delete recipe
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return
    
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete recipe')
      }
      
      await fetchRecipes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe')
    }
  }

  // Add ingredient
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }))
  }

  // Add instruction
  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { step: prev.instructions.length + 1, instruction: '' }]
    }))
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">Please log in to access the admin panel.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Recipe Management</h1>
            <p className="mt-2 text-gray-600">Manage your drink recipes and content</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                    <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {recipes.filter(r => r.published).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Featured</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {recipes.filter(r => r.featured).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {recipes.reduce((sum, r) => sum + r.views, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Recipe
              </Button>
            </div>
          </div>

          {/* Recipes List */}
          <div className="bg-white rounded-lg shadow-sm border">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading recipes...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchRecipes} className="mt-4">Retry</Button>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No recipes found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredRecipes.map((recipe) => (
                  <div key={recipe._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {recipe.images.length > 0 ? (
                            <Image
                              src={recipe.images[0].url}
                              alt={recipe.images[0].alt}
                              width={60}
                              height={60}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-sm">No Image</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {recipe.title}
                            </h3>
                            {recipe.featured && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            <Badge variant={recipe.published ? "default" : "secondary"}>
                              {recipe.published ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate mb-2">
                            {recipe.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {recipe.prepTime + recipe.cookTime}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {recipe.servings} servings
                            </span>
                            <span>{recipe.category}</span>
                            <span className="capitalize">{recipe.difficulty}</span>
                            <span>{recipe.views} views</span>
                            {recipe.rating.count > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current text-yellow-400" />
                                {recipe.rating.average.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/recipes/${recipe.slug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(recipe)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(recipe._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recipe Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
                    </h2>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowForm(false)
                        setEditingRecipe(null)
                        resetForm()
                      }}
                    >
                      ✕
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="title">Recipe Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter recipe title"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter recipe description"
                        rows={3}
                        required
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
                        <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                        <Input
                          id="prepTime"
                          type="number"
                          value={formData.prepTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cookTime">Cook Time (minutes)</Label>
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

                    <div className="flex items-center space-x-4">
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

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForm(false)
                          setEditingRecipe(null)
                          resetForm()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}