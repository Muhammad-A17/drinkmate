"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/AdminLayout"
import { adminAPI } from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Save, 
  Store, 
  CreditCard, 
  Mail, 
  Bell, 
  Shield, 
  Truck,
  Globe,
  PaintBucket,
  FileJson
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Settings {
  general: {
    siteName: string
    siteUrl: string
    siteDescription: string
    language: string
    currency: string
    timezone: string
    dateFormat: string
    isDarkMode: boolean
    isMaintenanceMode: boolean
    maintenanceMessage: string
  }
  store: {
    storeName: string
    storeEmail: string
    storePhone: string
    storeAddress: string
    productsPerPage: number
    lowStockThreshold: number
    showOutOfStock: boolean
    trackInventory: boolean
    allowBackorders: boolean
  }
  payment: {
    creditCard: boolean
    applePay: boolean
    cashOnDelivery: boolean
    gatewayProvider: string
    gatewayMode: string
    apiKey: string
    guestCheckout: boolean
    requireTerms: boolean
  }
  notifications: {
    emailFrom: string
    emailName: string
    smtpHost: string
    smtpPort: number
    smtpEncryption: string
    smtpUsername: string
    smtpPassword: string
    orderConfirmation: boolean
    shippingConfirmation: boolean
    accountCreation: boolean
    newOrder: boolean
    lowStockNotification: boolean
    contactForm: boolean
  }
  security: {
    twoFactor: boolean
    sessionTimeout: number
    passwordComplexity: boolean
    enableApi: boolean
    privacyPolicyUrl: string
    termsUrl: string
    cookieConsent: boolean
    dataRetention: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    general: {
      siteName: "Drinkmate",
      siteUrl: "https://drinkmate.sa",
      siteDescription: "Drinkmate - Premium soda makers and accessories for your home carbonation needs.",
      language: "en",
      currency: "SAR",
      timezone: "Asia/Riyadh",
      dateFormat: "dd/MM/yyyy",
      isDarkMode: false,
      isMaintenanceMode: false,
      maintenanceMessage: "We're currently performing maintenance. Please check back soon."
    },
    store: {
      storeName: "Drinkmate Saudi Arabia",
      storeEmail: "info@drinkmate.sa",
      storePhone: "+966 12 345 6789",
      storeAddress: "123 King Fahd Road, Riyadh",
      productsPerPage: 12,
      lowStockThreshold: 10,
      showOutOfStock: true,
      trackInventory: true,
      allowBackorders: false
    },
    payment: {
      creditCard: true,
      applePay: true,
      cashOnDelivery: true,
      gatewayProvider: "urways",
      gatewayMode: "live",
      apiKey: "",
      guestCheckout: true,
      requireTerms: true
    },
    notifications: {
      emailFrom: "noreply@drinkmate.sa",
      emailName: "Drinkmate Saudi Arabia",
      smtpHost: "smtp.example.com",
      smtpPort: 587,
      smtpEncryption: "tls",
      smtpUsername: "user@example.com",
      smtpPassword: "",
      orderConfirmation: true,
      shippingConfirmation: true,
      accountCreation: true,
      newOrder: true,
      lowStockNotification: true,
      contactForm: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 60,
      passwordComplexity: true,
      enableApi: true,
      privacyPolicyUrl: "https://drinkmate.sa/privacy-policy",
      termsUrl: "https://drinkmate.sa/terms",
      cookieConsent: true,
      dataRetention: false
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getSettings()
      
      if (response.success && response.settings) {
        setSettings(response.settings)
      } else {
        console.error("Failed to fetch settings:", response.message)
        toast.error(response.message || "Failed to load settings")
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await adminAPI.updateSettings(settings)
      
      if (response.success) {
        toast.success("Settings saved successfully!")
      } else {
        console.error("Failed to save settings:", response.message)
        toast.error(response.message || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      setTestingEmail(true)
      const response = await adminAPI.testEmailConnection(settings.notifications)
      
      if (response.success) {
        toast.success("Email connection test successful!")
      } else {
        console.error("Email test failed:", response.message)
        toast.error(response.message || "Email connection test failed")
      }
    } catch (error) {
      console.error("Error testing email:", error)
      toast.error("Failed to test email connection")
    } finally {
      setTestingEmail(false)
    }
  }

  const handleExportSettings = async () => {
    try {
      const response = await adminAPI.exportSettings()
      
      if (response.success) {
        // Create and download the settings file
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'drinkmate-settings.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast.success("Settings exported successfully!")
      } else {
        console.error("Export failed:", response.message)
        toast.error(response.message || "Failed to export settings")
      }
    } catch (error) {
      console.error("Error exporting settings:", error)
      toast.error("Failed to export settings")
    }
  }

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const response = await adminAPI.importSettings(file)
      
      if (response.success) {
        setSettings(response.settings)
        toast.success("Settings imported successfully!")
      } else {
        console.error("Import failed:", response.message)
        toast.error(response.message || "Failed to import settings")
      }
    } catch (error) {
      console.error("Error importing settings:", error)
      toast.error("Failed to import settings")
    }
  }

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#12d6fa] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#12d6fa]/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 p-6">
          {/* Premium Header */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <Settings className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        System Settings
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Configure your application settings, preferences, and system parameters
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">5</div>
                    <div className="text-sm text-gray-500">Settings Categories</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#12d6fa]">Active</div>
                    <div className="text-sm text-gray-500">System Status</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-5 w-5" />
                    {saving ? "Saving..." : "Save All Settings"}
                  </Button>
                  
                  <Button 
                    onClick={handleExportSettings}
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <FileJson className="h-5 w-5" />
                    Export Config
                  </Button>
                  
                  <label className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer">
                    <FileJson className="h-5 w-5" />
                    Import Config
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportSettings}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Settings Tabs */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30"></div>
            <div className="relative overflow-hidden rounded-2xl">
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <Settings className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Configuration Center</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#12d6fa] rounded-full animate-pulse"></div>
                          <span className="text-gray-300">5 configuration categories available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6">
                <Tabs defaultValue="general" className="space-y-6">
                  <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-gray-100 rounded-xl p-1">
                    <TabsTrigger 
                      value="general" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="store" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                    >
                      <Store className="h-4 w-4" />
                      <span className="hidden sm:inline">Store</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="payment" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span className="hidden sm:inline">Payment</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notifications" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                    >
                      <Bell className="h-4 w-4" />
                      <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="security" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* General Settings */}
                  <TabsContent value="general">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
                      <div className="relative p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-gradient-to-br from-[#12d6fa]/20 to-blue-500/20 rounded-xl">
                            <Settings className="h-6 w-6 text-[#12d6fa]" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                              General Settings
                            </h3>
                            <p className="text-gray-600">
                              Manage your site's general settings and preferences
                            </p>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Site Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="site-name">Site Name</Label>
                                <Input 
                                  id="site-name" 
                                  value={settings.general.siteName}
                                  onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="site-url">Site URL</Label>
                                <Input 
                                  id="site-url" 
                                  value={settings.general.siteUrl}
                                  onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="site-description">Site Description</Label>
                              <Textarea 
                                id="site-description" 
                                value={settings.general.siteDescription}
                                onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Localization</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="language">Default Language</Label>
                                <Select 
                                  value={settings.general.language} 
                                  onValueChange={(value) => updateSetting('general', 'language', value)}
                                >
                                  <SelectTrigger id="language">
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="ar">Arabic</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="currency">Default Currency</Label>
                                <Select 
                                  value={settings.general.currency} 
                                  onValueChange={(value) => updateSetting('general', 'currency', value)}
                                >
                                  <SelectTrigger id="currency">
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="SAR">Saudi Riyal (ر.س)</SelectItem>
                                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select 
                                  value={settings.general.timezone}
                                  onValueChange={(value) => updateSetting('general', 'timezone', value)}
                                >
                                  <SelectTrigger id="timezone">
                                    <SelectValue placeholder="Select timezone" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Asia/Riyadh">Asia/Riyadh (GMT+3)</SelectItem>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="date-format">Date Format</Label>
                                <Select 
                                  value={settings.general.dateFormat}
                                  onValueChange={(value) => updateSetting('general', 'dateFormat', value)}
                                >
                                  <SelectTrigger id="date-format">
                                    <SelectValue placeholder="Select date format" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Appearance</h3>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="dark-mode">Dark Mode</Label>
                                <p className="text-sm text-gray-500">
                                  Enable dark mode for the admin dashboard
                                </p>
                              </div>
                              <Switch 
                                id="dark-mode" 
                                checked={settings.general.isDarkMode}
                                onCheckedChange={(checked) => updateSetting('general', 'isDarkMode', checked)}
                              />
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Maintenance</h3>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                                  {settings.general.isMaintenanceMode && (
                                    <Badge variant="destructive">Site Offline</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  Put the site in maintenance mode to prevent user access
                                </p>
                              </div>
                              <Switch 
                                id="maintenance-mode" 
                                checked={settings.general.isMaintenanceMode}
                                onCheckedChange={(checked) => updateSetting('general', 'isMaintenanceMode', checked)}
                              />
                            </div>
                            {settings.general.isMaintenanceMode && (
                              <div className="space-y-2 mt-4">
                                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                                <Textarea 
                                  id="maintenance-message" 
                                  value={settings.general.maintenanceMessage}
                                  onChange={(e) => updateSetting('general', 'maintenanceMessage', e.target.value)}
                                  rows={3}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Store Settings */}
                  <TabsContent value="store">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
                      <div className="relative p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                            <Store className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                              Store Settings
                            </h3>
                            <p className="text-gray-600">
                              Configure your store settings and product options
                            </p>
                          </div>
                        </div>
                        <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Store Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Store Name</Label>
                    <Input id="store-name" defaultValue="Drinkmate Saudi Arabia" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-email">Store Email</Label>
                    <Input id="store-email" defaultValue="info@drinkmate.sa" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Store Phone</Label>
                    <Input id="store-phone" defaultValue="+966 12 345 6789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-address">Store Address</Label>
                    <Input id="store-address" defaultValue="123 King Fahd Road, Riyadh" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Product Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-per-page">Products Per Page</Label>
                    <Input id="product-per-page" defaultValue="12" type="number" min="4" max="48" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="low-stock">Low Stock Threshold</Label>
                    <Input id="low-stock" defaultValue="10" type="number" min="1" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-out-of-stock">Show Out of Stock Products</Label>
                    <p className="text-sm text-gray-500">
                      Display products that are out of stock on the store
                    </p>
                  </div>
                  <Switch id="show-out-of-stock" defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Inventory Management</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="track-inventory">Track Inventory</Label>
                    <p className="text-sm text-gray-500">
                      Automatically update stock levels when orders are placed
                    </p>
                  </div>
                  <Switch id="track-inventory" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-backorders">Allow Backorders</Label>
                    <p className="text-sm text-gray-500">
                      Allow customers to order products that are out of stock
                    </p>
                  </div>
                  <Switch id="allow-backorders" />
                </div>
              </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure payment methods and checkout options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="credit-card">Credit Card</Label>
                      <p className="text-sm text-gray-500">
                        Accept credit card payments via payment gateway
                      </p>
                    </div>
                    <Switch id="credit-card" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="apple-pay">Apple Pay</Label>
                      <p className="text-sm text-gray-500">
                        Accept Apple Pay payments
                      </p>
                    </div>
                    <Switch id="apple-pay" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="cash-on-delivery">Cash on Delivery</Label>
                      <p className="text-sm text-gray-500">
                        Allow customers to pay when they receive their order
                      </p>
                    </div>
                    <Switch id="cash-on-delivery" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Gateway</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gateway-provider">Payment Provider</Label>
                    <Select defaultValue="stripe">
                      <SelectTrigger id="gateway-provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urways">Urways</SelectItem>
                        <SelectItem value="tap">Tap Payment</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="mada">Mada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gateway-mode">Gateway Mode</Label>
                    <Select defaultValue="live">
                      <SelectTrigger id="gateway-mode">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="test">Test/Sandbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" defaultValue="sk_test_****************************************" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Checkout Options</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="guest-checkout">Guest Checkout</Label>
                    <p className="text-sm text-gray-500">
                      Allow customers to check out without creating an account
                    </p>
                  </div>
                  <Switch id="guest-checkout" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="terms-conditions">Require Terms Acceptance</Label>
                    <p className="text-sm text-gray-500">
                      Customers must accept terms and conditions before checkout
                    </p>
                  </div>
                  <Switch id="terms-conditions" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure email notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-from">From Email</Label>
                    <Input id="email-from" defaultValue="noreply@drinkmate.sa" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-name">From Name</Label>
                    <Input id="email-name" defaultValue="Drinkmate Saudi Arabia" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input id="smtp-host" defaultValue="smtp.example.com" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" defaultValue="587" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-encryption">Encryption</Label>
                    <Select defaultValue="tls">
                      <SelectTrigger id="smtp-encryption">
                        <SelectValue placeholder="Select encryption" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">SMTP Username</Label>
                    <Input id="smtp-username" defaultValue="user@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">SMTP Password</Label>
                    <Input id="smtp-password" type="password" defaultValue="password" />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                >
                  {testingEmail ? "Testing..." : "Test Email Connection"}
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customer Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="order-confirmation">Order Confirmation</Label>
                      <p className="text-sm text-gray-500">
                        Send email when a customer places an order
                      </p>
                    </div>
                    <Switch id="order-confirmation" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="shipping-confirmation">Shipping Confirmation</Label>
                      <p className="text-sm text-gray-500">
                        Send email when an order is shipped
                      </p>
                    </div>
                    <Switch id="shipping-confirmation" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="account-creation">Account Creation</Label>
                      <p className="text-sm text-gray-500">
                        Send email when a customer creates an account
                      </p>
                    </div>
                    <Switch id="account-creation" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Admin Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-order">New Order</Label>
                      <p className="text-sm text-gray-500">
                        Receive email when a new order is placed
                      </p>
                    </div>
                    <Switch id="new-order" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="low-stock-notification">Low Stock</Label>
                      <p className="text-sm text-gray-500">
                        Receive email when products are low in stock
                      </p>
                    </div>
                    <Switch id="low-stock-notification" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="contact-form">Contact Form Submissions</Label>
                      <p className="text-sm text-gray-500">
                        Receive email when a customer submits the contact form
                      </p>
                    </div>
                    <Switch id="contact-form" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security options and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Authentication</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">
                      Require two-factor authentication for admin users
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" defaultValue="60" type="number" min="5" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="password-complexity">Enforce Password Complexity</Label>
                    <p className="text-sm text-gray-500">
                      Require strong passwords with numbers, symbols, and mixed case
                    </p>
                  </div>
                  <Switch id="password-complexity" defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">API Access</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-api">Enable API</Label>
                    <p className="text-sm text-gray-500">
                      Allow external applications to access your store data via API
                    </p>
                  </div>
                  <Switch id="enable-api" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-tokens">API Tokens</Label>
                  <div className="border rounded-md p-4 bg-gray-50">
                    <p className="text-sm">You have 2 active API tokens</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <FileJson className="mr-2 h-4 w-4" />
                      Manage API Tokens
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Privacy</h3>
                <div className="space-y-2">
                  <Label htmlFor="privacy-policy">Privacy Policy URL</Label>
                  <Input id="privacy-policy" defaultValue="https://drinkmate.sa/privacy-policy" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms-url">Terms & Conditions URL</Label>
                  <Input id="terms-url" defaultValue="https://drinkmate.sa/terms" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cookie-consent">Require Cookie Consent</Label>
                    <p className="text-sm text-gray-500">
                      Show a cookie consent banner to visitors
                    </p>
                  </div>
                  <Switch id="cookie-consent" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-retention">Data Retention Policy</Label>
                    <p className="text-sm text-gray-500">
                      Automatically delete customer data after 2 years of inactivity
                    </p>
                  </div>
                  <Switch id="data-retention" />
                </div>
              </div>
            </CardContent>
          </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
