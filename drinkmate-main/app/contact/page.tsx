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
  MapPin
} from 'lucide-react'
import { toast } from 'sonner'

// Contact Option Card Component
function ContactOptionCard({ 
  icon: Icon, 
  title, 
  availability, 
  buttonText, 
  buttonAction, 
  status = 'available',
  disabled = false 
}: {
  icon: React.ElementType
  title: string
  availability: string
  buttonText: string
  buttonAction: () => void
  status?: 'available' | 'offline' | '24/7' | 'login-required'
  disabled?: boolean
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'offline': return 'bg-amber-100 text-amber-800'
      case '24/7': return 'bg-blue-100 text-blue-800'
      case 'login-required': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'available': return 'Live now'
      case 'offline': return 'Offline'
      case '24/7': return '24/7'
      case 'login-required': return 'Login required'
      default: return 'Available'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#12d6fa]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-[#12d6fa]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()} ml-2`}>
                {getStatusText()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{availability}</p>
          </div>
        </div>
      </div>
        
      <button
        onClick={buttonAction}
        disabled={disabled}
        className={`w-full h-12 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
          disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-40' 
            : status === 'login-required'
              ? 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md'
              : 'bg-[#12d6fa] hover:bg-[#0fb8d9] text-white hover:shadow-md'
        }`}
        title={disabled ? "Chat is available 9-5. You can still use WhatsApp or the form." : ""}
      >
        {buttonText}
      </button>
    </div>
  )
}

// FAQ Accordion Component
function FAQAccordion({ 
  category, 
  questions, 
  isExpanded, 
  onToggle 
}: {
  category: string
  questions: Array<{ q: string; a: string }>
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button 
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:ring-inset"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">{category}</h3>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="space-y-3 pt-3">
            {questions.slice(0, 3).map((faq, index) => (
              <div key={index} className="border-l-2 border-[#12d6fa]/20 pl-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">{faq.q}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
            {questions.length > 3 && (
              <div className="pt-2">
                <button className="text-xs text-[#12d6fa] hover:text-[#0fb8d9] font-medium">
                  View all {questions.length} questions →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Contact Form Component
function ContactForm() {
  const { settings, getText } = useContactSettings()
  const { user } = useAuth()
  const { isRTL } = useTranslation()
  const [formData, setFormData] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    reason: '',
    message: '',
    consent: false
  })
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [ticketId, setTicketId] = useState('')

  // Form validation
  const isFormValid = formData.name && formData.email && formData.message && formData.consent && formData.message.length >= 10

  const reasons = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'order', label: 'Order Related' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'refund', label: 'Refund Request' },
    { value: 'other', label: 'Other' }
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
      if (!formData.name || !formData.email || !formData.reason || !formData.message) {
        toast.error('Please fill in all required fields')
        return
      }

      if (!formData.consent) {
        toast.error('Please agree to the privacy policy and terms of service')
        return
      }

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
      <Card className="border-green-200 bg-green-50 shadow-lg">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            We've received your message — ticket DM-{ticketId}
          </h3>
          <p className="text-sm text-green-700 mb-4">
            We'll reply within 1 business day. A confirmation email has been sent.
          </p>
          <Button 
            onClick={() => setShowSuccess(false)} 
            variant="outline"
            className="rounded-xl border-green-300 text-green-700 hover:bg-green-100"
          >
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 bg-white shadow-lg">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Contact Form</CardTitle>
            <p className="text-gray-600">Send us a message anytime.</p>
          </div>
          {user && (
            <a 
              href="/account/support" 
              className="text-sm text-[#12d6fa] hover:text-[#0fb8d9] font-medium"
            >
              View my tickets
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-4 block">Reason for contact</Label>
            <div className="grid grid-cols-3 gap-2">
              {reasons.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => handleInputChange('reason', reason.value)}
                  className={`px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:ring-offset-2 ${
                    formData.reason === reason.value
                      ? 'border-[#12d6fa] bg-[#12d6fa] text-white shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-900 mb-2 block">
                Full name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="h-12 border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa] rounded-xl"
                required
              />
              {!formData.name && formData.name !== '' && (
                <p className="text-xs text-red-600 mt-1">Name is required</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-900 mb-2 block">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="h-12 border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa] rounded-xl"
                required
              />
              {!formData.email && formData.email !== '' && (
                <p className="text-xs text-red-600 mt-1">Valid email is required</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-900 mb-2 block">
              Phone (optional)
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              className="h-12 border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa] rounded-xl"
            />
            <p className="text-xs text-gray-500 mt-1">For faster follow-up</p>
          </div>

          <div>
            <Label htmlFor="message" className="text-sm font-medium text-gray-900 mb-2 block">
              Message *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Tell us how we can help you..."
              rows={6}
              className="min-h-[150px] border-gray-200 focus:border-[#12d6fa] focus:ring-[#12d6fa] rounded-xl"
              required
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">Minimum 10 characters</p>
              <p className="text-xs text-gray-400">{formData.message.length}/500</p>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Attachments (optional)
            </Label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-[#12d6fa] transition-colors">
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
                className="w-full h-12 rounded-xl border-gray-200 hover:border-[#12d6fa] hover:text-[#12d6fa]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload up to 3 files / 10MB total
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                (JPG, PNG, GIF, PDF)
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center bg-gray-50 px-3 py-2 rounded-xl text-sm">
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
              I agree to the{' '}
              <a href="/privacy-policy" className="text-[#12d6fa] hover:text-[#0fb8d9] underline">
                privacy policy
              </a>{' '}
              and{' '}
              <a href="/terms-of-service" className="text-[#12d6fa] hover:text-[#0fb8d9] underline">
                terms of service
              </a>
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="w-full h-12 rounded-xl bg-[#12d6fa] hover:bg-[#0fb8d9] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send message
              </>
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
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const handleWhatsAppClick = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'contact_whatsapp_click', {
        event_category: 'Contact',
        event_label: 'WhatsApp Contact'
      })
    }
    
    const message = encodeURIComponent("Hello! I need help with my order.")
    const url = `https://wa.me/966501234567?text=${message}`
    window.open(url, '_blank')
  }

  const handleEmailClick = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'contact_email_click', {
        event_category: 'Contact',
        event_label: 'Email Contact'
      })
    }
    
    const subject = encodeURIComponent('Support Request')
    const body = encodeURIComponent(`Hello,\n\nI need help with: ${user ? `Order #${user._id || user.username}` : 'my inquiry'}\n\n`)
    const url = `mailto:support@drinkmates.com?subject=${subject}&body=${body}`
    window.open(url)
  }

  const handleChatClick = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'contact_chat_click', {
        event_category: 'Contact',
        event_label: 'Live Chat Contact'
      })
    }
    
    if (!isAuthenticated) {
      // Show proper login prompt with return URL
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?returnUrl=${currentUrl}&reason=chat`
      return
    }
    
    if (!isChatOnline()) {
      const now = new Date()
      const serverTime = new Date(now.toLocaleString("en-US", { timeZone: chatStatus.timezone }))
      const currentTime = serverTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      const [startTime, endTime] = [chatStatus.workingHours.start, chatStatus.workingHours.end]
      
      alert(`Live chat is currently offline.\n\nCurrent time: ${currentTime}\nChat hours: ${startTime} - ${endTime}\n\nPlease use our contact form or email us.`)
      return
    }
    
    // Dispatch custom event to open the chat widget
    window.dispatchEvent(new CustomEvent('openChatWidget'))
  }


  const isChatOnline = () => {
    return chatStatus.isOnline
  }

  const faqCategories = [
    {
      id: 'orders',
      title: 'Orders & Delivery',
      questions: [
        { q: 'How long does delivery take?', a: 'Delivery typically takes 2-3 business days within Riyadh and 3-5 days for other cities.' },
        { q: 'Can I track my order?', a: 'Yes, you can track your order using the order number in our track order page.' },
        { q: 'What if my order is delayed?', a: 'We\'ll notify you immediately and provide updates on the new delivery timeline.' }
      ]
    },
    {
      id: 'refill',
      title: 'Refill & Exchange',
      questions: [
        { q: 'How do I refill my CO2 cylinder?', a: 'You can schedule a refill through our website or contact us directly.' },
        { q: 'What is the exchange process?', a: 'We\'ll pick up your empty cylinder and deliver a full one within 24 hours.' },
        { q: 'Is there a fee for cylinder exchange?', a: 'The first exchange is free. Subsequent exchanges have a small service fee.' }
      ]
    },
    {
      id: 'returns',
      title: 'Returns & Warranty',
      questions: [
        { q: 'What is your return policy?', a: 'We offer 30-day returns for unopened products in original packaging.' },
        { q: 'How do I return a product?', a: 'Contact our support team and we\'ll arrange pickup and processing.' },
        { q: 'What is covered under warranty?', a: 'All soda makers come with a 2-year warranty covering manufacturing defects.' }
      ]
    },
    {
      id: 'payment',
      title: 'Payment & Billing',
      questions: [
        { q: 'What payment methods do you accept?', a: 'We accept Mada, Visa, Mastercard, and American Express.' },
        { q: 'Is my payment information secure?', a: 'Yes, all payments are processed through secure, encrypted channels.' },
        { q: 'Can I pay in installments?', a: 'Yes, we offer installment plans for orders over 500 SAR.' }
      ]
    }
  ]

  return (
    <>
      <Banner />
      <Header currentPage="contact" />
      
      <main className="min-h-screen bg-surface-50">
        {/* Premium Hero Section */}
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

        {/* Main Content */}
        <section className="py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Desktop Layout - Fixed 3-Column Grid */}
            <div className="hidden lg:grid lg:grid-cols-[380px_1fr_400px] lg:gap-8">
              {/* Left Column - Contact Options */}
              <div className="sticky top-24 self-start">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Options</h2>
                <div className="space-y-6">
                  <ContactOptionCard
                    icon={MessageCircle}
                    title="WhatsApp"
                    availability="Typical replies 9–5"
                    buttonText="Chat on WhatsApp"
                    buttonAction={handleWhatsAppClick}
                    status="24/7"
                  />
                  
                  <ContactOptionCard
                    icon={Mail}
                    title="Email"
                    availability="We reply within 1 business day"
                    buttonText="Email support@drinkmates.com"
                    buttonAction={handleEmailClick}
                    status="available"
                  />
                  
                  <ContactOptionCard
                    icon={MessageCircle}
                    title="Live Chat"
                    availability={
                      !isAuthenticated 
                        ? "Login required to start chat" 
                        : isChatOnline() 
                          ? "Avg. reply ~2 min" 
                          : `Opens ${chatStatus.workingHours.start}`
                    }
                    buttonText={!isAuthenticated ? "Login to chat" : "Start live chat"}
                    buttonAction={handleChatClick}
                    status={!isAuthenticated ? "login-required" : isChatOnline() ? "available" : "offline"}
                    disabled={!isAuthenticated || !isChatOnline()}
                  />
                </div>
              </div>

              {/* Center Column - Contact Form */}
              <div className="sticky top-24 self-start">
                <ContactForm />
              </div>

              {/* Right Column - FAQ */}
              <div className="sticky top-24 self-start">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                
                {/* FAQ Search */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search our FAQ…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-0 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* FAQ Categories */}
                <div className="space-y-3">
                  {faqCategories.map((category) => (
                    <FAQAccordion
                      key={category.id}
                      category={category.title}
                      questions={category.questions}
                      isExpanded={expandedFAQ === category.id}
                      onToggle={() => setExpandedFAQ(expandedFAQ === category.id ? null : category.id)}
                    />
                  ))}
                  
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        // Scroll to form
                        document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="w-full h-12 bg-[#12d6fa] hover:bg-[#0fb8d9] text-white font-medium rounded-2xl transition-colors flex items-center justify-center"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Didn't find what you need?
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout - Single Column */}
            <div className="lg:hidden space-y-8">
              {/* Contact Options */}
              <div>
                <h2 className="dm-heading-2 mb-6">Contact Options</h2>
                <div className="space-y-4">
                  <ContactOptionCard
                    icon={MessageCircle}
                    title="WhatsApp"
                    availability="Available 24/7 • Typical replies 9–5"
                    buttonText="Chat on WhatsApp"
                    buttonAction={handleWhatsAppClick}
                    status="24/7"
                  />
                  
                  <ContactOptionCard
                    icon={Mail}
                    title="Email"
                    availability="We reply within 1 business day"
                    buttonText="support@drinkmates.com"
                    buttonAction={handleEmailClick}
                    status="available"
                  />
                  
                  <ContactOptionCard
                    icon={MessageCircle}
                    title="Live Chat"
                    availability={
                      !isAuthenticated 
                        ? "Login required to start chat" 
                        : isChatOnline() 
                          ? "Live now • Avg. reply ~2 min" 
                          : `Chat offline • Opens ${chatStatus.workingHours.start}`
                    }
                    buttonText={!isAuthenticated ? "Login to chat" : "Start live chat"}
                    buttonAction={handleChatClick}
                    status={!isAuthenticated ? "login-required" : isChatOnline() ? "available" : "offline"}
                    disabled={!isAuthenticated || !isChatOnline()}
                  />
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="dm-heading-2 mb-6">Frequently Asked Questions</h2>
                <div className="dm-card mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search our FAQ…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="dm-search w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {faqCategories.map((category) => (
                    <FAQAccordion
                      key={category.id}
                      category={category.title}
                      questions={category.questions}
                      isExpanded={expandedFAQ === category.id}
                      onToggle={() => setExpandedFAQ(expandedFAQ === category.id ? null : category.id)}
                    />
                  ))}
                  
                  <div className="text-center pt-4">
                    <button
                      onClick={() => {
                        const subject = encodeURIComponent('FAQ Question')
                        const body = encodeURIComponent('I couldn\'t find the answer to my question in the FAQ. Here\'s what I need help with:\n\n')
                        window.open(`mailto:support@drinkmates.com?subject=${subject}&body=${body}`)
                      }}
                      className="dm-btn px-8 py-3 dm-shine"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Didn't find what you need?
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <ContactForm />
            </div>
          </div>
        </section>

        {/* Maps Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Office</h2>
              <p className="text-lg text-gray-600">Come and see us in person</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Map */}
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="https://maps.googleapis.com/maps/api/staticmap?center=21.4858,39.1972&zoom=15&size=800x400&maptype=roadmap&markers=color:red%7Clabel:A%7C21.4858,39.1972&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dgsW6x8UfJzJzU"
                  alt="As Salamah, Jeddah Location Map"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#12d6fa] rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">As Salamah, Jeddah</h3>
                        <p className="text-sm text-gray-600">Saudi Arabia</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <a
                        href="https://maps.google.com/?q=As+Salamah,Jeddah,Saudi+Arabia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-[#12d6fa] text-white rounded-md hover:bg-[#0fb8d9] transition-colors text-sm"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Google Maps
                      </a>
                      <a
                        href="https://maps.apple.com/?q=As+Salamah,Jeddah,Saudi+Arabia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors text-sm"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Apple Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Office Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#12d6fa]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <MapPin className="h-4 w-4 text-[#12d6fa]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Address</p>
                        <p className="text-gray-600">As Salamah District<br />Jeddah, Saudi Arabia</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#12d6fa]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Clock className="h-4 w-4 text-[#12d6fa]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Business Hours</p>
                        <p className="text-gray-600">Sunday - Thursday: 9:00 AM - 6:00 PM<br />Friday - Saturday: Closed</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#12d6fa]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Phone className="h-4 w-4 text-[#12d6fa]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <p className="text-gray-600">+966 11 123 4567</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Directions</h3>
                  <p className="text-gray-600 mb-4">Use the map to get directions to our office or click the button below to open in your preferred maps app.</p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://maps.google.com/?q=As+Salamah,Jeddah,Saudi+Arabia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-[#12d6fa] text-white rounded-lg hover:bg-[#0fb8d9] transition-colors"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Google Maps
                    </a>
                    <a
                      href="https://maps.apple.com/?q=As+Salamah,Jeddah,Saudi+Arabia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Apple Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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