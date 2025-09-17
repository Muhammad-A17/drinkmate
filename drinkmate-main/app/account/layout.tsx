'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/translation-context'
import AccountNav from '@/components/account/AccountNav'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Loader2 } from 'lucide-react'

interface AccountLayoutProps {
  children: React.ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { isRTL } = useTranslation()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account')
    }
  }, [isClient, isLoading, isAuthenticated, router])

  // Show loading while checking auth
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    )
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Header currentPage="account" />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer />
    </>
  )
}
