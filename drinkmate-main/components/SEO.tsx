import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  ogImageAlt?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  keywords?: string[];
  structuredData?: any;
}

/**
 * SEO component for enhancing page metadata
 * Use this component on individual pages to override default SEO settings
 */
export default function SEO({
  title = 'DrinkMate - Premium Soda Makers & Flavors',
  description = 'Create delicious carbonated beverages at home with DrinkMate soda makers, premium flavors, and CO2 cylinders.',
  canonicalUrl,
  ogType = 'website',
  ogImage = '/images/drinkmate-og-image.jpg',
  ogImageAlt = 'DrinkMate Premium Soda Makers',
  ogUrl,
  twitterCard = 'summary_large_image',
  noIndex = false,
  keywords = [],
  structuredData,
}: SEOProps) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drinkmates.vercel.app';
  
  // Construct the canonical URL
  const fullCanonicalUrl = canonicalUrl 
    ? canonicalUrl.startsWith('http') ? canonicalUrl : `${baseUrl}${canonicalUrl}`
    : `${baseUrl}${router.asPath}`;
    
  // Construct the OG URL
  const fullOgUrl = ogUrl 
    ? ogUrl.startsWith('http') ? ogUrl : `${baseUrl}${ogUrl}`
    : `${baseUrl}${router.asPath}`;
    
  // Construct the OG Image URL
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
  
  // Join keywords
  const keywordsString = [
    ...keywords,
    'soda maker', 'carbonated drinks', 'CO2 cylinders', 'drink flavors',
    'homemade soda', 'sparkling water', 'DrinkMate', 'beverage maker'
  ].join(', ');
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta name="keywords" content={keywordsString} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullOgUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:site_name" content="DrinkMate" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@drinkmate" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}
