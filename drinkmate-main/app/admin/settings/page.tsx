"use client"

import { useState } from "react"
import AdminLayout from "@/components/layout/AdminLayout"
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

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [currency, setCurrency] = useState("SAR")
  const [language, setLanguage] = useState("en")
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    // Save settings logic would go here
    console.log("Settings saved")
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button className="bg-[#12d6fa] hover:bg-[#0fb8d9]" onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save All Settings
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your site's general settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Site Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input id="site-name" defaultValue="Drinkmate" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-url">Site URL</Label>
                    <Input id="site-url" defaultValue="https://drinkmate.sa" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea 
                    id="site-description" 
                    defaultValue="Drinkmate - Premium soda makers and accessories for your home carbonation needs."
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
                    <Select value={language} onValueChange={setLanguage}>
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
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">Saudi Riyal (&#xea;)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="Asia/Riyadh">
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
                    <Select defaultValue="dd/MM/yyyy">
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
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
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
                      {isMaintenanceMode && (
                        <Badge variant="destructive">Site Offline</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Put the site in maintenance mode to prevent user access
                    </p>
                  </div>
                  <Switch 
                    id="maintenance-mode" 
                    checked={isMaintenanceMode}
                    onCheckedChange={setIsMaintenanceMode}
                  />
                </div>
                {isMaintenanceMode && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="maintenance-message">Maintenance Message</Label>
                    <Textarea 
                      id="maintenance-message" 
                      defaultValue="We're currently performing maintenance. Please check back soon."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>
                Configure your store settings and product options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>
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
                <Button variant="outline" className="mt-2">
                  Test Email Connection
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
    </AdminLayout>
  )
}
