'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingButtonProps {
  children: React.ReactNode
  onClick?: () => void | Promise<void>
  loading?: boolean
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  loadingText?: string
}

export function LoadingButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  loadingText
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (disabled || loading || isLoading) return

    setIsLoading(true)
    try {
      if (onClick) {
        await onClick()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isButtonLoading = loading || isLoading

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isButtonLoading}
      variant={variant}
      size={size}
      className={cn(
        'transition-all duration-200',
        isButtonLoading && 'opacity-75',
        className
      )}
    >
      {isButtonLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || 'Loading...'}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
