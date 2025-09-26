'use client'

import React, { useEffect, useRef } from 'react'
import { ChatMessagesProps } from '@/types/chat-widget'

const ChatMessages: React.FC<ChatMessagesProps> = React.memo(({
  messages,
  isLoading,
  responseETA,
  etaLoading
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>Start a conversation with our support team!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'customer'
                  ? 'bg-[#04C4DB] text-white'
                  : 'bg-white text-gray-800 border'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'customer' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))
      )}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#04C4DB]"></div>
              <span className="text-sm">Support is typing...</span>
            </div>
          </div>
        </div>
      )}

      {responseETA && (
        <div className="flex justify-start">
          <div className="bg-blue-50 text-blue-800 border border-blue-200 px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse rounded-full h-2 w-2 bg-blue-500"></div>
              <span className="text-sm">
                {etaLoading ? 'Calculating response time...' : `Expected response: ${responseETA.estimatedResponseTime}`}
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
})

ChatMessages.displayName = 'ChatMessages'

export default ChatMessages
