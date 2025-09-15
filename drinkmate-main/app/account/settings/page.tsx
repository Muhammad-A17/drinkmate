'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Globe, Bell, Download, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { language, setLanguage, isRTL } = useTranslation()
  const [settings, setSettings] = useState({
    language: language,
    marketingPreferences: {
      email: true,
      whatsapp: true,
      sms: false
    },
    notifications: {
      orderUpdates: true,
      promotions: true,
      security: true
    }
  })
  const [loading, setLoading] = useState(true)
  const [showDataExport, setShowDataExport] = useState(false)
  const [showDataDelete, setShowDataDelete] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLoading(false)
    }

    fetchSettings()
  }, [])

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'EN' | 'AR')
    setSettings(prev => ({ ...prev, language: newLanguage as 'EN' | 'AR' }))
  }

  const handleMarketingPreferenceChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      marketingPreferences: {
        ...prev.marketingPreferences,
        [key]: value
      }
    }))
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const handleDataExport = () => {
    // Handle data export
    console.log('Exporting data...')
    setShowDataExport(false)
    // Show success message
  }

  const handleDataDelete = () => {
    if (window.confirm(language === 'AR' ? 'هل أنت متأكد من حذف جميع بياناتك؟ هذا الإجراء لا يمكن التراجع عنه.' : 'Are you sure you want to delete all your data? This action cannot be undone.')) {
      // Handle data deletion
      console.log('Deleting data...')
      setShowDataDelete(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'AR' ? 'الإعدادات' : 'Settings'}
        </h1>
        <p className="text-gray-600 mt-1">
          {language === 'AR' 
            ? 'إدارة إعدادات حسابك وتفضيلاتك'
            : 'Manage your account settings and preferences'
          }
        </p>
      </div>

      {/* Language Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'AR' ? 'اللغة' : 'Language'}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="language">
              {language === 'AR' ? 'اختر اللغة' : 'Select Language'}
            </Label>
            <Select value={settings.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'AR' 
                  ? 'سيتم تطبيق التغييرات فوراً'
                  : 'Changes will be applied immediately'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Preferences */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Bell className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'AR' ? 'تفضيلات التسويق' : 'Marketing Preferences'}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {language === 'AR' ? 'البريد الإلكتروني' : 'Email'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'AR' 
                  ? 'تلقي العروض والتنبيهات عبر البريد الإلكتروني'
                  : 'Receive offers and notifications via email'
                }
              </p>
            </div>
            <Switch
              checked={settings.marketingPreferences.email}
              onCheckedChange={(checked) => handleMarketingPreferenceChange('email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {language === 'AR' ? 'واتساب' : 'WhatsApp'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'AR' 
                  ? 'تلقي التنبيهات عبر واتساب'
                  : 'Receive notifications via WhatsApp'
                }
              </p>
            </div>
            <Switch
              checked={settings.marketingPreferences.whatsapp}
              onCheckedChange={(checked) => handleMarketingPreferenceChange('whatsapp', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {language === 'AR' ? 'الرسائل النصية' : 'SMS'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'AR' 
                  ? 'تلقي التنبيهات عبر الرسائل النصية'
                  : 'Receive notifications via SMS'
                }
              </p>
            </div>
            <Switch
              checked={settings.marketingPreferences.sms}
              onCheckedChange={(checked) => handleMarketingPreferenceChange('sms', checked)}
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Settings className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'AR' ? 'إعدادات التنبيهات' : 'Notification Settings'}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {language === 'AR' ? 'تحديثات الطلبات' : 'Order Updates'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'AR' 
                  ? 'تلقي تنبيهات حول حالة طلباتك'
                  : 'Receive notifications about your order status'
                }
              </p>
            </div>
            <Switch
              checked={settings.notifications.orderUpdates}
              onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {language === 'AR' ? 'العروض الترويجية' : 'Promotions'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'AR' 
                  ? 'تلقي تنبيهات حول العروض والخصومات'
                  : 'Receive notifications about offers and discounts'
                }
              </p>
            </div>
            <Switch
              checked={settings.notifications.promotions}
              onCheckedChange={(checked) => handleNotificationChange('promotions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {language === 'AR' ? 'تنبيهات الأمان' : 'Security Alerts'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'AR' 
                  ? 'تلقي تنبيهات حول أنشطة الأمان'
                  : 'Receive notifications about security activities'
                }
              </p>
            </div>
            <Switch
              checked={settings.notifications.security}
              onCheckedChange={(checked) => handleNotificationChange('security', checked)}
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Download className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'AR' ? 'إدارة البيانات' : 'Data Management'}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">
                {language === 'AR' ? 'تصدير البيانات' : 'Export Data'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'AR' 
                  ? 'تحميل نسخة من جميع بياناتك'
                  : 'Download a copy of all your data'
                }
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowDataExport(true)}>
              <Download className="w-4 h-4 mr-2" />
              {language === 'AR' ? 'تصدير' : 'Export'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <h3 className="font-medium text-red-900">
                {language === 'AR' ? 'حذف الحساب' : 'Delete Account'}
              </h3>
              <p className="text-sm text-red-700">
                {language === 'AR' 
                  ? 'حذف حسابك وجميع البيانات المرتبطة به نهائياً'
                  : 'Permanently delete your account and all associated data'
                }
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowDataDelete(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {language === 'AR' ? 'حذف' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      {/* Data Export Confirmation */}
      {showDataExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'AR' ? 'تصدير البيانات' : 'Export Data'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'AR' 
                ? 'سيتم إرسال رابط تحميل البيانات إلى بريدك الإلكتروني خلال 24 ساعة.'
                : 'A download link will be sent to your email within 24 hours.'
              }
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDataExport(false)} className="flex-1">
                {language === 'AR' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleDataExport} className="flex-1">
                {language === 'AR' ? 'تأكيد' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Data Delete Confirmation */}
      {showDataDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'AR' ? 'حذف الحساب' : 'Delete Account'}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {language === 'AR' 
                ? 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.'
                : 'This action cannot be undone. All your data will be permanently deleted.'
              }
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDataDelete(false)} className="flex-1">
                {language === 'AR' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleDataDelete} 
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {language === 'AR' ? 'حذف نهائياً' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
