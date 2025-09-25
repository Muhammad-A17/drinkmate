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
      console.log('No user or token, disconnecting socket')
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Initialize socket connection
    console.log('Initializing socket connection with token:', token ? 'present' : 'missing')
    if (isConnectingRef.current) {
      console.log('🔥 Socket connection already in progress, skipping')
      return
    }

    // Skip health check to avoid rate limiting issues
    console.log('🔥 Proceeding with socket connection (health check disabled to avoid rate limiting)')

    console.log('🔥 Starting socket connection...')
    isConnectingRef.current = true

    // Clean up any existing socket connection first
    if (socketRef.current) {
      console.log('🔥 Cleaning up existing socket connection')
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
    
    console.log('Socket created:', newSocket, 'Type:', typeof newSocket, 'Has on method:', typeof newSocket.on === 'function')

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message || error)
      setIsConnected(false)
      isConnectingRef.current = false
      
      // Retry connection after a delay, but limit retries
      const retryCount = (newSocket as any).retryCount || 0
      if (retryCount < 3) {
        (newSocket as any).retryCount = retryCount + 1
        setTimeout(() => {
          if (!isConnected && !isConnectingRef.current) {
            console.log(`🔥 Retrying socket connection (attempt ${retryCount + 1}/3)...`)
            connectSocket()
          }
        }, 5000 * (retryCount + 1)) // Exponential backoff
      } else {
        console.log('🔥 Max retry attempts reached, giving up on socket connection')
      }
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      setIsConnected(true)
    })

    newSocket.on('reconnect_error', (error) => {
      console.warn('Socket reconnection error:', error.message || error)
    })

    newSocket.on('reconnect_failed', () => {
      console.warn('Socket reconnection failed after maximum attempts')
      setIsConnected(false)
    })

    console.log('Setting socket in state:', newSocket)
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
