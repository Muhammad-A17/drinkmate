'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { loadImageWithRetry } from '@/lib/imageLoader';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  quality?: number;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export default function ImageWithFallback({
  src,
  alt,
  width = 500,
  height = 500,
  className = '',
  style = {},
  priority = false,
  quality = 80,
  fallbackSrc = '/placeholder.svg',
  onError,
  onLoad,
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    console.warn(`Image failed to load: ${imageSrc}`);
    setHasError(true);
    setIsLoading(false);
    
    // Try to load with retry logic
    if (imageSrc !== fallbackSrc) {
      loadImageWithRetry(imageSrc, 3, 10000)
        .then((retrySrc) => {
          if (retrySrc !== fallbackSrc) {
            setImageSrc(retrySrc);
            setIsLoading(true);
            setHasError(false);
          } else {
            setImageSrc(fallbackSrc);
            setIsLoading(false);
          }
        })
        .catch(() => {
          setImageSrc(fallbackSrc);
          setIsLoading(false);
        });
    }
    
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={style}
        priority={priority}
        quality={quality}
        onError={handleError}
        onLoad={handleLoad}
        // Add timeout for external images
        unoptimized={src.includes('res.cloudinary.com')}
      />
      
      {hasError && imageSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          Image unavailable
        </div>
      )}
    </div>
  );
}
