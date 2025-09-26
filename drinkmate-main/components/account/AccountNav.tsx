'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/lib/contexts/translation-context'
import { useAuth } from '@/lib/contexts/auth-context'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  RefreshCw,
  MapPin,
  Heart,
  MessageCircle,
  Shield,
  Settings,
  ChevronRight
} from 'lucide-react'

const navItems = [
  {
    key: 'overview',
    href: '/account',
    icon: LayoutDashboard,
    label: { en: 'Overview', ar: 'نظرة عامة' }
  },
  {
    key: 'orders',
    href: '/account/orders',
    icon: Package,
    label: { en: 'Orders & Returns', ar: 'الطلبات والإرجاع' }
  },
  {
    key: 'subscriptions',
    href: '/account/subscriptions',
    icon: RefreshCw,
    label: { en: 'Subscriptions', ar: 'الاشتراكات' }
  },
  {
    key: 'addresses',
    href: '/account/addresses',
    icon: MapPin,
    label: { en: 'Addresses', ar: 'العناوين' }
  },
  {
    key: 'wishlist',
    href: '/account/wishlist',
    icon: Heart,
    label: { en: 'Wishlist', ar: 'قائمة الأمنيات' }
  },
  {
    key: 'security',
    href: '/account/security',
    icon: Shield,
    label: { en: 'Security', ar: 'الأمان' }
  },
  {
    key: 'settings',
    href: '/account/settings',
    icon: Settings,
    label: { en: 'Settings', ar: 'الإعدادات' }
  }
]

export default function AccountNav() {
  const pathname = usePathname()
  const { language, isRTL } = useTranslation()
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/account') {
      return pathname === '/account'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="xl:hidden mb-6">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <span className="font-semibold text-gray-900">
            {language === 'AR' ? 'قائمة الحساب' : 'Account Menu'}
          </span>
          <ChevronRight 
            className={cn(
              "w-5 h-5 transition-transform text-gray-500",
              isMobileMenuOpen ? "rotate-90" : "",
              isRTL ? "rotate-180" : ""
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "space-y-1",
        isMobileMenuOpen ? "block" : "hidden xl:block"
      )}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                "hover:bg-blue-50 hover:text-blue-700",
                active 
                  ? "bg-blue-100 text-blue-700 font-semibold shadow-sm" 
                  : "text-gray-700 hover:text-gray-900",
                isRTL ? "flex-row-reverse" : ""
              )}
              onClick={() => setIsMobileMenuOpen(false)}
                      title={item.label[language.toLowerCase() as 'en' | 'ar']}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                active ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
              )} />
              <span className="flex-1 text-sm font-medium">
                {item.label[language.toLowerCase() as 'en' | 'ar']}
              </span>
              {active && (
                <div className={cn(
                  "w-1 h-6 bg-blue-600 rounded-full",
                  isRTL ? "mr-2" : "ml-2"
                )} />
              )}
              
              {/* Tooltip for desktop */}
              <div className={cn(
                "absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50",
                "xl:block hidden",
                isRTL ? "left-auto right-full mr-2" : ""
              )}>
                {item.label[language.toLowerCase() as 'en' | 'ar']}
                <div className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900",
                  isRTL ? "right-0 translate-x-full border-l-4 border-r-0 border-l-gray-900" : "-left-1"
                )} />
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Account Info */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-blue-600 font-bold text-lg">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {user?.name || user?.username || 'User'}
          </h3>
          <p className="text-sm text-gray-500">
            {user?.email}
          </p>
        </div>
      </div>
    </>
  )
}
