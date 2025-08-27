"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "@/lib/translation-context"

export default function Banner() {
  const { t, isRTL, isHydrated } = useTranslation()
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0)

  const bannerMessages = [
    { text: t('banner.messages.freeDelivery'), code: null },
    { text: t('banner.messages.colaFlavors'), code: t('banner.codes.cola44') },
    { text: t('banner.messages.firstOrderDiscount'), code: t('banner.codes.new25') },
    { text: t('banner.messages.megaOffer'), code: null },
    { text: t('banner.messages.cylinderRefill'), code: null },
  ]

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBannerSlide((prev) => (prev === bannerMessages.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(bannerInterval)
  }, [bannerMessages.length])

  const currentBanner = bannerMessages[currentBannerSlide]

  // Don't render translated content until hydration is complete
  if (!isHydrated) {
    return (
      <div className="bg-[#12d6fa] text-white text-center py-2 text-sm flex items-center justify-center">
        <div className="w-64 h-4 bg-white/20 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] text-white text-center py-2 sm:py-3 text-xs sm:text-sm flex items-center justify-center shadow-lg" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
        <span className={`${isRTL ? 'font-noto-arabic' : 'font-noto-sans'} line-clamp-1 font-medium`}>{currentBanner.text}</span>
        {currentBanner.code && (
          <span className={`${isRTL ? 'mr-1 sm:mr-2' : 'ml-1 sm:ml-2'} px-2 sm:px-3 py-1 bg-white text-[#12d6fa] rounded-full text-[10px] sm:text-xs font-bold shadow-sm ${isRTL ? 'font-cairo' : 'font-montserrat'} hover:scale-105 transition-transform duration-200`}>
            {currentBanner.code}
          </span>
        )}
      </div>
    </div>
  )
}
