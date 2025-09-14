"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, X, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useSocket } from '@/lib/socket-context'
import { toast } from 'sonner'
import SaudiRiyal from '@/components/ui/SaudiRiyal'
import { chatAPI } from '@/lib/api'
import ChatRatingModal from './ChatRatingModal'

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
  type?: string
  chat?: string
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
  }
  admin?: {
    _id: string
    username: string
    firstName: string
    lastName: string
  }
  lastMessageAt: string
  createdAt: string
}

interface CustomerChatWidgetProps {
  isOpen: boolean
  onClose: () => void
}

export default function CustomerChatWidget({ isOpen, onClose }: CustomerChatWidgetProps) {
  const { user } = useAuth()
  const { socket, isConnected, joinChat, leaveChat, sendMessage: socketSendMessage, startTyping, stopTyping } = useSocket()
  const [isLoading, setIsLoading] = useState(false)
  const [isBusinessHours, setIsBusinessHours] = useState(true)
  const [businessHoursMessage, setBusinessHoursMessage] = useState('')
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [newChatSubject, setNewChatSubject] = useState('')
  const [newChatCategory, setNewChatCategory] = useState('general')
  const [newChatPriority, setNewChatPriority] = useState('medium')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<{userId: string, username: string, isAdmin: boolean}[]>([])
  const [showRatingModal, setShowRatingModal] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Check business hours on component mount
  useEffect(() => {
    checkBusinessHours()
    if (user) {
      loadCustomerChats()
    }
  }, [user])

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
        toast.success('Admin has been assigned to your chat')
      }
    }

    const handleChatStatusUpdated = (data: { chat: any }) => {
      if (activeChat && data.chat._id === activeChat._id) {
        setActiveChat(prev => prev ? { ...prev, status: data.chat.status } : null)
        
        // Show rating modal when chat is closed
        if (data.chat.status === 'closed' || data.chat.status === 'resolved') {
          setShowRatingModal(true)
        }
      }
    }

    const handleMessagesRead = (data: { chatId: string, userId: string }) => {
      // Handle read receipts if needed
    }

    const handleError = (data: { message: string }) => {
      toast.error(data.message)
    }

    const handleUserTyping = (data: { userId: string, username: string, isAdmin: boolean }) => {
      if (data.userId !== user?._id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId)
          return [...filtered, data]
        })
      }
    }

    const handleUserStoppedTyping = (data: { userId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
    }

    socket.on('new_message', handleNewMessage)
    socket.on('chat_assigned', handleChatAssigned)
    socket.on('chat_status_updated', handleChatStatusUpdated)
    socket.on('messages_read', handleMessagesRead)
    socket.on('error', handleError)
    socket.on('user_typing', handleUserTyping)
    socket.on('user_stopped_typing', handleUserStoppedTyping)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('chat_assigned', handleChatAssigned)
      socket.off('chat_status_updated', handleChatStatusUpdated)
      socket.off('messages_read', handleMessagesRead)
      socket.off('error', handleError)
      socket.off('user_typing', handleUserTyping)
      socket.off('user_stopped_typing', handleUserStoppedTyping)
    }
  }, [socket, activeChat])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkBusinessHours = async () => {
    try {
      const data = await chatAPI.checkBusinessHours()
      
      if (data.success) {
        setIsBusinessHours(data.isBusinessHours)
        setBusinessHoursMessage(data.message || '')
      }
    } catch (error) {
      console.error('Error checking business hours:', error)
    }
  }

  const loadCustomerChats = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const data = await chatAPI.getCustomerChats()
      
      if (data.success) {
        setChats(data.chats)
        if (data.chats.length > 0) {
          setActiveChat(data.chats[0])
          loadChatMessages(data.chats[0]._id)
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error)
      toast.error('Failed to load chats')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRateChat = async (rating: any) => {
    if (!activeChat) return

    try {
      await chatAPI.rateChat(activeChat._id, rating.score, rating.feedback)
      toast.success('Thank you for your feedback!')
      setShowRatingModal(false)
    } catch (error) {
      console.error('Error rating chat:', error)
      toast.error('Failed to submit rating')
    }
  }

  const loadChatMessages = async (chatId: string) => {
    try {
      const data = await chatAPI.getChatMessages(chatId)
      
      if (data.success) {
        setMessages(data.messages)
        // Join the chat room for real-time updates
        if (isConnected) {
          joinChat(chatId)
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const createNewChat = async () => {
    if (!user || !newChatSubject.trim()) return
    
    try {
      setIsCreatingChat(true)
      const data = await chatAPI.createChat({
        subject: newChatSubject,
        category: newChatCategory,
        priority: newChatPriority
      })
      
      if (data.success) {
        toast.success('Chat created successfully')
        setNewChatSubject('')
        setNewChatCategory('general')
        setNewChatPriority('medium')
        loadCustomerChats()
      } else {
        if (data.chatId && data.chat) {
          // Chat already exists, load it
          toast.info('You already have an open chat. Loading existing conversation...')
          setActiveChat(data.chat)
          loadChatMessages(data.chatId)
          loadCustomerChats() // Refresh the chat list
        } else {
          toast.error(data.message || 'Failed to create chat')
        }
      }
    } catch (error) {
      console.error('Error creating chat:', error)
      toast.error('Failed to create chat')
    } finally {
      setIsCreatingChat(false)
    }
  }

  const sendMessage = async () => {
    if (!activeChat || !newMessage.trim()) return
    
    const messageContent = newMessage.trim()
    setNewMessage('') // Clear input immediately
    
    if (isConnected && socket) {
      // Use Socket.io for real-time messaging
      socketSendMessage(activeChat._id, messageContent, 'text')
      
      // Add message to local state immediately for better UX
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        content: messageContent,
        sender: {
          _id: user?._id || '',
          username: user?.username || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          isAdmin: false
        },
        type: 'text',
        isFromAdmin: false,
        isSystem: false,
        createdAt: new Date().toISOString(),
        formattedTime: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }
      setMessages(prev => [...prev, tempMessage])
    } else {
      // Fallback to API if Socket.io is not connected
      try {
        const data = await chatAPI.sendMessage(activeChat._id, {
          content: messageContent,
          type: 'text'
        })
        
        if (data.success) {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (activeChat && isConnected) {
      if (!isTyping) {
        setIsTyping(true)
        startTyping(activeChat._id)
      }
      
      // Clear existing timeout
      if ((window as any).typingTimeout) {
        clearTimeout((window as any).typingTimeout)
      }
      
      // Set new timeout to stop typing
      (window as any).typingTimeout = setTimeout(() => {
        setIsTyping(false)
        stopTyping(activeChat._id)
      }, 1000)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#12d6fa]" />
            Live Chat Support
            {!isBusinessHours && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                <Clock className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex gap-4 overflow-hidden">
          {/* Chat List Sidebar */}
          <div className="w-1/3 border-r pr-4 flex flex-col">
            <div className="mb-4">
              <Button 
                onClick={() => setActiveChat(null)} 
                className="w-full bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
                disabled={!isBusinessHours}
              >
                Start New Chat
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <h3 className="font-semibold text-sm text-gray-600 mb-2">Your Chats</h3>
              {chats.map((chat) => (
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
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{chat.category}</span>
                    <Badge className={`text-xs ${getPriorityColor(chat.priority)}`}>
                      {chat.priority}
                    </Badge>
                  </div>
                  {chat.admin && (
                    <div className="text-xs text-green-600 mt-1">
                      Assigned to: {chat.admin.firstName} {chat.admin.lastName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {!activeChat ? (
              /* New Chat Form */
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md space-y-4">
                  {!isBusinessHours && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                      <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-orange-700 font-medium">Chat is currently offline</p>
                      <p className="text-orange-600 text-sm">{businessHoursMessage}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What can we help you with?
                      </label>
                      <Input
                        value={newChatSubject}
                        onChange={(e) => setNewChatSubject(e.target.value)}
                        placeholder="Describe your issue or question..."
                        disabled={!isBusinessHours}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={newChatCategory}
                          onChange={(e) => setNewChatCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                          disabled={!isBusinessHours}
                        >
                          <option value="general">General</option>
                          <option value="order">Order</option>
                          <option value="product">Product</option>
                          <option value="technical">Technical</option>
                          <option value="billing">Billing</option>
                          <option value="refund">Refund</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={newChatPriority}
                          onChange={(e) => setNewChatPriority(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa]"
                          disabled={!isBusinessHours}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    
                    <Button
                      onClick={createNewChat}
                      disabled={!isBusinessHours || !newChatSubject.trim() || isCreatingChat}
                      className="w-full bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
                    >
                      {isCreatingChat ? 'Creating...' : 'Start Chat'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Chat */
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
                        {activeChat.admin && (
                          <span className="text-xs text-green-600">
                            Admin: {activeChat.admin.firstName} {activeChat.admin.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto space-y-3 mb-4"
                >
                  {messages.map((message) => {
                    const isFromCurrentUser = user && message.sender._id === user._id;
                    const isFromAdmin = message.isFromAdmin;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isSystem
                              ? 'bg-gray-100 text-gray-600 text-center mx-auto'
                              : isFromCurrentUser
                              ? 'bg-[#12d6fa] text-white'
                              : isFromAdmin
                              ? 'bg-gray-200 text-gray-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {!message.isSystem && (
                            <div className="text-xs opacity-75 mb-1">
                              {isFromCurrentUser ? 'You' : isFromAdmin ? 'Admin' : `${message.sender.firstName} ${message.sender.lastName}`}
                            </div>
                          )}
                          <div className="text-sm">{message.content}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {message.formattedTime}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Typing Indicators */}
                {typingUsers.length > 0 && (
                  <div className="mb-2 text-sm text-gray-500 italic">
                    {typingUsers.map((user, index) => (
                      <span key={user.userId}>
                        {user.username} {user.isAdmin ? '(Admin)' : ''} is typing
                        {index < typingUsers.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Connection Status */}
                {!isConnected && (
                  <div className="mb-2 text-xs text-orange-600">
                    ⚠️ Real-time connection lost. Messages will be sent via API.
                  </div>
                )}

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={!isBusinessHours || activeChat.status === 'closed'}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !isBusinessHours || activeChat.status === 'closed'}
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

      {/* Chat Rating Modal */}
      <ChatRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onRate={handleRateChat}
        chatId={activeChat?._id || ''}
        customerName={user?.firstName || user?.username || 'Customer'}
      />
    </div>
  )
}
