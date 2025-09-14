"use client"

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'
import { Button } from '@/components/ui/button'
import { useContactSettings } from '@/lib/contact-settings-context'

interface MobileStickyBarProps {
  onWhatsApp: () => void
  onEmail: () => void
  onChat: () => void
  chatEnabled: boolean
}

export default function MobileStickyBar({ 
  onWhatsApp, 
  onEmail, 
  onChat, 
  chatEnabled 
}: MobileStickyBarProps) {
  const { t, isRTL } = useTranslation()
  const { getText } = useContactSettings()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-ink-200 shadow-card">
      <div className="flex items-center justify-center gap-2 p-3">
        {/* WhatsApp Button */}
        <Button
          onClick={onWhatsApp}
          className="flex-1 h-12 bg-success hover:bg-success/90 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2"
          aria-label="Chat on WhatsApp"
        >
          <span className="text-lg mr-2" aria-hidden="true">📱</span>
          <span className="text-sm font-medium">{getText('sticky.whatsapp')}</span>
        </Button>

        {/* Email Button */}
        <Button
          onClick={onEmail}
          className="flex-1 h-12 bg-brand hover:bg-brand-dark text-white rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          aria-label="Email support"
        >
          <span className="text-lg mr-2" aria-hidden="true">✉️</span>
          <span className="text-sm font-medium">{getText('sticky.email')}</span>
        </Button>

        {/* Chat Button */}
        <Button
          onClick={onChat}
          className={`flex-1 h-12 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            chatEnabled 
              ? 'bg-warning hover:bg-warning/90 text-white hover:shadow-md hover:-translate-y-0.5 focus:ring-warning' 
              : 'bg-ink-100 text-ink-400 cursor-not-allowed'
          }`}
          disabled={!chatEnabled}
          aria-label={chatEnabled ? "Start live chat" : "Chat offline"}
        >
          <span className="text-lg mr-2" aria-hidden="true">💬</span>
          <span className="text-sm font-medium">{getText('sticky.chat')}</span>
        </Button>
      </div>
    </div>
  )
}
