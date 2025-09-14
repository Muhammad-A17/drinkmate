"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Timer,
  Target,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SLATrackerProps {
  conversation: {
    id: string
    createdAt: string
    status: string
    sla?: {
      firstResponseAt?: string
      firstResponseTime?: number
      resolutionAt?: string
      resolutionTime?: number
      firstResponseTarget: number
      resolutionTarget: number
    }
  }
  className?: string
}

export default function SLATracker({ conversation, className }: SLATrackerProps) {
  const now = new Date()
  const createdAt = new Date(conversation.createdAt)
  const timeSinceCreated = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60)) // minutes

  const sla = conversation.sla || {
    firstResponseTarget: 30,
    resolutionTarget: 240
  }

  const getSLAStatus = (actualTime: number, targetTime: number, isCompleted: boolean) => {
    if (isCompleted) {
      return actualTime <= targetTime ? 'met' : 'breached'
    } else {
      const remainingTime = targetTime - actualTime
      if (remainingTime <= 0) return 'breached'
      if (remainingTime <= targetTime * 0.2) return 'at_risk' // 20% of target time remaining
      return 'on_track'
    }
  }

  const firstResponseStatus = getSLAStatus(
    sla.firstResponseTime || timeSinceCreated,
    sla.firstResponseTarget,
    !!sla.firstResponseAt
  )

  const resolutionStatus = getSLAStatus(
    sla.resolutionTime || timeSinceCreated,
    sla.resolutionTarget,
    conversation.status === 'closed' || conversation.status === 'resolved'
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'met':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'breached':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'on_track':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'met':
        return <CheckCircle className="w-4 h-4" />
      case 'at_risk':
        return <AlertTriangle className="w-4 h-4" />
      case 'breached':
        return <XCircle className="w-4 h-4" />
      case 'on_track':
        return <Timer className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}m`
    }
  }

  const getProgressPercentage = (actualTime: number, targetTime: number) => {
    return Math.min((actualTime / targetTime) * 100, 100)
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="w-4 h-4" />
          SLA Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* First Response SLA */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">First Response</span>
            <Badge className={cn("text-xs", getStatusColor(firstResponseStatus))}>
              {getStatusIcon(firstResponseStatus)}
              <span className="ml-1">
                {firstResponseStatus === 'met' && 'Met'}
                {firstResponseStatus === 'at_risk' && 'At Risk'}
                {firstResponseStatus === 'breached' && 'Breached'}
                {firstResponseStatus === 'on_track' && 'On Track'}
              </span>
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>
                {sla.firstResponseAt 
                  ? `Responded in ${formatTime(sla.firstResponseTime || 0)}`
                  : `Waiting ${formatTime(timeSinceCreated)}`
                }
              </span>
              <span>Target: {formatTime(sla.firstResponseTarget)}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  firstResponseStatus === 'met' && "bg-green-500",
                  firstResponseStatus === 'at_risk' && "bg-yellow-500",
                  firstResponseStatus === 'breached' && "bg-red-500",
                  firstResponseStatus === 'on_track' && "bg-blue-500"
                )}
                style={{
                  width: `${getProgressPercentage(
                    sla.firstResponseTime || timeSinceCreated,
                    sla.firstResponseTarget
                  )}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Resolution SLA */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Resolution</span>
            <Badge className={cn("text-xs", getStatusColor(resolutionStatus))}>
              {getStatusIcon(resolutionStatus)}
              <span className="ml-1">
                {resolutionStatus === 'met' && 'Met'}
                {resolutionStatus === 'at_risk' && 'At Risk'}
                {resolutionStatus === 'breached' && 'Breached'}
                {resolutionStatus === 'on_track' && 'On Track'}
              </span>
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>
                {sla.resolutionAt 
                  ? `Resolved in ${formatTime(sla.resolutionTime || 0)}`
                  : `Open for ${formatTime(timeSinceCreated)}`
                }
              </span>
              <span>Target: {formatTime(sla.resolutionTarget)}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  resolutionStatus === 'met' && "bg-green-500",
                  resolutionStatus === 'at_risk' && "bg-yellow-500",
                  resolutionStatus === 'breached' && "bg-red-500",
                  resolutionStatus === 'on_track' && "bg-blue-500"
                )}
                style={{
                  width: `${getProgressPercentage(
                    sla.resolutionTime || timeSinceCreated,
                    sla.resolutionTarget
                  )}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Overall SLA Health */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Overall Health</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {firstResponseStatus === 'met' && resolutionStatus === 'met' && 'Excellent'}
                {firstResponseStatus === 'met' && resolutionStatus !== 'met' && 'Good'}
                {firstResponseStatus !== 'met' && resolutionStatus === 'met' && 'Fair'}
                {firstResponseStatus !== 'met' && resolutionStatus !== 'met' && 'Needs Attention'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
