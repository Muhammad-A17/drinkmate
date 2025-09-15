"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Clock, 
  Users, 
  MessageSquare, 
  Shield, 
  Bell,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Globe,
  Lock,
  Unlock
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/translation-context'
import AdminLayout from '@/components/layout/AdminLayout'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface BusinessHours {
  enabled: boolean
  timezone: string
  monday: { open: string; close: string; enabled: boolean }
  tuesday: { open: string; close: string; enabled: boolean }
  wednesday: { open: string; close: string; enabled: boolean }
  thursday: { open: string; close: string; enabled: boolean }
  friday: { open: string; close: string; enabled: boolean }
  saturday: { open: string; close: string; enabled: boolean }
  sunday: { open: string; close: string; enabled: boolean }
  holidays: Array<{ date: string; name: string; enabled: boolean }>
}

interface RoutingRules {
  autoAssign: boolean
  assignmentStrategy: 'round_robin' | 'load_balanced' | 'skill_based'
  maxConcurrentChats: number
  skillBasedRouting: boolean
  skills: Array<{ name: string; weight: number }>
  priorityRouting: boolean
  escalationRules: Array<{
    condition: string
    action: string
    threshold: number
  }>
}

interface Permissions {
  roles: Array<{
    name: string
    permissions: string[]
    description: string
  }>
  features: Array<{
    name: string
    enabled: boolean
    description: string
  }>
}

interface NotificationSettings {
  email: {
    enabled: boolean
    newChat: boolean
    chatAssigned: boolean
    chatClosed: boolean
    slaBreach: boolean
  }
  desktop: {
    enabled: boolean
    newChat: boolean
    chatAssigned: boolean
    chatClosed: boolean
    slaBreach: boolean
  }
  sound: {
    enabled: boolean
    volume: number
    newChat: boolean
    chatAssigned: boolean
    chatClosed: boolean
    slaBreach: boolean
  }
}

