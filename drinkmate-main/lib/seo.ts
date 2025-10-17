import { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  price?: number
  currency?: string
  availability?: 'in stock' | 'out of stock' | 'preorder'
  brand?: string
  category?: string
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image = '/images/drinkmate-og-image.jpg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  price,
  currency = 'USD',
  availability,
  brand = 'DrinkMate',
  category,
}: SEOProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmate.sa'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  const defaultKeywords = [
    'soda maker',
    'carbonated drinks',
    'CO2 cylinders',
    'drink flavors',
    'homemade soda',
    'sparkling water',
    'DrinkMate',
    'beverage maker',
    'carbonation',
    'home carbonation',
    'soda stream alternative',
    'flavored sparkling water',
    'Italian flavors',
    'premium beverages',
  ]

  const allKeywords = [...new Set([...defaultKeywords, ...keywords])]

  const metadata: Metadata = {
    title: `${title} | DrinkMate - Premium Soda Makers & Flavors`,
    description,
    keywords: allKeywords,
    authors: [{ name: 'DrinkMate Team', url: baseUrl }],
    creator: 'DrinkMate',
    publisher: 'DrinkMate',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        'en-US': fullUrl,
        'ar-AE': `${fullUrl}?lang=ar`,
      },
    },
    openGraph: {
      type: type === 'product' ? 'website' : type,
      locale: 'en_US',
      url: fullUrl,
      siteName: 'DrinkMate',
      title: `${title} | DrinkMate`,
      description,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@drinkmate',
      creator: '@drinkmate',
      title: `${title} | DrinkMate`,
      description,
      images: [fullImageUrl],
    },
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
  }

  // Add product-specific metadata
  if (type === 'product') {
    const productMetadata: Record<string, string> = {}
    if (price) productMetadata['product:price:amount'] = price.toString()
    if (currency) productMetadata['product:price:currency'] = currency
    if (availability) productMetadata['product:availability'] = availability
    if (brand) productMetadata['product:brand'] = brand
    if (category) productMetadata['product:category'] = category
    
    metadata.other = {
      ...metadata.other,
      ...productMetadata,
    }
  }

  return metadata
}

export function generateStructuredData({
  type,
  name,
  description,
  image,
  url,
  price,
  currency = 'USD',
  availability = 'in stock',
  brand = 'DrinkMate',
  category,
  rating,
  reviewCount,
  sku,
  gtin,
  mpn,
}: {
  type: 'Product' | 'Organization' | 'WebSite' | 'BreadcrumbList' | 'FAQPage'
  name: string
  description: string
  image?: string
  url?: string
  price?: number
  currency?: string
  availability?: string
  brand?: string
  category?: string
  rating?: number
  reviewCount?: number
  sku?: string
  gtin?: string
  mpn?: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmate.sa'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : undefined

  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    ...(fullImageUrl && { image: fullImageUrl }),
    ...(url && { url: fullUrl }),
  }

  switch (type) {
    case 'Product':
      return {
        ...baseData,
        '@type': 'Product',
        brand: {
          '@type': 'Brand',
          name: brand,
        },
        category,
        ...(price && {
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: currency,
            availability: `https://schema.org/${availability.replace(' ', '')}`,
            seller: {
              '@type': 'Organization',
              name: 'DrinkMate',
            },
          },
        }),
        ...(rating && reviewCount && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount,
          },
        }),
        ...(sku && { sku }),
        ...(gtin && { gtin }),
        ...(mpn && { mpn }),
      }

    case 'Organization':
      return {
        ...baseData,
        '@type': 'Organization',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        sameAs: [
          'https://facebook.com/drinkmate',
          'https://twitter.com/drinkmate',
          'https://instagram.com/drinkmate',
          'https://youtube.com/drinkmate',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-555-555-5555',
          contactType: 'customer service',
          availableLanguage: ['English', 'Arabic'],
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'US',
        },
      }

    case 'WebSite':
      return {
        ...baseData,
        '@type': 'WebSite',
        url: baseUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }

    default:
      return baseData
  }
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmate.sa'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
