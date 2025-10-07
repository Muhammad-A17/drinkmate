"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, CheckCircle, Plus, X, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/contexts/auth-context"
import { reviewAPI } from "@/lib/api/review-api"
import { toast } from "sonner"

interface FeedbackSectionProps {
  rating: number
  reviewCount: number
  reviews: Array<{
    _id?: string
    id?: number
    user?: {
      _id: string
      username: string
      avatar?: string
    }
    name?: string
    rating: number
    date?: string
    createdAt?: string
    comment?: string
    text?: string
    title?: string
    avatar?: string
    verified?: boolean
    status?: string
  }>
  faqs?: Array<{
    question: string
    answer: string
  }>
  description?: string
  productId?: string
  bundleId?: string
  onReviewAdded?: () => void
}

export default function FeedbackSection({ 
  rating, 
  reviewCount, 
  reviews, 
  faqs = [], 
  description = "",
  productId,
  bundleId,
  onReviewAdded
}: FeedbackSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [isEditingReview, setIsEditingReview] = useState<string | null>(null)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    product: '',
    bundle: ''
  })
  const [userReview, setUserReview] = useState<any>(null)
  const [canReview, setCanReview] = useState(false)

  // Check if user has already reviewed this item and can review
  useEffect(() => {
    console.log('FeedbackSection useEffect:', { 
      user: !!user, 
      isAuthenticated, 
      reviewsLength: reviews.length,
      canReview 
    })
    
    if (user && reviews.length > 0) {
      const existingReview = reviews.find(review => 
        review.user?.username === user.username || 
        review.user?._id === user._id
      )
      if (existingReview) {
        setUserReview(existingReview)
        console.log('Found existing review:', existingReview)
      } else {
        setUserReview(null)
        console.log('No existing review found')
      }
    } else {
      setUserReview(null)
    }
    
    // All authenticated users can review
    if (isAuthenticated) {
      setCanReview(true)
      console.log('Setting canReview to true')
    } else {
      setCanReview(false)
      console.log('Setting canReview to false')
    }
  }, [user, reviews, isAuthenticated])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error("Please login to submit a review")
      return
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please enter a review comment")
      return
    }

    try {
      const reviewData: any = {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        ...(reviewForm.title && { title: reviewForm.title.trim() })
      }

      if (productId) {
        reviewData.product = productId
      } else if (bundleId) {
        reviewData.bundle = bundleId
      }

      const response = await reviewAPI.createReview(reviewData)
      const data = response?.data
      
      if (data?.success) {
        toast.success("Review submitted successfully! It will be visible after approval.")
        setIsAddingReview(false)
        setReviewForm({ rating: 5, title: '', comment: '', product: '', bundle: '' })
        if (onReviewAdded) {
          onReviewAdded()
        }
      } else {
        throw new Error((data as any)?.message || "Failed to submit review")
      }
    } catch (error: any) {
      console.error("Error submitting review:", error)
      
      // Handle specific error cases
      if (error.message && error.message.includes('already reviewed')) {
        toast.error("Duplicate Review", {
          description: "You have already reviewed this item. You can only review each product/bundle once."
        })
        // Refresh to show existing review
        if (onReviewAdded) {
          onReviewAdded()
        }
      } else {
        toast.error(error.message || "Failed to submit review")
      }
    }
  }

  const handleEditReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userReview?._id) return

    try {
      const reviewData = {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        ...(reviewForm.title && { title: reviewForm.title.trim() })
      }

      const response = await reviewAPI.updateReview(userReview._id, reviewData)
      const data = response?.data
      
      if (data?.success) {
        toast.success("Review updated successfully! It will be visible after approval.")
        setIsEditingReview(null)
        setReviewForm({ rating: 5, title: '', comment: '', product: '', bundle: '' })
        if (onReviewAdded) {
          onReviewAdded()
        }
      } else {
        throw new Error((data as any)?.message || "Failed to update review")
      }
    } catch (error: any) {
      console.error("Error updating review:", error)
      toast.error(error.message || "Failed to update review")
    }
  }

  const handleDeleteReview = async () => {
    if (!userReview?._id) return

    if (!confirm("Are you sure you want to delete your review?")) return

    try {
      const response = await reviewAPI.deleteReview(userReview._id)
      const data = response?.data
      
      if (data?.success) {
        toast.success("Review deleted successfully")
        setUserReview(null)
        if (onReviewAdded) {
          onReviewAdded()
        }
      } else {
        throw new Error((data as any)?.message || "Failed to delete review")
      }
    } catch (error: any) {
      console.error("Error deleting review:", error)
      toast.error(error.message || "Failed to delete review")
    }
  }

  const startEditing = () => {
    if (userReview) {
      setReviewForm({
        rating: userReview.rating,
        title: userReview.title || '',
        comment: userReview.comment || userReview.text || '',
        product: '', // These will be set by productId/bundleId
        bundle: ''
      })
      setIsEditingReview(userReview._id)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      )
    }
    return <div className="flex">{stars}</div>
  }

  const renderStarInput = (value: number, onChange: (rating: number) => void) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`w-8 h-8 ${
            i <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          } hover:scale-110 transition-transform`}
        >
          <Star className="w-full h-full" />
        </button>
      )
    }
    return <div className="flex gap-1">{stars}</div>
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      <Tabs defaultValue={faqs.length > 0 ? "faqs" : (description ? "description" : "reviews")} className="w-full">
        <TabsList className="w-full max-w-full md:max-w-2xl mx-auto bg-[#f3f3f3] rounded-xl md:rounded-2xl mb-6 md:mb-8 flex flex-col sm:flex-row">
          {faqs.length > 0 && (
            <TabsTrigger 
              value="faqs" 
              className="flex-1 py-3 sm:py-4 md:py-6 data-[state=active]:bg-[#fec603] data-[state=active]:text-black rounded-lg md:rounded-xl text-sm sm:text-base"
            >
              FAQS
            </TabsTrigger>
          )}
          {description && (
            <TabsTrigger 
              value="description" 
              className="flex-1 py-3 sm:py-4 md:py-6 data-[state=active]:bg-[#fec603] data-[state=active]:text-black rounded-lg md:rounded-xl text-sm sm:text-base"
            >
              Description
            </TabsTrigger>
          )}
          <TabsTrigger 
            value="reviews" 
            className="flex-1 py-3 sm:py-4 md:py-6 data-[state=active]:bg-[#fec603] data-[state=active]:text-black rounded-lg md:rounded-xl text-sm sm:text-base"
          >
            Reviews ({reviewCount})
          </TabsTrigger>
        </TabsList>

        <div className="bg-[#f3f3f3] rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8">
          {faqs.length > 0 && (
            <TabsContent value="faqs" className="mt-0">
              <div className="space-y-4 md:space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 sm:p-6">
                    <h3 className="font-bold text-base sm:text-lg mb-2">{faq.question}</h3>
                    <p className="text-gray-700 text-sm sm:text-base">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {description && (
            <TabsContent value="description" className="mt-0">
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <div className="prose max-w-none text-sm sm:text-base" 
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            </TabsContent>
          )}

          <TabsContent value="reviews" className="mt-0">
            {/* Always show debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</p>
                <p>userReview: {userReview ? 'exists' : 'none'}</p>
                <p>isAddingReview: {isAddingReview ? 'true' : 'false'}</p>
                <p>canReview: {canReview ? 'true' : 'false'}</p>
                <p>user: {user ? user.username : 'none'}</p>
                <p>reviews.length: {reviews.length}</p>
                <p>productId: {productId || 'none'}</p>
                <p>bundleId: {bundleId || 'none'}</p>
              </div>
            )}

            {/* Review Form - Simplified Logic */}
            {!userReview && !isAddingReview && (
              <div className="bg-white rounded-lg p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Write a Review</h3>
                  {isAuthenticated ? (
                    <Button
                      onClick={() => setIsAddingReview(true)}
                      className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Review
                    </Button>
                  ) : (
                    <Button
                      onClick={() => window.location.href = '/login'}
                      className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                    >
                      Login to Review
                    </Button>
                  )}
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p>💡 <strong>Review Policy:</strong> Share your thoughts and experiences with our products! 
                  All reviews are moderated to ensure quality and authenticity.</p>
                  <p className="mt-2 text-xs text-gray-500">⚠️ <strong>Note:</strong> You can only review each product/bundle once.</p>
                </div>
              </div>
            )}

            {/* Message when user already reviewed */}
            {userReview && !isAddingReview && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Review Submitted!</h3>
                  <p className="text-green-700 mb-3">
                    You have already reviewed this product/bundle. You can edit or delete your review below.
                  </p>
                </div>
              </div>
            )}

            {/* Add Review Form */}
            {isAddingReview && (
              <div className="bg-white rounded-lg p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Write a Review</h3>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsAddingReview(false)
                      setReviewForm({ rating: 5, title: '', comment: '', product: '', bundle: '' })
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <Label>Rating</Label>
                    <div className="mt-2">
                      {renderStarInput(reviewForm.rating, (rating) => 
                        setReviewForm(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input
                      id="title"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief summary of your experience"
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="comment">Review Comment *</Label>
                    <Textarea
                      id="comment"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this product..."
                      rows={4}
                      maxLength={1000}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white">
                      Submit Review
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddingReview(false)
                        setReviewForm({ rating: 5, title: '', comment: '', product: '', bundle: '' })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Review Form */}
            {isEditingReview && (
              <div className="bg-white rounded-lg p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Edit Your Review</h3>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditingReview(null)
                      setReviewForm({ rating: 5, title: '', comment: '', product: '', bundle: '' })
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleEditReview} className="space-y-4">
                  <div>
                    <Label>Rating</Label>
                    <div className="mt-2">
                      {renderStarInput(reviewForm.rating, (rating) => 
                        setReviewForm(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-title">Title (Optional)</Label>
                    <Input
                      id="edit-title"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief summary of your experience"
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-comment">Review Comment *</Label>
                    <Textarea
                      id="edit-comment"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this product..."
                      rows={4}
                      maxLength={1000}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white">
                      Update Review
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditingReview(null)
                        setReviewForm({ rating: 5, title: '', comment: '', product: '', bundle: '' })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* User's Existing Review Display */}
            {userReview && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-900">Your Review</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startEditing}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteReview}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(userReview.rating)}
                  <span className="text-sm font-semibold">{userReview.rating}.0</span>
                  {userReview.status === 'pending' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Pending Approval
                    </span>
                  )}
                </div>
                
                {userReview.title && (
                  <h4 className="font-medium mb-2">{userReview.title}</h4>
                )}
                
                <p className="text-gray-700 text-sm mb-3 italic">
                  "{userReview.comment || userReview.text || "Great product!"}"
                </p>
                
                <div className="text-xs text-gray-500">
                  {userReview.createdAt ? new Date(userReview.createdAt).toLocaleDateString() : "Recent"}
                </div>
              </div>
            )}

            {/* All Reviews */}
            {reviews.length > 0 ? (
              <div className="space-y-4 md:space-y-6">
                {reviews.map((review, index) => (
                  <div key={review._id || review.id || index} className="bg-white rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                        <span className="text-sm font-semibold">{review.rating}.0</span>
                      </div>
                      {review.verified && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="text-xs font-medium">Verified Purchase</span>
                        </div>
                      )}
                    </div>

                    {review.title && (
                      <h4 className="font-medium mb-2">{review.title}</h4>
                    )}

                    <p className="text-gray-700 text-sm sm:text-base mb-3 sm:mb-4 italic">
                      "{review.comment || review.text || "Great product!"}"
                    </p>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] p-0.5">
                        <Image
                          src={review.avatar || (review.user?.avatar || "/placeholder-user.jpg")}
                          alt={review.name || (review.user?.username || "User")}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm">
                          {review.name || (review.user?.username || "Anonymous")}
                        </h4>
                        <p className="text-gray-500 text-xs">
                          {review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recent")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 sm:p-6 text-center">
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </section>
  )
}
