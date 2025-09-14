"use client"

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ContactFAQsProps {
  searchQuery: string
  isRTL: boolean
}

interface FAQItem {
  id: string
  question: string
  questionAr: string
  answer: string
  answerAr: string
  preview: string
  previewAr: string
}

interface FAQCategory {
  id: string
  title: string
  titleAr: string
  icon: string
  items: FAQItem[]
}

const faqCategories: FAQCategory[] = [
  {
    id: 'orders',
    title: 'Orders & Delivery',
    titleAr: 'الطلبات والتسليم',
    icon: '📦',
    items: [
      {
        id: 'track-order',
        question: 'How can I track my order?',
        questionAr: 'كيف يمكنني تتبع طلبي؟',
        answer: 'You can track your order by visiting the Track Order page and entering your order number and email address. You\'ll receive real-time updates on your order status.',
        answerAr: 'يمكنك تتبع طلبك بزيارة صفحة تتبع الطلب وإدخال رقم الطلب وعنوان البريد الإلكتروني. ستحصل على تحديثات فورية حول حالة طلبك.',
        preview: 'Track your order with order number and email...',
        previewAr: 'تتبع طلبك برقم الطلب والبريد الإلكتروني...'
      },
      {
        id: 'delivery-time',
        question: 'How long does delivery take?',
        questionAr: 'كم يستغرق التسليم؟',
        answer: 'Standard delivery takes 2-3 business days within major cities and 3-5 business days for other areas. Express delivery is available for an additional fee.',
        answerAr: 'التسليم العادي يستغرق 2-3 أيام عمل في المدن الكبرى و3-5 أيام عمل للمناطق الأخرى. التسليم السريع متاح مقابل رسوم إضافية.',
        preview: 'Standard delivery: 2-3 business days...',
        previewAr: 'التسليم العادي: 2-3 أيام عمل...'
      },
      {
        id: 'delivery-issues',
        question: 'What if my delivery is delayed?',
        questionAr: 'ماذا لو تأخر تسليم طلبي؟',
        answer: 'If your delivery is delayed, we\'ll notify you immediately and provide a new delivery date. You can also contact our support team for assistance.',
        answerAr: 'إذا تأخر تسليم طلبك، سنخطرك فوراً ونوفر تاريخ تسليم جديد. يمكنك أيضاً الاتصال بفريق الدعم للمساعدة.',
        preview: 'We\'ll notify you of delays and provide updates...',
        previewAr: 'سنخطرك بالتأخير ونوفر التحديثات...'
      }
    ]
  },
  {
    id: 'refill',
    title: 'Refill & Exchange',
    titleAr: 'إعادة التعبئة والاستبدال',
    icon: '🔄',
    items: [
      {
        id: 'cylinder-refill',
        question: 'How do I refill my CO₂ cylinder?',
        questionAr: 'كيف أعيد تعبئة أسطوانة ثاني أكسيد الكربون؟',
        answer: 'You can schedule a cylinder refill through our website or by calling our support team. We offer pickup and delivery services for your convenience.',
        answerAr: 'يمكنك جدولة إعادة تعبئة الأسطوانة عبر موقعنا أو بالاتصال بفريق الدعم. نقدم خدمات الاستلام والتسليم لراحتك.',
        preview: 'Schedule refills online or by phone...',
        previewAr: 'جدولة إعادة التعبئة عبر الإنترنت أو بالهاتف...'
      },
      {
        id: 'exchange-process',
        question: 'What is the exchange process?',
        questionAr: 'ما هي عملية الاستبدال؟',
        answer: 'Our exchange process is simple: schedule pickup, we collect your empty cylinder, and deliver a full one. The entire process takes 1-2 business days.',
        answerAr: 'عملية الاستبدال بسيطة: جدولة الاستلام، نجمع أسطوانتك الفارغة، ونوصل أسطوانة ممتلئة. العملية بأكملها تستغرق 1-2 أيام عمل.',
        preview: 'Simple 3-step process: schedule, collect, deliver...',
        previewAr: 'عملية من 3 خطوات: جدولة، جمع، تسليم...'
      }
    ]
  },
  {
    id: 'returns',
    title: 'Returns & Warranty',
    titleAr: 'الإرجاع والضمان',
    icon: '🛡️',
    items: [
      {
        id: 'return-policy',
        question: 'What is your return policy?',
        questionAr: 'ما هي سياسة الإرجاع؟',
        answer: 'We offer a 30-day return policy for unused items in original packaging. Returns are free and can be initiated through your account or by contacting support.',
        answerAr: 'نقدم سياسة إرجاع لمدة 30 يوماً للمنتجات غير المستخدمة في التغليف الأصلي. الإرجاع مجاني ويمكن بدؤه عبر حسابك أو بالاتصال بالدعم.',
        preview: '30-day return policy for unused items...',
        previewAr: 'سياسة إرجاع 30 يوماً للمنتجات غير المستخدمة...'
      },
      {
        id: 'warranty-coverage',
        question: 'What does the warranty cover?',
        questionAr: 'ماذا يغطي الضمان؟',
        answer: 'Our warranty covers manufacturing defects and material issues for 2 years from purchase date. Normal wear and tear are not covered.',
        answerAr: 'يغطي ضماننا عيوب التصنيع ومشاكل المواد لمدة سنتين من تاريخ الشراء. البلى الطبيعي غير مغطى.',
        preview: '2-year warranty for manufacturing defects...',
        previewAr: 'ضمان سنتين لعيوب التصنيع...'
      }
    ]
  },
  {
    id: 'billing',
    title: 'Payment & Billing',
    titleAr: 'الدفع والفواتير',
    icon: '💳',
    items: [
      {
        id: 'payment-methods',
        question: 'What payment methods do you accept?',
        questionAr: 'ما هي طرق الدفع المقبولة؟',
        answer: 'We accept all major credit cards, debit cards, Apple Pay, Google Pay, and bank transfers. All payments are processed securely.',
        answerAr: 'نقبل جميع بطاقات الائتمان الرئيسية، بطاقات الخصم، Apple Pay، Google Pay، والتحويلات المصرفية. جميع المدفوعات معالجة بأمان.',
        preview: 'Credit cards, Apple Pay, Google Pay, bank transfers...',
        previewAr: 'بطاقات الائتمان، Apple Pay، Google Pay، التحويلات المصرفية...'
      },
      {
        id: 'refund-process',
        question: 'How long do refunds take?',
        questionAr: 'كم يستغرق استرداد الأموال؟',
        answer: 'Refunds are processed within 3-5 business days after we receive your returned item. The refund will appear on your original payment method.',
        answerAr: 'يتم معالجة استرداد الأموال خلال 3-5 أيام عمل بعد استلام المنتج المرتجع. سيظهر الاسترداد على طريقة الدفع الأصلية.',
        preview: 'Refunds processed in 3-5 business days...',
        previewAr: 'يتم معالجة الاسترداد في 3-5 أيام عمل...'
      }
    ]
  },
  {
    id: 'account',
    title: 'Account',
    titleAr: 'الحساب',
    icon: '👤',
    items: [
      {
        id: 'password-reset',
        question: 'How do I reset my password?',
        questionAr: 'كيف أعيد تعيين كلمة المرور؟',
        answer: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions in the email we send you.',
        answerAr: 'انقر على "نسيت كلمة المرور" في صفحة تسجيل الدخول، أدخل بريدك الإلكتروني، واتبع التعليمات في البريد الذي نرسله لك.',
        preview: 'Use "Forgot Password" on login page...',
        previewAr: 'استخدم "نسيت كلمة المرور" في صفحة تسجيل الدخول...'
      },
      {
        id: 'update-profile',
        question: 'How do I update my profile?',
        questionAr: 'كيف أحدث ملفي الشخصي؟',
        answer: 'Go to your account settings, click "Edit Profile", make your changes, and save. Your changes will be applied immediately.',
        answerAr: 'اذهب إلى إعدادات حسابك، انقر على "تحرير الملف الشخصي"، أجرِ تغييراتك، واحفظ. ستُطبق تغييراتك فوراً.',
        preview: 'Go to account settings and click "Edit Profile"...',
        previewAr: 'اذهب إلى إعدادات الحساب وانقر على "تحرير الملف الشخصي"...'
      }
    ]
  },
  {
    id: 'safety',
    title: 'Sodamakers & CO₂ Safety',
    titleAr: 'صانعات الصودا وسلامة ثاني أكسيد الكربون',
    icon: '⚠️',
    items: [
      {
        id: 'co2-safety',
        question: 'How do I safely handle CO₂ cylinders?',
        questionAr: 'كيف أتعامل بأمان مع أسطوانات ثاني أكسيد الكربون؟',
        answer: 'Always store cylinders upright in a cool, dry place. Never expose to heat or direct sunlight. Check for leaks regularly and follow all safety instructions.',
        answerAr: 'احرص دائماً على تخزين الأسطوانات في وضع مستقيم في مكان بارد وجاف. لا تعرضها للحرارة أو أشعة الشمس المباشرة. تحقق من التسريبات بانتظام واتبع جميع تعليمات السلامة.',
        preview: 'Store upright, avoid heat, check for leaks...',
        previewAr: 'تخزين في وضع مستقيم، تجنب الحرارة، تحقق من التسريبات...'
      },
      {
        id: 'maintenance',
        question: 'How often should I clean my sodamaker?',
        questionAr: 'كم مرة يجب أن أنظف صانعة الصودا؟',
        answer: 'Clean your sodamaker after every use with warm soapy water. Deep clean monthly with vinegar solution. Always follow the manufacturer\'s instructions.',
        answerAr: 'نظف صانعة الصودا بعد كل استخدام بالماء الدافئ والصابون. نظف بعمق شهرياً بمحلول الخل. اتبع دائماً تعليمات الشركة المصنعة.',
        preview: 'Clean after each use, deep clean monthly...',
        previewAr: 'نظف بعد كل استخدام، نظف بعمق شهرياً...'
      }
    ]
  }
]

