"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, type ButtonProps } from '@/components/ui/button'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  MoreHorizontal,
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
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/translation-context'
import { useSocket } from '@/lib/socket-context'
import { io } from 'socket.io-client'
import ModernAdminChatWidget from '@/components/chat/ModernAdminChatWidget'
import VirtualizedConversationList from '@/components/chat/VirtualizedConversationList'
import VirtualizedMessageList from '@/components/chat/VirtualizedMessageList'
import LazyChatWidget from '@/components/chat/LazyChatWidget'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Message, Conversation } from '@/types/chat'
import { simpleETAService, SimpleETA } from '@/lib/simple-eta-service'

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
  avgRating: number
}

export default function ChatManagementPage() {
  const { user, isAuthenticated } = useAuth()
  const { isRTL } = useTranslation()
  const { socket: contextSocket, isConnected: contextConnected, connectSocket, disconnectSocket } = useSocket()
  
  // Fallback socket connection
  const [fallbackSocket, setFallbackSocket] = useState<any>(null)
  const [fallbackConnected, setFallbackConnected] = useState(false)
  
  // Use context socket if available, otherwise use fallback
  const socket = contextSocket || fallbackSocket
  const isConnected = contextConnected || fallbackConnected

  // Auto-connect socket for admin users
  useEffect(() => {
    if (user && isAuthenticated && user.isAdmin) {
      console.log('Admin user detected, connecting socket...')
      connectSocket()
    }
    
    return () => {
      if (user && user.isAdmin) {
        console.log('Admin user logging out, disconnecting socket...')
        disconnectSocket()
      }
    }
  }, [user, isAuthenticated]) // Removed connectSocket and disconnectSocket from dependencies
  
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
    avgResolutionTime: 0,
    avgRating: 0
  })
  const [deletingConversation, setDeletingConversation] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [deletedConversations, setDeletedConversations] = useState<Set<string>>(new Set())
  const [responseETA, setResponseETA] = useState<SimpleETA | null>(null)
  const [etaLoading, setEtaLoading] = useState(false)
  
  // Queue tabs
  const [activeQueueTab, setActiveQueueTab] = useState<'my-inbox' | 'unassigned' | 'waiting-customer' | 'waiting-agent' | 'high-priority' | 'closed'>('unassigned')
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDoNotDisturb, setIsDoNotDisturb] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversations, setSelectedConversations] = useState<string[]>([])
  const [newChatNotifications, setNewChatNotifications] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  
  // Function to update last update time
  const updateLastUpdateTime = useCallback(() => {
    setLastUpdateTime(new Date())
  }, [])
  
  // Function to update stats in real-time
  const updateStats = useCallback(() => {
    setConversations(prevConversations => {
      const newStats = {
        total: prevConversations.length,
        active: prevConversations.filter(conv => conv.status === 'active').length,
        waiting: prevConversations.filter(conv => conv.status === 'waiting_customer' || conv.status === 'waiting_agent').length,
        closed: prevConversations.filter(conv => conv.status === 'closed').length,
        unassigned: prevConversations.filter(conv => !conv.assigneeId).length,
        slaBreach: prevConversations.filter(conv => conv.sla.firstResponse <= 0 || conv.sla.resolution <= 0).length,
        avgResponseTime: 120, // This could be calculated from actual data
        avgResolutionTime: 300, // This could be calculated from actual data
        avgRating: prevConversations.filter(conv => conv.rating).length > 0 
          ? prevConversations
              .filter(conv => conv.rating)
              .reduce((sum, conv) => sum + (conv.rating?.score || 0), 0) / 
              prevConversations.filter(conv => conv.rating).length
          : 0
      }
      setStats(newStats)
      return prevConversations
    })
  }, [])
  
  // Function to clear new chat notifications
  const clearNotifications = useCallback(() => {
    setNewChatNotifications(0)
  }, [])
  
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
  
  // Session timeout state
  const [sessionsNearExpiry, setSessionsNearExpiry] = useState<any[]>([])
  const [sessionTimeoutInfo, setSessionTimeoutInfo] = useState<any>(null)

  // Fetch real chat data
  const fetchChats = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      
      if (!token) {
        setLoading(false)
        return
      }
      
      const response = await fetch('http://localhost:3000/chat', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const chatData = data.data.chats || []
        
        // Transform chat data to conversation format
        const transformedChats: Conversation[] = chatData.map((chat: any) => ({
          id: chat._id,
          customer: {
            id: chat.customer.userId?._id || chat.customer._id || 'anonymous',
            name: chat.customer.name || (chat.customer.userId ? 
              (chat.customer.userId.name || 
               (chat.customer.userId.firstName && chat.customer.userId.lastName ? 
                `${chat.customer.userId.firstName} ${chat.customer.userId.lastName}` : 
                chat.customer.userId.firstName || 
                chat.customer.userId.username || 
                'Unknown Customer')) : '') || 'Unknown Customer',
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
              (chat.assignedTo.firstName && chat.assignedTo.lastName ? 
                `${chat.assignedTo.firstName} ${chat.assignedTo.lastName}` : 
                chat.assignedTo.firstName || 
                chat.assignedTo.username || 
                'Support'),
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
          rating: chat.rating ? {
            score: chat.rating.score,
            feedback: chat.rating.feedback,
            ratedAt: chat.rating.ratedAt
          } : undefined,
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
        
        // Filter out deleted conversations and update
        const filteredChats = transformedChats.filter(chat => !deletedConversations.has(chat.id))
        setConversations(filteredChats)
      } else {
        if (response.status === 401) {
          setLoading(false)
          return
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
      // Only show toast on first load, not for polling
      toast.error('Failed to fetch chats')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch('http://localhost:3000/chat/stats', {
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
          avgResolutionTime: 1800,
          avgRating: data.data.avgRating || 0
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
    
    return filtered
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
      // Don't poll if we're currently deleting a conversation
      if (!deletingConversation) {
        fetchChats()
        fetchStats()
        // fetchSessionsNearExpiry will be added after the function is declared
      }
    }, 10000) // Poll every 10 seconds for backup updates

    return () => clearInterval(interval)
  }, [fetchChats, fetchStats, deletingConversation])

  // Poll for sessions near expiry will be added after function declaration

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) {
      return
    }

    const handleNewMessage = (data: { chatId: string; message: any }) => {
      console.log('🔥 Admin Chat Management: New message received:', data)
      
      // Validate data structure
      if (!data || !data.chatId || !data.message) {
        console.error('🔥 Admin Chat Management: Invalid message data structure:', data)
        return
      }
      
      // Skip if this is a message from the current admin (already handled optimistically)
      if (data.message.senderId === user?._id) {
        console.log('🔥 Admin Chat Management: Skipping message from current admin')
        return
      }
      
      // Determine if this is an admin/agent message based on sender type
      const isAgentMessage = data.message.sender === 'admin' || data.message.sender === 'agent'
      
      const newMessage: Message = {
        id: data.message._id || data.message.timestamp || `msg_${Date.now()}`,
        content: data.message.content || '',
        sender: isAgentMessage ? 'agent' : 'customer',
        timestamp: data.message.timestamp || new Date().toISOString(),
        isNote: data.message.messageType === 'system'
      }
      
      // Update the conversations list
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === data.chatId) {
            // Check if message already exists to prevent duplicates
            const messageExists = conv.messages.some(msg => 
              msg.id === newMessage.id || 
              (msg.content === newMessage.content && msg.timestamp === newMessage.timestamp)
            )
            if (messageExists) {
              console.log('🔥 Admin Chat Management: Message already exists in conversation, skipping')
              return conv
            }
            
            console.log('🔥 Admin Chat Management: Adding new message to conversation')
            const updatedConv = {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: {
                content: newMessage.content,
                timestamp: newMessage.timestamp,
                sender: newMessage.sender
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
        const messageExists = selectedConversation.messages.some(msg => 
          msg.id === newMessage.id || 
          (msg.content === newMessage.content && msg.timestamp === newMessage.timestamp)
        )
        if (!messageExists) {
          console.log('🔥 Admin Chat Management: Adding new message to selected conversation')
          const updatedConv = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, newMessage],
            lastMessage: {
              content: newMessage.content,
              timestamp: newMessage.timestamp,
              sender: newMessage.sender
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
        } else {
          console.log('🔥 Admin Chat Management: Message already exists in selected conversation, skipping')
        }
      }
      
      // Update stats and last update time only when there are actual changes
      updateLastUpdateTime()
      updateStats()
    }

    const handleChatUpdate = (data: { chatId: string; status?: string; assignedTo?: any }) => {
      updateLastUpdateTime() // Update last update time
      updateStats() // Update stats in real-time
      
      // Update the conversations list
      setConversations(prev => prev.map(conv => {
        if (conv.id === data.chatId) {
          return {
            ...conv,
            status: data.status ? mapChatStatus(data.status) : conv.status,
            assigneeId: data.assignedTo?._id || conv.assigneeId,
            assignee: data.assignedTo ? {
              id: data.assignedTo._id,
              name: data.assignedTo.name || 
                (data.assignedTo.firstName && data.assignedTo.lastName ? 
                  `${data.assignedTo.firstName} ${data.assignedTo.lastName}` : 
                  data.assignedTo.firstName || 
                  data.assignedTo.username || 
                  'Support'),
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
            name: data.assignedTo.name || 'Support',
            avatar: data.assignedTo.avatar
          } : prev.assignee
        } : null)
      }
    }

    const handleChatCreated = (data: { chat: any }) => {
      updateLastUpdateTime() // Update last update time
      updateStats() // Update stats in real-time
      
      // Transform the new chat data to conversation format
      const newConversation: Conversation = {
        id: data.chat._id,
        customer: {
          id: data.chat.customer.userId?._id || data.chat.customer._id || 'anonymous',
          name: data.chat.customer.name || (data.chat.customer.userId ? 
            (data.chat.customer.userId.name || 
             (data.chat.customer.userId.firstName && data.chat.customer.userId.lastName ? 
              `${data.chat.customer.userId.firstName} ${data.chat.customer.userId.lastName}` : 
              data.chat.customer.userId.firstName || 
              data.chat.customer.userId.username || 
              'Unknown Customer')) : '') || 'Unknown Customer',
          email: data.chat.customer.email || 'no-email@example.com',
          phone: data.chat.customer.phone,
          language: 'en',
          timezone: 'Asia/Riyadh',
          lastSeen: formatRelativeTime(data.chat.lastMessageAt)
        },
        channel: 'web',
        status: mapChatStatus(data.chat.status),
        priority: data.chat.priority || 'medium',
        assigneeId: data.chat.assignedTo?._id,
        assignee: data.chat.assignedTo ? {
          id: data.chat.assignedTo._id,
          name: data.chat.assignedTo.name || 
            (data.chat.assignedTo.firstName && data.chat.assignedTo.lastName ? 
              `${data.chat.assignedTo.firstName} ${data.chat.assignedTo.lastName}` : 
              data.chat.assignedTo.firstName || 
              data.chat.assignedTo.username || 
              'Support'),
          avatar: data.chat.assignedTo.avatar
        } : undefined,
        lastMessage: {
          content: data.chat.messages && data.chat.messages.length > 0 
            ? data.chat.messages[data.chat.messages.length - 1].content 
            : 'No messages yet',
          timestamp: data.chat.lastMessageAt,
          sender: data.chat.messages && data.chat.messages.length > 0 
            ? data.chat.messages[data.chat.messages.length - 1].sender 
            : 'customer'
        },
        sla: {
          firstResponse: calculateSLA(data.chat.createdAt, data.chat.status),
          resolution: calculateResolutionSLA(data.chat.createdAt, data.chat.status)
        },
        tags: [data.chat.category || 'general'],
        rating: data.chat.rating ? {
          score: data.chat.rating.score,
          feedback: data.chat.rating.feedback,
          ratedAt: data.chat.rating.ratedAt
        } : undefined,
        createdAt: data.chat.createdAt,
        updatedAt: data.chat.updatedAt || data.chat.lastMessageAt,
        messages: (data.chat.messages || []).map((msg: any) => ({
          id: msg._id || msg.timestamp,
          content: msg.content,
          sender: msg.sender === 'admin' ? 'agent' : msg.sender,
          timestamp: msg.timestamp,
          isNote: msg.messageType === 'system'
        })),
        commerce: {
          latestOrder: data.chat.orderNumber ? { id: data.chat.orderNumber, status: 'unknown' } : undefined
        }
      }
      
      // Add the new conversation to the list
      setConversations(prev => [newConversation, ...prev])
      
      // Increment new chat notifications
      setNewChatNotifications(prev => prev + 1)
      
      // Update stats
      fetchStats()
      
      // Show notification
      toast.success(`New chat from ${newConversation.customer.name}`)
    }

    const handleChatDeleted = (data: { chatId: string }) => {
      console.log('🔥 Socket: Chat deleted event received:', data.chatId)
      updateLastUpdateTime() // Update last update time
      updateStats() // Update stats in real-time
      
      // Add to deleted conversations set to prevent re-adding via polling
      setDeletedConversations(prev => new Set([...prev, data.chatId]))
      
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
      
      // Update stats
      fetchStats()
      
      // Show success notification
      toast.success('Chat deleted successfully')
    }

    // Register socket event listeners
    if (socket && typeof socket.on === 'function') {
      console.log('🔥 Admin Chat Management: Registering socket event listeners')
      socket.on('new_message', handleNewMessage)
      socket.on('chat_updated', handleChatUpdate)
      socket.on('chat_created', handleChatCreated)
      socket.on('chat_deleted', handleChatDeleted)
    } else {
      console.log('🔥 Admin Chat Management: Socket not available or not connected')
    }

    // Cleanup
    return () => {
      if (socket && typeof socket.off === 'function') {
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
    
    // Clear notifications when user interacts
    setNewChatNotifications(0)
    
    // Fetch session timeout info for selected conversation
    fetchSessionTimeoutInfo(conversation.id)
    
    // Join the chat room for real-time updates
    if (socket && typeof socket.emit === 'function') {
      socket.emit('join_chat', conversation.id)
    }
  }

  // Handle conversation assignment
  const handleAssignConversation = async (conversationId: string, assigneeId: string) => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch(`http://localhost:3000/chat/${conversationId}`, {
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
      const response = await fetch(`http://localhost:3000/chat/${conversationId}`, {
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

  // Handle template selection
  const handleTemplateSelect = (template: string) => {
    setNewMessage(template)
    setShowCannedReplies(false)
  }

  // Handle channel switch
  const handleChannelSwitch = async (newChannel: string) => {
    if (!selectedConversation) return
    
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch(`http://localhost:3000/chat/${selectedConversation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ channel: newChannel })
      })

      if (response.ok) {
        await fetchChats()
        setShowChannelSwitch(false)
        toast.success('Channel switched successfully')
      } else {
        toast.error('Failed to switch channel')
      }
    } catch (error) {
      console.error('Error switching channel:', error)
      toast.error('Failed to switch channel')
    }
  }

  // Handle ticket conversion
  const handleTicketConversion = async () => {
    if (!selectedConversation) return
    
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch(`http://localhost:3000/chat/${selectedConversation.id}/convert-to-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchChats()
        setShowTicketConversion(false)
        toast.success('Conversation converted to ticket successfully')
      } else {
        toast.error('Failed to convert to ticket')
      }
    } catch (error) {
      console.error('Error converting to ticket:', error)
      toast.error('Failed to convert to ticket')
    }
  }

  // Fetch sessions near expiry
  const fetchSessionsNearExpiry = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch('http://localhost:3000/chat/session-timeout/near-expiry', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔥 Sessions near expiry data:', data.data)
        setSessionsNearExpiry(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching sessions near expiry:', error)
    }
  }, [])

  // Fetch session timeout info for selected conversation
  const fetchSessionTimeoutInfo = useCallback(async (chatId: string) => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch(`http://localhost:3000/chat/session-timeout/info/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSessionTimeoutInfo(data.data)
      }
    } catch (error) {
      console.error('Error fetching session timeout info:', error)
    }
  }, [])

  // Check and close expired sessions
  const checkExpiredSessions = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch('http://localhost:3000/chat/session-timeout/check-expired', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data.closedCount > 0) {
          toast.success(`${data.data.closedCount} expired sessions closed`)
          await fetchChats()
        }
      }
    } catch (error) {
      console.error('Error checking expired sessions:', error)
    }
  }, [fetchChats])

  // Poll for sessions near expiry (after function is declared)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessionsNearExpiry()
    }, 60000) // Poll every 60 seconds for session timeout info

    return () => clearInterval(interval)
  }, [fetchSessionsNearExpiry])

  // Update last update time every 30 seconds for visual feedback
  useEffect(() => {
    const interval = setInterval(() => {
      updateLastUpdateTime()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [updateLastUpdateTime])

  // Handle message send
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return

    setSendingMessage(true)
    
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      
      // Send via socket only - the socket service will handle API persistence
      if (socket && isConnected && typeof socket.emit === 'function') {
        // Create the message object for immediate local state update
        const messageToAdd = {
          id: `temp_${Date.now()}`, // Temporary ID until server responds
          _id: `temp_${Date.now()}`, // Temporary ID until server responds
          content: newMessage,
          sender: 'agent' as 'agent' | 'customer',
          senderId: user?._id,
          messageType: isInternalNote ? 'system' : 'text',
          timestamp: new Date().toISOString(),
          createdAt: new Date(),
          isFromAdmin: true,
          formattedTime: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }

        // Add message to local state immediately for better UX
        setSelectedConversation(prev => {
          if (!prev) return prev
          return {
            ...prev,
            messages: [...prev.messages, messageToAdd]
          }
        })

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

    console.log('🔥 Starting deletion process for conversation:', conversationId)
    setDeletingConversation(conversationId)
    
    // Set a timeout to prevent infinite deleting state (15 seconds)
    const deletionTimeout = setTimeout(() => {
      console.log('🔥 Deletion timeout reached, clearing deleting state')
      setDeletingConversation(null)
      toast.error('Deletion timed out. Please try again.')
    }, 15000)
    
    try {
      console.log('Attempting to delete conversation:', conversationId)
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      const response = await fetch(`http://localhost:3000/chat/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Delete response status:', response.status)
      
      if (response.ok) {
        console.log('🔥 Deletion successful, now removing from UI')
        
        // Add to deleted conversations set to prevent re-adding via polling
        setDeletedConversations(prev => new Set([...prev, conversationId]))
        
        // Remove from UI immediately after successful server confirmation
        setConversations(prev => {
          const updated = prev.filter(conv => conv.id !== conversationId)
          console.log('🔥 Removed conversation from UI, remaining count:', updated.length)
          return updated
        })
        
        // Clear selected conversation if it was deleted
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
        
        console.log('Delete operation completed successfully')
        toast.success('Conversation deleted successfully')
      } else {
        console.log('🔥 Deletion failed, keeping conversation visible')
        
        // Handle error response more gracefully
        let errorMessage = `Failed to delete conversation (${response.status} ${response.statusText})`
        
        try {
          const contentType = response.headers.get('content-type')
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            if (errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0) {
              console.error('Delete error response:', errorData)
              errorMessage = errorData.message || errorData.error || errorMessage
            }
          } else {
            const errorText = await response.text()
            if (errorText && errorText.trim()) {
              console.error('Raw error response:', errorText)
              errorMessage = errorText
            }
          }
        } catch (parseError) {
          console.error('Error parsing delete error response:', parseError)
        }
        
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('🔥 Error deleting conversation:', error)
      toast.error('Failed to delete conversation. Please try again.')
    } finally {
      console.log('🔥 Deletion process completed, clearing deleting state')
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
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Header with Stats */}
        <div className="flex-shrink-0 border-b bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat Console</h1>
                <p className="text-sm text-gray-600">Real-time customer support management</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Real-time connected' : 'Connecting...'}
                  </span>
                  {isConnected && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
                      Live updates
                    </div>
                  )}
                  {newChatNotifications > 0 && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Bell className="w-3 h-3" />
                      {newChatNotifications} new
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    Last update: {lastUpdateTime.toLocaleTimeString('en-US', { 
                      hour12: true, 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isRefreshing || loading}
                  onClick={async () => {
                    console.log('🔥 Manual refresh clicked')
                    try {
                      setIsRefreshing(true)
                      await fetchChats()
                      await fetchStats()
                      setNewChatNotifications(0)
                      setLastUpdateTime(new Date())
                      console.log('🔥 Manual refresh completed successfully')
                      toast.success('Chat data refreshed')
                    } catch (error) {
                      console.error('🔥 Manual refresh failed:', error)
                      toast.error('Failed to refresh chat data')
                    } finally {
                      setIsRefreshing(false)
                    }
                  }}
                >
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/chat-management/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/debug-chat">
                    <Activity className="w-4 h-4 mr-2" />
                    Debug
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={checkExpiredSessions}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Check Expired
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
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {conversations.filter(c => c.rating).length > 0 
                    ? (conversations.filter(c => c.rating).reduce((sum, c) => sum + c.rating!.score, 0) / conversations.filter(c => c.rating).length).toFixed(1)
                    : 'N/A'
                  }
                </div>
                <div className="text-xs text-gray-600">Avg Rating</div>
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

        {/* 3-Pane Console */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Pane - Queue */}
          <div className="w-80 border-r bg-white flex flex-col">
            {/* Queue Tabs */}
            <div className="flex-shrink-0 border-b">
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
            <div className="flex-shrink-0 p-4 border-b">
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

            {/* Virtualized Queue List */}
            <div className="flex-1">
              <VirtualizedConversationList
                conversations={filteredConversations}
                selectedConversation={selectedConversation}
                onConversationSelect={handleConversationSelect}
                onDeleteConversation={handleDeleteConversation}
                deletingConversation={deletingConversation}
                searchTerm={searchTerm}
                height={600}
                itemHeight={120}
              />
            </div>
          </div>

          {/* Middle Pane - Conversation */}
          <div className="flex-1 flex flex-col bg-white min-h-0">
            {selectedConversation ? (
              <>
                {/* Enhanced Conversation Header */}
                <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedConversation.customer.name}</h3>
                        <p className="text-sm text-gray-600">{selectedConversation.customer.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">Last seen: {selectedConversation.customer.lastSeen}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{selectedConversation.channel.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">Response Time</div>
                        <div className={cn("text-lg font-bold", getSLAColor(selectedConversation.sla.firstResponse))}>
                          {formatTime(selectedConversation.sla.firstResponse)}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge className={cn("text-xs font-medium px-3 py-1", getStatusColor(selectedConversation.status))}>
                          {selectedConversation.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={cn("text-xs font-medium px-3 py-1", getPriorityColor(selectedConversation.priority))}>
                          {selectedConversation.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
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
                        <Archive className="h-3 w-3 mr-1" />
                        Archive
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Started {formatRelativeTime(selectedConversation.createdAt)}</span>
                      </div>
                      {selectedConversation.rating && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className={cn("h-4 w-4", 
                            selectedConversation.rating.score >= 4 ? 'text-yellow-500 fill-current' : 
                            selectedConversation.rating.score >= 3 ? 'text-yellow-400' : 'text-red-400'
                          )} />
                          <span className={cn("font-medium",
                            selectedConversation.rating.score >= 4 ? 'text-green-600' : 
                            selectedConversation.rating.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                          )}>
                            {selectedConversation.rating.score}/5
                          </span>
                        </div>
                      )}
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
          <div className="w-80 border-l bg-white flex flex-col overflow-hidden">
            {selectedConversation ? (
              <div className={cn(
                "flex-1 overflow-y-auto transition-all duration-300 relative",
                deletingConversation === selectedConversation.id && "opacity-50 blur-sm"
              )}>
                {deletingConversation === selectedConversation.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 z-10">
                    <div className="flex flex-col items-center gap-3 text-red-600 p-6 bg-white rounded-lg shadow-lg">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <div className="text-center">
                        <span className="text-lg font-medium block">Deleting conversation...</span>
                        <span className="text-sm text-red-500">Please wait for server confirmation</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Customer Profile */}
                <div className="flex-shrink-0 p-4 border-b">
                  <h3 className="font-semibold mb-3">Customer Profile</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Name</div>
                      <div className="text-sm text-gray-900">{selectedConversation.customer.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Email</div>
                      <div className="text-sm text-gray-900">{selectedConversation.customer.email}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Phone</div>
                      <div className="text-sm text-gray-900">{selectedConversation.customer.phone || 'Not provided'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Language</div>
                      <div className="text-sm text-gray-900">{selectedConversation.customer.language.toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Last Seen</div>
                      <div className="text-sm text-gray-900">{selectedConversation.customer.lastSeen}</div>
                    </div>
                  </div>
                </div>

                {/* Assignment Info */}
                <div className="flex-shrink-0 p-4 border-b">
                  <h3 className="font-semibold mb-3">Assignment</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Assigned to</div>
                      <div className="text-sm text-gray-900">
                        {selectedConversation.assignee ? selectedConversation.assignee.name : 'Unassigned'}
                      </div>
                    </div>
                    {selectedConversation.assignee && (
                      <div>
                        <div className="text-sm font-medium text-gray-700">Agent ID</div>
                        <div className="text-sm text-gray-900">{selectedConversation.assignee.id}</div>
                      </div>
                    )}
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

                {/* Rating Info */}
                {selectedConversation.rating && (
                  <div className="flex-shrink-0 p-4 border-b">
                    <h3 className="font-semibold mb-3">Customer Rating</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Rating:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= selectedConversation.rating!.score
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium">
                            {selectedConversation.rating.score}/5
                          </span>
                        </div>
                      </div>
                      {selectedConversation.rating.feedback && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Feedback:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            "{selectedConversation.rating.feedback}"
                          </p>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Rated on {new Date(selectedConversation.rating.ratedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Session Timeout Info */}
                {sessionTimeoutInfo && (
                  <div className="flex-shrink-0 p-4 border-b">
                    <h3 className="font-semibold mb-3">Session Info</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={sessionTimeoutInfo.isExpired ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                          {sessionTimeoutInfo.isExpired ? "Expired" : "Active"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Activity:</span>
                        <span className="text-gray-900">{new Date(sessionTimeoutInfo.lastActivity).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Expires:</span>
                        <span className="text-gray-900">{new Date(sessionTimeoutInfo.expiresAt).toLocaleString()}</span>
                      </div>
                      {!sessionTimeoutInfo.isExpired && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time Left:</span>
                          <span className="text-gray-900">
                            {Math.floor(sessionTimeoutInfo.timeUntilExpiry / (1000 * 60))} minutes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex-shrink-0 p-4">
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => {
                          if (user?._id && selectedConversation) {
                            handleAssignConversation(selectedConversation.id, user._id)
                          }
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Assign to Me
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setIsTagDialogOpen(true)}
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        Add Tags
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setIsSnoozeDialogOpen(true)}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Snooze
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => {
                          if (selectedConversation) {
                            handleUpdateStatus(selectedConversation.id, 'closed')
                          }
                        }}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Close Conversation
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingConversation === selectedConversation?.id}
                        onClick={() => {
                          if (selectedConversation) {
                            handleDeleteConversation(selectedConversation.id)
                          }
                        }}
                      >
                        {deletingConversation === selectedConversation?.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Conversation
                          </>
                        )}
                      </Button>
                  </div>
                </div>
              </div>
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

      {/* Templates Dialog */}
      <Dialog open={showCannedReplies} onOpenChange={setShowCannedReplies}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Replies</DialogTitle>
            <DialogDescription>Select a template to use as your message</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {[
              { id: 'greeting', text: 'Hello! How can I help you today?' },
              { id: 'thanks', text: 'Thank you for contacting us!' },
              { id: 'wait', text: 'Please hold on while I check that for you.' },
              { id: 'resolved', text: 'Is there anything else I can help you with?' },
              { id: 'goodbye', text: 'Have a great day!' }
            ].map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleTemplateSelect(template.text)}
              >
                <div className="text-sm">{template.text}</div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Channel Switch Dialog */}
      <Dialog open={showChannelSwitch} onOpenChange={setShowChannelSwitch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Switch Channel</DialogTitle>
            <DialogDescription>Change the communication channel for this conversation</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {[
              { id: 'web', label: 'Web Chat', icon: '💬' },
              { id: 'email', label: 'Email', icon: '📧' },
              { id: 'phone', label: 'Phone', icon: '📞' },
              { id: 'whatsapp', label: 'WhatsApp', icon: '📱' }
            ].map((channel) => (
              <Button
                key={channel.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleChannelSwitch(channel.id)}
              >
                <span className="mr-2">{channel.icon}</span>
                {channel.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Conversion Dialog */}
      <Dialog open={showTicketConversion} onOpenChange={setShowTicketConversion}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convert to Ticket</DialogTitle>
            <DialogDescription>This will convert the chat conversation to a support ticket</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Warning</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Converting to a ticket will close this chat conversation. The customer will need to check their email for updates.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTicketConversion(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTicketConversion}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Convert to Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
