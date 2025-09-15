"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MoreVertical, 
  Send, 
  Phone, 
  Mail, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Reply,
  Archive,
  Ticket,
  Ban,
  Trash2,
  Shield,
  Bell,
  BellOff,
  Settings,
  Download,
  Tag,
  Star,
  Users,
  MessageCircle,
  Zap,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/translation-context'
import Link from 'next/link'
import { toast } from 'sonner'
import { 
  Conversation, 
  Customer, 
  Agent, 
  Message, 
  ChatStats, 
  ChatFilters,
  SLA 
} from '@/types/chat'
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
  formatMessagePreview,
  getConversationUrgency
} from '@/lib/chat-utils'

// Components
import ConversationList from '@/components/chat/ConversationList'
import ConversationView from '@/components/chat/ConversationView'
import CustomerPanel from '@/components/chat/CustomerPanel'
import ChatStatsCards from '@/components/chat/ChatStatsCards'
import MessageComposer from '@/components/chat/MessageComposer'
import NotificationsManager from '@/components/chat/NotificationsManager'
import GlobalSearch from '@/components/chat/GlobalSearch'
import SLATracker from '@/components/chat/SLATracker'
import AgentKPIs from '@/components/chat/AgentKPIs'
import ReportingDashboard from '@/components/chat/ReportingDashboard'
import { cn } from '@/lib/utils'

export default function ChatManagementPage() {
  const { user } = useAuth()
  const { isRTL } = useTranslation()
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState<ChatStats>({
    total: 0,
    active: 0,
    waiting: 0,
    closed: 0,
    resolved: 0,
    unassigned: 0,
    new: 0,
    onHold: 0
  })
  const [filters, setFilters] = useState<ChatFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignee: 'all',
    channel: 'all',
    search: '',
    tags: [],
    dateRange: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDoNotDisturb, setIsDoNotDisturb] = useState(false)
  const [viewMode, setViewMode] = useState<'compact' | 'cozy'>('cozy')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'chats' | 'reporting'>('chats')

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v))
          } else {
            queryParams.append(key, value)
          }
        }
      })

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`http://localhost:3000/chat?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      setConversations(data.data.chats || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch('http://localhost:3000/chat/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [])

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch('http://localhost:3000/agents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAgents(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching agents:', err)
    }
  }, [])

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations]

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(conv => conv.status === filters.status)
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter(conv => conv.priority === filters.priority)
    }
    if (filters.assignee !== 'all') {
      if (filters.assignee === 'unassigned') {
        filtered = filtered.filter(conv => !conv.assigneeId)
      } else {
        filtered = filtered.filter(conv => conv.assigneeId === filters.assignee)
      }
    }
    if (filters.channel !== 'all') {
      filtered = filtered.filter(conv => conv.channel === filters.channel)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(conv => 
        getCustomerDisplayName(conv.customer).toLowerCase().includes(searchLower) ||
        conv.customer.email?.toLowerCase().includes(searchLower) ||
        conv.customer.phone?.toLowerCase().includes(searchLower) ||
        conv.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Sort by urgency
    return filtered.sort((a, b) => getConversationUrgency(b) - getConversationUrgency(a))
  }, [conversations, filters])

  // Handle filter change
  const handleFilterChange = (key: keyof ChatFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleGlobalSearchFilterChange = (filters: any) => {
    setFilters(filters)
  }

  // Handle stats click (filter by status)
  const handleStatsClick = (status: string) => {
    handleFilterChange('status', status)
  }

  // Handle conversation select
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  // Handle message send
  const handleMessageSend = async (content: string, isNote: boolean = false) => {
    if (!selectedConversation) return

    try {
      const response = await fetch(`http://localhost:3000/chat/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : null}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          isNote,
          senderType: 'agent'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Refresh conversations to update last message
      fetchConversations()
      toast.success(isNote ? 'Note added' : 'Message sent')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Handle conversation update
  const handleConversationUpdate = async (conversationId: string, updates: Partial<Conversation>) => {
    try {
      const response = await fetch(`http://localhost:3000/chat/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : null}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update conversation')
      }

      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, ...updates } : conv
      ))

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, ...updates } : null)
      }

      toast.success('Conversation updated')
    } catch (err: any) {
      toast.error('Failed to update conversation')
    }
  }

  // Effects
  useEffect(() => {
    if (user?.isAdmin) {
      fetchConversations()
      fetchStats()
      fetchAgents()
    }
  }, [user, fetchConversations, fetchStats, fetchAgents])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  if (loading && conversations.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Activity className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Chat Management</h1>
            <p className="text-ink-600 mt-1">Manage customer conversations and support tickets</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationsManager
              isDoNotDisturb={isDoNotDisturb}
              onToggleDoNotDisturb={setIsDoNotDisturb}
            />
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/chat-settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-ink-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('chats')}
              className={cn(
                "py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'chats'
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-500 hover:text-ink-700 hover:border-ink-300"
              )}
            >
              <MessageSquare className="w-4 h-4 mr-2 inline" />
              Chat Management
            </button>
            <button
              onClick={() => setActiveTab('reporting')}
              className={cn(
                "py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'reporting'
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-500 hover:text-ink-700 hover:border-ink-300"
              )}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Reporting & Analytics
            </button>
          </nav>
        </div>

        {/* Stats Cards */}
        <ChatStatsCards 
          stats={stats} 
          onStatsClick={handleStatsClick}
          isRTL={isRTL}
        />

        {/* Global Search */}
        <div className="max-w-2xl">
          <GlobalSearch
            conversations={conversations}
            onConversationSelect={handleConversationSelect}
            onFilterChange={handleGlobalSearchFilterChange}
            isRTL={isRTL}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'chats' ? (
          /* Main Content - Three Pane Layout */
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-320px)]">
          {/* Left Panel - Conversations List */}
          <div className="col-span-4">
            <ConversationList
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onConversationSelect={handleConversationSelect}
              filters={filters}
              onFilterChange={handleFilterChange}
              agents={agents}
              loading={loading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              isRTL={isRTL}
            />
          </div>

          {/* Center Panel - Conversation View */}
          <div className="col-span-5">
            {selectedConversation ? (
              <ConversationView
                conversation={selectedConversation}
                onConversationUpdate={handleConversationUpdate}
                agents={agents}
                isRTL={isRTL}
              />
            ) : (
              <Card className="h-full flex items-center justify-center bg-white rounded-soft shadow-card">
                <div className="text-center space-y-6 p-8">
                  <MessageCircle className="w-16 h-16 text-ink-300 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-ink-900 mb-2">Select a conversation</h3>
                    <p className="text-ink-600">Choose a chat from the list to view messages</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('status', 'waiting_for_agent')}
                      className="border-ink-200 hover:border-brand hover:text-brand"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Open Waiting
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('assignee', 'unassigned')}
                      className="border-ink-200 hover:border-brand hover:text-brand"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Open Unassigned
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Panel - Customer Panel */}
          <div className="col-span-3">
            {selectedConversation ? (
              <CustomerPanel
                conversation={selectedConversation}
                onConversationUpdate={handleConversationUpdate}
                agents={agents}
                isRTL={isRTL}
              />
            ) : (
              <Card className="h-full flex items-center justify-center bg-white rounded-soft shadow-card">
                <div className="text-center space-y-6 p-8">
                  <User className="w-16 h-16 text-ink-300 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-ink-900 mb-2">Customer Details</h3>
                    <p className="text-ink-600">Select a conversation to view customer information</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
        ) : (
          /* Reporting Dashboard */
          <div className="space-y-6">
            <ReportingDashboard />
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
