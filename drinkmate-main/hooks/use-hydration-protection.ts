import { useEffect, useState } from 'react';

/**
 * Hook to provide comprehensive hydration protection
 * This prevents hydration mismatches by managing client-side only rendering
 * and cleaning up browser extension attributes
 */
export function useHydrationProtection() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);
    
    // Small delay to ensure hydration is complete
    const hydrationTimer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    // Additional cleanup for browser extensions
    const extensionCleanup = () => {
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
      ];

      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.hasAttributes()) {
          const attrs = Array.from(el.attributes);
          attrs.forEach(attr => {
            if (badAttrs.some(bad => attr.name.toLowerCase().includes(bad.toLowerCase()))) {
              try {
                el.removeAttribute(attr.name);
              } catch (e) {
                // Silent fail
              }
            }
          });
        }
      });
    };

    // Run cleanup after hydration
    const cleanupTimer = setTimeout(extensionCleanup, 200);

    return () => {
      clearTimeout(hydrationTimer);
      clearTimeout(cleanupTimer);
    };
  }, []);

  return {
    isHydrated,
    isClient,
    /**
     * Props to add to elements that may be affected by browser extensions
     */
    hydrationProps: {
      suppressHydrationWarning: true
    }
  };
}
