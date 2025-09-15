import type { Metadata } from "next"
import { cairo, montserrat, notoSans, notoArabic } from "@/lib/fonts"
import "./globals.css"
import { TranslationProvider } from "@/lib/translation-context"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { SocketProvider } from "@/lib/socket-context"
import SWRProvider from "@/lib/swr-provider"
import SecurityMiddleware from "./security-middleware"
import FontProvider from "@/components/layout/FontProvider"
import ChatProvider from "@/components/layout/ChatProvider"
import { Providers } from "@/components/providers"
import { suppressHydrationWarnings } from "@/lib/suppress-hydration-warnings"
import FloatingCartButton from "@/components/cart/FloatingCartButton"
// Suppress hydration warnings caused by browser extensions
typeof window !== 'undefined' && suppressHydrationWarnings()

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmates.vercel.app'),
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
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmates.vercel.app',
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
  authors: [{ name: 'DrinkMate Team', url: 'https://drinkmates.vercel.app' }],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Security-related meta tags */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Content-Security-Policy" content={process.env.NODE_ENV === 'development' 
          ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:3000 https://api.cloudinary.com https://www.youtube.com https://drinkmates.onrender.com ws://localhost:*; media-src 'self' https://www.youtube.com https://res.cloudinary.com; frame-src 'self' https://www.youtube.com; object-src 'self' data:; base-uri 'self'; form-action 'self';"
          : "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:3000 https://api.cloudinary.com https://www.youtube.com https://drinkmates.onrender.com; media-src 'self' https://www.youtube.com https://res.cloudinary.com; frame-src 'self' https://www.youtube.com; object-src 'self' data:; base-uri 'self'; form-action 'self';"
        } />
        
        {/* Schema.org structured data for rich results */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'DrinkMate',
          'url': process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmates.vercel.app',
          'logo': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmates.vercel.app'}/logo.png`,
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
              'urlTemplate': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmates.vercel.app'}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        }) }} />
        
        {/* Website structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'DrinkMate',
          'url': process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmates.vercel.app',
          'description': 'Premium soda makers and carbonation solutions for home use',
          'publisher': {
            '@type': 'Organization',
            'name': 'DrinkMate'
          },
          'potentialAction': {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmates.vercel.app'}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        }) }} />
      </head>
      <body className="font-primary" suppressHydrationWarning>
        <SecurityMiddleware>
          <TranslationProvider>
            <FontProvider />
            <CartProvider>
              <AuthProvider>
                <SocketProvider>
                  <SWRProvider>
                    <Providers>
                      <div suppressHydrationWarning>{children}</div>
                      <ChatProvider />
                      <FloatingCartButton />
                    </Providers>
                  </SWRProvider>
                </SocketProvider>
              </AuthProvider>
            </CartProvider>
          </TranslationProvider>
        </SecurityMiddleware>
      </body>
    </html>
  )
}
