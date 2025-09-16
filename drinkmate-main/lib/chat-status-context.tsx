"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { chatSettingsService, type ChatStatus } from './chat-settings-service'

interface ChatStatusContextType {
  chatStatus: ChatStatus
  isLoading: boolean
  error: string | null
  refreshStatus: () => Promise<void>
}

const ChatStatusContext = createContext<ChatStatusContextType | undefined>(undefined)

export function ChatStatusProvider({ children }: { children: ReactNode }) {
  const [chatStatus, setChatStatus] = useState<ChatStatus>({
    isOnline: false,
    isEnabled: false,
    workingHours: { start: '09:00', end: '17:00' },
    timezone: 'Asia/Riyadh'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadChatStatus = async () => {
    try {
      setError(null)
      const status = await chatSettingsService.getChatStatus()
      setChatStatus(status)
    } catch (err) {
      console.error('Failed to load chat status:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chat status')
    }
  }

  const refreshStatus = async () => {
    setIsLoading(true)
    await loadChatStatus()
    setIsLoading(false)
  }

  useEffect(() => {
    // Load initial status
    loadChatStatus()
    
    // Set up polling - increased to 2 minutes to reduce rate limiting
    const interval = setInterval(loadChatStatus, 120000) // Poll every 2 minutes
    
    return () => clearInterval(interval)
  }, [])

  return (
    <ChatStatusContext.Provider value={{ 
      chatStatus, 
      isLoading, 
      error, 
      refreshStatus 
    }}>
      {children}
    </ChatStatusContext.Provider>
  )
}

export function useChatStatus() {
  const context = useContext(ChatStatusContext)
  if (context === undefined) {
    throw new Error('useChatStatus must be used within a ChatStatusProvider')
  }
  return context
}
