"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Star,
  CheckCircle,
  XCircle,
  Reply,
  Eye,
  Flag,
  MessageSquare,
} from "lucide-react"
import type { Review } from "@/lib/types/review"

interface ReviewCardProps {
  review: Review
  isSelected: boolean
  activeTab: string
  onSelectionChange: (reviewId: string, selected: boolean) => void
  onStatusUpdate: (reviewId: string, status: "approved" | "rejected") => void
  onViewDetails: (review: Review) => void
  onAddResponse: (review: Review) => void
}

export default function ReviewCard({
  review,
  isSelected,
  activeTab,
  onSelectionChange,
  onStatusUpdate,
  onViewDetails,
  onAddResponse
}: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Card className={`${review.flagged ? "border-red-200 bg-red-50" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectionChange(review._id, !!checked)}
            />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] flex items-center justify-center text-white font-semibold">
              {review.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{review.user.username}</h3>
                {getStatusBadge(review.status)}
                {review.flagged && (
                  <Badge variant="destructive">
                    <Flag className="w-3 h-3 mr-1" />
                    Flagged
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(review)}
              title="View Review Details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {activeTab === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(review._id, "approved")}
                  className="bg-green-600 hover:bg-green-700"
                  title="Approve Review"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onStatusUpdate(review._id, "rejected")}
                  title="Reject Review"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddResponse(review)}
              title="Add Admin Response"
            >
              <Reply className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderStars(review.rating)}
              <span className="text-sm font-medium">{review.rating}.0</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{review.product?.name || review.bundle?.name}</span>
              {review.isVerifiedPurchase && (
                <Badge variant="outline" className="text-xs">
                  Verified Purchase
                </Badge>
              )}
            </div>
          </div>
          
          {review.title && (
            <h4 className="font-medium text-lg">{review.title}</h4>
          )}
          
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          
          {review.adminResponse && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Admin Response</span>
              </div>
              <p className="text-sm text-gray-700">{review.adminResponse}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
