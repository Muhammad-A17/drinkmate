'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Minimize2, Maximize2, User, Clock, CheckCircle } from 'lucide-react'
import { useSocket } from '@/lib/socket-context'
import { useAuth, getAuthToken } from '@/lib/auth-context'
import { useChatStatus } from '@/lib/chat-status-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface Message {
  _id: string
  content: string
  sender?: any
  senderType?: 'customer' | 'admin'
  senderId?: any
  timestamp: Date
  createdAt?: string
  messageType?: string
  attachments?: any[]
  isFromAdmin?: boolean
  formattedTime?: string
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
    name: string
  }
  lastMessageAt: Date
  messages: Message[]
  createdAt?: string
  updatedAt?: string
}

interface FloatingChatWidgetProps {
  isOnline: boolean
}

const DESKTOP_DEFAULT = { w: 360, h: 520 }
const STORAGE_KEY = 'chat:size:v1'

export default function FloatingChatWidget({ isOnline }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Debug isOpen state changes
  useEffect(() => {
    console.log('🔥 Chat widget isOpen state changed:', isOpen)
  }, [isOpen])
  const [isFull, setIsFull] = useState(false)
  const [size, setSize] = useState(DESKTOP_DEFAULT)
  const [isMobile, setIsMobile] = useState(false)
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  
  // Debug chatSession state changes
  useEffect(() => {
    console.log('🔥 Chat session state changed:', chatSession ? {
      id: chatSession._id,
      status: chatSession.status,
      messageCount: chatSession.messages?.length || 0
    } : 'null')
  }, [chatSession])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  const { socket, isConnected, connectSocket, disconnectSocket, joinChat, leaveChat, sendMessage, startTyping, stopTyping } = useSocket()
  const { user, isAuthenticated } = useAuth()
  const { chatStatus } = useChatStatus()

  // Helper function to check for existing active chat sessions
  const checkForExistingSession = async (): Promise<string | null> => {
    if (!user || !isAuthenticated) {
      console.log('🔥 checkForExistingSession: User not authenticated')
      return null
    }
    
    try {
      const token = getAuthToken()
      if (!token) {
        console.log('🔥 checkForExistingSession: No auth token')
        return null
      }
      
      console.log('🔥 checkForExistingSession: Fetching chats for user:', user._id)
      const response = await fetch('http://localhost:3000/chat', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('🔥 checkForExistingSession: Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔥 checkForExistingSession: Chats data:', data)
        
        const activeChat = data.data.chats.find((chat: any) => 
          chat.status === 'active' && 
          chat.customer.userId === user._id &&
          !chat.isDeleted
        )
        
        if (activeChat) {
          console.log('🔥 Found existing active chat session:', activeChat._id)
          return activeChat._id
        } else {
          console.log('🔥 No active chat session found for user')
        }
      } else {
        console.log('🔥 checkForExistingSession: Response not ok:', response.status)
      }
    } catch (error) {
      console.error('🔥 Error checking for existing session:', error)
    }
    
    return null
  }

  // Load complete chat data including messages and agent info
  const loadCompleteChatData = async (chatId: string) => {
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

        // Process messages to determine sender type correctly
        const processedMessages = messages.map((msg: any) => {
          // Determine if message is from admin/agent
          const isFromAdmin = msg.sender === 'admin' || 
                             msg.sender === 'agent' || 
                             (msg.senderId && msg.senderId.isAdmin) ||
                             (msg.sender && typeof msg.sender === 'object' && msg.sender.isAdmin)
          
          return {
            ...msg,
            isFromAdmin,
            formattedTime: new Date(msg.createdAt || msg.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          }
        })

        // Set complete chat session with processed data
        const completeChatSession = {
          _id: chat._id,
          sessionId: chat.sessionId || chat._id,
          status: chat.status,
          assignedTo: chat.assignedTo ? {
            name: chat.assignedTo.name || chat.assignedTo.firstName || 'Support'
          } : undefined,
          customer: chat.customer,
          lastMessageAt: new Date(chat.lastMessageAt || chat.updatedAt || chat.createdAt),
          messages: processedMessages
        }
        
        setChatSession(completeChatSession)
        
        // Join the chat room
        joinChat(chatId)

        console.log('🔥 Loaded complete chat data:', {
          chatId,
          status: chat.status,
          assignedTo: chat.assignedTo,
          messageCount: processedMessages.length,
          messages: processedMessages,
          completeChatSession
        })
      }
    } catch (error) {
      console.error('Error loading complete chat data:', error)
    }
  }

  // Load chat messages (legacy function, keeping for compatibility)
  const loadChatMessages = async (chatId: string) => {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      const response = await fetch(`http://localhost:3000/chat/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setChatSession(prev => prev ? {
          ...prev,
          messages: data.data.messages || []
        } : null)
        console.log('🔥 Loaded messages for chat:', chatId, data.data.messages?.length || 0)
      }
    } catch (error) {
      console.error('Error loading chat messages:', error)
    }
  }

  const isChatOnline = () => {
    return chatStatus.isOnline
  }

  // Listen for external chat open events
  useEffect(() => {
    const handleOpenChatEvent = () => {
      console.log('🔥 Chat open event received:', { isAuthenticated, isChatOnline: isChatOnline() })
      if (isAuthenticated && isChatOnline()) {
        connectSocket()
        setIsOpen(true)
      }
    }

    window.addEventListener('openChatWidget', handleOpenChatEvent)
    
    return () => {
      window.removeEventListener('openChatWidget', handleOpenChatEvent)
    }
  }, [isAuthenticated, connectSocket, chatStatus.isOnline])

  // Cleanup socket connection on unmount
  useEffect(() => {
    return () => {
      disconnectSocket()
    }
  }, [disconnectSocket])

  // Check for existing chat session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      console.log('🔥 Checking for existing chat session:', { user: user?.name, isAuthenticated })
      if (!user || !isAuthenticated) return
      
      const existingSessionId = await checkForExistingSession()
      console.log('🔥 Existing session ID:', existingSessionId)
      if (existingSessionId) {
        console.log('🔥 Restoring existing chat session from database:', existingSessionId)
        // Connect socket first
        connectSocket()
        // Load complete chat data (this will also join the chat room)
        await loadCompleteChatData(existingSessionId)
        // Auto-open the chat if there's an existing session
        setIsOpen(true)
      } else {
        console.log('🔥 No existing chat session found')
      }
    }
    
    checkExistingSession()
  }, [user, isAuthenticated])

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 767px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load/save size (desktop only)
  useEffect(() => {
    if (isMobile) return
    
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try { 
          setSize(JSON.parse(raw)) 
        } catch (e) {
          console.warn('Failed to parse saved chat size:', e)
        }
      }
    }
  }, [isMobile])

  useEffect(() => {
    if (isMobile || typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(size))
  }, [size, isMobile])

  // Custom drag handle (works everywhere)
  useEffect(() => {
    const el = boxRef.current
    const handle = el?.querySelector<HTMLElement>('.chat-resize-handle')
    if (!el || !handle || isMobile) return

    let startX = 0, startY = 0, startW = 0, startH = 0, dragging = false
    
    const onDown = (e: MouseEvent | TouchEvent) => {
      dragging = true
      const p = 'touches' in e ? e.touches[0] : e
      startX = p.clientX
      startY = p.clientY
      startW = el.offsetWidth
      startH = el.offsetHeight
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
      document.addEventListener('touchmove', onMove, { passive: false })
      document.addEventListener('touchend', onUp)
    }
    
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return
      if ('preventDefault' in e) e.preventDefault()
      const p = 'touches' in e ? e.touches[0] : e
      const w = Math.max(280, Math.min(window.innerWidth * 0.92, startW + (p.clientX - startX)))
      const h = Math.max(360, Math.min(window.innerHeight - 120, startH + (p.clientY - startY)))
      setSize({ w, h })
      el.style.width = `${w}px`
      el.style.height = `${h}px`
    }
    
    const onUp = () => {
      dragging = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove as any)
      document.removeEventListener('touchend', onUp)
    }

    handle.addEventListener('mousedown', onDown)
    handle.addEventListener('touchstart', onDown, { passive: true })
    return () => {
      handle.removeEventListener('mousedown', onDown)
      handle.removeEventListener('touchstart', onDown)
      onUp()
    }
  }, [isMobile])

  // Lock body scroll for mobile full-screen
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.classList.add('chat-open')
    } else {
      document.body.classList.remove('chat-open')
    }
    
    return () => {
      document.body.classList.remove('chat-open')
    }
  }, [isOpen, isMobile])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatSession?.messages])

  // Create or get existing chat session when opened
  useEffect(() => {
    if (isOpen && user && isAuthenticated && isConnected) {
      createOrGetChatSession()
    }
  }, [isOpen, user, isAuthenticated, isConnected])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data: { chatId: string; message: Message }) => {
      console.log('🔥 New message received:', {
        messageId: data.message._id,
        chatId: data.chatId,
        currentChatId: chatSession?._id,
        sender: data.message.senderId || data.message.sender,
        content: data.message.content?.substring(0, 50) + '...'
      })
      
      if (chatSession && data.chatId === chatSession._id) {
        setChatSession(prev => {
          if (!prev) return null
          
          // Check if message already exists to prevent duplicates
          const messageExists = prev.messages.some(msg => msg._id === data.message._id)
          if (messageExists) {
            console.log('🔥 Message already exists, skipping duplicate')
            return prev
          }
          
          // Process the new message with proper sender detection
          const isFromAdmin = data.message.sender === 'admin' || 
                             data.message.sender === 'agent' || 
                             (data.message.senderId && data.message.senderId.isAdmin) ||
                             (data.message.sender && typeof data.message.sender === 'object' && data.message.sender.isAdmin)
          
          const processedMessage = {
            ...data.message,
            isFromAdmin,
            formattedTime: new Date(data.message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          }
          
          console.log('🔥 Processed message:', {
            messageId: processedMessage._id,
            isFromAdmin,
            sender: processedMessage.sender,
            content: processedMessage.content?.substring(0, 30) + '...'
          })
          
          const updatedMessages = [...prev.messages, processedMessage]
          console.log('🔥 Updated messages count:', updatedMessages.length)
          
          return {
            ...prev,
            messages: updatedMessages
          }
        })
        
        // Increment unread count if chat is minimized or closed
        if (!isOpen) {
          setUnreadCount(prev => prev + 1)
        }
      } else {
        console.log('🔥 Message not for current chat session, ignoring')
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
          assignedTo: data.assignedTo ? {
            name: data.assignedTo.name || data.assignedTo.firstName || 'Support'
          } : prev.assignedTo
        } : null)
        console.log('🔥 Chat updated:', data.status, data.assignedTo)
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
  }, [socket, chatSession, isOpen])

  const createOrGetChatSession = async (messageToSend?: string) => {
    // Prevent multiple simultaneous session creation attempts
    if (isCreatingSession) {
      console.log('🔥 Session creation already in progress, skipping...')
      return
    }

    console.log('🔥 Starting chat session management for user:', user?.name || user?.username)
    try {
      setIsCreatingSession(true)
      setIsLoading(true)
      setError(null)

      if (!isAuthenticated || !user) {
        console.log('🔥 User not authenticated, redirecting to login')
        setError('Please log in to start a chat session.')
        return
      }

      const token = getAuthToken()
      
      if (!token) {
        console.log('🔥 No auth token found')
        setError('Please log in to start a chat session.')
        return
      }

      console.log('🔥 Auth token found, checking for existing active session...')

      // If we already have a chat session in state, use it
      if (chatSession && chatSession._id) {
        console.log('🔥 Using existing chat session from state:', chatSession._id)
        joinChat(chatSession._id)
        return
      }

      // First, check if user has an existing active chat session
      const existingChatResponse = await fetch('http://localhost:3000/chat/customer', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (existingChatResponse.ok) {
        const existingData = await existingChatResponse.json()
        console.log('🔥 Existing chats response:', existingData)
        
        // Look for active chat sessions for this user
        const activeChat = existingData.data.chats.find((chat: any) => 
          chat.status === 'active' && 
          chat.customer.userId === user?._id &&
          !chat.isDeleted
        )

        if (activeChat) {
          console.log('🔥 Found existing active chat session:', {
            chatId: activeChat._id,
            status: activeChat.status,
            assignedTo: activeChat.assignedTo,
            createdAt: activeChat.createdAt
          })

          // Load complete chat data including messages and agent info
          await loadCompleteChatData(activeChat._id)
          joinChat(activeChat._id)
          console.log('🔥 Reusing existing chat session')
          return
        } else {
          console.log('🔥 No active chat session found, will create new one')
        }
      } else if (existingChatResponse.status === 401) {
        console.log('🔥 Unauthorized, redirecting to login')
        setError('Please log in to start a chat session.')
        return
      } else {
        console.log('🔥 Error fetching existing chats, will create new one:', existingChatResponse.status)
      }

      // Only create new chat session if no active session exists
      console.log('🔥 Creating new chat session...')
      const newChatResponse = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: {
            name: user?.name || user?.username || 'Unknown Customer',
            email: user?.email,
            userId: user?._id
          },
          category: 'general',
          priority: 'medium'
        })
      })

      console.log('🔥 New chat response status:', newChatResponse.status)

      if (newChatResponse.ok) {
        const newChatData = await newChatResponse.json()
        console.log('🔥 Created new chat session successfully:', {
          chatId: newChatData.data._id,
          status: newChatData.data.status,
          customer: newChatData.data.customer
        })
        
        // Set the chat session with empty messages array initially
        setChatSession({
          ...newChatData.data,
          messages: []
        })
        
        // Join the chat room
        joinChat(newChatData.data._id)
        
        console.log('🔥 New chat session set and joined successfully')
        
        // If there's a message to send, send it now
        if (messageToSend && messageToSend.trim()) {
          console.log('🔥 Sending first message after creating session:', messageToSend.substring(0, 50) + '...')
          // Wait a moment for the socket to be ready
          setTimeout(() => {
            sendFirstMessage(newChatData.data._id, messageToSend.trim())
          }, 500)
        }
      } else {
        const errorData = await newChatResponse.json()
        console.error('🔥 Failed to create chat session:', errorData)
        throw new Error(errorData.message || 'Failed to create chat session')
      }
    } catch (err) {
      console.error('🔥 Error managing chat session:', err)
      setError(err instanceof Error ? err.message : 'Failed to start chat. Please try again.')
    } finally {
      setIsLoading(false)
      setIsCreatingSession(false)
    }
  }

  const sendFirstMessage = async (chatId: string, messageContent: string) => {
    try {
      const messageData = {
        content: messageContent,
        messageType: 'text'
      }

      // Send via socket if connected
      if (isConnected && socket) {
        console.log('🔥 Sending first message via socket...')
        sendMessage(chatId, messageContent, 'text')
      }

      // Also send via API for persistence
      console.log('🔥 Sending first message via API...')
      const token = getAuthToken()
      console.log('🔥 First message auth token:', token ? 'present' : 'missing')
      
      const response = await fetch(`http://localhost:3000/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('🔥 First message sent successfully:', responseData)
        
        // Add the message to local state
        if (responseData.data?.message) {
          const newMessageObj = {
            ...responseData.data.message,
            formattedTime: new Date(responseData.data.message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          }
          
          setChatSession(prev => {
            if (!prev) return prev
            return {
              ...prev,
              messages: [...prev.messages, newMessageObj]
            }
          })
        }
        
        // Clear the input
        setNewMessage('')
      } else {
        console.error('🔥 Failed to send first message via API')
      }
    } catch (err) {
      console.error('🔥 Error sending first message:', err)
    }
  }

  const handleSendMessage = async () => {
    console.log('🔥 handleSendMessage called:', {
      newMessage: newMessage,
      hasMessage: !!newMessage.trim(),
      hasChatSession: !!chatSession,
      chatSessionId: chatSession?._id,
      isConnected,
      socket: !!socket
    })

    if (!newMessage.trim()) {
      console.log('🔥 Cannot send message: no message content')
      return
    }

    // If no chat session exists, create one first
    if (!chatSession) {
      console.log('🔥 No chat session, creating new one...')
      await createOrGetChatSession(newMessage.trim())
      return
    }

    console.log('🔥 Sending message:', {
      chatId: chatSession._id,
      content: newMessage.trim().substring(0, 50) + '...',
      messageType: 'text'
    })

    // Store the message content before clearing the input
    const messageContent = newMessage.trim()
    const messageData = {
      content: messageContent,
      messageType: 'text'
    }

    // Clear input immediately for better UX
    setNewMessage('')

    try {
      // Send via socket if connected
      if (isConnected && socket) {
        console.log('🔥 Sending via socket...', { 
          chatId: chatSession._id, 
          content: messageData.content, 
          type: messageData.messageType,
          isConnected 
        })
        sendMessage(chatSession._id, messageData.content, messageData.messageType)
      } else {
        console.log('🔥 Socket not connected, skipping socket send')
      }

      // Also send via API for persistence
      console.log('🔥 Sending via API...')
      const token = getAuthToken()
      console.log('🔥 Auth token:', token ? 'present' : 'missing')
      
      const response = await fetch(`http://localhost:3000/chat/${chatSession._id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      })

      console.log('🔥 API response status:', response.status)

      if (response.ok) {
        const responseData = await response.json()
        console.log('🔥 Message sent successfully:', responseData)
        
        // Add the message to local state if we have the message data
        if (responseData.data?.message) {
          const newMessageObj = {
            ...responseData.data.message,
            formattedTime: new Date(responseData.data.message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          }
          
          setChatSession(prev => {
            if (!prev) return prev
            return {
              ...prev,
              messages: [...prev.messages, newMessageObj]
            }
          })
        } else {
          // Fallback: add message to local state even if server doesn't return it
          const tempMessage = {
            _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: messageContent,
            sender: 'customer',
            senderId: user?._id,
            messageType: 'text',
            timestamp: new Date(),
            createdAt: new Date().toISOString(),
            isFromAdmin: false,
            formattedTime: new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          }
          
          setChatSession(prev => {
            if (!prev) return prev
            return {
              ...prev,
              messages: [...prev.messages, tempMessage]
            }
          })
        }
        
        stopTyping(chatSession._id)
      } else {
        const errorData = await response.json()
        console.error('🔥 Failed to send message via API:', errorData)
        // Restore the message to input if API failed
        setNewMessage(messageContent)
        throw new Error(errorData.message || 'Failed to send message')
      }
    } catch (err) {
      console.error('🔥 Error sending message:', err)
      // Restore the message to input if sending failed
      setNewMessage(messageContent)
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


  const handleToggleChat = () => {
    console.log('🔥 Chat toggle clicked:', {
      isOpen,
      hasUser: !!user,
      user: user?.name || user?.username,
      isChatOnline: isChatOnline(),
      chatStatus: chatStatus,
      isCreatingSession,
      isLoading
    })

    if (!user) {
      console.log('🔥 No user found, redirecting to login')
      // Show proper login prompt with return URL
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?returnUrl=${currentUrl}&reason=chat`
      return
    }
    
    if (!isChatOnline()) {
      console.log('🔥 Chat is offline, showing offline message')
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

    // Prevent multiple clicks while session is being created
    if (isCreatingSession || isLoading) {
      console.log('🔥 Session creation in progress, ignoring click')
      return
    }

    if (!isOpen) {
      console.log('🔥 Opening chat - connecting socket and creating session')
      // Opening chat - connect socket first
      connectSocket()
      setIsOpen(true)
      // Create or get chat session
      createOrGetChatSession()
    } else {
      console.log('🔥 Closing chat - disconnecting socket')
      // Closing chat - disconnect socket
      setIsOpen(false)
      setUnreadCount(0)
      if (chatSession) {
        leaveChat(chatSession._id)
      }
      // Disconnect socket when closing chat
      disconnectSocket()
    }
  }

  const handleCloseChat = () => {
    setIsOpen(false)
    setUnreadCount(0)
    if (chatSession) {
      leaveChat(chatSession._id)
    }
    // Disconnect socket when closing chat
    disconnectSocket()
  }

  // Don't render if user is not authenticated
  if (!user || !isAuthenticated) {
    return null
  }

  // Inline size only on desktop
  const desktopStyle: React.CSSProperties = !isMobile
    ? { width: size.w, height: size.h }
    : {}

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleToggleChat}
          className="relative w-14 h-14 bg-[#04C4DB] hover:bg-[#02B4CA] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {!isOnline && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
          )}
        </button>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div
          ref={boxRef}
          className={`chat-widget ${isFull ? 'chat--fullscreen' : ''}`}
          style={desktopStyle}
          role="dialog"
          aria-label="Live chat"
          aria-modal={isMobile}
        >
          {/* Header */}
          <header className="chat-header">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#04C4DB] rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <strong>Live Chat</strong>
                {chatSession && (
                  <span className="text-xs text-gray-500 ml-2">#{chatSession.sessionId.slice(-6)}</span>
                )}
              </div>
            </div>
            <div className="spacer" />
            <div className="flex items-center space-x-1">
              {/* Desktop controls */}
              {!isMobile && (
                <button 
                  onClick={() => setIsFull(v => !v)} 
                  aria-label={isFull ? 'Restore size' : 'Maximize'}
                  className="mr-2"
                >
                  {isFull ? '⤡' : '⤢'}
                </button>
              )}
              <button 
                onClick={handleCloseChat} 
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </header>

          {/* Status Bar */}
          {chatSession && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {chatSession.assignedTo 
                    ? `Agent: ${chatSession.assignedTo.name || 'Support'}`
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
          <main className="chat-body" role="log" aria-live="polite">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#04C4DB] mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Connecting...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-red-600 text-sm mb-2">{error}</p>
                  {error.includes('log in') ? (
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-3 py-1 bg-[#04C4DB] text-white text-xs rounded hover:bg-[#02B4CA] transition-colors"
                    >
                      Go to Login
                    </button>
                  ) : (
                    <button
                      onClick={() => createOrGetChatSession()}
                      className="px-3 py-1 bg-[#04C4DB] text-white text-xs rounded hover:bg-[#02B4CA] transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
              ) : !chatSession ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6">Please describe your issue or query</p>
                </div>
            ) : chatSession?.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Please describe your issue or query</p>
                </div>
              </div>
            ) : (
              <>
                {chatSession?.messages.map((message) => {
                  // Determine if message is from current user (customer)
                  const isFromCurrentUser = user && (
                    (message.sender && typeof message.sender === 'object' && message.sender._id === user._id) ||
                    message.sender === 'customer' || 
                    message.sender === 'user' ||
                    (message.senderId && message.senderId._id === user._id) ||
                    !message.isFromAdmin // If not from admin, assume it's from customer
                  )
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                          isFromCurrentUser
                            ? 'bg-[#04C4DB] text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isFromCurrentUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.formattedTime || formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start mb-3">
                    <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </main>

          {/* Message Input - Always show when chat is open */}
          {isOpen && (
            <footer className="chat-footer">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    if (chatSession) {
                      handleTyping()
                    }
                  }}
                  onKeyPress={(e) => {
                    console.log('🔥 Key pressed:', e.key)
                    if (e.key === 'Enter' && !e.shiftKey) {
                      console.log('🔥 Enter key pressed, calling handleSendMessage')
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#04C4DB] focus:border-transparent text-sm"
                  disabled={!isConnected}
                />
                <button
                  onClick={() => {
                    console.log('🔥 Send button clicked!')
                    handleSendMessage()
                  }}
                  disabled={!newMessage.trim() || !isConnected}
                  className="p-2 bg-[#04C4DB] text-white rounded-full hover:bg-[#02B4CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-2 text-right">
                {newMessage.length}/500
              </div>
            </footer>
          )}

          {/* Desktop drag handle */}
          {!isMobile && <div className="chat-resize-handle" aria-hidden="true" />}
        </div>
      )}
    </>
  )
}