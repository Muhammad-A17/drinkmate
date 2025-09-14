"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Settings,
  CheckCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationsManagerProps {
  isDoNotDisturb: boolean
  onToggleDoNotDisturb: (enabled: boolean) => void
  className?: string
}

interface NotificationSettings {
  soundEnabled: boolean
  desktopNotifications: boolean
  soundVolume: number
  notificationTypes: {
    newMessage: boolean
    mention: boolean
    assignment: boolean
    urgent: boolean
    system: boolean
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

const notificationSounds = [
  { value: 'default', label: 'Default', description: 'Standard notification sound' },
  { value: 'gentle', label: 'Gentle', description: 'Soft, pleasant tone' },
  { value: 'urgent', label: 'Urgent', description: 'Attention-grabbing sound' },
  { value: 'custom', label: 'Custom', description: 'Upload your own sound' }
]

export default function NotificationsManager({
  isDoNotDisturb,
  onToggleDoNotDisturb,
  className
}: NotificationsManagerProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    desktopNotifications: true,
    soundVolume: 70,
    notificationTypes: {
      newMessage: true,
      mention: true,
      assignment: true,
      urgent: true,
      system: false
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })

  const [showSettings, setShowSettings] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('chat-notification-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('chat-notification-settings', JSON.stringify(settings))
  }, [settings])

  // Request notification permission
  useEffect(() => {
    if (settings.desktopNotifications && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [settings.desktopNotifications])

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleNotificationTypeChange = (type: keyof NotificationSettings['notificationTypes'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: enabled
      }
    }))
  }

  const playTestSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = settings.soundVolume / 100
      audioRef.current.play()
    }
  }

  const showTestNotification = () => {
    if (settings.desktopNotifications && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Chat Management',
        icon: '/favicon.ico',
        tag: 'test'
      })
    }
  }

  const isQuietHours = () => {
    if (!settings.quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const startTime = parseInt(settings.quietHours.start.split(':')[0]) * 60 + parseInt(settings.quietHours.start.split(':')[1])
    const endTime = parseInt(settings.quietHours.end.split(':')[0]) * 60 + parseInt(settings.quietHours.end.split(':')[1])

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime
    } else {
      return currentTime >= startTime || currentTime < endTime
    }
  }

  const shouldPlaySound = (type: keyof NotificationSettings['notificationTypes']) => {
    return settings.soundEnabled && 
           settings.notificationTypes[type] && 
           !isDoNotDisturb && 
           !isQuietHours()
  }

  const shouldShowDesktopNotification = (type: keyof NotificationSettings['notificationTypes']) => {
    return settings.desktopNotifications && 
           settings.notificationTypes[type] && 
           !isDoNotDisturb && 
           !isQuietHours()
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          {isDoNotDisturb ? (
            <BellOff className="w-5 h-5 text-red-500" />
          ) : (
            <Bell className="w-5 h-5 text-green-500" />
          )}
          <div>
            <div className="font-medium text-gray-900">
              {isDoNotDisturb ? 'Do Not Disturb' : 'Notifications On'}
            </div>
            <div className="text-sm text-gray-600">
              {isDoNotDisturb 
                ? 'You will not receive notifications' 
                : 'You will receive notifications based on your settings'
              }
            </div>
          </div>
        </div>
        <Switch
          checked={!isDoNotDisturb}
          onCheckedChange={(checked) => onToggleDoNotDisturb(!checked)}
        />
      </div>

      {/* Settings Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSettings(!showSettings)}
        className="w-full"
      >
        <Settings className="w-4 h-4 mr-2" />
        Notification Settings
      </Button>

      {/* Detailed Settings */}
      {showSettings && (
        <div className="space-y-4 p-4 border rounded-lg bg-white">
          {/* Sound Settings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Sound Notifications</Label>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
              />
            </div>
            
            {settings.soundEnabled && (
              <div className="space-y-3 ml-4">
                <div>
                  <Label className="text-xs text-gray-600">Volume</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <VolumeX className="w-4 h-4 text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.soundVolume}
                      onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 w-8">{settings.soundVolume}%</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-600">Sound Type</Label>
                  <Select defaultValue="default">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationSounds.map((sound) => (
                        <SelectItem key={sound.value} value={sound.value}>
                          <div>
                            <div className="font-medium">{sound.label}</div>
                            <div className="text-xs text-gray-600">{sound.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playTestSound}
                  className="w-full"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Test Sound
                </Button>
              </div>
            )}
          </div>

          {/* Desktop Notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Desktop Notifications</Label>
              <Switch
                checked={settings.desktopNotifications}
                onCheckedChange={(checked) => handleSettingChange('desktopNotifications', checked)}
              />
            </div>
            
            {settings.desktopNotifications && (
              <Button
                variant="outline"
                size="sm"
                onClick={showTestNotification}
                className="w-full ml-4"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Test Desktop Notification
              </Button>
            )}
          </div>

          {/* Notification Types */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Notification Types</Label>
            <div className="space-y-2 ml-4">
              {Object.entries(settings.notificationTypes).map(([type, enabled]) => (
                <div key={type} className="flex items-center justify-between">
                  <Label className="text-sm capitalize">
                    {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => handleNotificationTypeChange(type as any, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Quiet Hours</Label>
              <Switch
                checked={settings.quietHours.enabled}
                onCheckedChange={(checked) => 
                  handleSettingChange('quietHours', { ...settings.quietHours, enabled: checked })
                }
              />
            </div>
            
            {settings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-2 ml-4">
                <div>
                  <Label className="text-xs text-gray-600">Start</Label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => 
                      handleSettingChange('quietHours', { ...settings.quietHours, start: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">End</Label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => 
                      handleSettingChange('quietHours', { ...settings.quietHours, end: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status Indicators */}
          <div className="pt-3 border-t">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {isDoNotDisturb ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <span className={isDoNotDisturb ? 'text-red-600' : 'text-green-600'}>
                  {isDoNotDisturb ? 'Do Not Disturb Active' : 'Notifications Active'}
                </span>
              </div>
              
              {isQuietHours() && (
                <div className="flex items-center gap-2">
                  <BellOff className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-600">Quiet Hours Active</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element for test sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.wav" type="audio/wav" />
      </audio>
    </div>
  )
}
