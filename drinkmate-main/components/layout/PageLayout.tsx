"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Banner from "./Banner"
import Header from "./Header"
import Footer from "./Footer"
import { useTranslation } from "@/lib/translation-context"
import { toast } from "sonner"

interface PageLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

export default function PageLayout({ children, currentPage }: PageLayoutProps) {
  const router = useRouter()
  const { isRTL, isHydrated } = useTranslation()
  
  // Handle session expiration
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Your session has expired. Please log in again.")
      router.push('/login?session=expired')
    }
    
    window.addEventListener('session-expired', handleSessionExpired)
    
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired)
    }
  }, [router])
  
  return (
    <div 
      className={`min-h-screen bg-white ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}
      dir={isHydrated && isRTL ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <Banner />
      <Header currentPage={currentPage} />
      <main className={`max-w-[1920px] mx-auto`} suppressHydrationWarning>
        {children}
      </main>
      <Footer />
    </div>
  )
}
