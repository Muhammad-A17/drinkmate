"use client"

import React, { useState, useEffect } from 'react'
import { MessageCircle, Phone, Mail, X, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface MobileStickyContactBarProps {
  isRTL: boolean
  isAuthenticated: boolean
  chatStatus: any
}

export default function MobileStickyContactBar({ isRTL, isAuthenticated, chatStatus }: MobileStickyContactBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsVisible(scrollTop > 300) // Show after scrolling 300px
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hello! I need help with my order.")
    const url = `https://wa.me/966501234567?text=${message}`
    window.open(url, '_blank')
  }

  const handleEmailClick = () => {
    const subject = encodeURIComponent('Support Request')
    const body = encodeURIComponent(`Hello,\n\nI need help with: ${isAuthenticated ? 'my inquiry' : 'my inquiry'}\n\n`)
    const url = `mailto:support@drinkmates.com?subject=${subject}&body=${body}`
    window.open(url)
  }

  const handlePhoneClick = () => {
    window.open('tel:+966501234567')
  }

  const handleChatClick = () => {
    if (!isAuthenticated) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?returnUrl=${currentUrl}&reason=chat`
      return
    }
    
    if (!chatStatus?.isOnline) {
      alert('Live chat is currently offline. Please use WhatsApp or email us.')
      return
    }
    
    window.dispatchEvent(new CustomEvent('openChatWidget'))
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Main Bar */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        {!isExpanded ? (
          // Collapsed State
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#12d6fa] to-[#0fb8d9] rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {isRTL ? 'نحن هنا لمساعدتك' : 'We\'re here to help'}
                </p>
                <p className="text-xs text-gray-600">
                  {isRTL ? 'اختر طريقة التواصل' : 'Choose how to contact us'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setIsExpanded(true)}
              variant="outline"
              size="sm"
              className="rounded-full p-2"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          // Expanded State
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-gray-900 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                {isRTL ? 'طرق التواصل' : 'Contact Options'}
              </h3>
              <Button
                onClick={() => setIsExpanded(false)}
                variant="ghost"
                size="sm"
                className="rounded-full p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-2 gap-3">
              {/* WhatsApp */}
              <Button
                onClick={handleWhatsAppClick}
                className="flex flex-col items-center p-4 h-auto bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                <MessageCircle className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">WhatsApp</span>
                <span className="text-xs opacity-90">24/7</span>
              </Button>

              {/* Phone */}
              <Button
                onClick={handlePhoneClick}
                className="flex flex-col items-center p-4 h-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                <Phone className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">{isRTL ? 'اتصل' : 'Call'}</span>
                <span className="text-xs opacity-90">9AM-6PM</span>
              </Button>

              {/* Email */}
              <Button
                onClick={handleEmailClick}
                className="flex flex-col items-center p-4 h-auto bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
              >
                <Mail className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">{isRTL ? 'بريد' : 'Email'}</span>
                <span className="text-xs opacity-90">24/7</span>
              </Button>

              {/* Live Chat */}
              <Button
                onClick={handleChatClick}
                disabled={!isAuthenticated || !chatStatus?.isOnline}
                className={`flex flex-col items-center p-4 h-auto rounded-xl ${
                  !isAuthenticated || !chatStatus?.isOnline
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#12d6fa] hover:bg-[#0fb8d9]'
                } text-white`}
              >
                <MessageCircle className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">{isRTL ? 'دردشة' : 'Chat'}</span>
                <span className="text-xs opacity-90">
                  {!isAuthenticated 
                    ? isRTL ? 'تسجيل دخول' : 'Login'
                    : chatStatus?.isOnline 
                      ? 'متصل' 
                      : 'غير متصل'
                  }
                </span>
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex space-x-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <a href="#contact-form">
                    {isRTL ? 'نموذج التواصل' : 'Contact Form'}
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <a href="#faq">
                    {isRTL ? 'الأسئلة الشائعة' : 'FAQ'}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
