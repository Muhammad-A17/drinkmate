'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/contexts/translation-context'
import { useAuth, getAuthToken } from '@/lib/contexts/auth-context'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  MapPin, 
  Package, 
  MessageCircle, 
  Edit3, 
  Save, 
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Lock,
  Shield,
  Star,
  TrendingUp,
  ShoppingBag
} from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import WishlistSidebar from '@/components/account/WishlistSidebar'
import SaudiRiyal from '@/components/ui/SaudiRiyal'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  district: string
  city: string
  country: string
  nationalAddress: string
}

interface PasswordChange {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface Order {
  id: string
  number: string
  createdAt: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  itemsCount: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}


export default function AccountDashboard() {
  const { language, isRTL } = useTranslation()
  const { user, refreshUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: user?._id || '1',
    name: user?.name || user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    district: (user as any)?.district || '',
    city: (user as any)?.city || '',
    country: 'Saudi Arabia',
    nationalAddress: (user as any)?.nationalAddress || ''
  })

  // Debug profile state changes
  useEffect(() => {
    console.log("Profile state updated:", profile)
  }, [profile])

  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      console.log("User data changed, updating profile:", user)
      console.log("User name field:", user.name)
      console.log("User username field:", user.username)
      setProfile(prev => ({
        ...prev,
        id: user._id || '1',
        name: user.name || user.username || prev.name || '',
        email: user.email || prev.email,
        phone: (user as any)?.phone || prev.phone,
        district: (user as any)?.district || prev.district,
        city: (user as any)?.city || prev.city,
        country: 'Saudi Arabia',
        nationalAddress: (user as any)?.nationalAddress || prev.nationalAddress
      }))
    }
  }, [user])

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true)
        
        // Get auth token
        const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
        if (!token) {
          setError('Not authenticated')
          return
        }

        // Fetch real orders from API - limit to 7 for account page
        const ordersResponse = await fetch('/api/user/orders?limit=7', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          // Support both shapes: { success, data: { orders } } and { success, orders }
          const payload = ordersData?.data || ordersData
          if (ordersData?.success && (payload?.orders || Array.isArray(payload))) {
            const rawOrders = Array.isArray(payload) ? payload : (payload.orders || [])
            // Transform API data to match our Order interface
            const transformedOrders: Order[] = rawOrders.map((order: any) => ({
              id: order._id || order.id,
              number: order.orderNumber || order.order_number || order.id || `DM-${order._id?.slice(-8) || 'N/A'}`,
              createdAt: order.createdAt || order.created_at || order.date || new Date().toISOString(),
              status: order.status || 'pending',
              total: typeof order.total === 'number' ? order.total : (order.totalAmount || order.total_amount || 0),
              itemsCount: Array.isArray(order.items) ? order.items.length : (order.itemsCount || 0),
              items: order.items?.map((item: any) => ({
                name: item.name || 'Unknown Item',
                quantity: item.quantity || 1,
                price: item.price || 0
              })) || []
            })) || []
            
            setOrders(transformedOrders)
          } else {
            // If no orders found, set empty array
            setOrders([])
          }
        } else {
          // If API fails, fall back to empty array
          console.warn('Failed to fetch orders, using empty array')
          setOrders([])
        }
      } catch (err) {
        setError('Failed to load account data')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user) {
    fetchAccountData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const handleProfileSave = async () => {
    try {
      // Basic validation
      if (!profile.name.trim()) {
        toast.error(
          language === 'AR' ? 'يرجى ملء الاسم الكامل' : 'Please fill in full name'
        )
        return
      }

      // Make API call to save the profile
      const token = getAuthToken()
      if (!token) {
        toast.error(
          language === 'AR' ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first'
        )
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          district: profile.district,
          city: profile.city,
          nationalAddress: profile.nationalAddress
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile')
      }

      // Update the profile state with the saved data
      if (result.user) {
        setProfile(prev => ({
          ...prev,
          name: result.user.name || result.user.firstName + ' ' + result.user.lastName || prev.name,
          phone: result.user.phone || prev.phone,
          district: result.user.district || prev.district,
          city: result.user.city || prev.city,
          nationalAddress: result.user.nationalAddress || prev.nationalAddress
        }))
        
        // Refresh user data to show updated information
        await refreshUser()
      }

      setIsEditingProfile(false)
      
      toast.success(
        language === 'AR' ? 'تم حفظ الملف الشخصي بنجاح!' : 'Profile saved successfully!'
      )
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error(
        language === 'AR' ? 'حدث خطأ في حفظ الملف الشخصي' : 'Error saving profile'
      )
    }
  }

  const handleAddressSave = async () => {
    try {
      setIsSavingAddress(true)
      
      // Basic validation
      if (!profile.district.trim() || !profile.city.trim()) {
        toast.error(
          language === 'AR' ? 'يرجى ملء الحي والمدينة' : 'Please fill in district and city'
        )
        return
      }

      // Validate national address format if provided
      if (profile.nationalAddress && !/^[A-Z]{4}[0-9]{4}$/.test(profile.nationalAddress)) {
        toast.error(
          language === 'AR' ? 'يجب أن يكون التنسيق: 4 أحرف متبوعة بـ 4 أرقام (مثال: JESA3591)' : 'Format must be: 4 letters followed by 4 numbers (e.g., JESA3591)'
        )
        return
      }

      // Make API call to save the address
      const token = getAuthToken()
      if (!token) {
        toast.error(
          language === 'AR' ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first'
        )
        return
      }

      const requestBody = {
        name: profile.name,
        phone: profile.phone,
        district: profile.district,
        city: profile.city,
        nationalAddress: profile.nationalAddress
      }
      
      console.log('Sending address update request:', requestBody)
      console.log('Token:', token ? 'Present' : 'Missing')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save address')
      }

      // Update the profile state with the saved data
      if (result.user) {
        setProfile(prev => ({
          ...prev,
          name: result.user.name || result.user.firstName + ' ' + result.user.lastName || prev.name,
          phone: result.user.phone || prev.phone,
          district: result.user.district || prev.district,
          city: result.user.city || prev.city,
          nationalAddress: result.user.nationalAddress || prev.nationalAddress
        }))
        
        // Refresh user data to show updated information
        console.log("Calling refreshUser for address save...")
        await refreshUser()
        console.log("refreshUser completed for address save")
      }
      
      setIsEditingAddress(false)
      
      // Show success message
      console.log('Address saved successfully!')
      toast.success(
        language === 'AR' ? 'تم حفظ العنوان بنجاح!' : 'Address saved successfully!'
      )
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error(
        language === 'AR' ? 'حدث خطأ في حفظ العنوان' : 'Error saving address'
      )
    } finally {
      setIsSavingAddress(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      // Basic validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast.error(
          language === 'AR' ? 'جميع الحقول مطلوبة' : 'All fields are required'
        )
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error(
          language === 'AR' ? 'كلمة المرور الجديدة غير متطابقة' : 'New passwords do not match'
        )
        return
      }

      if (passwordData.newPassword.length < 8) {
        toast.error(
          language === 'AR' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters'
        )
        return
      }

      // Get auth token
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        toast.error(
          language === 'AR' ? 'غير مسجل الدخول' : 'Not authenticated'
        )
        return
      }

      // Call API to change password
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password')
      }

      // Success
      toast.success(
        language === 'AR' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully'
      )

      // Reset form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setIsChangingPassword(false)

    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(
        language === 'AR' ? 'حدث خطأ في تغيير كلمة المرور' : 'Error changing password'
      )
    }
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/account/orders/${orderId}`)
  }

  const handleViewAllOrders = () => {
    router.push('/account/orders')
  }



  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'processing': return <RefreshCw className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">
            {language === 'AR' ? 'جاري تحميل بيانات الحساب...' : 'Loading account data...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <AlertCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {language === 'AR' ? 'خطأ في التحميل' : 'Loading Error'}
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          {language === 'AR' ? 'إعادة المحاولة' : 'Try Again'}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header with Stats */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {language === 'AR' ? `مرحباً، ${profile.name}` : `Welcome, ${profile.name}`}
                </h1>
                <p className="text-blue-100 text-lg">
                  {language === 'AR' ? 'إدارة حسابك وطلباتك' : 'Manage your account and orders'}
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{orders.length}</div>
                  <div className="text-blue-100 text-sm">
                    {language === 'AR' ? 'الطلبات' : 'Orders'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">4.8</div>
                  <div className="text-blue-100 text-sm flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    {language === 'AR' ? 'التقييم' : 'Rating'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Profile & Security */}
          <div className="space-y-6">
            {/* Profile Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  {language === 'AR' ? 'معلومات الملف الشخصي' : 'Profile Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEditingProfile ? (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        {language === 'AR' ? 'الاسم الكامل' : 'Full Name'}
                      </Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        {language === 'AR' ? 'رقم الهاتف' : 'Phone Number'}
                      </Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        {language === 'AR' ? 'البريد الإلكتروني' : 'Email'}
                      </Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="mt-2 bg-gray-50 border-gray-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {language === 'AR' ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleProfileSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        {language === 'AR' ? 'حفظ التغييرات' : 'Save Changes'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditingProfile(false)}
                        className="px-6"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {language === 'AR' ? 'إلغاء' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{language === 'AR' ? 'الاسم الكامل' : 'Full Name'}</p>
                        <p className="font-semibold text-lg">{profile.name}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingProfile(true)}
                        className="hover:bg-blue-50"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {language === 'AR' ? 'تعديل' : 'Edit'}
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{language === 'AR' ? 'البريد الإلكتروني' : 'Email'}</p>
                      <p className="font-medium text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{language === 'AR' ? 'رقم الهاتف' : 'Phone'}</p>
                      <p className="font-medium text-gray-900">{profile.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  {language === 'AR' ? 'العنوان' : 'Address'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEditingAddress ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="district" className="text-sm font-semibold text-gray-700">
                          {language === 'AR' ? 'الحي' : 'District'}
                        </Label>
                        <Input
                          id="district"
                          value={profile.district}
                          onChange={(e) => setProfile({
                            ...profile, 
                            district: e.target.value
                          })}
                          className="mt-2 border-gray-300 focus:border-green-500 focus:ring-green-500"
                          placeholder={language === 'AR' ? 'أدخل الحي' : 'Enter district'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                          {language === 'AR' ? 'المدينة' : 'City'}
                        </Label>
                        <Input
                          id="city"
                          value={profile.city}
                          onChange={(e) => setProfile({
                            ...profile, 
                            city: e.target.value
                          })}
                          className="mt-2 border-gray-300 focus:border-green-500 focus:ring-green-500"
                          placeholder={language === 'AR' ? 'أدخل المدينة' : 'Enter city'}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-semibold text-gray-700">
                        {language === 'AR' ? 'البلد' : 'Country'}
                      </Label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 mt-2">
                        Saudi Arabia
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="nationalAddress" className="text-sm font-semibold text-gray-700">
                        {language === 'AR' ? 'العنوان المختصر' : 'Short Address'} (<a href="https://splonline.com.sa/en/national-address-1/" target="_blank" rel="noopener noreferrer" className="text-[#12d6fa] hover:text-[#0bc4e8] underline">{language === 'AR' ? 'العنوان الوطني' : 'National Address'}</a>) {language === 'AR' ? '(اختياري)' : '(optional)'}
                      </Label>
                      <Input
                        id="nationalAddress"
                        value={profile.nationalAddress}
                        onChange={(e) => setProfile({
                          ...profile, 
                          nationalAddress: e.target.value.toUpperCase()
                        })}
                        className="mt-2 border-gray-300 focus:border-green-500 focus:ring-green-500 font-mono tracking-wider"
                        placeholder="JESA3591"
                        maxLength={8}
                        pattern="[A-Z]{4}[0-9]{4}"
                      />
                      <p className="text-xs text-gray-500 mt-1">{language === 'AR' ? 'التنسيق: 4 أحرف متبوعة بـ 4 أرقام (مثال: JESA3591)' : 'Format: 4 letters followed by 4 numbers (e.g., JESA3591)'}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleAddressSave} 
                        disabled={isSavingAddress}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {isSavingAddress ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {isSavingAddress 
                          ? (language === 'AR' ? 'جاري الحفظ...' : 'Saving...') 
                          : (language === 'AR' ? 'حفظ العنوان' : 'Save Address')
                        }
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditingAddress(false)}
                        disabled={isSavingAddress}
                        className="px-6"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {language === 'AR' ? 'إلغاء' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{language === 'AR' ? 'العنوان' : 'Address'}</p>
                        <p className="font-semibold text-lg">{profile.district}</p>
                        <p className="text-gray-600">
                          {profile.city}, {profile.country}
                          {profile.nationalAddress && ` - ${profile.nationalAddress}`}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingAddress(true)}
                        className="hover:bg-green-50"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {language === 'AR' ? 'تعديل' : 'Edit'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                  {language === 'AR' ? 'تغيير كلمة المرور' : 'Change Password'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isChangingPassword ? (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">
                        {language === 'AR' ? 'كلمة المرور الحالية' : 'Current Password'}
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                        {language === 'AR' ? 'كلمة المرور الجديدة' : 'New Password'}
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                        {language === 'AR' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handlePasswordChange} className="flex-1 bg-purple-600 hover:bg-purple-700">
                        <Shield className="h-4 w-4 mr-2" />
                        {language === 'AR' ? 'تغيير كلمة المرور' : 'Change Password'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsChangingPassword(false)}
                        className="px-6"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {language === 'AR' ? 'إلغاء' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{language === 'AR' ? 'أمان الحساب' : 'Account Security'}</p>
                        <p className="font-semibold text-lg">{language === 'AR' ? 'كلمة مرور قوية' : 'Strong Password'}</p>
                        <p className="text-sm text-gray-600">{language === 'AR' ? 'آخر تحديث: منذ شهر' : 'Last updated: 1 month ago'}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsChangingPassword(true)}
                        className="hover:bg-purple-50"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {language === 'AR' ? 'تغيير' : 'Change'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wishlist Sidebar */}
            <WishlistSidebar />
        </div>

          {/* Right Column - Orders & Support */}
          <div className="xl:col-span-2 space-y-6">
            {/* Orders & Returns */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-orange-600" />
                  </div>
                  {language === 'AR' ? 'الطلبات والإرجاع' : 'Orders & Returns'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-gray-900">#{order.number}</span>
                          <Badge className={cn("px-3 py-1", getStatusColor(order.status))}>
                            <span className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-gray-900">
                            <SaudiRiyal amount={order.total} size="lg" />
                          </div>
                          <p className="text-sm text-gray-500">{order.itemsCount} items</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          {order.items.map((item, index) => (
                            <span key={index}>
                              {item.name} (x{item.quantity})
                              {index < order.items.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                          className="hover:bg-orange-50 hover:border-orange-200"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {language === 'AR' ? 'عرض' : 'View'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-lg font-semibold hover:bg-orange-50 hover:border-orange-200"
                    onClick={handleViewAllOrders}
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {language === 'AR' ? 'عرض جميع الطلبات' : 'View All Orders'}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
