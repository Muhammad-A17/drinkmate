"use client"

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { useChatStatus } from '@/lib/contexts/chat-status-context'
import ModernChatWidget from '@/components/chat/ModernChatWidget'

export default function ChatProvider() {
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only render on client side
  if (!isClient) {
    return null
  }

  // Show chat widget on support pages and contact page, but only for authenticated users
  const isSupportPage = pathname?.startsWith('/support')
  const isContactPage = pathname === '/contact'
  const is404Page = pathname === '/404' || pathname === '/not-found'
  
  if ((!isSupportPage && !isContactPage) || is404Page) {
    return null
  }

  // Only show for authenticated users
  if (!user || !isAuthenticated) {
    return null
  }

  return <ChatProviderContent />
}

function ChatProviderContent() {
  return <ModernChatWidget />
}
