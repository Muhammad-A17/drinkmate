'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'
import { ChatToggleButtonProps } from '@/types/chat-widget'

const ChatToggleButton: React.FC<ChatToggleButtonProps> = React.memo(({
  onClick,
  isOpen,
  hasUnreadMessages = false
}) => {
  if (isOpen) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-[#04C4DB] text-white p-4 rounded-full shadow-lg hover:bg-[#03a9c4] transition-colors z-50"
      title="Open chat"
      aria-label="Open chat"
    >
      <MessageCircle className="h-6 w-6" />
      {hasUnreadMessages && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          !
        </div>
      )}
    </button>
  )
})

ChatToggleButton.displayName = 'ChatToggleButton'

export default ChatToggleButton
