"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  User, 
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Eye,
  EyeOff,
  ChevronDown,
  X
} from 'lucide-react'
import { Conversation, Agent, ChatFilters } from '@/types/chat'
import { 
  getCustomerDisplayName, 
  getCustomerInitials, 
  getAgentDisplayName, 
  getAgentInitials,
  formatRelativeTime, 
  getStatusColor, 
  getPriorityColor, 
  getChannelIcon,
  formatMessagePreview
} from '@/lib/chat-utils'
import { cn } from '@/lib/utils'

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onConversationSelect: (conversation: Conversation) => void
  filters: ChatFilters
  onFilterChange: (key: keyof ChatFilters, value: any) => void
  agents: Agent[]
  loading: boolean
  viewMode: 'compact' | 'cozy'
  onViewModeChange: (mode: 'compact' | 'cozy') => void
  showFilters: boolean
  onToggleFilters: () => void
  isRTL?: boolean
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onConversationSelect,
  filters,
  onFilterChange,
  agents,
  loading,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  isRTL = false
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onFilterChange('search', query)
  }

  const getDensityClasses = () => {
    if (viewMode === 'compact') {
      return {
        container: "space-y-1",
        item: "p-2",
        avatar: "w-6 h-6",
        title: "text-sm",
        subtitle: "text-xs",
        badge: "text-xs px-1.5 py-0.5"
      }
    } else {
      return {
        container: "space-y-2",
        item: "p-3",
        avatar: "w-10 h-10",
        title: "text-base",
        subtitle: "text-sm",
        badge: "text-xs px-2 py-1"
      }
    }
  }

  const densityClasses = getDensityClasses()

  const clearFilters = () => {
    setSearchQuery('')
    onFilterChange('search', '')
    onFilterChange('status', 'all')
    onFilterChange('priority', 'all')
    onFilterChange('assignee', 'all')
    onFilterChange('channel', 'all')
  }

  const hasActiveFilters = useMemo(() => {
    return filters.status !== 'all' || 
           filters.priority !== 'all' || 
           filters.assignee !== 'all' || 
           filters.channel !== 'all' || 
           filters.search !== ''
  }, [filters])

  if (loading) {
    return (
      <Card className="h-full bg-white rounded-soft shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-ink-900">Conversations</CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-ink-200 rounded animate-pulse" />
              <div className="w-6 h-6 bg-ink-200 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-ink-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-ink-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-ink-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col bg-white rounded-soft shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-ink-900">Conversations</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className={cn(
                "flex items-center gap-1",
                showFilters && "bg-brand/10 text-brand border-brand/20"
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewModeChange(viewMode === 'compact' ? 'cozy' : 'compact')}
              className="border-ink-200 hover:border-brand hover:text-brand"
            >
              {viewMode === 'compact' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 border-ink-200 focus:border-brand focus:ring-brand/20"
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 pt-4 border-t">
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.status}
                onValueChange={(value) => onFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="waiting_for_agent">Waiting for Agent</SelectItem>
                  <SelectItem value="waiting_for_customer">Waiting for Customer</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority}
                onValueChange={(value) => onFilterChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.assignee}
                onValueChange={(value) => onFilterChange('assignee', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {getAgentDisplayName(agent)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.channel}
                onValueChange={(value) => onFilterChange('channel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="site">Site Chat</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <MessageSquare className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">No conversations</h3>
              <p className="text-gray-600">No conversations match your current filters</p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className={cn("overflow-y-auto h-full", densityClasses.container)}>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation)}
                className={cn(
                  "rounded-lg border cursor-pointer transition-all duration-200",
                  "hover:bg-gray-50 hover:border-gray-300",
                  selectedConversation?.id === conversation.id
                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                    : "bg-white border-gray-200",
                  densityClasses.item
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Customer Avatar */}
                  <div className="relative">
                    <div className={cn(
                      "rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium",
                      densityClasses.avatar
                    )}>
                      {getCustomerInitials(conversation.customer)}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={cn("font-medium text-gray-900 truncate", densityClasses.title)}>
                        {getCustomerDisplayName(conversation.customer)}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className={cn("text-gray-500", densityClasses.subtitle)}>
                          {formatRelativeTime(conversation.lastMessageAt)}
                        </span>
                        <span className="text-lg">
                          {getChannelIcon(conversation.channel)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn(getStatusColor(conversation.status), densityClasses.badge)}>
                        {conversation.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={cn(getPriorityColor(conversation.priority), densityClasses.badge)}>
                        {conversation.priority}
                      </Badge>
                    </div>

                    {/* Last Message Preview */}
                    <p className={cn("text-gray-600 truncate", densityClasses.subtitle)}>
                      {conversation.status === 'new' ? 'New conversation' : 
                       conversation.status === 'waiting_for_agent' ? 'Waiting for agent' :
                       conversation.status === 'waiting_for_customer' ? 'Waiting for customer' :
                       conversation.status === 'on_hold' ? 'On hold' :
                       conversation.status === 'closed' ? 'Closed' : 'Active'}
                    </p>

                    {/* Assignee */}
                    {conversation.assignee && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                          {getAgentInitials(conversation.assignee)}
                        </div>
                        <span className={cn("text-gray-500", densityClasses.subtitle)}>
                          {getAgentDisplayName(conversation.assignee)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
