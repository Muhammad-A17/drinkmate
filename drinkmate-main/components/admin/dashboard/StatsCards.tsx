"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  ShoppingBag, 
  Package, 
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  Star,
  MessageSquare,
  FileText,
  Activity
} from "lucide-react"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalProducts: number
  totalRevenue: number
  lowStockProducts: number
  pendingOrders: number
  totalTestimonials: number
  totalBlogPosts: number
  totalContacts: number
  monthlyGrowth: number
  orderGrowth: number
  userGrowth: number
}

interface StatsCardsProps {
  stats: DashboardStats
  isLoading: boolean
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const statsData = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: stats.userGrowth,
      changeLabel: "vs last month",
      color: "text-blue-600"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      change: stats.orderGrowth,
      changeLabel: "vs last month",
      color: "text-green-600"
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      change: 0,
      changeLabel: "active products",
      color: "text-purple-600"
    },
    {
      title: "Total Revenue",
      value: <SaudiRiyal amount={stats.totalRevenue} />,
      icon: DollarSign,
      change: stats.monthlyGrowth,
      changeLabel: "vs last month",
      color: "text-emerald-600"
    },
    {
      title: "Low Stock",
      value: stats.lowStockProducts.toLocaleString(),
      icon: AlertCircle,
      change: 0,
      changeLabel: "products",
      color: "text-orange-600"
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toLocaleString(),
      icon: Clock,
      change: 0,
      changeLabel: "awaiting processing",
      color: "text-yellow-600"
    },
    {
      title: "Testimonials",
      value: stats.totalTestimonials.toLocaleString(),
      icon: Star,
      change: 0,
      changeLabel: "customer reviews",
      color: "text-indigo-600"
    },
    {
      title: "Blog Posts",
      value: stats.totalBlogPosts.toLocaleString(),
      icon: FileText,
      change: 0,
      changeLabel: "published articles",
      color: "text-pink-600"
    },
    {
      title: "Contacts",
      value: stats.totalContacts.toLocaleString(),
      icon: MessageSquare,
      change: 0,
      changeLabel: "inquiries",
      color: "text-cyan-600"
    },
    {
      title: "System Health",
      value: "99.9%",
      icon: Activity,
      change: 0,
      changeLabel: "uptime",
      color: "text-green-600"
    }
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.change > 0
        const isNegative = stat.change < 0
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                {stat.change !== 0 && (
                  <>
                    {isPositive && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {isNegative && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                    <span className={isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-gray-500"}>
                      {Math.abs(stat.change)}%
                    </span>
                  </>
                )}
                <span>{stat.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
