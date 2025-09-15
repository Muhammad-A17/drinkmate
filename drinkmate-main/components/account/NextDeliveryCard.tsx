'use client'

import { useTranslation } from '@/lib/translation-context'
import { Button } from '@/components/ui/button'
import { Calendar, Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NextDeliveryCardProps {
  delivery: {
    type: 'subscription' | 'refill'
    date: string
    items: string[]
  }
}

export default function NextDeliveryCard({ delivery }: NextDeliveryCardProps) {
  const { language, isRTL } = useTranslation()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTypeLabel = () => {
    if (delivery.type === 'subscription') {
      return {
        en: 'Next Subscription Delivery',
        ar: 'تسليم الاشتراك التالي'
      }
    } else {
      return {
        en: 'Next Refill Delivery',
        ar: 'تسليم إعادة الملء التالي'
      }
    }
  }

  const getTypeIcon = () => {
    return delivery.type === 'subscription' ? Package : Calendar
  }

  const TypeIcon = getTypeIcon()

  return (
    <div className="p-6 lg:p-8 h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TypeIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {getTypeLabel()[language.toLowerCase() as 'en' | 'ar']}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(delivery.date)}
            </p>
          </div>
        </div>
        <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          {language === 'AR' ? 'قريباً' : 'Upcoming'}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          {language === 'AR' ? 'العناصر المشمولة:' : 'Items included:'}
        </p>
        <ul className="space-y-1">
          {delivery.items.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <Link href="/account/subscriptions" className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            {language === 'AR' ? 'إدارة الاشتراك' : 'Manage Subscription'}
            <ArrowRight className={cn(
              "w-4 h-4 ml-2",
              isRTL ? "ml-0 mr-2 rotate-180" : ""
            )} />
          </Button>
        </Link>
        <Link href="/account/orders" className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            {language === 'AR' ? 'عرض الطلبات' : 'View Orders'}
            <ArrowRight className={cn(
              "w-4 h-4 ml-2",
              isRTL ? "ml-0 mr-2 rotate-180" : ""
            )} />
          </Button>
        </Link>
      </div>
    </div>
  )
}
