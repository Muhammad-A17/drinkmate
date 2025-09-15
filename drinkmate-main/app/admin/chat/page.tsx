"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { useAuth, getAuthToken } from '@/lib/auth-context'
import { useTranslation } from '@/lib/translation-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  MessageCircle, 
  Search, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Archive,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  X,
  Users,
  Send,
  Activity,
  Filter,
  Phone
} from 'lucide-react'
import { toast } from 'sonner'

interface Chat {
  _id: string
  sessionId: string
  customer: {
    name: string
    email: string
    phone?: string
    userId?: string
  }
  status: 'active' | 'waiting' | 'closed' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'general' | 'order' | 'technical' | 'billing' | 'refund' | 'other'
  orderNumber?: string
  assignedTo?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  messages: Array<{
    sender: 'customer' | 'admin' | 'system'
    content: string
    timestamp: string
    isRead: boolean
  }>
  lastMessageAt: string
  unreadCount: number
  createdAt: string
  customerIP?: string
  ticketId?: string
  isBanned?: boolean
  banDetails?: {
    bannedAt: string
    bannedBy: string
    banReason: string
    banExpiry?: string
  }
}

interface ChatStats {
  total: number
  active: number
  waiting: number
  closed: number
  resolved: number
  unassigned: number
}

export default function AdminChatPage() {
  const { user } = useAuth()
  const { isRTL } = useTranslation()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [showChatPanel, setShowChatPanel] = useState(false)
  const [stats, setStats] = useState<ChatStats>({
    total: 0,
    active: 0,
    waiting: 0,
    closed: 0,
    resolved: 0,
    unassigned: 0
  })
  
  // Table and pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedChats, setSelectedChats] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  
  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null)
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [statusUpdate, setStatusUpdate] = useState<{
    status: 'active' | 'waiting' | 'closed' | 'resolved'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assignedTo?: string
  }>({ status: 'active', priority: 'low' })

  // Fetch chats
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3000/chat`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setChats(data.data.chats || [])
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
      toast.error('Failed to fetch chats')
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter chats
  const filteredChats = useMemo(() => {
    let filtered = [...chats]

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(chat => 
        chat.customer.name.toLowerCase().includes(searchLower) ||
        chat.customer.email.toLowerCase().includes(searchLower) ||
        chat.customer.phone?.toLowerCase().includes(searchLower) ||
        chat.sessionId.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(chat => chat.status === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(chat => chat.priority === priorityFilter)
    }

    return filtered
  }, [chats, searchTerm, statusFilter, priorityFilter])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredChats.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredChats.length / itemsPerPage)

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedChats.length === 0) {
      toast.error("Please select chats first")
      return
    }

    try {
      switch (action) {
        case "mark_resolved":
          selectedChats.forEach(id => {
            updateChatStatus(id, 'resolved')
          })
          toast.success(`Marked ${selectedChats.length} chats as resolved`)
          break
        case "assign":
          toast.success(`Assigned ${selectedChats.length} chats`)
          break
        case "archive":
          selectedChats.forEach(id => {
            updateChatStatus(id, 'closed')
          })
          toast.success(`Archived ${selectedChats.length} chats`)
          break
        case "delete":
          if (confirm(`Are you sure you want to delete ${selectedChats.length} chats?`)) {
            selectedChats.forEach(id => {
              deleteChat(id)
            })
            toast.success(`Deleted ${selectedChats.length} chats`)
          }
          break
      }
      setSelectedChats([])
    } catch (error) {
      toast.error("Failed to perform bulk action")
    }
  }

  // Handle chat selection
  const handleSelectChat = (chatId: string) => {
    setSelectedChats(prev => 
      prev.includes(chatId) 
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    )
  }

  const handleSelectAll = () => {
    if (selectedChats.length === currentItems.length) {
      setSelectedChats([])
    } else {
      setSelectedChats(currentItems.map(chat => chat._id))
    }
  }

  // Handle view chat
  const handleViewChat = (chat: Chat) => {
    setSelectedChat(chat)
    setIsViewDialogOpen(true)
  }

  // Handle open chat for messaging
  const handleOpenChat = async (chat: Chat) => {
    setSelectedChat(chat)
    setShowChatPanel(true)
    await fetchChatDetails(chat._id)
  }

  // Handle edit chat
  const handleEditChat = (chat: Chat) => {
    setSelectedChat(chat)
    setStatusUpdate({
      status: chat.status,
      priority: chat.priority,
      assignedTo: chat.assignedTo?._id
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete confirmation
  const handleDeleteClick = (chat: Chat) => {
    setChatToDelete(chat)
    setIsDeleteDialogOpen(true)
  }

  // Fetch chat stats
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/chat/stats', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Fetch specific chat details
  const fetchChatDetails = async (chatId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSelectedChat(data.data)
        
        // Mark messages as read
        await fetch(`http://localhost:3000/chat/${chatId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        })
      }
    } catch (error) {
      console.error('Error fetching chat details:', error)
      toast.error('Failed to load chat details')
    }
  }

  // Update chat status
  const updateChatStatus = async (chatId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:3000/chat/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchChats()
        toast.success('Chat status updated')
      } else {
        toast.error('Failed to update chat status')
      }
    } catch (error) {
      console.error('Error updating chat status:', error)
      toast.error('Failed to update chat status')
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return

    setSending(true)
    try {
      const response = await fetch(`http://localhost:3000/chat/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ 
          content: newMessage,
          messageType: 'text'
        })
      })

      if (response.ok) {
        setNewMessage('')
        // Refresh chat details
        await fetchChatDetails(selectedChat._id)
        // Refresh chat list
        await fetchChats()
        toast.success('Message sent successfully')
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Delete chat
  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (response.ok) {
        await fetchChats()
        if (selectedChat?._id === chatId) {
          setSelectedChat(null)
        }
        toast.success('Chat deleted successfully')
      } else {
        toast.error('Failed to delete chat')
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error('Failed to delete chat')
    }
  }

  useEffect(() => {
    fetchChats()
    fetchStats()
  }, [fetchChats])

  // Status badge renderer
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        )
      case "waiting":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Waiting
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading && chats.length === 0) {
    return (
      <AdminLayout>
          <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-gray-600">Loading chats...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 space-y-8 p-6">
          {/* Premium Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Chat Management
                    </h1>
                    <p className="text-gray-600 text-lg mt-2">Manage customer support chats and messages</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                    <Activity className="w-4 h-4 mr-1" />
                    {chats.length} Total Chats
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {chats.filter(c => c.status === "resolved").length} Resolved
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                    <Clock className="w-4 h-4 mr-1" />
                    {chats.filter(c => c.status === "waiting").length} Waiting
                  </span>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={fetchChats} variant="outline" className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  disabled={selectedChats.length === 0}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Actions ({selectedChats.length})
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Chats</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">All chats</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
              </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Chats</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  <p className="text-xs text-gray-500 mt-1">Currently active</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
              </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Waiting</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.waiting}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
              </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.resolved}</p>
                  <p className="text-xs text-gray-500 mt-1">Completed chats</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
              </div>
              </div>
        </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Unassigned</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.unassigned}</p>
                  <p className="text-xs text-gray-500 mt-1">Need assignment</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
                </div>
                
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Closed</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.closed}</p>
                  <p className="text-xs text-gray-500 mt-1">Archived chats</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl shadow-lg">
                  <Archive className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search chats by customer name, email, or session ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[160px] h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                <Button 
                  variant="outline" 
                  className="h-12 px-6 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setPriorityFilter("all")
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                  </div>
                </div>
          </div>

          {/* Action Bar */}
          {selectedChats.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-lg font-semibold text-orange-800">
                      {selectedChats.length} of {filteredChats.length} chats selected
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction("mark_resolved")}
                      className="border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction("assign")}
                      className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction("archive")}
                      className="border-2 border-gray-200 hover:border-gray-500 hover:bg-gray-50 transition-all duration-300"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkAction("delete")}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedChats([])}
                  className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              {filteredChats.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No chats found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                  <Button 
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                      setPriorityFilter("all")
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Clear Filters
                  </Button>
                    </div>
                  ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="w-12 font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedChats.length === currentItems.length && currentItems.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          aria-label="Select all chats"
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">Customer Details</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                      <TableHead className="font-semibold text-gray-700">Assignee</TableHead>
                      <TableHead className="font-semibold text-gray-700">Last Message</TableHead>
                      <TableHead className="font-semibold text-gray-700">Created</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((chat) => (
                      <TableRow 
                          key={chat._id}
                        className="hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100"
                      >
                        <TableCell className="py-4">
                          <input
                            type="checkbox"
                            checked={selectedChats.includes(chat._id)}
                            onChange={() => handleSelectChat(chat._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            aria-label={`Select chat ${chat._id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {chat.customer.name.charAt(0).toUpperCase()}
                              </span>
                              </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{chat.customer.name}</p>
                            </div>
                              <div className="text-sm text-gray-600">{chat.customer.email}</div>
                              {chat.customer.phone && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {chat.customer.phone}
                            </div>
                              )}
                              <div className="text-xs text-gray-500">
                                Session: {chat.sessionId}
                          </div>
                        </div>
                    </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {getStatusBadge(chat.status)}
                        </TableCell>
                        <TableCell className="py-4">
                          {getPriorityBadge(chat.priority)}
                        </TableCell>
                        <TableCell className="py-4">
                          {chat.assignedTo ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 text-blue-600" />
                </div>
                              <span className="text-sm font-medium text-gray-900">
                                {chat.assignedTo.firstName} {chat.assignedTo.lastName}
                              </span>
          </div>
                          ) : (
                            <span className="text-sm text-gray-500 font-medium">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {chat.messages && chat.messages.length > 0 ? 'Has messages' : 'No messages'}
                    </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(chat.lastMessageAt)}
                    </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(chat.createdAt).toLocaleDateString()}
                  </div>
                          <div className="text-xs text-gray-500">
                            {new Date(chat.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                    <Button
                              variant="outline"
                      size="sm"
                              onClick={() => handleOpenChat(chat)}
                              title="Open Chat"
                              className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                            <Button
                      variant="outline"
                              size="sm"
                              onClick={() => handleViewChat(chat)}
                              title="View Details"
                              className="border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                            >
                              <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                              variant="outline"
                      size="sm"
                              onClick={() => handleEditChat(chat)}
                              title="Edit Chat"
                              className="border-2 border-yellow-200 hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                      variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(chat)}
                              title="Delete Chat"
                              className="border-2 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                    </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 font-medium">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredChats.length)} of {filteredChats.length} chats
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                    </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1
                      return (
                      <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                          onClick={() => paginate(page)}
                          className={`w-10 h-10 p-0 ${
                            currentPage === page 
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg" 
                              : "border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-gray-400">...</span>
                        <Button
                        variant="outline"
                          size="sm"
                          onClick={() => paginate(totalPages)}
                          className="w-10 h-10 p-0 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                      >
                          {totalPages}
                      </Button>
                      </>
                    )}
                  </div>
                    <Button
                    variant="outline"
                      size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 disabled:opacity-50"
                    >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
              </div>
            </div>
          )}

        {/* Chat Panel */}
        {showChatPanel && selectedChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedChat.customer.name}</h3>
                    <p className="text-sm text-gray-500">{selectedChat.customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedChat.status)}
                  {getPriorityBadge(selectedChat.priority)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChatPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages && selectedChat.messages.length > 0 ? (
                  selectedChat.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'admin'
                            ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                  </div>

                  {/* Message Input */}
              <div className="border-t p-4">
                  <div className="flex space-x-2">
                  <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    disabled={sending}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                    size="sm"
                    >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    </Button>
                  </div>
                </div>
          </div>
        </div>
        )}

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Chat Details</DialogTitle>
            </DialogHeader>
            {selectedChat && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Customer</label>
                    <p className="text-sm text-gray-900">{selectedChat.customer.name}</p>
                    <p className="text-sm text-gray-500">{selectedChat.customer.email}</p>
                    {selectedChat.customer.phone && (
                      <p className="text-sm text-gray-500">{selectedChat.customer.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedChat.status)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <div className="mt-1">{getPriorityBadge(selectedChat.priority)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedChat.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900">{formatTime(selectedChat.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Activity</label>
                    <p className="text-sm text-gray-900">{formatTime(selectedChat.lastMessageAt)}</p>
                  </div>
                </div>
                {selectedChat.assignedTo && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assigned To</label>
                    <p className="text-sm text-gray-900">
                      {selectedChat.assignedTo.firstName} {selectedChat.assignedTo.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedChat.assignedTo.email}</p>
                </div>
                )}
                {selectedChat.messages && selectedChat.messages.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Messages</label>
                    <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                      {selectedChat.messages.map((message, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">
                              {message.sender}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                </div>
                          <p className="text-sm text-gray-900">{message.content}</p>
              </div>
                      ))}
            </div>
          </div>
        )}
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
              <DialogTitle>Edit Chat</DialogTitle>
            </DialogHeader>
            {selectedChat && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select value={statusUpdate.status} onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, status: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
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
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response..."
                    className="mt-1"
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
                  if (selectedChat) {
                    await updateChatStatus(selectedChat._id, statusUpdate.status)
                    if (responseText.trim()) {
                      setNewMessage(responseText)
                      await sendMessage()
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
              <DialogTitle>Delete Chat</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this chat? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                onClick={async () => {
                  if (chatToDelete) {
                    await deleteChat(chatToDelete._id)
                    setIsDeleteDialogOpen(false)
                    setChatToDelete(null)
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
      </div>
    </AdminLayout>
  )
}