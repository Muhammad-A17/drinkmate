"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Clock, 
  Star,
  Download,
  Calendar,
  Filter,
  Target,
  Award,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportingDashboardProps {
  className?: string
}

interface ReportData {
  period: string
  totalChats: number
  totalMessages: number
  avgResponseTime: number
  avgResolutionTime: number
  customerSatisfaction: number
  slaCompliance: number
  firstResponseRate: number
  resolutionRate: number
  agentPerformance: Array<{
    id: string
    name: string
    chats: number
    avgRating: number
    responseTime: number
    satisfaction: number
  }>
  topIssues: Array<{
    category: string
    count: number
    percentage: number
  }>
  hourlyDistribution: Array<{
    hour: number
    chats: number
    messages: number
  }>
  dailyTrends: Array<{
    date: string
    chats: number
    satisfaction: number
    responseTime: number
  }>
}

export default function ReportingDashboard({ className }: ReportingDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedAgent, setSelectedAgent] = useState('all')
  const [selectedMetric, setSelectedMetric] = useState('satisfaction')

  // Mock data - in real app, this would come from API
  const reportData: ReportData = {
    period: selectedPeriod,
    totalChats: 1247,
    totalMessages: 8934,
    avgResponseTime: 4.2,
    avgResolutionTime: 23.5,
    customerSatisfaction: 4.3,
    slaCompliance: 87.5,
    firstResponseRate: 92.3,
    resolutionRate: 78.9,
    agentPerformance: [
      { id: '1', name: 'Sarah Johnson', chats: 156, avgRating: 4.7, responseTime: 3.2, satisfaction: 4.6 },
      { id: '2', name: 'Mike Chen', chats: 142, avgRating: 4.5, responseTime: 4.1, satisfaction: 4.4 },
      { id: '3', name: 'Emily Davis', chats: 138, avgRating: 4.3, responseTime: 4.8, satisfaction: 4.2 },
      { id: '4', name: 'David Wilson', chats: 134, avgRating: 4.1, responseTime: 5.2, satisfaction: 4.0 }
    ],
    topIssues: [
      { category: 'Order Issues', count: 234, percentage: 18.8 },
      { category: 'Technical Support', count: 198, percentage: 15.9 },
      { category: 'Billing Questions', count: 156, percentage: 12.5 },
      { category: 'Product Information', count: 134, percentage: 10.7 },
      { category: 'Returns & Refunds', count: 98, percentage: 7.9 }
    ],
    hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      chats: Math.floor(Math.random() * 20) + 5,
      messages: Math.floor(Math.random() * 100) + 20
    })),
    dailyTrends: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      chats: Math.floor(Math.random() * 50) + 100,
      satisfaction: 4 + Math.random(),
      responseTime: 3 + Math.random() * 3
    }))
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = Math.round(minutes % 60)
      return `${hours}h ${mins}m`
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    } else {
      return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getPerformanceColor = (value: number, thresholds: { good: number; average: number }) => {
    if (value >= thresholds.good) return 'text-green-600'
    if (value >= thresholds.average) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reporting Dashboard</h2>
          <p className="text-gray-600">Monitor chat performance and agent metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Chats</p>
                <p className="text-3xl font-bold text-gray-900">{reportData.totalChats.toLocaleString()}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(reportData.totalChats, 1200)}
              <span className="text-sm text-gray-600">+3.2% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className={cn(
                  "text-3xl font-bold",
                  getPerformanceColor(reportData.avgResponseTime, { good: 5, average: 10 })
                )}>
                  {formatTime(reportData.avgResponseTime)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(reportData.avgResponseTime, 5.1)}
              <span className="text-sm text-gray-600">-0.9m from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
                <p className="text-3xl font-bold text-gray-900">{reportData.customerSatisfaction.toFixed(1)}/5</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(reportData.customerSatisfaction, 4.1)}
              <span className="text-sm text-gray-600">+0.2 from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SLA Compliance</p>
                <p className={cn(
                  "text-3xl font-bold",
                  getPerformanceColor(reportData.slaCompliance, { good: 90, average: 80 })
                )}>
                  {reportData.slaCompliance.toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(reportData.slaCompliance, 85.2)}
              <span className="text-sm text-gray-600">+2.3% from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SLA Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">First Response Rate</span>
                <span className={cn(
                  "text-sm font-semibold",
                  getPerformanceColor(reportData.firstResponseRate, { good: 95, average: 85 })
                )}>
                  {reportData.firstResponseRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    reportData.firstResponseRate >= 95 && "bg-green-500",
                    reportData.firstResponseRate >= 85 && reportData.firstResponseRate < 95 && "bg-yellow-500",
                    reportData.firstResponseRate < 85 && "bg-red-500"
                  )}
                  style={{ width: `${reportData.firstResponseRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Resolution Rate</span>
                <span className={cn(
                  "text-sm font-semibold",
                  getPerformanceColor(reportData.resolutionRate, { good: 85, average: 75 })
                )}>
                  {reportData.resolutionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    reportData.resolutionRate >= 85 && "bg-green-500",
                    reportData.resolutionRate >= 75 && reportData.resolutionRate < 85 && "bg-yellow-500",
                    reportData.resolutionRate < 75 && "bg-red-500"
                  )}
                  style={{ width: `${reportData.resolutionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Avg Resolution Time</span>
                <span className={cn(
                  "text-sm font-semibold",
                  getPerformanceColor(reportData.avgResolutionTime, { good: 30, average: 60 })
                )}>
                  {formatTime(reportData.avgResolutionTime)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    reportData.avgResolutionTime <= 30 && "bg-green-500",
                    reportData.avgResolutionTime <= 60 && reportData.avgResolutionTime > 30 && "bg-yellow-500",
                    reportData.avgResolutionTime > 60 && "bg-red-500"
                  )}
                  style={{ width: `${Math.min((reportData.avgResolutionTime / 120) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.topIssues.map((issue, index) => (
                <div key={issue.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{issue.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{issue.count}</div>
                    <div className="text-xs text-gray-600">{issue.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.agentPerformance.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-gray-600">{agent.chats} chats</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-semibold">{agent.avgRating.toFixed(1)}</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{formatTime(agent.responseTime)}</div>
                    <div className="text-xs text-gray-600">Response</div>
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      "text-sm font-semibold",
                      getPerformanceColor(agent.satisfaction, { good: 4.0, average: 3.5 })
                    )}>
                      {agent.satisfaction.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">Satisfaction</div>
                  </div>
                  <Badge className={cn(
                    "text-xs",
                    agent.avgRating >= 4.5 && "bg-green-100 text-green-800",
                    agent.avgRating >= 4.0 && agent.avgRating < 4.5 && "bg-blue-100 text-blue-800",
                    agent.avgRating >= 3.5 && agent.avgRating < 4.0 && "bg-yellow-100 text-yellow-800",
                    agent.avgRating < 3.5 && "bg-red-100 text-red-800"
                  )}>
                    {agent.avgRating >= 4.5 && "Excellent"}
                    {agent.avgRating >= 4.0 && agent.avgRating < 4.5 && "Good"}
                    {agent.avgRating >= 3.5 && agent.avgRating < 4.0 && "Average"}
                    {agent.avgRating < 3.5 && "Needs Improvement"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
