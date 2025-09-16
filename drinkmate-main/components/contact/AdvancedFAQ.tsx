"use client"

import React, { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp, HelpCircle, Clock, MessageCircle, Star, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface FAQItem {
  id: string
  question: string
  questionAr: string
  answer: string
  answerAr: string
  category: string
  categoryAr: string
  helpful: number
  views: number
  lastUpdated: string
}

interface AdvancedFAQProps {
  isRTL: boolean
}

const faqData: FAQItem[] = [
  {
    id: 'delivery-time',
    question: 'How long does delivery take?',
    questionAr: 'كم يستغرق التسليم؟',
    answer: 'Delivery typically takes 2-3 business days within Riyadh and 3-5 days for other cities. We also offer same-day delivery for orders placed before 2 PM in Riyadh.',
    answerAr: 'يستغرق التسليم عادة 2-3 أيام عمل داخل الرياض و 3-5 أيام للمدن الأخرى. نقدم أيضاً تسليم في نفس اليوم للطلبات المقدمة قبل الساعة 2 مساءً في الرياض.',
    category: 'orders',
    categoryAr: 'الطلبات',
    helpful: 45,
    views: 1200,
    lastUpdated: '2024-01-15'
  },
  {
    id: 'track-order',
    question: 'How can I track my order?',
    questionAr: 'كيف يمكنني تتبع طلبي؟',
    answer: 'You can track your order using the order number in our track order page. We also send SMS updates at each stage of the delivery process.',
    answerAr: 'يمكنك تتبع طلبك باستخدام رقم الطلب في صفحة تتبع الطلبات. نرسل أيضاً تحديثات SMS في كل مرحلة من مراحل عملية التسليم.',
    category: 'orders',
    categoryAr: 'الطلبات',
    helpful: 38,
    views: 980,
    lastUpdated: '2024-01-10'
  },
  {
    id: 'refill-process',
    question: 'How do I refill my CO2 cylinder?',
    questionAr: 'كيف أقوم بإعادة تعبئة أسطوانة ثاني أكسيد الكربون؟',
    answer: 'You can schedule a refill through our website or contact us directly. We offer pickup and delivery service for cylinder refills. The process takes 24-48 hours.',
    answerAr: 'يمكنك جدولة إعادة التعبئة من خلال موقعنا أو الاتصال بنا مباشرة. نقدم خدمة الاستلام والتسليم لإعادة تعبئة الأسطوانات. تستغرق العملية 24-48 ساعة.',
    category: 'refill',
    categoryAr: 'إعادة التعبئة',
    helpful: 52,
    views: 1500,
    lastUpdated: '2024-01-20'
  },
  {
    id: 'return-policy',
    question: 'What is your return policy?',
    questionAr: 'ما هي سياسة الإرجاع؟',
    answer: 'We offer 30-day returns for unopened products in original packaging. For opened products, we offer exchanges within 14 days if there are manufacturing defects.',
    answerAr: 'نقدم إرجاع لمدة 30 يوماً للمنتجات غير المفتوحة في العبوة الأصلية. للمنتجات المفتوحة، نقدم استبدال خلال 14 يوماً إذا كان هناك عيوب في التصنيع.',
    category: 'returns',
    categoryAr: 'الإرجاع',
    helpful: 41,
    views: 1100,
    lastUpdated: '2024-01-12'
  },
  {
    id: 'warranty-coverage',
    question: 'What is covered under warranty?',
    questionAr: 'ما الذي يشمله الضمان؟',
    answer: 'All soda makers come with a 2-year warranty covering manufacturing defects. This includes motor issues, seal problems, and electrical components. Normal wear and tear is not covered.',
    answerAr: 'جميع صانعات الصودا تأتي مع ضمان لمدة سنتين يغطي عيوب التصنيع. يشمل هذا مشاكل المحرك ومشاكل الأختام والمكونات الكهربائية. البلى الطبيعي غير مشمول.',
    category: 'warranty',
    categoryAr: 'الضمان',
    helpful: 35,
    views: 850,
    lastUpdated: '2024-01-08'
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    questionAr: 'ما هي طرق الدفع المقبولة؟',
    answer: 'We accept Mada, Visa, Mastercard, American Express, and Apple Pay. All payments are processed through secure, encrypted channels for your protection.',
    answerAr: 'نقبل مدى، فيزا، ماستركارد، أمريكان إكسبريس، وآبل باي. جميع المدفوعات تتم معالجتها عبر قنوات آمنة ومشفرة لحمايتك.',
    category: 'payment',
    categoryAr: 'الدفع',
    helpful: 28,
    views: 750,
    lastUpdated: '2024-01-05'
  },
  {
    id: 'cylinder-exchange',
    question: 'Is there a fee for cylinder exchange?',
    questionAr: 'هل هناك رسوم لاستبدال الأسطوانة؟',
    answer: 'The first exchange is free. Subsequent exchanges have a small service fee of 25 SAR. This covers pickup, refill, and delivery costs.',
    answerAr: 'الاستبدال الأول مجاني. الاستبدالات اللاحقة لها رسوم خدمة صغيرة 25 ريال. هذا يغطي تكاليف الاستلام وإعادة التعبئة والتسليم.',
    category: 'refill',
    categoryAr: 'إعادة التعبئة',
    helpful: 33,
    views: 920,
    lastUpdated: '2024-01-18'
  },
  {
    id: 'installation-help',
    question: 'Do you provide installation help?',
    questionAr: 'هل تقدمون مساعدة في التثبيت؟',
    answer: 'Yes, we provide free installation service for all soda makers. Our technician will visit your home and set up everything for you. This service is available in major cities.',
    answerAr: 'نعم، نقدم خدمة تثبيت مجانية لجميع صانعات الصودا. سيزور فني منا منزلك ويقوم بإعداد كل شيء لك. هذه الخدمة متاحة في المدن الكبرى.',
    category: 'support',
    categoryAr: 'الدعم',
    helpful: 47,
    views: 1300,
    lastUpdated: '2024-01-22'
  }
]

const categories = [
  { id: 'all', name: 'All Categories', nameAr: 'جميع الفئات', count: faqData.length },
  { id: 'orders', name: 'Orders & Delivery', nameAr: 'الطلبات والتسليم', count: faqData.filter(item => item.category === 'orders').length },
  { id: 'refill', name: 'Refill & Exchange', nameAr: 'إعادة التعبئة والاستبدال', count: faqData.filter(item => item.category === 'refill').length },
  { id: 'returns', name: 'Returns & Warranty', nameAr: 'الإرجاع والضمان', count: faqData.filter(item => item.category === 'returns' || item.category === 'warranty').length },
  { id: 'payment', name: 'Payment & Billing', nameAr: 'الدفع والفواتير', count: faqData.filter(item => item.category === 'payment').length },
  { id: 'support', name: 'Support & Service', nameAr: 'الدعم والخدمة', count: faqData.filter(item => item.category === 'support').length }
]

export default function AdvancedFAQ({ isRTL }: AdvancedFAQProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'views'>('helpful')
  const filteredFAQs = useMemo(() => {
    let filtered = faqData

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.questionAr.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.answerAr.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case 'helpful':
          return b.helpful - a.helpful
        case 'views':
          return b.views - a.views
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, selectedCategory, sortBy])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className={`text-3xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
          {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {isRTL 
            ? 'ابحث عن إجابات لأسئلتك الشائعة أو استكشف مواضيع مختلفة' 
            : 'Find answers to your common questions or explore different topics'
          }
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder={isRTL ? 'ابحث في الأسئلة الشائعة...' : 'Search FAQs...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-2 focus:ring-[#12d6fa]/20 rounded-xl"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-[#12d6fa] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRTL ? category.nameAr : category.name}
              <span className="ml-2 text-xs opacity-75">({category.count})</span>
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex justify-center">
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4 mr-1" />
              {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
            </Button>
          </div>
        )}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {isRTL ? 'لم نجد نتائج' : 'No results found'}
            </h3>
            <p className="text-gray-500">
              {isRTL 
                ? 'جرب البحث بكلمات مختلفة أو امسح الفلاتر' 
                : 'Try searching with different words or clear the filters'
              }
            </p>
          </div>
        ) : (
          filteredFAQs.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:ring-inset rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                        {isRTL ? item.questionAr : item.question}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>{item.helpful} {isRTL ? 'مفيد' : 'helpful'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{item.views} {isRTL ? 'مشاهدة' : 'views'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(item.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>

                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      {expandedItems.has(item.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedItems.has(item.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {isRTL ? item.answerAr : item.answer}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#12d6fa] transition-colors">
                          <Star className="h-4 w-4" />
                          {isRTL ? 'مفيد' : 'Helpful'}
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#12d6fa] transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          {isRTL ? 'تعليق' : 'Comment'}
                        </button>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {isRTL ? categories.find(c => c.id === item.category)?.nameAr : categories.find(c => c.id === item.category)?.name}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  )
}
