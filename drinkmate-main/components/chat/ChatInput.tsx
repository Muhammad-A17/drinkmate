'use client'

import React from 'react'
import { Send } from 'lucide-react'
import { ChatInputProps } from '@/types/chat-widget'

const ChatInput: React.FC<ChatInputProps> = React.memo(({
  newMessage,
  setNewMessage,
  onSendMessage,
  isCreatingSession,
  disabled = false
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <div className="p-4 bg-white border-t">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04C4DB] focus:border-transparent"
          disabled={disabled || isCreatingSession}
        />
        <button
          onClick={onSendMessage}
          disabled={!newMessage.trim() || isCreatingSession || disabled}
          className="p-2 bg-[#04C4DB] text-white rounded-full hover:bg-[#03a9c4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Send message"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

ChatInput.displayName = 'ChatInput'

export default ChatInput
