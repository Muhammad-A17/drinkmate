'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './auth-context'
import { useSocket } from './socket-context'
import { Message, ChatSession, Conversation } from '@/types/chat'

// Chat State Interface
interface ChatState {
  // Current active chat
  currentChat: ChatSession | null
  
  // All conversations (for admin)
  conversations: Conversation[]
  
  // UI State
  isOpen: boolean
  isMinimized: boolean
  isLoading: boolean
  error: string | null
  
  // Message State
  messages: Message[]
  unreadCount: number
  
  // Typing indicators
  typingUsers: Set<string>
  
  // Connection state
  isConnected: boolean
  isReconnecting: boolean
}

// Action Types
type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_OPEN'; payload: boolean }
  | { type: 'SET_MINIMIZED'; payload: boolean }
  | { type: 'SET_CURRENT_CHAT'; payload: ChatSession | null }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'ADD_TYPING_USER'; payload: string }
  | { type: 'REMOVE_TYPING_USER'; payload: string }
  | { type: 'SET_CONNECTION_STATE'; payload: { isConnected: boolean; isReconnecting: boolean } }
  | { type: 'CLEAR_CHAT' }

// Initial State
const initialState: ChatState = {
  currentChat: null,
  conversations: [],
  isOpen: false,
  isMinimized: false,
  isLoading: false,
  error: null,
  messages: [],
  unreadCount: 0,
  typingUsers: new Set(),
  isConnected: false,
  isReconnecting: false
}

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_OPEN':
      return { ...state, isOpen: action.payload }
    
    case 'SET_MINIMIZED':
      return { ...state, isMinimized: action.payload }
    
    case 'SET_CURRENT_CHAT':
      return { 
        ...state, 
        currentChat: action.payload,
        messages: action.payload?.messages || []
      }
    
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload }
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      }
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      }
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload }
    
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload }
    
    case 'ADD_TYPING_USER':
      return {
        ...state,
        typingUsers: new Set([...state.typingUsers, action.payload])
      }
    
    case 'REMOVE_TYPING_USER':
      const newTypingUsers = new Set(state.typingUsers)
      newTypingUsers.delete(action.payload)
      return { ...state, typingUsers: newTypingUsers }
    
    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        isConnected: action.payload.isConnected,
        isReconnecting: action.payload.isReconnecting
      }
    
    case 'CLEAR_CHAT':
      return {
        ...state,
        currentChat: null,
        messages: [],
        unreadCount: 0,
        typingUsers: new Set()
      }
    
    default:
      return state
  }
}

// Context
interface ChatContextType {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  
  // Actions
  openChat: () => void
  closeChat: () => void
  toggleMinimize: () => void
  sendMessage: (content: string, type?: string) => Promise<void>
  loadChat: (chatId: string) => Promise<void>
  createNewChat: () => Promise<void>
  markAsRead: () => void
  startTyping: () => void
  stopTyping: () => void
  updateMessageStatus: (messageId: string, status: string) => Promise<void>
  
  // Getters
  getUnreadCount: () => number
  isTyping: (userId: string) => boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Provider Component
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { user, isAuthenticated } = useAuth()
  const { socket, isConnected, sendMessage: socketSendMessage, joinChat, leaveChat } = useSocket()
  const stateRef = useRef(state)

