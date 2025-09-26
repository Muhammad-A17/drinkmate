'use client'

import React from 'react'
import { useChatWidget } from '@/hooks/use-chat-widget'
import ChatToggleButton from './ChatToggleButton'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

const SimpleChatWidget: React.FC = () => {
  const {
    chatSession,
    isOpen,
    isMinimized,
    newMessage,
    isLoading,
    isCreatingSession,
    error,
    responseETA,
    etaLoading,
    messagesEndRef,
    chatStatus,
    isConnected,
    setNewMessage,
    toggleChat,
    minimizeChat,
    closeChat,
    handleSendMessage,
    createChatSession,
    isAuthenticated,
    user
  } = useChatWidget()

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  // Don't render if chat is disabled
  if (chatStatus && !chatStatus.isEnabled) {
    return null
  }

  return (
    <>
      <ChatToggleButton
        onClick={toggleChat}
        isOpen={isOpen}
        hasUnreadMessages={false}
      />

      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col ${
          isMinimized ? 'h-16' : ''
        }`}>
          <ChatHeader
            isOpen={isOpen}
            isMinimized={isMinimized}
            onToggle={toggleChat}
            onMinimize={minimizeChat}
            onClose={closeChat}
          />
          
          {!isMinimized && (
            <>
              {!chatSession ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Need Help?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start a conversation with our support team
                    </p>
                    <button
                      onClick={createChatSession}
                      disabled={isCreatingSession}
                      className="px-4 py-2 bg-[#04C4DB] text-white rounded-lg hover:bg-[#03a9c4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCreatingSession ? 'Starting...' : 'Start Chat'}
                    </button>
                    {error && (
                      <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <ChatMessages
                    messages={chatSession.messages || []}
                    isLoading={isLoading}
                    responseETA={responseETA}
                    etaLoading={etaLoading}
                  />
                  <ChatInput
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    onSendMessage={handleSendMessage}
                    isCreatingSession={isCreatingSession}
                    disabled={!isConnected}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}

export default SimpleChatWidget
