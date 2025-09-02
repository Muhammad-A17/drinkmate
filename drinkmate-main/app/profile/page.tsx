"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Package, 
  Settings, 
  Lock,
  Edit,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { orderAPI, authAPI } from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { useTranslation } from '@/lib/translation-context';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    username: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Redirect if not authenticated and load profile data
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user) {
      // Set initial profile data from auth context
      setProfile({
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: user.lastLogin
      });
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email,
        username: user.username
      });
      
      // Load fresh profile data and orders from API
      loadUserProfile();
      loadUserOrders();
    }
  }, [isAuthenticated, user, router]);

  const loadUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.user) {
        setProfile(response.user);
        setFormData({
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          phone: response.user.phone || '',
          email: response.user.email,
          username: response.user.username
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Don't show error toast here as we have fallback data from auth context
    }
  };

  const loadUserOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderAPI.getUserOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error(t("profile.messages.failedToLoadOrders"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelEdit = () => {
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        email: profile.email,
        username: profile.username
      });
    }
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!formData.email || !formData.username) {
        toast.error("Email and username are required");
        return;
      }
      
      const response = await authAPI.updateProfile(formData);
      if (response.success) {
        setProfile(response.user);
        toast.success(t("profile.messages.profileUpdated"));
        setIsEditing(false);
      } else {
        toast.error(response.message || t("profile.messages.failedToUpdateProfile"));
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || t("profile.messages.failedToUpdateProfile"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("profile.messages.passwordsNotMatch"));
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error(t("profile.messages.passwordTooShort"));
      return;
    }

    try {
      setIsSaving(true);
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        toast.success(t("profile.messages.passwordChanged"));
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.message || t("profile.messages.failedToChangePassword"));
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.error || t("profile.messages.failedToChangePassword"));
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated || !profile) {
    return (
      <PageLayout currentPage="profile">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">{t("profile.messages.loadingProfile")}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPage="profile">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-b from-white to-[#f3f3f3] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#12d6fa]/10 to-[#12d6fa]/5"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4">
            <div className="text-center space-y-6">
              <h1 className={`text-5xl font-bold text-gray-900 leading-tight tracking-tight ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                {t("profile.hero.title")}
              </h1>
              <p className={`text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                {t("profile.hero.description")}
              </p>
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("profile.tabs.profile")}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t("profile.tabs.orders")}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {t("profile.tabs.security")}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("profile.personalInfo.title")}</CardTitle>
                    <CardDescription>
                      {t("profile.personalInfo.description")}
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={isEditing ? handleCancelEdit : handleStartEdit}
                    className="flex items-center gap-2"
                  >
                    {isEditing ? (
                      <>
                        <X className="h-4 w-4" />
{t("profile.personalInfo.cancel")}
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
{t("profile.personalInfo.edit")}
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} alt={profile.username} />
                    <AvatarFallback className="text-lg">
                      {profile.firstName ? profile.firstName[0] : profile.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {profile.firstName && profile.lastName 
                        ? `${profile.firstName} ${profile.lastName}`
                        : profile.username
                      }
                    </h3>
                    <p className="text-gray-600">{profile.email}</p>
                    {profile.isAdmin && (
                      <Badge variant="secondary" className="mt-1">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("profile.personalInfo.firstName")}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder={t("profile.personalInfo.firstNamePlaceholder")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("profile.personalInfo.lastName")}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder={t("profile.personalInfo.lastNamePlaceholder")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">{t("profile.personalInfo.username")}</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder={t("profile.personalInfo.usernamePlaceholder")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("profile.personalInfo.email")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder={t("profile.personalInfo.emailPlaceholder")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("profile.personalInfo.phone")}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder={t("profile.personalInfo.phonePlaceholder")}
                    />
                  </div>
                </div>

                {/* Account Info */}
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{t("profile.personalInfo.memberSince")}</span>
                    <span className="font-medium">{formatDate(profile.createdAt)}</span>
                  </div>
                  
                  {profile.lastLogin && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{t("profile.personalInfo.lastLogin")}</span>
                      <span className="font-medium">{formatDate(profile.lastLogin)}</span>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
{t("profile.personalInfo.cancel")}
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
{t("profile.personalInfo.saving")}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
{t("profile.personalInfo.save")}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.orders.title")}</CardTitle>
                <CardDescription>
                  {t("profile.orders.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">{t("profile.orders.loading")}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t("profile.orders.noOrders")}</h3>
                    <p className="text-gray-600 mb-4">{t("profile.orders.noOrdersDescription")}</p>
                    <Button onClick={() => router.push('/shop')}>
                      {t("profile.orders.startShopping")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{t("profile.orders.orderNumber")}{order.orderNumber}</h4>
                            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.total.toFixed(2)}</p>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name} x {item.quantity}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        {order.shippingAddress && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div className="text-sm text-gray-600">
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                <p>{order.shippingAddress.country}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.security.changePassword.title")}</CardTitle>
                <CardDescription>
                  {t("profile.security.changePassword.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t("profile.security.changePassword.currentPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder={t("profile.security.changePassword.currentPasswordPlaceholder")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("profile.security.changePassword.newPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder={t("profile.security.changePassword.newPasswordPlaceholder")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("profile.security.changePassword.confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder={t("profile.security.changePassword.confirmPasswordPlaceholder")}
                  />
                </div>
                
                <Button
                  onClick={handleChangePassword}
                  disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t("profile.security.changePassword.updating")}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
{t("profile.security.changePassword.update")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.security.accountActions.title")}</CardTitle>
                <CardDescription>
                  {t("profile.security.accountActions.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{t("profile.security.accountActions.signOut")}</h4>
                    <p className="text-sm text-gray-600">Sign out of your account on this device</p>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
{t("profile.security.accountActions.signOut")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
        </section>
        </div>
      </div>
    </PageLayout>
  );
}
