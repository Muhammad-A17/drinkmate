"use client"

import { ReactNode, useEffect, useState } from 'react'

/**
 * A wrapper that ensures content is only rendered on the client side
 * This completely eliminates hydration mismatches from browser extensions
 */
interface ClientOnlyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  delay?: number
}

export default function ClientOnlyWrapper({ 
  children, 
  fallback = null, 
  delay = 0 
}: ClientOnlyWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!isMounted) {
    return <div suppressHydrationWarning>{fallback}</div>
  }

  return <div suppressHydrationWarning>{children}</div>
}
