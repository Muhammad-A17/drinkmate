"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  MessageSquare, 
  Search, 
  Send, 
  Phone, 
  Mail, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Reply,
  Archive,
  Ticket,
  Trash2,
  Bell,
  BellOff,
  Settings,
  Download,
  Tag,
  Star,
  Users,
  MessageCircle,
  Zap,
  Activity,
  RefreshCw,
  Loader2,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Smile,
  Paperclip,
  Mic,
  Video,
  Copy,
  ExternalLink,
  Shield,
  TrendingUp,
  BarChart3,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  Minus,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Flag
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useTranslation } from '@/lib/contexts/translation-context'
import { useSocket } from '@/lib/contexts/socket-context'
import { io } from 'socket.io-client'
import ModernAdminChatWidget from '@/components/chat/ModernAdminChatWidget'
import VirtualizedConversationList from '@/components/chat/VirtualizedConversationList'
import VirtualizedMessageList from '@/components/chat/VirtualizedMessageList'
import LazyChatWidget from '@/components/chat/LazyChatWidget'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Message, Conversation } from '@/types/chat'
import { simpleETAService, SimpleETA } from '@/lib/services/simple-eta-service'

// Additional types for this component

interface Agent {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  currentChats: number
  maxChats: number
}

interface ChatStats {
  total: number
  active: number
  waiting: number
  closed: number
  unassigned: number
  slaBreach: number
  avgResponseTime: number
  avgResolutionTime: number
}

