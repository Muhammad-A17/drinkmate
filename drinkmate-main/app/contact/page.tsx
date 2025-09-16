"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Banner from '@/components/layout/Banner'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ContactProvider, useContactSettings } from '@/lib/contact-settings-context'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/translation-context'
import { useChatStatus } from '@/lib/chat-status-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  MessageCircle, 
  Mail, 
  Search, 
  CheckCircle, 
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  Clock,
  Send,
  FileText,
  HelpCircle,
  MapPin,
  Users,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Sparkles,
  Globe,
  Headphones,
  MessageSquare,
  Calendar,
  Award,
  TrendingUp,
  Package,
  Settings,
  CreditCard,
  RefreshCw
} from 'lucide-react'
import AdvancedFAQ from '@/components/contact/AdvancedFAQ'
import ModernOfficeLocation from '@/components/contact/ModernOfficeLocation'
import MobileStickyContactBar from '@/components/contact/MobileStickyContactBar'
import { toast } from 'sonner'

// Original Hero Section Component
function OriginalHero({ isRTL }: { isRTL: boolean }) {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1757238970/background-6556413_1920_rlwos5.jpg"
          alt="Contact us background"
          fill
          className="object-cover scale-105"
          priority
        />
        {/* Clean Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      {/* Premium Content with Animations */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          
          {/* Main Heading with Premium Typography */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Get in Touch
            </h1>
          </div>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            We're here to help. Choose the best way to reach us.
          </p>
        </div>
      </div>
    </section>
  )
}

// Advanced Contact Channels Component
function AdvancedContactChannels({ isRTL, isAuthenticated, chatStatus }: { isRTL: boolean, isAuthenticated: boolean, chatStatus: any }) {
  const channels = [
    {
      id: 'whatsapp',
      icon: MessageCircle,
      title: 'WhatsApp',
      titleAr: 'واتساب',
      status: '24/7',
      statusAr: '24/7',
      statusColor: 'bg-green-100 text-green-800',
      meta: 'Instant replies • Available 24/7',
      metaAr: 'ردود فورية • متاح 24/7',
      cta: 'Start WhatsApp Chat',
      ctaAr: 'ابدأ محادثة واتساب',
      ctaColor: 'bg-green-600 hover:bg-green-700',
      href: 'https://wa.me/966501234567?text=Hello! I need help with my order.',
      disabled: false,
      features: ['Instant response', 'File sharing', 'Voice messages']
    },
    {
      id: 'email',
      icon: Mail,
      title: 'Email Support',
      titleAr: 'دعم البريد الإلكتروني',
      status: '24/7',
      statusAr: '24/7',
      statusColor: 'bg-blue-100 text-blue-800',
      meta: 'Detailed responses • Within 1 business day',
      metaAr: 'ردود مفصلة • خلال يوم عمل واحد',
      cta: 'Send Email',
      ctaAr: 'إرسال بريد إلكتروني',
      ctaColor: 'bg-blue-600 hover:bg-blue-700',
      href: 'mailto:support@drinkmates.com?subject=Support Request',
      disabled: false,
      features: ['Detailed responses', 'File attachments', 'Ticket tracking']
    },
    {
      id: 'chat',
      icon: Headphones,
      title: 'Live Chat',
      titleAr: 'الدردشة المباشرة',
      status: chatStatus?.isOnline ? 'Online' : 'Offline',
      statusAr: chatStatus?.isOnline ? 'متصل' : 'غير متصل',
      statusColor: chatStatus?.isOnline ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800',
      meta: chatStatus?.isOnline ? 'Live now • < 2 min response' : 'Opens 9:00 AM KSA',
      metaAr: chatStatus?.isOnline ? 'متصل الآن • أقل من دقيقتين' : 'يفتح 9:00 صباحاً',
      cta: chatStatus?.isOnline ? 'Start Live Chat' : 'Schedule Chat',
      ctaAr: chatStatus?.isOnline ? 'ابدأ الدردشة المباشرة' : 'جدولة دردشة',
      ctaColor: chatStatus?.isOnline ? 'bg-[#12d6fa] hover:bg-[#0fb8d9]' : 'bg-gray-400',
      href: chatStatus?.isOnline ? '/chat' : '#',
      disabled: !chatStatus?.isOnline,
      features: ['Real-time chat', 'Screen sharing', 'Co-browsing']
    },
    {
      id: 'phone',
      icon: Phone,
      title: 'Phone Support',
      titleAr: 'دعم الهاتف',
      status: '9AM-6PM',
      statusAr: '9ص-6م',
      statusColor: 'bg-purple-100 text-purple-800',
      meta: 'Direct call • Sunday-Thursday',
      metaAr: 'مكالمة مباشرة • الأحد-الخميس',
      cta: 'Call Now',
      ctaAr: 'اتصل الآن',
      ctaColor: 'bg-purple-600 hover:bg-purple-700',
      href: 'tel:+966501234567',
      disabled: false,
      features: ['Direct call', 'Immediate help', 'Personal assistance']
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`text-3xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
          {isRTL ? 'طرق التواصل' : 'Contact Channels'}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {isRTL 
            ? 'اختر الطريقة الأنسب لك للتواصل معنا' 
            : 'Choose the best way to reach us'
          }
        </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {channels.map((channel) => (
          <Card key={channel.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {/* Icon */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#12d6fa] to-[#0fb8d9] rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <channel.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${channel.statusColor}`}>
                      {isRTL ? channel.statusAr : channel.status}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                  {isRTL ? channel.titleAr : channel.title}
                </h3>

                {/* Meta */}
                <p className="text-sm text-gray-600">
                  {isRTL ? channel.metaAr : channel.meta}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {channel.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      {feature}
              </div>
            ))}
              </div>

                {/* CTA Button */}
                <Button
                  asChild
                  className={`w-full h-12 text-white font-medium rounded-xl transition-all duration-200 ${channel.ctaColor} ${
                    channel.disabled ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg hover:scale-105'
                  }`}
                  disabled={channel.disabled}
                >
                  <a href={channel.href}>
                    {isRTL ? channel.ctaAr : channel.cta}
                  </a>
                </Button>
          </div>
            </CardContent>
          </Card>
        ))}
        </div>
    </div>
  )
}

