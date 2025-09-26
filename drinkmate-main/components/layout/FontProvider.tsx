"use client"

import { useEffect } from 'react'
import { useTranslation } from '@/lib/contexts/translation-context'

export default function FontProvider() {
  const { language, isRTL } = useTranslation()

  useEffect(() => {
    // Update HTML attributes based on language
    const html = document.documentElement
    html.setAttribute('lang', language === 'AR' ? 'ar' : 'en')
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    
    // Update CSS custom properties for font switching with proper fallbacks
    const root = document.documentElement
    if (language === 'AR') {
      root.style.setProperty('--font-primary', 'var(--font-cairo), "Cairo", system-ui, sans-serif')
      root.style.setProperty('--font-secondary', 'var(--font-noto-arabic), "Noto Sans Arabic", system-ui, sans-serif')
    } else {
      root.style.setProperty('--font-primary', 'var(--font-montserrat), "Montserrat", system-ui, sans-serif')
      root.style.setProperty('--font-secondary', 'var(--font-noto-sans), "Noto Sans", system-ui, sans-serif')
    }
  }, [language, isRTL])

  return null
}
