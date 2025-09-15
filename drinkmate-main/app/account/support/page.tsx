'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'
import { SupportTicket, ChatThread } from '@/types/account'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageCircle, Plus, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SupportPage() {
  const { language, isRTL } = useTranslation()
  const [activeTab, setActiveTab] = useState<'tickets' | 'chats'>('tickets')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [chats, setChats] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: '',
    priority: 'medium',
    message: ''
  })

  // Mock data - replace with actual API call
  const mockTickets: SupportTicket[] = [
    {
      id: '1',
      subject: 'Order delivery issue',
      status: 'open',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
      lastMessage: 'Thank you for your patience. We are looking into this issue.'
    },
    {
      id: '2',
      subject: 'Product question',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-12T16:45:00Z',
      lastMessage: 'Issue has been resolved. Thank you for contacting us.'
    }
  ]

  const mockChats: ChatThread[] = [
    {
      id: '1',
      subject: 'General inquiry',
      status: 'active',
      lastMessage: 'How can I track my order?',
      lastMessageAt: '2024-01-15T14:30:00Z',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      subject: 'Technical support',
      status: 'closed',
      lastMessage: 'Thank you for your help!',
      lastMessageAt: '2024-01-12T16:00:00Z',
      createdAt: '2024-01-12T14:00:00Z'
    }
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTickets(mockTickets)
      setChats(mockChats)
      setLoading(false)
    }

    fetchData()
  }, [])

  const getStatusLabel = (status: string) => {
    const statusMap = {
      open: { en: 'Open', ar: 'مفتوح' },
      pending: { en: 'Pending', ar: 'معلق' },
      resolved: { en: 'Resolved', ar: 'محلول' },
      closed: { en: 'Closed', ar: 'مغلق' },
      active: { en: 'Active', ar: 'نشط' }
    }
    return statusMap[status as keyof typeof statusMap] || { en: status, ar: status }
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      open: 'bg-red-100 text-red-800',
      pending: 'bg-amber-100 text-amber-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      active: 'bg-blue-100 text-blue-800'
    }
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityLabel = (priority: string) => {
    const priorityMap = {
      low: { en: 'Low', ar: 'منخفض' },
      medium: { en: 'Medium', ar: 'متوسط' },
      high: { en: 'High', ar: 'عالي' }
    }
    return priorityMap[priority as keyof typeof priorityMap] || { en: priority, ar: priority }
  }

  const getPriorityColor = (priority: string) => {
    const colorMap = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-amber-100 text-amber-800',
      high: 'bg-red-100 text-red-800'
    }
    return colorMap[priority as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCreateTicket = () => {
    if (newTicket.subject && newTicket.message) {
      const ticket: SupportTicket = {
        id: Date.now().toString(),
        subject: newTicket.subject,
        status: 'open',
        priority: newTicket.priority as 'low' | 'medium' | 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: newTicket.message
      }
      setTickets(prev => [ticket, ...prev])
      setNewTicket({ subject: '', priority: 'medium', message: '' })
      setShowNewTicketForm(false)
    }
  }

  const isWorkingHours = () => {
    const now = new Date()
    const hour = now.getHours()
    return hour >= 9 && hour < 17 // 9 AM to 5 PM
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'AR' ? 'الدعم' : 'Support'}
        </h1>
        <p className="text-gray-600 mt-1">
          {language === 'AR' 
            ? 'احصل على المساعدة والدعم الفني'
            : 'Get help and technical support'
          }
        </p>
      </div>

      {/* Working Hours Status */}
      <div className={cn(
        "p-4 rounded-lg border",
        isWorkingHours() 
          ? "bg-green-50 border-green-200" 
          : "bg-amber-50 border-amber-200"
      )}>
        <div className="flex items-center gap-2">
          {isWorkingHours() ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Clock className="w-5 h-5 text-amber-600" />
          )}
          <span className={cn(
            "font-medium",
            isWorkingHours() ? "text-green-800" : "text-amber-800"
          )}>
            {isWorkingHours() 
              ? (language === 'AR' ? 'نحن متصلون الآن! ابدأ محادثة مباشرة.' : 'We\'re online now! Start a live chat.')
              : (language === 'AR' ? 'ساعات العمل: 9 صباحاً - 5 مساءً' : 'Working hours: 9 AM - 5 PM')
            }
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('tickets')}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === 'tickets'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          {language === 'AR' ? 'التذاكر' : 'Tickets'}
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === 'chats'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          {language === 'AR' ? 'المحادثات' : 'Chats'}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'tickets' ? (
        <div className="space-y-4">
          {/* New Ticket Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {language === 'AR' ? 'تذاكر الدعم' : 'Support Tickets'}
            </h2>
            <Button onClick={() => setShowNewTicketForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'AR' ? 'تذكرة جديدة' : 'New Ticket'}
            </Button>
          </div>

          {/* Tickets List */}
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'AR' ? 'لا توجد تذاكر' : 'No tickets yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === 'AR' 
                  ? 'ابدأ تذكرة دعم جديدة للحصول على المساعدة'
                  : 'Start a new support ticket to get help'
                }
              </p>
              <Button onClick={() => setShowNewTicketForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'AR' ? 'تذكرة جديدة' : 'New Ticket'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {ticket.subject}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {ticket.lastMessage}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)[language.toLowerCase() as 'en' | 'ar']}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {getPriorityLabel(ticket.priority)[language.toLowerCase() as 'en' | 'ar']}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {language === 'AR' ? 'آخر تحديث:' : 'Last updated:'} {formatDate(ticket.updatedAt)}
                    </span>
                    <Button variant="outline" size="sm">
                      {language === 'AR' ? 'عرض التفاصيل' : 'View Details'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'AR' ? 'المحادثات المباشرة' : 'Live Chats'}
          </h2>
          
          {chats.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'AR' ? 'لا توجد محادثات' : 'No chats yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === 'AR' 
                  ? 'ابدأ محادثة مباشرة مع فريق الدعم'
                  : 'Start a live chat with our support team'
                }
              </p>
              <Button>
                <MessageCircle className="w-4 h-4 mr-2" />
                {language === 'AR' ? 'بدء محادثة' : 'Start Chat'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => (
                <div key={chat.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {chat.subject}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {chat.lastMessage}
                      </p>
                    </div>
                    <Badge className={getStatusColor(chat.status)}>
                      {getStatusLabel(chat.status)[language.toLowerCase() as 'en' | 'ar']}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {language === 'AR' ? 'آخر رسالة:' : 'Last message:'} {formatDate(chat.lastMessageAt || chat.createdAt)}
                    </span>
                    <Button variant="outline" size="sm">
                      {language === 'AR' ? 'فتح المحادثة' : 'Open Chat'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Ticket Form Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'AR' ? 'تذكرة دعم جديدة' : 'New Support Ticket'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNewTicketForm(false)}>
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'AR' ? 'الموضوع' : 'Subject'}
                </label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder={language === 'AR' ? 'أدخل موضوع التذكرة' : 'Enter ticket subject'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'AR' ? 'الأولوية' : 'Priority'}
                </label>
                <Select value={newTicket.priority} onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{getPriorityLabel('low')[language.toLowerCase() as 'en' | 'ar']}</SelectItem>
                    <SelectItem value="medium">{getPriorityLabel('medium')[language.toLowerCase() as 'en' | 'ar']}</SelectItem>
                    <SelectItem value="high">{getPriorityLabel('high')[language.toLowerCase() as 'en' | 'ar']}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'AR' ? 'الرسالة' : 'Message'}
                </label>
                <Textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={language === 'AR' ? 'أدخل تفاصيل المشكلة' : 'Enter problem details'}
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowNewTicketForm(false)} className="flex-1">
                  {language === 'AR' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleCreateTicket} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  {language === 'AR' ? 'إرسال' : 'Send'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
