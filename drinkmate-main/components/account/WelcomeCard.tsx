'use client'

import { useTranslation } from '@/lib/contexts/translation-context'
import { UserProfile } from '@/types/account'
import { Button } from '@/components/ui/button'
import { RefreshCw, Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface WelcomeCardProps {
  user: UserProfile
}

export default function WelcomeCard({ user }: WelcomeCardProps) {
  const { language, isRTL } = useTranslation()

  const quickActions = [
    {
      label: { en: 'Track Order', ar: 'تتبع الطلب' },
      href: '/track-order',
      icon: Package,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: { en: 'View Orders', ar: 'عرض الطلبات' },
      href: '/account/orders',
      icon: Package,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: { en: 'Manage Subscription', ar: 'إدارة الاشتراك' },
      href: '/account/subscriptions',
      icon: RefreshCw,
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ]

  return (
    <div className="bg-gradient-to-tr from-sky-600 to-cyan-500 text-white p-5 flex items-center justify-between rounded-2xl" style={{ maxHeight: '120px' }}>
      <div>
        <h1 className="text-[20px] font-semibold">
          {language === 'AR' ? `مرحباً ${user.name}` : `Hello, ${user.name}`}
        </h1>
        <p className="text-white/80 text-[13px] mt-1">
          {language === 'AR' 
            ? 'إدارة الطلبات والاشتراكات وإرجاع ثاني أكسيد الكربون' 
            : 'Manage orders, subscriptions & CO₂ returns'
          }
        </p>
      </div>
      <div className="flex gap-2">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <Link key={index} href={action.href}>
              <Button
                variant={index === 0 ? "default" : "secondary"}
                size="sm"
                className="text-xs font-medium"
              >
                <Icon className="w-4 h-4 mr-1" />
                {action.label[language.toLowerCase() as 'en' | 'ar']}
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
