"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useReviews } from "@/hooks/use-reviews"
import ReviewHeader from "@/components/admin/reviews/ReviewHeader"
import AdvancedFilters from "@/components/admin/reviews/AdvancedFilters"
import ReviewAnalytics from "@/components/admin/reviews/ReviewAnalytics"
import ReviewCard from "@/components/admin/reviews/ReviewCard"
import ReviewDialogs from "@/components/admin/reviews/ReviewDialogs"
import AdminLayout from "@/components/layout/AdminLayout"
import type { 
  Review, 
  ReviewFilters, 
  CreateReviewForm,
  ResponseTemplate,
  ModerationSettings
} from "@/lib/types/review"

export default function ReviewsPage() {
  const {
    reviews,
    products,
    users,
    isLoading,
    selectedReviews,
    setSelectedReviews,
    handleStatusUpdate,
    handleBulkAction,
    handleCreateReview,
    handleAdminResponse,
    handleBulkImport,
    generateReport,
    handleModerationSettings,
    getAnalytics
  } = useReviews()

  // UI State
  const [activeTab, setActiveTab] = useState("all")
  const [showCreateReview, setShowCreateReview] = useState(false)
  const [showReviewDetails, setShowReviewDetails] = useState(false)
  const [showAdminResponse, setShowAdminResponse] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [showModeration, setShowModeration] = useState(false)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [responseReview, setResponseReview] = useState<Review | null>(null)

  // Filters State
  const [filters, setFilters] = useState<ReviewFilters>({
    rating: "all",
    verified: "all",
    product: "all",
    user: "all",
    dateRange: {
      from: "",
      to: ""
    }
  })

  // Filtered and sorted reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviews

    // Tab filtering
    if (activeTab !== "all") {
      filtered = filtered.filter(review => review.status === activeTab)
    }

    // Advanced filters
    if (filters.rating !== "all") {
      filtered = filtered.filter(review => review.rating.toString() === filters.rating)
    }
    if (filters.verified !== "all") {
      filtered = filtered.filter(review => 
        filters.verified === "verified" ? review.isVerifiedPurchase : !review.isVerifiedPurchase
      )
    }
    if (filters.product !== "all") {
      filtered = filtered.filter(review => 
        review.product?._id === filters.product || review.bundle?._id === filters.product
      )
    }
    if (filters.user !== "all") {
      filtered = filtered.filter(review => review.user._id === filters.user)
    }
    if (filters.dateRange.from) {
      filtered = filtered.filter(review => new Date(review.createdAt) >= new Date(filters.dateRange.from))
    }
    if (filters.dateRange.to) {
      filtered = filtered.filter(review => new Date(review.createdAt) <= new Date(filters.dateRange.to))
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [reviews, activeTab, filters])

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(filteredReviews.map(review => review._id))
    } else {
      setSelectedReviews([])
    }
  }

  const handleSelectReview = (reviewId: string, selected: boolean) => {
    if (selected) {
      setSelectedReviews([...selectedReviews, reviewId])
    } else {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId))
    }
  }

  // Dialog handlers
  const handleViewDetails = (review: Review) => {
    setSelectedReview(review)
    setShowReviewDetails(true)
  }

  const handleAddResponse = (review: Review) => {
    setResponseReview(review)
    setShowAdminResponse(true)
  }

  const handleTemplateSelect = (template: ResponseTemplate) => {
    // Template selection is handled in the dialog component
  }

  // Analytics
  const analytics = getAnalytics()

  // Tab counts
  const tabCounts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === "pending").length,
    approved: reviews.filter(r => r.status === "approved").length,
    rejected: reviews.filter(r => r.status === "rejected").length,
    flagged: reviews.filter(r => r.flagged).length
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#12d6fa]/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto p-6 relative z-10">
          {/* Premium Header */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Reviews Management
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Manage customer reviews, ratings, and feedback with advanced moderation tools
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{filteredReviews.length}</div>
                    <div className="text-sm text-gray-500">Filtered Reviews</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#12d6fa]">{reviews.length}</div>
                    <div className="text-sm text-gray-500">Total Reviews</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => setShowCreateReview(true)}
                    className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Review
                  </button>
                  
                  <button
                    onClick={() => setShowBulkImport(true)}
                    className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Bulk Import
                  </button>
                  
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Templates
                  </button>
                  
                  <button
                    onClick={() => setShowModeration(true)}
                    className="border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Moderation
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </div>

      {showAnalytics && <ReviewAnalytics analytics={analytics} />}

      {showAdvancedFilters && (
        <AdvancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          products={products}
          users={users}
        />
      )}

          {/* Premium Tabs */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30"></div>
            <div className="relative overflow-hidden rounded-2xl">
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Reviews Directory</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#12d6fa] rounded-full animate-pulse"></div>
                          <span className="text-gray-300">
                            {filteredReviews.length} of {reviews.length} reviews
                          </span>
                        </div>
                        {selectedReviews.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-300">{selectedReviews.length} selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-100 rounded-xl p-1">
                      <TabsTrigger 
                        value="all" 
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                      >
                        All Reviews
                        <Badge variant="secondary" className="ml-2">{tabCounts.all}</Badge>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="pending" 
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                      >
                        Pending
                        <Badge variant="secondary" className="ml-2">{tabCounts.pending}</Badge>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="approved" 
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                      >
                        Approved
                        <Badge variant="secondary" className="ml-2">{tabCounts.approved}</Badge>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="rejected" 
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                      >
                        Rejected
                        <Badge variant="secondary" className="ml-2">{tabCounts.rejected}</Badge>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="flagged" 
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                      >
                        Flagged
                        <Badge variant="secondary" className="ml-2">{tabCounts.flagged}</Badge>
                      </TabsTrigger>
                    </TabsList>

                    {selectedReviews.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {selectedReviews.length} selected
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction("approve")}
                          className="text-green-600 hover:bg-green-50 border-green-200"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction("reject")}
                          className="text-red-600 hover:bg-red-50 border-red-200"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBulkAction("delete")}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  <TabsContent value={activeTab} className="space-y-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#12d6fa]/20 to-blue-500/20 rounded-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#12d6fa]"></div>
                          </div>
                          <p className="text-lg font-medium text-gray-600">Loading reviews...</p>
                        </div>
                      </div>
                    ) : filteredReviews.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="relative">
                          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#12d6fa] to-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No reviews found</h3>
                        <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                          Try adjusting your filters or create a new review
                        </p>
                        <button
                          onClick={() => setShowCreateReview(true)}
                          className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create First Review
                        </button>
                      </div>
                    ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={selectedReviews.length === filteredReviews.length && filteredReviews.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  Select all {filteredReviews.length} reviews
                </span>
              </div>

              {/* Review Cards */}
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  isSelected={selectedReviews.includes(review._id)}
                  activeTab={activeTab}
                  onSelectionChange={handleSelectReview}
                  onStatusUpdate={handleStatusUpdate}
                  onViewDetails={handleViewDetails}
                  onAddResponse={handleAddResponse}
                />
              ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ReviewDialogs
        showCreateReview={showCreateReview}
        onCreateReviewClose={() => setShowCreateReview(false)}
        onCreateReviewSubmit={handleCreateReview}
        products={products}
        users={users}
        showReviewDetails={showReviewDetails}
        onReviewDetailsClose={() => setShowReviewDetails(false)}
        selectedReview={selectedReview}
        showAdminResponse={showAdminResponse}
        onAdminResponseClose={() => setShowAdminResponse(false)}
        onAdminResponseSubmit={handleAdminResponse}
        responseReview={responseReview}
        showTemplates={showTemplates}
        onTemplatesClose={() => setShowTemplates(false)}
        onTemplateSelect={handleTemplateSelect}
        showBulkImport={showBulkImport}
        onBulkImportClose={() => setShowBulkImport(false)}
        onBulkImportSubmit={handleBulkImport}
        showModeration={showModeration}
        onModerationClose={() => setShowModeration(false)}
        onModerationSubmit={handleModerationSettings}
        showWorkflow={showWorkflow}
        onWorkflowClose={() => setShowWorkflow(false)}
        showReports={showReports}
        onReportsClose={() => setShowReports(false)}
                onGenerateReport={generateReport}
      />
      </div>
    </AdminLayout>
  )
}
