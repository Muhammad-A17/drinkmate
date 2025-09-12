"use client"

import { useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'

export default function FontProvider() {
  const { language, isRTL } = useTranslation()

  useEffect(() => {
    // Update HTML attributes based on language
    const html = document.documentElement
    html.setAttribute('lang', language === 'AR' ? 'ar' : 'en')
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    
    // Update CSS custom properties for font switching
    const root = document.documentElement
    if (language === 'AR') {
      root.style.setProperty('--font-primary', 'var(--font-cairo)')
      root.style.setProperty('--font-secondary', 'var(--font-noto-arabic)')
    } else {
      root.style.setProperty('--font-primary', 'var(--font-montserrat)')
      root.style.setProperty('--font-secondary', 'var(--font-noto-sans)')
    }
  }, [language, isRTL])

  return null
}
