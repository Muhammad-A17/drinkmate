"use client"

import { ReactNode, useEffect, useState } from 'react'

/**
 * A boundary component that handles hydration mismatches gracefully
 * by suppressing hydration warnings and cleaning up browser extension attributes
 */
export default function HydrationBoundary({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode
  fallback?: ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Aggressive cleanup of browser extension attributes
    const cleanupExtensionAttributes = () => {
      const badAttrs = [
        'bis_skin_checked',
        'bis_register',
        'data-bit',
        'data-adblock',
        'data-avast',
        'data-bitdefender',
        'data-bitwarden',
        'data-lastpass',
        'data-grammarly',
        'data-honey',
        '__processed_'
      ]

      const observer = new MutationObserver(() => {
        document.querySelectorAll('*').forEach(el => {
          if (el && el.hasAttributes && el.hasAttributes()) {
            Array.from(el.attributes).forEach(attr => {
              if (attr && attr.name && badAttrs.some(bad => 
                attr.name.toLowerCase().includes(bad.toLowerCase())
              )) {
                try {
                  el.removeAttribute(attr.name)
                } catch (e) {
                  // Silent fail
                }
              }
            })
          }
        })
      })

      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true
      })

      return () => observer.disconnect()
    }

    setIsMounted(true)
    const cleanup = cleanupExtensionAttributes()

    return cleanup
  }, [])

  if (!isMounted) {
    return <div suppressHydrationWarning>{fallback}</div>
  }

  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  )
}
