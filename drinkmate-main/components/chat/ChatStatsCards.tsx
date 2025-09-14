"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react'
import { ChatStats } from '@/types/chat'
import { cn } from '@/lib/utils'

interface ChatStatsCardsProps {
  stats: ChatStats
  onStatsClick: (status: string) => void
  isRTL?: boolean
}

const statCards = [
  {
    key: 'total',
    label: 'Total',
    icon: MessageSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100'
  },
  {
    key: 'new',
    label: 'New',
    icon: AlertCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100'
  },
  {
    key: 'active',
    label: 'Active',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-100'
  },
  {
    key: 'waiting',
    label: 'Waiting',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    hoverColor: 'hover:bg-yellow-100'
  },
  {
    key: 'unassigned',
    label: 'Unassigned',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-100'
  },
  {
    key: 'closed',
    label: 'Closed',
    icon: CheckCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100'
  }
]

export default function ChatStatsCards({ stats, onStatsClick, isRTL = false }: ChatStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon
        const value = stats[card.key as keyof ChatStats] || 0
        const isClickable = card.key !== 'total'
        
        return (
          <Card
            key={card.key}
            className={cn(
              "cursor-pointer transition-all duration-200",
              isClickable && card.hoverColor,
              card.borderColor
            )}
            onClick={() => isClickable && onStatsClick(card.key)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className={cn("text-2xl font-bold", card.color)}>{value}</p>
                </div>
                <div className={cn("p-2 rounded-lg", card.bgColor)}>
                  <Icon className={cn("w-5 h-5", card.color)} />
                </div>
              </div>
              
              {/* Pulse animation for non-zero values */}
              {value > 0 && (
                <div className="mt-2">
                  <div className={cn(
                    "h-1 rounded-full bg-gradient-to-r from-transparent via-current to-transparent",
                    card.color,
                    "animate-pulse"
                  )} />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
