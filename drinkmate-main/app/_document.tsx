import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document component
 * This is used to modify the initial HTML and body tags
 * for the entire app
 */
export default function Document() {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <body className="font-primary">
        <Main />
        <NextScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Aggressive removal of browser extension attributes that cause hydration errors
              (function() {
                // List of attribute prefixes to remove
                const badAttrs = ['bis_', '__processed_', 'data-bit', 'data-translated', 'data-last', 'data-gl', 'bis_register'];
                
                // Initial cleanup
                function cleanupAttributes() {
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
                }
                
                // Clean up immediately
                cleanupAttributes();
                
                // Clean up after DOM content loaded
                document.addEventListener('DOMContentLoaded', cleanupAttributes);
                
                // Clean up after React hydration is likely complete
                setTimeout(cleanupAttributes, 0);
                setTimeout(cleanupAttributes, 100);
                setTimeout(cleanupAttributes, 500);
                setTimeout(cleanupAttributes, 2000);
                
                // Set up a mutation observer to continually remove these attributes
                const observer = new MutationObserver(mutations => {
                  let needsCleanup = false;
                  
                  mutations.forEach(mutation => {
                    if (mutation.type === 'attributes') {
                      const node = mutation.target;
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
                
                // Start observing once DOM is ready
                document.addEventListener('DOMContentLoaded', () => {
                  observer.observe(document.body, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: badAttrs.map(prefix => prefix + '*').concat(badAttrs)
                  });
                });
                
                // Also observe during runtime
                observer.observe(document.body, {
                  attributes: true,
                  childList: true,
                  subtree: true
                });
              })();
            `,
          }}
        />
      </body>
    </Html>
  );
}