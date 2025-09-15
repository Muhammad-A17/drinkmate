"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import AdminActionBar, { AdminActions } from '@/components/admin/AdminActionBar'
import AdminTable, { CellRenderers, TableColumn, ContextTableAction } from '@/components/admin/AdminTable'
import { ActionPresets } from '@/components/admin/AdminContextActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
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
  Filter, 
  MoreVertical, 
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
  Ban,
  Trash2,
  Shield,
  Bell,
  BellOff,
  Settings,
  Download,
  Tag,
  Star,
  Users,
  MessageCircle,
  Zap,
  TrendingUp,
  Activity,
  BarChart3,
  Plus,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  X
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/translation-context'
import Link from 'next/link'
import { toast } from 'sonner'
import { 
  Conversation, 
  Customer, 
  Agent, 
  Message, 
  ChatStats, 
  ChatFilters,
  SLA 
} from '@/types/chat'
import { 
  getCustomerDisplayName, 
  getCustomerInitials, 
  getAgentDisplayName, 
  getAgentInitials,
  formatRelativeTime, 
  formatAbsoluteTime,
  getStatusColor, 
  getPriorityColor, 
  getChannelIcon,
  isWithinBusinessHours,
  formatMessagePreview,
  getConversationUrgency
} from '@/lib/chat-utils'
import { cn } from '@/lib/utils'

