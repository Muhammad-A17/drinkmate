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
  Star,
  MessageSquare,
  User,
  Building,
  CheckCircle,
  Clock,
  ThumbsUp
} from "lucide-react"
import { testimonialAPI } from "@/lib/api"
import { toast } from "sonner"

interface Testimonial {
  _id: string
  author: string
  role?: string
  company?: string
  text: string
  rating: number
  avatar?: string
  avatarColor?: string
  isVerified: boolean
  isActive: boolean
  featured: boolean
  productRelated?: string
  bundleRelated?: string
  language: string
  createdAt: string
}

interface TestimonialFormData {
  author: string
  role: string
  company: string
  text: string
  rating: number
  avatar: string
  avatarColor: string
  isVerified: boolean
  isActive: boolean
  featured: boolean
  productRelated: string
  bundleRelated: string
  language: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedRating, setSelectedRating] = useState("all")

  const [formData, setFormData] = useState<TestimonialFormData>({
    author: "",
    role: "",
    company: "",
    text: "",
    rating: 5,
    avatar: "",
    avatarColor: "#3B82F6",
    isVerified: true,
    isActive: true,
    featured: false,
    productRelated: "",
    bundleRelated: "",
    language: "en"
  })

  // Fetch testimonials on component mount
  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const response = await testimonialAPI.getTestimonials({ limit: 100 })
      if (response.success) {
        setTestimonials(response.testimonials || [])
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast.error("Failed to fetch testimonials")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingTestimonial) {
        await testimonialAPI.updateTestimonial(editingTestimonial._id, formData)
        toast.success("Testimonial updated successfully")
      } else {
        await testimonialAPI.createTestimonial(formData)
        toast.success("Testimonial created successfully")
      }

      setIsDialogOpen(false)
      resetForm()
      fetchTestimonials()
    } catch (error: any) {
      console.error("Error saving testimonial:", error)
      toast.error(error.response?.data?.message || "Failed to save testimonial")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      author: testimonial.author,
      role: testimonial.role || "",
      company: testimonial.company || "",
      text: testimonial.text,
      rating: testimonial.rating,
      avatar: testimonial.avatar || "",
      avatarColor: testimonial.avatarColor || "#3B82F6",
      isVerified: testimonial.isVerified,
      isActive: testimonial.isActive,
      featured: testimonial.featured,
      productRelated: testimonial.productRelated || "",
      bundleRelated: testimonial.bundleRelated || "",
      language: testimonial.language
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      await testimonialAPI.deleteTestimonial(id)
      toast.success("Testimonial deleted successfully")
      fetchTestimonials()
    } catch (error: any) {
      console.error("Error deleting testimonial:", error)
      toast.error(error.response?.data?.message || "Failed to delete testimonial")
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await testimonialAPI.approveTestimonial(id)
      toast.success("Testimonial approved successfully")
      fetchTestimonials()
    } catch (error: any) {
      console.error("Error approving testimonial:", error)
      toast.error("Failed to approve testimonial")
    }
  }

  const resetForm = () => {
    setFormData({
      author: "",
      role: "",
      company: "",
      text: "",
      rating: 5,
      avatar: "",
      avatarColor: "#3B82F6",
      isVerified: true,
      isActive: true,
      featured: false,
      productRelated: "",
      bundleRelated: "",
      language: "en"
    })
    setEditingTestimonial(null)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (testimonial.company && testimonial.company.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" && testimonial.isActive) ||
                         (selectedStatus === "inactive" && !testimonial.isActive)
    const matchesRating = selectedRating === "all" || testimonial.rating === parseInt(selectedRating)
    return matchesSearch && matchesStatus && matchesRating
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading testimonials...</div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Testimonials Management</h1>
            <p className="text-muted-foreground">
              Manage customer testimonials and reviews
            </p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{testimonials.length}</div>
              </div>
              <p className="text-xs text-muted-foreground">Total Testimonials</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="text-2xl font-bold">
                  {testimonials.filter(t => t.isActive).length}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div className="text-2xl font-bold">
                  {(testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <ThumbsUp className="h-4 w-4 text-blue-600" />
                <div className="text-2xl font-bold">
                  {testimonials.filter(t => t.featured).length}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Featured</p>
            </CardContent>
          </Card>
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
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="All ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials Table */}
        <Card>
          <CardHeader>
            <CardTitle>Testimonials ({filteredTestimonials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTestimonials.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No testimonials found</p>
                <p className="text-sm text-gray-400">Create your first testimonial to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestimonials.map((testimonial) => (
                    <TableRow key={testimonial._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{testimonial.author}</div>
                          {testimonial.role && (
                            <div className="text-sm text-gray-500">{testimonial.role}</div>
                          )}
                          {testimonial.company && (
                            <div className="text-sm text-gray-500">{testimonial.company}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {testimonial.rating}/5
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-2">{testimonial.text}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant={testimonial.isActive ? "default" : "secondary"}>
                            {testimonial.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {testimonial.featured && (
                            <Badge variant="outline">Featured</Badge>
                          )}
                          {testimonial.isVerified && (
                            <Badge variant="outline">Verified</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(testimonial.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(testimonial)}
                            className="h-8 px-3"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {!testimonial.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(testimonial._id)}
                              className="h-8 px-3 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(testimonial._id)}
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

        {/* Add/Edit Testimonial Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Edit Testimonial" : "Create New Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author Name</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role/Position</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., CEO, Customer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Testimonial Text</Label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={4}
                  placeholder="Write the testimonial content..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Select 
                    value={formData.rating.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatarColor">Avatar Color</Label>
                  <Input
                    id="avatarColor"
                    type="color"
                    value={formData.avatarColor}
                    onChange={(e) => setFormData({ ...formData, avatarColor: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isVerified" 
                      checked={formData.isVerified}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, isVerified: checked === true})
                      }
                    />
                    <Label htmlFor="isVerified">Verified Customer</Label>
                  </div>
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
                      id="featured" 
                      checked={formData.featured}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, featured: checked === true})
                      }
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
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
                  {isSubmitting ? "Saving..." : editingTestimonial ? "Update Testimonial" : "Create Testimonial"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
