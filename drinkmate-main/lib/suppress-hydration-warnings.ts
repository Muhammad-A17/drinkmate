/**
 * Utility to suppress React hydration warnings caused by browser extensions
 * that inject attributes like "bis_skin_checked" into the DOM.
 * 
 * This is a common issue with security extensions like Avast Browser Security,
 * Bitdefender, Bitwarden, LastPass, and others.
 */

export function suppressHydrationWarnings(): void {
  if (typeof window !== 'undefined') {
    // Run immediately to catch early hydration
    const cleanupImmediately = () => {
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

      try {
        document.querySelectorAll('*').forEach(el => {
          if (el && el.hasAttributes && el.hasAttributes()) {
            Array.from(el.attributes).forEach(attr => {
              if (attr && attr.name && badAttrs.some(bad => attr.name.toLowerCase().includes(bad.toLowerCase()))) {
                try {
                  el.removeAttribute(attr.name);
                } catch (e) {
                  // Silent fail
                }
              }
            });
          }
        });
      } catch (e) {
        // Silent fail
      }
    };

    // Run cleanup immediately, before any other setup
    cleanupImmediately();
    // Store the original console.error
    const originalConsoleError = console.error;
    
    // Override console.error to filter out hydration warnings
    console.error = function(...args: any[]) {
      // Convert all arguments to strings for pattern matching
      const errorMessage = args.join(' ').toLowerCase();
      
      // Check if this is a hydration warning
      if (
        typeof args[0] === 'string' && 
        (
          errorMessage.includes('warning: text content did not match') ||
          errorMessage.includes('warning: prop') ||
          errorMessage.includes('did not match') || 
          errorMessage.includes('does not match server-rendered html') ||
          errorMessage.includes('hydration failed because') ||
          errorMessage.includes('hydration failed') ||
          errorMessage.includes('a tree hydrated but some attributes') ||
          errorMessage.includes('hydration') ||
          errorMessage.includes('server rendered html') ||
          errorMessage.includes('client properties') ||
          errorMessage.includes("didn't match the client")
        )
      ) {
        // Check if it's related to browser extension attributes
        if (
          errorMessage.includes('bis_skin_checked') || 
          errorMessage.includes('bis_register') ||
          errorMessage.includes('__processed_') ||
          errorMessage.includes('browser extension') ||
          errorMessage.includes('data-bit') ||
          errorMessage.includes('data-translated') ||
          errorMessage.includes('data-last') ||
          errorMessage.includes('data-gl') ||
          errorMessage.includes('avast') ||
          errorMessage.includes('bitdefender') ||
          errorMessage.includes('bitwarden') ||
          errorMessage.includes('lastpass') ||
          errorMessage.includes('adblock') ||
          errorMessage.includes('1password')
        ) {
          // Completely ignore these warnings
          return;
        }
      }
      
      // Call the original console.error for other errors
      originalConsoleError.apply(console, args);
    };

    // Comprehensive list of browser extension attributes to remove
    const badAttrs = [
      'bis_', 
      '__processed_', 
      'data-bit', 
      'data-translated', 
      'data-last', 
      'data-gl',
      'bis_register',
      'bis_skin_checked',
      'data-adblock',
      'data-avast',
      'data-bitdefender', 
      'data-bitwarden',
      'data-lastpass',
      'data-1password',
      'data-grammarly',
      'data-honey',
      '__reactInternalInstance',
      '__reactInternalMemoizedProps',
      'data-extension'
    ];
    
    // Function to clean all elements of bad attributes
    const cleanupAttributes = () => {
      try {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          if (el && el.hasAttributes && el.hasAttributes()) {
            const attrs = Array.from(el.attributes);
            attrs.forEach(attr => {
              if (attr && attr.name) {
                const attrName = attr.name.toLowerCase();
                // Check against all bad attribute patterns
                if (badAttrs.some(prefix => attrName === prefix || attrName.startsWith(prefix))) {
                  try {
                    el.removeAttribute(attr.name);
                  } catch (e) {
                    // Silently ignore removal errors
                  }
                }
              }
            });
          }
        });
      } catch (e) {
        // Silently ignore cleanup errors
      }
    };

    // Immediate cleanup function that runs before React hydration
    const immediateCleanup = () => {
      if (document.readyState === 'loading') {
        // DOM is still loading, wait a bit
        setTimeout(immediateCleanup, 10);
        return;
      }
      cleanupAttributes();
    };

    // Remove browser extension attributes on component mount
    const observer = new MutationObserver((mutations) => {
      let needsCleanup = false;
      
      mutations.forEach((mutation) => {
        try {
          if (mutation.type === 'attributes') {
            const node = mutation.target as HTMLElement;
            const attrName = mutation.attributeName;
            if (attrName && node && node.removeAttribute) {
              const lowerAttrName = attrName.toLowerCase();
              if (badAttrs.some(prefix => lowerAttrName === prefix || lowerAttrName.startsWith(prefix))) {
                try {
                  node.removeAttribute(attrName);
                  needsCleanup = true;
                } catch (e) {
                  // Silently ignore removal errors
                }
              }
            }
          } else if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            needsCleanup = true;
          }
        } catch (e) {
          // Silently ignore observer errors
        }
      });
      
      // If we detected any changes that might need cleanup, do a full scan
      if (needsCleanup) {
        requestAnimationFrame(() => {
          cleanupAttributes();
        });
      }
    });

    // Run immediate cleanup
    immediateCleanup();
    
    // Cleanup at various stages to catch different rendering phases
    requestAnimationFrame(cleanupAttributes);
    setTimeout(cleanupAttributes, 0);
    setTimeout(cleanupAttributes, 1);
    setTimeout(cleanupAttributes, 10);
    setTimeout(cleanupAttributes, 50);
    setTimeout(cleanupAttributes, 100);
    setTimeout(cleanupAttributes, 250);
    setTimeout(cleanupAttributes, 500);
    setTimeout(cleanupAttributes, 1000);
    setTimeout(cleanupAttributes, 2000);
    setTimeout(cleanupAttributes, 5000);

    // Start observing after a small delay to let React hydrate first
    setTimeout(() => {
      try {
        observer.observe(document.body, {
          attributes: true,
          childList: true,
          subtree: true,
          attributeFilter: badAttrs.concat(badAttrs.map(attr => attr.toUpperCase()))
        });
      } catch (e) {
        // Silently ignore observer setup errors
      }
    }, 100);

    // Also clean up on page visibility change (when user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        cleanupAttributes();
      }
    });

    // Clean up on focus/blur events
    window.addEventListener('focus', cleanupAttributes);
    window.addEventListener('blur', cleanupAttributes);
  }
}