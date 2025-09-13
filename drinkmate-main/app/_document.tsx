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
                // Initial cleanup
                function cleanupAttributes() {
                  const allElements = document.querySelectorAll('*');
                  allElements.forEach(el => {
                    if (el.hasAttributes()) {
                      const attrs = Array.from(el.attributes);
                      attrs.forEach(attr => {
                        if (attr.name.startsWith('bis_') || 
                            attr.name.startsWith('__processed_') ||
                            attr.name === 'bis_register') {
                          el.removeAttribute(attr.name);
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
                
                // Set up a mutation observer to continually remove these attributes
                const observer = new MutationObserver(mutations => {
                  mutations.forEach(mutation => {
                    if (mutation.type === 'attributes') {
                      const node = mutation.target;
                      if (mutation.attributeName &&
                         (mutation.attributeName.startsWith('bis_') || 
                          mutation.attributeName.startsWith('__processed_') ||
                          mutation.attributeName === 'bis_register')) {
                        node.removeAttribute(mutation.attributeName);
                      }
                    }
                  });
                });
                
                // Start observing once DOM is ready
                document.addEventListener('DOMContentLoaded', () => {
                  observer.observe(document.body, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked', 'bis_register', '__processed_*']
                  });
                });
              })();
            `,
          }}
        />
      </body>
    </Html>
  );
}