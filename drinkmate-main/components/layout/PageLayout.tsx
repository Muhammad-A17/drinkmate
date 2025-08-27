"use client"

import Banner from "./Banner"
import Header from "./Header"
import Footer from "./Footer"
import { useTranslation } from "@/lib/translation-context"

interface PageLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

export default function PageLayout({ children, currentPage }: PageLayoutProps) {
  const { isRTL, isHydrated } = useTranslation()
  
  return (
    <div 
      className="min-h-screen bg-white"
      dir={isHydrated && isRTL ? 'rtl' : 'ltr'}
    >
      <Banner />
      <Header currentPage={currentPage} />
      <main className={`${isHydrated && isRTL ? 'font-noto-arabic' : 'font-geist'} max-w-[1920px] mx-auto`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
