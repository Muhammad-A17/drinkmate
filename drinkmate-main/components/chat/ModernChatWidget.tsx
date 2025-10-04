'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Paperclip, 
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
  Archive,
  Settings
} from 'lucide-react'
import { useChat } from '@/lib/contexts/chat-context'
import { useAuth } from '@/lib/contexts/auth-context'
import { useChatStatus } from '@/lib/contexts/chat-status-context'
import { simpleETAService, SimpleETA } from '@/lib/services/simple-eta-service'
import { Message } from '@/types/chat'
import VirtualizedMessageList from './VirtualizedMessageList'

const ModernChatWidget: React.FC = () => {
  const { state, dispatch, openChat, closeChat, toggleMinimize, sendMessage, createNewChat, markAsRead, startTyping, stopTyping } = useChat()
  const { user, isAuthenticated } = useAuth()
  const { chatStatus } = useChatStatus()
  
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [responseETA, setResponseETA] = useState<SimpleETA | null>(null)
  const [etaLoading, setEtaLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const setError = (error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [state.messages, scrollToBottom])

  // Fetch response ETA
  const fetchResponseETA = useCallback(async () => {
    if (!state.isOpen || etaLoading) return
    
    try {
      setEtaLoading(true)
      const eta = simpleETAService.getResponseETA()
      setResponseETA(eta)
    } catch (error) {
      console.error('Error fetching response ETA:', error)
    } finally {
      setEtaLoading(false)
    }
  }, [state.isOpen, etaLoading])

  useEffect(() => {
    if (state.isOpen) {
      fetchResponseETA()
    }
  }, [state.isOpen, fetchResponseETA])

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return

    const messageContent = newMessage.trim()
    setNewMessage('')

    // If no current chat, create one
    if (!state.currentChat) {
      await createNewChat()
      // Send message after chat is created
      await sendMessage(messageContent)
    } else {
      await sendMessage(messageContent)
    }

    // Mark as read
    markAsRead()
  }, [newMessage, state.currentChat, createNewChat, sendMessage, markAsRead])

  // Handle typing
  const handleTyping = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (!isTyping) {
      setIsTyping(true)
      startTyping()
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      stopTyping()
    }, 1000)
  }, [isTyping, startTyping, stopTyping])

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

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

    if (!state.isOpen) {
      openChat()
    } else {
      closeChat()
    }
  }, [user, isAuthenticated, chatStatus, state.isOpen, openChat, closeChat])

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

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  // Get message status icon
  const getMessageStatusIcon = (message: Message) => {
    switch (message.status) {
      case 'sending':
        return <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
      case 'sent':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />
      case 'delivered':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'read':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'failed':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      default:
        return null
    }
  }

  // Listen for custom event to open chat widget
  useEffect(() => {
    const handleOpenChatWidget = () => {
      if (!state.isOpen) {
        handleToggleChat()
      }
    }

    window.addEventListener('openChatWidget', handleOpenChatWidget)
    
    return () => {
      window.removeEventListener('openChatWidget', handleOpenChatWidget)
    }
  }, [state.isOpen, handleToggleChat])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Don't render if user is not authenticated or chat is offline
  if (!user || !isAuthenticated || !isChatOnline()) {
    return null
  }

  return (
    <>
      {/* Chat Launcher */}
      {!state.isOpen && (
        <button
          onClick={handleToggleChat}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#04C4DB] to-[#03a9c4] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 group"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          {state.unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {state.unreadCount > 9 ? '9+' : state.unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Widget */}
      {state.isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 transition-all duration-300 ${
          state.isMinimized ? 'h-16' : ''
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#04C4DB] to-[#03a9c4] text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Live Chat</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${state.isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-xs opacity-90">
                    {state.isConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleMinimize}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label={state.isMinimized ? 'Maximize' : 'Minimize'}
              >
                {state.isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={closeChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ETA Display */}
          {!state.isMinimized && responseETA && (
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    responseETA.isOnline ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">
                    {responseETA.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {etaLoading ? (
                      <span className="text-xs text-gray-500">Calculating...</span>
                    ) : (
                      responseETA.estimatedResponseTime
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
            </div>
          )}

          {!state.isMinimized && (
            <>
              {/* Virtualized Messages */}
              <div className="flex-1 bg-gray-50">
                {state.messages && state.messages.length > 0 ? (
                  <VirtualizedMessageList
                    messages={state.messages}
                    onMessageAction={(action, message) => {
                      console.log('Message action:', action, message)
                    }}
                    height={300}
                    itemHeight={80}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                      <p className="text-sm text-gray-500">Send a message to get started with our support team</p>
                    </div>
                  </div>
                )}
                
                {/* Typing indicator */}
                {state.typingUsers.length > 0 && (
                  <div className="absolute bottom-20 left-4 right-4">
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 shadow-sm border border-gray-200 px-4 py-3 rounded-2xl">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs text-gray-500 ml-2">
                            {state.typingUsers.join(', ')} typing...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#04C4DB] focus:border-transparent text-sm resize-none"
                      disabled={state.isLoading}
                    />
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Smile className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || state.isLoading}
                    className="p-3 bg-gradient-to-r from-[#04C4DB] to-[#03a9c4] text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                
                {state.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-xs">{state.error}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default ModernChatWidget
