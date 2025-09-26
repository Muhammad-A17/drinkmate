"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Calendar,
  User,
  MessageSquare,
  Settings,
  CheckCircle
} from 'lucide-react'
import { Conversation, Message } from '@/types/chat'
import { getCustomerDisplayName, formatAbsoluteTime } from '@/lib/utils/chat-utils'
import { cn } from '@/lib/utils'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: Conversation
  messages: Message[]
  onExport: (exportData: ExportData) => void
}

interface ExportData {
  format: 'pdf' | 'html' | 'csv' | 'json'
  includeMessages: boolean
  includeCustomerInfo: boolean
  includeAgentInfo: boolean
  includeTimestamps: boolean
  includeAttachments: boolean
  includeMetadata: boolean
  dateRange?: {
    from: string
    to: string
  }
}

const exportFormats = [
  { 
    value: 'pdf', 
    label: 'PDF Document', 
    icon: FileText, 
    description: 'Professional transcript with formatting',
    color: 'text-red-600'
  },
  { 
    value: 'html', 
    label: 'HTML Page', 
    icon: FileText, 
    description: 'Web-friendly format',
    color: 'text-blue-600'
  },
  { 
    value: 'csv', 
    label: 'CSV Spreadsheet', 
    icon: FileSpreadsheet, 
    description: 'Data for analysis',
    color: 'text-green-600'
  },
  { 
    value: 'json', 
    label: 'JSON Data', 
    icon: Settings, 
    description: 'Raw data format',
    color: 'text-gray-600'
  }
]

export default function ExportModal({
  isOpen,
  onClose,
  conversation,
  messages,
  onExport
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportData['format']>('pdf')
  const [includeMessages, setIncludeMessages] = useState(true)
  const [includeCustomerInfo, setIncludeCustomerInfo] = useState(true)
  const [includeAgentInfo, setIncludeAgentInfo] = useState(true)
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [includeAttachments, setIncludeAttachments] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(false)
  const [dateRange, setDateRange] = useState({
    from: conversation.createdAt.split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })

  const handleExport = () => {
    const exportData: ExportData = {
      format: selectedFormat,
      includeMessages,
      includeCustomerInfo,
      includeAgentInfo,
      includeTimestamps,
      includeAttachments,
      includeMetadata,
      dateRange
    }

    onExport(exportData)
    onClose()
  }

  const getExportPreview = () => {
    const filteredMessages = messages.filter(msg => {
      const msgDate = new Date(msg.timestamp).toISOString().split('T')[0]
      return msgDate >= dateRange.from && msgDate <= dateRange.to
    })

    return {
      messageCount: filteredMessages.length,
      customerName: getCustomerDisplayName(conversation.customer),
      conversationId: conversation.id,
      dateRange: `${dateRange.from} to ${dateRange.to}`,
      totalSize: `${Math.round((JSON.stringify(filteredMessages).length / 1024) * 100) / 100} KB`
    }
  }

  const preview = getExportPreview()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            Export Conversation
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Export conversation with <strong>{preview.customerName}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              {exportFormats.map((format) => {
                const Icon = format.icon
                return (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value as ExportData['format'])}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-colors",
                      selectedFormat === format.value
                        ? "border-blue-200 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-6 h-6", format.color)} />
                      <div>
                        <div className="font-medium text-gray-900">{format.label}</div>
                        <div className="text-sm text-gray-600">{format.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Options */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Include Content</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="messages"
                  checked={includeMessages}
                  onCheckedChange={(checked) => setIncludeMessages(checked as boolean)}
                />
                <Label htmlFor="messages" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Messages ({preview.messageCount})
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customer"
                  checked={includeCustomerInfo}
                  onCheckedChange={(checked) => setIncludeCustomerInfo(checked as boolean)}
                />
                <Label htmlFor="customer" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agent"
                  checked={includeAgentInfo}
                  onCheckedChange={(checked) => setIncludeAgentInfo(checked as boolean)}
                />
                <Label htmlFor="agent" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Agent Information
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timestamps"
                  checked={includeTimestamps}
                  onCheckedChange={(checked) => setIncludeTimestamps(checked as boolean)}
                />
                <Label htmlFor="timestamps" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timestamps
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attachments"
                  checked={includeAttachments}
                  onCheckedChange={(checked) => setIncludeAttachments(checked as boolean)}
                />
                <Label htmlFor="attachments" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Attachments
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
                <Label htmlFor="metadata" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Technical Metadata
                </Label>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Date Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-600">From</Label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">To</Label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Export Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Export Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Format:</span>
                <span className="ml-2 font-medium">
                  {exportFormats.find(f => f.value === selectedFormat)?.label}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Messages:</span>
                <span className="ml-2 font-medium">{preview.messageCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Customer:</span>
                <span className="ml-2 font-medium">{preview.customerName}</span>
              </div>
              <div>
                <span className="text-gray-600">Size:</span>
                <span className="ml-2 font-medium">{preview.totalSize}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="bg-blue-500 hover:bg-blue-600">
            <Download className="w-4 h-4 mr-2" />
            Export Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
