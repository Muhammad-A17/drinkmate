import type { Metadata } from "next"
import { cairo, montserrat, notoSans, notoArabic } from "@/lib/fonts"
import "./globals.css"
import { TranslationProvider } from "@/lib/contexts/translation-context"
import { CartProvider } from "@/lib/contexts/cart-context"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { SocketProvider } from "@/lib/contexts/socket-context"
import { NavigationProvider } from "@/lib/contexts/navigation-context"
import SWRProvider from "@/lib/swr-provider"
import SecurityMiddleware from "./security-middleware"
import FontProvider from "@/components/layout/FontProvider"
import ChatProvider from "@/components/layout/ChatProvider"
import { ChatProvider as ChatContextProvider } from "@/lib/contexts/chat-context"
import { ChatStatusProvider } from "@/lib/contexts/chat-status-context"
import { Providers } from "@/components/providers"
import { suppressHydrationWarnings } from "@/lib/suppress-hydration-warnings"
import FloatingCartButton from "@/components/cart/FloatingCartButton"
import CartToastWrapper from "@/components/cart/CartToastWrapper"
import CartAuthSync from "@/components/cart/CartAuthSync"
import { NavigationLoader } from "@/components/ui/NavigationLoader"

// Suppress hydration warnings caused by browser extensions - run immediately
if (typeof window !== 'undefined') {
  // Run before any React hydration
  suppressHydrationWarnings()
  
  // Also run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', suppressHydrationWarnings)
  } else {
    suppressHydrationWarnings()
  }
  
  // Development mode: Additional React.StrictMode suppression
  if (process.env.NODE_ENV === 'development') {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ').toLowerCase();
      
      // Suppress all hydration-related errors in development
      if (
        message.includes('hydration') ||
        message.includes('server rendered html') ||
        message.includes('client properties') ||
        message.includes('bis_skin_checked') ||
        message.includes('nextjs.org/docs/messages/react-hydration-error')
      ) {
        return; // Completely suppress
      }
      
      originalConsoleError(...args);
    };
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#12d6fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0bc4e8' },
  ],
}

