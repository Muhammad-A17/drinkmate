import { Customer, Conversation, Message, Agent } from '@/types/chat'

/**
 * Get display name for customer with proper fallbacks
 */
export function getCustomerDisplayName(customer: Customer): string {
  if (customer.displayName) {
    return customer.displayName
  }
  
  const fullName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  
  if (fullName) {
    return fullName
  }
  
  if (customer.phone) {
    return customer.phone
  }
  
  if (customer.email) {
    return customer.email
  }
  
  return 'Guest'
}

/**
 * Get customer initials for avatar
 */
export function getCustomerInitials(customer: Customer): string {
  const name = getCustomerDisplayName(customer)
  
  if (name === 'Guest') {
    return 'G'
  }
  
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  
  return name.substring(0, 2).toUpperCase()
}

/**
 * Get agent display name
 */
export function getAgentDisplayName(agent: Agent): string {
  return agent.name || agent.email || 'Unknown Agent'
}

/**
 * Get agent initials for avatar
 */
export function getAgentInitials(agent: Agent): string {
  const name = getAgentDisplayName(agent)
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

/**
 * Format relative time (e.g., "2m ago", "1h ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths}mo ago`
}

/**
 * Format absolute time for tooltips
 */
export function formatAbsoluteTime(timestamp: string, timeZone?: string): string {
  const time = new Date(timestamp)
  return time.toLocaleString('en-US', {
    timeZone: timeZone || 'Asia/Riyadh',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Get status color classes
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'waiting_for_agent':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'waiting_for_customer':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'on_hold':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get priority color classes
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get channel icon
 */
export function getChannelIcon(channel: string): string {
  switch (channel) {
    case 'whatsapp':
      return '📱'
    case 'email':
      return '📧'
    case 'phone':
      return '📞'
    case 'site':
    default:
      return '💬'
  }
}

/**
 * Check if conversation is within business hours (9 AM - 5 PM)
 */
export function isWithinBusinessHours(timeZone?: string): boolean {
  const now = new Date()
  const timeInZone = new Date(now.toLocaleString('en-US', { timeZone: timeZone || 'Asia/Riyadh' }))
  const hour = timeInZone.getHours()
  return hour >= 9 && hour < 17
}

/**
 * Calculate SLA status
 */
export function calculateSLAStatus(targetMinutes: number, actualMinutes?: number): 'on_time' | 'at_risk' | 'breached' {
  if (!actualMinutes) return 'on_time'
  
  const riskThreshold = targetMinutes * 0.8 // 80% of target time
  
  if (actualMinutes <= riskThreshold) {
    return 'on_time'
  } else if (actualMinutes < targetMinutes) {
    return 'at_risk'
  } else {
    return 'breached'
  }
}

/**
 * Format message preview (truncate long messages)
 */
export function formatMessagePreview(message: string, maxLength: number = 100): string {
  if (message.length <= maxLength) {
    return message
  }
  
  return message.substring(0, maxLength).trim() + '...'
}

/**
 * Check if message contains mentions
 */
export function extractMentions(message: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match
  
  while ((match = mentionRegex.exec(message)) !== null) {
    mentions.push(match[1])
  }
  
  return mentions
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get conversation urgency score (for sorting)
 */
export function getConversationUrgency(conversation: Conversation): number {
  let score = 0
  
  // Priority weight
  switch (conversation.priority) {
    case 'urgent':
      score += 1000
      break
    case 'high':
      score += 500
      break
    case 'medium':
      score += 200
      break
    case 'low':
      score += 50
      break
  }
  
  // Status weight
  switch (conversation.status) {
    case 'new':
      score += 300
      break
    case 'waiting_for_agent':
      score += 200
      break
    case 'waiting_for_customer':
      score += 100
      break
    case 'on_hold':
      score += 50
      break
    case 'closed':
      score += 0
      break
  }
  
  // Unread messages weight
  score += conversation.unreadCount * 10
  
  // Time weight (newer conversations get higher score)
  const hoursSinceCreated = (Date.now() - new Date(conversation.createdAt).getTime()) / (1000 * 60 * 60)
  score += Math.max(0, 100 - hoursSinceCreated)
  
  return score
}

