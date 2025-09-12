"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Search, 
  Plus, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Star,
  Tag,
  Utensils,
  BookOpen,
  Upload,
  Download
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface Recipe {
  _id: string
  title: string
  slug: string
  description: string
  category: string
  difficulty: string
  prepTime: number
  servings: number
  rating: number
  tags: string[]
  ingredients: string[]
  instructions: string[]
  image: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  createdAt: string
  updatedAt: string
  author: {
    _id: string
    name: string
    email: string
  }
}

interface RecipeFormData {
  title: string
  description: string
  category: string
  difficulty: string
  prepTime: number
  servings: number
  tags: string[]
  ingredients: string[]
  instructions: string[]
  image: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
}

const categories = [
  'Mocktails',
  'Fruity',
  'Citrus',
  'Berry',
  'Cola',
  'Seasonal',
  'Classic',
  'Healthy'
]

const difficulties = ['Easy', 'Intermediate', 'Advanced']

export default function RecipesPage() {
  const { token } = useAuth()
  const router = useRouter()
  
  // State
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [featuredFilter, setFeaturedFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([])
  
  // Form state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [formData, setFormData] = useState<RecipeFormData>({
    title: "",
    description: "",
    category: "",
    difficulty: "Easy",
    prepTime: 5,
    servings: 2,
    tags: [],
    ingredients: [""],
    instructions: [""],
    image: "",
    status: "draft",
    featured: false
  })

  // Fetch recipes
  const fetchRecipes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (featuredFilter !== 'all') params.append('featured', featuredFilter)

      const response = await fetch(`/api/recipes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }

      const data = await response.json()
      setRecipes(data.recipes || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching recipes:', error)
      toast.error('Failed to fetch recipes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchRecipes()
    }
  }, [token, currentPage, searchTerm, categoryFilter, statusFilter, featuredFilter])

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || recipe.status === statusFilter
      const matchesFeatured = featuredFilter === 'all' || 
                             (featuredFilter === 'featured' && recipe.featured) ||
                             (featuredFilter === 'not-featured' && !recipe.featured)
      
      return matchesSearch && matchesCategory && matchesStatus && matchesFeatured
    })
  }, [recipes, searchTerm, categoryFilter, statusFilter, featuredFilter])

  // Handle create recipe
  const handleCreateRecipe = async () => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to create recipe')
      }

      toast.success('Recipe created successfully')
      setIsCreateOpen(false)
      resetForm()
      fetchRecipes()
    } catch (error) {
      console.error('Error creating recipe:', error)
      toast.error('Failed to create recipe')
    }
  }

  // Handle update recipe
  const handleUpdateRecipe = async () => {
    if (!editingRecipe) return

    try {
      const response = await fetch(`/api/recipes/${editingRecipe._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update recipe')
      }

      toast.success('Recipe updated successfully')
      setIsEditOpen(false)
      setEditingRecipe(null)
      resetForm()
      fetchRecipes()
    } catch (error) {
      console.error('Error updating recipe:', error)
      toast.error('Failed to update recipe')
    }
  }

  // Handle delete recipe
  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete recipe')
      }

      toast.success('Recipe deleted successfully')
      fetchRecipes()
    } catch (error) {
      console.error('Error deleting recipe:', error)
      toast.error('Failed to delete recipe')
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedRecipes.length === 0) {
      toast.error('Please select recipes first')
      return
    }

    try {
      // Implement bulk actions based on action type
      switch (action) {
        case 'delete':
          for (const id of selectedRecipes) {
            await handleDeleteRecipe(id)
          }
          setSelectedRecipes([])
          break
        case 'publish':
          // Implement bulk publish
          toast.info('Bulk publish functionality coming soon')
          break
        case 'archive':
          // Implement bulk archive
          toast.info('Bulk archive functionality coming soon')
          break
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform bulk action')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      difficulty: "Easy",
      prepTime: 5,
      servings: 2,
      tags: [],
      ingredients: [""],
      instructions: [""],
      image: "",
      status: "draft",
      featured: false
    })
  }

  // Open edit modal
  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setFormData({
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      difficulty: recipe.difficulty,
      prepTime: recipe.prepTime,
      servings: recipe.servings,
      tags: recipe.tags,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      image: recipe.image,
      status: recipe.status,
      featured: recipe.featured
    })
    setIsEditOpen(true)
  }

  // Add ingredient
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ""]
    }))
  }

  // Remove ingredient
  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  // Add instruction
  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }))
  }

  // Remove instruction
  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }))
  }

  // Add tag
  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recipes...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Recipe Management</h1>
            <p className="text-gray-600">Manage your drink recipes and content</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => fetchRecipes()}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsCreateOpen(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Recipe</DialogTitle>
                </DialogHeader>
                <RecipeForm 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleCreateRecipe}
                  onCancel={() => setIsCreateOpen(false)}
                  addIngredient={addIngredient}
                  removeIngredient={removeIngredient}
                  addInstruction={addInstruction}
                  removeInstruction={removeInstruction}
                  addTag={addTag}
                  removeTag={removeTag}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="featured">Featured</Label>
                <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Recipes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Recipes</SelectItem>
                    <SelectItem value="featured">Featured Only</SelectItem>
                    <SelectItem value="not-featured">Not Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedRecipes.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedRecipes.length} recipe(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('publish')}
                  >
                    Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('archive')}
                  >
                    Archive
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('delete')}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recipes Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Utensils className="h-5 w-5 mr-2" />
              Recipes ({filteredRecipes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedRecipes.length === filteredRecipes.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRecipes(filteredRecipes.map(r => r._id))
                        } else {
                          setSelectedRecipes([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Recipe</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Prep Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipes.map((recipe) => (
                  <TableRow key={recipe._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRecipes.includes(recipe._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecipes(prev => [...prev, recipe._id])
                          } else {
                            setSelectedRecipes(prev => prev.filter(id => id !== recipe._id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={recipe.image}
                            alt={recipe.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{recipe.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {recipe.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{recipe.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={recipe.difficulty === 'Easy' ? 'default' : 
                                recipe.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}
                      >
                        {recipe.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {recipe.prepTime} min
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={recipe.status === 'published' ? 'default' : 
                                recipe.status === 'draft' ? 'secondary' : 'outline'}
                      >
                        {recipe.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {recipe.featured ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <Star className="h-4 w-4 text-gray-300" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {format(new Date(recipe.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/recipes/${recipe.slug}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditModal(recipe)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRecipe(recipe._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {filteredRecipes.length} of {recipes.length} recipes
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Recipe</DialogTitle>
            </DialogHeader>
            <RecipeForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdateRecipe}
              onCancel={() => setIsEditOpen(false)}
              addIngredient={addIngredient}
              removeIngredient={removeIngredient}
              addInstruction={addInstruction}
              removeInstruction={removeInstruction}
              addTag={addTag}
              removeTag={removeTag}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

// Recipe Form Component
interface RecipeFormProps {
  formData: RecipeFormData
  setFormData: (data: RecipeFormData) => void
  onSubmit: () => void
  onCancel: () => void
  addIngredient: () => void
  removeIngredient: (index: number) => void
  addInstruction: () => void
  removeInstruction: (index: number) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
}

function RecipeForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  addIngredient,
  removeIngredient,
  addInstruction,
  removeInstruction,
  addTag,
  removeTag
}: RecipeFormProps) {
  const [newTag, setNewTag] = useState("")

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Recipe title"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
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
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Recipe description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
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
            onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || 0 })}
            placeholder="5"
          />
        </div>
        <div>
          <Label htmlFor="servings">Servings</Label>
          <Input
            id="servings"
            type="number"
            value={formData.servings}
            onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
            placeholder="2"
          />
        </div>
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

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag(newTag)
                setNewTag("")
              }
            }}
          />
          <Button type="button" onClick={() => { addTag(newTag); setNewTag("") }}>
            Add
          </Button>
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <Label>Ingredients</Label>
        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <Input
              value={ingredient}
              onChange={(e) => {
                const newIngredients = [...formData.ingredients]
                newIngredients[index] = e.target.value
                setFormData({ ...formData, ingredients: newIngredients })
              }}
              placeholder="Ingredient"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeIngredient(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addIngredient} className="mt-2">
          Add Ingredient
        </Button>
      </div>

      {/* Instructions */}
      <div>
        <Label>Instructions</Label>
        {formData.instructions.map((instruction, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <Textarea
              value={instruction}
              onChange={(e) => {
                const newInstructions = [...formData.instructions]
                newInstructions[index] = e.target.value
                setFormData({ ...formData, instructions: newInstructions })
              }}
              placeholder="Instruction step"
              rows={2}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeInstruction(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addInstruction} className="mt-2">
          Add Instruction
        </Button>
      </div>

      {/* Status and Featured */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
          />
          <Label htmlFor="featured">Featured Recipe</Label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          Save Recipe
        </Button>
      </div>
    </div>
  )
}
