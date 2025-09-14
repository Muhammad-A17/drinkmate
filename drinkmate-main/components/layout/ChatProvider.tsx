"use client"

import React from 'react'
import FloatingChatWidget from '@/components/chat/FloatingChatWidget'

export default function ChatProvider() {
  // Check if chat is online (9 AM to 5 PM)
  const isChatOnline = () => {
    const now = new Date()
    const currentHour = now.getHours()
    return currentHour >= 9 && currentHour < 17
  }

  return <FloatingChatWidget isOnline={isChatOnline()} />
}
