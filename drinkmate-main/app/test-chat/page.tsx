'use client'

import React, { useState } from 'react'
import { useChat } from '@/lib/chat-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, Users, Clock, CheckCircle } from 'lucide-react'

export default function TestChatPage() {
  const { state, openChat, closeChat, sendMessage, createNewChat } = useChat()
  const { user, isAuthenticated } = useAuth()
  const [testMessage, setTestMessage] = useState('')

  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) return
    
    if (!state.currentChat) {
      await createNewChat()
      setTimeout(() => {
        sendMessage(testMessage)
      }, 500)
    } else {
      await sendMessage(testMessage)
    }
    
    setTestMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat System Test</h1>
          <p className="text-gray-600">Test the new modern chat system implementation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Chat Status</span>
              </CardTitle>
              <CardDescription>Current chat system state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection Status:</span>
                <Badge variant={state.isConnected ? 'default' : 'destructive'}>
                  {state.isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chat Open:</span>
                <Badge variant={state.isOpen ? 'default' : 'secondary'}>
                  {state.isOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Chat:</span>
                <span className="text-sm text-gray-600">
                  {state.currentChat ? state.currentChat._id.substring(0, 8) + '...' : 'None'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Messages Count:</span>
                <span className="text-sm text-gray-600">{state.messages.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unread Count:</span>
                <Badge variant={state.unreadCount > 0 ? 'destructive' : 'secondary'}>
                  {state.unreadCount}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Typing Users:</span>
                <span className="text-sm text-gray-600">{state.typingUsers.size}</span>
              </div>
            </CardContent>
          </Card>

          {/* User Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Status</span>
              </CardTitle>
              <CardDescription>Current user authentication state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Authenticated:</span>
                <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User Name:</span>
                <span className="text-sm text-gray-600">{user?.name || 'Not logged in'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User Email:</span>
                <span className="text-sm text-gray-600">{user?.email || 'Not available'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Is Admin:</span>
                <Badge variant={user?.isAdmin ? 'default' : 'secondary'}>
                  {user?.isAdmin ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Chat Controls Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Chat Controls</span>
              </CardTitle>
              <CardDescription>Test chat functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button 
                  onClick={openChat}
                  disabled={state.isOpen}
                  className="flex-1"
                >
                  Open Chat
                </Button>
                <Button 
                  onClick={closeChat}
                  disabled={!state.isOpen}
                  variant="outline"
                  className="flex-1"
                >
                  Close Chat
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Test Message:</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Type a test message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendTestMessage()
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendTestMessage}
                    disabled={!testMessage.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Messages</span>
              </CardTitle>
              <CardDescription>Latest messages in current chat</CardDescription>
            </CardHeader>
            <CardContent>
              {state.messages.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {state.messages.slice(-5).map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        message.sender === 'agent' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {message.sender === 'agent' ? 'A' : 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {message.sender === 'agent' ? 'Agent' : 'Customer'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {message.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          {message.status === 'read' && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
            <CardDescription>How to test the new chat system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. <strong>Authentication:</strong> Make sure you're logged in to test the chat functionality</p>
              <p>2. <strong>Open Chat:</strong> Click "Open Chat" to open the chat widget</p>
              <p>3. <strong>Send Messages:</strong> Type a test message and send it</p>
              <p>4. <strong>Check Status:</strong> Observe message status updates (sending → sent → delivered → read)</p>
              <p>5. <strong>Admin Panel:</strong> Go to /admin/chat-management to test the admin interface</p>
              <p>6. <strong>Real-time:</strong> Open multiple browser tabs to test real-time messaging</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
