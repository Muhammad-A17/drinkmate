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
  
  // Queue tabs
  const [activeQueueTab, setActiveQueueTab] = useState<'my-inbox' | 'unassigned' | 'waiting-customer' | 'waiting-agent' | 'high-priority' | 'closed'>('unassigned')
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDoNotDisturb, setIsDoNotDisturb] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversations, setSelectedConversations] = useState<string[]>([])
  
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
      
      const response = await fetch('http://localhost:3000/chat', {
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
            name: chat.customer.name || (chat.customer.userId ? `${chat.customer.userId.firstName || ''} ${chat.customer.userId.lastName || ''}`.trim() : '') || 'Unknown Customer',
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
            name: `${chat.assignedTo.firstName} ${chat.assignedTo.lastName}`,
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
        
        setConversations(transformedChats)
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
          avgResolutionTime: 1800
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
    console.log('Admin chat management page mounted, fetching data...')
    console.log('User:', user)
    console.log('Is authenticated:', isAuthenticated)
    console.log('Is admin:', user?.isAdmin)
    fetchChats()
    fetchStats()
  }, [fetchChats, fetchStats, user, isAuthenticated])

  // Set up polling for real-time updates (reduced frequency since we have sockets)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChats()
      fetchStats()
    }, 60000) // Poll every 60 seconds

    return () => clearInterval(interval)
  }, [fetchChats, fetchStats])

  // Socket event listeners for real-time updates
  useEffect(() => {
    console.log('Socket effect running:', { socket, isConnected, socketType: typeof socket })
    
    if (!socket || !isConnected) {
      console.log('Socket not available or not connected, skipping event listeners')
      return
    }

    const handleNewMessage = (data: { chatId: string; message: any }) => {
      console.log('New message received:', data)
      
      // Update the conversations list
      setConversations(prev => prev.map(conv => {
        if (conv.id === data.chatId) {
          const newMessage = {
            id: data.message._id || data.message.timestamp,
            content: data.message.content,
            sender: data.message.sender === 'admin' ? 'agent' : data.message.sender,
            timestamp: data.message.timestamp,
            isNote: data.message.messageType === 'system'
          }
          
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: {
              content: data.message.content,
              timestamp: data.message.timestamp,
              sender: data.message.sender === 'admin' ? 'agent' : data.message.sender
            },
            updatedAt: new Date().toISOString()
          }
        }
        return conv
      }))

      // Update selected conversation if it's the same chat
      if (selectedConversation && selectedConversation.id === data.chatId) {
        const newMessage = {
          id: data.message._id || data.message.timestamp,
          content: data.message.content,
          sender: data.message.sender === 'admin' ? 'agent' : data.message.sender,
          timestamp: data.message.timestamp,
          isNote: data.message.messageType === 'system'
        }
        
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, newMessage],
          lastMessage: {
            content: data.message.content,
            timestamp: data.message.timestamp,
            sender: data.message.sender === 'admin' ? 'agent' : data.message.sender
          }
        } : null)
      }
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
      console.log('Chat deleted:', data)
      // Remove the chat from the conversations list
      setConversations(prev => prev.filter(conv => conv.id !== data.chatId))
      
      // Clear selected conversation if it was deleted
      if (selectedConversation && selectedConversation.id === data.chatId) {
        setSelectedConversation(null)
      }
    }

    // Register socket event listeners
    if (socket && typeof socket.on === 'function') {
      console.log('Registering socket event listeners')
      socket.on('new_message', handleNewMessage)
      socket.on('chat_updated', handleChatUpdate)
      socket.on('chat_created', handleChatCreated)
      socket.on('chat_deleted', handleChatDeleted)
    } else {
      console.error('Socket is not properly initialized or does not have on method:', socket)
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

  // Handle message send
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return

    setSendingMessage(true)
    
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      
      // Send via socket for real-time updates
      if (socket && isConnected && typeof socket.emit === 'function') {
        console.log('Sending message via socket')
        socket.emit('send_message', {
          chatId: selectedConversation.id,
          content: newMessage,
          type: isInternalNote ? 'system' : 'text'
        })
      } else {
        console.log('Socket not available for sending message:', { socket, isConnected, hasEmit: socket && typeof socket.emit === 'function' })
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

        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, message],
          lastMessage: {
            content: newMessage,
            timestamp: message.timestamp,
            sender: 'agent'
          }
        } : null)

        // Update conversations list
        setConversations(prev => prev.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: {
                content: newMessage,
                timestamp: message.timestamp,
                sender: 'agent'
              },
              updatedAt: new Date().toISOString()
            }
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

    setDeletingConversation(conversationId)
    
    try {
      console.log('Attempting to delete conversation:', conversationId)
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      console.log('Using token:', token ? 'present' : 'missing')
      
      const response = await fetch(`http://localhost:3000/chat/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Delete response status:', response.status)
      console.log('Delete response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        // Check if response has content
        const contentType = response.headers.get('content-type')
        console.log('Response content type:', contentType)
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const responseData = await response.json()
            console.log('Delete response data:', responseData)
          } catch (parseError) {
            console.error('Error parsing delete response:', parseError)
          }
        }
        
        // Update UI regardless of response content
        await fetchChats()
        setSelectedConversation(null)
        toast.success('Conversation deleted successfully')
      } else {
        try {
          const errorData = await response.json()
          console.error('Delete error response:', errorData)
          toast.error(errorData.message || 'Failed to delete conversation')
        } catch (parseError) {
          console.error('Error parsing delete error response:', parseError)
          const errorText = await response.text()
          console.error('Raw error response:', errorText)
          toast.error(`Failed to delete conversation (${response.status})`)
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    } finally {
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
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Real-time connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  fetchChats()
                  fetchStats()
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/chat-management/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
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
                
                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                      isSelected && "bg-blue-50 border-blue-200",
                      isUrgent && "bg-red-50 border-red-200",
                      isWarning && "bg-amber-50 border-amber-200"
                    )}
                    onClick={() => handleConversationSelect(conversation)}
                  >
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
          <div className="w-80 border-l bg-white flex flex-col">
            {selectedConversation ? (
              <>
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
    </AdminLayout>
  )
}