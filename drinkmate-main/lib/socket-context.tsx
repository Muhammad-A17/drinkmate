"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './auth-context'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
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

  useEffect(() => {
    console.log('Socket context effect running:', { user, token, hasUser: !!user, hasToken: !!token })
    
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
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
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
      console.error('Socket connection error:', error)
      console.error('Token being used:', token)
      setIsConnected(false)
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      setIsConnected(true)
    })

    newSocket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error)
    })

    newSocket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after maximum attempts')
      setIsConnected(false)
    })

    console.log('Setting socket in state:', newSocket)
    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection')
      newSocket.disconnect()
    }
  }, [user, token])

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
      socket.emit('chat:message:send', { chatId, content, type })
    }
  }

  const startTyping = (chatId: string) => {
    if (socket) {
      socket.emit('chat:typing:start', { chatId })
    }
  }

  const stopTyping = (chatId: string) => {
    if (socket) {
      socket.emit('chat:typing:stop', { chatId })
    }
  }

  const assignChat = (chatId: string) => {
    if (socket) {
      socket.emit('chat:assign', { chatId })
    }
  }

  const updateChatStatus = (chatId: string, status: string, resolutionNotes?: string) => {
    if (socket) {
      socket.emit('chat:status:update', { chatId, status, resolutionNotes })
    }
  }

  const value: SocketContextType = {
    socket,
    isConnected,
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
