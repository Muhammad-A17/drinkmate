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
      <div className="container mx-auto p-6">
        <ReviewHeader
        onCreateReview={() => setShowCreateReview(true)}
        onBulkImport={() => setShowBulkImport(true)}
        onShowTemplates={() => setShowTemplates(true)}
        onShowModeration={() => setShowModeration(true)}
        onShowWorkflow={() => setShowWorkflow(true)}
        onShowReports={() => setShowReports(true)}
        onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
        onToggleFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
        onExport={() => {/* TODO: Implement export */}}
        showAnalytics={showAnalytics}
        showAdvancedFilters={showAdvancedFilters}
      />

      {showAnalytics && <ReviewAnalytics analytics={analytics} />}

      {showAdvancedFilters && (
        <AdvancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          products={products}
          users={users}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              All Reviews
              <Badge variant="secondary" className="ml-2">{tabCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">{tabCounts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              <Badge variant="secondary" className="ml-2">{tabCounts.approved}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              <Badge variant="secondary" className="ml-2">{tabCounts.rejected}</Badge>
            </TabsTrigger>
            <TabsTrigger value="flagged">
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
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("reject")}
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
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading reviews...</p>
                            </div>
                          </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No reviews found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your filters or create a new review
              </p>
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
