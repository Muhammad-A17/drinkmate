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
  ThumbsUp,
  BarChart3,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Zap,
  Shield,
  Activity,
  X,
  Upload,
  Save,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  Users,
  Eye,
  AlertTriangle
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
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Testimonials Management
                    </h1>
                    <p className="text-gray-600 text-lg mt-2">Manage customer testimonials and reviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                    <Activity className="w-4 h-4 mr-1" />
                    {testimonials.length} Total Testimonials
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {testimonials.filter(t => t.isActive).length} Active
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Testimonial
                </Button>
                <Button 
                  onClick={fetchTestimonials}
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Testimonials</p>
                  <p className="text-3xl font-bold text-gray-900">{testimonials.length}</p>
                  <p className="text-xs text-gray-500 mt-1">All testimonials</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-600">{testimonials.filter(t => t.isActive).length}</p>
                  <p className="text-xs text-gray-500 mt-1">Published testimonials</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Average Rating</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {testimonials.length > 0 ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1) : '0.0'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Out of 5 stars</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Featured</p>
                  <p className="text-3xl font-bold text-purple-600">{testimonials.filter(t => t.featured).length}</p>
                  <p className="text-xs text-gray-500 mt-1">Highlighted testimonials</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <ThumbsUp className="h-6 w-6 text-white" />
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
                  Showing {filteredTestimonials.length} of {testimonials.length} testimonials
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedStatus("all")
                    setSelectedRating("all")
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
                    placeholder="Search testimonials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rating" className="text-sm font-medium text-gray-700">Rating</Label>
                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
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
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Quick Actions</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedStatus("active")}
                    className="flex-1 border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Active
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedRating("5")}
                    className="flex-1 border-2 border-yellow-200 hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-300"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    5 Stars
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Testimonials Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Testimonials Management</h3>
                    <p className="text-sm text-gray-500">
                      {filteredTestimonials.length} of {testimonials.length} testimonials
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
              {filteredTestimonials.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No testimonials found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                  <Button 
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedStatus("all")
                      setSelectedRating("all")
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
                      <TableHead className="font-semibold text-gray-700">Author Details</TableHead>
                      <TableHead className="font-semibold text-gray-700">Rating</TableHead>
                      <TableHead className="font-semibold text-gray-700">Testimonial</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Created</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTestimonials.map((testimonial) => (
                      <TableRow 
                        key={testimonial._id}
                        className="hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100"
                      >
                        <TableCell className="font-medium py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                              {testimonial.avatar ? (
                                <img 
                                  src={testimonial.avatar} 
                                  alt={testimonial.author}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-blue-600">
                                  {testimonial.author.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{testimonial.author}</p>
                              {testimonial.role && (
                                <p className="text-xs text-gray-500">{testimonial.role}</p>
                              )}
                              {testimonial.company && (
                                <p className="text-xs text-gray-500">{testimonial.company}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
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
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              {testimonial.rating}/5
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-900 line-clamp-3 leading-relaxed">
                              {testimonial.text}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {testimonial.language && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                  {testimonial.language.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant={testimonial.isActive ? "default" : "secondary"}
                              className={testimonial.isActive 
                                ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              }
                            >
                              {testimonial.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {testimonial.featured && (
                              <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {testimonial.isVerified && (
                              <Badge variant="outline" className="border-blue-300 text-blue-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(testimonial.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(testimonial.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(testimonial)}
                              title="Edit Testimonial"
                              className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!testimonial.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(testimonial._id)}
                                title="Approve Testimonial"
                                className="border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(testimonial._id)}
                              title="Delete Testimonial"
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

          {/* Premium Add/Edit Testimonial Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden bg-white/95 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
              <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      {editingTestimonial ? "Edit Testimonial" : "Create New Testimonial"}
                    </DialogTitle>
                    <p className="text-gray-600 mt-1">
                      {editingTestimonial ? "Update the testimonial information below." : "Fill in the details to create a new testimonial."}
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="author" className="text-sm font-medium text-gray-700">Author Name *</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        required
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        placeholder="Enter author name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role/Position</Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="e.g., CEO, Customer"
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Company name (optional)"
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text" className="text-sm font-medium text-gray-700">Testimonial Text *</Label>
                    <Textarea
                      id="text"
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      rows={4}
                      placeholder="Write the testimonial content..."
                      required
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="rating" className="text-sm font-medium text-gray-700">Rating *</Label>
                      <Select 
                        value={formData.rating.toString()} 
                        onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="avatar" className="text-sm font-medium text-gray-700">Avatar URL</Label>
                      <Input
                        id="avatar"
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avatarColor" className="text-sm font-medium text-gray-700">Avatar Color</Label>
                      <Input
                        id="avatarColor"
                        type="color"
                        value={formData.avatarColor}
                        onChange={(e) => setFormData({ ...formData, avatarColor: e.target.value })}
                        className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="isVerified" 
                          checked={formData.isVerified}
                          onCheckedChange={(checked) => 
                            setFormData({...formData, isVerified: checked === true})
                          }
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="isVerified" className="text-sm font-medium text-gray-700">Verified Customer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="isActive" 
                          checked={formData.isActive}
                          onCheckedChange={(checked) => 
                            setFormData({...formData, isActive: checked === true})
                          }
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="featured" 
                          checked={formData.featured}
                          onCheckedChange={(checked) => 
                            setFormData({...formData, featured: checked === true})
                          }
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured</Label>
                      </div>
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
                      {isSubmitting ? "Saving..." : editingTestimonial ? "Update Testimonial" : "Create Testimonial"}
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
