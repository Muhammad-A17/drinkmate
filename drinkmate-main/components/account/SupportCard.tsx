'use client'

import { useTranslation } from '@/lib/translation-context'
import { Button } from '@/components/ui/button'
import { MessageCircle, Clock, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SupportCardProps {
  supportStatus: {
    hasActiveTickets: boolean
    activeChats: number
  }
}

export default function SupportCard({ supportStatus }: SupportCardProps) {
  const { language, isRTL } = useTranslation()

  const isWorkingHours = () => {
    const now = new Date()
    const hour = now.getHours()
    return hour >= 9 && hour < 17 // 9 AM to 5 PM
  }

  const getWorkingHoursText = () => {
    if (isWorkingHours()) {
      return {
        en: 'We\'re online now! Start a live chat.',
        ar: 'نحن متصلون الآن! ابدأ محادثة مباشرة.'
      }
    } else {
      return {
        en: 'Leave a message; we\'ll reply 9-5.',
        ar: 'اترك رسالة؛ سنرد من 9-5.'
      }
    }
  }

  return (
    <div className="p-6 lg:p-8 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">
            {language === 'AR' ? 'الدعم' : 'Support'}
          </h3>
        </div>
        <Link href="/account/support">
          <Button variant="ghost" size="sm">
            {language === 'AR' ? 'عرض الكل' : 'View All'}
            <ArrowRight className={cn(
              "w-4 h-4 ml-1",
              isRTL ? "ml-0 mr-1 rotate-180" : ""
            )} />
          </Button>
        </Link>
      </div>

      {/* Status Indicators */}
      <div className="space-y-3 mb-4">
        {supportStatus.hasActiveTickets && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-sm text-amber-800">
              {language === 'AR' ? 'لديك تذاكر نشطة' : 'You have active tickets'}
            </span>
          </div>
        )}

        {supportStatus.activeChats > 0 && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-green-800">
              {language === 'AR' 
                ? `${supportStatus.activeChats} محادثة نشطة`
                : `${supportStatus.activeChats} active chat${supportStatus.activeChats > 1 ? 's' : ''}`
              }
            </span>
          </div>
        )}

        {!supportStatus.hasActiveTickets && supportStatus.activeChats === 0 && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {getWorkingHoursText()[language.toLowerCase() as 'en' | 'ar']}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {isWorkingHours() ? (
          <Link href="/account/support/chat">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              {language === 'AR' ? 'بدء محادثة مباشرة' : 'Start Live Chat'}
            </Button>
          </Link>
        ) : (
          <Link href="/account/support/tickets/new">
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'AR' ? 'فتح تذكرة جديدة' : 'Open New Ticket'}
            </Button>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Link href="/account/support/tickets">
            <Button variant="outline" size="sm" className="w-full">
              {language === 'AR' ? 'التذاكر' : 'Tickets'}
            </Button>
          </Link>
          <Link href="/account/support/chat">
            <Button variant="outline" size="sm" className="w-full">
              {language === 'AR' ? 'المحادثات' : 'Chats'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Working Hours Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>
            {language === 'AR' 
              ? 'ساعات العمل: 9 صباحاً - 5 مساءً'
              : 'Working hours: 9 AM - 5 PM'
            }
          </span>
        </div>
      </div>
    </div>
  )
}
