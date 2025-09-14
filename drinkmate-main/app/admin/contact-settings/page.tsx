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
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Contact Page Settings</h1>
          <p className="text-gray-600 mt-2">Configure contact methods, availability, and copy</p>
        </div>

      <Tabs defaultValue="methods" className="space-y-6">
        <TabsList>
          <TabsTrigger value="methods">Contact Methods</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="form">Form Settings</TabsTrigger>
          <TabsTrigger value="copy">Copy & Localization</TabsTrigger>
        </TabsList>

        {/* Contact Methods */}
        <TabsContent value="methods" className="space-y-6">
          {/* WhatsApp Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                WhatsApp Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-enabled">Enable WhatsApp</Label>
                <Switch
                  id="whatsapp-enabled"
                  checked={settings.whatsapp.enabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ 
                      whatsapp: { ...settings.whatsapp, enabled: checked } 
                    })
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                <Input
                  id="whatsapp-number"
                  value={settings.whatsapp.number}
                  onChange={(e) => 
                    updateSettings({ 
                      whatsapp: { ...settings.whatsapp, number: e.target.value } 
                    })
                  }
                  placeholder="+966501234567"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp-message">Message Template</Label>
                <Textarea
                  id="whatsapp-message"
                  value={settings.whatsapp.messageTemplate}
                  onChange={(e) => 
                    updateSettings({ 
                      whatsapp: { ...settings.whatsapp, messageTemplate: e.target.value } 
                    })
                  }
                  placeholder="Hello! I need help with my order."
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✉️</span>
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-enabled">Enable Email</Label>
                <Switch
                  id="email-enabled"
                  checked={settings.email.enabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ 
                      email: { ...settings.email, enabled: checked } 
                    })
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="email-address">Support Email</Label>
                <Input
                  id="email-address"
                  value={settings.email.address}
                  onChange={(e) => 
                    updateSettings({ 
                      email: { ...settings.email, address: e.target.value } 
                    })
                  }
                  placeholder="support@drinkmates.com"
                />
              </div>
              
              <div>
                <Label htmlFor="email-subject">Default Subject</Label>
                <Input
                  id="email-subject"
                  value={settings.email.subject}
                  onChange={(e) => 
                    updateSettings({ 
                      email: { ...settings.email, subject: e.target.value } 
                    })
                  }
                  placeholder="Contact Form Submission"
                />
              </div>
            </CardContent>
          </Card>

          {/* Live Chat Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                Live Chat Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="chat-enabled">Enable Live Chat</Label>
                <Switch
                  id="chat-enabled"
                  checked={settings.chat.enabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ 
                      chat: { ...settings.chat, enabled: checked } 
                    })
                  }
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chat-start">Start Time</Label>
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
                  />
                </div>
                <div>
                  <Label htmlFor="chat-end">End Time</Label>
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Settings */}
        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat Hours & Holidays</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Riyadh">Asia/Riyadh</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="holidays">Holiday Dates (one per line)</Label>
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
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Form Settings */}
        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Form Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="form-enabled">Enable Contact Form</Label>
                <Switch
                  id="form-enabled"
                  checked={settings.form.enabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ 
                      form: { ...settings.form, enabled: checked } 
                    })
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="max-attachments">Max Attachments</Label>
                <Input
                  id="max-attachments"
                  type="number"
                  value={settings.form.maxAttachments}
                  onChange={(e) => 
                    updateSettings({ 
                      form: { ...settings.form, maxAttachments: parseInt(e.target.value) } 
                    })
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  value={settings.form.maxFileSize}
                  onChange={(e) => 
                    updateSettings({ 
                      form: { ...settings.form, maxFileSize: parseInt(e.target.value) } 
                    })
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="allowed-types">Allowed File Types</Label>
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
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Copy & Localization */}
        <TabsContent value="copy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Copy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="page-title-en">Page Title (English)</Label>
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
                />
              </div>
              
              <div>
                <Label htmlFor="page-title-ar">Page Title (Arabic)</Label>
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
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

        <div className="flex justify-end mt-8">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
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
