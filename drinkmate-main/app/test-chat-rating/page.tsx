'use client'

import React, { useState } from 'react'
import SimpleChatWidget from '@/components/chat/SimpleChatWidget'
import CustomerChatRating from '@/components/chat/CustomerChatRating'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Star } from 'lucide-react'

export default function TestChatRatingPage() {
  const [showChat, setShowChat] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [chatId] = useState('test-chat-' + Date.now())

  const handleStartChat = () => {
    setShowChat(true)
  }

  const handleChatClosed = () => {
    setShowChat(false)
    setShowRating(true)
  }

  const handleRatingComplete = () => {
    setShowRating(false)
  }

  if (showRating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <CustomerChatRating
          chatId={chatId}
          onRated={handleRatingComplete}
          onClose={handleRatingComplete}
        />
      </div>
    )
  }

  if (showChat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Test Chat</h3>
          <SimpleChatWidget />
          <Button 
            onClick={handleChatClosed}
            variant="outline" 
            className="mt-4 w-full"
          >
            Close Chat
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Test Chat Rating</CardTitle>
          <p className="text-gray-600">
            Test the customer chat interface and rating functionality
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Features to test:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Customer chat interface</li>
              <li>• Message sending and receiving</li>
              <li>• Chat closing and rating</li>
              <li>• Star rating system</li>
              <li>• Feedback submission</li>
            </ul>
          </div>
          
          <Button
            onClick={handleStartChat}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Start Test Chat
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            Chat ID: {chatId}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
