'use client'

import React, { Suspense, lazy, useState, useEffect } from 'react'
import { Loader2, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import useLazyLoading from '@/hooks/use-lazy-loading'

// Lazy load the chat widget components
const ModernChatWidget = lazy(() => import('./ModernChatWidget'))
const ModernAdminChatWidget = lazy(() => import('./ModernAdminChatWidget'))

interface LazyChatWidgetProps {
  isAdmin?: boolean
  selectedConversation?: any
  onMessageSent?: (message: any) => void
  onConversationUpdate?: (conversation: any) => void
  height?: number
}

const LazyChatWidget: React.FC<LazyChatWidgetProps> = ({
  isAdmin = false,
  selectedConversation,
  onMessageSent,
  onConversationUpdate,
  height = 400
}) => {
  const [shouldLoad, setShouldLoad] = useState(false)
  const { isVisible, ref, hasBeenVisible } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '100px'
  })

  // Load the widget when it becomes visible
  useEffect(() => {
    if (isVisible && !hasBeenVisible) {
      setShouldLoad(true)
    }
  }, [isVisible, hasBeenVisible])

  // Preload the widget after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true)
    }, 1000) // Preload after 1 second

    return () => clearTimeout(timer)
  }, [])

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <Card className="w-96 text-center">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <MessageCircle className="h-16 w-16 text-gray-300" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-600">
                {isAdmin ? 'Loading Admin Chat' : 'Loading Chat Widget'}
              </h3>
              <p className="text-sm text-gray-500">
                Preparing your chat experience...
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const ErrorFallback = () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <Card className="w-96 text-center">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <MessageCircle className="h-16 w-16 text-red-300" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-600">
                Chat Unavailable
              </h3>
              <p className="text-sm text-gray-500">
                Unable to load the chat widget. Please refresh the page.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (!shouldLoad) {
    return (
      <div ref={ref as React.RefObject<HTMLDivElement>} style={{ height: `${height}px` }}>
        <LoadingFallback />
      </div>
    )
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Suspense fallback={<LoadingFallback />}>
        {isAdmin ? (
          <ModernAdminChatWidget
            selectedConversation={selectedConversation}
            onMessageSent={onMessageSent}
            onConversationUpdate={onConversationUpdate}
          />
        ) : (
          <ModernChatWidget />
        )}
      </Suspense>
    </div>
  )
}

export default LazyChatWidget
