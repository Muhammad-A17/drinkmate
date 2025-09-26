"use client"

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './auth-context'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectSocket: () => Promise<void>
  disconnectSocket: () => void
  joinChat: (chatId: string) => void
  leaveChat: (chatId: string) => void
  sendMessage: (chatId: string, content: string, type?: string) => void
  startTyping: (chatId: string) => void
  stopTyping: (chatId: string) => void
  assignChat: (chatId: string) => void
  updateChatStatus: (chatId: string, status: string, resolutionNotes?: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, token } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const isConnectingRef = useRef<boolean>(false)

  // Function to connect socket manually
  const connectSocket = useCallback(async () => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Initialize socket connection
    if (isConnectingRef.current) {
      return
    }

    // Skip health check to avoid rate limiting issues
    isConnectingRef.current = true

    // Clean up any existing socket connection first
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })
    

    // Connection event handlers
    newSocket.on('connect', () => {
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      setIsConnected(false)
      isConnectingRef.current = false
      
      // Retry connection after a delay, but limit retries
      const retryCount = (newSocket as any).retryCount || 0
      if (retryCount < 3) {
        (newSocket as any).retryCount = retryCount + 1
        setTimeout(() => {
          if (!isConnected && !isConnectingRef.current) {
            connectSocket()
          }
        }, 5000 * (retryCount + 1)) // Exponential backoff
      }
    })

    newSocket.on('reconnect', (attemptNumber) => {
      setIsConnected(true)
    })

    newSocket.on('reconnect_error', (error) => {
    })

    newSocket.on('reconnect_failed', () => {
      setIsConnected(false)
    })

    setSocket(newSocket)
    socketRef.current = newSocket
  }, [token, user, isConnected]) // Add isConnected to dependencies to prevent infinite loops

  // Function to disconnect socket
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      setSocket(null)
      setIsConnected(false)
      socketRef.current = null
    }
    isConnectingRef.current = false
  }, [])

  // Auto-disconnect when user logs out
  useEffect(() => {
    if (!user || !token) {
      disconnectSocket()
    }
  }, [user, token, disconnectSocket])

  // Call connectSocket when user or token changes
  useEffect(() => {
    connectSocket()
  }, [connectSocket])

  const joinChat = (chatId: string) => {
    if (socket) {
      socket.emit('join_chat', chatId)
    }
  }

  const leaveChat = (chatId: string) => {
    if (socket) {
      socket.emit('leave_chat', chatId)
    }
  }

  const sendMessage = (chatId: string, content: string, type: string = 'text') => {
    if (socket) {
      socket.emit('send_message', { chatId, content, type })
    }
  }

  const startTyping = (chatId: string) => {
    if (socket) {
      socket.emit('typing_start', { chatId })
    }
  }

  const stopTyping = (chatId: string) => {
    if (socket) {
      socket.emit('typing_stop', { chatId })
    }
  }

  const assignChat = (chatId: string) => {
    if (socket) {
      socket.emit('assign_chat', { chatId })
    }
  }

  const updateChatStatus = (chatId: string, status: string, resolutionNotes?: string) => {
    if (socket) {
      socket.emit('update_chat_status', { chatId, status, resolutionNotes })
    }
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    connectSocket,
    disconnectSocket,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    assignChat,
    updateChatStatus
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