export const metadata: Metadata = {
  title: "DrinkMate - Premium Soda Makers & Flavors | Create Carbonated Drinks at Home",
  description: "Discover premium DrinkMate soda makers, natural Italian flavors, and CO2 cylinders. Create delicious carbonated beverages at home with our innovative carbonation technology. Free shipping available!",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmate-project.netlify.app'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_TOKEN,
    yandex: process.env.YANDEX_VERIFICATION_TOKEN,
    yahoo: process.env.YAHOO_VERIFICATION_TOKEN,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'ar-AE': '/ar-AE',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmate-project.netlify.app',
    siteName: 'DrinkMate',
    title: 'DrinkMate - Premium Soda Makers & Flavors',
    description: 'Create delicious carbonated beverages at home with DrinkMate soda makers, premium Italian flavors, and CO2 cylinders. Free shipping and 30-day money-back guarantee.',
    images: [
      {
        url: '/images/drinkmate-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DrinkMate Premium Soda Makers and Flavors',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DrinkMate - Premium Soda Makers & Flavors',
    description: 'Create delicious carbonated beverages at home with DrinkMate soda makers, premium Italian flavors, and CO2 cylinders.',
    images: ['/images/drinkmate-twitter-image.jpg'],
    creator: '@drinkmate',
    site: '@drinkmate',
  },
  keywords: [
    'soda maker', 'carbonated drinks', 'CO2 cylinders', 'drink flavors', 
    'homemade soda', 'sparkling water', 'DrinkMate', 'beverage maker',
    'carbonation', 'home carbonation', 'soda stream alternative', 'flavored sparkling water',
    'Italian flavors', 'premium beverages', 'carbonated water maker', 'sparkling water maker',
    'soda machine', 'beverage carbonator', 'CO2 refill', 'drink carbonation'
  ],
  authors: [{ name: 'DrinkMate Team', url: 'https://drinkmate-project.netlify.app' }],
  category: 'Home Appliances',
  applicationName: 'DrinkMate',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#12d6fa' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      dir="ltr"
      suppressHydrationWarning
      className={[
        cairo.variable,
        montserrat.variable,
        notoSans.variable,
        notoArabic.variable,
      ].join(' ')}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        
        {/* Preconnect to important domains for performance */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        
        {/* Security-related meta tags */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Content-Security-Policy" content={process.env.NODE_ENV === 'development' 
          ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:3000 https://api.cloudinary.com https://www.youtube.com https://drinkmates.onrender.com wss://drinkmates.onrender.com ws://localhost:* wss://localhost:*; media-src 'self' https://www.youtube.com https://res.cloudinary.com; frame-src 'self' https://www.youtube.com; object-src 'self' data:; base-uri 'self'; form-action 'self';"
          : "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://drinkmates.onrender.com wss://drinkmates.onrender.com https://api.cloudinary.com https://www.youtube.com wss: ws:; media-src 'self' https://www.youtube.com https://res.cloudinary.com; frame-src 'self' https://www.youtube.com; object-src 'self' data:; base-uri 'self'; form-action 'self';"
        } />
        
        {/* Schema.org structured data for rich results */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'DrinkMate',
          'url': process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmate-project.netlify.app',
          'logo': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmate-project.netlify.app'}/logo.png`,
          'description': 'Premium soda makers, natural Italian flavors, and CO2 cylinders for creating delicious carbonated beverages at home.',
          'foundingDate': '2020',
          'sameAs': [
            'https://facebook.com/drinkmate',
            'https://twitter.com/drinkmate',
            'https://instagram.com/drinkmate',
            'https://youtube.com/drinkmate'
          ],
          'contactPoint': {
            '@type': 'ContactPoint',
            'telephone': '+1-555-555-5555',
            'contactType': 'customer service',
            'availableLanguage': ['English', 'Arabic'],
            'areaServed': 'US',
            'hoursAvailable': {
              '@type': 'OpeningHoursSpecification',
              'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              'opens': '09:00',
              'closes': '17:00'
            }
          },
          'address': {
            '@type': 'PostalAddress',
            'addressCountry': 'US'
          },
          'potentialAction': {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmate-project.netlify.app'}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        }) }} />
        
        {/* Website structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'DrinkMate',
          'url': process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmate-project.netlify.app',
          'description': 'Premium soda makers and carbonation solutions for home use',
          'publisher': {
            '@type': 'Organization',
            'name': 'DrinkMate'
          },
          'potentialAction': {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmate-project.netlify.app'}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        }) }} />
        
        {/* Enhanced hydration fix script - loads before React hydration */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                const EXTENSION_ATTRS = [
                  'bis_skin_checked', 'bis_register', 'data-bit', 'data-adblock',
                  'data-avast', 'data-bitdefender', 'data-bitwarden', 'data-lastpass',
                  'data-grammarly', 'data-honey', '__processed_', 'data-1password',
                  'data-extension', 'data-translated', 'data-last', 'data-gl'
                ];
                
                function cleanExtensionAttributes() {
                  try {
                    document.querySelectorAll('*').forEach(element => {
                      if (element && element.hasAttributes && element.hasAttributes()) {
                        Array.from(element.attributes).forEach(attr => {
                          if (attr && attr.name) {
                            const attrName = attr.name.toLowerCase();
                            const isExtensionAttr = EXTENSION_ATTRS.some(extAttr => 
                              attrName === extAttr.toLowerCase() || attrName.startsWith(extAttr.toLowerCase())
                            );
                            if (isExtensionAttr) {
                              try { element.removeAttribute(attr.name); } catch (e) {}
                            }
                          }
                        });
                      }
                    });
                  } catch (e) {}
                }

                // Enhanced console.error override to catch ALL hydration error variations
                const originalConsoleError = console.error;
                const originalConsoleWarn = console.warn;
                
                function suppressExtensionErrors(...args) {
                  const errorMessage = args.join(' ').toLowerCase();
                  
                  // All possible hydration error patterns
                  const hydrationPatterns = [
                    'hydration failed',
                    'hydration failed because',
                    'a tree hydrated but some attributes',
                    'server rendered html',
                    'client properties', 
                    "didn't match the client",
                    'warning: prop',
                    'warning: text content did not match',
                    'does not match server-rendered html',
                    'text content does not match server-rendered html',
                    'hydration error',
                    'server html',
                    'client html',
                    'attributes of the server rendered html',
                    'nextjs.org/docs/messages/react-hydration-error'
                  ];
                  
                  // Extension-specific patterns  
                  const extensionPatterns = [
                    'bis_skin_checked',
                    'bis_register', 
                    'bitwarden',
                    'avast',
                    'bitdefender',
                    'lastpass',
                    '1password',
                    'grammarly',
                    'honey',
                    'data-bit',
                    'data-adblock',
                    'data-avast',
                    'data-bitdefender',
                    'data-bitwarden',
                    'data-lastpass',
                    'data-grammarly',
                    'data-honey',
                    '__processed_',
                    'browser extension',
                    'extension attribute'
                  ];
                  
                  const isHydrationError = hydrationPatterns.some(pattern => 
                    errorMessage.includes(pattern)
                  );
                  const isExtensionError = extensionPatterns.some(pattern => 
                    errorMessage.includes(pattern.toLowerCase())
                  );
                  
                  // If it's a hydration error related to extensions, suppress it
                  if (isHydrationError || isExtensionError) {
                    return true; // Suppressed
                  }
                  
                  return false; // Not suppressed
                }
                
                console.error = function(...args) {
                  if (!suppressExtensionErrors(...args)) {
                    originalConsoleError.apply(console, args);
                  }
                };
                
                console.warn = function(...args) {
                  if (!suppressExtensionErrors(...args)) {
                    originalConsoleWarn.apply(console, args);
                  }
                };

                // Immediate aggressive cleanup
                cleanExtensionAttributes();
                
                // Multiple cleanup intervals to catch extensions that load slowly
                [0, 1, 5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000].forEach(delay => {
                  setTimeout(cleanExtensionAttributes, delay);
                });
                
                // Set up mutation observer with more aggressive monitoring
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver((mutations) => {
                    let needsCleanup = false;
                    mutations.forEach(mutation => {
                      if (mutation.type === 'attributes' && mutation.attributeName) {
                        const attrName = mutation.attributeName.toLowerCase();
                        if (EXTENSION_ATTRS.some(attr => attrName.includes(attr.toLowerCase()))) {
                          needsCleanup = true;
                        }
                      } else if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        needsCleanup = true;
                      }
                    });
                    
                    if (needsCleanup) {
                      if (typeof requestAnimationFrame !== 'undefined') {
                        requestAnimationFrame(cleanExtensionAttributes);
                      } else {
                        setTimeout(cleanExtensionAttributes, 0);
                      }
                    }
                  });
                  
                  setTimeout(() => {
                    if (document.body) {
                      observer.observe(document.body, {
                        attributes: true, 
                        childList: true, 
                        subtree: true,
                        attributeFilter: EXTENSION_ATTRS.concat(['class', 'style', 'hidden'])
                      });
                    }
                  }, 10);
                }
                
                // Also handle page visibility changes
                document.addEventListener('visibilitychange', function() {
                  if (!document.hidden) {
                    setTimeout(cleanExtensionAttributes, 10);
                  }
                });
                
                // Focus/blur cleanup  
                window.addEventListener('focus', () => setTimeout(cleanExtensionAttributes, 10));
                window.addEventListener('blur', () => setTimeout(cleanExtensionAttributes, 10));
                
              })();
            `
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${cairo.variable} ${notoSans.variable} ${notoArabic.variable} font-primary`} suppressHydrationWarning>
        <SecurityMiddleware>
          <TranslationProvider>
            <FontProvider />
            <NavigationProvider>
              <NavigationLoader />
              <CartProvider>
                <AuthProvider>
                  <CartAuthSync />
                  <SocketProvider>
                    <SWRProvider>
                      <ChatStatusProvider>
                        <ChatContextProvider>
                          <Providers>
                            <div suppressHydrationWarning>{children}</div>
                            <FloatingCartButton />
                            <CartToastWrapper />
                          </Providers>
                          <ChatProvider />
                        </ChatContextProvider>
                      </ChatStatusProvider>
                    </SWRProvider>
                  </SocketProvider>
                </AuthProvider>
              </CartProvider>
            </NavigationProvider>
          </TranslationProvider>
        </SecurityMiddleware>
      </body>
    </html>
  )
}
