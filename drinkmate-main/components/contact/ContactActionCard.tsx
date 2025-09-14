"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ContactActionCardProps {
  id: string
  icon: string
  title: string
  subtitle: string
  buttonText: string
  helperText: string
  status: string
  isEnabled: boolean
  isActive?: boolean
  onClick: () => void
  onActivate?: () => void
}

export default function ContactActionCard({
  icon,
  title,
  subtitle,
  buttonText,
  helperText,
  status,
  isEnabled,
  isActive,
  onClick,
  onActivate
}: ContactActionCardProps) {
  if (!isEnabled) return null

  const getStatusVariant = (status: string) => {
    if (status.includes('Online') || status === '24/7') return 'default'
    if (status.includes('Opens')) return 'secondary'
    return 'outline'
  }

  const getStatusColor = (status: string) => {
    if (status.includes('Online')) return 'bg-success text-white'
    if (status === '24/7') return 'bg-ink-100 text-ink-700'
    if (status.includes('Opens')) return 'bg-warning text-white'
    return 'bg-ink-100 text-ink-600'
  }

  const isDisabled = status.includes('Offline') || status.includes('Sign in')

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 ${
        isActive ? 'ring-2 ring-brand shadow-card' : 'shadow-sm'
      }`}
    >
      <CardContent className="p-7">
        {/* Header Row: Icon, Title, Status Chip */}
        <div className="flex items-start gap-4 mb-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-brand-light rounded-soft flex items-center justify-center text-2xl">
              {icon}
            </div>
          </div>

          {/* Title and Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-ink-900 font-primary">
                {title}
              </h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {status}
              </div>
            </div>

            {/* Meta Line */}
            <p className="text-ink-600 text-sm">
              {subtitle}
            </p>
          </div>
        </div>

        {/* CTA and Helper Text */}
        <div className="space-y-3">
          <Button
            onClick={onClick}
            disabled={isDisabled}
            className={`w-full h-12 rounded-lg font-medium transition-all duration-200 ${
              isDisabled 
                ? 'bg-ink-100 text-ink-400 cursor-not-allowed' 
                : 'bg-brand hover:bg-brand-dark text-white hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2'
            }`}
            aria-label={`${buttonText} - ${title}`}
          >
            {buttonText}
          </Button>

          <p className="text-xs text-ink-500 text-center">
            {helperText}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
