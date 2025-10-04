"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ContactSettings {
  businessHours: string
  responseTime: string
  autoReply: string
  notificationEmail: string
  maxConcurrentChats: number
  whatsapp: {
    enabled: boolean
    number: string
    messageTemplate: string
    utmParams: string
  }
  email: {
    enabled: boolean
    address: string
    subject: string
    slaText: string
  }
  chat: {
    enabled: boolean
    hours: {
      start: string
      end: string
      timezone: string
    }
    holidays: string[]
    closedDays: string[]
  }
  form: {
    enabled: boolean
    requiredFields: string[]
    maxAttachments: number
    maxFileSize: number // MB
    allowedFileTypes: string[]
    askOrderNumber: string[]
  }
  stickyBar: {
    enabled: boolean
  }
  copy: {
    [key: string]: {
      en: string
      ar: string
    }
  }
}

const defaultSettings: ContactSettings = {
  businessHours: '9:00 AM - 5:00 PM (GMT+3)',
  responseTime: 'Within 1 business day',
  autoReply: 'Thank you for contacting us. We will get back to you soon.',
  notificationEmail: 'admin@drinkmates.com',
  maxConcurrentChats: parseInt(process.env.NEXT_PUBLIC_MAX_CONCURRENT_CHATS) || 10,
  whatsapp: {
    enabled: true,
    number: '+966501234567',
    messageTemplate: 'Hello! I need help with my order.',
    utmParams: '?utm_source=contact&utm_medium=whatsapp'
  },
  email: {
    enabled: true,
    address: 'support@drinkmates.com',
    subject: 'Contact Form Submission',
    slaText: 'We reply within 1 business day'
  },
  chat: {
    enabled: true,
    hours: {
      start: '09:00',
      end: '17:00',
      timezone: 'Asia/Riyadh'
    },
    holidays: [],
    closedDays: []
  },
  form: {
    enabled: true,
    requiredFields: ['name', 'email', 'reason', 'message'],
    maxAttachments: 3,
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) || 10,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
    askOrderNumber: ['order', 'billing', 'refund']
  },
  stickyBar: {
    enabled: true
  },
  copy: {
    'page.title': {
      en: 'Get in Touch',
      ar: 'تواصل معنا'
    },
    'page.subtitle': {
      en: 'We\'re here to help! Choose the best way to reach us.',
      ar: 'نحن هنا لمساعدتك! اختر أفضل طريقة للتواصل معنا.'
    },
    'page.leftTitle': {
      en: 'Need Help?',
      ar: 'تحتاج مساعدة؟'
    },
    'page.leftDescription': {
      en: 'Our support team is ready to assist you with any questions or concerns.',
      ar: 'فريق الدعم لدينا جاهز لمساعدتك في أي أسئلة أو مخاوف.'
    },
    'page.faqLink': {
      en: 'View FAQ',
      ar: 'عرض الأسئلة الشائعة'
    },
    'whatsapp.title': {
      en: 'WhatsApp',
      ar: 'واتساب'
    },
    'whatsapp.subtitle': {
      en: 'Available 24/7 • Typical replies 9–5',
      ar: 'متاح 24/7 • الردود النموذجية 9-5'
    },
    'whatsapp.button': {
      en: 'Chat on WhatsApp',
      ar: 'تحدث عبر واتساب'
    },
    'whatsapp.helper': {
      en: 'Replies 9–5; leave a message anytime',
      ar: 'الردود 9-5؛ اترك رسالة في أي وقت'
    },
    'email.title': {
      en: 'Email',
      ar: 'البريد الإلكتروني'
    },
    'email.subtitle': {
      en: 'We reply within 1 business day',
      ar: 'نرد خلال يوم عمل واحد'
    },
    'email.button': {
      en: 'Email support@drinkmates.com',
      ar: 'بريد support@drinkmates.com'
    },
    'email.helper': {
      en: 'We reply within 1 business day',
      ar: 'نرد خلال يوم عمل واحد'
    },
    'email.subject': {
      en: 'Contact Form Submission',
      ar: 'إرسال نموذج الاتصال'
    },
    'chat.title': {
      en: 'Live Chat',
      ar: 'الدردشة المباشرة'
    },
    'chat.subtitle': {
      en: 'Instant help during 9–5 (login required)',
      ar: 'مساعدة فورية خلال 9-5 (يتطلب تسجيل الدخول)'
    },
    'chat.startButton': {
      en: 'Start Chat',
      ar: 'بدء الدردشة'
    },
    'chat.signInButton': {
      en: 'Sign in to chat',
      ar: 'سجل الدخول للدردشة'
    },
    'chat.offlineButton': {
      en: 'Chat offline',
      ar: 'الدردشة غير متاحة'
    },
    'chat.helper': {
      en: 'Instant help during 9–5 (login required)',
      ar: 'مساعدة فورية خلال 9-5 (يتطلب تسجيل الدخول)'
    },
    'chat.onlineStatus': {
      en: 'Online now',
      ar: 'متصل الآن'
    },
    'chat.opensAt': {
      en: 'Opens {time}',
      ar: 'يفتح في {time}'
    },
    'chat.loading': {
      en: 'Loading chat...',
      ar: 'جاري تحميل الدردشة...'
    },
    'form.title': {
      en: 'Contact Form',
      ar: 'نموذج الاتصال'
    },
    'form.subtitle': {
      en: 'Send us a message anytime',
      ar: 'أرسل لنا رسالة في أي وقت'
    },
    'form.button': {
      en: 'Send Message',
      ar: 'إرسال الرسالة'
    },
    'form.helper': {
      en: 'We\'ll get back to you within 1 business day',
      ar: 'سنتواصل معك خلال يوم عمل واحد'
    },
    'form.fields.name': {
      en: 'Full Name',
      ar: 'الاسم الكامل'
    },
    'form.fields.email': {
      en: 'Email Address',
      ar: 'عنوان البريد الإلكتروني'
    },
    'form.fields.phone': {
      en: 'Phone Number',
      ar: 'رقم الهاتف'
    },
    'form.fields.reason': {
      en: 'Reason for Contact',
      ar: 'سبب التواصل'
    },
    'form.fields.orderNumber': {
      en: 'Order Number',
      ar: 'رقم الطلب'
    },
    'form.fields.message': {
      en: 'Message',
      ar: 'الرسالة'
    },
    'form.fields.attachments': {
      en: 'Attachments (Optional)',
      ar: 'المرفقات (اختياري)'
    },
    'form.placeholders.name': {
      en: 'Enter your full name',
      ar: 'أدخل اسمك الكامل'
    },
    'form.placeholders.email': {
      en: 'Enter your email address',
      ar: 'أدخل عنوان بريدك الإلكتروني'
    },
    'form.placeholders.phone': {
      en: 'Enter your phone number',
      ar: 'أدخل رقم هاتفك'
    },
    'form.placeholders.reason': {
      en: 'Select a reason',
      ar: 'اختر سبب'
    },
    'form.placeholders.orderNumber': {
      en: 'Enter your order number',
      ar: 'أدخل رقم طلبك'
    },
    'form.placeholders.message': {
      en: 'Tell us how we can help you...',
      ar: 'أخبرنا كيف يمكننا مساعدتك...'
    },
    'form.reasons.general': {
      en: 'General Inquiry',
      ar: 'استفسار عام'
    },
    'form.reasons.order': {
      en: 'Order Related',
      ar: 'متعلق بالطلب'
    },
    'form.reasons.technical': {
      en: 'Technical Support',
      ar: 'الدعم الفني'
    },
    'form.reasons.billing': {
      en: 'Billing Question',
      ar: 'سؤال الفواتير'
    },
    'form.reasons.refund': {
      en: 'Refund Request',
      ar: 'طلب استرداد'
    },
    'form.reasons.other': {
      en: 'Other',
      ar: 'أخرى'
    },
    'form.uploadFiles': {
      en: 'Upload Files',
      ar: 'رفع الملفات'
    },
    'form.fileRequirements': {
      en: 'Max {maxFiles} files, {maxSize}MB each. Types: {types}',
      ar: 'حد أقصى {maxFiles} ملفات، {maxSize} ميجابايت لكل ملف. الأنواع: {types}'
    },
    'form.consent': {
      en: 'I agree to the privacy policy and terms of service',
      ar: 'أوافق على سياسة الخصوصية وشروط الخدمة'
    },
    'form.submit': {
      en: 'Send Message',
      ar: 'إرسال الرسالة'
    },
    'form.submitting': {
      en: 'Sending...',
      ar: 'جاري الإرسال...'
    },
    'form.success.title': {
      en: 'Message Sent Successfully!',
      ar: 'تم إرسال الرسالة بنجاح!'
    },
    'form.success.description': {
      en: 'Your ticket ID is: {ticketId}',
      ar: 'رقم التذكرة الخاص بك هو: {ticketId}'
    },
    'form.success.message': {
      en: 'Thank you! We\'ll get back to you soon.',
      ar: 'شكراً لك! سنتواصل معك قريباً.'
    },
    'form.success.whatsappSuggestion': {
      en: 'For urgent issues, try WhatsApp for faster response.',
      ar: 'للحالات العاجلة، جرب واتساب للحصول على رد أسرع.'
    },
    'form.success.emailConfirmation': {
      en: 'We\'ve sent a confirmation email to your inbox.',
      ar: 'لقد أرسلنا بريد تأكيد إلى صندوق الوارد الخاص بك.'
    },
    'form.errors.nameRequired': {
      en: 'Name is required',
      ar: 'الاسم مطلوب'
    },
    'form.errors.emailRequired': {
      en: 'Email is required',
      ar: 'البريد الإلكتروني مطلوب'
    },
    'form.errors.invalidEmail': {
      en: 'Please enter a valid email address',
      ar: 'يرجى إدخال عنوان بريد إلكتروني صحيح'
    },
    'form.errors.reasonRequired': {
      en: 'Please select a reason',
      ar: 'يرجى اختيار سبب'
    },
    'form.errors.orderNumberRequired': {
      en: 'Order number is required for this reason',
      ar: 'رقم الطلب مطلوب لهذا السبب'
    },
    'form.errors.messageRequired': {
      en: 'Message is required',
      ar: 'الرسالة مطلوبة'
    },
    'form.errors.consentRequired': {
      en: 'Please accept the terms and conditions',
      ar: 'يرجى قبول الشروط والأحكام'
    },
    'form.errors.fileTooLarge': {
      en: 'File size must be less than {size}MB',
      ar: 'يجب أن يكون حجم الملف أقل من {size} ميجابايت'
    },
    'form.errors.invalidFileType': {
      en: 'Invalid file type',
      ar: 'نوع ملف غير صحيح'
    },
    'form.errors.tooManyFiles': {
      en: 'Maximum {max} files allowed',
      ar: 'الحد الأقصى {max} ملفات مسموح'
    },
    'form.errors.submissionFailed': {
      en: 'Failed to send message. Please try again.',
      ar: 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.'
    },
    'sticky.whatsapp': {
      en: 'WhatsApp',
      ar: 'واتساب'
    },
    'sticky.email': {
      en: 'Email',
      ar: 'بريد'
    },
    'sticky.chat': {
      en: 'Chat',
      ar: 'دردشة'
    }
  }
}