export default function ChatManagementPage() {
  const { user } = useAuth()
  const { isRTL } = useTranslation()
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState<ChatStats>({
    total: 0,
    active: 0,
    waiting: 0,
    closed: 0,
    resolved: 0,
    unassigned: 0,
    new: 0,
    onHold: 0
  })
  const [filters, setFilters] = useState<ChatFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignee: 'all',
    channel: 'all',
    search: '',
    tags: [],
    dateRange: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDoNotDisturb, setIsDoNotDisturb] = useState(false)
  const [viewMode, setViewMode] = useState<'compact' | 'cozy'>('cozy')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'chats' | 'reporting'>('chats')
  
  // Table and pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedConversations, setSelectedConversations] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  
  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null)
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [responseText, setResponseText] = useState('')
  const [statusUpdate, setStatusUpdate] = useState<{
    status: 'open' | 'pending' | 'resolved' | 'closed' | 'active'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assigneeId?: string
  }>({ status: 'open', priority: 'low' })

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v))
          } else {
            queryParams.append(key, value)
          }
        }
      })

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`http://localhost:3000/chat?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      setConversations(data.data.chats || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch('http://localhost:3000/chat/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [])

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch('http://localhost:3000/agents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAgents(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching agents:', err)
    }
  }, [])

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations]

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(conv => 
        getCustomerDisplayName(conv.customer).toLowerCase().includes(searchLower) ||
        conv.customer.email?.toLowerCase().includes(searchLower) ||
        conv.customer.phone?.toLowerCase().includes(searchLower) ||
        conv.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conv => conv.status === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(conv => conv.priority === priorityFilter)
    }

    // Apply other filters
    if (filters.assignee !== 'all') {
      if (filters.assignee === 'unassigned') {
        filtered = filtered.filter(conv => !conv.assigneeId)
      } else {
        filtered = filtered.filter(conv => conv.assigneeId === filters.assignee)
      }
    }
    if (filters.channel !== 'all') {
      filtered = filtered.filter(conv => conv.channel === filters.channel)
    }

    // Sort by urgency
    return filtered.sort((a, b) => getConversationUrgency(b) - getConversationUrgency(a))
  }, [conversations, searchTerm, statusFilter, priorityFilter, filters])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredConversations.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage)

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Handle filter change
  const handleFilterChange = (key: keyof ChatFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleGlobalSearchFilterChange = (filters: any) => {
    setFilters(filters)
  }

  // Handle stats click (filter by status)
  const handleStatsClick = (status: string) => {
    handleFilterChange('status', status)
  }

  // Handle conversation select
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  // Handle message send
  const handleMessageSend = async (content: string, isNote: boolean = false) => {
    if (!selectedConversation) return

    try {
      const response = await fetch(`http://localhost:3000/chat/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : null}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          isNote,
          senderType: 'agent'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Refresh conversations to update last message
      fetchConversations()
      toast.success(isNote ? 'Note added' : 'Message sent')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Handle conversation update
  const handleConversationUpdate = async (conversationId: string, updates: Partial<Conversation>) => {
    try {
      const response = await fetch(`http://localhost:3000/chat/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : null}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update conversation')
      }

      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, ...updates } : conv
      ))

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, ...updates } : null)
      }

      toast.success('Conversation updated')
    } catch (err: any) {
      toast.error('Failed to update conversation')
    }
  }

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedConversations.length === 0) {
      toast.error("Please select conversations first")
      return
    }

    try {
      switch (action) {
        case "mark_resolved":
          // Update status to closed (resolved)
          selectedConversations.forEach(id => {
            handleConversationUpdate(id, { status: 'closed' })
          })
          toast.success(`Marked ${selectedConversations.length} conversations as resolved`)
          break
        case "assign":
          // Assign conversations (would need assignee selection)
          toast.success(`Assigned ${selectedConversations.length} conversations`)
          break
        case "archive":
          selectedConversations.forEach(id => {
            handleConversationUpdate(id, { status: 'closed' })
          })
          toast.success(`Archived ${selectedConversations.length} conversations`)
          break
        case "delete":
          if (confirm(`Are you sure you want to delete ${selectedConversations.length} conversations?`)) {
            selectedConversations.forEach(id => {
              handleDeleteConversation(id)
            })
            toast.success(`Deleted ${selectedConversations.length} conversations`)
          }
          break
      }
      setSelectedConversations([])
    } catch (error) {
      toast.error("Failed to perform bulk action")
    }
  }

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversations(prev => 
      prev.includes(conversationId) 
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedConversations.length === currentItems.length) {
      setSelectedConversations([])
    } else {
      setSelectedConversations(currentItems.map(conv => conv.id))
    }
  }

  // Handle delete conversation
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/chat/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : null}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }

      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
      }
      toast.success('Conversation deleted')
    } catch (err: any) {
      toast.error('Failed to delete conversation')
    }
  }

  // Handle view conversation
  const handleViewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setIsViewDialogOpen(true)
  }

  // Handle edit conversation
  const handleEditConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setStatusUpdate({
      status: conversation.status as any,
      priority: conversation.priority,
      assigneeId: conversation.assigneeId
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete confirmation
  const handleDeleteClick = (conversation: Conversation) => {
    setConversationToDelete(conversation)
    setIsDeleteDialogOpen(true)
  }

  // Status badge renderer
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Open
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Closed
          </Badge>
        )
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        )
    }
  }

  // Priority badge renderer
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Urgent
          </Badge>
        )
      case "high":
        return (
          <Badge variant="default" className="bg-orange-100 text-orange-800 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Low
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {priority}
          </Badge>
        )
    }
  }

  // Effects
  useEffect(() => {
    if (user?.isAdmin) {
      fetchConversations()
      fetchStats()
      fetchAgents()
    }
  }, [user, fetchConversations, fetchStats, fetchAgents])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  if (loading && conversations.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Activity className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Chat Management</h1>
            <p className="text-ink-600 mt-1">Manage customer conversations and support tickets</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchConversations}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/chat-settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Chats</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Waiting</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.waiting}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unassigned</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unassigned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
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
          <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Bar */}
        {selectedConversations.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {selectedConversations.length} of {filteredConversations.length} selected
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("mark_resolved")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("assign")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Assign
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("archive")}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction("delete")}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedConversations([])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedConversations.length === currentItems.length && currentItems.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                      aria-label="Select all conversations"
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Last Message</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((conversation) => (
                  <TableRow key={conversation.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedConversations.includes(conversation.id)}
                        onChange={() => handleSelectConversation(conversation.id)}
                        className="rounded border-gray-300"
                        aria-label={`Select conversation ${conversation.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {conversation.customer?.firstName || 'Unknown Customer'}
                          </div>
                          <div className="text-sm text-muted-foreground">{conversation.customer?.email || 'No email'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(conversation.status)}</TableCell>
                    <TableCell>{getPriorityBadge(conversation.priority)}</TableCell>
                    <TableCell>
                      {conversation.assigneeId ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="text-sm">
                            {agents.find(agent => agent.id === conversation.assigneeId)?.name || conversation.assigneeId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {conversation.lastMessageAt ? 'Has messages' : 'No messages'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {conversation.lastMessageAt ? formatRelativeTime(conversation.lastMessageAt) : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatAbsoluteTime(conversation.createdAt)}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewConversation(conversation)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditConversation(conversation)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(conversation)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredConversations.length)} of {filteredConversations.length} conversations
                  </div>
            <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => paginate(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                    </Button>
                ))}
              </div>
                    <Button
                      variant="outline"
                      size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                    >
                Next
                <ChevronRight className="h-4 w-4" />
                    </Button>
            </div>
          </div>
        )}

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Conversation Details</DialogTitle>
            </DialogHeader>
            {selectedConversation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Customer</label>
                    <p className="text-sm text-gray-900">
                      {selectedConversation.customer?.firstName || 'Unknown Customer'}
                    </p>
                    <p className="text-sm text-gray-500">{selectedConversation.customer?.email || 'No email'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedConversation.status)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <div className="mt-1">{getPriorityBadge(selectedConversation.priority)}</div>
          </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900">{formatAbsoluteTime(selectedConversation.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Activity</label>
                  <p className="text-sm text-gray-900">
                    {selectedConversation.lastMessageAt ? formatAbsoluteTime(selectedConversation.lastMessageAt) : 'No activity'}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Conversation</DialogTitle>
            </DialogHeader>
            {selectedConversation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select value={statusUpdate.status} onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, status: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <Select value={statusUpdate.priority} onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, priority: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
          </div>
        </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Add Response</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full mt-1 p-3 border border-gray-300 rounded-md"
                    rows={4}
                  />
                </div>
          </div>
        )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (selectedConversation) {
                    await handleConversationUpdate(selectedConversation.id, {
                      status: statusUpdate.status as any,
                      priority: statusUpdate.priority
                    })
                    if (responseText.trim()) {
                      await handleMessageSend(responseText)
                    }
                    setIsEditDialogOpen(false)
                    setResponseText('')
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Conversation</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this conversation? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  if (conversationToDelete) {
                    await handleDeleteConversation(conversationToDelete.id)
                    setIsDeleteDialogOpen(false)
                    setConversationToDelete(null)
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
