/**
 * Utility to suppress React hydration warnings caused by browser extensions
 * that inject attributes like "bis_skin_checked" into the DOM.
 * 
 * This is a common issue with security extensions like Avast Browser Security
 * and Bitdefender.
 */

export function suppressHydrationWarnings(): void {
  if (typeof window !== 'undefined') {
    // Store the original console.error
    const originalConsoleError = console.error;
    
    // Override console.error to filter out hydration warnings
    console.error = function(...args: any[]) {
      // Check if this is a hydration warning
      if (
        typeof args[0] === 'string' && 
        (
          args[0].includes('Warning: Text content did not match') ||
          args[0].includes('Warning: Prop') ||
          args[0].includes('did not match') || 
          args[0].includes('does not match server-rendered HTML') ||
          args[0].includes('Hydration failed because') ||
          args[0].includes('hydration') ||
          args[0].includes('A tree hydrated but some attributes') ||
          args[0].includes('Hydration failed')
        )
      ) {
        // Check if it's related to browser extension attributes
        if (
          args[0].includes('bis_skin_checked') || 
          args[0].includes('bis_register') ||
          args[0].includes('__processed_') ||
          args[0].includes('browser extension') ||
          args[0].includes('data-bit') ||
          args[0].includes('data-translated') ||
          args[0].includes('data-last') ||
          args[0].includes('data-gl')
        ) {
          // Completely ignore these warnings
          return;
        }
      }
      
      // Call the original console.error for other errors
      originalConsoleError.apply(console, args);
    };

    // List of attribute prefixes and exact names to remove
    const badAttrs = ['bis_', '__processed_', 'data-bit', 'data-translated', 'data-last', 'data-gl', 'bis_register'];
    
    // Function to clean all elements of bad attributes
    const cleanupAttributes = () => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.hasAttributes()) {
          const attrs = Array.from(el.attributes);
          attrs.forEach(attr => {
            const attrName = attr.name;
            // Check against all bad attribute patterns
            if (badAttrs.some(prefix => attrName === prefix || attrName.startsWith(prefix))) {
              el.removeAttribute(attrName);
            }
          });
        }
      });
    };

    // Remove browser extension attributes on component mount
    const observer = new MutationObserver((mutations) => {
      let needsCleanup = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const node = mutation.target as HTMLElement;
          const attrName = mutation.attributeName;
          if (attrName && badAttrs.some(prefix => attrName === prefix || attrName.startsWith(prefix))) {
            node.removeAttribute(attrName);
            needsCleanup = true;
          }
        } else if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          needsCleanup = true;
        }
      });
      
      // If we detected any changes that might need cleanup, do a full scan
      if (needsCleanup) {
        cleanupAttributes();
      }
    });

    // Run cleanup on init
    cleanupAttributes();
    
    // Cleanup on different timeouts to catch various rendering phases
    setTimeout(cleanupAttributes, 0);
    setTimeout(cleanupAttributes, 100);
    setTimeout(cleanupAttributes, 500);
    setTimeout(cleanupAttributes, 2000);

    // Start observing
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true
    });
  }
}