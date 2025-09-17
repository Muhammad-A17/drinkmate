'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, MessageSquare, Star, X, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'
import CustomerChatRating from './CustomerChatRating'

interface Message {
  id: string
  content: string
  sender: 'customer' | 'agent' | 'system'
  timestamp: string
  isNote?: boolean
}

interface CustomerChatInterfaceProps {
  chatId: string
  customerName: string
  customerEmail: string
  onChatClosed?: () => void
}

export default function CustomerChatInterface({ 
  chatId, 
  customerName, 
  customerEmail, 
  onChatClosed 
}: CustomerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showRating, setShowRating] = useState(false)
  const [chatStatus, setChatStatus] = useState<'active' | 'closed' | 'waiting' | 'resolved'>('active')
  const [agentName, setAgentName] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch chat messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3000/chat/${chatId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.data.messages || [])
        setChatStatus(data.data.status)
        setAgentName(data.data.assignedTo?.name || null)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [chatId])

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || chatStatus !== 'active') return

    const messageData = {
      content: newMessage.trim(),
      messageType: 'text'
    }

    try {
      const response = await fetch(`http://localhost:3000/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.data.message])
        setNewMessage('')
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  // Handle rating submission
  const handleRated = (rating: { score: number; feedback: string }) => {
    setChatStatus('closed')
    setShowRating(false)
    onChatClosed?.()
    toast.success('Chat closed. Thank you for your feedback!')
  }

  // Handle close chat
  const handleCloseChat = () => {
    setShowRating(true)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showRating) {
    return (
      <CustomerChatRating
        chatId={chatId}
        onRated={handleRated}
        onClose={() => setShowRating(false)}
      />
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-96 flex flex-col">
      {/* Header */}
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Chat Support</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Chat #{chatId.slice(-6)}</span>
                <Badge className={getStatusColor(chatStatus)}>
                  {chatStatus.charAt(0).toUpperCase() + chatStatus.slice(1)}
                </Badge>
                {agentName && (
                  <span>• Assigned to {agentName}</span>
                )}
              </div>
            </div>
          </div>
          {chatStatus === 'active' && (
            <Button
              onClick={handleCloseChat}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              End Chat
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
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
                    ? 'bg-blue-600 text-white'
                    : message.sender === 'system'
                    ? 'bg-gray-100 text-gray-700 text-center'
                    : 'bg-gray-200 text-gray-900'
                } ${message.isNote && 'bg-yellow-100 text-yellow-900 border border-yellow-300'}`}
              >
                <div className="text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.sender === 'customer' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                  {message.isNote && ' • Internal Note'}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      {chatStatus === 'active' && (
        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              disabled={chatStatus !== 'active'}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || chatStatus !== 'active'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      )}

      {chatStatus === 'closed' && (
        <div className="flex-shrink-0 p-4 border-t bg-gray-50 text-center">
          <p className="text-gray-600 text-sm">
            This chat has been closed. Thank you for contacting us!
          </p>
        </div>
      )}
    </Card>
  )
}
