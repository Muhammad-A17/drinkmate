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
  Star,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  RefreshCw,
  Download,
  X,
  AlertTriangle,
  TrendingUp,
  Users,
  MessageCircle
} from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { reviewAPI, Review, ReviewFilters, ReviewStats } from "@/lib/api/review-api"
import { toast } from "sonner"
import { useAdminErrorHandler } from "@/hooks/use-admin-error-handler"

export default function ReviewsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const errorHandler = useAdminErrorHandler({
    context: 'ReviewsPage',
    defaultOptions: { category: 'server' }
  })
  
  // State
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  
  // Filters
  const [filters, setFilters] = useState<ReviewFilters>({
    status: "all",
    rating: "all",
    sort: "newest",
    page: 1,
    limit: 20
  })
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  
  // Dialogs
  const [showReviewDetails, setShowReviewDetails] = useState(false)
  const [showAdminResponse, setShowAdminResponse] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [adminResponse, setAdminResponse] = useState("")
  
  // Authentication check
  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated || !user || !user.isAdmin) {
      router.push('/admin/login')
      return
    }
    
    fetchReviews()
  }, [user, isAuthenticated, authLoading, router])

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await reviewAPI.getReviewsAdmin({
        ...filters,
        search: searchTerm || undefined,
        page: currentPage
      })
      
      const data = response?.data
      if (data?.success) {
        setReviews(data.reviews)
        setStats(data.stats || null)
        setTotalPages(data.totalPages)
        setTotalReviews(data.totalReviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  // Update filters
  const updateFilters = (newFilters: Partial<ReviewFilters>) => {
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
    fetchReviews()
  }

  // Handle review selection
  const handleSelectReview = (reviewId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews(prev => [...prev, reviewId])
    } else {
      setSelectedReviews(prev => prev.filter(id => id !== reviewId))
    }
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(reviews.map(review => review._id))
    } else {
      setSelectedReviews([])
    }
  }

  // Handle review actions
  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      setActionLoading(prev => ({ ...prev, [reviewId]: true }))
      
      let response
      switch (action) {
        case 'approve':
          response = await reviewAPI.approveReview(reviewId)
          break
        case 'reject':
          response = await reviewAPI.rejectReview(reviewId)
          break
        case 'delete':
          response = await reviewAPI.deleteReview(reviewId)
          break
      }
      
      const data = response?.data
      if (data?.success) {
        toast.success(data.message)
        fetchReviews()
      }
    } catch (error) {
      console.error(`Error ${action}ing review:`, error)
      toast.error(`Failed to ${action} review`)
    } finally {
      setActionLoading(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedReviews.length === 0) {
      toast.error('Please select reviews to perform bulk action')
      return
    }

    try {
      const response = await reviewAPI.bulkUpdateReviews(selectedReviews, action)
      
      const data = response?.data
      if (data?.success) {
        toast.success(data.message)
        setSelectedReviews([])
        fetchReviews()
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error)
      toast.error(`Failed to ${action} reviews`)
    }
  }

  // Handle admin response
  const handleAdminResponse = async () => {
    if (!selectedReview || !adminResponse.trim()) {
      toast.error('Please enter a response')
      return
    }

    try {
      const response = await reviewAPI.addAdminResponse(selectedReview._id, adminResponse)
      
      const data = response?.data
      if (data?.success) {
        toast.success('Admin response added successfully')
        setShowAdminResponse(false)
        setAdminResponse("")
        setSelectedReview(null)
        fetchReviews()
      }
    } catch (error) {
      console.error('Error adding admin response:', error)
      toast.error('Failed to add admin response')
    }
  }

  // View review details
  const viewReviewDetails = (review: Review) => {
    setSelectedReview(review)
    setShowReviewDetails(true)
  }

  // Add admin response
  const addAdminResponse = (review: Review) => {
    setSelectedReview(review)
    setShowAdminResponse(true)
  }

  // Filtered reviews based on active tab
  const filteredReviews = useMemo(() => {
    if (filters.status === 'all') return reviews
    return reviews.filter(review => review.status === filters.status)
  }, [reviews, filters.status])

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
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

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading reviews...</p>
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
            <h1 className="text-3xl font-bold">Reviews Management</h1>
            <p className="text-gray-600">Manage product reviews and customer feedback</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold">{stats.totalReviews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Verified</p>
                    <p className="text-2xl font-bold">{stats.verifiedPurchases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value as any })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.rating} onValueChange={(value) => updateFilters({ rating: value as any })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.sort} onValueChange={(value) => updateFilters({ sort: value as any })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="rating_high">Rating High</SelectItem>
                    <SelectItem value="rating_low">Rating Low</SelectItem>
                    <SelectItem value="helpful">Most Helpful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedReviews.length} review(s) selected
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBulkAction('approve')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve All
                  </Button>
                  <Button
                    onClick={() => handleBulkAction('reject')}
                    size="sm"
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject All
                  </Button>
                  <Button
                    onClick={() => handleBulkAction('delete')}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews ({totalReviews})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedReviews.length === reviews.length && reviews.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedReviews.includes(review._id)}
                          onCheckedChange={(checked) => handleSelectReview(review._id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{review.title || 'No title'}</p>
                          <p className="text-sm text-gray-600 truncate">{review.comment}</p>
                          {review.helpfulVotes > 0 && (
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {review.helpfulVotes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">
                            {review.product?.name || review.bundle?.name || review.co2Cylinder?.name || 'Unknown'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {review.user.firstName?.[0] || review.user.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{review.user.username}</p>
                            {review.isVerifiedPurchase && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getRatingStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(review.status)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">
                          {format(new Date(review.createdAt), 'MMM dd, yyyy')}
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
                            <DropdownMenuItem onClick={() => viewReviewDetails(review)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {review.status === 'pending' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleReviewAction(review._id, 'approve')}
                                  disabled={actionLoading[review._id]}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleReviewAction(review._id, 'reject')}
                                  disabled={actionLoading[review._id]}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => addAdminResponse(review)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add Response
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleReviewAction(review._id, 'delete')}
                              disabled={actionLoading[review._id]}
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
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalReviews)} of {totalReviews} reviews
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

        {/* Review Details Dialog */}
        <Dialog open={showReviewDetails} onOpenChange={setShowReviewDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Details</DialogTitle>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {selectedReview.user.firstName?.[0] || selectedReview.user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{selectedReview.user.username}</h3>
                      {selectedReview.isVerifiedPurchase && (
                        <Badge variant="secondary">Verified Purchase</Badge>
                      )}
                      {getStatusBadge(selectedReview.status)}
                    </div>
                    <div className="flex items-center mt-1">
                      {getRatingStars(selectedReview.rating)}
                      <span className="ml-2 text-sm text-gray-600">({selectedReview.rating}/5)</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(selectedReview.createdAt), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Product</h4>
                  <p className="text-gray-600">
                    {selectedReview.product?.name || selectedReview.bundle?.name || selectedReview.co2Cylinder?.name || 'Unknown'}
                  </p>
                </div>
                
                {selectedReview.title && (
                  <div>
                    <h4 className="font-medium mb-2">Title</h4>
                    <p className="text-gray-600">{selectedReview.title}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Review</h4>
                  <p className="text-gray-600">{selectedReview.comment}</p>
                </div>
                
                {selectedReview.images && selectedReview.images.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReview.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={image.alt || 'Review image'}
                          className="w-full h-32 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedReview.adminResponse && (
                  <div>
                    <h4 className="font-medium mb-2">Admin Response</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-600">{selectedReview.adminResponse.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(selectedReview.adminResponse.date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {selectedReview.helpfulVotes} helpful
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {selectedReview.unhelpfulVotes} not helpful
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Admin Response Dialog */}
        <Dialog open={showAdminResponse} onOpenChange={setShowAdminResponse}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Admin Response</DialogTitle>
              <DialogDescription>
                Add a response to this review that will be visible to customers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="response">Response</Label>
                <Textarea
                  id="response"
                  placeholder="Enter your response..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdminResponse(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdminResponse}>
                Add Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}