// Enhanced Contact Form Component
function EnhancedContactForm({ isRTL, user, isAuthenticated }: { isRTL: boolean, user: any, isAuthenticated: boolean }) {
  const [formData, setFormData] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    reason: '',
    priority: 'medium',
    message: '',
    consent: false
  })
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [ticketId, setTicketId] = useState('')

  const reasons = [
    { value: 'general', label: 'General Inquiry', labelAr: 'استفسار عام', icon: HelpCircle },
    { value: 'order', label: 'Order Support', labelAr: 'دعم الطلبات', icon: Package },
    { value: 'technical', label: 'Technical Support', labelAr: 'دعم فني', icon: Settings },
    { value: 'billing', label: 'Billing Question', labelAr: 'سؤال فواتير', icon: CreditCard },
    { value: 'refund', label: 'Refund Request', labelAr: 'طلب استرداد', icon: RefreshCw },
    { value: 'feedback', label: 'Feedback', labelAr: 'ملاحظات', icon: MessageSquare }
  ]

  const priorities = [
    { value: 'low', label: 'Low', labelAr: 'منخفض', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', labelAr: 'متوسط', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', labelAr: 'عالي', color: 'bg-red-100 text-red-800' },
    { value: 'urgent', label: 'Urgent', labelAr: 'عاجل', color: 'bg-purple-100 text-purple-800' }
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    
    if (files.length + newFiles.length > 3) {
      toast.error('Maximum 3 files allowed')
      return
    }

    const validFiles: File[] = []
    for (const file of newFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum 10MB allowed.')
        continue
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only JPG, PNG, GIF, and PDF allowed.')
        continue
      }
      
      validFiles.push(file)
    }

    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          attachments: files.map(file => ({
            name: file.name,
            url: URL.createObjectURL(file),
            type: file.type,
            size: file.size
          })),
          locale: isRTL ? 'ar' : 'en',
          source: 'contact_page'
        })
      })

      const result = await response.json()

      if (result.success) {
        setTicketId(result.ticketId)
        setShowSuccess(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          reason: '',
          priority: 'medium',
          message: '',
          consent: false
        })
        setFiles([])
      } else {
        toast.error(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-4">
            {isRTL ? 'تم إرسال رسالتك بنجاح!' : 'Message Sent Successfully!'}
          </h3>
          <p className="text-green-700 mb-6 text-lg">
            {isRTL 
              ? `شكراً لك! تم إنشاء التذكرة #${ticketId}. سنرد عليك خلال يوم عمل واحد.` 
              : `Thank you! We've created ticket #${ticketId}. We'll reply within 1 business day.`
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => setShowSuccess(false)} 
            variant="outline"
            className="rounded-xl border-green-300 text-green-700 hover:bg-green-100"
          >
              {isRTL ? 'إرسال رسالة أخرى' : 'Send Another Message'}
          </Button>
            <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
              <a href="/account/support">
                {isRTL ? 'تتبع التذكرة' : 'Track Ticket'}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#12d6fa] to-[#0fb8d9] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <CardTitle className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
            {isRTL ? 'نموذج التواصل' : 'Contact Form'}
          </CardTitle>
          <p className="text-gray-600 text-lg">
            {isRTL ? 'أخبرنا كيف يمكننا مساعدتك' : 'Tell us how we can help you'}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Reason Selection */}
          <div>
            <Label className={`text-lg font-semibold text-gray-900 mb-6 block ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {isRTL ? 'ما نوع المساعدة التي تحتاجها؟' : 'What kind of help do you need?'}
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {reasons.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => handleInputChange('reason', reason.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                    formData.reason === reason.value
                      ? 'border-[#12d6fa] bg-[#12d6fa]/10 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <reason.icon className={`h-5 w-5 ${
                      formData.reason === reason.value ? 'text-[#12d6fa]' : 'text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      formData.reason === reason.value ? 'text-[#12d6fa]' : 'text-gray-700'
                    }`}>
                      {isRTL ? reason.labelAr : reason.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <Label className={`text-lg font-semibold text-gray-900 mb-4 block ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {isRTL ? 'أولوية الطلب' : 'Request Priority'}
            </Label>
            <div className="flex flex-wrap gap-3">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange('priority', priority.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.priority === priority.value
                      ? priority.color + ' shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isRTL ? priority.labelAr : priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className={`text-sm font-semibold text-gray-900 mb-3 block ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                {isRTL ? 'الاسم الكامل' : 'Full Name'} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                className="h-12 border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa] rounded-xl text-lg"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className={`text-sm font-semibold text-gray-900 mb-3 block ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                {isRTL ? 'البريد الإلكتروني' : 'Email Address'} *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={isRTL ? 'example@email.com' : 'example@email.com'}
                className="h-12 border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa] rounded-xl text-lg"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className={`text-sm font-semibold text-gray-900 mb-3 block ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {isRTL ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={isRTL ? '+966 50 123 4567' : '+966 50 123 4567'}
              className="h-12 border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa] rounded-xl text-lg"
            />
          </div>

          <div>
            <Label htmlFor="message" className={`text-sm font-semibold text-gray-900 mb-3 block ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {isRTL ? 'رسالتك' : 'Your Message'} *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={isRTL ? 'اكتب رسالتك هنا... (10 أحرف على الأقل)' : 'Write your message here... (minimum 10 characters)'}
              rows={6}
              className="min-h-[150px] border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa] rounded-xl text-lg"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {isRTL ? 'الحد الأدنى 10 أحرف' : 'Minimum 10 characters'}
              </p>
              <p className="text-sm text-gray-400">{formData.message.length}/500</p>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label className={`text-sm font-semibold text-gray-900 mb-3 block ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {isRTL ? 'المرفقات (اختياري)' : 'Attachments (Optional)'}
            </Label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-[#12d6fa] transition-colors text-center">
              <input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                className="hidden"
                aria-label="File attachments upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('attachments')?.click()}
                className="h-12 px-6 rounded-xl border-gray-200 hover:border-[#12d6fa] hover:text-[#12d6fa] text-lg"
              >
                <Upload className="h-5 w-5 mr-2" />
                {isRTL ? 'رفع الملفات' : 'Upload Files'}
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                {isRTL ? 'الحد الأقصى 3 ملفات / 10 ميجابايت' : 'Maximum 3 files / 10MB total'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                (JPG, PNG, GIF, PDF)
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center bg-gray-50 px-4 py-2 rounded-xl text-sm">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-gray-400 hover:text-red-500 rounded-full p-1 hover:bg-red-50"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consent */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => handleInputChange('consent', checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
              {isRTL ? (
                <>
                  أوافق على{' '}
                  <a href="/privacy-policy" className="text-[#12d6fa] hover:text-[#0fb8d9] underline">
                    سياسة الخصوصية
                  </a>{' '}
                  و{' '}
                  <a href="/terms-of-service" className="text-[#12d6fa] hover:text-[#0fb8d9] underline">
                    شروط الخدمة
                  </a>
                </>
              ) : (
                <>
              I agree to the{' '}
              <a href="/privacy-policy" className="text-[#12d6fa] hover:text-[#0fb8d9] underline">
                privacy policy
              </a>{' '}
              and{' '}
              <a href="/terms-of-service" className="text-[#12d6fa] hover:text-[#0fb8d9] underline">
                terms of service
              </a>
                </>
              )}
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.email || !formData.message || !formData.consent}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#12d6fa] to-[#0fb8d9] hover:from-[#0fb8d9] hover:to-[#12d6fa] text-white font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                {isRTL ? 'جاري الإرسال...' : 'Sending...'}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Send className="h-5 w-5 mr-2" />
                {isRTL ? 'إرسال الرسالة' : 'Send Message'}
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Main Contact Page Component
function ContactPageContent() {
  const { settings, getText } = useContactSettings()
  const { user, isAuthenticated } = useAuth()
  const { isRTL } = useTranslation()
  const { chatStatus } = useChatStatus()

  return (
    <>
      <Banner />
      <Header currentPage="contact" />
      
      <main className="min-h-screen bg-surface-50">
        {/* Original Hero Section */}
        <OriginalHero isRTL={isRTL} />

        {/* Main Content */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Contact Channels */}
            <div className="mb-20">
              <AdvancedContactChannels isRTL={isRTL} isAuthenticated={isAuthenticated} chatStatus={chatStatus} />
            </div>

            {/* Contact Form */}
            <div className="max-w-4xl mx-auto mb-20">
              <EnhancedContactForm isRTL={isRTL} user={user} isAuthenticated={isAuthenticated} />
            </div>

            {/* FAQ Section */}
            <div className="mb-20" id="faq">
              <AdvancedFAQ isRTL={isRTL} />
            </div>
          </div>
        </section>

        {/* Office Location Section */}
        <ModernOfficeLocation />

        {/* Mobile Sticky Contact Bar */}
        <MobileStickyContactBar 
          isRTL={isRTL} 
          isAuthenticated={isAuthenticated} 
          chatStatus={chatStatus} 
        />
      </main>

      <Footer />
    </>
  )
}

// Main Export with Provider
export default function ContactPage() {
  return (
    <ContactProvider>
      <ContactPageContent />
    </ContactProvider>
  )
}