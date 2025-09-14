"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Tag, 
  Plus, 
  X, 
  Ban, 
  Shield, 
  AlertTriangle,
  User,
  Mail,
  Phone
} from 'lucide-react'
import { Customer } from '@/types/chat'
import { getCustomerDisplayName, getCustomerInitials } from '@/lib/chat-utils'
import { cn } from '@/lib/utils'

interface CustomerTagsModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer
  onUpdateCustomer: (customerId: string, updates: Partial<Customer>) => void
  onBlockCustomer: (customerId: string, blockData: BlockData) => void
}

interface BlockData {
  reason: string
  duration?: string // 'permanent' | '1day' | '1week' | '1month'
  notes?: string
}

const commonTags = [
  'VIP',
  'Frequent Buyer',
  'New Customer',
  'Returning Customer',
  'High Value',
  'Technical Issues',
  'Billing Issues',
  'Refund Request',
  'Complaint',
  'Praise',
  'Reseller',
  'Wholesale',
  'International',
  'Local',
  'Mobile User',
  'Desktop User'
]

const blockDurations = [
  { label: 'Permanent', value: 'permanent' },
  { label: '1 Day', value: '1day' },
  { label: '1 Week', value: '1week' },
  { label: '1 Month', value: '1month' }
]

const blockReasons = [
  'Spam/Abuse',
  'Inappropriate Language',
  'Harassment',
  'Fraudulent Activity',
  'Policy Violation',
  'Repeated Offenses',
  'Other'
]

export default function CustomerTagsModal({
  isOpen,
  onClose,
  customer,
  onUpdateCustomer,
  onBlockCustomer
}: CustomerTagsModalProps) {
  const [newTag, setNewTag] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(customer.tags || [])
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockData, setBlockData] = useState<BlockData>({
    reason: '',
    duration: 'permanent',
    notes: ''
  })

  useEffect(() => {
    setSelectedTags(customer.tags || [])
  }, [customer.tags])

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !selectedTags.includes(tag.trim())) {
      const newTags = [...selectedTags, tag.trim()]
      setSelectedTags(newTags)
      onUpdateCustomer(customer.id, { tags: newTags })
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove)
    setSelectedTags(newTags)
    onUpdateCustomer(customer.id, { tags: newTags })
  }

  const handleAddCustomTag = () => {
    if (newTag.trim()) {
      handleAddTag(newTag.trim())
      setNewTag('')
    }
  }

  const handleBlockCustomer = () => {
    if (blockData.reason) {
      onBlockCustomer(customer.id, blockData)
      setShowBlockModal(false)
      onClose()
    }
  }

  const getBlockExpiry = () => {
    if (blockData.duration === 'permanent') return 'Never'
    
    const now = new Date()
    switch (blockData.duration) {
      case '1day':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toLocaleString()
      case '1week':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleString()
      case '1month':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleString()
      default:
        return 'Never'
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-500" />
              Manage Customer Tags
            </DialogTitle>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                {getCustomerInitials(customer)}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {getCustomerDisplayName(customer)}
                </h3>
                <p className="text-sm text-gray-600">{customer.email}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Tags */}
            <div>
              <Label className="text-sm font-medium">Current Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedTags.length === 0 && (
                  <span className="text-sm text-gray-500">No tags assigned</span>
                )}
              </div>
            </div>

            {/* Add Common Tags */}
            <div>
              <Label className="text-sm font-medium">Add Common Tags</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {commonTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    disabled={selectedTags.includes(tag)}
                    className={cn(
                      "p-2 rounded-lg border text-left text-sm transition-colors",
                      selectedTags.includes(tag)
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Tag */}
            <div>
              <Label className="text-sm font-medium">Add Custom Tag</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Enter custom tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                />
                <Button
                  onClick={handleAddCustomTag}
                  disabled={!newTag.trim()}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Customer Actions */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Customer Actions</h4>
                  <p className="text-sm text-gray-600">Manage customer status and access</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBlockModal(true)}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Ban className="w-4 h-4 mr-1" />
                    Block Customer
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Customer Modal */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="w-5 h-5" />
              Block Customer
            </DialogTitle>
            <p className="text-sm text-gray-600">
              This will prevent <strong>{getCustomerDisplayName(customer)}</strong> from starting new conversations.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Block Reason *</Label>
              <Select value={blockData.reason} onValueChange={(value) => setBlockData(prev => ({ ...prev, reason: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {blockReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Block Duration</Label>
              <Select value={blockData.duration} onValueChange={(value) => setBlockData(prev => ({ ...prev, duration: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {blockDurations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Additional Notes</Label>
              <Textarea
                placeholder="Provide additional details about the block..."
                value={blockData.notes}
                onChange={(e) => setBlockData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            {blockData.duration !== 'permanent' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Block will expire: {getBlockExpiry()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBlockCustomer}
              disabled={!blockData.reason}
              className="bg-red-500 hover:bg-red-600"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
