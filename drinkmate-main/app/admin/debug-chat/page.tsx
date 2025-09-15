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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
            <p className="mt-4 text-gray-600 text-center">Loading chat management system...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-red-100 shadow-xl p-8 max-w-md">
            <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">Access Denied</h2>
            <p className="text-gray-600 text-center">You must be an admin to view the chat management system.</p>
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
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chat Management System</h1>
                    <p className="text-gray-500">View and manage customer chat sessions</p>
                  </div>
                </div>
              </div>
              <Button onClick={fetchChats} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all">
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

        {error && (
          <div className="bg-red-100/80 backdrop-blur-sm border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 shadow-lg" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden h-[600px]">
              <div className="p-4 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Chat Sessions</h3>
                </div>
              </div>
              <div className="h-[calc(600px-4rem)] overflow-y-auto p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
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
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedChat?._id === chat._id
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70'
                            : 'hover:bg-slate-50 border border-transparent'
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
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl h-[600px] flex flex-col overflow-hidden">
              {selectedChat ? (
                <>
                  <div className="p-4 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{selectedChat.customer.name}</h3>
                          <p className="text-sm text-gray-500">{selectedChat.customer.email}</p>
                        </div>
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
                            className="bg-white/80 border-gray-300 hover:bg-red-50 hover:border-red-300"
                          >
                            Close
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateChatStatus(selectedChat._id, 'resolved')}
                            disabled={selectedChat.status === 'resolved'}
                            className="bg-white/80 border-gray-300 hover:bg-green-50 hover:border-green-300"
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-0 overflow-y-auto">
                    <div className="p-4 space-y-4">
                      {selectedChat.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'agent'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                : message.sender === 'system'
                                ? 'bg-gray-100/80 backdrop-blur-sm text-gray-700 border border-gray-200/50'
                                : 'bg-white/80 backdrop-blur-sm text-gray-900 border border-gray-200/50 shadow-sm'
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
                  </div>

                  <div className="p-4 border-t border-gray-200/50 bg-white/50">
                    <div className="flex space-x-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 min-h-[40px] max-h-32 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
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
                        className="px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all"
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
                    <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full mx-auto mb-4">
                      <MessageSquare className="h-12 w-12 text-blue-500" />
                    </div>
                    <p>Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  )
}