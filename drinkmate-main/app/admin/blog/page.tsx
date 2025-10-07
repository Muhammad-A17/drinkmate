"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Users,
  Loader2,
  RefreshCw,
  Download,
  X,
  AlertTriangle,
  TrendingUp,
  FileText,
  Calendar,
  Tag,
  Globe,
  BookOpen
} from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { blogAPI, BlogPost, BlogFilters, BlogComment, CreateBlogPostData } from "@/lib/api/blog-api"
import { toast } from "sonner"
import { useAdminErrorHandler } from "@/hooks/use-admin-error-handler"

export default function BlogPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const errorHandler = useAdminErrorHandler({
    context: 'BlogPage',
    defaultOptions: { category: 'server' }
  })
  
  // State
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  
  // Filters
  const [filters, setFilters] = useState<BlogFilters>({
    category: "all",
    language: "en",
    sort: "newest",
    page: 1,
    limit: 20
  })
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  
  // Dialogs
  const [showPostDetails, setShowPostDetails] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  
  // Form state
  const [postForm, setPostForm] = useState<CreateBlogPostData>({
    title: "",
    excerpt: "",
    content: "",
    category: "guide",
    tags: [] as string[],
    image: "",
    isPublished: false,
    isFeatured: false,
    language: "en"
  })

  // Authentication check
  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated || !user || !user.isAdmin) {
      router.push('/admin/login')
      return
    }
    
    fetchPosts()
  }, [user, isAuthenticated, authLoading, router])

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await blogAPI.getPostsAdmin({
        ...filters,
        search: searchTerm || undefined,
        page: currentPage
      })
      const data = response?.data
      if (data?.success) {
        setPosts(data.posts || [])
        setTotalPages(data.totalPages || 1)
        setTotalPosts(data.totalPosts || 0)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to fetch blog posts')
    } finally {
      setLoading(false)
    }
  }

  // Update filters
  const updateFilters = (newFilters: Partial<BlogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  // Search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Refresh data
  const refreshData = () => {
    fetchPosts()
  }

  // Handle post selection
  const handleSelectPost = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts(prev => [...prev, postId])
      } else {
      setSelectedPosts(prev => prev.filter(id => id !== postId))
    }
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(posts.map(post => post._id))
    } else {
      setSelectedPosts([])
    }
  }

  // Handle post actions
  const handlePostAction = async (postId: string, action: 'delete') => {
    try {
      setActionLoading(prev => ({ ...prev, [postId]: true }))
      
      let response
      switch (action) {
        case 'delete':
          response = await blogAPI.deletePost(postId)
          break
      }
      
      const data = response?.data
      if (data?.success) {
        toast.success(data.message)
        fetchPosts()
      }
    } catch (error) {
      console.error(`Error ${action}ing post:`, error)
      toast.error(`Failed to ${action} post`)
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: false }))
    }
  }

  // Handle create post
  const handleCreatePost = async () => {
    try {
      const response = await blogAPI.createPost(postForm)
      
      const data = response?.data
      if (data?.success) {
        toast.success(data.message || 'Blog post created successfully')
        setShowCreatePost(false)
        setPostForm({
      title: "",
      excerpt: "",
      content: "",
          category: "guide",
      tags: [],
          image: "",
      isPublished: false,
      isFeatured: false,
          language: "en"
        })
        fetchPosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create blog post')
    }
  }

  // Handle comment actions
  const handleCommentAction = async (postId: string, commentId: string, action: 'approve' | 'delete') => {
    try {
      let response
      switch (action) {
        case 'approve':
          response = await blogAPI.approveComment(postId, commentId)
          break
        case 'delete':
          response = await blogAPI.deleteComment(postId, commentId)
          break
      }
      
      const data = response?.data
      if (data?.success) {
        toast.success(data.message)
        fetchPosts()
      }
    } catch (error) {
      console.error(`Error ${action}ing comment:`, error)
      toast.error(`Failed to ${action} comment`)
    }
  }

  // View post details
  const viewPostDetails = (post: BlogPost) => {
    setSelectedPost(post)
    setShowPostDetails(true)
  }

  // View comments
  const viewComments = (post: BlogPost) => {
    setSelectedPost(post)
    setShowComments(true)
  }

  // Get status badge
  const getStatusBadge = (isPublished: boolean, isFeatured: boolean) => {
    if (isFeatured) {
      return <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
    }
    if (isPublished) {
      return <Badge className="bg-green-100 text-green-800">Published</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
  }

  // Get category badge
  const getCategoryBadge = (category: string) => {
    const colors = {
      recipes: "bg-orange-100 text-orange-800",
      science: "bg-blue-100 text-blue-800",
      guide: "bg-green-100 text-green-800",
      products: "bg-purple-100 text-purple-800",
      environment: "bg-emerald-100 text-emerald-800",
      health: "bg-red-100 text-red-800",
      lifestyle: "bg-pink-100 text-pink-800"
    }
    
    return (
      <Badge className={colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {category}
      </Badge>
    )
  }

  if (authLoading || loading) {
  return (
    <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading blog posts...</p>
        </div>
                  </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
                  <div>
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="text-gray-600">Manage blog posts and content</p>
                  </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowCreatePost(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
                </Button>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold">{totalPosts}</p>
                </div>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold">{posts.filter(p => p.isPublished).length}</p>
              </div>
            </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold">{posts.filter(p => !p.isPublished).length}</p>
                </div>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Comments</p>
                  <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + p.comments.length, 0)}</p>
              </div>
            </div>
            </CardContent>
          </Card>
            </div>
            
        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="recipes">Recipes</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.language} onValueChange={(value) => updateFilters({ language: value as 'en' | 'ar' })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.sort} onValueChange={(value) => updateFilters({ sort: value as any })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Posts ({totalPosts})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPosts.length === posts.length && posts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPosts.includes(post._id)}
                          onCheckedChange={(checked) => handleSelectPost(post._id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                            <div className="max-w-xs">
                          <p className="font-medium truncate">{post.title}</p>
                          <p className="text-sm text-gray-600 truncate">{post.excerpt}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                                  {post.readTime} min read
                            </div>
                          </div>
                        </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {post.authorName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{post.authorName}</p>
                            </div>
                          </div>
                        </TableCell>
                      <TableCell>
                        {getCategoryBadge(post.category)}
                        </TableCell>
                      <TableCell>
                        {getStatusBadge(post.isPublished, post.isFeatured)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views}
                          </div>
                        </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.comments.length}
                          </div>
                        </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">
                          {format(new Date(post.publishDate || post.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewPostDetails(post)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => viewComments(post)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              View Comments
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handlePostAction(post._id, 'delete')}
                              disabled={actionLoading[post._id]}
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
          </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalPosts)} of {totalPosts} posts
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Post Details Dialog */}
        <Dialog open={showPostDetails} onOpenChange={setShowPostDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post Details</DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                        <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedPost.title}</h3>
                    <p className="text-gray-600 mt-1">{selectedPost.excerpt}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getCategoryBadge(selectedPost.category)}
                      {getStatusBadge(selectedPost.isPublished, selectedPost.isFeatured)}
                      <Badge variant="outline">
                        <Globe className="h-3 w-3 mr-1" />
                        {selectedPost.language.toUpperCase()}
                      </Badge>
                            </div>
                  </div>
                </div>
                
                            <div>
                  <h4 className="font-medium mb-2">Author</h4>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>
                        {selectedPost.authorName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedPost.authorName}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Content</h4>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                </div>
                
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Stats</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-2" />
                        {selectedPost.views} views
                            </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {selectedPost.comments.length} comments
                          </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {selectedPost.readTime} min read
                          </div>
                        </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Dates</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Created: {format(new Date(selectedPost.createdAt), 'MMM dd, yyyy')}</div>
                      <div>Updated: {format(new Date(selectedPost.updatedAt), 'MMM dd, yyyy')}</div>
                      {selectedPost.publishDate && (
                        <div>Published: {format(new Date(selectedPost.publishDate), 'MMM dd, yyyy')}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Comments Dialog */}
        <Dialog open={showComments} onOpenChange={setShowComments}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Comments for "{selectedPost?.title}"</DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedPost.comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No comments yet</p>
                ) : (
                  selectedPost.comments.map((comment) => (
                    <div key={comment._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{comment.username}</span>
                            {comment.isApproved ? (
                              <Badge className="bg-green-100 text-green-800">Approved</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{comment.comment}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {format(new Date(comment.date), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          {!comment.isApproved && (
                            <Button
                              size="sm"
                              onClick={() => handleCommentAction(selectedPost._id, comment._id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCommentAction(selectedPost._id, comment._id, 'delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Post Dialog */}
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                  value={postForm.title}
                  onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title..."
                />
                  </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Enter post excerpt..."
                      rows={3}
                    />
                  </div>

              <div>
                <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                  value={postForm.content}
                  onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter post content..."
                  rows={8}
                    />
                  </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={postForm.category} onValueChange={(value) => setPostForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recipes">Recipes</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="products">Products</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={postForm.language} onValueChange={(value) => setPostForm(prev => ({ ...prev, language: value as 'en' | 'ar' }))}>
                    <SelectTrigger>
                      <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

              <div>
                <Label htmlFor="image">Featured Image URL</Label>
                        <Input
                  id="image"
                  value={postForm.image}
                  onChange={(e) => setPostForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="Enter image URL..."
                />
                    </div>
                    
              <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isPublished" 
                    checked={postForm.isPublished}
                    onCheckedChange={(checked) => setPostForm(prev => ({ ...prev, isPublished: checked as boolean }))}
                  />
                  <Label htmlFor="isPublished">Published</Label>
                    </div>
                
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isFeatured" 
                    checked={postForm.isFeatured}
                    onCheckedChange={(checked) => setPostForm(prev => ({ ...prev, isFeatured: checked as boolean }))}
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                    </div>
                  </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                      Cancel
                    </Button>
              <Button onClick={handleCreatePost}>
                Create Post
                    </Button>
            </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>
    </AdminLayout>
  )
}