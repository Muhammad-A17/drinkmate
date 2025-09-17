'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/translation-context'
import { useAuth } from '@/lib/auth-context'
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

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
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
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: user?._id || '1',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: '123 Main Street',
      city: 'Riyadh',
      state: 'Riyadh Province',
      zipCode: '12345',
      country: 'Saudi Arabia'
    }
  })

  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true)
        
        // Mock orders data
        const mockOrders: Order[] = [
            {
              id: '1',
              number: 'DM-2024-001',
              createdAt: '2024-01-15T10:30:00Z',
              status: 'delivered',
              total: 299.99,
            itemsCount: 3,
            items: [
              { name: 'DrinkMate OmniFizz', quantity: 1, price: 199.99 },
              { name: 'CO₂ Cylinder', quantity: 2, price: 50.00 }
            ]
            },
            {
              id: '2',
              number: 'DM-2024-002',
              createdAt: '2024-01-10T14:20:00Z',
              status: 'shipped',
              total: 149.99,
            itemsCount: 1,
            items: [
              { name: 'Premium Flavor Pack', quantity: 1, price: 149.99 }
            ]
            },
            {
              id: '3',
              number: 'DM-2024-003',
              createdAt: '2024-01-05T09:15:00Z',
              status: 'processing',
              total: 89.99,
            itemsCount: 2,
            items: [
              { name: 'Extra CO₂ Cylinder', quantity: 2, price: 89.99 }
            ]
          }
        ]

        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setOrders(mockOrders)
      } catch (err) {
        setError('Failed to load account data')
      } finally {
        setLoading(false)
      }
    }

    fetchAccountData()
  }, [])

  const handleProfileSave = () => {
    // Here you would typically make an API call to save the profile
    console.log('Saving profile:', profile)
    setIsEditingProfile(false)
  }

  const handleAddressSave = () => {
    // Here you would typically make an API call to save the address
    console.log('Saving address:', profile.address)
    setIsEditingAddress(false)
  }

  const handlePasswordChange = () => {
    // Here you would typically make an API call to change the password
    console.log('Changing password:', passwordData)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setIsChangingPassword(false)
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
                    <div>
                      <Label htmlFor="street" className="text-sm font-semibold text-gray-700">
                        {language === 'AR' ? 'الشارع' : 'Street Address'}
                      </Label>
                      <Input
                        id="street"
                        value={profile.address.street}
                        onChange={(e) => setProfile({
                          ...profile, 
                          address: {...profile.address, street: e.target.value}
                        })}
                        className="mt-2 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                          {language === 'AR' ? 'المدينة' : 'City'}
                        </Label>
                        <Input
                          id="city"
                          value={profile.address.city}
                          onChange={(e) => setProfile({
                            ...profile, 
                            address: {...profile.address, city: e.target.value}
                          })}
                          className="mt-2 border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode" className="text-sm font-semibold text-gray-700">
                          {language === 'AR' ? 'الرمز البريدي' : 'ZIP Code'}
                        </Label>
                        <Input
                          id="zipCode"
                          value={profile.address.zipCode}
                          onChange={(e) => setProfile({
                            ...profile, 
                            address: {...profile.address, zipCode: e.target.value}
                          })}
                          className="mt-2 border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-semibold text-gray-700">
                        {language === 'AR' ? 'المحافظة' : 'State/Province'}
                      </Label>
                      <Input
                        id="state"
                        value={profile.address.state}
                        onChange={(e) => setProfile({
                          ...profile, 
                          address: {...profile.address, state: e.target.value}
                        })}
                        className="mt-2 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-semibold text-gray-700">
                        {language === 'AR' ? 'البلد' : 'Country'}
                      </Label>
                      <Input
                        id="country"
                        value={profile.address.country}
                        onChange={(e) => setProfile({
                          ...profile, 
                          address: {...profile.address, country: e.target.value}
                        })}
                        className="mt-2 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleAddressSave} className="flex-1 bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" />
                        {language === 'AR' ? 'حفظ العنوان' : 'Save Address'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditingAddress(false)}
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
                        <p className="text-sm text-gray-500 mb-1">{language === 'AR' ? 'العنوان الكامل' : 'Full Address'}</p>
                        <p className="font-semibold text-lg">{profile.address.street}</p>
                        <p className="text-gray-600">
                          {profile.address.city}, {profile.address.state} {profile.address.zipCode}
                        </p>
                        <p className="text-gray-600">{profile.address.country}</p>
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
                          <p className="font-bold text-xl text-gray-900">${order.total.toFixed(2)}</p>
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
