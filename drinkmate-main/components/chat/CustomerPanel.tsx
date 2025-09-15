"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  Mail, 
  Phone, 
  Clock, 
  Tag, 
  Star, 
  ShoppingBag, 
  FileText, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  X,
  Edit,
  Save
} from 'lucide-react'
import { Conversation, Agent } from '@/types/chat'
import { 
  getCustomerDisplayName, 
  getCustomerInitials, 
  getAgentDisplayName, 
  getAgentInitials,
  formatRelativeTime, 
  formatAbsoluteTime
} from '@/lib/chat-utils'
import { cn } from '@/lib/utils'

interface CustomerPanelProps {
  conversation: Conversation
  onConversationUpdate: (conversationId: string, updates: Partial<Conversation>) => void
  agents: Agent[]
  isRTL?: boolean
}

interface CustomerOrder {
  id: string
  orderNumber: string
  status: string
  total: number
  date: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

export default function CustomerPanel({
  conversation,
  onConversationUpdate,
  agents,
  isRTL = false
}: CustomerPanelProps) {
  const [customerNotes, setCustomerNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Mock customer orders - in real app, fetch from API
  useEffect(() => {
    setLoadingOrders(true)
    // Simulate API call
    setTimeout(() => {
      setCustomerOrders([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          status: 'delivered',
          total: 299.99,
          date: '2024-01-15',
          items: [
            { name: 'DrinkMate Soda Maker', quantity: 1, price: 299.99 }
          ]
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          status: 'processing',
          total: 49.99,
          date: '2024-01-20',
          items: [
            { name: 'Flavor Pack', quantity: 2, price: 49.99 }
          ]
        }
      ])
      setLoadingOrders(false)
    }, 1000)
  }, [conversation.customerId])

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !conversation.tags.includes(tag.trim())) {
      onConversationUpdate(conversation.id, {
        tags: [...conversation.tags, tag.trim()]
      })
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onConversationUpdate(conversation.id, {
      tags: conversation.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleSaveNotes = () => {
    // In real app, save to backend
    setIsEditingNotes(false)
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'processing':
        return <Clock className="w-4 h-4" />
      case 'shipped':
        return <AlertCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Customer Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
              {getCustomerInitials(conversation.customer)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {getCustomerDisplayName(conversation.customer)}
              </h3>
              <p className="text-sm text-gray-600">
                Customer since {new Date(conversation.createdAt).getFullYear()}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            {conversation.customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{conversation.customer.email}</span>
              </div>
            )}
            {conversation.customer.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{conversation.customer.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Last seen {formatRelativeTime(conversation.customer.lastSeenAt || conversation.lastMessageAt)}
              </span>
            </div>
          </div>

          {/* Customer Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tags</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const tag = prompt('Add a tag:')
                  if (tag) handleAddTag(tag)
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {conversation.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              ))}
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="text-center py-4">
              <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customerOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{order.orderNumber}</span>
                    <Badge className={cn("text-xs", getOrderStatusColor(order.status))}>
                      <div className="flex items-center gap-1">
                        {getOrderStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Total: ${order.total}</div>
                    <div>Date: {new Date(order.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Customer Notes
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingNotes(!isEditingNotes)}
              className="ml-auto"
            >
              {isEditingNotes ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Add notes about this customer..."
                rows={4}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveNotes}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingNotes(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              {customerNotes || 'No notes added yet'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Phone className="w-4 h-4 mr-2" />
            Call Customer
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <ShoppingBag className="w-4 h-4 mr-2" />
            View All Orders
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
            <XCircle className="w-4 h-4 mr-2" />
            Block Customer
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

