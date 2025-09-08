"use client"

import type React from "react"
import Image from "next/image"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Package,
  Settings,
  Lock,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Crown,
  Shield,
  Star,
  TrendingUp,
  Award,
} from "lucide-react"
import { orderAPI, authAPI } from "@/lib/api"
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/translation-context"

interface UserProfile {
  _id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  isAdmin: boolean
  createdAt: string
  lastLogin?: string
}

interface Order {
  _id: string
  orderNumber: string
  status: string
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  createdAt: string
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const { t, isRTL } = useTranslation()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    username: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Redirect if not authenticated and load profile data
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
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
        lastLogin: user.lastLogin,
      })
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email,
        username: user.username,
      })

      // Load fresh profile data and orders from API
      loadUserProfile()
      loadUserOrders()
    }
  }, [isAuthenticated, user, router])

  const loadUserProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      if (response.success && response.user) {
        setProfile(response.user)
        setFormData({
          firstName: response.user.firstName || "",
          lastName: response.user.lastName || "",
          phone: response.user.phone || "",
          email: response.user.email,
          username: response.user.username,
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      // Don't show error toast here as we have fallback data from auth context
    }
  }

  const loadUserOrders = async () => {
    try {
      setIsLoading(true)
      const response = await orderAPI.getUserOrders()
      setOrders(response.orders || [])
    } catch (error) {
      console.error("Error loading orders:", error)
      toast.error(t("profile.messages.failedToLoadOrders"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCancelEdit = () => {
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        email: profile.email,
        username: profile.username,
      })
    }
    setIsEditing(false)
  }

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await authAPI.uploadAvatar(formData)
      
      if (response.success) {
        setProfile(prev => prev ? { ...prev, avatar: response.avatar } : null)
        toast.success('Profile image updated successfully!')
      } else {
        toast.error(response.message || 'Failed to update profile image')
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error('Failed to update profile image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)

      // Validate required fields
      if (!formData.email || !formData.username) {
        toast.error("Email and username are required")
        return
      }

      const response = await authAPI.updateProfile(formData)
      if (response.success) {
        setProfile(response.user)
        toast.success(t("profile.messages.profileUpdated"))
        setIsEditing(false)
      } else {
        toast.error(response.message || t("profile.messages.failedToUpdateProfile"))
      }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(error.response?.data?.error || t("profile.messages.failedToUpdateProfile"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("profile.messages.passwordsNotMatch"))
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t("profile.messages.passwordTooShort"))
      return
    }

    try {
      setIsSaving(true)
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      if (response.success) {
        toast.success(t("profile.messages.passwordChanged"))
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        toast.error(response.message || t("profile.messages.failedToChangePassword"))
      }
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast.error(error.response?.data?.error || t("profile.messages.failedToChangePassword"))
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isAuthenticated || !profile) {
    return (
      <PageLayout currentPage="profile">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-[#12d6fa] mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#12d6fa]/20 to-[#a8f387]/20 animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-800">Loading your profile</h3>
              <p className="text-slate-600">{t("profile.messages.loadingProfile")}</p>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout currentPage="profile">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#12d6fa]/10">
        <section className="relative py-16 bg-gray-50 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1757238970/background-6556413_1920_rlwos5.jpg"
              alt="Profile Background"
              fill
              className="object-cover"
              style={{ objectPosition: 'center 80%' }}
              priority
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <div className="text-center space-y-6">
              <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
                Welcome back, {profile.firstName || profile.username}
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Manage your account, view your orders, and customize your experience with Drinkmate
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 lg:py-40 bg-white relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="profile" className="space-y-16">
              {/* Tabs Navigation */}
              <div className="flex justify-center items-center">
                <TabsList className="grid w-full max-w-lg grid-cols-3 bg-white/90 backdrop-blur-sm shadow-xl border border-white/30 rounded-2xl p-3 gap-1">
                  <TabsTrigger
                    value="profile"
                    className="flex items-center justify-center gap-2 rounded-xl py-4 px-5 bg-white text-slate-600 hover:bg-slate-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#12d6fa] data-[state=active]:to-[#0bc4e8] data-[state=active]:text-white transition-all duration-300 font-medium"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{t("profile.tabs.profile")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="orders"
                    className="flex items-center justify-center gap-2 rounded-xl py-4 px-5 bg-white text-slate-600 hover:bg-slate-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#12d6fa] data-[state=active]:to-[#0bc4e8] data-[state=active]:text-white transition-all duration-300 font-medium"
                  >
                    <Package className="h-5 w-5" />
                    <span className="hidden sm:inline">{t("profile.tabs.orders")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="flex items-center justify-center gap-2 rounded-xl py-4 px-5 bg-white text-slate-600 hover:bg-slate-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#12d6fa] data-[state=active]:to-[#0bc4e8] data-[state=active]:text-white transition-all duration-300 font-medium"
                  >
                    <Shield className="h-5 w-5" />
                    <span className="hidden sm:inline">{t("profile.tabs.security")}</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-8 mt-8">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#12d6fa]/5 to-[#a8f387]/5"></div>
                  <CardHeader className="relative bg-gradient-to-r from-slate-50 to-[#12d6fa]/10 border-b border-slate-200/50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] rounded-xl">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          {t("profile.personalInfo.title")}
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                          {t("profile.personalInfo.description")}
                        </CardDescription>
                      </div>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        onClick={isEditing ? handleCancelEdit : handleStartEdit}
                        className={`flex items-center gap-2 rounded-xl transition-all duration-300 ${
                          isEditing
                            ? "border-slate-300 hover:border-slate-400"
                            : "bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#09b3d1] shadow-lg hover:shadow-xl"
                        }`}
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
                  <CardContent className="relative p-8 space-y-8">
                    {/* Enhanced Avatar Section */}
                    <div className="flex items-center space-x-6">
                      <div className="relative group">
                        <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                          <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.username} />
                          <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] text-white">
                            {profile.firstName ? profile.firstName[0] : profile.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        {profile.isAdmin && (
                          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-2 shadow-lg ring-4 ring-white">
                            <Crown className="h-4 w-4 text-white" />
                          </div>
                        )}
                        
                        {/* Image Upload Button - Only show when editing */}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={isUploadingImage}
                              />
                              <div className="bg-white/90 hover:bg-white rounded-full p-2 transition-colors duration-300">
                                {isUploadingImage ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#12d6fa] border-t-transparent"></div>
                                ) : (
                                  <Edit className="h-5 w-5 text-[#12d6fa]" />
                                )}
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-800">
                          {profile.firstName && profile.lastName
                            ? `${profile.firstName} ${profile.lastName}`
                            : profile.username}
                        </h3>
                        <p className="text-slate-600 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {profile.email}
                        </p>
                        <div className="flex items-center gap-3">
                          {profile.isAdmin && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0 shadow-md">
                              <Crown className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          <Badge variant="secondary" className="bg-[#12d6fa]/10 text-[#0bc4e8] border-[#12d6fa]/20">
                            <Award className="h-3 w-3 mr-1" />
                            Premium Member
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* Enhanced Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="firstName" className="text-slate-700 font-medium">
                          {t("profile.personalInfo.firstName")}
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder={t("profile.personalInfo.firstNamePlaceholder")}
                          className="rounded-xl border-slate-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20 transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="lastName" className="text-slate-700 font-medium">
                          {t("profile.personalInfo.lastName")}
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder={t("profile.personalInfo.lastNamePlaceholder")}
                          className="rounded-xl border-slate-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20 transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="username" className="text-slate-700 font-medium">
                          {t("profile.personalInfo.username")}
                        </Label>
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder={t("profile.personalInfo.usernamePlaceholder")}
                          className="rounded-xl border-slate-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20 transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-slate-700 font-medium">
                          {t("profile.personalInfo.email")}
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder={t("profile.personalInfo.emailPlaceholder")}
                          className="rounded-xl border-slate-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20 transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="phone" className="text-slate-700 font-medium">
                          {t("profile.personalInfo.phone")}
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder={t("profile.personalInfo.phonePlaceholder")}
                          className="rounded-xl border-slate-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* Enhanced Account Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-[#12d6fa]/10 to-[#0bc4e8]/10 rounded-2xl p-4 border border-[#12d6fa]/20">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-[#12d6fa] rounded-xl">
                            <Calendar className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">{t("profile.personalInfo.memberSince")}</p>
                            <p className="font-semibold text-slate-800">{formatDate(profile.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      {profile.lastLogin && (
                        <div className="bg-gradient-to-br from-[#a8f387]/10 to-[#96e075]/10 rounded-2xl p-4 border border-[#a8f387]/20">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-[#a8f387] rounded-xl">
                              <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">{t("profile.personalInfo.lastLogin")}</p>
                              <p className="font-semibold text-slate-800">{formatDate(profile.lastLogin)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="rounded-xl border-slate-300 hover:border-slate-400 bg-transparent"
                        >
                          {t("profile.personalInfo.cancel")}
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="flex items-center gap-2 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#09b3d1] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
              <TabsContent value="orders" className="space-y-8 mt-8">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#a8f387]/5 to-[#12d6fa]/5"></div>
                  <CardHeader className="relative bg-gradient-to-r from-slate-50 to-[#a8f387]/10 border-b border-slate-200/50">
                    <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-[#a8f387] to-[#12d6fa] rounded-xl">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      {t("profile.orders.title")}
                    </CardTitle>
                    <CardDescription className="text-slate-600">{t("profile.orders.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-8">
                    {isLoading ? (
                      <div className="text-center py-12">
                        <div className="relative mb-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#12d6fa] mx-auto"></div>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#12d6fa]/20 to-[#a8f387]/20 animate-pulse"></div>
                        </div>
                        <p className="text-slate-600 font-medium">{t("profile.orders.loading")}</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mb-6">
                          <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                            <Package className="h-10 w-10 text-slate-400" />
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">{t("profile.orders.noOrders")}</h3>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                          {t("profile.orders.noOrdersDescription")}
                        </p>
                        <Button
                          onClick={() => router.push("/shop")}
                          className="bg-gradient-to-r from-[#a8f387] to-[#12d6fa] hover:from-[#96e075] hover:to-[#0bc4e8] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {t("profile.orders.startShopping")}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <div
                            key={order._id}
                            className="bg-gradient-to-r from-white to-slate-50/50 border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-[#12d6fa]/30"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="space-y-1">
                                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                  <Package className="h-4 w-4 text-[#12d6fa]" />
                                  {t("profile.orders.orderNumber")}
                                  {order.orderNumber}
                                </h4>
                                <p className="text-sm text-slate-600 flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                              <div className="text-right space-y-2">
                                <p className="text-xl font-bold text-slate-800">${order.total.toFixed(2)}</p>
                                <Badge className={`${getStatusColor(order.status)} border-0 shadow-sm`}>
                                  {order.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm bg-slate-50 rounded-xl p-3">
                                  <span className="font-medium text-slate-700">
                                    {item.name} × {item.quantity}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {order.shippingAddress && (
                              <div className="pt-4 border-t border-slate-200">
                                <div className="flex items-start space-x-3">
                                  <div className="p-2 bg-[#12d6fa]/10 rounded-xl">
                                    <MapPin className="h-4 w-4 text-[#12d6fa]" />
                                  </div>
                                  <div className="text-sm text-slate-600 space-y-1">
                                    <p className="font-medium text-slate-700">Shipping Address</p>
                                    <p>{order.shippingAddress.street}</p>
                                    <p>
                                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                      {order.shippingAddress.zipCode}
                                    </p>
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
              <TabsContent value="security" className="space-y-8 mt-8">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#12d6fa]/5 to-[#a8f387]/5"></div>
                  <CardHeader className="relative bg-gradient-to-r from-slate-50 to-[#12d6fa]/10 border-b border-slate-200/50">
                    <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] rounded-xl">
                        <Lock className="h-5 w-5 text-white" />
                      </div>
                      {t("profile.security.changePassword.title")}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {t("profile.security.changePassword.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-8 space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="currentPassword" className="text-slate-700 font-medium">
                        {t("profile.security.changePassword.currentPassword")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder={t("profile.security.changePassword.currentPasswordPlaceholder")}
                          className="rounded-xl border-slate-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20 transition-all duration-300 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent rounded-xl"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-500" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="newPassword" className="text-slate-700 font-medium">
                        {t("profile.security.changePassword.newPassword")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder={t("profile.security.changePassword.newPasswordPlaceholder")}
                          className="rounded-xl border-slate-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20 transition-all duration-300 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent rounded-xl"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-500" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                        {t("profile.security.changePassword.confirmPassword")}
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder={t("profile.security.changePassword.confirmPasswordPlaceholder")}
                        className="rounded-xl border-slate-200 focus:border-[#12d6fa] focus:ring-[#12d6fa]/20 transition-all duration-300"
                      />
                    </div>

                    <Button
                      onClick={handleChangePassword}
                      disabled={
                        isSaving ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword
                      }
                      className="flex items-center gap-2 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#09b3d1] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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

                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5"></div>
                  <CardHeader className="relative bg-gradient-to-r from-slate-50 to-slate-50/50 border-b border-slate-200/50">
                    <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl">
                        <Settings className="h-5 w-5 text-white" />
                      </div>
                      {t("profile.security.accountActions.title")}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {t("profile.security.accountActions.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-8">
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                            <div className="p-1 bg-slate-500 rounded-lg">
                              <User className="h-3 w-3 text-white" />
                            </div>
                            {t("profile.security.accountActions.signOut")}
                          </h4>
                          <p className="text-sm text-slate-600">Sign out of your account on this device</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="rounded-xl border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 bg-transparent"
                        >
                          {t("profile.security.accountActions.signOut")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
