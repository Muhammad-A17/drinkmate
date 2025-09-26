"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartSettings {
  freeShipping: {
    threshold: number
    enabled: boolean
    copyEn: string
    copyAr: string
    unlockedCopyEn: string
    unlockedCopyAr: string
  }
  secureCheckout: {
    enabled: boolean
    textEn: string
    textAr: string
  }
  recommendations: {
    enabled: boolean
    maxCount: number
    source: 'auto' | 'manual'
    excludeInCart: boolean
    titleEn: string
    titleAr: string
  }
  freeGift: {
    enabled: boolean
    threshold: number
    maxGift: number
    titleEn: string
    titleAr: string
    descriptionEn: string
    descriptionAr: string
  }
  stickyCheckout: {
    enabled: boolean
    textEn: string
    textAr: string
  }
  general: {
    emptyCartEn: string
    emptyCartAr: string
    continueShoppingEn: string
    continueShoppingAr: string
    clearCartEn: string
    clearCartAr: string
    saveForLaterEn: string
    saveForLaterAr: string
    removeEn: string
    removeAr: string
    addToCartEn: string
    addToCartAr: string
    lineTotalEn: string
    lineTotalAr: string
    subtotalEn: string
    subtotalAr: string
    shippingEn: string
    shippingAr: string
    taxEn: string
    taxAr: string
    discountEn: string
    discountAr: string
    totalEn: string
    totalAr: string
    couponPlaceholderEn: string
    couponPlaceholderAr: string
    applyCouponEn: string
    applyCouponAr: string
    secureCheckoutEn: string
    secureCheckoutAr: string
    notePlaceholderEn: string
    notePlaceholderAr: string
    noteLabelEn: string
    noteLabelAr: string
  }
}

const defaultSettings: CartSettings = {
  freeShipping: {
    threshold: 150,
    enabled: true,
    copyEn: "Add {amount} more for free shipping",
    copyAr: "أضف {amount} أكثر للحصول على الشحن المجاني",
    unlockedCopyEn: "You've unlocked free shipping!",
    unlockedCopyAr: "لقد حصلت على الشحن المجاني!"
  },
  secureCheckout: {
    enabled: true,
    textEn: "Secure Checkout",
    textAr: "الدفع الآمن"
  },
  recommendations: {
    enabled: true,
    maxCount: 6,
    source: 'auto',
    excludeInCart: true,
    titleEn: "Items you may like",
    titleAr: "عناصر قد تعجبك"
  },
  freeGift: {
    enabled: true,
    threshold: 100,
    maxGift: 1,
    titleEn: "Select a FREE product",
    titleAr: "اختر منتج مجاني",
    descriptionEn: "You qualify for one free product! Choose from the options below.",
    descriptionAr: "أنت مؤهل للحصول على منتج مجاني! اختر من الخيارات أدناه."
  },
  stickyCheckout: {
    enabled: true,
    textEn: "Secure Checkout",
    textAr: "الدفع الآمن"
  },
  general: {
    emptyCartEn: "Your cart is empty.",
    emptyCartAr: "سلة التسوق فارغة.",
    continueShoppingEn: "Continue Shopping",
    continueShoppingAr: "متابعة التسوق",
    clearCartEn: "Clear Cart",
    clearCartAr: "مسح السلة",
    saveForLaterEn: "Save for later",
    saveForLaterAr: "حفظ للم later",
    removeEn: "Remove",
    removeAr: "إزالة",
    addToCartEn: "Add",
    addToCartAr: "إضافة",
    lineTotalEn: "Line total",
    lineTotalAr: "المجموع الفرعي",
    subtotalEn: "Subtotal",
    subtotalAr: "المجموع الفرعي",
    shippingEn: "Shipping",
    shippingAr: "الشحن",
    taxEn: "Tax",
    taxAr: "الضريبة",
    discountEn: "Discount",
    discountAr: "خصم",
    totalEn: "Total",
    totalAr: "المجموع",
    couponPlaceholderEn: "Coupon code",
    couponPlaceholderAr: "رمز الكوبون",
    applyCouponEn: "Apply",
    applyCouponAr: "تطبيق",
    secureCheckoutEn: "Secure Checkout",
    secureCheckoutAr: "الدفع الآمن",
    notePlaceholderEn: "Special handling instructions…",
    notePlaceholderAr: "تعليمات خاصة للمعالجة...",
    noteLabelEn: "Add instructions for packing your order (optional)",
    noteLabelAr: "أضف تعليمات لتعبئة طلبك (اختياري)"
  }
}

interface CartSettingsContextType {
  settings: CartSettings
  updateSettings: (newSettings: Partial<CartSettings>) => void
  getText: (key: string, locale?: 'en' | 'ar') => string
  getFreeShippingText: (remaining: number, locale?: 'en' | 'ar') => string
  getUnlockedText: (locale?: 'en' | 'ar') => string
}

const CartSettingsContext = createContext<CartSettingsContextType | undefined>(undefined)

export function CartSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CartSettings>(defaultSettings)

  useEffect(() => {
    // Load settings from localStorage or API
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('cart-settings')
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }
      } catch (error) {
        console.error('Failed to load cart settings:', error)
        // Keep default settings if localStorage fails
      }
    }
  }, [])

  const updateSettings = (newSettings: Partial<CartSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cart-settings', JSON.stringify({ ...settings, ...newSettings }))
      } catch (error) {
        console.error('Failed to save cart settings:', error)
      }
    }
  }

  const getText = (key: string, locale: 'en' | 'ar' = 'en'): string => {
    const keys = key.split('.')
    let value: any = settings
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value === 'string') {
      return value
    }
    
    // Fallback to English if Arabic not available
    if (locale === 'ar') {
      const enKey = key.replace('Ar', 'En')
      const enKeys = enKey.split('.')
      let enValue: any = settings
      
      for (const k of enKeys) {
        enValue = enValue?.[k]
      }
      
      return typeof enValue === 'string' ? enValue : key
    }
    
    return key
  }

  const getFreeShippingText = (remaining: number, locale: 'en' | 'ar' = 'en'): string => {
    const template = locale === 'ar' ? settings.freeShipping.copyAr : settings.freeShipping.copyEn
    return template.replace('{amount}', remaining.toFixed(2))
  }

  const getUnlockedText = (locale: 'en' | 'ar' = 'en'): string => {
    return locale === 'ar' ? settings.freeShipping.unlockedCopyAr : settings.freeShipping.unlockedCopyEn
  }

  return (
    <CartSettingsContext.Provider value={{
      settings,
      updateSettings,
      getText,
      getFreeShippingText,
      getUnlockedText
    }}>
      {children}
    </CartSettingsContext.Provider>
  )
}

export function useCartSettings() {
  const context = useContext(CartSettingsContext)
  if (context === undefined) {
    throw new Error('useCartSettings must be used within a CartSettingsProvider')
  }
  return context
}
