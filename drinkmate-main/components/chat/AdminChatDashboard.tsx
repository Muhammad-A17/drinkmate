"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageCircle, 
  Send, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  Phone,
  Mail,
  Calendar,
  Tag,
  MessageSquare,
  X
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useSocket } from '@/lib/socket-context'
import { toast } from 'sonner'

interface Message {
  _id: string
  content: string
  sender: {
    _id: string
    username: string
    firstName: string
    lastName: string
    isAdmin: boolean
  }
  type: string
  isSystem: boolean
  isFromAdmin: boolean
  createdAt: string
  formattedTime: string
}

interface Chat {
  _id: string
  subject: string
  status: string
  priority: string
  category: string
  customer: {
    _id: string
    username: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  admin?: {
    _id: string
    username: string
    firstName: string
    lastName: string
  }
  lastMessageAt: string
  createdAt: string
  resolutionNotes?: string
}

interface AdminChatDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminChatDashboard({ isOpen, onClose }: AdminChatDashboardProps) {
  const { user } = useAuth()
  const { socket, isConnected, joinChat, leaveChat, sendMessage: socketSendMessage, assignChat: socketAssignChat, updateChatStatus: socketUpdateChatStatus } = useSocket()
  const [isLoading, setIsLoading] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  })
  const [filter, setFilter] = useState('all') // all, open, in_progress, resolved, closed
  const [searchTerm, setSearchTerm] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && user?.isAdmin) {
      loadOpenChats()
      loadChatStats()
    }
  }, [isOpen, user])

  // Socket.io event listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data: { message: Message }) => {
      if (activeChat && data.message.chat === activeChat._id) {
        setMessages(prev => [...prev, data.message])
      }
    }

    const handleChatAssigned = (data: { chat: any }) => {
      if (activeChat && data.chat._id === activeChat._id) {
        setActiveChat(prev => prev ? { ...prev, admin: data.chat.admin } : null)
      }
      // Update chats list
      setChats(prev => prev.map(chat => 
        chat._id === data.chat._id 
          ? { ...chat, admin: data.chat.admin, status: 'in_progress' }
          : chat
      ))
    }

    const handleChatStatusUpdated = (data: { chat: any }) => {
      if (activeChat && data.chat._id === activeChat._id) {
        setActiveChat(prev => prev ? { ...prev, status: data.chat.status } : null)
      }
      // Update chats list
      setChats(prev => prev.map(chat => 
        chat._id === data.chat._id 
          ? { ...chat, status: data.chat.status }
          : chat
      ))
    }

    const handleAdminNotification = (data: any) => {
      if (data.type === 'new_message') {
        // Refresh chats list to show updated last message
        loadOpenChats()
        toast.info(`New message in chat: ${data.chat.subject}`)
      }
    }

    const handleError = (data: { message: string }) => {
      toast.error(data.message)
    }

    socket.on('new_message', handleNewMessage)
    socket.on('chat_assigned', handleChatAssigned)
    socket.on('chat_status_updated', handleChatStatusUpdated)
    socket.on('admin_notification', handleAdminNotification)
    socket.on('error', handleError)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('chat_assigned', handleChatAssigned)
      socket.off('chat_status_updated', handleChatStatusUpdated)
      socket.off('admin_notification', handleAdminNotification)
      socket.off('error', handleError)
    }
  }, [socket, activeChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadOpenChats = async () => {
    try {
      setIsLoading(true)
      // Use token from auth context instead of localStorage
      const token = user?.token || localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      console.log('Loading chats with token:', token ? 'Present' : 'Missing')
      
      if (!token) {
        console.error('No token available for chat API call')
        toast.error('Please log in again')
        return
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Chat API response status:', response.status)
      const data = await response.json()
      console.log('Chat API response data:', data)
      
      if (data.success) {
        console.log('Setting chats:', data.chats)
        setChats(data.chats)
      } else {
        console.error('API returned error:', data)
        toast.error(data.message || 'Failed to load chats')
      }
    } catch (error) {
      console.error('Error loading chats:', error)
      toast.error('Failed to load chats')
    } finally {
      setIsLoading(false)
    }
  }

  const loadChatStats = async () => {
    try {
      // Use token from auth context instead of localStorage
      const token = user?.token || localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      console.log('Loading chat stats with token:', token ? 'Present' : 'Missing')
      
      if (!token) {
        console.error('No token available for stats API call')
        return
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Stats API response status:', response.status)
      const data = await response.json()
      console.log('Stats API response data:', data)
      
      if (data.success) {
        console.log('Setting stats:', data.stats)
        setStats(data.stats)
      } else {
        console.error('Stats API returned error:', data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadChatMessages = async (chatId: string) => {
    try {
      console.log('Loading messages for chat:', chatId)
      const token = user?.token || localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Messages API response status:', response.status)
      const data = await response.json()
      console.log('Messages API response data:', data)
      
      if (data.success) {
        console.log('Setting messages:', data.messages.length, 'messages')
        setMessages(data.messages)
        // Join the chat room for real-time updates
        if (isConnected) {
          console.log('Joining chat room for real-time updates')
          joinChat(chatId)
        }
      } else {
        console.error('Failed to load messages:', data)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const assignChatToMe = async (chatId: string) => {
    if (isConnected && socket) {
      // Use Socket.io for real-time assignment
      socketAssignChat(chatId)
      toast.success('Chat assigned to you')
    } else {
      // Fallback to API
      try {
        const token = user?.token || localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${chatId}/assign`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const data = await response.json()
        if (data.success) {
          toast.success('Chat assigned to you')
          loadOpenChats()
          if (activeChat?._id === chatId) {
            setActiveChat(data.chat)
          }
        } else {
          toast.error(data.message || 'Failed to assign chat')
        }
      } catch (error) {
        console.error('Error assigning chat:', error)
        toast.error('Failed to assign chat')
      }
    }
  }

  const sendMessage = async () => {
    if (!activeChat || !newMessage.trim()) return
    
    console.log('Sending message:', { 
      isConnected, 
      hasSocket: !!socket, 
      message: newMessage,
      chatId: activeChat._id 
    })
    
    if (isConnected && socket) {
      // Use Socket.io for real-time messaging
      console.log('Using Socket.io for messaging')
      socketSendMessage(activeChat._id, newMessage, 'text')
      setNewMessage('')
    } else {
      // Fallback to API
      console.log('Using API fallback for messaging')
      try {
        const token = user?.token || localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${activeChat._id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: newMessage,
            type: 'text'
          })
        })
        
        console.log('Message API response status:', response.status)
        const data = await response.json()
        console.log('Message API response data:', data)
        
        if (data.success) {
          setNewMessage('')
          console.log('Message sent successfully, reloading messages...')
          loadChatMessages(activeChat._id)
        } else {
          toast.error(data.message || 'Failed to send message')
        }
      } catch (error) {
        console.error('Error sending message:', error)
        toast.error('Failed to send message')
      }
    }
  }

  const closeChat = async () => {
    if (!activeChat) return
    
    if (isConnected && socket) {
      // Use Socket.io for real-time status update
      socketUpdateChatStatus(activeChat._id, 'closed', resolutionNotes)
      toast.success('Chat closed successfully')
      setResolutionNotes('')
      loadOpenChats()
      setActiveChat(null)
      setMessages([])
    } else {
      // Fallback to API
      try {
        const token = user?.token || localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${activeChat._id}/close`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            resolutionNotes
          })
        })
        
        const data = await response.json()
        if (data.success) {
          toast.success('Chat closed successfully')
          setResolutionNotes('')
          loadOpenChats()
          setActiveChat(null)
          setMessages([])
        } else {
          toast.error(data.message || 'Failed to close chat')
        }
      } catch (error) {
        console.error('Error closing chat:', error)
        toast.error('Failed to close chat')
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredChats = chats.filter(chat => {
    const matchesFilter = filter === 'all' || chat.status === filter
    const matchesSearch = searchTerm === '' || 
      chat.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#12d6fa]" />
            Admin Chat Dashboard
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex gap-4 overflow-hidden">
          {/* Stats and Chat List Sidebar */}
          <div className="w-1/3 border-r pr-4 flex flex-col">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
                <div className="text-xs text-blue-600">Open</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                <div className="text-xs text-yellow-600">In Progress</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-xs text-green-600">Resolved</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
                <div className="text-xs text-gray-600">Closed</div>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-2 mb-4">
              <Input
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
              <div className="flex gap-1">
                {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(status)}
                    className="text-xs"
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="font-semibold text-sm text-gray-600 mb-2">Chats ({filteredChats.length})</h3>
              {filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => {
                    setActiveChat(chat)
                    loadChatMessages(chat._id)
                  }}
                  className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                    activeChat?._id === chat._id 
                      ? 'bg-[#12d6fa]/10 border border-[#12d6fa]' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">{chat.subject}</span>
                    <Badge className={`text-xs ${getStatusColor(chat.status)}`}>
                      {chat.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {chat.customer?.firstName || 'Unknown'} {chat.customer?.lastName || 'User'}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{chat.category}</span>
                    <Badge className={`text-xs ${getPriorityColor(chat.priority)}`}>
                      {chat.priority}
                    </Badge>
                  </div>
                  {!chat.admin && (
                    <Button
                      size="sm"
                      className="w-full mt-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        assignChatToMe(chat._id)
                      }}
                    >
                      Assign to Me
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {!activeChat ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a chat to start conversation</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="border-b pb-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{activeChat.subject}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getStatusColor(activeChat.status)}`}>
                          {activeChat.status}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(activeChat.priority)}`}>
                          {activeChat.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">{activeChat.category}</span>
                      </div>
                    </div>
                    {activeChat.status !== 'closed' && (
                      <Button
                        onClick={closeChat}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Close Chat
                      </Button>
                    )}
                  </div>
                  
                  {/* Customer Info */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-sm">
                        {activeChat.customer?.firstName || 'Unknown'} {activeChat.customer?.lastName || 'User'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {activeChat.customer.email}
                      </div>
                      {activeChat.customer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {activeChat.customer.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(activeChat.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.isFromAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isSystem
                            ? 'bg-gray-100 text-gray-600 text-center mx-auto'
                            : message.isFromAdmin
                            ? 'bg-[#12d6fa] text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {!message.isSystem && (
                          <div className="text-xs opacity-75 mb-1">
                            {message.sender.firstName} {message.sender.lastName}
                            {message.isFromAdmin && ' (Admin)'}
                          </div>
                        )}
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {message.formattedTime}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Resolution Notes (for closing) */}
                {activeChat.status !== 'closed' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution Notes (optional)
                    </label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Add notes about how this issue was resolved..."
                      className="text-sm"
                      rows={2}
                    />
                  </div>
                )}

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={activeChat.status === 'closed'}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || activeChat.status === 'closed'}
                    className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
