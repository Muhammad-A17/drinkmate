"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Clock, 
  Calendar, 
  Bell, 
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SnoozeModalProps {
  isOpen: boolean
  onClose: () => void
  onSnooze: (snoozeData: SnoozeData) => void
  conversationId: string
  customerName: string
}

interface SnoozeData {
  duration: number // hours
  until: string // ISO timestamp
  reason: string
  reminder?: string
}

const snoozePresets = [
  { label: '30 minutes', value: 0.5, icon: '⏰' },
  { label: '1 hour', value: 1, icon: '🕐' },
  { label: '2 hours', value: 2, icon: '🕑' },
  { label: '4 hours', value: 4, icon: '🕓' },
  { label: '8 hours', value: 8, icon: '🕗' },
  { label: 'Tomorrow', value: 24, icon: '🌅' },
  { label: 'Next week', value: 168, icon: '📅' }
]

const reminderPresets = [
  'Follow up on order issue',
  'Check back on refund request',
  'Verify customer information',
  'Review technical support case',
  'Confirm delivery details',
  'Process return request',
  'Update customer on status'
]

export default function SnoozeModal({
  isOpen,
  onClose,
  onSnooze,
  conversationId,
  customerName
}: SnoozeModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [customHours, setCustomHours] = useState('')
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [reason, setReason] = useState('')
  const [reminder, setReminder] = useState('')
  const [useCustomTime, setUseCustomTime] = useState(false)

  const handlePresetSelect = (preset: typeof snoozePresets[0]) => {
    setSelectedPreset(preset.value.toString())
    setUseCustomTime(false)
  }

  const handleCustomTimeToggle = () => {
    setUseCustomTime(!useCustomTime)
    setSelectedPreset('')
  }

  const calculateSnoozeUntil = (): string => {
    if (useCustomTime && customDate && customTime) {
      return new Date(`${customDate}T${customTime}`).toISOString()
    } else if (selectedPreset) {
      const hours = parseFloat(selectedPreset)
      return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    } else if (customHours) {
      const hours = parseFloat(customHours)
      return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    }
    return ''
  }

  const handleSubmit = () => {
    const until = calculateSnoozeUntil()
    if (!until) return

    const duration = useCustomTime 
      ? (new Date(until).getTime() - Date.now()) / (1000 * 60 * 60)
      : parseFloat(selectedPreset || customHours)

    onSnooze({
      duration,
      until,
      reason: reason || 'No reason provided',
      reminder: reminder || undefined
    })

    // Reset form
    setSelectedPreset('')
    setCustomHours('')
    setCustomDate('')
    setCustomTime('')
    setReason('')
    setReminder('')
    setUseCustomTime(false)
    onClose()
  }

  const getSnoozePreview = () => {
    const until = calculateSnoozeUntil()
    if (!until) return ''

    const date = new Date(until)
    const now = new Date()
    const diffHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) {
      const diffMinutes = Math.round((date.getTime() - now.getTime()) / (1000 * 60))
      return `Will wake up in ${diffMinutes} minutes`
    } else if (diffHours < 24) {
      return `Will wake up in ${diffHours} hours (${date.toLocaleTimeString()})`
    } else {
      const diffDays = Math.round(diffHours / 24)
      return `Will wake up in ${diffDays} days (${date.toLocaleDateString()})`
    }
  }

  const isFormValid = () => {
    if (useCustomTime) {
      return customDate && customTime
    } else {
      return selectedPreset || customHours
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Snooze Conversation
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Snooze conversation with <strong>{customerName}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Presets */}
          <div>
            <Label className="text-sm font-medium">Quick Snooze</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {snoozePresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-colors",
                    selectedPreset === preset.value.toString()
                      ? "border-orange-200 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-sm font-medium">{preset.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Duration */}
          <div>
            <Label className="text-sm font-medium">Custom Duration</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                placeholder="Hours"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                className="flex-1"
                min="0.1"
                step="0.1"
              />
              <span className="text-sm text-gray-500 self-center">hours</span>
            </div>
          </div>

          {/* Custom Date/Time */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="customTime"
                checked={useCustomTime}
                onChange={handleCustomTimeToggle}
                className="rounded"
              />
              <Label htmlFor="customTime" className="text-sm font-medium">
                Set specific date and time
              </Label>
            </div>
            
            {useCustomTime && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">Date</Label>
                  <Input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Time</Label>
                  <Input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <Label className="text-sm font-medium">Reason (optional)</Label>
            <Textarea
              placeholder="Why are you snoozing this conversation?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Reminder */}
          <div>
            <Label className="text-sm font-medium">Reminder Note (optional)</Label>
            <Select value={reminder} onValueChange={setReminder}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reminder or type custom" />
              </SelectTrigger>
              <SelectContent>
                {reminderPresets.map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Or type custom reminder..."
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Preview */}
          {isFormValid() && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">{getSnoozePreview()}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Clock className="w-4 h-4 mr-2" />
            Snooze Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
