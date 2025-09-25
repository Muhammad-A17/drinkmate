"use client"

import dynamic from 'next/dynamic'
import { ReactNode, Suspense } from 'react'

/**
 * A component that completely disables server-side rendering
 * This prevents ALL hydration mismatches by only rendering on the client
 */
function NoSSRComponent({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <Suspense fallback={fallback || null}>
      <div suppressHydrationWarning>
        {children}
      </div>
    </Suspense>
  )
}

// Dynamically import with no SSR
export const NoSSR = dynamic(() => Promise.resolve(NoSSRComponent), {
  ssr: false
})

export default NoSSR
