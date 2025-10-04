"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { useAdminTranslation } from "@/lib/use-admin-translation"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, Eye, Calendar, User, MessageSquare, Star, Clock, ChefHat, Users } from "lucide-react"
import RefreshButton from "@/components/admin/RefreshButton"
import ActionButton from "@/components/admin/ActionButton"
import Image from "next/image"

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string | null;
  status: string;
  featured: boolean;
  comments: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Recipe {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  difficulty: string;
  prepTime: string;
  ingredients: number;
  publishedAt: string | null;
  status: string;
  featured: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ContentManagementPage() {
  const { t } = useAdminTranslation()
  const { user, token } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState("blog")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch blog posts
  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog-posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setBlogPosts(data.data || [])
        } else {
          setError(data.message || 'Failed to fetch blog posts')
        }
      } else {
        setError('Failed to fetch blog posts')
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      setError('Failed to fetch blog posts')
    }
  }

  // Fetch recipes
  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/admin/recipes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRecipes(data.data || [])
        } else {
          setError(data.message || 'Failed to fetch recipes')
        }
      } else {
        setError('Failed to fetch recipes')
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
      setError('Failed to fetch recipes')
    }
  }

  // Load data on component mount
  useEffect(() => {
    if (token) {
      setIsLoading(true)
      Promise.all([fetchBlogPosts(), fetchRecipes()])
        .finally(() => setIsLoading(false))
    }
  }, [token])

  // Filter data based on search and status
  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || recipe.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { variant: "default" as const, label: "Published" },
      draft: { variant: "secondary" as const, label: "Draft" },
      archived: { variant: "outline" as const, label: "Archived" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not published'
    return new Date(dateString).toLocaleDateString()
  }

  if (!user || !user.isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-gray-600">Manage blog posts and recipes</p>
          </div>
          <div className="flex items-center gap-3">
            <RefreshButton
              onRefresh={() => {
                if (activeTab === 'blog') fetchBlogPosts()
                else fetchRecipes()
              }}
              isLoading={isLoading}
            />
            <Button onClick={() => router.push(`/admin/content/${activeTab}/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add {activeTab === 'blog' ? 'Post' : 'Recipe'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Blog Posts ({filteredBlogPosts.length})
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Recipes ({filteredRecipes.length})
            </TabsTrigger>
          </TabsList>

          {/* Blog Posts Tab */}
          <TabsContent value="blog" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading blog posts...</p>
                </div>
              </div>
            ) : filteredBlogPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No blog posts match your current filters.' 
                      : 'Get started by creating your first blog post.'}
                  </p>
                  <Button onClick={() => router.push('/admin/content/blog/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Blog Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredBlogPosts.map((post) => (
                  <Card key={post._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {post.image && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={post.image}
                              alt={post.title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {post.author}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(post.publishedAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {post.comments} comments
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {post.featured && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {getStatusBadge(post.status)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <ActionButton
                              onClick={() => router.push(`/admin/content/blog/${post._id}`)}
                              icon={Edit}
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </ActionButton>
                            <ActionButton
                              onClick={() => router.push(`/blog/${post.slug}`)}
                              icon={Eye}
                              variant="outline"
                              size="sm"
                            >
                              View
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading recipes...</p>
                </div>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recipes found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No recipes match your current filters.' 
                      : 'Get started by creating your first recipe.'}
                  </p>
                  <Button onClick={() => router.push('/admin/content/recipes/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Recipe
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredRecipes.map((recipe) => (
                  <Card key={recipe._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {recipe.image && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={recipe.image}
                              alt={recipe.title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {recipe.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {recipe.excerpt}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {recipe.prepTime}
                                </div>
                                <div className="flex items-center gap-1">
                                  <ChefHat className="h-4 w-4" />
                                  {recipe.difficulty}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {recipe.ingredients} ingredients
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(recipe.publishedAt)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {recipe.featured && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {getStatusBadge(recipe.status)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <ActionButton
                              onClick={() => router.push(`/admin/content/recipes/${recipe._id}`)}
                              icon={Edit}
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </ActionButton>
                            <ActionButton
                              onClick={() => router.push(`/recipes/${recipe.slug}`)}
                              icon={Eye}
                              variant="outline"
                              size="sm"
                            >
                              View
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}