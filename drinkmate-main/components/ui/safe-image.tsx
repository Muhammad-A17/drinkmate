"use client"

import { useState } from "react"
import Image from "next/image"

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
  const [imageSrc, setImageSrc] = useState<string>(() => {
    try {
      // Process the image source
      let processedSrc = fallbackSrc
      
      if (typeof src === 'string') {
        if (src.startsWith('http')) {
          processedSrc = src // Full URL
        } else if (src.startsWith('/uploads/')) {
          processedSrc = `http://localhost:3000${src}` // Convert relative to full URL
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
            processedSrc = `http://localhost:3000${src.url}`
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

  const handleError = (e: any) => {
    console.error('Image failed to load:', imageSrc)
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
    if (onError) {
      onError(e)
    }
  }

  const handleLoad = () => {
    console.log('Image loaded successfully:', imageSrc)
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
