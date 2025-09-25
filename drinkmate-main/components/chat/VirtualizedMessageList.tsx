'use client'

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import VirtualizedListWrapper from './VirtualizedListWrapper'
import { Message } from '@/types/chat'
import { Button } from '@/components/ui/button'
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Copy,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Trash2,
  Reply,
  MoreHorizontal,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface VirtualizedMessageListProps {
  messages: Message[]
  onMessageAction: (action: string, message: Message) => void
  height?: number
  itemHeight?: number
  searchQuery?: string
}

interface MessageItemProps {
  index: number
  style: React.CSSProperties
  data: {
    messages: Message[]
    onMessageAction: (action: string, message: Message) => void
    searchQuery: string
  }
}

const MessageItem: React.FC<MessageItemProps> = ({ index, style, data }) => {
  const { messages, onMessageAction, searchQuery } = data
  const message = messages[index]
  const [showActions, setShowActions] = React.useState(false)

  // Memoized time formatting
  const formatTime = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }, [])

  // Memoized status icon
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 animate-spin" />
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-blue-400" />
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-green-400" />
      case 'read':
        return <CheckCircle className="h-3 w-3 text-blue-300" />
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-400" />
      default:
        return null
    }
  }, [])

  // Memoized message content with search highlighting
  const highlightedContent = useMemo(() => {
    if (!searchQuery.trim()) return message.content

    const regex = new RegExp(`(${searchQuery})`, 'gi')
    const parts = message.content.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }, [message.content, searchQuery])

  // Memoized click handlers
  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onMessageAction('copy', message)
  }, [onMessageAction, message])

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onMessageAction('edit', message)
  }, [onMessageAction, message])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onMessageAction('delete', message)
  }, [onMessageAction, message])

  const handleReact = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onMessageAction('react', message)
  }, [onMessageAction, message])

  const handleReply = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onMessageAction('reply', message)
  }, [onMessageAction, message])

  return (
    <div style={style}>
      <div
        className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'} group`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className={`max-w-xs lg:max-w-md ${message.sender === 'customer' ? 'order-2' : 'order-1'}`}>
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm ${
              message.sender === 'customer'
                ? 'bg-gradient-to-r from-[#04C4DB] to-[#03a9c4] text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="text-sm leading-relaxed">
              {highlightedContent}
            </div>
            
            <div className={`flex items-center justify-between mt-2 text-xs ${
              message.sender === 'customer' ? 'text-blue-100' : 'text-gray-500'
            }`}>
              <span>{formatTime(message.timestamp)}</span>
              <div className="flex items-center space-x-1">
                {message.sender === 'customer' && getStatusIcon(message.status || 'sent')}
              </div>
            </div>
          </div>
          
          {/* Message Actions */}
          <div className={`flex items-center space-x-1 mt-1 transition-opacity duration-200 ${
            message.sender === 'customer' ? 'justify-end' : 'justify-start'
          } ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                    onClick={handleCopy}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy message</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                    onClick={handleReact}
                  >
                    <Heart className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>React to message</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                    onClick={handleReply}
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply to message</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {message.sender === 'customer' && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                        onClick={handleEdit}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-200 text-red-600"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
  messages,
  onMessageAction,
  height = 400,
  itemHeight = 80,
  searchQuery = ''
}) => {
  // Memoized filtered messages
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages

    const searchLower = searchQuery.toLowerCase()
    return messages.filter(message =>
      message.content.toLowerCase().includes(searchLower)
    )
  }, [messages, searchQuery])

  // Memoized item data
  const itemData = useMemo(() => ({
    messages: filteredMessages,
    onMessageAction,
    searchQuery
  }), [filteredMessages, onMessageAction, searchQuery])

  if (filteredMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No messages found</p>
          {searchQuery && (
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
      items={filteredMessages}
      itemHeight={itemHeight}
      height={height}
      overscan={10}
      className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      renderItem={(message, index) => (
        <MessageItem
          index={index}
          style={{}}
          data={itemData}
        />
      )}
    />
  )
}

export default VirtualizedMessageList
