"use client"

import React, { useState } from 'react'
import Banner from '@/components/layout/Banner'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ContactProvider, useContactSettings } from '@/lib/contact-settings-context'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/translation-context'
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
  HelpCircle
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
  status?: 'available' | 'offline' | '24/7'
  disabled?: boolean
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'available': return 'bg-success-100 text-success-700'
      case 'offline': return 'bg-warning-100 text-warning-700'
      case '24/7': return 'bg-brand-100 text-brand-700'
      default: return 'bg-outline-200 text-ink-700'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'available': return 'Live now'
      case 'offline': return 'Offline'
      case '24/7': return '24/7'
      default: return 'Available'
    }
  }

  return (
    <div className="dm-card dm-card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="dm-icon-chip">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="dm-text-primary font-semibold mb-1">{title}</h3>
            <p className="dm-text-secondary leading-relaxed">{availability}</p>
          </div>
        </div>
        <div className={`dm-chip ${status === 'available' ? 'dm-chip--live' : status === '24/7' ? 'dm-chip--24-7' : 'dm-chip--closed'} flex-shrink-0`}>
          {getStatusText()}
        </div>
      </div>
      
      <button
        onClick={buttonAction}
        disabled={disabled}
        className={`dm-btn w-full dm-shine ${disabled ? 'dm-btn--disabled' : ''}`}
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
    <div className={`dm-accordion ${isExpanded ? 'dm-accordion--open' : ''}`}>
      <div 
        className="cursor-pointer p-5 hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <h3 className="dm-text-primary font-semibold">{category}</h3>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="pt-0 p-5 dm-fade-in dm-slide-up">
          <div className="space-y-4">
            {questions.map((faq, index) => (
              <div key={index} className="border-l-2 border-blue-100 pl-4">
                <h4 className="font-medium text-gray-900 mb-2">{faq.q}</h4>
                <p className="dm-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
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
      <Card className="border-success-200 bg-success-50">
        <CardContent className="p-card-padding text-center">
          <CheckCircle className="h-12 w-12 text-success-500 mx-auto mb-4" />
          <h3 className="text-h2 font-semibold text-success-800 mb-2">
            Thanks! We'll get back to you within 1 business day.
          </h3>
          <p className="text-secondary text-success-700 mb-4">
            Ticket ID: {ticketId}
          </p>
          <Button 
            onClick={() => setShowSuccess(false)} 
            variant="outline"
            className="rounded-pill"
          >
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-outline-200 bg-white">
      <CardHeader className="p-card-padding">
        <CardTitle className="text-h2 font-semibold text-ink-900">Contact form</CardTitle>
        <p className="text-secondary text-ink-700">Send us a message anytime.</p>
      </CardHeader>
      <CardContent className="p-card-padding">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason Selection */}
          <div>
            <Label className="text-body font-medium text-ink-900 mb-3 block">Reason for contact</Label>
            <RadioGroup
              value={formData.reason}
              onValueChange={(value) => handleInputChange('reason', value)}
              className="grid grid-cols-2 gap-2"
            >
              {reasons.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={reason.value} 
                    id={reason.value}
                    className="text-brand-500 border-outline-300"
                  />
                  <Label 
                    htmlFor={reason.value} 
                    className="text-body text-ink-700 cursor-pointer"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-body font-medium text-ink-900 mb-2 block">
                Full name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="h-12 border-outline-200 focus:border-brand-500 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-body font-medium text-ink-900 mb-2 block">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="h-12 border-outline-200 focus:border-brand-500 focus:ring-brand-500"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-body font-medium text-ink-900 mb-2 block">
              Phone (optional)
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              className="h-12 border-outline-200 focus:border-brand-500 focus:ring-brand-500"
            />
          </div>

          <div>
            <Label htmlFor="message" className="text-body font-medium text-ink-900 mb-2 block">
              Message *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Tell us how we can help you..."
              rows={5}
              className="min-h-[120px] border-outline-200 focus:border-brand-500 focus:ring-brand-500"
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <Label className="text-body font-medium text-ink-900 mb-2 block">
              Attachments (optional)
            </Label>
            <div className="border-2 border-dashed border-outline-200 rounded-soft p-4 hover:border-brand-300 transition-colors">
              <input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('attachments')?.click()}
                className="w-full h-12 rounded-pill border-outline-200 hover:border-brand-300"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload files (max 3 files, 10MB each)
              </Button>
              <p className="text-secondary text-ink-700 mt-2 text-center">
                JPG, PNG, GIF, PDF files only
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-surface-50 p-3 rounded-soft">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-ink-500" />
                      <span className="text-body text-ink-700">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0 text-ink-500 hover:text-danger-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
            <Label htmlFor="consent" className="text-body text-ink-700 leading-relaxed">
              I agree to the{' '}
              <a href="/privacy-policy" className="text-brand-500 hover:text-brand-600 underline">
                privacy policy
              </a>{' '}
              and{' '}
              <a href="/terms-of-service" className="text-brand-500 hover:text-brand-600 underline">
                terms of service
              </a>
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-pill bg-brand-500 hover:bg-brand-600 text-white font-medium"
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
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hello! I need help with my order.")
    const url = `https://wa.me/966501234567?text=${message}`
    window.open(url, '_blank')
  }

  const handleEmailClick = () => {
    const subject = encodeURIComponent('Support Request')
    const body = encodeURIComponent(`Hello,\n\nI need help with: ${user ? `Order #${user._id || user.username}` : 'my inquiry'}\n\n`)
    const url = `mailto:support@drinkmates.com?subject=${subject}&body=${body}`
    window.open(url)
  }

  const handleChatClick = () => {
    if (!isAuthenticated) {
      window.location.href = `/login?returnUrl=${encodeURIComponent('/contact?chat=1')}`
      return
    }
    
    if (!isChatOnline()) {
      // Show offline message or redirect to contact form
      alert('Live chat is currently offline. Please use our contact form or email us.')
      return
    }
    
    // The floating chat widget will handle the chat opening
    // This is just for the contact page button - the actual chat is handled by FloatingChatWidget
  }

  const isChatOnline = () => {
    const now = new Date()
    const currentHour = now.getHours()
    return currentHour >= 9 && currentHour < 17
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
        {/* Hero Section */}
        <section className="dm-hero">
          <div className="dm-wrap">
            <div className="text-center">
              <h1 className="dm-heading-1 mb-4">
                Get in touch
              </h1>
              <p className="dm-text-secondary text-base leading-6 max-w-2xl mx-auto">
                We're here to help. Choose the best way to reach us.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 lg:py-12">
          <div className="dm-wrap px-6">
            {/* Desktop Layout - Two Column Grid */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-6">
              {/* Left Column - Contact Options */}
              <div className="lg:col-span-5">
                <div className="sticky top-8">
                  <h2 className="dm-heading-2 mb-8">Contact Options</h2>
                  <div className="space-y-6">
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
                      buttonText="Email support@drinkmates.com"
                      buttonAction={handleEmailClick}
                      status="24/7"
                    />
                    
                    <ContactOptionCard
                      icon={MessageCircle}
                      title="Live Chat"
                      availability={isChatOnline() ? "Live now • Avg. reply ~2 min" : "Chat offline • Opens 09:00 AM"}
                      buttonText="Start live chat"
                      buttonAction={handleChatClick}
                      status={isChatOnline() ? "available" : "offline"}
                      disabled={!isAuthenticated || !isChatOnline()}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - FAQ */}
              <div className="lg:col-span-7">
                <h2 className="dm-heading-2 mb-8">Frequently Asked Questions</h2>
                
                {/* FAQ Search */}
                <div className="dm-card mb-8">
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

                {/* FAQ Categories */}
                <div className="space-y-6">
                  {faqCategories.map((category) => (
                    <FAQAccordion
                      key={category.id}
                      category={category.title}
                      questions={category.questions}
                      isExpanded={expandedFAQ === category.id}
                      onToggle={() => setExpandedFAQ(expandedFAQ === category.id ? null : category.id)}
                    />
                  ))}
                  
                  <div className="text-center pt-6">
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
                    buttonText="Email support@drinkmates.com"
                    buttonAction={handleEmailClick}
                    status="24/7"
                  />
                  
                  <ContactOptionCard
                    icon={MessageCircle}
                    title="Live Chat"
                    availability={isChatOnline() ? "Live now • Avg. reply ~2 min" : "Chat offline • Opens 09:00 AM"}
                    buttonText="Start live chat"
                    buttonAction={handleChatClick}
                    status={isChatOnline() ? "available" : "offline"}
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