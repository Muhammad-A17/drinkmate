import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'

// Review types
export interface Review {
  _id: string
  user: {
    _id: string
    username: string
    firstName?: string
    lastName?: string
    email?: string
  }
  product?: {
    _id: string
    name: string
    images: Array<{ url: string; alt?: string }>
  }
  bundle?: {
    _id: string
    name: string
    images: Array<{ url: string; alt?: string }>
  }
  co2Cylinder?: {
    _id: string
    name: string
    images: Array<{ url: string; alt?: string }>
  }
  rating: number
  title?: string
  comment: string
  images: Array<{ url: string; alt?: string }>
  isVerifiedPurchase: boolean
  status: 'pending' | 'approved' | 'rejected'
  helpfulVotes: number
  unhelpfulVotes: number
  adminResponse?: {
    comment: string
    date: string
  }
  createdAt: string
  updatedAt: string
}

export interface ReviewFilters {
  status?: 'all' | 'pending' | 'approved' | 'rejected'
  rating?: 'all' | '1' | '2' | '3' | '4' | '5'
  productId?: string
  bundleId?: string
  co2CylinderId?: string
  verified?: 'true' | 'false'
  search?: string
  sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'
  page?: number
  limit?: number
}

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  pendingReviews: number
  approvedReviews: number
  rejectedReviews: number
  verifiedPurchases: number
}

export interface ReviewResponse {
  success: boolean
  count: number
  totalReviews: number
  totalPages: number
  currentPage: number
  averageRating?: number
  ratingDistribution?: { [key: string]: number }
  stats?: ReviewStats
  reviews: Review[]
}

export interface CreateReviewData {
  productId?: string
  bundleId?: string
  co2CylinderId?: string
  rating: number
  title?: string
  comment: string
  images?: Array<{ url: string; alt?: string }>
}

export interface VoteReviewData {
  helpful: boolean
}

// Review API service
export const reviewAPI = {
  // Get all reviews (public)
  getReviews: async (filters?: ReviewFilters) => {
    return apiClient.get<ReviewResponse>(API_ENDPOINTS.REVIEWS, {
      params: filters
    })
  },

  // Get all reviews for admin
  getReviewsAdmin: async (filters?: ReviewFilters) => {
    return apiClient.get<ReviewResponse>(API_ENDPOINTS.ADMIN_REVIEWS, {
      params: filters
    })
  },

  // Get single review by ID
  getReview: async (id: string) => {
    return apiClient.get<{ success: boolean; review: Review }>(API_ENDPOINTS.REVIEW_BY_ID(id))
  },

  // Create a new review
  createReview: async (reviewData: CreateReviewData) => {
    return apiClient.post<{ success: boolean; message: string; review: Review }>(
      API_ENDPOINTS.REVIEWS,
      reviewData
    )
  },

  // Update a review (admin only)
  updateReview: async (id: string, reviewData: Partial<Review>) => {
    return apiClient.put<{ success: boolean; message: string; review: Review }>(
      `${API_ENDPOINTS.ADMIN_REVIEWS}/${id}`,
      reviewData
    )
  },

  // Delete a review (admin only)
  deleteReview: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.ADMIN_REVIEWS}/${id}`
    )
  },

  // Approve a review (admin only)
  approveReview: async (id: string) => {
    return apiClient.put<{ success: boolean; message: string; review: Review }>(
      `${API_ENDPOINTS.ADMIN_REVIEWS}/${id}/approve`
    )
  },

  // Reject a review (admin only)
  rejectReview: async (id: string) => {
    return apiClient.put<{ success: boolean; message: string; review: Review }>(
      `${API_ENDPOINTS.ADMIN_REVIEWS}/${id}/reject`
    )
  },

  // Add admin response to a review (admin only)
  addAdminResponse: async (id: string, comment: string) => {
    return apiClient.post<{ success: boolean; message: string; review: Review }>(
      `${API_ENDPOINTS.ADMIN_REVIEWS}/${id}/response`,
      { comment }
    )
  },

  // Vote on review helpfulness
  voteReview: async (id: string, voteData: VoteReviewData) => {
    return apiClient.post<{ success: boolean; message: string; review: { _id: string; helpfulVotes: number; unhelpfulVotes: number } }>(
      API_ENDPOINTS.REVIEW_VOTE(id),
      voteData
    )
  },

  // Bulk update reviews (admin only)
  bulkUpdateReviews: async (reviewIds: string[], action: 'approve' | 'reject' | 'delete', data?: any) => {
    return apiClient.post<{ success: boolean; message: string; modifiedCount?: number; deletedCount?: number }>(
      `${API_ENDPOINTS.ADMIN_REVIEWS}/bulk`,
      { reviewIds, action, data }
    )
  }
}

export default reviewAPI
