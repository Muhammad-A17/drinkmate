'use client'

import React from 'react'
import { useIsMobile, useBreakpoint, Breakpoint } from '@/hooks/use-mobile'

interface ResponsiveProps {
  children: React.ReactNode
  /**
   * Show component only at these breakpoints
   * Example: ['xs', 'sm'] will show the component only on xs and sm screens
   */
  showAt?: Breakpoint[]
  /**
   * Hide component at these breakpoints
   * Example: ['md', 'lg'] will hide the component on md and lg screens
   */
  hideAt?: Breakpoint[]
}

/**
 * Responsive component to conditionally render content based on screen size
 * 
 * @example
 * // Show only on mobile (xs, sm)
 * <Responsive showAt={['xs', 'sm']}>Mobile content</Responsive>
 * 
 * @example
 * // Show only on desktop (lg, xl, 2xl)
 * <Responsive showAt={['lg', 'xl', '2xl']}>Desktop content</Responsive>
 * 
 * @example
 * // Hide on tablet (md)
 * <Responsive hideAt={['md']}>Content visible on everything except tablets</Responsive>
 */
export function Responsive({ children, showAt, hideAt }: ResponsiveProps) {
  const currentBreakpoint = useBreakpoint()
  
  if (!currentBreakpoint) {
    // During SSR or before hydration, default to showing the content
    return null
  }
  
  if (showAt && showAt.length > 0) {
    return showAt.includes(currentBreakpoint) ? <>{children}</> : null
  }
  
  if (hideAt && hideAt.length > 0) {
    return hideAt.includes(currentBreakpoint) ? null : <>{children}</>
  }
  
  return <>{children}</>
}

/**
 * Show content only on mobile devices (below md breakpoint)
 */
export function MobileOnly({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  
  if (isMobile === undefined) {
    // During SSR or before hydration, don't render
    return null
  }
  
  return isMobile ? <>{children}</> : null
}

/**
 * Show content only on desktop devices (md breakpoint and above)
 */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  
  if (isMobile === undefined) {
    // During SSR or before hydration, don't render
    return null
  }
  
  return !isMobile ? <>{children}</> : null
}
