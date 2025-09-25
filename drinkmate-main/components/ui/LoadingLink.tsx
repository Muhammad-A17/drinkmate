'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useNavigation } from '@/lib/navigation-context'
import { cn } from '@/lib/utils'

interface LoadingLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  prefetch?: boolean
  dir?: string
}

export function LoadingLink({ 
  href, 
  children, 
  className, 
  onClick, 
  disabled = false,
  prefetch = true,
  dir
}: LoadingLinkProps) {
  const router = useRouter()
  const { startNavigation, isNavigating } = useNavigation()

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || isNavigating) {
      e.preventDefault()
      return
    }

    // Call custom onClick if provided
    if (onClick) {
      onClick()
    }

    // Start navigation loading
    startNavigation(href)

    // Use router.push for programmatic navigation
    router.push(href)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'transition-all duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        isNavigating && 'pointer-events-none',
        className
      )}
      prefetch={prefetch}
      dir={dir}
    >
      {children}
    </Link>
  )
}
