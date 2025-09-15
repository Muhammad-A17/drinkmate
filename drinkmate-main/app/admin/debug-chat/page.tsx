"use client"

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  User, 
  Bot, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCcw,
  Trash2,
  Settings
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  sender: 'customer' | 'agent' | 'system'
  content: string
  timestamp: string
  readByCustomer: boolean
  readByAgent: boolean
}

interface ChatSession {
  _id: string
  sessionId: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  agent?: {
    userId: string
    name: string
    email: string
  }
  status: 'open' | 'pending' | 'closed' | 'resolved'
  category: 'general' | 'order' | 'technical' | 'billing' | 'refund' | 'other'
  orderNumber?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  messages: ChatMessage[]
  lastMessageAt: string
  createdAt: string
  updatedAt: string
}

export default function DebugChatPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [chats, setChats] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChats = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setError('Authentication token not found.')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:3000/chat', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch chat sessions.')
      }

      const data = await response.json()
      setChats(data.data)
      
      // Auto-select first chat if none selected
      if (data.data.length > 0 && !selectedChat) {
        setSelectedChat(data.data[0])
      }
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchChatMessages = async (chatId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) return

      const response = await fetch(`http://localhost:3000/chat/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch chat messages.')
      }

      const data = await response.json()
      
      // Update the selected chat with messages
      setSelectedChat(prev => {
        if (prev && prev._id === chatId) {
          return { ...prev, messages: data.data }
        }
        return prev
      })
    } catch (err: any) {
      console.error('Error fetching chat messages:', err)
      toast.error('Failed to fetch chat messages')
    }
  }

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return

    setSending(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        toast.error('Authentication token not found.')
        return
      }

      const response = await fetch(`http://localhost:3000/chat/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          sender: 'agent',
          messageType: 'text'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send message.')
      }

      // Add message to local state
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: 'agent',
        content: newMessage,
        timestamp: new Date().toISOString(),
        readByCustomer: false,
        readByAgent: true
      }

      setSelectedChat(prev => {
        if (prev) {
          return {
            ...prev,
            messages: [...prev.messages, newMsg],
            lastMessageAt: new Date().toISOString()
          }
        }
        return prev
      })

      setNewMessage('')
      toast.success('Message sent successfully')
    } catch (err: any) {
      console.error('Error sending message:', err)
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  const updateChatStatus = async (chatId: string, status: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) return

      const response = await fetch(`http://localhost:3000/chat/${chatId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update chat status.')
      }

      // Update local state
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? { ...chat, status: status as any } : chat
      ))

      if (selectedChat && selectedChat._id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, status: status as any } : null)
      }

      toast.success('Chat status updated')
    } catch (err: any) {
      console.error('Error updating chat status:', err)
      toast.error('Failed to update chat status')
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchChats()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (selectedChat) {
      fetchChatMessages(selectedChat._id)
    }
  }, [selectedChat])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
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

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-[#12d6fa]" />
        </div>
      </AdminLayout>
    )
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full text-red-500">
          Access Denied. You must be an admin to view this page.
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <MessageSquare className="h-7 w-7 mr-3 text-[#12d6fa]" /> 
            Debug Chat System
          </h1>
          <Button onClick={fetchChats} className="flex items-center gap-2">
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Chat Sessions</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-[#12d6fa]" />
                  </div>
                ) : chats.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No chat sessions found
                  </div>
                ) : (
                  <div className="space-y-2 p-2">
                    {chats.map((chat) => (
                      <div
                        key={chat._id}
                        onClick={() => setSelectedChat(chat)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedChat?._id === chat._id
                            ? 'bg-brand-50 border border-brand-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-900 truncate">
                              {chat.customer.name}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                              {chat.customer.email}
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
                        <div className="text-xs text-gray-500">
                          {chat.messages.length} messages • {chat.category}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(chat.lastMessageAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              {selectedChat ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedChat.customer.name}</CardTitle>
                        <p className="text-sm text-gray-500">{selectedChat.customer.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(selectedChat.status)}>
                          {selectedChat.status}
                        </Badge>
                        <Badge className={getPriorityColor(selectedChat.priority)}>
                          {selectedChat.priority}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateChatStatus(selectedChat._id, 'closed')}
                            disabled={selectedChat.status === 'closed'}
                          >
                            Close
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateChatStatus(selectedChat._id, 'resolved')}
                            disabled={selectedChat.status === 'resolved'}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 p-0 overflow-y-auto">
                    <div className="p-4 space-y-4">
                      {selectedChat.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'agent'
                                ? 'bg-brand-500 text-white'
                                : message.sender === 'system'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              {message.sender === 'agent' ? (
                                <Bot className="h-3 w-3" />
                              ) : message.sender === 'system' ? (
                                <Settings className="h-3 w-3" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                              <span className="text-xs font-medium">
                                {message.sender === 'agent' ? 'Agent' : 
                                 message.sender === 'system' ? 'System' : 'Customer'}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                            <div className="text-xs opacity-75 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 min-h-[40px] max-h-32"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="px-4"
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}