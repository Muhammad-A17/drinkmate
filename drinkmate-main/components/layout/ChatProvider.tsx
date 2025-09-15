"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import FloatingChatWidget from '@/components/chat/FloatingChatWidget'

export default function ChatProvider() {
  const pathname = usePathname()
  
  // Only show chat widget on support pages
  const isSupportPage = pathname?.startsWith('/account/support') || pathname?.startsWith('/support')
  
  if (!isSupportPage) {
    return null
  }

  // Check if chat is online (9 AM to 5 PM)
  const isChatOnline = () => {
    const now = new Date()
    const currentHour = now.getHours()
    return currentHour >= 9 && currentHour < 17
  }

  return <FloatingChatWidget isOnline={isChatOnline()} />
}
