"use client"

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { useAuth, getAuthToken } from '@/lib/auth-context'
import { useTranslation } from '@/lib/translation-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
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
  Shield
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
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [stats, setStats] = useState<ChatStats>({
    total: 0,
    active: 0,
    waiting: 0,
    closed: 0,
    resolved: 0,
    unassigned: 0
  })
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: ''
  })
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [banReason, setBanReason] = useState('')
  const [banExpiry, setBanExpiry] = useState('')

  // Fetch chats
  const fetchChats = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.status !== 'all') queryParams.append('status', filters.status)
      if (filters.priority !== 'all') queryParams.append('priority', filters.priority)
      if (filters.category !== 'all') queryParams.append('category', filters.category)
      if (filters.search) queryParams.append('search', filters.search)

      const response = await fetch(`http://localhost:3000/chat?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setChats(data.data.chats)
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
      toast.error('Failed to fetch chats')
    }
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
        if (selectedChat?._id === chatId) {
          await fetchChatDetails(chatId)
        }
        toast.success('Chat status updated')
      } else {
        toast.error('Failed to update chat status')
      }
    } catch (error) {
      console.error('Error updating chat status:', error)
      toast.error('Failed to update chat status')
    }
  }

  // Assign chat to current admin
  const assignToMe = async (chatId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/chat/${chatId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ adminId: user?._id })
      })

      if (response.ok) {
        await fetchChats()
        if (selectedChat?._id === chatId) {
          await fetchChatDetails(chatId)
        }
        toast.success('Chat assigned to you')
      } else {
        toast.error('Failed to assign chat')
      }
    } catch (error) {
      console.error('Error assigning chat:', error)
      toast.error('Failed to assign chat')
    }
  }

  // Convert chat to ticket
  const convertToTicket = async (chatId: string, useAutoGenerate: boolean = true) => {
    if (!useAutoGenerate && !ticketId.trim()) {
      toast.error('Please enter a ticket ID')
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/chat/${chatId}/convert-to-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ 
          ticketId: useAutoGenerate ? undefined : ticketId.trim(),
          autoGenerate: useAutoGenerate
        })
      })

      if (response.ok) {
        const result = await response.json()
        await fetchChats()
        if (selectedChat?._id === chatId) {
          await fetchChatDetails(chatId)
        }
        setShowTicketModal(false)
        setTicketId('')
        toast.success(`Chat converted to ticket successfully: ${result.data.ticketId}`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to convert chat to ticket')
      }
    } catch (error) {
      console.error('Error converting chat to ticket:', error)
      toast.error('Failed to convert chat to ticket')
    }
  }

  // Ban IP address
  const banIP = async (chatId: string) => {
    if (!banReason.trim()) {
      toast.error('Please enter a ban reason')
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/chat/${chatId}/ban-ip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ 
          reason: banReason.trim(),
          expiry: banExpiry || null
        })
      })

      if (response.ok) {
        await fetchChats()
        if (selectedChat?._id === chatId) {
          await fetchChatDetails(chatId)
        }
        setShowBanModal(false)
        setBanReason('')
        setBanExpiry('')
        toast.success('IP address banned successfully')
      } else {
        toast.error('Failed to ban IP address')
      }
    } catch (error) {
      console.error('Error banning IP:', error)
      toast.error('Failed to ban IP address')
    }
  }

  // Unban IP address
  const unbanIP = async (chatId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/chat/${chatId}/unban-ip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (response.ok) {
        await fetchChats()
        if (selectedChat?._id === chatId) {
          await fetchChatDetails(chatId)
        }
        toast.success('IP address ban lifted successfully')
      } else {
        toast.error('Failed to lift IP ban')
      }
    } catch (error) {
      console.error('Error unbanning IP:', error)
      toast.error('Failed to lift IP ban')
    }
  }

  // Delete chat
  const deleteChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      return
    }

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
  }, [filters])

  useEffect(() => {
    setLoading(false)
  }, [])

  // Handle ticket modal radio button toggle
  useEffect(() => {
    const handleRadioChange = () => {
      const autoGenerate = document.getElementById('auto-generate') as HTMLInputElement
      const customTicket = document.getElementById('custom-ticket') as HTMLInputElement
      const customInput = document.getElementById('custom-ticket-input') as HTMLDivElement
      
      if (customTicket?.checked) {
        customInput?.classList.remove('hidden')
      } else {
        customInput?.classList.add('hidden')
      }
    }

    const autoGenerate = document.getElementById('auto-generate')
    const customTicket = document.getElementById('custom-ticket')
    
    autoGenerate?.addEventListener('change', handleRadioChange)
    customTicket?.addEventListener('change', handleRadioChange)
    
    return () => {
      autoGenerate?.removeEventListener('change', handleRadioChange)
      customTicket?.removeEventListener('change', handleRadioChange)
    }
  }, [showTicketModal])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'resolved': return 'bg-blue-100 text-blue-800'
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading chat management...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Management</h1>
          <p className="text-gray-600">Manage customer support chats and messages</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Chats</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Waiting</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.waiting}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unassigned</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unassigned}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Chats</CardTitle>
                  <Button onClick={fetchChats} variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                {/* Filters */}
                <div className="space-y-2">
                  <Input
                    placeholder="Search chats..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
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
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {chats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No chats found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {chats.map((chat) => (
                        <div
                          key={chat._id}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                            selectedChat?._id === chat._id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => fetchChatDetails(chat._id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {chat.customer.name}
                                </p>
                                {chat.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {chat.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {chat.customer.email}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(chat.lastMessageAt)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Badge className={`text-xs ${getStatusColor(chat.status)}`}>
                                {chat.status}
                              </Badge>
                              <Badge className={`text-xs ${getPriorityColor(chat.priority)}`}>
                                {chat.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Details */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>{selectedChat.customer.name}</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600">{selectedChat.customer.email}</p>
                      {selectedChat.customer.phone && (
                        <p className="text-sm text-gray-600">{selectedChat.customer.phone}</p>
                      )}
                      {selectedChat.customerIP && (
                        <p className="text-sm text-gray-500">IP: {selectedChat.customerIP}</p>
                      )}
                      {selectedChat.ticketId && (
                        <p className="text-sm text-blue-600">Ticket: {selectedChat.ticketId}</p>
                      )}
                      {selectedChat.isBanned && (
                        <p className="text-sm text-red-600">🚫 IP Banned</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(selectedChat.status)}>
                        {selectedChat.status}
                      </Badge>
                      <Badge className={getPriorityColor(selectedChat.priority)}>
                        {selectedChat.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => assignToMe(selectedChat._id)}
                      disabled={selectedChat.assignedTo?._id === user?._id}
                    >
                      <User className="h-4 w-4 mr-1" />
                      {selectedChat.assignedTo?._id === user?._id ? 'Assigned to You' : 'Assign to Me'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowTicketModal(true)}
                      disabled={selectedChat.status === 'resolved'}
                    >
                      <Ticket className="h-4 w-4 mr-1" />
                      Convert to Ticket
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowBanModal(true)}
                      disabled={selectedChat.isBanned}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Ban IP
                    </Button>
                    
                    {selectedChat.isBanned && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unbanIP(selectedChat._id)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Unban IP
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteChat(selectedChat._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    
                    <Select value={selectedChat.status} onValueChange={(value) => updateChatStatus(selectedChat._id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto max-h-96 space-y-4 mb-4">
                    {selectedChat.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'admin'
                              ? 'bg-blue-600 text-white'
                              : message.sender === 'system'
                              ? 'bg-gray-200 text-gray-700 text-center'
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
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="px-4"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a chat to view messages</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Ticket Conversion Modal */}
        {showTicketModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Convert Chat to Ticket</h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="auto-generate"
                      name="ticket-option"
                      defaultChecked
                      className="text-brand-500"
                    />
                    <label htmlFor="auto-generate" className="text-sm font-medium text-gray-700">
                      Auto-generate ticket ID (Recommended)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="custom-ticket"
                      name="ticket-option"
                      className="text-brand-500"
                    />
                    <label htmlFor="custom-ticket" className="text-sm font-medium text-gray-700">
                      Use custom ticket ID
                    </label>
                  </div>
                </div>
                
                <div id="custom-ticket-input" className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Ticket ID
                  </label>
                  <Input
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="Enter ticket ID (e.g., TKT-20250114-0001)"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: PREFIX-YYYYMMDD-XXXX
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTicketModal(false)
                      setTicketId('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const useAuto = (document.getElementById('auto-generate') as HTMLInputElement)?.checked
                      convertToTicket(selectedChat!._id, useAuto)
                    }}
                    disabled={!(document.getElementById('auto-generate') as HTMLInputElement)?.checked && !ticketId.trim()}
                  >
                    Convert to Ticket
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IP Ban Modal */}
        {showBanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Ban IP Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ban Reason
                  </label>
                  <Textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Enter reason for banning this IP address"
                    className="w-full"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ban Expiry (Optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={banExpiry}
                    onChange={(e) => setBanExpiry(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBanModal(false)
                      setBanReason('')
                      setBanExpiry('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => banIP(selectedChat!._id)}
                    disabled={!banReason.trim()}
                  >
                    Ban IP Address
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
