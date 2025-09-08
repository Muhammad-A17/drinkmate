"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { isImageAccessible, getCacheBustingUrl } from "@/lib/fetch-utils"
import { logger } from "@/lib/logger"

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
      : (process.env.NEXT_PUBLIC_API_URL || 'https://drinkmates.onrender.com'))
  }, [])
  
  const [imageSrc, setImageSrc] = useState<string>(() => {
    try {
      // Process the image source
      let processedSrc = fallbackSrc
      
      if (typeof src === 'string') {
        if (src.startsWith('http')) {
          processedSrc = src // Full URL
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
    console.error('Image failed to load:', imageSrc)
    
    // Try to reload the image once with a slight delay in case of temporary server issues
    if (imageSrc !== fallbackSrc && imageSrc.includes('/uploads/')) {
      logger.warn('Attempting to reload image after error:', imageSrc);
      
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
    } else if (imageSrc !== fallbackSrc) {
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
