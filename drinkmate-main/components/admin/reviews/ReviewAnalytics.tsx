"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Clock, CheckCircle, XCircle, Flag, Award, MessageSquare, TrendingUp } from "lucide-react"
import type { ReviewAnalytics } from "@/lib/types/review"

interface ReviewAnalyticsProps {
  analytics: ReviewAnalytics
}

export default function ReviewAnalytics({ analytics }: ReviewAnalyticsProps) {
  const stats = [
    {
      title: "Total Reviews",
      value: analytics.totalReviews,
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Average Rating",
      value: analytics.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Pending Reviews",
      value: analytics.pendingReviews,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Approved Reviews",
      value: analytics.approvedReviews,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Rejected Reviews",
      value: analytics.rejectedReviews,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Flagged Reviews",
      value: analytics.flaggedReviews,
      icon: Flag,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Verified Purchases",
      value: analytics.verifiedPurchases,
      icon: Award,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Response Rate",
      value: `${analytics.responseRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
