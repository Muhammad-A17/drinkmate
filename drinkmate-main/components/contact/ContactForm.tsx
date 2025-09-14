"use client"

import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MessageSquare, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface ContactFormProps {
  user: any
  isAuthenticated: boolean
  selectedTopic: string
  onTopicChange: (topic: string) => void
  isRTL: boolean
}

interface FormData {
  topic: string
  name: string
  email: string
  phone: string
  message: string
  orderNumber: string
  cylinders: string
  pickupQuestion: string
  city: string
  productModel: string
  purchaseDate: string
  preferredContact: string
  files: File[]
  consent: boolean
}

const topics = [
  {
    id: 'order',
    label: 'Order issue',
    labelAr: 'مشكلة في الطلب',
    description: 'Tracking, delivery, payment problems',
    descriptionAr: 'التتبع، التسليم، مشاكل الدفع'
  },
  {
    id: 'refill',
    label: 'Refill & Exchange',
    labelAr: 'إعادة التعبئة والاستبدال',
    description: 'CO₂ cylinder services',
    descriptionAr: 'خدمات أسطوانات ثاني أكسيد الكربون'
  },
  {
    id: 'warranty',
    label: 'Returns & Warranty',
    labelAr: 'الإرجاع والضمان',
    description: 'Product returns, warranty claims',
    descriptionAr: 'إرجاع المنتجات، مطالبات الضمان'
  },
  {
    id: 'advice',
    label: 'Product advice',
    labelAr: 'نصائح المنتج',
    description: 'Usage, maintenance, recommendations',
    descriptionAr: 'الاستخدام، الصيانة، التوصيات'
  },
  {
    id: 'other',
    label: 'Other',
    labelAr: 'أخرى',
    description: 'General inquiries',
    descriptionAr: 'استفسارات عامة'
  }
]

