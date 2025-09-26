"use client"

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Clock, MessageCircle, Settings, Save, RefreshCw } from 'lucide-react'
import { chatSettingsService, type ChatSettings } from '@/lib/services/chat-settings-service'
import { useAuth } from '@/lib/contexts/auth-context'

export default function ChatSettingsPage() {
  const { user, isAuthenticated, token } = useAuth()
  const [settings, setSettings] = useState<ChatSettings>({
    isEnabled: true,
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    timezone: 'Asia/Riyadh',
    autoAssign: true,
    maxConcurrentChats: 5,
    offlineMessage: 'Our chat support is currently offline. Please use our contact form or email us.',
    whatsappNumber: '+966501234567',
    emailAddress: 'support@drinkmates.com'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load settings from database on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const data = await chatSettingsService.getSettings()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load chat settings:', error)
      toast.error('Failed to load chat settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await chatSettingsService.updateSettings(settings)
      // Clear cache to force refresh
      chatSettingsService.clearCache()
      // Reload settings to get updated data
      await loadSettings()
      toast.success('Chat settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return
    }

    setIsSaving(true)
    try {
      const defaultSettings = await chatSettingsService.resetToDefaults()
      setSettings(defaultSettings)
      toast.success('Settings reset to defaults successfully!')
    } catch (error) {
      console.error('Failed to reset settings:', error)
      toast.error('Failed to reset settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: keyof ChatSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateWorkingHours = (key: 'start' | 'end', value: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [key]: value
      }
    }))
  }

  const isChatOnline = () => {
    return chatSettingsService.isChatOnline(settings)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-gray-600">Loading chat settings...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <p className="text-red-600">Access denied. Admin authentication required.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chat Settings</h1>
            <p className="text-gray-600 mt-2">Configure chat availability and behavior</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={loadSettings} 
              disabled={isLoading} 
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleReset} 
              disabled={isSaving} 
              variant="outline"
              size="sm"
            >
              Reset
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isLoading} 
              className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        {/* Current Status */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isChatOnline() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Chat Status: {isChatOnline() ? 'Online' : 'Offline'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isChatOnline() 
                      ? (settings.workingHours.start === '00:00' && settings.workingHours.end === '23:59')
                        ? 'Available 24/7'
                        : `Available until ${settings.workingHours.end}`
                      : `Opens at ${settings.workingHours.start}`
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Time ({settings.timezone})</p>
                <p className="font-mono text-lg">{new Date().toLocaleTimeString('en-US', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: settings.timezone
                })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="hours">Working Hours</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enabled" className="text-base font-medium">Enable Chat Support</Label>
                    <p className="text-sm text-gray-600">Allow customers to start live chat sessions</p>
                  </div>
                  <Switch
                    id="enabled"
                    checked={settings.isEnabled}
                    onCheckedChange={(checked) => updateSetting('isEnabled', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxChats">Max Concurrent Chats</Label>
                    <Input
                      id="maxChats"
                      type="number"
                      min="1"
                      max="20"
                      value={settings.maxConcurrentChats}
                      onChange={(e) => updateSetting('maxConcurrentChats', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum number of chats per agent</p>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Used for working hours calculation</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoAssign" className="text-base font-medium">Auto-Assign Chats</Label>
                    <p className="text-sm text-gray-600">Automatically assign new chats to available agents</p>
                  </div>
                  <Switch
                    id="autoAssign"
                    checked={settings.autoAssign}
                    onCheckedChange={(checked) => updateSetting('autoAssign', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Working Hours */}
          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Working Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={settings.workingHours.start}
                      onChange={(e) => updateWorkingHours('start', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={settings.workingHours.end}
                      onChange={(e) => updateWorkingHours('end', e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Quick Presets</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateWorkingHours('start', '09:00')
                        updateWorkingHours('end', '17:00')
                      }}
                    >
                      9 AM - 5 PM
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateWorkingHours('start', '08:00')
                        updateWorkingHours('end', '18:00')
                      }}
                    >
                      8 AM - 6 PM
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateWorkingHours('start', '10:00')
                        updateWorkingHours('end', '19:00')
                      }}
                    >
                      10 AM - 7 PM
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateWorkingHours('start', '00:00')
                        updateWorkingHours('end', '23:59')
                      }}
                    >
                      24/7
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Channels */}
          <TabsContent value="channels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={settings.whatsappNumber}
                    onChange={(e) => updateSetting('whatsappNumber', e.target.value)}
                    placeholder="+966501234567"
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +966 for Saudi Arabia)</p>
                </div>

                <div>
                  <Label htmlFor="email">Support Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.emailAddress}
                    onChange={(e) => updateSetting('emailAddress', e.target.value)}
                    placeholder="support@drinkmates.com"
                  />
                </div>

                <div>
                  <Label htmlFor="offlineMessage">Offline Message</Label>
                  <textarea
                    id="offlineMessage"
                    value={settings.offlineMessage}
                    onChange={(e) => updateSetting('offlineMessage', e.target.value)}
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-transparent"
                    placeholder="Message shown when chat is offline..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Message displayed to customers when chat is offline</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Features</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced chat settings like routing rules, escalation policies, and integrations will be available here.
                  </p>
                  <Button variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
