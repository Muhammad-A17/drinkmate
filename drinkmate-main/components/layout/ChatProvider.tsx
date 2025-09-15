"use client"

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useChatStatus } from '@/lib/chat-status-context'
import FloatingChatWidget from '@/components/chat/FloatingChatWidget'

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
  const isSupportPage = pathname?.startsWith('/account/support') || pathname?.startsWith('/support')
  const isContactPage = pathname === '/contact'
  
  if (!isSupportPage && !isContactPage) {
    return null
  }

  // Only show for authenticated users
  if (!user || !isAuthenticated) {
    return null
  }

  return <ChatProviderContent />
}

function ChatProviderContent() {
  const { chatStatus } = useChatStatus()
  return <FloatingChatWidget isOnline={chatStatus.isOnline} />
}