export default function ContactForm({ user, isAuthenticated, selectedTopic, onTopicChange, isRTL }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
    orderNumber: '',
    cylinders: '',
    pickupQuestion: '',
    city: '',
    productModel: '',
    purchaseDate: '',
    preferredContact: 'email',
    files: [],
    consent: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ticketId, setTicketId] = useState('')

  useEffect(() => {
    if (selectedTopic) {
      setFormData(prev => ({ ...prev, topic: selectedTopic }))
    }
  }, [selectedTopic])

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + formData.files.length > 3) {
      toast.error('Maximum 3 files allowed')
      return
    }
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    if (!formData.topic) {
      toast.error('Please select a topic')
      return false
    }
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return false
    }
    if (!formData.email.trim()) {
      toast.error('Email is required')
      return false
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      toast.error('Message must be at least 10 characters')
      return false
    }
    if (!formData.consent) {
      toast.error('Please accept the terms and conditions')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // TODO: Implement actual form submission
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setTicketId(result.ticketId)
        toast.success(`Thanks! Ticket #${result.ticketId} created. We'll reply within 1 business day.`)
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          message: '',
          orderNumber: '',
          cylinders: '',
          pickupQuestion: '',
          city: '',
          productModel: '',
          purchaseDate: '',
          files: [],
          consent: false
        }))
      } else {
        throw new Error('Failed to submit form')
      }
    } catch (error) {
      toast.error('Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getConditionalFields = () => {
    switch (formData.topic) {
      case 'order':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                value={formData.orderNumber}
                onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                placeholder="e.g., ORD-2024-001"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="preferredContact">Preferred Contact Method</Label>
              <RadioGroup
                value={formData.preferredContact}
                onValueChange={(value) => handleInputChange('preferredContact', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone" />
                  <Label htmlFor="phone">Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="whatsapp" />
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )
      
      case 'refill':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cylinders">Number of Cylinders</Label>
              <Input
                id="cylinders"
                type="number"
                value={formData.cylinders}
                onChange={(e) => handleInputChange('cylinders', e.target.value)}
                placeholder="e.g., 2"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="pickupQuestion">Pickup or Return Question</Label>
              <Textarea
                id="pickupQuestion"
                value={formData.pickupQuestion}
                onChange={(e) => handleInputChange('pickupQuestion', e.target.value)}
                placeholder="Describe your pickup/return needs..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g., Riyadh"
              />
            </div>
          </div>
        )
      
      case 'warranty':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="productModel">Product Model</Label>
              <Input
                id="productModel"
                value={formData.productModel}
                onChange={(e) => handleInputChange('productModel', e.target.value)}
                placeholder="e.g., Artic Black Soda Maker"
              />
            </div>
            <div>
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                dir="ltr"
              />
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (ticketId) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            {isRTL ? 'تم إرسال طلبك بنجاح!' : 'Request Submitted Successfully!'}
          </h3>
          <p className="text-green-700 mb-4">
            {isRTL ? `شكراً! تم إنشاء التذكرة #${ticketId}. سنرد خلال يوم عمل واحد.` : 
             `Thanks! We've created ticket #${ticketId}. We'll reply within 1 business day.`}
          </p>
          <div className="space-x-4">
            <Button asChild variant="outline">
              <a href="/track-order">
                {isRTL ? 'تتبع التذكرة' : 'Track my ticket'}
              </a>
            </Button>
            <Button onClick={() => setTicketId('')}>
              {isRTL ? 'إرسال طلب آخر' : 'Submit another request'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>{isRTL ? 'نموذج التواصل' : 'Contact Form'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Selection */}
          <div>
            <Label className="text-base font-medium">
              {isRTL ? 'ما نوع المساعدة التي تحتاجها؟' : 'What kind of help do you need?'}
            </Label>
            <RadioGroup
              value={formData.topic}
              onValueChange={(value) => {
                handleInputChange('topic', value)
                onTopicChange(value)
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3"
            >
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={topic.id} id={topic.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={topic.id} className="font-medium cursor-pointer">
                      {isRTL ? topic.labelAr : topic.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {isRTL ? topic.descriptionAr : topic.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Conditional Fields */}
          {formData.topic && getConditionalFields()}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">
                {isRTL ? 'الاسم الكامل' : 'Full Name'} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div>
              <Label htmlFor="email">
                {isRTL ? 'البريد الإلكتروني' : 'Email Address'} *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={isRTL ? 'example@email.com' : 'example@email.com'}
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">
              {isRTL ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={isRTL ? '+966 50 123 4567' : '+966 50 123 4567'}
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="message">
              {isRTL ? 'رسالتك' : 'Your Message'} *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={isRTL ? 'اكتب رسالتك هنا... (10 أحرف على الأقل)' : 'Write your message here... (minimum 10 characters)'}
              rows={5}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.message.length}/10 minimum characters
            </p>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="files">
              {isRTL ? 'المرفقات (اختياري)' : 'Attachments (Optional)'}
            </Label>
            <div className="mt-2">
              <Input
                id="files"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand/10 file:text-brand hover:file:bg-brand/20"
              />
              <p className="text-sm text-gray-500 mt-1">
                {isRTL ? 'الحد الأقصى 3 ملفات (صور، PDF، مستندات)' : 'Maximum 3 files (images, PDF, documents)'}
              </p>
            </div>
            
            {formData.files.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
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
              onCheckedChange={(checked) => handleInputChange('consent', checked)}
            />
            <Label htmlFor="consent" className="text-sm text-gray-600">
              {isRTL ? 
                'أوافق على شروط الخدمة وسياسة الخصوصية وأوافق على معالجة بياناتي الشخصية.' :
                'I agree to the Terms of Service and Privacy Policy and consent to the processing of my personal data.'
              }
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-brand hover:bg-brand-dark text-white font-medium"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isRTL ? 'جاري الإرسال...' : 'Submitting...'}</span>
              </div>
            ) : (
              isRTL ? 'إرسال الطلب' : 'Submit Request'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}