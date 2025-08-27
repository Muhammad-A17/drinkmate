import * as React from "react"

// Breakpoints matching Tailwind's default breakpoints
export const breakpoints = {
  xs: 480,   // Extra small devices (portrait phones)
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536 // 2X Extra large devices
}

export type Breakpoint = keyof typeof breakpoints

/**
 * Hook to check if screen width is below a specific breakpoint
 * @param breakpoint - The breakpoint to check against (defaults to 'md')
 * @returns boolean indicating if screen width is below the specified breakpoint
 */
export function useIsMobile(breakpoint: Breakpoint = 'md') {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const breakpointValue = breakpoints[breakpoint]

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpointValue - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpointValue)
    }
    
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < breakpointValue)
    
    return () => mql.removeEventListener("change", onChange)
  }, [breakpointValue])

  return !!isMobile
}

/**
 * Hook to get current breakpoint
 * @returns The current breakpoint as a string ('xs', 'sm', 'md', 'lg', 'xl', '2xl')
 */
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<Breakpoint | undefined>(undefined)
  
  React.useEffect(() => {
    const determineBreakpoint = () => {
      const width = window.innerWidth
      
      if (width < breakpoints.xs) return 'xs'
      if (width < breakpoints.sm) return 'xs'
      if (width < breakpoints.md) return 'sm'
      if (width < breakpoints.lg) return 'md'
      if (width < breakpoints.xl) return 'lg'
      if (width < breakpoints['2xl']) return 'xl'
      return '2xl'
    }
    
    const handleResize = () => {
      setCurrentBreakpoint(determineBreakpoint() as Breakpoint)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // Set initial value
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return currentBreakpoint
}
