'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Send, 
  Paperclip, 
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
  Archive,
  Settings,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Image,
  FileText,
  Download,
  Star,
  Flag,
  Tag,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Copy,
  Share2,
  Zap,
  Heart,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useSocket } from '@/lib/socket-context'
import { Message, Conversation } from '@/types/chat'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ModernAdminChatWidgetProps {
  selectedConversation: Conversation | null
  onMessageSent?: (message: Message) => void
  onConversationUpdate?: (conversation: Conversation) => void
}

interface MessageStatus {
  id: string
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  timestamp?: Date
}

const ModernAdminChatWidget: React.FC<ModernAdminChatWidgetProps> = ({
  selectedConversation,
  onMessageSent,
  onConversationUpdate
}) => {
  // State management
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [messageStatuses, setMessageStatuses] = useState<Map<string, MessageStatus>>(new Map())
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [showCustomerInfo, setShowCustomerInfo] = useState(false)
  const [conversationNotes, setConversationNotes] = useState('')
  const [conversationTags, setConversationTags] = useState<string[]>([])
  const [conversationPriority, setConversationPriority] = useState<'low' | 'medium' | 'high'>('medium')
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Hooks
  const { user } = useAuth()
  const { socket, isConnected, sendMessage: socketSendMessage } = useSocket()

  // Utility functions
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const formatTime = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }, [])

  const getMessageStatusIcon = useCallback((status: string) => {
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

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }, [])

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) {
        setMessages([])
        setFilteredMessages([])
        return
      }

      try {
        const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
        if (!token) {
          console.error('🔥 ModernAdminChatWidget: No authentication token found')
          setMessages(selectedConversation.messages || [])
          setFilteredMessages(selectedConversation.messages || [])
          return
        }

        console.log(`🔥 ModernAdminChatWidget: Loading messages for chat: ${selectedConversation.id}`)
        
        const response = await fetch(`http://localhost:3000/chat/${selectedConversation.id}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          console.error('🔥 ModernAdminChatWidget: Failed to fetch messages:', response.status)
          setMessages(selectedConversation.messages || [])
          setFilteredMessages(selectedConversation.messages || [])
          return
        }

        const data = await response.json()
        console.log('🔥 ModernAdminChatWidget: Messages loaded:', data)

        if (data.success && data.data?.chat?.messages) {
          const processedMessages = data.data.chat.messages.map((message: any): Message => ({
            id: message._id || message.id,
            content: message.content,
            sender: message.sender === 'admin' || message.sender === 'agent' ? 'agent' : 'customer',
            timestamp: message.createdAt || message.timestamp,
            isNote: message.isNote || false,
            attachments: message.attachments || [],
            readAt: message.readAt,
            status: message.status || 'sent'
          }))
          
          setMessages(processedMessages)
          setFilteredMessages(processedMessages)
        } else {
          setMessages(selectedConversation.messages || [])
          setFilteredMessages(selectedConversation.messages || [])
        }
      } catch (error) {
        console.error('🔥 ModernAdminChatWidget: Error loading messages:', error)
        setMessages(selectedConversation.messages || [])
        setFilteredMessages(selectedConversation.messages || [])
      }
    }

    loadMessages()
  }, [selectedConversation])

  // Filter messages based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages(messages)
    } else {
      const filtered = messages.filter(message =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredMessages(filtered)
    }
  }, [searchQuery, messages])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [filteredMessages, scrollToBottom])

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected || !selectedConversation) {
      return
    }

    const handleNewMessage = (data: { chatId: string; message: any }) => {
      console.log('🔥 ModernAdminChatWidget: New message received:', data)
      
      // Validate data structure
      if (!data || !data.chatId || !data.message) {
        console.error('🔥 ModernAdminChatWidget: Invalid message data structure:', data)
        return
      }
      
      if (data.chatId === selectedConversation.id) {
        setMessages(prev => {
          // Check for duplicates
          const messageExists = prev.some(msg => 
            msg.id === data.message._id || 
            msg.id === data.message.id ||
            (msg.content === data.message.content && msg.timestamp === data.message.timestamp)
          )

          if (messageExists) {
            console.log('🔥 ModernAdminChatWidget: Duplicate message detected, skipping')
            return prev
          }

          const newMessage: Message = {
            id: data.message._id || data.message.id || `temp_${Date.now()}`,
            content: data.message.content || '',
            sender: data.message.sender === 'admin' || data.message.sender === 'agent' ? 'agent' : 'customer',
            timestamp: data.message.createdAt || data.message.timestamp || new Date().toISOString(),
            isNote: data.message.isNote || false,
            attachments: data.message.attachments || [],
            readAt: data.message.readAt,
            status: data.message.status || 'delivered'
          }

          console.log('🔥 ModernAdminChatWidget: Adding new message:', newMessage)
          return [...prev, newMessage]
        })
      }
    }

    const handleTypingStart = (data: { chatId: string; userId: string; userName: string }) => {
      if (data.chatId === selectedConversation?.id && data.userId !== user?._id) {
        setIsTyping(true)
      }
    }

    const handleTypingStop = (data: { chatId: string; userId: string; userName: string }) => {
      if (data.chatId === selectedConversation?.id && data.userId !== user?._id) {
        setIsTyping(false)
      }
    }

    const handleMessageStatusUpdate = (data: { messageId: string; status: string }) => {
      setMessageStatuses(prev => {
        const newMap = new Map(prev)
        newMap.set(data.messageId, {
          id: data.messageId,
          status: data.status as any,
          timestamp: new Date()
        })
        return newMap
      })
    }

    // Register event listeners
    socket.on('new_message', handleNewMessage)
    socket.on('typing_start', handleTypingStart)
    socket.on('typing_stop', handleTypingStop)
    socket.on('message_status_update', handleMessageStatusUpdate)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('typing_start', handleTypingStart)
      socket.off('typing_stop', handleTypingStop)
      socket.off('message_status_update', handleMessageStatusUpdate)
    }
  }, [socket, isConnected, selectedConversation, user?._id])

  // Handle typing events
  const handleTyping = useCallback(() => {
    if (!socket || !selectedConversation || !user) return

    socket.emit('typing_start', {
      chatId: selectedConversation.id,
      userId: user._id,
      userName: user.name || user.username
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        chatId: selectedConversation.id,
        userId: user._id,
        userName: user.name || user.username
      })
    }, 1000)
  }, [socket, selectedConversation, user])

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    const messageContent = messageInput.trim()
    if (!messageContent || !selectedConversation || isSending) return

    setIsSending(true)
    setMessageInput('')

    // Create optimistic message
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      sender: 'agent',
      timestamp: new Date().toISOString(),
      isNote: false,
      attachments: [],
      status: 'sending'
    }

    // Add to messages immediately
    setMessages(prev => [...prev, tempMessage])
    scrollToBottom()

    try {
      if (socketSendMessage && isConnected) {
        // Send via socket
        await socketSendMessage(selectedConversation.id, messageContent, 'text')
        console.log('🔥 ModernAdminChatWidget: Message sent via socket')
      } else {
        // Fallback to API
        const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
        if (!token) throw new Error('No authentication token')

        const response = await fetch(`http://localhost:3000/chat/${selectedConversation.id}/message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: messageContent,
            messageType: 'text'
          })
        })

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }

        const responseData = await response.json()
        console.log('🔥 ModernAdminChatWidget: Message sent via API:', responseData)

        // Update message with real ID and status
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, id: responseData.data.message._id, status: 'sent' }
            : msg
        ))

        if (onMessageSent) {
          onMessageSent({ ...tempMessage, id: responseData.data.message._id, status: 'sent' })
        }
      }
    } catch (error) {
      console.error('🔥 ModernAdminChatWidget: Error sending message:', error)
      
      // Update message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
      ))
    } finally {
      setIsSending(false)
    }
  }, [messageInput, selectedConversation, isSending, socketSendMessage, isConnected, user, scrollToBottom, onMessageSent])

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // TODO: Implement file upload logic
    console.log('File selected:', file.name)
  }, [])

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessageInput(prev => prev + emoji)
    setShowEmojiPicker(false)
    messageInputRef.current?.focus()
  }, [])

  // Handle message actions
  const handleMessageAction = useCallback((action: string, message: Message) => {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(message.content)
        break
      case 'edit':
        // TODO: Implement message editing
        console.log('Edit message:', message.id)
        break
      case 'delete':
        // TODO: Implement message deletion
        console.log('Delete message:', message.id)
        break
      case 'react':
        // TODO: Implement message reactions
        console.log('React to message:', message.id)
        break
    }
  }, [])

  // Handle conversation actions
  const handleConversationAction = useCallback((action: string) => {
    if (!selectedConversation) return

    switch (action) {
      case 'assign':
        // TODO: Implement conversation assignment
        console.log('Assign conversation:', selectedConversation.id)
        break
      case 'close':
        // TODO: Implement conversation closing
        console.log('Close conversation:', selectedConversation.id)
        break
      case 'priority':
        // TODO: Implement priority change
        console.log('Change priority:', selectedConversation.id)
        break
      case 'tags':
        // TODO: Implement tag management
        console.log('Manage tags:', selectedConversation.id)
        break
    }
  }, [selectedConversation])

  if (!selectedConversation) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-96 text-center">
          <CardHeader>
            <MessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <CardTitle className="text-xl text-gray-600">No Conversation Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Select a conversation from the sidebar to start chatting with a customer.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline">Live Chat</Badge>
              <Badge variant="outline">Customer Support</Badge>
              <Badge variant="outline">Real-time Messaging</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConversation.customer.avatar} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {selectedConversation.customer.name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              selectedConversation.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedConversation.customer.name || 'Unknown Customer'}
            </h3>
            <p className="text-sm text-gray-500">
              {selectedConversation.customer.email || 'No email provided'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={getPriorityColor(conversationPriority)}>
            {conversationPriority}
          </Badge>
          <Badge variant={selectedConversation.status === 'active' ? 'default' : 'secondary'}>
            {selectedConversation.status}
          </Badge>
          
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Call Customer</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More Options</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 flex flex-col">
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageCircle className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Start the Conversation</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                This is the beginning of your conversation with <strong>{selectedConversation.customer.name}</strong>. 
                Send a message to start providing support.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="font-medium text-gray-900">Customer Info</span>
                  </div>
                  <p className="text-gray-600 text-xs">{selectedConversation.customer.email}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="font-medium text-gray-900">Channel</span>
                  </div>
                  <p className="text-gray-600 text-xs">{selectedConversation.channel.toUpperCase()}</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-xs text-gray-500 mb-3">Quick start tips:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Greet the customer</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Ask how you can help</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Be friendly and professional</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.sender === 'agent' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === 'agent'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  <div className={`flex items-center justify-between mt-2 text-xs ${
                    message.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    <div className="flex items-center space-x-1">
                      {message.sender === 'agent' && getMessageStatusIcon(message.status || 'sent')}
                    </div>
                  </div>
                </div>
                
                {/* Message Actions */}
                <div className={`flex items-center space-x-1 mt-1 ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleMessageAction('copy', message)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleMessageAction('react', message)}
                  >
                    <Heart className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs text-gray-500 ml-2">Customer is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Textarea
              ref={messageInputRef}
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value)
                handleTyping()
              }}
              onKeyPress={handleKeyPress}
              className="min-h-[40px] max-h-32 resize-none"
              disabled={isSending}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach File</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Emoji</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConversationAction('assign')}
            >
              <User className="h-3 w-3 mr-1" />
              Assign
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConversationAction('priority')}
            >
              <Flag className="h-3 w-3 mr-1" />
              Priority
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConversationAction('tags')}
            >
              <Tag className="h-3 w-3 mr-1" />
              Tags
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            {isConnected ? (
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Connected
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                Disconnected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,application/pdf,.doc,.docx,.txt"
      />
    </div>
  )
}

export default ModernAdminChatWidget