/**
 * Utility to suppress React hydration warnings caused by browser extensions
 * that inject attributes like "bis_skin_checked" into the DOM.
 * 
 * This is a common issue with security extensions like Avast Browser Security.
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
          args[0].includes('A tree hydrated but some attributes')
        )
      ) {
        // Check if it's related to browser extension attributes
        if (
          args[0].includes('bis_skin_checked') || 
          args[0].includes('bis_register') ||
          args[0].includes('__processed_') ||
          args[0].includes('browser extension')
        ) {
          // Completely ignore these warnings
          return;
        }
      }
      
      // Call the original console.error for other errors
      originalConsoleError.apply(console, args);
    };

    // Remove browser extension attributes on component mount
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const node = mutation.target as HTMLElement;
          if (
            mutation.attributeName?.startsWith('bis_') || 
            mutation.attributeName?.startsWith('__processed_') ||
            mutation.attributeName === 'bis_register'
          ) {
            node.removeAttribute(mutation.attributeName);
          }
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked', 'bis_register', '__processed_*']
    });
  }
}