"use client"

import React from 'react'
import { MessageCircle, Mail, Phone, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ChatStatus {
  isOnline: boolean
  isLoggedIn: boolean
  canChat: boolean
  nextOpenTime: string | null
}

interface ContactChannelsProps {
  chatStatus: ChatStatus
  isRTL: boolean
}

export default function ContactChannels({ chatStatus, isRTL }: ContactChannelsProps) {
  const channels = [
    {
      id: 'whatsapp',
      icon: MessageCircle,
      title: 'WhatsApp',
      titleAr: 'واتساب',
      status: '24/7',
      statusAr: '24/7',
      statusColor: 'bg-green-100 text-green-800',
      meta: 'Available 24/7 • Typical replies 9-5 KSA',
      metaAr: 'متاح 24/7 • الردود المعتادة 9-5 بتوقيت السعودية',
      cta: 'Chat on WhatsApp',
      ctaAr: 'تحدث عبر واتساب',
      ctaColor: 'bg-green-600 hover:bg-green-700',
      helper: 'Replies 9-5; leave a message anytime.',
      helperAr: 'الردود 9-5؛ اترك رسالة في أي وقت.',
      href: 'https://wa.me/966501234567?text=Hello! I need help with my order.',
      disabled: false
    },
    {
      id: 'email',
      icon: Mail,
      title: 'Email',
      titleAr: 'البريد الإلكتروني',
      status: '24/7',
      statusAr: '24/7',
      statusColor: 'bg-blue-100 text-blue-800',
      meta: 'We reply within 1 business day',
      metaAr: 'نرد خلال يوم عمل واحد',
      cta: 'Email support@drinkmates.com',
      ctaAr: 'راسل support@drinkmates.com',
      ctaColor: 'bg-blue-600 hover:bg-blue-700',
      helper: 'We reply within 1 business day.',
      helperAr: 'نرد خلال يوم عمل واحد.',
      href: 'mailto:support@drinkmates.com?subject=Contact Form Inquiry',
      disabled: false
    },
    {
      id: 'chat',
      icon: MessageCircle,
      title: 'Live Chat',
      titleAr: 'الدردشة المباشرة',
      status: chatStatus.isOnline ? 'Online now' : 'Opens 9:00 AM',
      statusAr: chatStatus.isOnline ? 'متصل الآن' : 'يفتح 9:00 صباحاً',
      statusColor: chatStatus.isOnline ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800',
      meta: chatStatus.isOnline ? 'Usually under 2 minutes' : 'Opens 9:00 AM (KSA)',
      metaAr: chatStatus.isOnline ? 'عادة أقل من دقيقتين' : 'يفتح 9:00 صباحاً (بتوقيت السعودية)',
      cta: chatStatus.canChat ? 'Start live chat (≈2 min wait)' : 
           chatStatus.isLoggedIn ? 'Opens 9:00 AM (KSA)' : 'Sign in to start chat',
      ctaAr: chatStatus.canChat ? 'ابدأ الدردشة المباشرة (≈2 دقيقة انتظار)' :
             chatStatus.isLoggedIn ? 'يفتح 9:00 صباحاً (بتوقيت السعودية)' : 'سجل الدخول لبدء الدردشة',
      ctaColor: chatStatus.canChat ? 'bg-brand hover:bg-brand-dark' : 'bg-gray-400 cursor-not-allowed',
      helper: chatStatus.isOnline ? 'Usually under 2 minutes.' : 'Opens 9:00 AM (KSA). Leave a message via WhatsApp or Email.',
      helperAr: chatStatus.isOnline ? 'عادة أقل من دقيقتين.' : 'يفتح 9:00 صباحاً (بتوقيت السعودية). اترك رسالة عبر واتساب أو البريد الإلكتروني.',
      href: chatStatus.canChat ? '/chat' : chatStatus.isLoggedIn ? '#' : '/login?return=/contact',
      disabled: !chatStatus.canChat
    }
  ]

  const getStatusIcon = (channelId: string, isOnline: boolean) => {
    if (channelId === 'chat') {
      return isOnline ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />
    }
    return <CheckCircle className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold text-gray-900 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
        {isRTL ? 'طرق التواصل' : 'Contact Channels'}
      </h2>
      
      <div className="grid grid-cols-1 gap-4">
        {channels.map((channel) => (
          <Card key={channel.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand/10 rounded-lg flex items-center justify-center">
                    <channel.icon className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                      {isRTL ? channel.titleAr : channel.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {isRTL ? channel.metaAr : channel.meta}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(channel.id, chatStatus.isOnline)}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${channel.statusColor}`}>
                    {isRTL ? channel.statusAr : channel.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  asChild
                  className={`w-full h-12 text-white font-medium rounded-lg transition-all duration-200 ${channel.ctaColor} ${
                    channel.disabled ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md'
                  }`}
                  disabled={channel.disabled}
                >
                  <a href={channel.href}>
                    {isRTL ? channel.ctaAr : channel.cta}
                  </a>
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  {isRTL ? channel.helperAr : channel.helper}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
