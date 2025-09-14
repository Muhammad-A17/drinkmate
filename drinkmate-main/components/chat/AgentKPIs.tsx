"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageSquare, 
  Clock, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Target,
  Award,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentKPIsProps {
  agent: {
    id: string
    name: string
    email: string
    avatar?: string
    isOnline: boolean
  }
  metrics: {
    totalChats: number
    activeChats: number
    avgResponseTime: number
    avgResolutionTime: number
    customerSatisfaction: number
    firstResponseRate: number
    resolutionRate: number
    chatsToday: number
    chatsThisWeek: number
    chatsThisMonth: number
    avgRating: number
    totalRating: number
    slaCompliance: number
    productivity: number
  }
  period: 'today' | 'week' | 'month'
  className?: string
}

export default function AgentKPIs({ agent, metrics, period, className }: AgentKPIsProps) {
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

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = Math.round(minutes % 60)
      return `${hours}h ${mins}m`
    }
  }

  const getPerformanceBadge = (value: number, thresholds: { excellent: number; good: number; average: number }) => {
    if (value >= thresholds.excellent) return { label: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (value >= thresholds.good) return { label: 'Good', color: 'bg-blue-100 text-blue-800' }
    if (value >= thresholds.average) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' }
  }

  const performance = getPerformanceBadge(metrics.customerSatisfaction, {
    excellent: 4.5,
    good: 4.0,
    average: 3.0
  })

  return (
    <div className={cn("space-y-4", className)}>
      {/* Agent Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                agent.isOnline ? "bg-green-500" : "bg-gray-400"
              )} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{agent.name}</h3>
              <p className="text-sm text-gray-600">{agent.email}</p>
              <Badge className={cn("text-xs mt-1", performance.color)}>
                {performance.label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{metrics.avgRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Chats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Chats</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalChats}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(metrics.chatsToday, 0)}
              <span className="text-xs text-gray-600">
                {metrics.chatsToday} today
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Chats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeChats}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">
                Currently handling
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Response Time */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className={cn(
                  "text-2xl font-bold",
                  getPerformanceColor(metrics.avgResponseTime, { good: 5, average: 15 })
                )}>
                  {formatTime(metrics.avgResponseTime)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Target className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">
                Target: 5m
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.customerSatisfaction.toFixed(1)}/5
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-600">
                {metrics.totalRating} ratings
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SLA Compliance */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">SLA Compliance</span>
              <span className={cn(
                "text-sm font-semibold",
                getPerformanceColor(metrics.slaCompliance, { good: 90, average: 70 })
              )}>
                {metrics.slaCompliance.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  metrics.slaCompliance >= 90 && "bg-green-500",
                  metrics.slaCompliance >= 70 && metrics.slaCompliance < 90 && "bg-yellow-500",
                  metrics.slaCompliance < 70 && "bg-red-500"
                )}
                style={{ width: `${metrics.slaCompliance}%` }}
              />
            </div>
          </div>

          {/* First Response Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">First Response Rate</span>
              <span className={cn(
                "text-sm font-semibold",
                getPerformanceColor(metrics.firstResponseRate, { good: 95, average: 80 })
              )}>
                {metrics.firstResponseRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  metrics.firstResponseRate >= 95 && "bg-green-500",
                  metrics.firstResponseRate >= 80 && metrics.firstResponseRate < 95 && "bg-yellow-500",
                  metrics.firstResponseRate < 80 && "bg-red-500"
                )}
                style={{ width: `${metrics.firstResponseRate}%` }}
              />
            </div>
          </div>

          {/* Resolution Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Resolution Rate</span>
              <span className={cn(
                "text-sm font-semibold",
                getPerformanceColor(metrics.resolutionRate, { good: 85, average: 70 })
              )}>
                {metrics.resolutionRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  metrics.resolutionRate >= 85 && "bg-green-500",
                  metrics.resolutionRate >= 70 && metrics.resolutionRate < 85 && "bg-yellow-500",
                  metrics.resolutionRate < 70 && "bg-red-500"
                )}
                style={{ width: `${metrics.resolutionRate}%` }}
              />
            </div>
          </div>

          {/* Productivity Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Productivity Score</span>
              <span className={cn(
                "text-sm font-semibold",
                getPerformanceColor(metrics.productivity, { good: 80, average: 60 })
              )}>
                {metrics.productivity.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  metrics.productivity >= 80 && "bg-green-500",
                  metrics.productivity >= 60 && metrics.productivity < 80 && "bg-yellow-500",
                  metrics.productivity < 60 && "bg-red-500"
                )}
                style={{ width: `${metrics.productivity}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium capitalize">{period} Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {period === 'today' ? metrics.chatsToday : 
                 period === 'week' ? metrics.chatsThisWeek : 
                 metrics.chatsThisMonth}
              </div>
              <div className="text-sm text-gray-600">Chats</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(metrics.avgResolutionTime)}
              </div>
              <div className="text-sm text-gray-600">Avg Resolution</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.avgRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
