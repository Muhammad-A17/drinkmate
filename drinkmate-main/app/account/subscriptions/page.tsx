'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'
import { Subscription } from '@/types/account'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Pause, Play, SkipForward, Edit, Trash2, Calendar, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Price } from '@/components/account/Price'

export default function SubscriptionsPage() {
  const { language, isRTL } = useTranslation()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API call
  const mockSubscriptions: Subscription[] = [
    {
      id: '1',
      productId: 'prod-1',
      productName: 'Starter Kit - Arctic Blue',
      variant: 'Arctic Blue',
      quantity: 1,
      nextChargeAt: '2024-02-15T00:00:00Z',
      interval: '4w',
      status: 'active',
      createdAt: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      productId: 'prod-2',
      productName: 'CO₂ Cylinder Refill',
      quantity: 2,
      nextChargeAt: '2024-02-20T00:00:00Z',
      interval: '8w',
      status: 'paused',
      createdAt: '2024-01-10T00:00:00Z'
    }
  ]

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubscriptions(mockSubscriptions)
      setLoading(false)
    }

    fetchSubscriptions()
  }, [])

  const getStatusLabel = (status: string) => {
    const statusMap = {
      active: { en: 'Active', ar: 'نشط' },
      paused: { en: 'Paused', ar: 'معلق' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' }
    }
    return statusMap[status as keyof typeof statusMap] || { en: status, ar: status }
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-amber-100 text-amber-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
  }

  const getIntervalLabel = (interval: string) => {
    const intervalMap = {
      '4w': { en: 'Every 4 weeks', ar: 'كل 4 أسابيع' },
      '8w': { en: 'Every 8 weeks', ar: 'كل 8 أسابيع' },
      '12w': { en: 'Every 12 weeks', ar: 'كل 12 أسبوع' }
    }
    return intervalMap[interval as keyof typeof intervalMap] || { en: interval, ar: interval }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handlePause = async (id: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, status: 'paused' as const } : sub
    ))
  }

  const handleResume = async (id: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, status: 'active' as const } : sub
    ))
  }

  const handleSkip = async (id: string) => {
    // Skip next delivery logic
    console.log('Skip subscription:', id)
  }

  const handleEdit = async (id: string) => {
    // Edit subscription logic
    console.log('Edit subscription:', id)
  }

  const handleCancel = async (id: string) => {
    if (window.confirm(language === 'AR' ? 'هل أنت متأكد من إلغاء هذا الاشتراك؟' : 'Are you sure you want to cancel this subscription?')) {
      setSubscriptions(prev => prev.map(sub => 
        sub.id === id ? { ...sub, status: 'cancelled' as const } : sub
      ))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'AR' ? 'الاشتراكات' : 'Subscriptions'}
        </h1>
        <p className="text-gray-600 mt-1">
          {language === 'AR' 
            ? 'إدارة اشتراكاتك التلقائية'
            : 'Manage your automatic subscriptions'
          }
        </p>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {language === 'AR' ? 'لا توجد اشتراكات' : 'No subscriptions yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {language === 'AR' 
              ? 'وفر 10% مع الاشتراك التلقائي'
              : 'Save 10% with automatic subscriptions'
            }
          </p>
          <Button>
            {language === 'AR' ? 'تعرف على المزيد' : 'Learn More'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {subscription.productName}
                    </h3>
                    {subscription.variant && (
                      <span className="text-sm text-gray-500">
                        ({subscription.variant})
                      </span>
                    )}
                    <Badge className={getStatusColor(subscription.status)}>
                      {getStatusLabel(subscription.status)[language.toLowerCase() as 'en' | 'ar']}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {subscription.quantity} {language === 'AR' ? 'قطعة' : 'items'}
                    </span>
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-4 h-4" />
                      {getIntervalLabel(subscription.interval)[language.toLowerCase() as 'en' | 'ar']}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">
                    {language === 'AR' ? 'الدفعة التالية:' : 'Next charge:'}
                  </div>
                  <div className="flex items-center gap-1 text-lg font-semibold">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {formatDate(subscription.nextChargeAt)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {subscription.status === 'active' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePause(subscription.id)}
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      {language === 'AR' ? 'إيقاف مؤقت' : 'Pause'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSkip(subscription.id)}
                    >
                      <SkipForward className="w-4 h-4 mr-1" />
                      {language === 'AR' ? 'تخطي التالي' : 'Skip Next'}
                    </Button>
                  </>
                )}
                
                {subscription.status === 'paused' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResume(subscription.id)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    {language === 'AR' ? 'استئناف' : 'Resume'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(subscription.id)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {language === 'AR' ? 'تعديل' : 'Edit'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancel(subscription.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {language === 'AR' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