export default function ChatSettingsPage() {
  const { user } = useAuth()
  const { isRTL } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('business-hours')

  // Business Hours State
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    enabled: true,
    timezone: 'Asia/Riyadh',
    monday: { open: '09:00', close: '17:00', enabled: true },
    tuesday: { open: '09:00', close: '17:00', enabled: true },
    wednesday: { open: '09:00', close: '17:00', enabled: true },
    thursday: { open: '09:00', close: '17:00', enabled: true },
    friday: { open: '09:00', close: '17:00', enabled: true },
    saturday: { open: '10:00', close: '16:00', enabled: true },
    sunday: { open: '10:00', close: '16:00', enabled: true },
    holidays: []
  })

  // Routing Rules State
  const [routingRules, setRoutingRules] = useState<RoutingRules>({
    autoAssign: true,
    assignmentStrategy: 'round_robin',
    maxConcurrentChats: 5,
    skillBasedRouting: false,
    skills: [
      { name: 'Technical Support', weight: 1 },
      { name: 'Billing', weight: 1 },
      { name: 'General', weight: 1 }
    ],
    priorityRouting: true,
    escalationRules: [
      { condition: 'response_time', action: 'escalate', threshold: 30 },
      { condition: 'customer_rating', action: 'assign_senior', threshold: 2 }
    ]
  })

  // Permissions State
  const [permissions, setPermissions] = useState<Permissions>({
    roles: [
      {
        name: 'Admin',
        permissions: ['all'],
        description: 'Full access to all features'
      },
      {
        name: 'Supervisor',
        permissions: ['view_chats', 'assign_chats', 'close_chats', 'view_reports'],
        description: 'Can manage chats and view reports'
      },
      {
        name: 'Agent',
        permissions: ['view_assigned_chats', 'send_messages', 'close_chats'],
        description: 'Can handle assigned chats'
      },
      {
        name: 'Viewer',
        permissions: ['view_chats'],
        description: 'Read-only access'
      }
    ],
    features: [
      { name: 'Chat Management', enabled: true, description: 'Core chat functionality' },
      { name: 'SLA Tracking', enabled: true, description: 'Service level agreement monitoring' },
      { name: 'Reporting', enabled: true, description: 'Analytics and reporting' },
      { name: 'Customer Blocking', enabled: true, description: 'Block problematic customers' },
      { name: 'Auto Assignment', enabled: true, description: 'Automatic chat assignment' },
      { name: 'Notifications', enabled: true, description: 'Real-time notifications' }
    ]
  })

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      newChat: true,
      chatAssigned: true,
      chatClosed: false,
      slaBreach: true
    },
    desktop: {
      enabled: true,
      newChat: true,
      chatAssigned: true,
      chatClosed: false,
      slaBreach: true
    },
    sound: {
      enabled: true,
      volume: 70,
      newChat: true,
      chatAssigned: true,
      chatClosed: false,
      slaBreach: true
    }
  })

  const tabs = [
    { id: 'business-hours', label: 'Business Hours', icon: Clock },
    { id: 'routing', label: 'Routing Rules', icon: Users },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  const timezones = [
    'Asia/Riyadh',
    'Asia/Dubai',
    'Europe/London',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Australia/Sydney'
  ]

  const handleSave = async (section: string) => {
    setIsLoading(true)
    try {
      // In real app, save to backend
      console.log(`Saving ${section}:`, {
        businessHours,
        routingRules,
        permissions,
        notificationSettings
      })
      
      toast.success(`${section} settings saved successfully`)
    } catch (error) {
      console.error(`Error saving ${section}:`, error)
      toast.error(`Failed to save ${section} settings`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBusinessHoursChange = (day: string, field: string, value: any) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof BusinessHours] as any,
        [field]: value
      }
    }))
  }

  const addHoliday = () => {
    setBusinessHours(prev => ({
      ...prev,
      holidays: [...prev.holidays, { date: '', name: '', enabled: true }]
    }))
  }

  const removeHoliday = (index: number) => {
    setBusinessHours(prev => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== index)
    }))
  }

  const addSkill = () => {
    setRoutingRules(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', weight: 1 }]
    }))
  }

  const removeSkill = (index: number) => {
    setRoutingRules(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const addEscalationRule = () => {
    setRoutingRules(prev => ({
      ...prev,
      escalationRules: [...prev.escalationRules, { condition: 'response_time', action: 'escalate', threshold: 30 }]
    }))
  }

  const removeEscalationRule = (index: number) => {
    setRoutingRules(prev => ({
      ...prev,
      escalationRules: prev.escalationRules.filter((_, i) => i !== index)
    }))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat Settings</h1>
            <p className="text-gray-600">Configure chat system behavior and permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Business Hours Tab */}
        {activeTab === 'business-hours' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Business Hours Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Enable Business Hours</Label>
                    <p className="text-sm text-gray-600">Control when chat is available</p>
                  </div>
                  <Switch
                    checked={businessHours.enabled}
                    onCheckedChange={(checked) => setBusinessHours(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Timezone</Label>
                  <Select
                    value={businessHours.timezone}
                    onValueChange={(value) => setBusinessHours(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Weekly Schedule</h4>
                  {Object.entries(businessHours).filter(([key]) => 
                    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(key)
                  ).map(([day, schedule]) => (
                    <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-20">
                        <Label className="text-sm font-medium capitalize">{day}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={(checked) => handleBusinessHoursChange(day, 'enabled', checked)}
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </div>
                      {schedule.enabled && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={schedule.open}
                            onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                            className="w-32"
                          />
                          <span className="text-sm text-gray-600">to</span>
                          <Input
                            type="time"
                            value={schedule.close}
                            onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Holidays</h4>
                    <Button variant="outline" size="sm" onClick={addHoliday}>
                      Add Holiday
                    </Button>
                  </div>
                  {businessHours.holidays.map((holiday, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Input
                        type="date"
                        value={holiday.date}
                        onChange={(e) => setBusinessHours(prev => ({
                          ...prev,
                          holidays: prev.holidays.map((h, i) => 
                            i === index ? { ...h, date: e.target.value } : h
                          )
                        }))}
                        className="w-40"
                      />
                      <Input
                        placeholder="Holiday name"
                        value={holiday.name}
                        onChange={(e) => setBusinessHours(prev => ({
                          ...prev,
                          holidays: prev.holidays.map((h, i) => 
                            i === index ? { ...h, name: e.target.value } : h
                          )
                        }))}
                        className="flex-1"
                      />
                      <Switch
                        checked={holiday.enabled}
                        onCheckedChange={(checked) => setBusinessHours(prev => ({
                          ...prev,
                          holidays: prev.holidays.map((h, i) => 
                            i === index ? { ...h, enabled: checked } : h
                          )
                        }))}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeHoliday(index)}
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSave('Business Hours')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Business Hours
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Routing Rules Tab */}
        {activeTab === 'routing' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Chat Routing Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto Assignment</Label>
                    <p className="text-sm text-gray-600">Automatically assign incoming chats</p>
                  </div>
                  <Switch
                    checked={routingRules.autoAssign}
                    onCheckedChange={(checked) => setRoutingRules(prev => ({ ...prev, autoAssign: checked }))}
                  />
                </div>

                {routingRules.autoAssign && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Assignment Strategy</Label>
                      <Select
                        value={routingRules.assignmentStrategy}
                        onValueChange={(value) => setRoutingRules(prev => ({ ...prev, assignmentStrategy: value as any }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="round_robin">Round Robin</SelectItem>
                          <SelectItem value="load_balanced">Load Balanced</SelectItem>
                          <SelectItem value="skill_based">Skill Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Max Concurrent Chats per Agent</Label>
                      <Input
                        type="number"
                        value={routingRules.maxConcurrentChats}
                        onChange={(e) => setRoutingRules(prev => ({ ...prev, maxConcurrentChats: parseInt(e.target.value) }))}
                        className="mt-1"
                        min="1"
                        max="20"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Skill-Based Routing</Label>
                        <p className="text-sm text-gray-600">Route chats based on agent skills</p>
                      </div>
                      <Switch
                        checked={routingRules.skillBasedRouting}
                        onCheckedChange={(checked) => setRoutingRules(prev => ({ ...prev, skillBasedRouting: checked }))}
                      />
                    </div>

                    {routingRules.skillBasedRouting && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Skills</h4>
                          <Button variant="outline" size="sm" onClick={addSkill}>
                            Add Skill
                          </Button>
                        </div>
                        {routingRules.skills.map((skill, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                            <Input
                              placeholder="Skill name"
                              value={skill.name}
                              onChange={(e) => setRoutingRules(prev => ({
                                ...prev,
                                skills: prev.skills.map((s, i) => 
                                  i === index ? { ...s, name: e.target.value } : s
                                )
                              }))}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={skill.weight}
                              onChange={(e) => setRoutingRules(prev => ({
                                ...prev,
                                skills: prev.skills.map((s, i) => 
                                  i === index ? { ...s, weight: parseInt(e.target.value) } : s
                                )
                              }))}
                              className="w-20"
                              min="1"
                              max="10"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSkill(index)}
                              className="text-red-600"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Escalation Rules</h4>
                        <Button variant="outline" size="sm" onClick={addEscalationRule}>
                          Add Rule
                        </Button>
                      </div>
                      {routingRules.escalationRules.map((rule, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                          <Select
                            value={rule.condition}
                            onValueChange={(value) => setRoutingRules(prev => ({
                              ...prev,
                              escalationRules: prev.escalationRules.map((r, i) => 
                                i === index ? { ...r, condition: value } : r
                              )
                            }))}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="response_time">Response Time</SelectItem>
                              <SelectItem value="customer_rating">Customer Rating</SelectItem>
                              <SelectItem value="chat_duration">Chat Duration</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={rule.action}
                            onValueChange={(value) => setRoutingRules(prev => ({
                              ...prev,
                              escalationRules: prev.escalationRules.map((r, i) => 
                                i === index ? { ...r, action: value } : r
                              )
                            }))}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="escalate">Escalate</SelectItem>
                              <SelectItem value="assign_senior">Assign Senior</SelectItem>
                              <SelectItem value="notify_manager">Notify Manager</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            value={rule.threshold}
                            onChange={(e) => setRoutingRules(prev => ({
                              ...prev,
                              escalationRules: prev.escalationRules.map((r, i) => 
                                i === index ? { ...r, threshold: parseInt(e.target.value) } : r
                              )
                            }))}
                            className="w-20"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeEscalationRule(index)}
                            className="text-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Button
                  onClick={() => handleSave('Routing Rules')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Routing Rules
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Role-Based Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Roles</h4>
                  {permissions.roles.map((role, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5 className="font-medium">{role.name}</h5>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        <Badge className={cn(
                          "text-xs",
                          role.name === 'Admin' && "bg-red-100 text-red-800",
                          role.name === 'Supervisor' && "bg-blue-100 text-blue-800",
                          role.name === 'Agent' && "bg-green-100 text-green-800",
                          role.name === 'Viewer' && "bg-gray-100 text-gray-800"
                        )}>
                          {role.permissions.length} permissions
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission, pIndex) => (
                          <Badge key={pIndex} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Feature Access</h4>
                  {permissions.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{feature.name}</h5>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={(checked) => setPermissions(prev => ({
                          ...prev,
                          features: prev.features.map((f, i) => 
                            i === index ? { ...f, enabled: checked } : f
                          )
                        }))}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSave('Permissions')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Permissions
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.email.enabled}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, enabled: checked }
                      }))}
                    />
                  </div>
                  {notificationSettings.email.enabled && (
                    <div className="space-y-2 ml-4">
                      {Object.entries(notificationSettings.email).filter(([key]) => key !== 'enabled').map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Label>
                          <Switch
                            checked={value as boolean}
                            onCheckedChange={(checked) => setNotificationSettings(prev => ({
                              ...prev,
                              email: { ...prev.email, [key]: checked }
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Desktop Notifications</h4>
                      <p className="text-sm text-gray-600">Show browser notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.desktop.enabled}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        desktop: { ...prev.desktop, enabled: checked }
                      }))}
                    />
                  </div>
                  {notificationSettings.desktop.enabled && (
                    <div className="space-y-2 ml-4">
                      {Object.entries(notificationSettings.desktop).filter(([key]) => key !== 'enabled').map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Label>
                          <Switch
                            checked={value as boolean}
                            onCheckedChange={(checked) => setNotificationSettings(prev => ({
                              ...prev,
                              desktop: { ...prev.desktop, [key]: checked }
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sound Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sound Notifications</h4>
                      <p className="text-sm text-gray-600">Play sounds for notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.sound.enabled}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        sound: { ...prev.sound, enabled: checked }
                      }))}
                    />
                  </div>
                  {notificationSettings.sound.enabled && (
                    <div className="space-y-4 ml-4">
                      <div>
                        <Label className="text-sm">Volume</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={notificationSettings.sound.volume}
                            aria-label="Sound volume"
                            title="Adjust sound volume"
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              sound: { ...prev.sound, volume: parseInt(e.target.value) }
                            }))}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-600 w-8">{notificationSettings.sound.volume}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(notificationSettings.sound).filter(([key]) => !['enabled', 'volume'].includes(key)).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <Label className="text-sm capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Label>
                            <Switch
                              checked={value as boolean}
                              onCheckedChange={(checked) => setNotificationSettings(prev => ({
                                ...prev,
                                sound: { ...prev.sound, [key]: checked }
                              }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleSave('Notifications')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
