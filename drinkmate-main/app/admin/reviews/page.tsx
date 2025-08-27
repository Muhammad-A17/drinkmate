"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, CheckCircle, XCircle, Clock, User, Package } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { toast } from "sonner"
import AdminLayout from "@/components/layout/AdminLayout"

interface Review {
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
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  isVerifiedPurchase: boolean
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await adminAPI.getReviews()
      if (response.success) {
        setReviews(response.reviews)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast.error("Failed to fetch reviews")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await adminAPI.updateReviewStatus(reviewId, status)
      if (response.success) {
        toast.success(`Review ${status} successfully`)
        fetchReviews() // Refresh the list
      } else {
        throw new Error(response.message || "Failed to update review")
      }
    } catch (error: any) {
      console.error("Error updating review:", error)
      toast.error(error.message || "Failed to update review")
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getItemType = (review: Review) => {
    if (review.product) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="w-4 h-4" />
          <span>Product: {review.product.name}</span>
        </div>
      )
    } else if (review.bundle) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="w-4 h-4" />
          <span>Bundle: {review.bundle.name}</span>
        </div>
      )
    }
    return null
  }

  const filteredReviews = reviews.filter(review => review.status === activeTab)

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Review Management</h1>
          <p className="text-gray-600">Manage product and bundle reviews</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({reviews.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({reviews.filter(r => r.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({reviews.filter(r => r.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-6">
              {filteredReviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No pending reviews</p>
                  </CardContent>
                </Card>
              ) : (
                filteredReviews.map((review) => (
                  <Card key={review._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] flex items-center justify-center text-white font-semibold">
                            {review.user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{review.user.username}</h3>
                              {getStatusBadge(review.status)}
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(review._id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(review._id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium">{review.rating}.0</span>
                        </div>
                        
                        {review.title && (
                          <h4 className="font-medium">{review.title}</h4>
                        )}
                        
                        <p className="text-gray-700">{review.comment}</p>
                        
                        {getItemType(review)}
                        
                        {review.isVerifiedPurchase && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="grid gap-6">
              {filteredReviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No approved reviews</p>
                  </CardContent>
                </Card>
              ) : (
                filteredReviews.map((review) => (
                  <Card key={review._id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] flex items-center justify-center text-white font-semibold">
                          {review.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{review.user.username}</h3>
                            {getStatusBadge(review.status)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium">{review.rating}.0</span>
                        </div>
                        
                        {review.title && (
                          <h4 className="font-medium">{review.title}</h4>
                        )}
                        
                        <p className="text-gray-700">{review.comment}</p>
                        
                        {getItemType(review)}
                        
                        {review.isVerifiedPurchase && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <CheckCircle className="w-3 h-4 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="grid gap-6">
              {filteredReviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No rejected reviews</p>
                  </CardContent>
                </Card>
              ) : (
                filteredReviews.map((review) => (
                  <Card key={review._id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] flex items-center justify-center text-white font-semibold">
                          {review.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{review.user.username}</h3>
                            {getStatusBadge(review.status)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium">{review.rating}.0</span>
                        </div>
                        
                        {review.title && (
                          <h4 className="font-medium">{review.title}</h4>
                        )}
                        
                        <p className="text-gray-700">{review.comment}</p>
                        
                        {getItemType(review)}
                        
                        {review.isVerifiedPurchase && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <CheckCircle className="w-3 h-4 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
