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
  Hexagon
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/translation-context'
import { useSocket } from '@/lib/socket-context'
import { io } from 'socket.io-client'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Types
interface Conversation {
  id: string
  customer: {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
    language: string
    timezone: string
    lastSeen: string
  }
  channel: 'web' | 'whatsapp' | 'email'
  status: 'active' | 'waiting_customer' | 'waiting_agent' | 'snoozed' | 'closed' | 'converted'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId?: string
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  lastMessage: {
    content: string
    timestamp: string
    sender: 'customer' | 'agent'
  }
  sla: {
    firstResponse: number // seconds remaining
    resolution: number // seconds remaining
  }
  tags: string[]
  rating?: {
    score: number
    feedback?: string
    ratedAt: string
  }
  createdAt: string
  updatedAt: string
  messages: Message[]
  commerce?: {
    latestOrder?: any
    subscription?: any
    co2Cylinders?: any[]
    addresses?: any[]
    openTickets?: any[]
  }
}

interface Message {
  id: string
  content: string
  sender: 'customer' | 'agent'
  timestamp: string
  isNote?: boolean
  attachments?: any[]
  readAt?: string
}

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
        
        // Always update conversations to ensure real-time display
        setConversations(transformedChats)
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
    } else {
      setLoading(false) // Stop loading if not authenticated
    }
  }, [fetchChats, fetchStats, user, isAuthenticated])

  // Set up polling for real-time updates (reduced frequency since we have sockets)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChats()
      fetchStats()
      // fetchSessionsNearExpiry will be added after the function is declared
    }, 10000) // Poll every 10 seconds for backup updates

    return () => clearInterval(interval)
  }, [fetchChats, fetchStats])

  // Poll for sessions near expiry will be added after function declaration

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) {
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
      updateLastUpdateTime() // Update last update time
      updateStats() // Update stats in real-time
      // Remove the chat from the conversations list
      setConversations(prev => prev.filter(conv => conv.id !== data.chatId))
      
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
      socket.on('new_message', handleNewMessage)
      socket.on('chat_updated', handleChatUpdate)
      socket.on('chat_created', handleChatCreated)
      socket.on('chat_deleted', handleChatDeleted)
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
      const response = await fetch(`http://localhost:3000/chat/${selectedConversation.id}/messages`, {
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
        toast.error('Failed to send message')
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
    
    // Don't immediately remove from UI - keep it visible with loading state
    // The conversation will be marked as deleting and blurred
    
    // Set a timeout to prevent infinite deleting state (30 seconds)
    const deletionTimeout = setTimeout(() => {
      console.log('🔥 Deletion timeout reached, clearing deleting state')
      setDeletingConversation(null)
      toast.error('Deletion timed out. Please try again.')
    }, 30000)
    
    try {
      console.log('Attempting to delete conversation:', conversationId)
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      console.log('Using token:', token ? 'present' : 'missing')
      
      // Decode token to check admin status
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log('Token payload:', { id: payload.id, isAdmin: payload.isAdmin, exp: payload.exp })
        } catch (e) {
          console.error('Error decoding token:', e)
        }
      }
      
      const response = await fetch(`http://localhost:3000/chat/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Delete response status:', response.status)
      console.log('Delete response statusText:', response.statusText)
      console.log('Delete response headers:', Object.fromEntries(response.headers.entries()))
      console.log('Delete response URL:', response.url)
      console.log('Delete response ok:', response.ok)
      
      if (response.ok) {
        console.log('🔥 Deletion successful, now removing from UI')
        
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
        console.log('🔥 Deletion failed, keeping conversation visible')
        
        // Handle error response more gracefully
        let errorMessage = `Failed to delete conversation (${response.status} ${response.statusText})`
        
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
          </div>
        </div>

        {/* 3-Pane Console */}
        <div className="flex-1 flex overflow-hidden">
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

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => {
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
          <div className="flex-1 flex flex-col bg-white">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="flex-shrink-0 p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedConversation.customer.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{selectedConversation.customer.email}</span>
                          <span>•</span>
                          <span>{selectedConversation.customer.lastSeen}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getChannelColor(selectedConversation.channel)}>
                        {selectedConversation.channel.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(selectedConversation.status)}>
                        {selectedConversation.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(selectedConversation.priority)}>
                        {selectedConversation.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                    selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.sender === 'agent' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                            message.sender === 'agent'
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900",
                            message.isNote && "bg-yellow-100 text-yellow-900 border border-yellow-300"
                          )}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div className={cn(
                            "text-xs mt-1",
                            message.sender === 'agent' ? "text-blue-100" : "text-gray-500"
                          )}>
                            {formatRelativeTime(message.timestamp)}
                            {message.isNote && " • Internal Note"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No messages yet</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Composer */}
                <div className="flex-shrink-0 p-4 border-t bg-gray-50">
                  <div className="space-y-3">
                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsInternalNote(!isInternalNote)}
                        className={isInternalNote ? "bg-yellow-100 border-yellow-300" : ""}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Note
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowCannedReplies(true)}>
                        <Zap className="h-4 w-4 mr-1" />
                        Templates
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowChannelSwitch(true)}>
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Switch Channel
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowTicketConversion(true)}>
                        <Ticket className="h-4 w-4 mr-1" />
                        Convert to Ticket
                      </Button>
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isInternalNote ? "Add internal note..." : "Type your message..."}
                        className="flex-1 min-h-[60px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage}>
                        {sendingMessage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Press Ctrl+Enter to send • {isInternalNote ? "Internal note" : "Public message"}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a chat from the queue to start responding</p>
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
