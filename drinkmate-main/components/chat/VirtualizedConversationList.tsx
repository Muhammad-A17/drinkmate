'use client'

import React, { useMemo, useCallback, useState, useEffect } from 'react'
import VirtualizedListWrapper from './VirtualizedListWrapper'
import { Conversation } from '@/types/chat'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  Mail, 
  MessageCircle, 
  User, 
  Clock, 
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VirtualizedConversationListProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onConversationSelect: (conversation: Conversation) => void
  onDeleteConversation: (conversationId: string) => void
  deletingConversation: string | null
  searchTerm: string
  height?: number
  itemHeight?: number
}

interface ConversationItemProps {
  index: number
  style: React.CSSProperties
  data: {
    conversations: Conversation[]
    selectedConversation: Conversation | null
    onConversationSelect: (conversation: Conversation) => void
    onDeleteConversation: (conversationId: string) => void
    deletingConversation: string | null
    searchTerm: string
  }
}

const ConversationItem: React.FC<ConversationItemProps> = ({ index, style, data }) => {
  const {
    conversations,
    selectedConversation,
    onConversationSelect,
    onDeleteConversation,
    deletingConversation,
    searchTerm
  } = data

  const conversation = conversations[index]
  const isSelected = selectedConversation?.id === conversation.id
  const isDeleting = deletingConversation === conversation.id
  const isUrgent = conversation.sla.firstResponse <= 30
  const isWarning = conversation.sla.firstResponse <= 90 && conversation.sla.firstResponse > 30

  // Memoized channel icon
  const ChannelIcon = useMemo(() => {
    switch (conversation.channel) {
      case 'whatsapp': return MessageCircle
      case 'email': return Mail
      case 'web': return MessageSquare
      default: return MessageSquare
    }
  }, [conversation.channel])

  // Memoized channel color
  const channelColor = useMemo(() => {
    switch (conversation.channel) {
      case 'whatsapp': return 'bg-green-100 text-green-800'
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'web': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [conversation.channel])

  // Memoized status color
  const statusColor = useMemo(() => {
    switch (conversation.status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'waiting_customer': return 'bg-amber-100 text-amber-800'
      case 'waiting_agent': return 'bg-blue-100 text-blue-800'
      case 'snoozed': return 'bg-gray-100 text-gray-800'
      case 'closed': return 'bg-gray-100 text-gray-600'
      case 'converted': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [conversation.status])

  // Memoized priority color
  const priorityColor = useMemo(() => {
    switch (conversation.priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [conversation.priority])

  // Memoized SLA color
  const slaColor = useMemo(() => {
    if (conversation.sla.firstResponse <= 30) return 'text-red-600'
    if (conversation.sla.firstResponse <= 90) return 'text-amber-600'
    return 'text-green-600'
  }, [conversation.sla.firstResponse])

  // Memoized time formatting
  const formatTime = useCallback((seconds: number) => {
    if (seconds <= 0) return '0s'
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }, [])

  // Memoized relative time formatting
  const formatRelativeTime = useCallback((timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }, [])

  // Memoized click handler
  const handleClick = useCallback(() => {
    if (!isDeleting) {
      onConversationSelect(conversation)
    }
  }, [isDeleting, onConversationSelect, conversation])

  // Memoized delete handler
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteConversation(conversation.id)
  }, [onDeleteConversation, conversation.id])

  return (
    <div style={style}>
      <div
        className={cn(
          "p-4 border-b cursor-pointer hover:bg-gray-50 transition-all duration-300 relative",
          isSelected && "bg-blue-50 border-blue-200",
          isUrgent && "bg-red-50 border-red-200",
          isWarning && "bg-amber-50 border-amber-200",
          isDeleting && "opacity-50 blur-sm pointer-events-none"
        )}
        onClick={handleClick}
      >
        {isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 z-10 rounded">
            <div className="flex flex-col items-center gap-2 text-red-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Deleting conversation...</span>
              <span className="text-xs text-red-500">Please wait for confirmation</span>
            </div>
          </div>
        )}
        
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn("p-1 rounded", channelColor)}>
              <ChannelIcon className="h-3 w-3" />
            </div>
            <span className="font-medium text-sm truncate max-w-[120px]">
              {conversation.customer.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Badge className={cn("text-xs", statusColor)}>
              {conversation.status.replace('_', ' ')}
            </Badge>
            <Badge className={cn("text-xs", priorityColor)}>
              {conversation.priority}
            </Badge>
          </div>
        </div>
        
        <div className="text-xs text-gray-600 mb-2 line-clamp-2">
          {conversation.lastMessage.content}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatRelativeTime(conversation.lastMessage.timestamp)}</span>
          <div className="flex items-center gap-2">
            {conversation.assignee && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-2 w-2 text-blue-600" />
                </div>
                <span className="truncate max-w-[60px]">{conversation.assignee.name}</span>
              </div>
            )}
            {conversation.rating && (
              <div className="flex items-center gap-1 text-xs">
                <Star className={`h-3 w-3 ${
                  conversation.rating.score >= 4 ? 'text-yellow-500 fill-current' : 
                  conversation.rating.score >= 3 ? 'text-yellow-400' : 'text-red-400'
                }`} />
                <span className={
                  conversation.rating.score >= 4 ? 'text-green-600' : 
                  conversation.rating.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                }>
                  {conversation.rating.score}/5
                </span>
              </div>
            )}
            <span className={cn("font-mono", slaColor)}>
              {formatTime(conversation.sla.firstResponse)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const VirtualizedConversationList: React.FC<VirtualizedConversationListProps> = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  onDeleteConversation,
  deletingConversation,
  searchTerm,
  height = 600,
  itemHeight = 120
}) => {
  // Memoized filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations
    
    const searchLower = searchTerm.toLowerCase()
    return conversations.filter(conv => 
      conv.customer.name.toLowerCase().includes(searchLower) ||
      conv.customer.email.toLowerCase().includes(searchLower) ||
      conv.lastMessage.content.toLowerCase().includes(searchLower) ||
      conv.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }, [conversations, searchTerm])

  // Memoized item data
  const itemData = useMemo(() => ({
    conversations: filteredConversations,
    selectedConversation,
    onConversationSelect,
    onDeleteConversation,
    deletingConversation,
    searchTerm
  }), [
    filteredConversations,
    selectedConversation,
    onConversationSelect,
    onDeleteConversation,
    deletingConversation,
    searchTerm
  ])

  if (filteredConversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No conversations found</p>
          {searchTerm && (
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search terms
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <VirtualizedListWrapper
      items={filteredConversations}
      itemHeight={itemHeight}
      height={height}
      overscan={5}
      className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      renderItem={(conversation, index) => (
        <ConversationItem
          index={index}
          style={{}}
          data={itemData}
        />
      )}
    />
  )
}

export default VirtualizedConversationList
