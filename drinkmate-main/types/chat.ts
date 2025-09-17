// Standardized chat types for all components

export interface Message {
  id: string
  content: string
  sender: 'customer' | 'agent'
  timestamp: string
  isNote?: boolean
  attachments?: any[]
  readAt?: string
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
}

export interface ChatSession {
  _id: string
  status: 'active' | 'waiting_customer' | 'waiting_agent' | 'snoozed' | 'closed' | 'converted'
  customer: {
    userId: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
  }
  messages: Message[]
  createdAt: string
  updatedAt: string
  lastMessageAt: Date
}

export interface Conversation {
  id: string
  customer: Customer
  channel: 'web' | 'whatsapp' | 'email'
  status: 'active' | 'waiting_customer' | 'waiting_agent' | 'snoozed' | 'closed' | 'converted'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId?: string
  assignee?: {
    id: string
    name: string
    avatar?: string
    email?: string
    status?: 'online' | 'offline' | 'busy'
    lastSeen?: string
    isAdmin?: boolean
  }
  lastMessage: {
    content: string
    timestamp: string
    sender: 'customer' | 'agent'
  }
  sla: {
    firstResponse: number
    resolution: number
  }
  tags: string[]
  rating?: {
    score: number
    feedback?: string
    ratedAt: string
  }
  createdAt: string
  updatedAt: string
  messages: Message[]
  unreadCount?: number
  snoozeUntil?: string
  firstResponseAt?: string
  resolvedAt?: string
  orderNumber?: string
  commerce?: {
    latestOrder?: any
    subscription?: any
    co2Cylinders?: any[]
    addresses?: any[]
    openTickets?: any[]
  }
}

export interface ChatStatus {
  isOnline: boolean
  isEnabled: boolean
  workingHours: {
    start: string
    end: string
  }
  timezone: string
}

export interface ChatStats {
  total: number
  active: number
  waiting: number
  closed: number
  unassigned: number
  slaBreach: number
  avgResponseTime: number
  avgResolutionTime: number
  avgRating: number
}

export interface Agent {
  id: string
  name: string
  email?: string
  avatar?: string
  status?: 'online' | 'offline' | 'busy'
  lastSeen?: string
  isAdmin?: boolean
}

export interface ChatFilters {
  status?: string[]
  priority?: string[]
  channel?: string[]
  assignee?: string[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
}

export interface SLA {
  firstResponse: {
    target: number
    actual: number
    status: 'on_time' | 'at_risk' | 'breached'
  }
  resolution: {
    target: number
    actual: number
    status: 'on_time' | 'at_risk' | 'breached'
  }
}

export interface Customer {
  id: string
  name: string
  firstName?: string
  lastName?: string
  displayName?: string
  email: string
  phone?: string
  avatar?: string
  language: string
  timezone: string
  lastSeen: string
  isBlocked?: boolean
  blockReason?: string
  blockExpiry?: string
  tags?: string[]
}