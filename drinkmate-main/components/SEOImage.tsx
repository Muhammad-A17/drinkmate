'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  onClick?: () => void;
  quality?: number;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * SEO-optimized image component with structured data
 * Adds LQIP (Low Quality Image Placeholder) and proper alt text
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '100vw',
  onClick,
  quality = 80,
  loading = 'lazy',
  fetchPriority = 'auto',
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Generate a proper alt text if none is provided or if it's too short
  const enhancedAlt = alt && alt.length > 5 
    ? alt 
    : `DrinkMate ${src.split('/').pop()?.split('.')[0].replace(/-/g, ' ')}`;
  
  return (
    <div className={`relative ${className}`} onClick={onClick}>
      <Image
        src={src}
        alt={enhancedAlt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        loading={loading}
        fetchPriority={fetchPriority}
        onLoad={() => setImageLoaded(true)}
        className={`transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {!imageLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse" 
          style={{ width, height }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

interface ResponsiveProductImageProps {
  product: {
    name: string;
    images: string[];
    price?: number;
    currency?: string;
  };
  priority?: boolean;
  className?: string;
}

/**
 * SEO-optimized product image component with structured data
 */
export function ResponsiveProductImage({
  product,
  priority = false,
  className = '',
}: ResponsiveProductImageProps) {
  // Use the first image as the main image
  const mainImage = product.images[0];
  const [baseUrl, setBaseUrl] = useState('');
  
  // Get the base URL on the client side
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);
  
  // Generate the structured data for the image
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'ImageObject',
    contentUrl: mainImage.startsWith('http') ? mainImage : `${baseUrl}${mainImage}`,
    name: product.name,
    description: `Image of ${product.name}`,
  };
  
  return (
    <>
      <OptimizedImage
        src={mainImage}
        alt={`${product.name} - DrinkMate premium product`}
        width={600}
        height={600}
        priority={priority}
        className={className}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        quality={90}
        loading="eager"
        fetchPriority="high"
      />
      {baseUrl && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  );
}

export default {
  OptimizedImage,
  ResponsiveProductImage,
};