export default function ChatManagementPage() {
  const { user, isAuthenticated } = useAuth()
  const { isRTL } = useTranslation()
  const { socket: contextSocket, isConnected: contextConnected } = useSocket()
  
  // Fallback socket connection
  const [fallbackSocket, setFallbackSocket] = useState<any>(null)
  const [fallbackConnected, setFallbackConnected] = useState(false)
  
  // Use context socket if available, otherwise use fallback
  const socket = contextSocket || fallbackSocket
  const isConnected = contextConnected || fallbackConnected
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState<ChatStats>({
    total: 0,
    active: 0,
    waiting: 0,
    closed: 0,
    unassigned: 0,
    slaBreach: 0,
    avgResponseTime: 0,
    avgResolutionTime: 0
  })
  const [deletingConversation, setDeletingConversation] = useState<string | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [deletedConversations, setDeletedConversations] = useState<Set<string>>(new Set())
  const [responseETA, setResponseETA] = useState<SimpleETA | null>(null)
  const [etaLoading, setEtaLoading] = useState(false)
  const [sessionsNearExpiry, setSessionsNearExpiry] = useState<any[]>([])
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  
  // Queue tabs
  const [activeQueueTab, setActiveQueueTab] = useState<'my-inbox' | 'unassigned' | 'waiting-customer' | 'waiting-agent' | 'high-priority' | 'closed'>('unassigned')
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDoNotDisturb, setIsDoNotDisturb] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversations, setSelectedConversations] = useState<string[]>([])
  const [showMobileQueue, setShowMobileQueue] = useState(false)
  const [showMobileContext, setShowMobileContext] = useState(false)
  
  // Conversation state
  const [newMessage, setNewMessage] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [showCannedReplies, setShowCannedReplies] = useState(false)
  const [showChannelSwitch, setShowChannelSwitch] = useState(false)
  const [showTicketConversion, setShowTicketConversion] = useState(false)
  
  // Dialog states
  const [isSnoozeDialogOpen, setIsSnoozeDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isPriorityDialogOpen, setIsPriorityDialogOpen] = useState(false)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)

  // Fetch real chat data
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      console.log('Fetching chats with token:', token ? 'present' : 'missing')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Chat fetch response status:', response.status)
      console.log('Chat fetch response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const data = await response.json()
        console.log('Chat fetch response data:', data)
        const chatData = data.data.chats || []
        console.log('Chat data array:', chatData)
        
        // Transform chat data to conversation format
        const transformedChats: Conversation[] = chatData.map((chat: any) => ({
          id: chat._id,
          customer: {
            id: chat.customer.userId?._id || chat.customer._id || 'anonymous',
            name: chat.customer.name || 
                  (chat.customer.userId ? 
                    (chat.customer.userId.name || 
                     chat.customer.userId.fullName || 
                     `${chat.customer.userId.firstName || ''} ${chat.customer.userId.lastName || ''}`.trim() || 
                     chat.customer.userId.username) : '') || 
                  'Unknown Customer',
            email: chat.customer.email || 'no-email@example.com',
            phone: chat.customer.phone,
            language: 'en', // Default, could be enhanced
            timezone: 'Asia/Riyadh', // Default
            lastSeen: formatRelativeTime(chat.lastMessageAt)
          },
          channel: 'web', // Default for now, could be enhanced
          status: mapChatStatus(chat.status),
          priority: chat.priority || 'medium',
          assigneeId: chat.assignedTo?._id,
          assignee: chat.assignedTo ? {
            id: chat.assignedTo._id,
            name: chat.assignedTo.name || 
                  chat.assignedTo.fullName || 
                  `${chat.assignedTo.firstName || ''} ${chat.assignedTo.lastName || ''}`.trim() || 
                  chat.assignedTo.username || 
                  'Unknown Agent',
            avatar: chat.assignedTo.avatar
          } : undefined,
          lastMessage: {
            content: chat.messages && chat.messages.length > 0 
              ? chat.messages[chat.messages.length - 1].content 
              : 'No messages yet',
            timestamp: chat.lastMessageAt,
            sender: chat.messages && chat.messages.length > 0 
              ? chat.messages[chat.messages.length - 1].sender 
              : 'customer'
          },
          sla: {
            firstResponse: calculateSLA(chat.createdAt, chat.status),
            resolution: calculateResolutionSLA(chat.createdAt, chat.status)
          },
          tags: [chat.category || 'general'],
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt || chat.lastMessageAt,
          messages: (chat.messages || []).map((msg: any) => ({
            id: msg._id || msg.timestamp,
            content: msg.content,
            sender: msg.sender === 'admin' ? 'agent' : msg.sender,
            timestamp: msg.timestamp,
            isNote: msg.messageType === 'system'
          })),
          commerce: {
            orderNumber: chat.orderNumber
          }
        }))
        
        // Set conversations directly without deduplication
        setConversations(transformedChats)
      } else {
        if (response.status === 401) {
          setLoading(false)
          return
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
      toast.error('Failed to fetch chats')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats({
          total: data.data.total || 0,
          active: data.data.active || 0,
          waiting: data.data.waiting || 0,
          closed: data.data.closed || 0,
          unassigned: data.data.unassigned || 0,
          slaBreach: 0, // Calculate based on SLA rules
          avgResponseTime: 120, // Could be calculated from real data
          avgResolutionTime: 1800
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  // Fetch response ETA
  const fetchResponseETA = useCallback(async () => {
    try {
      setEtaLoading(true)
      console.log('🔥 Admin: Fetching response ETA')
      
      const eta = simpleETAService.getResponseETA()
      setResponseETA(eta)
      
      console.log('🔥 Admin: Response ETA:', eta)
    } catch (error) {
      console.error('🔥 Admin: Error fetching response ETA:', error)
    } finally {
      setEtaLoading(false)
    }
  }, [])

  // Update last update time
  const updateLastUpdateTime = useCallback(() => {
    setLastUpdateTime(new Date())
  }, [])

  // Update stats
  const updateStats = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  // Helper functions
  const mapChatStatus = (status: string) => {
    switch (status) {
      case 'active': return 'active'
      case 'waiting': return 'waiting_customer'
      case 'closed': return 'closed'
      case 'resolved': return 'closed'
      default: return 'active'
    }
  }

  const calculateSLA = (createdAt: string, status: string) => {
    if (status === 'active' || status === 'resolved') return 0
    const now = new Date()
    const created = new Date(createdAt)
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000)
    return Math.max(0, 300 - diffInSeconds) // 5 minutes SLA
  }

  const calculateResolutionSLA = (createdAt: string, status: string) => {
    if (status === 'resolved') return 0
    const now = new Date()
    const created = new Date(createdAt)
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000)
    return Math.max(0, 3600 - diffInSeconds) // 1 hour resolution SLA
  }

  // Utility functions
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return MessageCircle
      case 'email': return Mail
      case 'web': return MessageSquare
      default: return MessageSquare
    }
  }

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return 'bg-green-100 text-green-800'
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'web': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'waiting_customer': return 'bg-amber-100 text-amber-800'
      case 'waiting_agent': return 'bg-blue-100 text-blue-800'
      case 'snoozed': return 'bg-gray-100 text-gray-800'
      case 'closed': return 'bg-gray-100 text-gray-600'
      case 'converted': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSLAColor = (seconds: number) => {
    if (seconds <= 30) return 'text-red-600'
    if (seconds <= 90) return 'text-amber-600'
    return 'text-green-600'
  }

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0s'
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Filter conversations based on active tab
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations]

    // Apply queue tab filter
    switch (activeQueueTab) {
      case 'my-inbox':
        filtered = filtered.filter(conv => conv.assigneeId === user?._id && conv.status !== 'closed')
        break
      case 'unassigned':
        filtered = filtered.filter(conv => !conv.assigneeId && conv.status !== 'closed')
        break
      case 'waiting-customer':
        filtered = filtered.filter(conv => conv.status === 'waiting_customer')
        break
      case 'waiting-agent':
        filtered = filtered.filter(conv => conv.status === 'waiting_agent')
        break
      case 'high-priority':
        filtered = filtered.filter(conv => conv.priority === 'urgent' || conv.priority === 'high')
        break
      case 'closed':
        filtered = filtered.filter(conv => conv.status === 'closed')
        break
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(conv => 
        conv.customer.name.toLowerCase().includes(searchLower) ||
        conv.customer.email.toLowerCase().includes(searchLower) ||
        conv.lastMessage.content.toLowerCase().includes(searchLower) ||
        conv.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Sort by SLA urgency
    return filtered.sort((a, b) => {
      // First by SLA breach risk
      if (a.sla.firstResponse <= 30 && b.sla.firstResponse > 30) return -1
      if (b.sla.firstResponse <= 30 && a.sla.firstResponse > 30) return 1
      
      // Then by priority
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      if (aPriority !== bPriority) return bPriority - aPriority
      
      // Finally by last message time
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    })
  }, [conversations, activeQueueTab, searchTerm, user?._id])


  // Initialize with real data
  // Create fallback socket connection if context socket is not available
  useEffect(() => {
    if (!contextSocket && user && !fallbackSocket) {
      console.log('Creating fallback socket connection for admin')
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      
      if (token) {
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
          auth: { token },
          transports: ['websocket', 'polling']
        })
        
        newSocket.on('connect', () => {
          console.log('Fallback socket connected:', newSocket.id)
          setFallbackConnected(true)
        })
        
        newSocket.on('disconnect', () => {
          console.log('Fallback socket disconnected')
          setFallbackConnected(false)
        })
        
        newSocket.on('connect_error', (error) => {
          console.error('Fallback socket connection error:', error)
          setFallbackConnected(false)
        })
        
        setFallbackSocket(newSocket)
        
        return () => {
          newSocket.disconnect()
        }
      }
    }
  }, [contextSocket, user, fallbackSocket])

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchChats()
      fetchStats()
      fetchResponseETA()
    } else {
      setLoading(false) // Stop loading if not authenticated
    }
  }, [fetchChats, fetchStats, fetchResponseETA, user, isAuthenticated])

  // Set up polling for real-time updates (reduced frequency since we have sockets)
  useEffect(() => {
    const interval = setInterval(() => {
      // Don't poll if we're currently deleting a conversation or if we have an active conversation selected
      if (!deletingConversation && !selectedConversation) {
        fetchChats()
        fetchStats()
        // fetchSessionsNearExpiry will be added after the function is declared
      }
    }, 30000) // Poll every 30 seconds for backup updates (reduced from 10s)

    return () => clearInterval(interval)
  }, [fetchChats, fetchStats, deletingConversation, selectedConversation])

  // Poll for sessions near expiry will be added after function declaration

  // Socket event listeners for real-time updates
  useEffect(() => {
    console.log('Socket effect running:', { socket, isConnected, socketType: typeof socket })
    
    if (!socket || !isConnected) {
      console.log('Socket not available or not connected, skipping event listeners')
      return
    }

    const handleNewMessage = (data: { chatId: string; message: any }) => {
      // Skip if this is a message from the current admin (already handled optimistically)
      if (data.message.senderId === user?._id) {
        return
      }
      
      // Determine if this is an admin/agent message based on sender type
      const isAgentMessage = data.message.sender === 'admin' || data.message.sender === 'agent'
      
      const newMessage: Message = {
        id: data.message._id || data.message.timestamp,
        content: data.message.content,
        sender: isAgentMessage ? 'agent' : 'customer',
        timestamp: data.message.timestamp,
        isNote: data.message.messageType === 'system'
      }
      
      // Update the conversations list
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === data.chatId) {
            // Check if message already exists to prevent duplicates
            const messageExists = conv.messages.some(msg => msg.id === newMessage.id)
            if (messageExists) return conv
            
            const updatedConv = {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: {
                content: data.message.content,
                timestamp: data.message.timestamp,
                sender: (isAgentMessage ? 'agent' : 'customer') as 'agent' | 'customer'
              },
              updatedAt: new Date().toISOString()
            }
            
            // Auto-assign to current admin if it's an agent message and not assigned
            if (isAgentMessage && !conv.assigneeId && user?._id) {
              updatedConv.assigneeId = user._id
              updatedConv.assignee = {
                id: user._id,
                name: user.name || 'Support',
                avatar: user.avatar
              }
            }
            
            return updatedConv
          }
          return conv
        })
        
        // Only update if there were actual changes
        const hasChanges = updated.some((conv, index) => conv !== prev[index])
        return hasChanges ? updated : prev
      })

      // Update selected conversation if it's the same chat
      if (selectedConversation && selectedConversation.id === data.chatId) {
        // Check if message already exists to prevent duplicates
        const messageExists = selectedConversation.messages.some(msg => msg.id === newMessage.id)
        if (!messageExists) {
          const updatedConv = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, newMessage],
            lastMessage: {
              content: data.message.content,
              timestamp: data.message.timestamp,
              sender: (isAgentMessage ? 'agent' : 'customer') as 'agent' | 'customer'
            }
          }
          
          // Auto-assign to current admin if it's an agent message and not assigned
          if (isAgentMessage && !selectedConversation.assigneeId && user?._id) {
            updatedConv.assigneeId = user._id
            updatedConv.assignee = {
              id: user._id,
              name: user.name || 'Support',
              avatar: user.avatar
            }
          }
          
          setSelectedConversation(updatedConv)
        }
      }
      
      // Update stats and last update time only when there are actual changes
      updateLastUpdateTime()
      updateStats()
    }

    const handleChatUpdate = (data: { chatId: string; status?: string; assignedTo?: any }) => {
      console.log('Chat update received:', data)
      
      // Update the conversations list
      setConversations(prev => prev.map(conv => {
        if (conv.id === data.chatId) {
          return {
            ...conv,
            status: data.status ? mapChatStatus(data.status) : conv.status,
            assigneeId: data.assignedTo?._id || conv.assigneeId,
            assignee: data.assignedTo ? {
              id: data.assignedTo._id,
              name: `${data.assignedTo.firstName} ${data.assignedTo.lastName}`,
              avatar: data.assignedTo.avatar
            } : conv.assignee
          }
        }
        return conv
      }))

      // Update selected conversation if it's the same chat
      if (selectedConversation && selectedConversation.id === data.chatId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          status: data.status ? mapChatStatus(data.status) : prev.status,
          assigneeId: data.assignedTo?._id || prev.assigneeId,
          assignee: data.assignedTo ? {
            id: data.assignedTo._id,
            name: `${data.assignedTo.firstName} ${data.assignedTo.lastName}`,
            avatar: data.assignedTo.avatar
          } : prev.assignee
        } : null)
      }
    }

    const handleChatCreated = (data: { chat: any }) => {
      console.log('New chat created:', data)
      // Refresh the conversations list to include the new chat
      fetchChats()
    }

    const handleChatDeleted = (data: { chatId: string }) => {
      updateLastUpdateTime() // Update last update time
      updateStats() // Update stats in real-time
      // Remove the chat from the conversations list
      setConversations(prev => {
        const updated = prev.filter(conv => conv.id !== data.chatId)
        console.log('🔥 Socket: Removed chat from conversations, remaining count:', updated.length)
        return updated
      })
      
      // Clear selected conversation if it was deleted
      if (selectedConversation && selectedConversation.id === data.chatId) {
        setSelectedConversation(null)
      }
    }

    // Register socket event listeners
    if (socket && typeof socket.on === 'function') {
      socket.on('new_message', handleNewMessage)
      socket.on('chat_updated', handleChatUpdate)
      socket.on('chat_created', handleChatCreated)
      socket.on('chat_deleted', handleChatDeleted)
    }

    // Cleanup
    return () => {
      if (socket && typeof socket.off === 'function') {
        console.log('Cleaning up socket event listeners')
        socket.off('new_message', handleNewMessage)
        socket.off('chat_updated', handleChatUpdate)
        socket.off('chat_created', handleChatCreated)
        socket.off('chat_deleted', handleChatDeleted)
      }
    }
  }, [socket, isConnected, selectedConversation, fetchChats])

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    
    // Join the chat room for real-time updates
    if (socket && typeof socket.emit === 'function') {
      console.log('Admin joining chat room:', conversation.id)
      socket.emit('join_chat', conversation.id)
    }
    
    // Load messages for the selected conversation
    console.log('🔥 Chat Management: Loading messages for conversation:', conversation.id)
  }

  // Handle conversation assignment
  const handleAssignConversation = async (conversationId: string, assigneeId: string) => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assignedTo: assigneeId
        })
      })

      if (response.ok) {
        await fetchChats()
        toast.success('Conversation assigned successfully')
      } else {
        toast.error('Failed to assign conversation')
      }
    } catch (error) {
      console.error('Error assigning conversation:', error)
      toast.error('Failed to assign conversation')
    }
  }

  // Handle conversation status update
  const handleUpdateStatus = async (conversationId: string, status: string) => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: status
        })
      })

      if (response.ok) {
        await fetchChats()
        toast.success('Status updated successfully')
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  // Handle message send
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return

    setSendingMessage(true)
    
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      
      // Send via socket for real-time updates
      if (socket && isConnected && typeof socket.emit === 'function') {
        socket.emit('send_message', {
          chatId: selectedConversation.id,
          content: newMessage,
          type: isInternalNote ? 'system' : 'text'
        })
        
        // Emit chat_updated event to notify customer that agent has responded
        if (!isInternalNote && user) {
          socket.emit('chat_updated', {
            chatId: selectedConversation.id,
            status: 'active',
            assignedTo: {
              id: user._id,
              name: user.name
            }
          })
        }
      }

      // Also send via API for persistence
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage,
          messageType: isInternalNote ? 'system' : 'text'
        })
      })

      if (response.ok) {
        // Optimistically update the UI
        const message: Message = {
          id: Date.now().toString(),
          content: newMessage,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          isNote: isInternalNote
        }

        setSelectedConversation(prev => {
          if (!prev) return null
          
          const updatedConv = {
            ...prev,
            messages: [...prev.messages, message],
            lastMessage: {
              content: newMessage,
              timestamp: message.timestamp,
              sender: 'agent' as 'agent' | 'customer'
            },
            // Update status to active when admin responds
            status: prev.status === 'waiting_customer' || prev.status === 'waiting_agent' ? 'active' : prev.status
          }
          
          // Auto-assign to current admin if not already assigned
          if (!prev.assigneeId && user?._id) {
            updatedConv.assigneeId = user._id
            updatedConv.assignee = {
              id: user._id,
              name: user.name || 'Support',
              avatar: user.avatar
            }
          }
          
          return updatedConv
        })

        // Update conversations list
        setConversations(prev => prev.map(conv => {
          if (conv.id === selectedConversation.id) {
            const updatedConv = {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: {
                content: newMessage,
                timestamp: message.timestamp,
                sender: 'agent' as 'agent' | 'customer'
              },
              // Update status to active when admin responds
              status: conv.status === 'waiting_customer' || conv.status === 'waiting_agent' ? 'active' : conv.status,
              updatedAt: new Date().toISOString()
            }
            
            // Auto-assign to current admin if not already assigned
            if (!conv.assigneeId && user?._id) {
              updatedConv.assigneeId = user._id
              updatedConv.assignee = {
                id: user._id,
                name: user.name || 'Support',
                avatar: user.avatar
              }
            }
            
            return updatedConv
          }
          return conv
        }))

        setNewMessage('')
        setIsInternalNote(false)
        toast.success(isInternalNote ? 'Note added' : 'Message sent')
      } else {
        console.log('🔥 Socket not connected, cannot send message')
        toast.error('Not connected to chat. Please try again.')
      }
    } catch (err: any) {
      console.error('Error sending message:', err)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  // Handle conversation deletion
  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return
    }

    setDeletingConversation(conversationId)
    
    // Don't immediately remove from UI - keep it visible with loading state
    // The conversation will be marked as deleting and blurred
    
    // Set a timeout to prevent infinite deleting state (10 seconds)
    const deletionTimeout = setTimeout(() => {
      console.log('🔥 Deletion timeout reached, clearing deleting state')
      setDeletingConversation(null)
      toast.error('Deletion timed out. Please try again.')
    }, 10000)
    
    try {
      console.log('Attempting to delete conversation:', conversationId)
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      console.log('Authentication token available:', token ? 'yes' : 'no')
      
      // Decode token to check admin status (without logging sensitive data)
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          // Only log non-sensitive information
          console.log('Token validation successful')
        } catch (e) {
          console.error('Error decoding token')
        }
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Delete response status:', response.status)
      console.log('Delete response statusText:', response.statusText)
      console.log('Delete response headers:', Object.fromEntries(response.headers.entries()))
      console.log('Delete response URL:', response.url)
      console.log('Delete response ok:', response.ok)
      
      if (response.ok) {
        console.log('🔥 Deletion successful, now removing from UI')
        
        // Clear timeout immediately on success
        clearTimeout(deletionTimeout)
        
        // Only remove from UI after successful server confirmation
        setConversations(prev => prev.filter(conv => conv.id !== conversationId))
        if (selectedConversation && selectedConversation.id === conversationId) {
          setSelectedConversation(null)
        }
        
        // Emit socket event for real-time updates
        if (socket && typeof socket.emit === 'function') {
          console.log('🔥 Emitting chat_deleted event for real-time update')
          socket.emit('chat_deleted', { chatId: conversationId })
        }
        
        // Update stats in background (don't await)
        fetchStats()
        
        // Success - no need to read response body
        console.log('Delete operation completed successfully')
        
        toast.success('Conversation deleted successfully')
      } else {
        let errorMessage = 'Failed to delete conversation'
        try {
          // Try to get error details from response
          const contentType = response.headers.get('content-type')
          console.log('Error response content type:', contentType)
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            console.error('Delete error response:', errorData)
            if (errorData && Object.keys(errorData).length > 0) {
              errorMessage = errorData.message || errorData.error || errorMessage
            }
          } else {
            // Try to get text response
            const errorText = await response.text()
            console.error('Raw error response:', errorText)
            if (errorText && errorText.trim()) {
              errorMessage = errorText
            }
          }
        } catch (parseError) {
          console.error('Error parsing delete error response:', parseError)
          // Use default error message
        }
        
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('🔥 Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    } finally {
      // Clear timeout and deleting state
      clearTimeout(deletionTimeout)
      setDeletingConversation(null)
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault()
            handleSendMessage()
            break
          case 'a':
            e.preventDefault()
            // Assign conversation
            break
          case 'p':
            e.preventDefault()
            // Set priority
            break
          case 't':
            e.preventDefault()
            // Convert to ticket
            break
          case 's':
            e.preventDefault()
            // Snooze conversation
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [newMessage, selectedConversation])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Activity className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-gray-600">Loading chat console...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col relative">
        {/* Header with Stats */}
        <div className="flex-shrink-0 border-b bg-white relative z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative z-40">
                <h1 className="text-2xl font-bold text-gray-900">Chat Console</h1>
                <p className="text-sm text-gray-600">Real-time customer support management</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Real-time connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-40">
                <Button variant="outline" size="sm" onClick={() => {
                  fetchChats()
                  fetchStats()
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowMobileQueue(!showMobileQueue)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Queue
                </Button>
                <Button variant="outline" size="sm" className="xl:hidden" onClick={() => setShowMobileContext(!showMobileContext)}>
                  <User className="w-4 h-4 mr-2" />
                  Context
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/chat-management/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/chat-management/debug">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Debug
                  </Link>
                </Button>
                <Button
                  variant={isDoNotDisturb ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => {
                    setIsDoNotDisturb(!isDoNotDisturb)
                    toast.success(isDoNotDisturb ? 'You are now available' : 'Do not disturb mode enabled')
                  }}
                >
                  {isDoNotDisturb ? <BellOff className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                  {isDoNotDisturb ? 'DND' : 'Available'}
                </Button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.waiting}</div>
                <div className="text-xs text-gray-600">Waiting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.unassigned}</div>
                <div className="text-xs text-gray-600">Unassigned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.slaBreach}</div>
                <div className="text-xs text-gray-600">SLA Breach</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}s</div>
                <div className="text-xs text-gray-600">Avg Response</div>
              </div>
            </div>

            {/* Response ETA Display */}
            {responseETA && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      responseETA.isOnline ? 'bg-green-500' : 'bg-orange-500'
                    }`} />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {responseETA.isOnline ? 'Chat Online' : 'Chat Offline'}
                      </span>
                      {!responseETA.isOnline && responseETA.nextAvailable && (
                        <span className="text-xs text-gray-600 ml-2">
                          (Next available: {responseETA.nextAvailable})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {etaLoading ? (
                        <span className="text-xs text-gray-500">Calculating...</span>
                      ) : (
                        <>
                          <span className="text-blue-600">
                            {responseETA.estimatedResponseTime}
                          </span>
                          {responseETA.queuePosition !== undefined && responseETA.queuePosition > 0 && (
                            <span className="text-xs text-gray-500 ml-1">
                              (Queue: #{responseETA.queuePosition + 1})
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {responseETA.currentLoad && (
                      <div className={`text-xs ${
                        responseETA.currentLoad === 'low' ? 'text-green-600' :
                        responseETA.currentLoad === 'medium' ? 'text-yellow-600' :
                        responseETA.currentLoad === 'high' ? 'text-orange-600' :
                        responseETA.currentLoad === 'critical' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {responseETA.currentLoad === 'low' ? 'Low Load' :
                         responseETA.currentLoad === 'medium' ? 'Medium Load' :
                         responseETA.currentLoad === 'high' ? 'High Load' :
                         responseETA.currentLoad === 'critical' ? 'Critical Load' : 'Unknown'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3-Pane Console - Redesigned */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Left Pane - Conversation List */}
          <div className="w-80 border-r bg-white flex flex-col relative z-10 hidden lg:flex">
            {/* Queue Tabs */}
            <div className="flex-shrink-0 border-b relative z-20">
              <Tabs value={activeQueueTab} onValueChange={(value: string) => setActiveQueueTab(value as any)}>
                <TabsList className="grid grid-cols-3 w-full rounded-none">
                  <TabsTrigger value="my-inbox" className="text-xs">My Inbox</TabsTrigger>
                  <TabsTrigger value="unassigned" className="text-xs">Unassigned</TabsTrigger>
                  <TabsTrigger value="waiting-customer" className="text-xs">Waiting</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-3 w-full rounded-none border-t">
                  <TabsTrigger value="waiting-agent" className="text-xs">Agent Wait</TabsTrigger>
                  <TabsTrigger value="high-priority" className="text-xs">High Priority</TabsTrigger>
                  <TabsTrigger value="closed" className="text-xs">Closed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Search */}
            <div className="flex-shrink-0 p-4 border-b relative z-20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation, index) => {
                const ChannelIcon = getChannelIcon(conversation.channel)
                const isSelected = selectedConversation?.id === conversation.id
                const isUrgent = conversation.sla.firstResponse <= 30
                const isWarning = conversation.sla.firstResponse <= 90 && conversation.sla.firstResponse > 30
                
                
                const isDeleting = deletingConversation === conversation.id
                
                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-4 border-b cursor-pointer hover:bg-gray-50 transition-all duration-300 relative",
                      isSelected && "bg-blue-50 border-blue-200",
                      isUrgent && "bg-red-50 border-red-200",
                      isWarning && "bg-amber-50 border-amber-200",
                      isDeleting && "opacity-50 blur-sm pointer-events-none"
                    )}
                    onClick={() => !isDeleting && handleConversationSelect(conversation)}
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
                        <div className={cn("p-1 rounded", getChannelColor(conversation.channel))}>
                          <ChannelIcon className="h-3 w-3" />
                        </div>
                        <span className="font-medium text-sm">{conversation.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Are you sure you want to delete this conversation?')) {
                              handleDeleteConversation(conversation.id)
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Badge className={cn("text-xs", getStatusColor(conversation.status))}>
                          {conversation.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={cn("text-xs", getPriorityColor(conversation.priority))}>
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
                            <span>{conversation.assignee.name}</span>
                          </div>
                        )}
                        {sessionsNearExpiry.some(s => s.id === conversation.id) && (() => {
                          const session = sessionsNearExpiry.find(s => s.id === conversation.id)
                          const timeLeft = session ? Math.floor(session.timeUntilExpiry / (1000 * 60)) : 0
                          return (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <Clock className="h-3 w-3" />
                              <span>Near expiry {timeLeft}m</span>
                            </div>
                          )
                        })()}
                        {conversation.rating && (
                          <div className="flex items-center gap-1 text-xs">
                            <Star className={`h-3 w-3 ${conversation.rating.score >= 4 ? 'text-yellow-500 fill-current' : conversation.rating.score >= 3 ? 'text-yellow-400' : 'text-red-400'}`} />
                            <span className={conversation.rating.score >= 4 ? 'text-green-600' : conversation.rating.score >= 3 ? 'text-yellow-600' : 'text-red-600'}>
                              {conversation.rating.score}/5
                            </span>
                          </div>
                        )}
                        <span className={cn("font-mono", getSLAColor(conversation.sla.firstResponse))}>
                          {formatTime(conversation.sla.firstResponse)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Middle Pane - Conversation */}
          <div className="flex-1 flex flex-col bg-white min-h-0 relative z-10">
            {selectedConversation ? (
              <>
                {/* Simplified Header - Just Customer Name and Status */}
                <div className="flex-shrink-0 p-3 border-b bg-gray-50 relative z-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedConversation.customer.name || 'Unknown Customer'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedConversation.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm text-gray-500 capitalize">
                            {selectedConversation.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modern Admin Chat Widget - Full Height */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <ModernAdminChatWidget 
                    selectedConversation={selectedConversation}
                    onMessageSent={(message) => {
                      // Update the conversation with the new message
                      setSelectedConversation(prev => {
                        if (!prev) return prev
                        return {
                          ...prev,
                          messages: [...prev.messages, message],
                          lastMessage: {
                            content: message.content,
                            timestamp: message.timestamp,
                            sender: 'agent' as 'agent' | 'customer'
                          }
                        }
                      })
                    }}
                    onConversationUpdate={(updatedConversation) => {
                      // Update the conversation in the list
                      setConversations(prev => 
                        prev.map(conv => 
                          conv.id === updatedConversation.id ? updatedConversation : conv
                        )
                      )
                      setSelectedConversation(updatedConversation)
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <MessageSquare className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Chat Console</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Select a conversation from the list to start chatting with customers. 
                    You can manage multiple conversations and provide real-time support.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="font-medium text-gray-900">Active Chats</span>
                      </div>
                      <p className="text-gray-600">{stats.active} conversations</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="font-medium text-gray-900">Waiting</span>
                      </div>
                      <p className="text-gray-600">{stats.waiting} conversations</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Pane - Context */}
          <div className="w-80 border-l bg-white flex flex-col relative z-10 hidden xl:flex">
            {selectedConversation ? (
              <>
                {/* Customer Profile - Clean & Organized */}
                <div className="flex-shrink-0 p-4 border-b relative z-20">
                  <h3 className="font-semibold mb-4 text-gray-900">Customer Information</h3>
                  
                  {/* Contact Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{selectedConversation.customer.name}</div>
                        <div className="text-xs text-gray-500">{selectedConversation.customer.email}</div>
                      </div>
                    </div>
                    
                    {selectedConversation.customer.phone && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-sm text-gray-900">{selectedConversation.customer.phone}</div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-900">{selectedConversation.channel.toUpperCase()}</div>
                        <div className="text-xs text-gray-500">Last seen: {selectedConversation.customer.lastSeen}</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions - Prioritized */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Flag className="h-3 w-3 mr-1" />
                        Priority
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        Tags
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Snooze
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Commerce Context */}
                {selectedConversation.commerce && (
                  <div className="flex-1 p-4 border-b">
                    <h3 className="font-semibold mb-3">Commerce Context</h3>
                    <div className="space-y-3">
                      {selectedConversation.commerce.latestOrder && (
                        <div>
                          <div className="text-sm font-medium text-gray-700">Latest Order</div>
                          <div className="text-sm text-gray-900">
                            {selectedConversation.commerce.latestOrder.id} - {selectedConversation.commerce.latestOrder.status}
                          </div>
                        </div>
                      )}
                      {selectedConversation.commerce.subscription && (
                        <div>
                          <div className="text-sm font-medium text-gray-700">Subscription</div>
                          <div className="text-sm text-gray-900">
                            {selectedConversation.commerce.subscription.id} - {selectedConversation.commerce.subscription.status}
                          </div>
                        </div>
                      )}
                      {selectedConversation.commerce.co2Cylinders && selectedConversation.commerce.co2Cylinders.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700">CO₂ Cylinders</div>
                          <div className="text-sm text-gray-900">
                            {selectedConversation.commerce.co2Cylinders.length} active
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <User className="h-16 w-16 text-gray-300 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Context</h3>
                    <p className="text-gray-600">Select a conversation to view customer details</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Queue Overlay */}
      {showMobileQueue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Conversation Queue</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowMobileQueue(false)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            <div className="h-full overflow-y-auto">
              {/* Queue content would go here - same as the left pane */}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Context Overlay */}
      {showMobileContext && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 xl:hidden">
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Customer Context</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowMobileContext(false)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            <div className="h-full overflow-y-auto">
              {/* Context content would go here - same as the right pane */}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
