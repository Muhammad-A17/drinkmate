"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
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
  FileText,
  Calendar,
  MessageSquare,
  ThumbsUp,
  Eye as EyeIcon,
  Tag,
  Globe,
  BarChart3,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Zap,
  Shield,
  Star,
  Activity,
  X,
  Upload,
  Save,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { blogAPI } from "@/lib/api"
import { toast } from "sonner"
import CloudinaryImageUpload from "@/components/ui/cloudinary-image-upload"

interface BlogPost {
  _id: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  image?: string
  author: string
  authorName: string
  isPublished: boolean
  isFeatured: boolean
  publishDate?: string
  readTime: number
  views: number
  likes: number
  comments: Array<{
    _id: string
    user: string
    username: string
    comment: string
    isApproved: boolean
    createdAt: string
  }>
  language: string
  slug?: string
  createdAt: string
}

interface BlogFormData {
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  isPublished: boolean
  isFeatured: boolean
  language: string
  slug?: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [newTag, setNewTag] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  // Function to generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
  }

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    excerpt: "",
    content: "",
    category: "general",
    tags: [],
    isPublished: false,
    isFeatured: false,
    language: "en",
    slug: ""
  })

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await blogAPI.getPosts({ limit: 100 }) // Get all posts for admin
      if (response.success) {
        setPosts(response.posts || [])
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to fetch blog posts")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a title")
      setIsSubmitting(false)
      return
    }
    if (!formData.excerpt.trim()) {
      toast.error("Please enter an excerpt")
      setIsSubmitting(false)
      return
    }
    if (!formData.content.trim()) {
      toast.error("Please enter content")
      setIsSubmitting(false)
      return
    }
    if (uploadedImages.length === 0) {
      toast.error("Please upload a featured image")
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare the data with image and slug
      const postData = {
        ...formData,
        image: uploadedImages[0] || "", // Use the first uploaded image as the featured image
        slug: formData.slug || generateSlug(formData.title), // Ensure slug is generated
      }

      if (editingPost) {
        await blogAPI.updatePost(editingPost._id, postData)
        toast.success("Blog post updated successfully")
      } else {
        await blogAPI.createPost(postData)
        toast.success("Blog post created successfully")
      }

      setIsDialogOpen(false)
      resetForm()
      fetchPosts()
    } catch (error: any) {
      console.error("Error saving post:", error)
      toast.error(error.response?.data?.message || "Failed to save blog post")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags,
      isPublished: post.isPublished,
      isFeatured: post.isFeatured,
      language: post.language,
      slug: post.slug || generateSlug(post.title)
    })
    // Set the uploaded images for editing
    setUploadedImages(post.image ? [post.image] : [])
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      await blogAPI.deletePost(id)
      toast.success("Blog post deleted successfully")
      fetchPosts()
    } catch (error: any) {
      console.error("Error deleting post:", error)
      toast.error(error.response?.data?.message || "Failed to delete blog post")
    }
  }

  const handleApproveComment = async (postId: string, commentId: string) => {
    try {
      await blogAPI.approveComment(postId, commentId)
      toast.success("Comment approved successfully")
      fetchPosts()
    } catch (error: any) {
      console.error("Error approving comment:", error)
      toast.error("Failed to approve comment")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "general",
      tags: [],
      isPublished: false,
      isFeatured: false,
      language: "en",
      slug: ""
    })
    setUploadedImages([])
    setEditingPost(null)
  }

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "published" && post.isPublished) ||
                         (selectedStatus === "draft" && !post.isPublished)
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading blog posts...</div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 space-y-8 p-6">
          {/* Premium Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Blog Management
                    </h1>
                    <p className="text-gray-600 text-lg mt-2">Create and manage blog posts, categories, and comments</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                    <Activity className="w-4 h-4 mr-1" />
                    {posts.length} Total Posts
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {posts.filter(p => p.isPublished).length} Published
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Post
                </Button>
                <Button 
                  onClick={fetchPosts}
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
                  <p className="text-xs text-gray-500 mt-1">All blog posts</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Published</p>
                  <p className="text-3xl font-bold text-green-600">{posts.filter(p => p.isPublished).length}</p>
                  <p className="text-xs text-gray-500 mt-1">Live posts</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-600">{posts.filter(p => !p.isPublished).length}</p>
                  <p className="text-xs text-gray-500 mt-1">Unpublished</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {posts.reduce((sum, post) => sum + post.views, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time views</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Premium Filters and Search */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Advanced Filters</h3>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing {filteredPosts.length} of {posts.length} posts
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedStatus("all")
                  }}
                  className="border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="recipes">Drink Recipes</SelectItem>
                    <SelectItem value="tips">Tips & Tricks</SelectItem>
                    <SelectItem value="news">Company News</SelectItem>
                    <SelectItem value="health">Health Benefits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Quick Actions</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedStatus("published")}
                    className="flex-1 border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Published
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedCategory("recipes")}
                    className="flex-1 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                  >
                    <Tag className="w-4 h-4 mr-1" />
                    Recipes
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Blog Posts Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Blog Posts Management</h3>
                    <p className="text-sm text-gray-500">
                      {filteredPosts.length} of {posts.length} posts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                  <Button 
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setSelectedStatus("all")
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">Post Details</TableHead>
                      <TableHead className="font-semibold text-gray-700">Category</TableHead>
                      <TableHead className="font-semibold text-gray-700">Author</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Engagement</TableHead>
                      <TableHead className="font-semibold text-gray-700">Created</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow 
                        key={post._id}
                        className="hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100"
                      >
                        <TableCell className="font-medium py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="max-w-xs">
                              <p className="font-semibold text-gray-900 line-clamp-1">{post.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">
                                  {post.readTime} min read
                                </span>
                                {post.language && (
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                    {post.language.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            {post.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {post.authorName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{post.authorName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant={post.isPublished ? "default" : "secondary"}
                              className={post.isPublished 
                                ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              }
                            >
                              {post.isPublished ? "Published" : "Draft"}
                            </Badge>
                            {post.isFeatured && (
                              <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Eye className="w-4 h-4" />
                              <span className="font-medium">{post.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MessageSquare className="w-4 h-4" />
                              <span className="font-medium">{post.comments.length}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <ThumbsUp className="w-4 h-4" />
                              <span className="font-medium">{post.likes}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(post)}
                              title="Edit Post"
                              className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(post._id)}
                              title="Delete Post"
                              className="border-2 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Premium Comments Management */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Comments Management</h3>
                  <p className="text-sm text-gray-500">
                    {posts.flatMap(post => post.comments.filter(comment => !comment.isApproved)).length} pending approval
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {posts.flatMap(post => 
                  post.comments.filter(comment => !comment.isApproved)
                ).slice(0, 10).map((comment, index) => (
                  <div key={index} className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50 hover:bg-gray-100/50 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {comment.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">{comment.username}</span>
                            <span className="text-sm text-gray-500 ml-2">on</span>
                            <span className="font-medium text-blue-600 ml-1">{posts.find(p => 
                              p.comments.some(c => c._id === comment._id)
                            )?.title}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{comment.comment}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                          <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApproveComment(
                            posts.find(p => p.comments.some(c => c._id === comment._id))?._id || "",
                            comment._id
                          )}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {posts.flatMap(post => post.comments.filter(comment => !comment.isApproved)).length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending comments</h3>
                    <p className="text-gray-500">All comments have been approved</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Premium Add/Edit Blog Post Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
              <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
                    </DialogTitle>
                    <p className="text-gray-600 mt-1">
                      {editingPost ? "Update the blog post information below." : "Fill in the details to create a new blog post."}
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700">Post Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => {
                          const newTitle = e.target.value
                          setFormData({ 
                            ...formData, 
                            title: newTitle,
                            slug: generateSlug(newTitle)
                          })
                        }}
                        required
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        placeholder="Enter blog post title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-sm font-medium text-gray-700">URL Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        placeholder="url-friendly-slug"
                      />
                      <p className="text-xs text-gray-500">
                        This will be used in the URL. Auto-generated from title.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recipes">Drink Recipes</SelectItem>
                          <SelectItem value="tips">Tips & Tricks</SelectItem>
                          <SelectItem value="news">Company News</SelectItem>
                          <SelectItem value="health">Health Benefits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt" className="text-sm font-medium text-gray-700">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={3}
                      placeholder="Brief summary of the post..."
                      required
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-medium text-gray-700">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={12}
                      placeholder="Write your blog post content here..."
                      required
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Featured Image</Label>
                      <CloudinaryImageUpload
                        onImagesChange={(images) => {
                          setUploadedImages(images)
                        }}
                        currentImages={uploadedImages}
                        maxImages={1}
                        disabled={isSubmitting}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Upload a featured image for your blog post. This will be displayed as the main image.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-sm font-medium text-gray-700">Language</Label>
                      <Select 
                        value={formData.language} 
                        onValueChange={(value) => setFormData({ ...formData, language: value })}
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          className="w-48 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        />
                        <Button type="button" variant="outline" onClick={handleAddTag} className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-red-500 transition-colors"
                              title="Remove tag"
                              aria-label={`Remove ${tag} tag`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isPublished" 
                        checked={formData.isPublished}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, isPublished: checked === true})
                        }
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="isPublished" className="text-sm font-medium text-gray-700">Publish immediately</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isFeatured" 
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, isFeatured: checked === true})
                        }
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Featured post</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminLayout>
  )
}
