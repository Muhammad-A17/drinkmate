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
  Star,
  Users,
  Loader2,
  RefreshCw,
  Download,
  X,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Globe,
  Building,
  User,
  Heart
} from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { testimonialAPI, Testimonial, TestimonialFilters } from "@/lib/api/testimonial-api"
import { toast } from "sonner"
import { useAdminErrorHandler } from "@/hooks/use-admin-error-handler"

export default function TestimonialsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const errorHandler = useAdminErrorHandler({
    context: 'TestimonialsPage',
    defaultOptions: { category: 'server' }
  })
  
  // State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTestimonials, setSelectedTestimonials] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  
  // Filters
  const [filters, setFilters] = useState<TestimonialFilters>({
    featured: undefined,
    verified: undefined,
    language: "en"
  })
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTestimonials, setTotalTestimonials] = useState(0)
  
  // Dialogs
  const [showTestimonialDetails, setShowTestimonialDetails] = useState(false)
  const [showCreateTestimonial, setShowCreateTestimonial] = useState(false)
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  
  // Form state
  const [testimonialForm, setTestimonialForm] = useState({
    author: "",
    role: "",
    company: "",
    text: "",
    rating: 5,
    avatar: "",
    avatarColor: "#12d6fa",
    isVerified: true,
    featured: false,
    language: "en" as 'en' | 'ar'
  })
  
  // Authentication check
  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated || !user || !user.isAdmin) {
      router.push('/admin/login')
      return
    }
    
    fetchTestimonials()
  }, [user, isAuthenticated, authLoading, router])

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const response = await testimonialAPI.getTestimonialsAdmin(filters)
      
      if (response.data?.success) {
        setTestimonials(response.data.testimonials)
        setTotalTestimonials(response.data.count)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast.error('Failed to fetch testimonials')
    } finally {
      setLoading(false)
    }
  }

  // Update filters
  const updateFilters = (newFilters: Partial<TestimonialFilters>) => {
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
    fetchTestimonials()
  }

  // Handle testimonial selection
  const handleSelectTestimonial = (testimonialId: string, checked: boolean) => {
    if (checked) {
      setSelectedTestimonials(prev => [...prev, testimonialId])
    } else {
      setSelectedTestimonials(prev => prev.filter(id => id !== testimonialId))
    }
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTestimonials(testimonials.map(testimonial => testimonial._id))
    } else {
      setSelectedTestimonials([])
    }
  }

  // Handle testimonial actions
  const handleTestimonialAction = async (testimonialId: string, action: 'approve' | 'delete') => {
    try {
      setActionLoading(prev => ({ ...prev, [testimonialId]: true }))
      
      let response
      switch (action) {
        case 'approve':
          response = await testimonialAPI.approveTestimonial(testimonialId)
          break
        case 'delete':
          response = await testimonialAPI.deleteTestimonial(testimonialId)
          break
      }
      
      if (response.data?.success) {
        toast.success(response.data.message)
        fetchTestimonials()
      }
    } catch (error) {
      console.error(`Error ${action}ing testimonial:`, error)
      toast.error(`Failed to ${action} testimonial`)
    } finally {
      setActionLoading(prev => ({ ...prev, [testimonialId]: false }))
    }
  }

  // Handle create testimonial
  const handleCreateTestimonial = async () => {
    try {
      const response = await testimonialAPI.createTestimonial(testimonialForm)
      
      if (response.data?.success) {
        toast.success('Testimonial created successfully')
        setShowCreateTestimonial(false)
        setTestimonialForm({
          author: "",
          role: "",
          company: "",
          text: "",
          rating: 5,
          avatar: "",
          avatarColor: "#12d6fa",
          isVerified: true,
          featured: false,
          language: "en"
        })
        fetchTestimonials()
      }
    } catch (error) {
      console.error('Error creating testimonial:', error)
      toast.error('Failed to create testimonial')
    }
  }

  // View testimonial details
  const viewTestimonialDetails = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial)
    setShowTestimonialDetails(true)
  }

  // Get status badge
  const getStatusBadge = (isActive: boolean, isVerified: boolean, featured: boolean) => {
    if (featured) {
      return <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
    }
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>
  }

  // Get rating stars
  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  // Filter testimonials based on search
  const filteredTestimonials = useMemo(() => {
    if (!searchTerm) return testimonials
    
    return testimonials.filter(testimonial =>
      testimonial.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (testimonial.company && testimonial.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (testimonial.role && testimonial.role.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [testimonials, searchTerm])

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading testimonials...</p>
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
            <h1 className="text-3xl font-bold">Testimonials Management</h1>
            <p className="text-gray-600">Manage customer testimonials and reviews</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowCreateTestimonial(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Testimonial
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
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Testimonials</p>
                  <p className="text-2xl font-bold">{totalTestimonials}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{testimonials.filter(t => t.isActive).length}</p>
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
                  <p className="text-2xl font-bold">{testimonials.filter(t => t.featured).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold">{testimonials.filter(t => t.isVerified).length}</p>
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
                    placeholder="Search testimonials..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select 
                  value={filters.featured?.toString() || "all"} 
                  onValueChange={(value) => updateFilters({ featured: value === "all" ? undefined : value === "true" })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Featured</SelectItem>
                    <SelectItem value="false">Not Featured</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={filters.verified?.toString() || "all"} 
                  onValueChange={(value) => updateFilters({ verified: value === "all" ? undefined : value === "true" })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Verified" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Not Verified</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={filters.language} 
                  onValueChange={(value) => updateFilters({ language: value as 'en' | 'ar' })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials Table */}
        <Card>
          <CardHeader>
            <CardTitle>Testimonials ({totalTestimonials})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTestimonials.length === testimonials.length && testimonials.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Testimonial</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestimonials.map((testimonial) => (
                    <TableRow key={testimonial._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTestimonials.includes(testimonial._id)}
                          onCheckedChange={(checked) => handleSelectTestimonial(testimonial._id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3" style={{ backgroundColor: testimonial.avatarColor }}>
                            {testimonial.avatar ? (
                              <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                            ) : (
                              <AvatarFallback className="text-white font-medium">
                                {testimonial.avatarInitial}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{testimonial.author}</p>
                            {testimonial.role && (
                              <p className="text-sm text-gray-600">{testimonial.role}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {testimonial.company ? (
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="text-sm">{testimonial.company}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 truncate">{testimonial.text}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getRatingStars(testimonial.rating)}
                          <span className="ml-2 text-sm text-gray-600">({testimonial.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(testimonial.isActive, testimonial.isVerified, testimonial.featured)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Globe className="h-3 w-3 mr-1" />
                          {testimonial.language.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">
                          {format(new Date(testimonial.createdAt), 'MMM dd, yyyy')}
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
                            <DropdownMenuItem onClick={() => viewTestimonialDetails(testimonial)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {!testimonial.isActive && (
                              <DropdownMenuItem 
                                onClick={() => handleTestimonialAction(testimonial._id, 'approve')}
                                disabled={actionLoading[testimonial._id]}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleTestimonialAction(testimonial._id, 'delete')}
                              disabled={actionLoading[testimonial._id]}
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
          </CardContent>
        </Card>

        {/* Testimonial Details Dialog */}
        <Dialog open={showTestimonialDetails} onOpenChange={setShowTestimonialDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Testimonial Details</DialogTitle>
            </DialogHeader>
            {selectedTestimonial && (
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16" style={{ backgroundColor: selectedTestimonial.avatarColor }}>
                    {selectedTestimonial.avatar ? (
                      <AvatarImage src={selectedTestimonial.avatar} alt={selectedTestimonial.author} />
                    ) : (
                      <AvatarFallback className="text-white font-medium text-lg">
                        {selectedTestimonial.avatarInitial}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedTestimonial.author}</h3>
                    {selectedTestimonial.role && (
                      <p className="text-gray-600">{selectedTestimonial.role}</p>
                    )}
                    {selectedTestimonial.company && (
                      <div className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-gray-600">{selectedTestimonial.company}</span>
                      </div>
                    )}
                    <div className="flex items-center mt-2">
                      {getRatingStars(selectedTestimonial.rating)}
                      <span className="ml-2 text-sm text-gray-600">({selectedTestimonial.rating}/5)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Testimonial</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedTestimonial.text}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <div className="space-y-1">
                      {getStatusBadge(selectedTestimonial.isActive, selectedTestimonial.isVerified, selectedTestimonial.featured)}
                      {selectedTestimonial.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Language: {selectedTestimonial.language.toUpperCase()}</div>
                      <div>Display Order: {selectedTestimonial.displayOrder}</div>
                      <div>Created: {format(new Date(selectedTestimonial.createdAt), 'MMM dd, yyyy')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Testimonial Dialog */}
        <Dialog open={showCreateTestimonial} onOpenChange={setShowCreateTestimonial}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author Name *</Label>
                  <Input
                    id="author"
                    value={testimonialForm.author}
                    onChange={(e) => setTestimonialForm(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Enter author name..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Enter role..."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={testimonialForm.company}
                  onChange={(e) => setTestimonialForm(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Enter company name..."
                />
              </div>
              
              <div>
                <Label htmlFor="text">Testimonial Text *</Label>
                <Textarea
                  id="text"
                  value={testimonialForm.text}
                  onChange={(e) => setTestimonialForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter testimonial text..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Select 
                    value={testimonialForm.rating.toString()} 
                    onValueChange={(value) => setTestimonialForm(prev => ({ ...prev, rating: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={testimonialForm.language} 
                    onValueChange={(value) => setTestimonialForm(prev => ({ ...prev, language: value as 'en' | 'ar' }))}
                  >
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
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={testimonialForm.avatar}
                  onChange={(e) => setTestimonialForm(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="Enter avatar URL..."
                />
              </div>
              
              <div>
                <Label htmlFor="avatarColor">Avatar Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="avatarColor"
                    type="color"
                    value={testimonialForm.avatarColor}
                    onChange={(e) => setTestimonialForm(prev => ({ ...prev, avatarColor: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={testimonialForm.avatarColor}
                    onChange={(e) => setTestimonialForm(prev => ({ ...prev, avatarColor: e.target.value }))}
                    placeholder="#12d6fa"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVerified"
                    checked={testimonialForm.isVerified}
                    onCheckedChange={(checked) => setTestimonialForm(prev => ({ ...prev, isVerified: checked as boolean }))}
                  />
                  <Label htmlFor="isVerified">Verified</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={testimonialForm.featured}
                    onCheckedChange={(checked) => setTestimonialForm(prev => ({ ...prev, featured: checked as boolean }))}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTestimonial(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTestimonial}>
                Create Testimonial
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}