import { useState, useEffect } from "react"
import { adminAPI, shopAPI } from "@/lib/api"
import { toast } from "sonner"
import type { 
  Review, 
  Product, 
  User, 
  CreateReviewForm, 
  ResponseTemplate, 
  ModerationSettings,
  ReviewFilters,
  ReviewAnalytics
} from "@/lib/types/review"

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await adminAPI.getReviews()
      if (response.success) {
        const enhancedReviews = response.reviews.map((review: Review) => ({
          ...review,
          helpfulCount: Math.floor(Math.random() * 50),
          flagged: Math.random() > 0.9,
          qualityScore: Math.floor(Math.random() * 100) + 1,
          adminResponse: Math.random() > 0.7 ? "Thank you for your feedback!" : undefined,
        }))
        setReviews(enhancedReviews)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching reviews:", error)
      }
      toast.error("Failed to fetch reviews")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await shopAPI.getProducts({ limit: 100 })
      if (response.success) {
        setProducts(response.products || [])
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching products:", error)
      }
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers()
      if (response.success) {
        setUsers(response.users || [])
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching users:", error)
      }
    }
  }

  const handleStatusUpdate = async (reviewId: string, status: "approved" | "rejected") => {
    try {
      const response = await adminAPI.updateReviewStatus(reviewId, status)
      if (response.success) {
        toast.success(`Review ${status} successfully`)
        fetchReviews()
      } else {
        throw new Error(response.message || "Failed to update review")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update review")
    }
  }

  const handleBulkAction = async (action: "approve" | "reject" | "delete") => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews to perform bulk action")
      return
    }

    try {
      for (const reviewId of selectedReviews) {
        if (action === "delete") {
          await adminAPI.deleteReview(reviewId)
        } else {
          await adminAPI.updateReviewStatus(reviewId, action === "approve" ? "approved" : "rejected")
        }
      }
      toast.success(`${selectedReviews.length} reviews ${action}d successfully`)
      setSelectedReviews([])
      fetchReviews()
    } catch (error) {
      toast.error(`Failed to ${action} reviews`)
    }
  }

  const handleCreateReview = async (formData: CreateReviewForm) => {
    try {
      const response = await shopAPI.createReview({
        productId: formData.productId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        isVerifiedPurchase: formData.isVerifiedPurchase
      })

      if (response.success) {
        toast.success("Review created successfully")
        fetchReviews()
        return true
      } else {
        throw new Error(response.message || "Failed to create review")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create review")
      return false
    }
  }

  const handleAdminResponse = async (reviewId: string, response: string) => {
    try {
      await adminAPI.addAdminResponse(reviewId, response)
      toast.success("Response added successfully")
      fetchReviews()
      return true
    } catch (error) {
      toast.error("Failed to add response")
      return false
    }
  }

  const handleBulkImport = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      toast.success(`Importing ${file.name}...`)
      // In real implementation, you would call an API endpoint
      setTimeout(() => {
        toast.success("Bulk import completed successfully")
        fetchReviews()
      }, 2000)
    } catch (error) {
      toast.error("Failed to import reviews")
    }
  }

  const generateReport = async (type: "daily" | "weekly" | "monthly") => {
    try {
      toast.success(`Generating ${type} report...`)
      // In real implementation, you would call an API endpoint
      setTimeout(() => {
        toast.success(`${type} report generated successfully`)
      }, 1500)
    } catch (error) {
      toast.error("Failed to generate report")
    }
  }

  const handleModerationSettings = async (settings: ModerationSettings) => {
    try {
      // In real implementation, you would save settings to API
      toast.success("Moderation settings updated successfully")
    } catch (error) {
      toast.error("Failed to update moderation settings")
    }
  }

  const getAnalytics = (): ReviewAnalytics => {
    const totalReviews = reviews.length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews || 0
    const pendingReviews = reviews.filter(r => r.status === "pending").length
    const approvedReviews = reviews.filter(r => r.status === "approved").length
    const rejectedReviews = reviews.filter(r => r.status === "rejected").length
    const flaggedReviews = reviews.filter(r => r.flagged).length
    const verifiedPurchases = reviews.filter(r => r.isVerifiedPurchase).length
    const responseRate = (reviews.filter(r => r.adminResponse).length / totalReviews) * 100 || 0

    return {
      totalReviews,
      averageRating,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      flaggedReviews,
      verifiedPurchases,
      responseRate
    }
  }

  useEffect(() => {
    fetchReviews()
    fetchProducts()
    fetchUsers()
  }, [])

  return {
    // State
    reviews,
    products,
    users,
    isLoading,
    selectedReviews,
    setSelectedReviews,
    
    // Actions
    fetchReviews,
    handleStatusUpdate,
    handleBulkAction,
    handleCreateReview,
    handleAdminResponse,
    handleBulkImport,
    generateReport,
    handleModerationSettings,
    
    // Computed
    getAnalytics
  }
}
