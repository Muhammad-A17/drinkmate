"use client"

import { useTranslation } from './translation-context'
import { adminTranslations } from './admin-translations'

export function useAdminTranslation() {
  const { language, isRTL } = useTranslation()
  
  // Get admin translations for the current language
  const translations = adminTranslations[language]
  
  // Function to get a translation by key (using dot notation)
  const t = (key: string): string => {
    const keys = key.split('.')
    let current: any = translations
    
    for (const k of keys) {
      if (current && current[k]) {
        current = current[k]
      } else {
        return key // Return key if translation not found
      }
    }

    return current || key
  }

  return {
    t,
    language,
    isRTL
  }
}
