'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useSocket } from '@/lib/contexts/socket-context'
import { useChatStatus } from '@/lib/contexts/chat-status-context'
import { responseETAService, ResponseETA } from '@/lib/services/response-eta-service'
import { Message, ChatSession } from '@/types/chat'
import { ChatWidgetReturn } from '@/types/chat-widget'

export const useChatWidget = (): ChatWidgetReturn => {
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

  // Fetch response ETA
  const fetchResponseETA = useCallback(async () => {
    if (!isOpen || etaLoading) return
    
    try {
      setEtaLoading(true)
      const eta = await responseETAService.getResponseETA()
      setResponseETA(eta)
    } catch (error) {
      // Silently fail for ETA
    } finally {
      setEtaLoading(false)
    }
  }, [isOpen, etaLoading])

  // Load existing chat session
  const loadExistingChat = useCallback(async () => {
    if (!user?._id || !isAuthenticated) return

    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch('/api/chat/customer', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const chats = data.data
          const activeChat = chats.find((chat: any) => 
            chat.status === 'active' && 
            chat.customer.userId === user._id && 
            !chat.isDeleted
          )

          if (activeChat) {
            setChatSession(activeChat)
            if (socket && isConnected) {
              joinChat(activeChat._id)
            }
          }
        }
      }
    } catch (error) {
      // Silently fail for existing chat
    }
  }, [user?._id, isAuthenticated, socket, isConnected, joinChat])

  // Create new chat session
  const createChatSession = useCallback(async () => {
    if (!user?._id || !isAuthenticated || isCreatingSession) return

    try {
      setIsCreatingSession(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch('/api/chat/customer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: user._id,
          message: 'Hello, I need help with my order.'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const newSession = data.data
          setChatSession(newSession)
          
          if (socket && isConnected) {
            joinChat(newSession._id)
          }
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create chat session')
      }
    } catch (error) {
      setError('Failed to create chat session')
    } finally {
      setIsCreatingSession(false)
    }
  }, [user?._id, isAuthenticated, isCreatingSession, socket, isConnected, joinChat])

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !chatSession || isCreatingSession) return

    try {
      setIsLoading(true)
      setError(null)

      const messageData = {
        chatId: chatSession._id,
        content: newMessage.trim(),
        sender: 'user' as const
      }

      if (socket && isConnected) {
        sendMessage(chatSession._id, newMessage.trim(), 'text')
      } else {
        // Fallback to API call
        const token = getAuthToken()
        if (!token) {
          setError('Authentication required')
          return
        }

        const response = await fetch('/api/chat/message', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          setError(errorData.message || 'Failed to send message')
          return
        }
      }

      setNewMessage('')
    } catch (error) {
      setError('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }, [newMessage, chatSession, isCreatingSession, socket, isConnected, sendMessage])

  // Toggle chat
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev)
    if (!isOpen) {
      fetchResponseETA()
    }
  }, [isOpen, fetchResponseETA])

  // Minimize chat
  const minimizeChat = useCallback(() => {
    setIsMinimized(prev => !prev)
  }, [])

  // Close chat
  const closeChat = useCallback(() => {
    setIsOpen(false)
    setIsMinimized(false)
    if (chatSession && socket && isConnected) {
      leaveChat(chatSession._id)
    }
  }, [chatSession, socket, isConnected, leaveChat])

  // Memoized handlers
  const handleSetNewMessage = useCallback((message: string) => {
    setNewMessage(message)
  }, [])

  // Effects
  useEffect(() => {
    if (isAuthenticated && user) {
      loadExistingChat()
    }
  }, [isAuthenticated, user, loadExistingChat])

  useEffect(() => {
    if (socket && isConnected && chatSession) {
      joinChat(chatSession._id)
    }
  }, [socket, isConnected, chatSession, joinChat])

  return {
    // State
    chatSession,
    isOpen,
    isMinimized,
    newMessage,
    isLoading,
    isCreatingSession,
    error,
    responseETA,
    etaLoading,
    messagesEndRef,
    
    // Chat status
    chatStatus,
    isConnected,
    
    // Actions
    setNewMessage: handleSetNewMessage,
    toggleChat,
    minimizeChat,
    closeChat,
    handleSendMessage,
    createChatSession,
    
    // Auth
    isAuthenticated,
    user
  }
}
