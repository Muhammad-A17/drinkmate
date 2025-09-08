'use client';

import { useEffect, useState } from 'react';

interface ProductStructuredDataProps {
  product: {
    name: string;
    description: string;
    price: number;
    priceCurrency?: string;
    sku?: string;
    image?: string[];
    brand?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    rating?: number;
    reviewCount?: number;
  };
}

/**
 * Component to add Product structured data for rich results in search engines
 */
export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const [baseUrl, setBaseUrl] = useState('');

  // Get the base URL on the client side
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  if (!baseUrl) return null;

  // Construct the structured data object
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image?.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`) || [],
    brand: {
      '@type': 'Brand',
      name: product.brand || 'DrinkMate',
    },
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : '',
      priceCurrency: product.priceCurrency || 'USD',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: `https://schema.org/${product.availability || 'InStock'}`,
    },
  };

  // Add reviews if available
  if (product.rating && product.reviewCount) {
    Object.assign(structuredData, {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface FAQStructuredDataProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * Component to add FAQ structured data for rich results in search engines
 */
export function FAQStructuredData({ questions }: FAQStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface LocalBusinessStructuredDataProps {
  business: {
    name: string;
    description: string;
    telephone?: string;
    email?: string;
    address?: {
      street: string;
      locality: string;
      region: string;
      postalCode: string;
      country: string;
    };
    openingHours?: string[];
    image?: string;
  };
}

/**
 * Component to add LocalBusiness structured data for rich results in search engines
 */
export function LocalBusinessStructuredData({ business }: LocalBusinessStructuredDataProps) {
  const [baseUrl, setBaseUrl] = useState('');

  // Get the base URL on the client side
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  if (!baseUrl) return null;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    url: baseUrl,
    telephone: business.telephone,
    email: business.email,
    image: business.image?.startsWith('http') ? business.image : `${baseUrl}${business.image || '/logo.png'}`,
  };

  if (business.address) {
    Object.assign(structuredData, {
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address.street,
        addressLocality: business.address.locality,
        addressRegion: business.address.region,
        postalCode: business.address.postalCode,
        addressCountry: business.address.country,
      },
    });
  }

  if (business.openingHours && business.openingHours.length > 0) {
    Object.assign(structuredData, {
      openingHoursSpecification: business.openingHours.map(hours => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hours.split(' ')[0],
        opens: hours.split(' ')[1].split('-')[0],
        closes: hours.split(' ')[1].split('-')[1],
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default {
  ProductStructuredData,
  FAQStructuredData,
  LocalBusinessStructuredData
};
