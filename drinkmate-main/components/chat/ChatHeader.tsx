'use client'

import React from 'react'
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react'
import { ChatHeaderProps } from '@/types/chat-widget'

const ChatHeader: React.FC<ChatHeaderProps> = React.memo(({
  isOpen,
  isMinimized,
  onToggle,
  onMinimize,
  onClose
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-[#04C4DB] text-white rounded-t-lg">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5" />
        <span className="font-semibold">Customer Support</span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onMinimize}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          title={isMinimized ? "Maximize" : "Minimize"}
          aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
        >
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </button>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          title="Close chat"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

ChatHeader.displayName = 'ChatHeader'

export default ChatHeader
