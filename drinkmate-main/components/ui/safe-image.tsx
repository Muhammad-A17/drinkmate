"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { isImageAccessible, getCacheBustingUrl } from "@/lib/utils/fetch-utils"
import { logger } from "@/lib/logger"

// Utility to transform Cloudinary URLs for better performance and reliability
const optimizeCloudinaryUrl = (url: string): string => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }
  
  try {
    // Parse the URL into base and path parts
    const [baseUrl, imagePath] = url.split('/upload/');
    
    // Check if URL already has transformations
    if (imagePath.includes('/')) {
      // Already has transformations, leave as is
      return url;
    }
    
    // Add quality auto and format auto transformations
    return `${baseUrl}/upload/q_auto,f_auto/${imagePath}`;
  } catch (error) {
    console.warn('Error optimizing Cloudinary URL:', error);
    return url;
  }
};

interface SafeImageProps {
  src: string | any
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
  onError?: (e: any) => void
  onLoad?: () => void
}

export function SafeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  fallbackSrc = "/placeholder.jpg",
  onError,
  onLoad,
  ...props
}: SafeImageProps) {
  const [baseUrl, setBaseUrl] = useState('')
  
  // Set the base URL on component mount
  useEffect(() => {
    // Use the deployed URL or the current origin if in browser
    setBaseUrl(typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'))
  }, [])
  
  const [imageSrc, setImageSrc] = useState<string>(() => {
    try {
      // Process the image source
      let processedSrc = fallbackSrc
      
      if (typeof src === 'string') {
        if (src.startsWith('http')) {
          // Check if it's a Cloudinary URL that needs optimization
          if (src.includes('cloudinary.com')) {
            processedSrc = optimizeCloudinaryUrl(src)
          } else {
            processedSrc = src // Regular full URL
          }
        } else if (src.startsWith('/uploads/')) {
          // Will be updated after baseUrl is set
          processedSrc = src 
        } else if (src.startsWith('/')) {
          processedSrc = src // Absolute path
        } else if (src && src !== 'undefined' && src !== 'null') {
          processedSrc = src // Other valid strings
        }
      } else if (src && typeof src === 'object') {
        if (src.url) {
          if (src.url.startsWith('http')) {
            processedSrc = src.url
          } else if (src.url.startsWith('/uploads/')) {
            // Will be updated after baseUrl is set
            processedSrc = src.url
          } else if (src.url.startsWith('/')) {
            processedSrc = src.url
          }
        }
      }
      
      // Final validation
      if (!processedSrc || processedSrc === 'undefined' || processedSrc === 'null') {
        processedSrc = fallbackSrc
      }
      
      return processedSrc
    } catch (error) {
      console.error('Error processing image URL:', error)
      return fallbackSrc
    }
  })
  
  // Update image source when baseUrl changes
  useEffect(() => {
    if (!baseUrl) return;
    
    try {
      let updatedSrc = imageSrc;
      
      // Only update paths that need the baseUrl prefix
      if (typeof src === 'string' && src.startsWith('/uploads/') && !src.startsWith('http')) {
        updatedSrc = `${baseUrl}${src}`
      } else if (src && typeof src === 'object' && src.url && 
                src.url.startsWith('/uploads/') && !src.url.startsWith('http')) {
        updatedSrc = `${baseUrl}${src.url}`
      }
      
      // Only update if it's different
      if (updatedSrc !== imageSrc) {
        setImageSrc(updatedSrc);
      }
    } catch (error) {
      console.error('Error updating image with baseUrl:', error);
    }
  }, [baseUrl, src, imageSrc]);

  const handleError = (e: any) => {
    // Don't log error for fallback image failures to avoid infinite loop warnings
    if (imageSrc !== fallbackSrc) {
      console.warn('Image failed to load:', imageSrc)
    }
    
    // Handle different image sources differently
    if (imageSrc !== fallbackSrc) {
      // For Cloudinary images
      if (imageSrc.includes('cloudinary.com')) {
        try {
          // If URL already has transformations but still fails, try a simpler version
          if (imageSrc.includes('/upload/q_auto')) {
            // Try a more basic version without transformations
            const [baseUrl, imagePath] = imageSrc.split('/upload/');
            const simpleImagePath = imagePath.split('/').pop(); // Get just the filename
            if (simpleImagePath) {
              const simplifiedUrl = `${baseUrl}/upload/${simpleImagePath}`;
              logger.debug('Trying simplified Cloudinary URL:', simplifiedUrl);
              setImageSrc(simplifiedUrl);
              return;
            }
          } else {
            // Try different transformations if not already applied
            const transformedUrl = optimizeCloudinaryUrl(imageSrc);
            if (transformedUrl !== imageSrc) {
              logger.debug('Trying transformed Cloudinary URL:', transformedUrl);
              setImageSrc(transformedUrl);
              return;
            }
          }
        } catch (error) {
          logger.error('Error handling Cloudinary URL:', error);
        }
      } 
      // For local uploaded images
      else if (imageSrc.includes('/uploads/')) {
        logger.warn('Attempting to reload local image after error:', imageSrc);
        
        // Small delay before retry
        setTimeout(async () => {
          // Check if the image exists
          const imageExists = await isImageAccessible(imageSrc);
          
          if (imageExists) {
            logger.debug('Image exists on retry, attempting to reload');
            // Force reload by updating state with cache-busting query param
            setImageSrc(getCacheBustingUrl(imageSrc));
          } else {
            logger.warn('Image still not available, falling back');
            setImageSrc(fallbackSrc);
          }
        }, 1500);
        return;
      }
      
      // Fall back if all special handling fails
      setImageSrc(fallbackSrc);
    }
    
    if (onError) {
      onError(e);
    }
  }

  const handleLoad = () => {
    logger.debug('Image loaded successfully:', imageSrc)
    if (onLoad) {
      onLoad()
    }
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  )
}
