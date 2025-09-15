"use client"

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useContactSettings, ContactProvider } from '@/lib/contact-settings-context'
import AdminLayout from '@/components/layout/AdminLayout'
import { 
  Settings, 
  MessageSquare, 
  Clock, 
  Mail, 
  Phone, 
  Globe, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Users,
  Shield,
  Zap,
  Bell
} from 'lucide-react'

function ContactSettingsPageContent() {
  const { t, isRTL } = useTranslation()
  const { settings, updateSettings, getText } = useContactSettings()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Save to backend
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 space-y-8 p-6">
          {/* Premium Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Contact Page Settings
                    </h1>
                    <p className="text-gray-600 text-lg mt-2">Configure contact methods, availability, and copy</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                    <Activity className="w-4 h-4 mr-1" />
                    Settings Management
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Active Configuration
                  </span>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Tabs */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
            <Tabs defaultValue="methods" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 p-1 rounded-xl">
                <TabsTrigger 
                  value="methods" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Methods
                </TabsTrigger>
                <TabsTrigger 
                  value="availability"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Availability
                </TabsTrigger>
                <TabsTrigger 
                  value="form"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Form Settings
                </TabsTrigger>
                <TabsTrigger 
                  value="copy"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Copy & Localization
                </TabsTrigger>
              </TabsList>

              {/* Contact Methods */}
              <TabsContent value="methods" className="space-y-6">
                {/* WhatsApp Settings */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">WhatsApp Settings</h3>
                      <p className="text-gray-600">Configure WhatsApp contact integration</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                      <div>
                        <Label htmlFor="whatsapp-enabled" className="text-lg font-semibold text-gray-900">Enable WhatsApp</Label>
                        <p className="text-sm text-gray-600">Allow customers to contact via WhatsApp</p>
                      </div>
                      <Switch
                        id="whatsapp-enabled"
                        checked={settings.whatsapp.enabled}
                        onCheckedChange={(checked) => 
                          updateSettings({ 
                            whatsapp: { ...settings.whatsapp, enabled: checked } 
                          })
                        }
                        className="data-[state=checked]:bg-green-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-number" className="text-lg font-semibold text-gray-900">WhatsApp Number</Label>
                      <Input
                        id="whatsapp-number"
                        value={settings.whatsapp.number}
                        onChange={(e) => 
                          updateSettings({ 
                            whatsapp: { ...settings.whatsapp, number: e.target.value } 
                          })
                        }
                        placeholder="+966501234567"
                        className="h-12 text-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-message" className="text-lg font-semibold text-gray-900">Message Template</Label>
                      <Textarea
                        id="whatsapp-message"
                        value={settings.whatsapp.messageTemplate}
                        onChange={(e) => 
                          updateSettings({ 
                            whatsapp: { ...settings.whatsapp, messageTemplate: e.target.value } 
                          })
                        }
                        placeholder="Hello! I need help with my order."
                        className="border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Email Settings */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Email Settings</h3>
                      <p className="text-gray-600">Configure email contact integration</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                      <div>
                        <Label htmlFor="email-enabled" className="text-lg font-semibold text-gray-900">Enable Email</Label>
                        <p className="text-sm text-gray-600">Allow customers to contact via email</p>
                      </div>
                      <Switch
                        id="email-enabled"
                        checked={settings.email.enabled}
                        onCheckedChange={(checked) => 
                          updateSettings({ 
                            email: { ...settings.email, enabled: checked } 
                          })
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email-address" className="text-lg font-semibold text-gray-900">Support Email</Label>
                      <Input
                        id="email-address"
                        value={settings.email.address}
                        onChange={(e) => 
                          updateSettings({ 
                            email: { ...settings.email, address: e.target.value } 
                          })
                        }
                        placeholder="support@drinkmates.com"
                        className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email-subject" className="text-lg font-semibold text-gray-900">Default Subject</Label>
                      <Input
                        id="email-subject"
                        value={settings.email.subject}
                        onChange={(e) => 
                          updateSettings({ 
                            email: { ...settings.email, subject: e.target.value } 
                          })
                        }
                        placeholder="Contact Form Submission"
                        className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Chat Settings */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Live Chat Settings</h3>
                      <p className="text-gray-600">Configure live chat availability and settings</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                      <div>
                        <Label htmlFor="chat-enabled" className="text-lg font-semibold text-gray-900">Enable Live Chat</Label>
                        <p className="text-sm text-gray-600">Allow customers to chat in real-time</p>
                      </div>
                      <Switch
                        id="chat-enabled"
                        checked={settings.chat.enabled}
                        onCheckedChange={(checked) => 
                          updateSettings({ 
                            chat: { ...settings.chat, enabled: checked } 
                          })
                        }
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="chat-start" className="text-lg font-semibold text-gray-900">Start Time</Label>
                        <Input
                          id="chat-start"
                          type="time"
                          value={settings.chat.hours.start}
                          onChange={(e) => 
                            updateSettings({ 
                              chat: { 
                                ...settings.chat, 
                                hours: { ...settings.chat.hours, start: e.target.value } 
                              }
                            })
                          }
                          className="h-12 text-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chat-end" className="text-lg font-semibold text-gray-900">End Time</Label>
                        <Input
                          id="chat-end"
                          type="time"
                          value={settings.chat.hours.end}
                          onChange={(e) => 
                            updateSettings({ 
                              chat: { 
                                ...settings.chat, 
                                hours: { ...settings.chat.hours, end: e.target.value } 
                              }
                            })
                          }
                          className="h-12 text-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Availability Settings */}
              <TabsContent value="availability" className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Chat Hours & Holidays</h3>
                      <p className="text-gray-600">Configure availability and holiday schedules</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-lg font-semibold text-gray-900">Timezone</Label>
                      <Select
                        value={settings.chat.hours.timezone}
                        onValueChange={(value) => 
                          updateSettings({ 
                            chat: { 
                              ...settings.chat, 
                              hours: { ...settings.chat.hours, timezone: value } 
                            }
                          })
                        }
                      >
                        <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Riyadh">Asia/Riyadh</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="holidays" className="text-lg font-semibold text-gray-900">Holiday Dates (one per line)</Label>
                      <Textarea
                        id="holidays"
                        value={settings.chat.holidays.join('\n')}
                        onChange={(e) => 
                          updateSettings({ 
                            chat: { 
                              ...settings.chat, 
                              holidays: e.target.value.split('\n').filter(date => date.trim()) 
                            }
                          })
                        }
                        placeholder="2024-01-01&#10;2024-12-25"
                        className="border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Form Settings */}
              <TabsContent value="form" className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Contact Form Configuration</h3>
                      <p className="text-gray-600">Configure form settings and file uploads</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                      <div>
                        <Label htmlFor="form-enabled" className="text-lg font-semibold text-gray-900">Enable Contact Form</Label>
                        <p className="text-sm text-gray-600">Allow customers to submit contact forms</p>
                      </div>
                      <Switch
                        id="form-enabled"
                        checked={settings.form.enabled}
                        onCheckedChange={(checked) => 
                          updateSettings({ 
                            form: { ...settings.form, enabled: checked } 
                          })
                        }
                        className="data-[state=checked]:bg-indigo-600"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="max-attachments" className="text-lg font-semibold text-gray-900">Max Attachments</Label>
                        <Input
                          id="max-attachments"
                          type="number"
                          value={settings.form.maxAttachments}
                          onChange={(e) => 
                            updateSettings({ 
                              form: { ...settings.form, maxAttachments: parseInt(e.target.value) } 
                            })
                          }
                          className="h-12 text-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-file-size" className="text-lg font-semibold text-gray-900">Max File Size (MB)</Label>
                        <Input
                          id="max-file-size"
                          type="number"
                          value={settings.form.maxFileSize}
                          onChange={(e) => 
                            updateSettings({ 
                              form: { ...settings.form, maxFileSize: parseInt(e.target.value) } 
                            })
                          }
                          className="h-12 text-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="allowed-types" className="text-lg font-semibold text-gray-900">Allowed File Types</Label>
                      <Input
                        id="allowed-types"
                        value={settings.form.allowedFileTypes.join(', ')}
                        onChange={(e) => 
                          updateSettings({ 
                            form: { 
                              ...settings.form, 
                              allowedFileTypes: e.target.value.split(',').map(type => type.trim()) 
                            }
                          })
                        }
                        placeholder="image/jpeg, image/png, application/pdf"
                        className="h-12 text-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Copy & Localization */}
              <TabsContent value="copy" className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl shadow-lg">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Page Copy & Localization</h3>
                      <p className="text-gray-600">Configure multilingual content and messaging</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="page-title-en" className="text-lg font-semibold text-gray-900">Page Title (English)</Label>
                        <Input
                          id="page-title-en"
                          value={settings.copy['page.title']?.en || ''}
                          onChange={(e) => 
                            updateSettings({ 
                              copy: { 
                                ...settings.copy, 
                                'page.title': { 
                                  ...settings.copy['page.title'], 
                                  en: e.target.value 
                                }
                              }
                            })
                          }
                          className="h-12 text-lg border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="page-title-ar" className="text-lg font-semibold text-gray-900">Page Title (Arabic)</Label>
                        <Input
                          id="page-title-ar"
                          value={settings.copy['page.title']?.ar || ''}
                          onChange={(e) => 
                            updateSettings({ 
                              copy: { 
                                ...settings.copy, 
                                'page.title': { 
                                  ...settings.copy['page.title'], 
                                  ar: e.target.value 
                                }
                              }
                            })
                          }
                          className="h-12 text-lg border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function ContactSettingsPage() {
  return (
    <ContactProvider>
      <ContactSettingsPageContent />
    </ContactProvider>
  )
}
