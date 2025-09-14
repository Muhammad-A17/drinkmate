"use client"

import React, { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Smile, 
  Paperclip, 
  Type, 
  AlertCircle,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageComposerProps {
  onSendMessage: (content: string, isNote: boolean) => void
  placeholder?: string
  isRTL?: boolean
  disabled?: boolean
}

const cannedResponses = [
  { key: 'greet', label: 'Greeting', content: 'Hello! How can I help you today?' },
  { key: 'thanks', label: 'Thank you', content: 'Thank you for contacting us!' },
  { key: 'refund', label: 'Refund Policy', content: 'Our refund policy allows returns within 30 days of purchase.' },
  { key: 'shipping', label: 'Shipping Info', content: 'We offer free shipping on orders over $50.' },
  { key: 'hours', label: 'Business Hours', content: 'Our business hours are 9 AM to 5 PM, Monday to Friday.' }
]

export default function MessageComposer({
  onSendMessage,
  placeholder = "Type your message...",
  isRTL = false,
  disabled = false
}: MessageComposerProps) {
  const [message, setMessage] = useState('')
  const [isNote, setIsNote] = useState(false)
  const [showCannedResponses, setShowCannedResponses] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), isNote)
      setMessage('')
      setIsNote(false)
      setShowCannedResponses(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCannedResponse = (response: typeof cannedResponses[0]) => {
    setMessage(response.content)
    setShowCannedResponses(false)
    textareaRef.current?.focus()
  }

  const handleSlashCommand = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '/' && message === '') {
      setShowCannedResponses(true)
    }
  }

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const commonEmojis = ['😊', '👍', '❤️', '🎉', '😢', '🤔', '✅', '❌', '⚠️', '💡']

  return (
    <div className="space-y-2">
      {/* Message Type Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={isNote ? "default" : "outline"}
          size="sm"
          onClick={() => setIsNote(!isNote)}
          className="flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {isNote ? 'Note' : 'Message'}
        </Button>
        {isNote && (
          <Badge variant="secondary" className="text-xs">
            Internal note - customer won't see this
          </Badge>
        )}
      </div>

      {/* Canned Responses */}
      {showCannedResponses && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Quick Responses</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCannedResponses(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {cannedResponses.map((response) => (
              <button
                key={response.key}
                onClick={() => handleCannedResponse(response)}
                className="text-left p-2 rounded hover:bg-white text-sm"
              >
                <div className="font-medium">{response.label}</div>
                <div className="text-gray-600">{response.content}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Emojis</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="p-2 rounded hover:bg-white text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              handleKeyDown(e)
              handleSlashCommand(e)
            }}
            placeholder={isNote ? "Add an internal note..." : placeholder}
            className={cn(
              "min-h-[60px] resize-none",
              isNote && "border-yellow-200 bg-yellow-50"
            )}
            dir={isRTL ? "rtl" : "ltr"}
            disabled={disabled}
          />
        </div>
        
        <div className="flex flex-col gap-1">
          {/* Action Buttons */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCannedResponses(!showCannedResponses)}
              className="p-2"
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2"
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="p-2"
              disabled
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-gray-500">
        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> to send, 
        <kbd className="px-1 py-0.5 bg-gray-100 rounded ml-1">Shift+Enter</kbd> for new line, 
        <kbd className="px-1 py-0.5 bg-gray-100 rounded ml-1">/</kbd> for quick responses
      </div>
    </div>
  )
}
