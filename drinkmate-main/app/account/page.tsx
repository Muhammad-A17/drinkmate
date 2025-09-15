'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'
import { useAuth } from '@/lib/auth-context'
import type { AccountOverview } from '@/types/account'
import WelcomeCard from '@/components/account/WelcomeCard'
import NextDeliveryCard from '@/components/account/NextDeliveryCard'
import RecentOrdersCard from '@/components/account/RecentOrdersCard'
import WishlistPreviewCard from '@/components/account/WishlistPreviewCard'
import SupportCard from '@/components/account/SupportCard'
import { Loader2 } from 'lucide-react'

export default function AccountOverview() {
  const { language, isRTL } = useTranslation()
  const { user } = useAuth()
  const [overview, setOverview] = useState<AccountOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call
    const fetchOverview = async () => {
      try {
        setLoading(true)
        // Mock data - replace with actual API call
        const mockOverview: AccountOverview = {
          user: {
            id: user?._id || '1',
            name: user?.firstName || user?.username || 'User',
            firstName: user?.firstName,
            lastName: user?.lastName,
            username: user?.username,
            email: user?.email || 'user@example.com',
            phone: user?.phone || '+966501234567',
            language: language as 'en' | 'ar',
            marketingPreferences: {
              email: true,
              whatsapp: true,
              sms: false
            },
            twoFactorEnabled: false,
            createdAt: user?.createdAt || '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z'
          },
          recentOrders: [
            {
              id: '1',
              number: 'DM-2024-001',
              createdAt: '2024-01-15T10:30:00Z',
              status: 'delivered',
              total: 299.99,
              itemsCount: 3
            },
            {
              id: '2',
              number: 'DM-2024-002',
              createdAt: '2024-01-10T14:20:00Z',
              status: 'shipped',
              total: 149.99,
              itemsCount: 1
            },
            {
              id: '3',
              number: 'DM-2024-003',
              createdAt: '2024-01-05T09:15:00Z',
              status: 'processing',
              total: 89.99,
              itemsCount: 2
            }
          ],
          nextDelivery: {
            type: 'subscription',
            date: '2024-02-15T00:00:00Z',
            items: ['Starter Kit', 'CO₂ Cylinder']
          },
          wishlistPreview: [
            {
              id: '1',
              productId: 'prod-1',
              productName: 'Premium Flavor Pack',
              image: '/images/flavor-pack.jpg',
              price: 49.99,
              inStock: true,
              addedAt: '2024-01-12T00:00:00Z'
            },
            {
              id: '2',
              productId: 'prod-2',
              productName: 'Extra CO₂ Cylinder',
              image: '/images/co2-cylinder.jpg',
              price: 25.99,
              inStock: true,
              addedAt: '2024-01-08T00:00:00Z'
            }
          ],
          supportStatus: {
            hasActiveTickets: true,
            activeChats: 1
          }
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setOverview(mockOverview)
      } catch (err) {
        setError('Failed to load account overview')
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [language])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">
            {language === 'AR' ? 'جاري تحميل نظرة عامة على الحساب...' : 'Loading account overview...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {language === 'AR' ? 'خطأ في التحميل' : 'Loading Error'}
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {language === 'AR' ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    )
  }

  if (!overview) return null

  return (
    <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
      {/* Top strip */}
      <WelcomeCard user={overview.user} />

      {/* Grid rows */}
      <section className="grid grid-cols-12 gap-4 mt-4">
        {/* Upcoming subscription */}
        {overview.nextDelivery && (
          <div className="col-span-12 lg:col-span-6">
            <section className="bg-white rounded-soft shadow-card h-full">
              <NextDeliveryCard delivery={overview.nextDelivery} />
            </section>
          </div>
        )}

        {/* Recent orders */}
        <div className="col-span-12 lg:col-span-6">
          <section className="bg-white rounded-soft shadow-card h-full">
            <RecentOrdersCard orders={overview.recentOrders} />
          </section>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-4 mt-4">
        {/* Wishlist */}
        <div className="col-span-12 lg:col-span-6">
          <section className="bg-white rounded-soft shadow-card h-full">
            <WishlistPreviewCard items={overview.wishlistPreview} />
          </section>
        </div>

        {/* Support */}
        <div className="col-span-12 lg:col-span-6">
          <section className="bg-white rounded-soft shadow-card h-full">
            <SupportCard supportStatus={overview.supportStatus} />
          </section>
        </div>
      </section>
    </div>
  )
}