interface ContactSettingsContextType {
  settings: ContactSettings
  updateSettings: (newSettings: Partial<ContactSettings>) => void
  getText: (key: string, params?: Record<string, string>) => string
}

const ContactSettingsContext = createContext<ContactSettingsContextType | undefined>(undefined)

export function ContactProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings)

  useEffect(() => {
    // Load settings from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('contact-settings')
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          setSettings(prev => ({ ...prev, ...parsed }))
        }
      } catch (error) {
      }
    }
  }, [])

  const updateSettings = (newSettings: Partial<ContactSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('contact-settings', JSON.stringify({ ...settings, ...newSettings }))
      } catch (error) {
      }
    }
  }

  const getText = (key: string, params?: Record<string, string>, isRTL?: boolean): string => {
    const locale = isRTL ? 'ar' : 'en'
    
    const text = settings.copy[key]?.[locale] || settings.copy[key]?.en || key
    
    if (params) {
      return text.replace(/\{(\w+)\}/g, (match, param) => params[param] || match)
    }
    
    return text
  }

  return (
    <ContactSettingsContext.Provider value={{ settings, updateSettings, getText }}>
      {children}
    </ContactSettingsContext.Provider>
  )
}

export function useContactSettings() {
  const context = useContext(ContactSettingsContext)
  if (context === undefined) {
    throw new Error('useContactSettings must be used within a ContactProvider')
  }
  return context
}
