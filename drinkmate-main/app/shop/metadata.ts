import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Premium DrinkMate Products | Soda Makers, Flavors & Accessories',
  description: 'Discover our curated collection of premium soda makers, CO2 cylinders, flavor concentrates, and accessories. Shop the best drink-making products with fast shipping and expert support.',
  keywords: [
    'soda maker',
    'drink maker',
    'CO2 cylinder',
    'flavor concentrate',
    'sparkling water maker',
    'drinkmate products',
    'premium beverages',
    'home soda machine'
  ],
  openGraph: {
    title: 'Shop Premium DrinkMate Products',
    description: 'Discover our curated collection of premium soda makers, CO2 cylinders, flavor concentrates, and accessories.',
    type: 'website',
    images: [
      {
        url: '/og-shop.jpg',
        width: 1200,
        height: 630,
        alt: 'DrinkMate Shop - Premium Soda Makers and Accessories'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Premium DrinkMate Products',
    description: 'Discover our curated collection of premium soda makers, CO2 cylinders, flavor concentrates, and accessories.',
    images: ['/og-shop.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/shop'
  }
}
