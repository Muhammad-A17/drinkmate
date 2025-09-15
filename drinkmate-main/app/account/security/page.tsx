'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'
import { SecuritySession } from '@/types/account'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Shield, Key, Smartphone, Monitor, MapPin, Clock, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SecurityPage() {
  const { language, isRTL } = useTranslation()
  const [sessions, setSessions] = useState<SecuritySession[]>([])
  const [loading, setLoading] = useState(true)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  // Mock data - replace with actual API call
  const mockSessions: SecuritySession[] = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'Riyadh, Saudi Arabia',
      ipAddress: '192.168.1.100',
      lastActive: '2024-01-15T14:30:00Z',
      isCurrent: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'Jeddah, Saudi Arabia',
      ipAddress: '192.168.1.101',
      lastActive: '2024-01-14T09:15:00Z',
      isCurrent: false
    },
    {
      id: '3',
      device: 'Firefox on Mac',
      location: 'Dubai, UAE',
      ipAddress: '192.168.1.102',
      lastActive: '2024-01-10T16:45:00Z',
      isCurrent: false
    }
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSessions(mockSessions)
      setTwoFactorEnabled(false) // Mock: user doesn't have 2FA enabled
      setLoading(false)
    }

    fetchData()
  }, [])

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

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return Smartphone
    }
    return Monitor
  }

  const validatePassword = () => {
    const errors: Record<string, string> = {}

    if (!passwordForm.currentPassword) {
      errors.currentPassword = language === 'AR' ? 'كلمة المرور الحالية مطلوبة' : 'Current password is required'
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = language === 'AR' ? 'كلمة المرور الجديدة مطلوبة' : 'New password is required'
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = language === 'AR' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters'
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = language === 'AR' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (validatePassword()) {
      // Handle password change
      console.log('Password changed')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordErrors({})
    }
  }

  const handleTwoFactorToggle = (enabled: boolean) => {
    setTwoFactorEnabled(enabled)
    // Handle 2FA toggle
    console.log('2FA toggled:', enabled)
  }

  const handleRevokeSession = (sessionId: string) => {
    if (window.confirm(language === 'AR' ? 'هل أنت متأكد من إلغاء هذا الجهاز؟' : 'Are you sure you want to revoke this device?')) {
      setSessions(prev => prev.filter(session => session.id !== sessionId))
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
          {language === 'AR' ? 'الأمان' : 'Security'}
        </h1>
        <p className="text-gray-600 mt-1">
          {language === 'AR' 
            ? 'إدارة أمان حسابك وكلمات المرور'
            : 'Manage your account security and passwords'
          }
        </p>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'AR' ? 'كلمة المرور' : 'Password'}
          </h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">
              {language === 'AR' ? 'كلمة المرور الحالية' : 'Current Password'}
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              className={cn(passwordErrors.currentPassword && 'border-red-500')}
            />
            {passwordErrors.currentPassword && (
              <p className="text-sm text-red-600 mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <Label htmlFor="newPassword">
              {language === 'AR' ? 'كلمة المرور الجديدة' : 'New Password'}
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              className={cn(passwordErrors.newPassword && 'border-red-500')}
            />
            {passwordErrors.newPassword && (
              <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">
              {language === 'AR' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={cn(passwordErrors.confirmPassword && 'border-red-500')}
            />
            {passwordErrors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit">
            {language === 'AR' ? 'تحديث كلمة المرور' : 'Update Password'}
          </Button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'AR' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              {language === 'AR' ? 'تفعيل المصادقة الثنائية' : 'Enable Two-Factor Authentication'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'AR' 
                ? 'أضف طبقة إضافية من الأمان لحسابك'
                : 'Add an extra layer of security to your account'
              }
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={handleTwoFactorToggle}
          />
        </div>

        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'AR' ? 'المصادقة الثنائية مفعلة' : 'Two-factor authentication is enabled'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Monitor className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'AR' ? 'الجلسات النشطة' : 'Active Sessions'}
          </h2>
        </div>

        <div className="space-y-4">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device)
            return (
              <div key={session.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg">
                  <DeviceIcon className="w-5 h-5 text-gray-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {session.device}
                    </h3>
                    {session.isCurrent && (
                      <Badge className="bg-blue-100 text-blue-800">
                        {language === 'AR' ? 'الحالي' : 'Current'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {session.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(session.lastActive)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {session.ipAddress}
                    </span>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {language === 'AR' ? 'إلغاء' : 'Revoke'}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-1">
                {language === 'AR' ? 'نصيحة أمنية' : 'Security Tip'}
              </h4>
              <p className="text-sm text-amber-700">
                {language === 'AR' 
                  ? 'إذا لاحظت أي نشاط مشبوه، قم بإلغاء الجلسات غير المألوفة فوراً'
                  : 'If you notice any suspicious activity, revoke unfamiliar sessions immediately'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
