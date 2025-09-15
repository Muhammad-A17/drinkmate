// Account-related TypeScript types for Drinkmate

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

export interface Order {
  id: string
  number: string
  createdAt: string
  status: OrderStatus
  total: number
  itemsCount: number
  lineItems?: OrderLineItem[]
  shipments?: Shipment[]
  invoices?: Invoice[]
}

export interface OrderLineItem {
  id: string
  productId: string
  productName: string
  variant?: string
  quantity: number
  price: number
  image: string
}

export interface Shipment {
  id: string
  trackingNumber?: string
  carrier?: string
  status: 'pending' | 'in_transit' | 'delivered'
  estimatedDelivery?: string
  actualDelivery?: string
}

export interface Invoice {
  id: string
  number: string
  url: string
  createdAt: string
}

export interface Address {
  id: string
  firstName: string
  lastName: string
  district: string
  city: string
  phone: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  productId: string
  productName: string
  variant?: string
  quantity: number
  nextChargeAt: string
  interval: '4w' | '8w' | '12w'
  status: 'active' | 'paused' | 'cancelled'
  createdAt: string
}


export interface WishlistItem {
  id: string
  productId: string
  productName: string
  image: string
  price: number
  inStock: boolean
  addedAt: string
}

export interface SupportTicket {
  id: string
  subject: string
  status: 'open' | 'pending' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  lastMessage?: string
}

export interface ChatThread {
  id: string
  subject: string
  status: 'active' | 'closed'
  lastMessage?: string
  lastMessageAt?: string
  createdAt: string
}

export interface SecuritySession {
  id: string
  device: string
  location: string
  ipAddress: string
  lastActive: string
  isCurrent: boolean
}

export interface UserProfile {
  id: string
  name: string
  firstName?: string
  lastName?: string
  username?: string
  email: string
  phone?: string
  language: 'en' | 'ar'
  marketingPreferences: {
    email: boolean
    whatsapp: boolean
    sms: boolean
  }
  twoFactorEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface AccountOverview {
  user: UserProfile
  recentOrders: Order[]
  nextDelivery?: {
    type: 'subscription' | 'refill'
    date: string
    items: string[]
  }
  wishlistPreview: WishlistItem[]
  supportStatus: {
    hasActiveTickets: boolean
    activeChats: number
  }
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[]
  page: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
