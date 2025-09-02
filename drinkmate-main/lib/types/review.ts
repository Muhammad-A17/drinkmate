export interface Review {
  _id: string
  user: {
    _id: string
    username: string
    avatar?: string
  }
  product?: {
    _id: string
    name: string
  }
  bundle?: {
    _id: string
    name: string
  }
  rating: number
  title?: string
  comment: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  isVerifiedPurchase: boolean
  helpfulCount?: number
  flagged?: boolean
  adminResponse?: string
  qualityScore?: number
}

export interface Product {
  _id: string
  name: string
  category: string
  price: number
  images: Array<{url: string, alt: string}>
}

export interface User {
  _id: string
  username: string
  email: string
  avatar?: string
}

export interface CreateReviewForm {
  productId: string
  userId: string
  rating: number
  title: string
  comment: string
  isVerifiedPurchase: boolean
}

export interface ResponseTemplate {
  id: string
  name: string
  content: string
  category: "positive" | "negative" | "neutral" | "apology" | "clarification"
}

export interface ReviewReport {
  id: string
  title: string
  type: "daily" | "weekly" | "monthly" | "custom"
  data: any
  generatedAt: string
}

export interface ModerationSettings {
  autoApprove: boolean
  autoFlagSpam: boolean
  minWordCount: number
  maxWordCount: number
  enableAI: boolean
}

export interface ReviewFilters {
  rating: string
  verified: string
  product: string
  user: string
  dateRange: {
    from: string
    to: string
  }
}

export interface ReviewAnalytics {
  totalReviews: number
  averageRating: number
  pendingReviews: number
  approvedReviews: number
  rejectedReviews: number
  flaggedReviews: number
  verifiedPurchases: number
  responseRate: number
}
