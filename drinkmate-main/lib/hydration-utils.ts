/**
 * Comprehensive hydration utilities to handle browser extension interference
 */

export const BROWSER_EXTENSION_ATTRIBUTES = [
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
  'data-1password',
  '__processed_',
  'data-extension',
  'data-translated',
  'data-last',
  'data-gl',
  // Additional attributes that can cause hydration issues
  'data-darkreader-inline-bgcolor',
  'data-darkreader-inline-color',
  'style-darkreader',
  'data-styled',
  'data-emotion'
]

/**
 * Clean all browser extension attributes from the DOM
 */
export function cleanExtensionAttributes(): void {
  if (typeof document === 'undefined') return

  try {
    const allElements = document.querySelectorAll('*')
    
    allElements.forEach(element => {
      if (!element || !element.hasAttributes || !element.hasAttributes()) {
        return
      }

      const attributes = Array.from(element.attributes)
      
      attributes.forEach(attr => {
        if (!attr || !attr.name) return

        const attrName = attr.name.toLowerCase()
        const shouldRemove = BROWSER_EXTENSION_ATTRIBUTES.some(badAttr => 
          attrName === badAttr.toLowerCase() || 
          attrName.startsWith(badAttr.toLowerCase())
        )

        if (shouldRemove) {
          try {
            element.removeAttribute(attr.name)
          } catch (error) {
            // Silently ignore errors
          }
        }
      })
    })
  } catch (error) {
    // Silently ignore errors
  }
}

/**
 * Check if an error message is related to hydration issues from browser extensions
 */
export function isExtensionHydrationError(errorMessage: string): boolean {
  const lowerMessage = errorMessage.toLowerCase()
  
  const hydrationPatterns = [
    'hydration failed',
    'hydration failed because',
    'a tree hydrated but some attributes',
    'server rendered html',
    'client properties',
    "didn't match the client",
    'warning: text content did not match',
    'warning: prop',
    'did not match',
    'does not match server-rendered html'
  ]

  const extensionPatterns = BROWSER_EXTENSION_ATTRIBUTES.map(attr => attr.toLowerCase())

  const isHydrationError = hydrationPatterns.some(pattern => lowerMessage.includes(pattern))
  const isExtensionRelated = extensionPatterns.some(pattern => lowerMessage.includes(pattern))

  return isHydrationError && isExtensionRelated
}

/**
 * Setup comprehensive hydration error suppression
 */
export function setupHydrationSuppression(): () => void {
  if (typeof window === 'undefined') return () => {}

  // Store original console.error
  const originalConsoleError = console.error

  // Override console.error
  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ')
    
    if (isExtensionHydrationError(errorMessage)) {
      return // Suppress this error
    }

    originalConsoleError.apply(console, args)
  }

  // Clean attributes immediately
  cleanExtensionAttributes()

  // Set up mutation observer
  let observer: MutationObserver | null = null
  
  if (typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(() => {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(cleanExtensionAttributes)
      } else {
        setTimeout(cleanExtensionAttributes, 0)
      }
    })

    // Start observing
    const startObserver = () => {
      if (document.body && observer) {
        observer.observe(document.body, {
          attributes: true,
          childList: true,
          subtree: true,
          attributeFilter: BROWSER_EXTENSION_ATTRIBUTES
        })
      } else {
        setTimeout(startObserver, 10)
      }
    }

    startObserver()
  }

  // Clean at various intervals
  const intervals = [0, 1, 10, 50, 100, 250, 500, 1000, 2000, 5000]
  const timeouts: NodeJS.Timeout[] = []
  
  intervals.forEach(delay => {
    const timeout = setTimeout(cleanExtensionAttributes, delay)
    timeouts.push(timeout)
  })

  // Event listeners for cleanup
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      cleanExtensionAttributes()
    }
  }

  const handleFocus = () => {
    cleanExtensionAttributes()
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleFocus)

  // Return cleanup function
  return () => {
    // Restore original console.error
    console.error = originalConsoleError

    // Clean up timeouts
    timeouts.forEach(timeout => clearTimeout(timeout))

    // Disconnect observer
    if (observer) {
      observer.disconnect()
    }

    // Remove event listeners
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleFocus)
  }
}
