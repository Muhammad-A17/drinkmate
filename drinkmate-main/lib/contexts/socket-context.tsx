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
  healthCheck: () => Promise<any>
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

    // Reset connection state
    setIsConnected(false)

    // Determine the correct socket URL based on environment
    let socketUrl;
    if (process.env.NEXT_PUBLIC_API_URL) {
      socketUrl = process.env.NEXT_PUBLIC_API_URL;
    } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      // For local development, use the local server
      socketUrl = 'http://localhost:3000';
    } else {
      // For production, use the production server
      socketUrl = 'https://drinkmates.onrender.com';
    }
    
    console.log('🔥 Socket connecting to:', socketUrl)
    console.log('🔥 Socket auth token present:', !!token)
    console.log('🔥 Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side')
    console.log('🔥 Current port:', typeof window !== 'undefined' ? window.location.port : 'server-side')
    
    const newSocket = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 15, // Increased attempts
      forceNew: true,
      upgrade: true,
      rememberUpgrade: false,
      autoConnect: true,
      multiplex: false,
      closeOnBeforeunload: false
    })
    

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔥 Socket connected successfully! ID:', newSocket.id)
      console.log('🔥 Socket transport:', newSocket.io.engine.transport.name)
      console.log('🔥 Socket connected at:', new Date().toISOString())
      setIsConnected(true)
      isConnectingRef.current = false
    })

    newSocket.on('disconnect', (reason) => {
      console.log('🔥 Socket disconnected. Reason:', reason)
      setIsConnected(false)
      isConnectingRef.current = false
    })

    newSocket.on('connect_error', (error) => {
      console.error('🔥 Socket connection error:', error.message || error)
      console.error('🔥 Socket connection error details:', error)
      console.error('🔥 Socket connection URL:', socketUrl)
      console.error('🔥 Error type:', (error as any).type)
      console.error('🔥 Error description:', (error as any).description)
      setIsConnected(false)
      isConnectingRef.current = false
      
      // Don't retry automatically - let Socket.io handle reconnection
      console.log('🔥 Socket connection failed, Socket.io will handle reconnection automatically')
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔥 Socket reconnected after', attemptNumber, 'attempts')
      setIsConnected(true)
      isConnectingRef.current = false
    })

    newSocket.on('reconnect_error', (error) => {
      console.error('🔥 Socket reconnection error:', error)
      setIsConnected(false)
    })

    newSocket.on('reconnect_failed', () => {
      console.error('🔥 Socket reconnection failed after all attempts')
      setIsConnected(false)
      isConnectingRef.current = false
    })

    // Add debugging for socket events
    newSocket.on('new_message', (data) => {
      console.log('🔥 Socket received new_message event:', data)
    })

    newSocket.on('error', (error) => {
      console.error('🔥 Socket error event:', error)
    })

    setSocket(newSocket)
    socketRef.current = newSocket
  }, [token, user]) // Remove isConnected to prevent infinite loops

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
    if (user && token) {
      console.log('🔥 SocketProvider: User and token available, connecting socket')
      console.log('🔥 SocketProvider: User ID:', user._id)
      console.log('🔥 SocketProvider: Token length:', token.length)
      // Add a small delay to ensure the socket connection is established
      const timer = setTimeout(() => {
        connectSocket()
      }, 1000) // Increased delay to ensure everything is ready
      return () => clearTimeout(timer)
    } else {
      console.log('🔥 SocketProvider: No user or token, disconnecting socket')
      console.log('🔥 SocketProvider: User:', !!user, 'Token:', !!token)
      disconnectSocket()
      return undefined
    }
  }, [user, token]) // Removed connectSocket and disconnectSocket from dependencies to prevent loops

  const joinChat = (chatId: string) => {
    if (socket && isConnected) {
      console.log('🔥 SocketContext: Joining chat room:', chatId)
      console.log('🔥 SocketContext: Socket ID:', socket.id)
      console.log('🔥 SocketContext: Socket connected:', isConnected)
      socket.emit('join_chat', chatId)
    } else {
      console.log('🔥 SocketContext: Cannot join chat - socket:', !!socket, 'connected:', isConnected)
    }
  }

  const leaveChat = (chatId: string) => {
    if (socket) {
      socket.emit('leave_chat', chatId)
    }
  }

  const sendMessage = (chatId: string, content: string, type: string = 'text') => {
    if (socket && isConnected) {
      console.log('🔥 SocketContext: Sending message:', { chatId, content: content.substring(0, 50) + '...', type })
      console.log('🔥 SocketContext: Socket ID:', socket.id)
      console.log('🔥 SocketContext: Socket connected:', isConnected)
      socket.emit('send_message', { chatId, content, type })
    } else {
      console.log('🔥 SocketContext: Cannot send message - socket:', !!socket, 'connected:', isConnected)
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

  const healthCheck = useCallback((): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('Health check timeout'))
      }, 5000)

      socket.emit('health_check', (response: any) => {
        clearTimeout(timeout)
        resolve(response)
      })
    })
  }, [socket, isConnected])

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
    updateChatStatus,
    healthCheck
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
