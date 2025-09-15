export interface Customer {
  id: string
  firstName?: string
  lastName?: string
  displayName?: string
  email?: string
  phone?: string
  tags: string[]
  locale?: string
  timeZone?: string
  lastSeenAt?: string
  crmId?: string
  avatar?: string
  isBlocked?: boolean
  blockReason?: string
  blockExpiry?: string
}

export interface Agent {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'supervisor' | 'agent' | 'viewer'
  isOnline: boolean
  maxConcurrentChats: number
  currentChats: number
}

export interface Conversation {
  id: string
  customerId: string
  customer: Customer
  channel: 'site' | 'whatsapp' | 'email' | 'phone'
  status: 'new' | 'waiting_for_agent' | 'waiting_for_customer' | 'on_hold' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId?: string
  assignee?: Agent
  createdAt: string
  updatedAt: string
  lastMessageAt: string
  tags: string[]
  firstResponseAt?: string
  resolvedAt?: string
  closedBy?: string
  snoozeUntil?: string
  transcriptUrl?: string
  unreadCount: number
  isNote?: boolean
  category?: string
  orderNumber?: string
  customerIP?: string
  ticketId?: string
}

export interface Message {
  id: string
  conversationId: string
  senderType: 'agent' | 'customer' | 'system'
  senderId: string
  senderName?: string
  body: string
  html?: string
  attachments: Attachment[]
  isNote: boolean
  createdAt: string
  deliveredAt?: string
  readAt?: string
  editedAt?: string
  mentions?: string[]
  replyTo?: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: 'image' | 'file' | 'audio' | 'video'
  size: number
  mimeType: string
}

export interface ChatStats {
  total: number
  active: number
  waiting: number
  closed: number
  resolved: number
  unassigned: number
  new: number
  onHold: number
}

export interface SLA {
  firstResponse: {
    target: number // minutes
    actual?: number
    status: 'on_time' | 'at_risk' | 'breached'
  }
  resolution: {
    target: number // minutes
    actual?: number
    status: 'on_time' | 'at_risk' | 'breached'
  }
}

export interface CannedResponse {
  id: string
  name: string
  content: string
  category: string
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface ChatFilters {
  status: string
  priority: string
  category: string
  assignee: string
  channel: string
  search: string
  tags: string[]
  dateRange: {
    from?: string
    to?: string
  }
}

export interface AgentKPIs {
  agentId: string
  agentName: string
  avgFirstReply: number // minutes
  avgHandleTime: number // minutes
  avgResolutionTime: number // minutes
  csat: number // 1-5
  totalChats: number
  resolvedChats: number
  activeChats: number
  responseRate: number // percentage
  resolutionRate: number // percentage
}

