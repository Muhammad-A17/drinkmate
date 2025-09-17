"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MoreVertical, 
  Clock, 
  User, 
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Tag,
  Star,
  Archive,
  Download,
  Ban,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  Zap
} from 'lucide-react'
import { Conversation, Agent, Message, SLA, Customer } from '@/types/chat'
import { 
  getCustomerDisplayName, 
  getCustomerInitials, 
  getAgentDisplayName, 
  getAgentInitials,
  formatRelativeTime, 
  formatAbsoluteTime,
  getStatusColor, 
  getPriorityColor, 
  getChannelIcon,
  isWithinBusinessHours,
  calculateSLAStatus
} from '@/lib/chat-utils'
import { cn } from '@/lib/utils'
import MessageComposer from './MessageComposer'
import SnoozeModal from './SnoozeModal'
import CustomerTagsModal from './CustomerTagsModal'
import ExportModal from './ExportModal'

interface ConversationViewProps {
  conversation: Conversation
  onConversationUpdate: (conversationId: string, updates: Partial<Conversation>) => void
  agents: Agent[]
  isRTL?: boolean
}

export default function ConversationView({
  conversation,
  onConversationUpdate,
  agents,
  isRTL = false
}: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [showSnoozeModal, setShowSnoozeModal] = useState(false)
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch messages for this conversation
  const fetchMessages = async () => {
    try {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`http://localhost:3000/chat/${conversation.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle message send
  const handleMessageSend = async (content: string, isNote: boolean = false) => {
    try {
      const response = await fetch(`http://localhost:3000/chat/${conversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : null}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          isNote,
          sender: 'agent'
        })
      })

      if (response.ok) {
        // Add message to local state
        const newMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: content,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          isNote: isNote,
          attachments: []
        }
        setMessages(prev => [...prev, newMessage])
      }
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  // Handle status change
  const handleStatusChange = (status: string) => {
    onConversationUpdate(conversation.id, { status: status as any })
  }

  // Handle priority change
  const handlePriorityChange = (priority: string) => {
    onConversationUpdate(conversation.id, { priority: priority as any })
  }

  // Handle assignment
  const handleAssignment = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    onConversationUpdate(conversation.id, { 
      assigneeId: agentId,
      assignee: agent
    })
  }

  // Handle snooze
  const handleSnooze = (snoozeData: any) => {
    onConversationUpdate(conversation.id, { 
      snoozeUntil: snoozeData.until,
      status: 'snoozed'
    })
  }

  // Handle customer update
  const handleCustomerUpdate = (customerId: string, updates: Partial<Customer>) => {
    onConversationUpdate(conversation.id, { 
      customer: { ...conversation.customer, ...updates }
    })
  }

  // Handle customer block
  const handleCustomerBlock = (customerId: string, blockData: any) => {
    onConversationUpdate(conversation.id, {
      customer: {
        ...conversation.customer,
        isBlocked: true,
        blockReason: blockData.reason,
        blockExpiry: blockData.duration === 'permanent' ? undefined : 
          new Date(Date.now() + (blockData.duration === '1day' ? 24 : 
            blockData.duration === '1week' ? 168 : 720) * 60 * 60 * 1000).toISOString()
      }
    })
  }

  // Handle export
  const handleExport = (exportData: any) => {
    // In real app, trigger export API call
    console.log('Exporting conversation:', exportData)
    // For now, just show a success message
    alert('Export started! You will receive an email when ready.')
  }

  // Calculate SLA
  const calculateSLA = (): SLA => {
    const now = new Date()
    const createdAt = new Date(conversation.createdAt)
    const firstResponseAt = conversation.firstResponseAt ? new Date(conversation.firstResponseAt) : null
    const resolvedAt = conversation.resolvedAt ? new Date(conversation.resolvedAt) : null

    const firstResponseMinutes = firstResponseAt 
      ? Math.floor((firstResponseAt.getTime() - createdAt.getTime()) / (1000 * 60))
      : Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60))

    const resolutionMinutes = resolvedAt
      ? Math.floor((resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60))
      : Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60))

    return {
      firstResponse: {
        target: 30, // 30 minutes
        actual: firstResponseMinutes,
        status: calculateSLAStatus(30, firstResponseMinutes)
      },
      resolution: {
        target: 240, // 4 hours
        actual: resolutionMinutes,
        status: calculateSLAStatus(240, resolutionMinutes)
      }
    }
  }

  const sla = calculateSLA()

  useEffect(() => {
    fetchMessages()
  }, [conversation.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
              {getCustomerInitials(conversation.customer)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {getCustomerDisplayName(conversation.customer)}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{getChannelIcon(conversation.channel)}</span>
                <span>{conversation.customer.email}</span>
                {conversation.customer.phone && (
                  <>
                    <span>•</span>
                    <span>{conversation.customer.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Status and Priority Controls */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <Select value={conversation.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="waiting_for_agent">Waiting for Agent</SelectItem>
                <SelectItem value="waiting_for_customer">Waiting for Customer</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Priority:</span>
            <Select value={conversation.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Assign to:</span>
            <Select 
              value={conversation.assigneeId || 'unassigned'} 
              onValueChange={(value) => value !== 'unassigned' && handleAssignment(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {getAgentDisplayName(agent)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* SLA Indicators */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">First Response:</span>
            <Badge className={cn(
              "text-xs",
              sla.firstResponse.status === 'on_time' && "bg-green-100 text-green-800",
              sla.firstResponse.status === 'at_risk' && "bg-yellow-100 text-yellow-800",
              sla.firstResponse.status === 'breached' && "bg-red-100 text-red-800"
            )}>
              {sla.firstResponse.actual}m / {sla.firstResponse.target}m
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Resolution:</span>
            <Badge className={cn(
              "text-xs",
              sla.resolution.status === 'on_time' && "bg-green-100 text-green-800",
              sla.resolution.status === 'at_risk' && "bg-yellow-100 text-yellow-800",
              sla.resolution.status === 'breached' && "bg-red-100 text-red-800"
            )}>
              {sla.resolution.actual}m / {sla.resolution.target}m
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTagsModal(true)}
          >
            <Tag className="w-4 h-4 mr-1" />
            Tag
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSnoozeModal(true)}
          >
                <Clock className="w-4 h-4 mr-1" />
            Snooze
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Ban className="w-4 h-4 mr-1" />
            Block
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageSquare className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-600">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.sender === 'agent' ? "justify-end" : "justify-start"
                )}
              >
                {message.sender !== 'agent' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                    {getCustomerInitials(conversation.customer)}
                  </div>
                )}
                
                <div className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                  message.sender === 'agent' 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-100 text-gray-900",
                  message.isNote && "bg-yellow-50 border border-yellow-200"
                )}>
                  {message.isNote && (
                    <div className="flex items-center gap-1 mb-1">
                      <AlertCircle className="w-3 h-3 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-700">Internal Note</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    message.sender === 'agent' ? "text-blue-100" : "text-gray-500"
                  )}>
                    {formatRelativeTime(message.timestamp)}
                  </p>
                </div>

                {message.sender === 'agent' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {getAgentInitials(conversation.assignee || { id: 'current', name: 'You', email: 'you@example.com', isAdmin: true })}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* Message Composer */}
      <div className="border-t p-4">
        <MessageComposer
          onSendMessage={handleMessageSend}
          placeholder="Type your message..."
          isRTL={isRTL}
        />
      </div>

      {/* Modals */}
      <SnoozeModal
        isOpen={showSnoozeModal}
        onClose={() => setShowSnoozeModal(false)}
        onSnooze={handleSnooze}
        conversationId={conversation.id}
        customerName={getCustomerDisplayName(conversation.customer)}
      />

      <CustomerTagsModal
        isOpen={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        customer={conversation.customer}
        onUpdateCustomer={handleCustomerUpdate}
        onBlockCustomer={handleCustomerBlock}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        conversation={conversation}
        messages={messages}
        onExport={handleExport}
      />
    </Card>
  )
}
