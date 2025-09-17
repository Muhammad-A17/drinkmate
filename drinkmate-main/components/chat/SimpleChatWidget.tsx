'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { useSocket } from '@/lib/socket-context'
import { useChatStatus } from '@/lib/chat-status-context'
import { responseETAService, ResponseETA } from '@/lib/response-eta-service'
import { Message, ChatSession } from '@/types/chat'

const SimpleChatWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const { socket, isConnected, connectSocket, disconnectSocket, joinChat, leaveChat, sendMessage } = useSocket()
  const { chatStatus } = useChatStatus()
  
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseETA, setResponseETA] = useState<ResponseETA | null>(null)
  const [etaLoading, setEtaLoading] = useState(false)
  
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
  }, [chatSession?.messages])

  // Fetch response ETA
  const fetchResponseETA = useCallback(async () => {
    if (!isOpen || etaLoading) return
    
    try {
      setEtaLoading(true)
      console.log('🔥 SimpleChatWidget: Fetching response ETA')
      
      const eta = await responseETAService.getResponseETA()
      setResponseETA(eta)
      
      console.log('🔥 SimpleChatWidget: Response ETA:', eta)
    } catch (error) {
      console.error('🔥 SimpleChatWidget: Error fetching response ETA:', error)
    } finally {
      setEtaLoading(false)
    }
  }, [isOpen, etaLoading])

  // Update ETA when chat session changes
  useEffect(() => {
    if (isOpen) {
      // Always fetch general ETA (no specific chat ETA endpoint exists)
      fetchResponseETA()
    }
  }, [isOpen, fetchResponseETA])

  // Check for existing active chat session
  const checkForExistingSession = async (): Promise<string | null> => {
    console.log('🔥 SimpleChatWidget: Checking for existing session', { user: user?.name, isAuthenticated })
    
    if (!user || !isAuthenticated) {
      console.log('🔥 SimpleChatWidget: User not authenticated')
      return null
    }
    
    try {
      const token = getAuthToken()
      if (!token) {
        console.log('🔥 SimpleChatWidget: No auth token')
        return null
      }
      
      console.log('🔥 SimpleChatWidget: Fetching chats for user:', user._id)
      const response = await fetch('http://localhost:3000/chat/customer', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('🔥 SimpleChatWidget: Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔥 SimpleChatWidget: Chats data:', data)
        
        const activeChat = data.data.chats.find((chat: any) => {
          const isActive = chat.status === 'active'
          const isUserChat = chat.customer.userId === user._id
          const isNotDeleted = !chat.isDeleted
          
          console.log('🔥 SimpleChatWidget: Checking chat:', {
            chatId: chat._id,
            status: chat.status,
            customerUserId: chat.customer.userId,
            currentUserId: user._id,
            isDeleted: chat.isDeleted,
            isActive,
            isUserChat,
            isNotDeleted
          })
          
          return isActive && isUserChat && isNotDeleted
        })
        
        if (activeChat) {
          console.log('🔥 SimpleChatWidget: Found active chat session:', activeChat._id)
          return activeChat._id
        } else {
          console.log('🔥 SimpleChatWidget: No active chat session found for user')
        }
      } else {
        console.log('🔥 SimpleChatWidget: Response not ok:', response.status)
      }
    } catch (error) {
      console.error('🔥 SimpleChatWidget: Error checking for existing session:', error)
    }
    
    return null
  }

  // Load complete chat data including messages
  const loadCompleteChatData = async (chatId: string) => {
    console.log('🔥 SimpleChatWidget: Loading chat data for:', chatId)
    try {
      const token = getAuthToken()
      
      // Fetch chat details
      const chatResponse = await fetch(`http://localhost:3000/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (chatResponse.ok) {
        const chatData = await chatResponse.json()
        const chat = chatData.data

        // Fetch messages
        const messagesResponse = await fetch(`http://localhost:3000/chat/${chatId}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        let messages = []
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()
          messages = messagesData.data.messages || []
        }

        // Process messages
        const processedMessages = messages.map((msg: any): Message => {
          return {
            id: msg._id || msg.id,
            content: msg.content,
            sender: msg.sender === 'admin' || msg.sender === 'agent' ? 'agent' : 'customer',
            timestamp: msg.createdAt || msg.timestamp,
            isNote: msg.isNote || false,
            attachments: msg.attachments || [],
            readAt: msg.readAt
          }
        })

        const completeChatSession = {
          _id: chat._id,
          status: chat.status,
          customer: chat.customer,
          assignedTo: chat.assignedTo,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          lastMessageAt: new Date(chat.lastMessageAt || chat.updatedAt || chat.createdAt),
          messages: processedMessages
        }
        
        setChatSession(completeChatSession)
        
        // Join the chat room
        joinChat(chatId)

        console.log('🔥 SimpleChatWidget: Successfully loaded chat data:', {
          chatId,
          messageCount: processedMessages.length
        })
      }
    } catch (error) {
      console.error('🔥 SimpleChatWidget: Error loading chat data:', error)
    }
  }

  // Create new chat session
  const createNewChatSession = async (messageToSend?: string) => {
    console.log('🔥 SimpleChatWidget: Creating new chat session')
    try {
      setIsCreatingSession(true)
      const token = getAuthToken()
      
      const newChatResponse = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: {
            userId: user?._id,
            name: user?.name || user?.username,
            email: user?.email
          }
        })
      })

      if (newChatResponse.ok) {
        const newChatData = await newChatResponse.json()
        console.log('🔥 SimpleChatWidget: Created new chat session:', newChatData.data._id)
        
        const newSession = {
          _id: newChatData.data._id,
          status: newChatData.data.status,
          customer: newChatData.data.customer,
          assignedTo: newChatData.data.assignedTo,
          createdAt: newChatData.data.createdAt,
          updatedAt: newChatData.data.updatedAt,
          lastMessageAt: new Date(),
          messages: []
        }
        
        setChatSession(newSession)
        joinChat(newChatData.data._id)

        // Send first message if provided
        if (messageToSend) {
          setTimeout(() => {
            sendFirstMessage(newChatData.data._id, messageToSend.trim())
          }, 500)
        }
      } else {
        const errorData = await newChatResponse.json()
        console.error('🔥 SimpleChatWidget: Failed to create chat session:', errorData)
        throw new Error(errorData.message || 'Failed to create chat session')
      }
    } catch (err) {
      console.error('🔥 SimpleChatWidget: Error creating chat session:', err)
      setError('Failed to create chat session. Please try again.')
    } finally {
      setIsCreatingSession(false)
    }
  }

  // Send first message to create session
  const sendFirstMessage = async (chatId: string, content: string) => {
    try {
      const token = getAuthToken()
      
      const response = await fetch(`http://localhost:3000/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          messageType: 'text'
        })
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('🔥 SimpleChatWidget: First message sent successfully:', responseData)
        
        // Add message to local state
        const newMessage: Message = {
          id: responseData.data.message._id,
          content,
          sender: 'customer',
          timestamp: new Date().toISOString(),
          isNote: false,
          attachments: [],
          readAt: undefined
        }
        
        setChatSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, newMessage]
        } : null)
      }
    } catch (error) {
      console.error('🔥 SimpleChatWidget: Error sending first message:', error)
    }
  }

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const messageContent = newMessage.trim()
    setNewMessage('')

    // If no chat session exists, create one first
    if (!chatSession) {
      try {
        await createNewChatSession(messageContent)
        return
      } catch (error) {
        console.error('🔥 SimpleChatWidget: Error creating chat session:', error)
        setError('Failed to create chat session. Please try again.')
        return
      }
    }

    // Add message to local state immediately
    const messageToAdd: Message = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      sender: 'customer',
      timestamp: new Date().toISOString(),
      isNote: false,
      attachments: [],
      readAt: undefined
    }

    setChatSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, messageToAdd]
    } : null)

    // Send via socket or API
    try {
      if (socket && isConnected) {
        sendMessage(chatSession._id, messageContent, 'text')
      } else {
        // API fallback
        const token = getAuthToken()
        const response = await fetch(`http://localhost:3000/chat/${chatSession._id}/message`, {
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
          console.log('🔥 SimpleChatWidget: Message sent via API:', responseData)
        }
      }
    } catch (error) {
      console.error('🔥 SimpleChatWidget: Error sending message:', error)
      setError('Failed to send message. Please try again.')
    }
  }

  // Handle widget toggle
  const handleToggleChat = useCallback(() => {
    if (!user || !isAuthenticated) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?returnUrl=${currentUrl}&reason=chat`
      return
    }

    if (!isChatOnline()) {
      const now = new Date()
      const serverTime = new Date(now.toLocaleString("en-US", { timeZone: chatStatus.timezone }))
      const currentTime = serverTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      const [startTime, endTime] = [chatStatus.workingHours.start, chatStatus.workingHours.end]
      
      alert(`Live chat is currently offline.\n\nCurrent time: ${currentTime}\nChat hours: ${startTime} - ${endTime}\n\nPlease use our contact form or email us.`)
      return
    }

    if (!isOpen) {
      connectSocket()
      setIsOpen(true)
      setIsMinimized(false)
      localStorage.setItem('chat-widget-open', 'true')
      
      // Session should already be loaded on mount, but if not, check now
      if (!chatSession) {
        console.log('🔥 SimpleChatWidget: No session found when opening, checking...')
        checkForExistingSession().then(sessionId => {
          if (sessionId) {
            loadCompleteChatData(sessionId)
          }
        })
      }
    } else {
      setIsOpen(false)
      setIsMinimized(false)
      localStorage.setItem('chat-widget-open', 'false')
      if (chatSession) {
        leaveChat(chatSession._id)
      }
      disconnectSocket()
    }
  }, [user, isAuthenticated, chatStatus, isOpen, connectSocket, chatSession, leaveChat, disconnectSocket])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data: { chatId: string; message: any }) => {
      console.log('🔥 SimpleChatWidget: New message received:', data)
      
      if (chatSession && data.chatId === chatSession._id) {
        // Check if message already exists to prevent duplicates
        const messageExists = chatSession.messages.some(msg => 
          msg.id === data.message._id || 
          msg.id === data.message.id ||
          (msg.content === data.message.content && msg.timestamp === data.message.timestamp)
        )
        
        if (messageExists) {
          console.log('🔥 SimpleChatWidget: Message already exists, skipping duplicate')
          return
        }
        
        const processedMessage: Message = {
          id: data.message._id || data.message.id || `temp_${Date.now()}`,
          content: data.message.content,
          sender: data.message.sender === 'admin' || data.message.sender === 'agent' ? 'agent' : 'customer',
          timestamp: data.message.createdAt || data.message.timestamp || new Date().toISOString(),
          isNote: data.message.isNote || false,
          attachments: data.message.attachments || [],
          readAt: data.message.readAt
        }
        
        setChatSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, processedMessage]
        } : null)
      }
    }

    socket.on('new_message', handleNewMessage)

    return () => {
      socket.off('new_message', handleNewMessage)
    }
  }, [socket, chatSession?._id]) // Only depend on chatSession._id, not the entire object

  // Check for existing session on mount and when user changes
  useEffect(() => {
    if (user && isAuthenticated && !chatSession) {
      console.log('🔥 SimpleChatWidget: Checking for existing session on mount')
      checkForExistingSession().then(sessionId => {
        if (sessionId) {
          console.log('🔥 SimpleChatWidget: Found existing session, loading data:', sessionId)
          loadCompleteChatData(sessionId)
          
          // If there was an existing session, auto-open the chat widget
          const wasOpen = localStorage.getItem('chat-widget-open') === 'true'
          if (wasOpen) {
            console.log('🔥 SimpleChatWidget: Restoring chat widget state - was open before refresh')
            setIsOpen(true)
            connectSocket()
          }
        } else {
          console.log('🔥 SimpleChatWidget: No existing session found')
        }
      })
    }
  }, [user, isAuthenticated]) // Remove chatSession from dependencies to avoid infinite loop

  // Listen for custom event to open chat widget
  useEffect(() => {
    const handleOpenChatWidget = () => {
      console.log('🔥 SimpleChatWidget: Received openChatWidget event')
      if (!isOpen) {
        handleToggleChat()
      }
    }

    window.addEventListener('openChatWidget', handleOpenChatWidget)
    
    return () => {
      window.removeEventListener('openChatWidget', handleOpenChatWidget)
    }
  }, [isOpen, handleToggleChat]) // Include both isOpen and handleToggleChat in dependencies

  // Check if chat is online
  const isChatOnline = () => {
    if (!chatStatus.isEnabled) return false
    if (chatStatus.isOnline) return true
    
    const now = new Date()
    const serverTime = new Date(now.toLocaleString("en-US", { timeZone: chatStatus.timezone }))
    const currentTime = serverTime.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    const [startTime, endTime] = [chatStatus.workingHours.start, chatStatus.workingHours.end]
    
    return currentTime >= startTime && currentTime <= endTime
  }

  // Don't render if user is not authenticated or chat is offline
  if (!user || !isAuthenticated || !isChatOnline()) {
    return null
  }

  return (
    <>
      {/* Chat Launcher */}
      {!isOpen && (
        <button
          onClick={handleToggleChat}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#04C4DB] text-white rounded-full shadow-lg hover:bg-[#03a9c4] transition-all duration-200 flex items-center justify-center z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 ${isMinimized ? 'h-12' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#04C4DB] text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">Live Chat</span>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={handleToggleChat}
                className="p-1 hover:bg-white/20 rounded"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ETA Display */}
          {!isMinimized && responseETA && (
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    responseETA.isOnline ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <span className="text-gray-700">
                    {responseETA.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-gray-600">
                    {etaLoading ? (
                      <span className="text-xs">Calculating...</span>
                    ) : (
                      <>
                        <span className="font-medium text-gray-900">
                          {responseETA.estimatedResponseTime}
                        </span>
                        {responseETA.queuePosition !== undefined && responseETA.queuePosition > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            (Position #{responseETA.queuePosition + 1})
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {responseETA.currentLoad && (
                    <div className={`text-xs ${
                      responseETA.currentLoad === 'low' ? 'text-green-600' :
                      responseETA.currentLoad === 'medium' ? 'text-yellow-600' :
                      responseETA.currentLoad === 'high' ? 'text-orange-600' :
                      responseETA.currentLoad === 'critical' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {responseETA.currentLoad === 'low' ? 'Low Load' :
                       responseETA.currentLoad === 'medium' ? 'Medium Load' :
                       responseETA.currentLoad === 'high' ? 'High Load' :
                       responseETA.currentLoad === 'critical' ? 'Critical Load' : 'Unknown'}
                    </div>
                  )}
                </div>
              </div>
              {!responseETA.isOnline && responseETA.nextAvailable && (
                <div className="text-xs text-orange-600 mt-1">
                  Next available: {responseETA.nextAvailable}
                </div>
              )}
            </div>
          )}

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatSession?.messages && chatSession.messages.length > 0 ? (
                  chatSession.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'agent' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.sender === 'agent'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-[#04C4DB] text-white'
                        }`}
                      >
                        <div>{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender === 'agent' ? 'text-gray-500' : 'text-blue-100'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Start a conversation</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
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
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#04C4DB] focus:border-transparent text-sm"
                    disabled={isCreatingSession}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isCreatingSession}
                    className="p-2 bg-[#04C4DB] text-white rounded-full hover:bg-[#03a9c4] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 text-xs mt-2">{error}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default SimpleChatWidget