export default function ContactFAQs({ searchQuery, isRTL }: ContactFAQsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.questionAr.includes(searchQuery) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answerAr.includes(searchQuery)
    )
  })).filter(category => category.items.length > 0)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
    setExpandedItem(null)
  }

  const toggleItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <HelpCircle className="h-5 w-5 text-brand" />
        <h2 className={`text-xl font-bold text-gray-900 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
          {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h2>
      </div>

      {searchQuery && (
        <div className="text-sm text-gray-600">
          {isRTL ? 
            `تم العثور على ${filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)} نتيجة لـ "${searchQuery}"` :
            `Found ${filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)} results for "${searchQuery}"`
          }
        </div>
      )}

      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className={`font-semibold text-gray-900 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                      {isRTL ? category.titleAr : category.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.items.length} {isRTL ? 'مقال' : 'articles'}
                    </p>
                  </div>
                </div>
                {expandedCategory === category.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {expandedCategory === category.id && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div key={item.id} className="border-l-2 border-gray-200 pl-4">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full text-left hover:text-brand transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium text-gray-900 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                            {isRTL ? item.questionAr : item.question}
                          </h4>
                          {expandedItem === item.id ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {isRTL ? item.previewAr : item.preview}
                        </p>
                      </button>

                      {expandedItem === item.id && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <p className={`text-gray-700 leading-relaxed ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                            {isRTL ? item.answerAr : item.answer}
                          </p>
                          <Button
                            variant="link"
                            className="mt-2 p-0 h-auto text-brand hover:text-brand-dark"
                            onClick={() => {
                              // TODO: Navigate to full article
                              console.log('Navigate to full article:', item.id)
                            }}
                          >
                            {isRTL ? 'اقرأ المزيد' : 'Read more'} →
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && searchQuery && (
        <Card className="p-6 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isRTL ? 'لم نجد نتائج' : 'No results found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isRTL ? 
              'لم نجد أي مقالات تطابق بحثك. جرب كلمات مختلفة أو اتصل بنا للحصول على المساعدة.' :
              'We couldn\'t find any articles matching your search. Try different keywords or contact us for help.'
            }
          </p>
          <Button asChild>
            <a href="#contact-form">
              {isRTL ? 'اتصل بنا' : 'Contact Us'}
            </a>
          </Button>
        </Card>
      )}

      <div className="text-center pt-4">
        <p className="text-sm text-gray-600 mb-4">
          {isRTL ? 'لم تجد ما تحتاجه؟' : 'Didn\'t find what you need?'}
        </p>
        <Button asChild variant="outline">
          <a href="#contact-form">
            {isRTL ? 'اتصل بنا للحصول على المساعدة' : 'Contact us for help'}
          </a>
        </Button>
      </div>
    </div>
  )
}