  // Update ref when state changes
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Helper function to get auth token
  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
  }, [])

  // Load chat data from API
  const loadChatData = useCallback(async (chatId: string): Promise<ChatSession | null> => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No auth token')
      }


      // First, get the customer's chats to find the specific chat
      const customerChatsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/customer`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!customerChatsResponse.ok) {
        throw new Error(`Failed to fetch customer chats: ${customerChatsResponse.status} ${customerChatsResponse.statusText}`)
      }

      const customerChatsData = await customerChatsResponse.json()
      
      if (!customerChatsData.success || !customerChatsData.data?.chats) {
        throw new Error('Invalid customer chats data structure')
      }
      
      // Find the specific chat by ID
      const chat = customerChatsData.data.chats.find((c: any) => c._id === chatId)
      if (!chat) {
        throw new Error('Chat not found')
      }
      

      // Process messages from the chat object (they're already included in the response)
      let messages: Message[] = []
      if (chat.messages && Array.isArray(chat.messages)) {
        messages = chat.messages.map((msg: any): Message => ({
          id: msg._id || msg.id || `msg_${Date.now()}`,
          content: msg.content || '',
          sender: msg.sender === 'admin' || msg.sender === 'agent' ? 'agent' : 'customer',
          timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
          isNote: msg.isNote || false,
          attachments: msg.attachments || [],
          readAt: msg.readAt,
          status: msg.status || 'sent'
        }))
      } else {
      }

      const chatSession: ChatSession = {
        _id: chat._id || chatId,
        status: chat.status || 'active',
        customer: chat.customer || { id: 'unknown', name: 'Unknown Customer', email: 'unknown@example.com' },
        assignedTo: chat.assignedTo,
        createdAt: chat.createdAt || new Date().toISOString(),
        updatedAt: chat.updatedAt || new Date().toISOString(),
        lastMessageAt: new Date(chat.lastMessageAt || chat.updatedAt || chat.createdAt || new Date()),
        messages
      }
      
      return chatSession
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to load chat: ${error instanceof Error ? error.message : 'Unknown error'}` })
      return null
    }
  }, [getAuthToken])

  // Check for existing active chat
  const checkForExistingChat = useCallback(async (): Promise<string | null> => {
    if (!user || !isAuthenticated) {
      return null
    }

    try {
      const token = getAuthToken()
      if (!token) {
        return null
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      
      // First check if server is available
      try {
        const healthResponse = await fetch(`${apiUrl}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout for health check
        })
        if (!healthResponse.ok) {
          console.log('🔥 ChatProvider: Server health check failed, skipping chat check')
          return null
        }
      } catch (error) {
        console.log('🔥 ChatProvider: Server not available, skipping chat check:', error)
        return null
      }
      
      const response = await fetch(`${apiUrl}/chat/customer`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Add timeout and better error handling
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }).catch(error => {
        console.error('🔥 ChatProvider: Fetch error:', error)
        // Return null instead of throwing to prevent unhandled promise rejection
        return null
      })

      // If fetch failed, return null
      if (!response) {
        console.log('🔥 ChatProvider: Fetch failed, returning null')
        return null
      }

      console.log('🔥 ChatProvider: Response status:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.data?.chats) {
          const activeChat = data.data.chats.find((chat: any) => 
            chat.status === 'active' && 
            chat.customer.userId === user._id && 
            !chat.isDeleted
          )
          return activeChat?._id || null
        }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      // Don't throw the error, just log it and return null
      // This prevents the chat widget from breaking
    }

    return null
  }, [user, isAuthenticated, getAuthToken])

  // Actions
  const openChat = useCallback(() => {
    dispatch({ type: 'SET_OPEN', payload: true })
    dispatch({ type: 'SET_MINIMIZED', payload: false })
    localStorage.setItem('chat-widget-open', 'true')
  }, [])

  const closeChat = useCallback(() => {
    dispatch({ type: 'SET_OPEN', payload: false })
    dispatch({ type: 'SET_MINIMIZED', payload: false })
    localStorage.setItem('chat-widget-open', 'false')
    
    if (state.currentChat) {
      leaveChat(state.currentChat._id)
    }
  }, [state.currentChat, leaveChat])

  const toggleMinimize = useCallback(() => {
    dispatch({ type: 'SET_MINIMIZED', payload: !state.isMinimized })
  }, [state.isMinimized])

  const sendMessage = useCallback(async (content: string, type: string = 'text') => {
    if (!content.trim() || !state.currentChat) return

    try {
      if (socket && isConnected) {
        // Use socket - don't add optimistic update as socket will provide real-time feedback
        await socketSendMessage(state.currentChat._id, content.trim(), type)
      } else {
        // API fallback - add optimistic update since no real-time feedback
        
        const messageId = `temp_${Date.now()}`
        const newMessage: Message = {
          id: messageId,
          content: content.trim(),
          sender: 'customer',
          timestamp: new Date().toISOString(),
          isNote: false,
          attachments: [],
          status: 'sending'
        }

        // Add message optimistically
        dispatch({ type: 'ADD_MESSAGE', payload: newMessage })

        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${state.currentChat._id}/message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: content.trim(),
            messageType: type
          })
        })

        if (response.ok) {
          const responseData = await response.json()
          
          // Replace temporary message with real message
          if (responseData.data?.message) {
            const realMessage: Message = {
              id: responseData.data.message._id,
              content: responseData.data.message.content,
              sender: 'customer',
              timestamp: responseData.data.message.createdAt || responseData.data.message.timestamp,
              isNote: false,
              attachments: [],
              status: 'sent'
            }

            dispatch({ 
              type: 'UPDATE_MESSAGE', 
              payload: { 
                id: messageId, 
                updates: realMessage
              } 
            })
          }
          
          // Auto-update to delivered after a short delay
          setTimeout(() => {
            if (responseData.data?.message?._id) {
              updateMessageStatus(responseData.data.message._id, 'delivered')
            }
          }, 1000)
        } else {
          throw new Error('Failed to send message')
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' })
    }
  }, [state.currentChat, socket, isConnected, socketSendMessage, getAuthToken])

  const loadChat = useCallback(async (chatId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const chatData = await loadChatData(chatId)
      if (chatData) {
        dispatch({ type: 'SET_CURRENT_CHAT', payload: chatData })
        joinChat(chatId)
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'No chat data found' })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to load chat: ${error instanceof Error ? error.message : 'Unknown error'}` })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [loadChatData, joinChat])

  const createNewChat = useCallback(async () => {
    if (!user) return

    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: {
            userId: user._id,
            name: user.name || user.username,
            email: user.email
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const newChat: ChatSession = {
          _id: data.data._id,
          status: data.data.status,
          customer: data.data.customer,
          assignedTo: data.data.assignedTo,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
          lastMessageAt: new Date(),
          messages: []
        }
        
        dispatch({ type: 'SET_CURRENT_CHAT', payload: newChat })
        joinChat(data.data._id)
      } else {
        throw new Error('Failed to create chat')
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create chat' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [user, getAuthToken, joinChat])

  const markAsRead = useCallback(() => {
    if (state.currentChat) {
      // Mark messages as read via API
      const token = getAuthToken()
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${state.currentChat._id}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {})
      }
      
      dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 })
    }
  }, [state.currentChat, getAuthToken])

  const startTyping = useCallback(() => {
    if (socket && state.currentChat) {
      socket.emit('typing_start', { chatId: state.currentChat._id })
    }
  }, [socket, state.currentChat])

  const stopTyping = useCallback(() => {
    if (socket && state.currentChat) {
      socket.emit('typing_stop', { chatId: state.currentChat._id })
    }
  }, [socket, state.currentChat])

  // Getters
  const getUnreadCount = useCallback(() => {
    return state.unreadCount
  }, [state.unreadCount])

  const isTyping = useCallback((userId: string) => {
    return state.typingUsers.has(userId)
  }, [state.typingUsers])

  // Update message status
  const updateMessageStatus = useCallback(async (messageId: string, status: string) => {
    if (!state.currentChat) return

    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${state.currentChat._id}/messages/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        dispatch({ type: 'UPDATE_MESSAGE', payload: { id: messageId, updates: { status: status as 'sending' | 'sent' | 'delivered' | 'read' | 'failed' } } })
      }
    } catch (error) {
    }
  }, [state.currentChat, getAuthToken])

  // Socket event listeners
  useEffect(() => {
    if (!socket) {
      console.log('🔥 ChatProvider: No socket available for event listeners')
      return
    }

    console.log('🔥 ChatProvider: Setting up socket event listeners')
    console.log('🔥 ChatProvider: Socket connected:', socket.connected)
    console.log('🔥 ChatProvider: Socket ID:', socket.id)

    const handleNewMessage = (data: { chatId: string; message: any }) => {
      console.log('🔥 ChatProvider: New message received:', data)
      console.log('🔥 ChatProvider: Current chat ID:', stateRef.current.currentChat?._id)
      console.log('🔥 ChatProvider: Message chat ID:', data.chatId)
      
      // Only process messages for the current chat
      if (!stateRef.current.currentChat || data.chatId !== stateRef.current.currentChat._id) {
        console.log('🔥 ChatProvider: Message not for current chat, ignoring')
        return
      }

      // Check if message already exists to prevent duplicates
      const messageExists = stateRef.current.messages.some((msg: Message) => {
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
        console.log('🔥 ChatProvider: Message already exists, skipping duplicate')
        return
      }
      
      const message: Message = {
        id: data.message._id || data.message.id,
        content: data.message.content,
        sender: data.message.sender === 'admin' || data.message.sender === 'agent' ? 'agent' : 'customer',
        timestamp: data.message.createdAt || data.message.timestamp,
        isNote: data.message.isNote || false,
        attachments: data.message.attachments || [],
        readAt: data.message.readAt,
        status: 'delivered'
      }
      
      console.log('🔥 ChatProvider: Adding new message to state:', message)
      dispatch({ type: 'ADD_MESSAGE', payload: message })
      
      // Update unread count if message is from agent
      if (message.sender === 'agent') {
        dispatch({ type: 'SET_UNREAD_COUNT', payload: stateRef.current.unreadCount + 1 })
        
        // Auto-mark agent messages as read after a short delay
        setTimeout(() => {
          updateMessageStatus(message.id, 'read')
        }, 2000)
      }
    }

    const handleTypingStart = (data: { chatId: string; userId: string }) => {
      if (stateRef.current.currentChat && data.chatId === stateRef.current.currentChat._id) {
        dispatch({ type: 'ADD_TYPING_USER', payload: data.userId })
      }
    }

    const handleTypingStop = (data: { chatId: string; userId: string }) => {
      if (stateRef.current.currentChat && data.chatId === stateRef.current.currentChat._id) {
        dispatch({ type: 'REMOVE_TYPING_USER', payload: data.userId })
      }
    }

    // Remove any existing listeners first
    socket.off('new_message', handleNewMessage)
    socket.off('typing_start', handleTypingStart)
    socket.off('typing_stop', handleTypingStop)

    // Add new listeners
    socket.on('new_message', handleNewMessage)
    socket.on('typing_start', handleTypingStart)
    socket.on('typing_stop', handleTypingStop)

    // Add a test listener to verify socket is working
    const testHandler = (data: any) => {
      console.log('🔥 ChatProvider: Test event received:', data)
    }
    socket.on('test_event', testHandler)

    console.log('🔥 ChatProvider: Socket event listeners registered')

    // Test the socket connection by emitting a test event
    setTimeout(() => {
      if (socket.connected) {
        console.log('🔥 ChatProvider: Testing socket connection...')
        socket.emit('test_connection', { message: 'Hello from frontend' })
      }
    }, 1000)

    return () => {
      console.log('🔥 ChatProvider: Cleaning up socket event listeners')
      socket.off('new_message', handleNewMessage)
      socket.off('typing_start', handleTypingStart)
      socket.off('typing_stop', handleTypingStop)
      socket.off('test_event', testHandler)
    }
  }, [socket, isConnected]) // Added isConnected to dependencies to re-register when connection state changes

  // Check for existing chat on mount
  useEffect(() => {
    if (user && isAuthenticated && !state.currentChat) {
      checkForExistingChat().then(chatId => {
        if (chatId) {
          loadChat(chatId)
          
          // Auto-open if was open before refresh
          const wasOpen = localStorage.getItem('chat-widget-open') === 'true'
          if (wasOpen) {
            openChat()
          }
        }
      }).catch(error => {
        console.error('🔥 ChatProvider: Error checking for existing chat:', error)
        // Don't throw the error, just log it and continue
      })
    }
  }, [user, isAuthenticated, state.currentChat, checkForExistingChat, loadChat, openChat])

  // Ensure socket is connected when user is authenticated
  useEffect(() => {
    if (user && isAuthenticated && socket && !isConnected) {
      console.log('🔥 ChatProvider: User authenticated but socket not connected, attempting to connect')
      // The socket context should handle reconnection automatically
    }
  }, [user, isAuthenticated, socket, isConnected])

  // Update connection state
  useEffect(() => {
    dispatch({ 
      type: 'SET_CONNECTION_STATE', 
      payload: { isConnected, isReconnecting: false } 
    })
  }, [isConnected])

  // Cleanup on unmount or when leaving contact page
  useEffect(() => {
    return () => {
      console.log('🔥 ChatProvider: Cleaning up on unmount')
      // Leave current chat if connected
      if (socket && state.currentChat) {
        console.log('🔥 ChatProvider: Leaving chat on cleanup:', state.currentChat)
        socket.emit('leave_chat', state.currentChat)
      }
    }
  }, [socket, state.currentChat])

  // Handle page visibility changes (when user leaves/returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🔥 ChatProvider: Page hidden, leaving chat if connected')
        if (socket && state.currentChat) {
          socket.emit('leave_chat', state.currentChat)
        }
      } else {
        console.log('🔥 ChatProvider: Page visible, rejoining chat if connected')
        if (socket && state.currentChat) {
          socket.emit('join_chat', state.currentChat)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [socket, state.currentChat])

  const value: ChatContextType = {
    state,
    dispatch,
    openChat,
    closeChat,
    toggleMinimize,
    sendMessage,
    loadChat,
    createNewChat,
    markAsRead,
    startTyping,
    stopTyping,
    updateMessageStatus,
    getUnreadCount,
    isTyping
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

// Hook to use chat context
export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
