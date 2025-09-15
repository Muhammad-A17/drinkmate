"use client"

import React, { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, User, Clock, CheckCircle } from 'lucide-react'
import { useSocket } from '@/lib/socket-context'
import { useAuth } from '@/lib/auth-context'

interface Message {
  _id: string
  content: string
  senderType: 'customer' | 'admin'
  senderId: string
  timestamp: Date
  messageType: string
  attachments?: any[]
}

interface ChatSession {
  _id: string
  sessionId: string
  status: 'active' | 'closed' | 'pending'
  customer: {
    name: string
    email: string
    userId?: string
  }
  assignedTo?: {
    firstName: string
    lastName: string
  }
  lastMessageAt: Date
  messages: Message[]
}

interface LiveChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LiveChatModal({ isOpen, onClose }: LiveChatModalProps) {
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { socket, isConnected, joinChat, leaveChat, sendMessage, startTyping, stopTyping } = useSocket()
  const { user } = useAuth()

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatSession?.messages])

  // Create or get existing chat session
  useEffect(() => {
    if (isOpen && user && isConnected) {
      createOrGetChatSession()
    }
  }, [isOpen, user, isConnected])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data: { chatId: string; message: Message }) => {
      if (chatSession && data.chatId === chatSession._id) {
        setChatSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, data.message]
        } : null)
      }
    }

    const handleTyping = (data: { chatId: string; isTyping: boolean; user: string }) => {
      if (chatSession && data.chatId === chatSession._id) {
        setIsTyping(data.isTyping)
      }
    }

    const handleChatUpdate = (data: { chatId: string; status: string; assignedTo?: any }) => {
      if (chatSession && data.chatId === chatSession._id) {
        setChatSession(prev => prev ? {
          ...prev,
          status: data.status as any,
          assignedTo: data.assignedTo
        } : null)
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('typing_status', handleTyping)
    socket.on('chat_updated', handleChatUpdate)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('typing_status', handleTyping)
      socket.off('chat_updated', handleChatUpdate)
    }
  }, [socket, chatSession])

  const createOrGetChatSession = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setError('Please log in to start a chat session.')
        return
      }

      // Check if user has an existing active chat
      const response = await fetch('http://localhost:3000/chat', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const activeChat = data.data.chats.find((chat: ChatSession) => 
          chat.status === 'active' && chat.customer.userId === user?._id
        )

        if (activeChat) {
          setChatSession(activeChat)
          joinChat(activeChat._id)
        } else {
          // Create new chat session
          const newChatResponse = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              customer: {
                name: user?.firstName + ' ' + user?.lastName,
                email: user?.email,
                userId: user?._id
              },
              category: 'general',
              priority: 'medium'
            })
          })

          if (newChatResponse.ok) {
            const newChatData = await newChatResponse.json()
            setChatSession(newChatData.data)
            joinChat(newChatData.data._id)
          } else {
            const errorData = await newChatResponse.json()
            throw new Error(errorData.message || 'Failed to create chat session')
          }
        }
      } else if (response.status === 401) {
        setError('Please log in to start a chat session.')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch chat sessions')
      }
    } catch (err) {
      console.error('Error creating/getting chat session:', err)
      setError(err instanceof Error ? err.message : 'Failed to start chat. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatSession) return

    try {
      const messageData = {
        content: newMessage.trim(),
        messageType: 'text'
      }

      // Send via socket
      sendMessage(chatSession._id, messageData.content, messageData.messageType)

      // Also send via API for persistence
      await fetch(`http://localhost:3000/chat/${chatSession._id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : null}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      })

      setNewMessage('')
      stopTyping(chatSession._id)
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
    }
  }

  const handleTyping = () => {
    if (!chatSession) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    startTyping(chatSession._id)

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(chatSession._id)
    }, 1000)
  }

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusColor = () => {
    if (!chatSession) return 'bg-gray-100 text-gray-600'
    
    switch (chatSession.status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'closed':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  const getStatusText = () => {
    if (!chatSession) return 'Unknown'
    
    switch (chatSession.status) {
      case 'active':
        return chatSession.assignedTo ? 'Agent Connected' : 'Waiting for Agent'
      case 'closed':
        return 'Chat Closed'
      default:
        return 'Pending'
    }
  }

  if (!isOpen) return null

  // Show authentication required message if user is not logged in
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 h-[400px] flex flex-col dm-card-hover">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 dm-icon-chip">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Live Chat Support</h3>
                <p className="text-sm text-gray-500">Authentication Required</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h4>
              <p className="text-gray-600 mb-6">
                Please log in to your account to start a live chat session with our support team.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onClose()
                    window.location.href = '/login'
                  }}
                  className="dm-btn w-full dm-shine"
                >
                  Go to Login
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 h-[600px] flex flex-col dm-card-hover">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 dm-icon-chip">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Live Chat Support</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Status Bar */}
        {chatSession && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {chatSession.assignedTo 
                  ? `Agent: ${chatSession.assignedTo.firstName} ${chatSession.assignedTo.lastName}`
                  : 'Waiting for an agent...'
                }
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Connecting to chat...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-red-600 mb-2">{error}</p>
                {error.includes('log in') ? (
                  <button
                    onClick={() => {
                      onClose()
                      window.location.href = '/login'
                    }}
                    className="dm-btn px-4 py-2 dm-shine"
                  >
                    Go to Login
                  </button>
                ) : (
                  <button
                    onClick={createOrGetChatSession}
                    className="dm-btn px-4 py-2 dm-shine"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          ) : chatSession?.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Start a conversation with our support team!</p>
              </div>
            </div>
          ) : (
            chatSession?.messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.senderType === 'customer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderType === 'customer' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {chatSession && chatSession.status === 'active' && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isConnected}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isConnected}
                className="p-2 dm-btn rounded-full disabled:opacity-50 disabled:cursor-not-allowed dm-shine"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
