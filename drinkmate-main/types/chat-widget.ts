import { Message, ChatSession } from './chat'
import { ResponseETA } from '@/lib/services/response-eta-service'

export interface ChatWidgetState {
  chatSession: ChatSession | null
  isOpen: boolean
  isMinimized: boolean
  newMessage: string
  isLoading: boolean
  isCreatingSession: boolean
  error: string | null
  responseETA: ResponseETA | null
  etaLoading: boolean
}

export interface ChatWidgetActions {
  setNewMessage: (message: string) => void
  toggleChat: () => void
  minimizeChat: () => void
  closeChat: () => void
  handleSendMessage: () => void
  createChatSession: () => void
}

export interface ChatWidgetContext {
  chatStatus: any
  isConnected: boolean
  isAuthenticated: boolean
  user: any
}

export interface ChatWidgetReturn extends ChatWidgetState, ChatWidgetActions, ChatWidgetContext {
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export interface ChatHeaderProps {
  isOpen: boolean
  isMinimized: boolean
  onToggle: () => void
  onMinimize: () => void
  onClose: () => void
}

export interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  responseETA: ResponseETA | null
  etaLoading: boolean
}

export interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: () => void
  isCreatingSession: boolean
  disabled?: boolean
}

export interface ChatToggleButtonProps {
  onClick: () => void
  isOpen: boolean
  hasUnreadMessages?: boolean
}

// Re-export types from chat.ts
export type { Message, ChatSession } from './chat'
export type { ResponseETA } from '@/lib/services/response-eta-service'
