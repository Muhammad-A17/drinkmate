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
  Globe
} from "lucide-react"
import { blogAPI } from "@/lib/api"
import { toast } from "sonner"

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
  createdAt: string
}

interface BlogFormData {
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  image: string
  isPublished: boolean
  isFeatured: boolean
  language: string
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

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    excerpt: "",
    content: "",
    category: "general",
    tags: [],
    image: "",
    isPublished: false,
    isFeatured: false,
    language: "en"
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

    try {
      if (editingPost) {
        await blogAPI.updatePost(editingPost._id, formData)
        toast.success("Blog post updated successfully")
      } else {
        await blogAPI.createPost(formData)
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
      image: post.image || "",
      isPublished: post.isPublished,
      isFeatured: post.isFeatured,
      language: post.language
    })
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
      image: "",
      isPublished: false,
      isFeatured: false,
      language: "en"
    })
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
            <p className="text-muted-foreground">
              Create and manage blog posts, categories, and comments
            </p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Post
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
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
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Posts ({filteredPosts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No blog posts found</p>
                <p className="text-sm text-gray-400">Create your first blog post to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {post.excerpt}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{post.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{post.authorName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant={post.isPublished ? "default" : "secondary"}>
                            {post.isPublished ? "Published" : "Draft"}
                          </Badge>
                          {post.isFeatured && (
                            <Badge variant="outline">Featured</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">{post.views}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">{post.comments.length}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(post)}
                            className="h-8 px-3"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(post._id)}
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

        {/* Comments Management */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.flatMap(post => 
                post.comments.filter(comment => !comment.isApproved)
              ).slice(0, 10).map((comment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{comment.username}</span>
                        <span className="text-sm text-gray-500">on</span>
                        <span className="font-medium">{posts.find(p => 
                          p.comments.some(c => c._id === comment._id)
                        )?.title}</span>
                      </div>
                      <p className="text-gray-700">{comment.comment}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveComment(
                          posts.find(p => p.comments.some(c => c._id === comment._id))?._id || "",
                          comment._id
                        )}
                        className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {posts.flatMap(post => post.comments.filter(comment => !comment.isApproved)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No pending comments to approve
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Blog Post Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Post Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
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
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  placeholder="Brief summary of the post..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  placeholder="Write your blog post content here..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Featured Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
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
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="w-48"
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isPublished" 
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, isPublished: checked === true})
                    }
                  />
                  <Label htmlFor="isPublished">Publish immediately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isFeatured" 
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, isFeatured: checked === true})
                    }
                  />
                  <Label htmlFor="isFeatured">Featured post</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
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
                  {isSubmitting ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
