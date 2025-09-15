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
import { Plus, Search, Edit, Trash2, Eye, Star, Clock, Users, Filter, Save, X, Image as ImageIcon, ChefHat } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

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
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch('/api/recipes', {
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
      const url = editingRecipe ? `/api/recipes/${editingRecipe._id}` : '/api/recipes'
      const method = editingRecipe ? 'PUT' : 'POST'
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      toast.success(editingRecipe ? 'Recipe updated successfully' : 'Recipe created successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe')
      toast.error('Failed to save recipe')
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
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`/api/recipes/${id}`, {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recipe Management</h1>
            <p className="text-gray-600 mt-1">Manage your drink recipes and content</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditingRecipe(null)
              resetForm()
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Recipe
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <ChefHat className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                  <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
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
            <CardContent className="p-4">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
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
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
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

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
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
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowForm(false)
                      setEditingRecipe(null)
                      resetForm()
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    <TabsTrigger value="media">Media & SEO</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Recipe title"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
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
                        placeholder="Recipe description"
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
                  
                  <TabsContent value="media" className="space-y-4">
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
                
                <div className="flex justify-end gap-2 pt-4 border-t">
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
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recipes List */}
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredRecipes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by creating your first recipe.'}
                </p>
                <Button
                  onClick={() => {
                    setShowForm(true)
                    setEditingRecipe(null)
                    resetForm()
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Recipe
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    {recipe.images && recipe.images.length > 0 ? (
                      <Image
                        src={recipe.images[0].url}
                        alt={recipe.images[0].alt || recipe.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {recipe.featured && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge variant={recipe.published ? "default" : "secondary"}>
                        {recipe.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{recipe.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.prepTime + recipe.cookTime}m
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {recipe.servings}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {recipe.rating.average.toFixed(1)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{recipe.category}</Badge>
                        <Badge variant="outline">{recipe.difficulty}</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="text-sm text-gray-500">
                          {recipe.views} views • {recipe.likes} likes
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(recipe)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(recipe._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
    </AdminLayout>
  )
}