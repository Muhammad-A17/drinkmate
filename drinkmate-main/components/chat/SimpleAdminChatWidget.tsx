'use client'

import React, { useEffect, useState, useRef } from 'react'
import { MessageCircle, Send, X, User, Clock } from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { useSocket } from '@/lib/socket-context'
import { Message, Conversation } from '@/types/chat'

interface SimpleAdminChatWidgetProps {
  selectedConversation: Conversation | null
  onMessageSent?: (message: Message) => void
}

const SimpleAdminChatWidget: React.FC<SimpleAdminChatWidgetProps> = ({
  selectedConversation,
  onMessageSent
}) => {
  const { user, isAuthenticated } = useAuth()
  const { socket, isConnected, connectSocket, disconnectSocket, joinChat, leaveChat, sendMessage } = useSocket()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Helper function to get auth token
  const getAuthToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages for the selected conversation
  const loadMessages = async (chatId: string) => {
    console.log('🔥 SimpleAdminChatWidget: Loading messages for chat:', chatId)
    try {
      setIsLoading(true)
      const token = getAuthToken()
      
      if (!token) {
        console.error('🔥 SimpleAdminChatWidget: No auth token available')
        return
      }
      
      const messagesResponse = await fetch(`http://localhost:3000/chat/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🔥 SimpleAdminChatWidget: Messages response status:', messagesResponse.status)

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json()
        console.log('🔥 SimpleAdminChatWidget: Raw messages data:', messagesData)
        
        // Handle the correct API response structure
        const loadedMessages = messagesData.data?.chat?.messages || messagesData.data?.messages || messagesData.messages || []
        console.log('🔥 SimpleAdminChatWidget: Loaded messages count:', loadedMessages.length)
        
        // Process messages
        const processedMessages = loadedMessages.map((message: any) => {
          return {
            id: message._id || message.id || `msg_${Date.now()}_${Math.random()}`,
            content: message.content || message.body || 'No content',
            sender: message.sender === 'admin' || message.sender === 'agent' ? 'agent' : 'customer',
            timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
            isNote: message.isNote || message.messageType === 'system' || false,
            attachments: message.attachments || [],
            readAt: message.readAt
          }
        })
        
        setMessages(processedMessages)
        console.log('🔥 SimpleAdminChatWidget: Processed messages:', processedMessages)
      } else {
        console.error('🔥 SimpleAdminChatWidget: Failed to load messages:', messagesResponse.status, messagesResponse.statusText)
        // Try to get error details
        try {
          const errorText = await messagesResponse.text()
          console.error('🔥 SimpleAdminChatWidget: Error response:', errorText)
        } catch (e) {
          console.error('🔥 SimpleAdminChatWidget: Could not read error response')
        }
      }
    } catch (error) {
      console.error('🔥 SimpleAdminChatWidget: Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const messageContent = newMessage.trim()
    setNewMessage('')

    // Send via socket or API
    try {
      if (socket && isConnected) {
        // Use socket - don't add optimistic update as socket will provide real-time feedback
        console.log('🔥 SimpleAdminChatWidget: Sending via socket')
        sendMessage(selectedConversation.id, messageContent, 'text')
      } else {
        // API fallback - add optimistic update since no real-time feedback
        console.log('🔥 SimpleAdminChatWidget: Sending via API fallback')
        
        const messageToAdd = {
          id: `temp_${Date.now()}`,
          content: messageContent,
          sender: 'agent' as 'customer' | 'agent',
          timestamp: new Date().toISOString(),
          isNote: false,
          attachments: [],
          readAt: undefined
        }

        setMessages(prev => [...prev, messageToAdd])

        // Notify parent component
        if (onMessageSent) {
          onMessageSent(messageToAdd)
        }

        const token = getAuthToken()
        const response = await fetch(`http://localhost:3000/chat/${selectedConversation.id}/message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: messageContent,
            messageType: 'text'
          })
        })

        if (response.ok) {
          const responseData = await response.json()
          console.log('🔥 SimpleAdminChatWidget: Message sent via API:', responseData)
          
          // Replace temporary message with real message
          if (responseData.data?.message) {
            const realMessage = {
              id: responseData.data.message._id,
              content: responseData.data.message.content,
              sender: 'agent' as 'customer' | 'agent',
              timestamp: responseData.data.message.createdAt || responseData.data.message.timestamp,
              isNote: false,
              attachments: [],
              readAt: undefined
            }

            setMessages(prev => prev.map(msg => 
              msg.id === messageToAdd.id ? realMessage : msg
            ))
          }
        }
      }
    } catch (error) {
      console.error('🔥 SimpleAdminChatWidget: Error sending message:', error)
    }
  }

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data: { chatId: string; message: any }) => {
      console.log('🔥 SimpleAdminChatWidget: New message received:', data)
      
      if (selectedConversation && data.chatId === selectedConversation.id) {
        // Check if message already exists to prevent duplicates
        const messageExists = messages.some(msg => {
          // Check by real ID
          if (msg.id === data.message._id || msg.id === data.message.id) {
            return true
          }
          
          // Check by content and timestamp (for temporary messages)
          if (msg.content === data.message.content) {
            const msgTime = new Date(msg.timestamp).getTime()
            const dataTime = new Date(data.message.createdAt || data.message.timestamp).getTime()
            // If timestamps are within 5 seconds, consider it a duplicate
            return Math.abs(msgTime - dataTime) < 5000
          }
          
          return false
        })
        
        if (messageExists) {
          console.log('🔥 SimpleAdminChatWidget: Message already exists, skipping duplicate')
          return
        }
        
        const processedMessage = {
          id: data.message._id || data.message.id || `temp_${Date.now()}`,
          content: data.message.content,
          sender: (data.message.sender === 'admin' || data.message.sender === 'agent' ? 'agent' : 'customer') as 'customer' | 'agent',
          timestamp: data.message.createdAt || data.message.timestamp || new Date().toISOString(),
          isNote: data.message.isNote || false,
          attachments: data.message.attachments || [],
          readAt: data.message.readAt
        }
        
        setMessages(prev => [...prev, processedMessage])
      }
    }

    socket.on('new_message', handleNewMessage)

    return () => {
      socket.off('new_message', handleNewMessage)
    }
  }, [socket, selectedConversation])

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      console.log('🔥 SimpleAdminChatWidget: Conversation selected:', {
        id: selectedConversation.id,
        customerName: selectedConversation.customer.name,
        messagesCount: selectedConversation.messages?.length || 0,
        messages: selectedConversation.messages
      })
      
      // First use messages from the conversation if available (immediate display)
      if (selectedConversation.messages && selectedConversation.messages.length > 0) {
        console.log('🔥 SimpleAdminChatWidget: Using messages from conversation:', selectedConversation.messages.length)
        setMessages(selectedConversation.messages)
      } else {
        console.log('🔥 SimpleAdminChatWidget: No messages in conversation, loading from API')
        // If no messages in conversation, try to load from API
        loadMessages(selectedConversation.id)
      }
      
      connectSocket()
      joinChat(selectedConversation.id)
    } else {
      setMessages([])
    }
  }, [selectedConversation])

  // Don't render if no conversation is selected or user is not authenticated
  if (!selectedConversation || !user || !isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-600">Choose a chat from the queue to start responding</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#04C4DB] text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">{selectedConversation.customer.name}</h3>
            <p className="text-sm text-blue-100">{selectedConversation.customer.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="text-xs text-blue-100">
            {selectedConversation.status}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#04C4DB] mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length > 0 ? (
          <>
            {console.log('🔥 SimpleAdminChatWidget: Rendering messages:', messages)}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'agent'
                      ? 'bg-[#04C4DB] text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div>{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No messages yet</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Type your response..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04C4DB] focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="px-4 py-2 bg-[#04C4DB] text-white rounded-lg hover:bg-[#03a9c4] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Send className="h-4 w-4" />
            <span className="text-sm">Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SimpleAdminChatWidget
