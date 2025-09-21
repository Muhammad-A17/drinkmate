"use client"

import Image from "next/image"
import React, { useState } from "react"

interface YouTubeThumbnailProps {
  url: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  showPlayButton?: boolean
  onError?: (error: any) => void
  onLoad?: () => void
  priority?: boolean
  sizes?: string
}

export default function YouTubeThumbnail({
  url,
  alt,
  fill = false,
  width,
  height,
  className = "",
  showPlayButton = true,
  onError,
  onLoad,
  priority = false,
  sizes
}: YouTubeThumbnailProps) {
  const [imageError, setImageError] = useState(false)
  const [hasTriedFallback, setHasTriedFallback] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)

  // Function to extract YouTube video ID and generate thumbnail URL
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null
    
    // Check if it's a YouTube URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(youtubeRegex)
    
    if (match) {
      const videoId = match[1]
      // Return high-quality thumbnail URL (maxresdefault.jpg)
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    
    return null
  }

  // Check if the URL is a YouTube URL
  const isYouTubeUrl = url && (url.includes('youtube.com') || url.includes('youtu.be'))
  const thumbnailUrl = isYouTubeUrl ? getYouTubeThumbnail(url) : url
  
  // Set current image URL on mount or when URL changes
  React.useEffect(() => {
    setCurrentImageUrl(thumbnailUrl)
    setImageError(false)
    setHasTriedFallback(false)
  }, [thumbnailUrl])

  // Debug logging (commented out for production)
  // console.log('YouTubeThumbnail component:', {
  //   url,
  //   isYouTubeUrl,
  //   thumbnailUrl,
  //   fill,
  //   width,
  //   height,
  //   className
  // })

  const handleError = (e: any) => {
    const errorInfo = {
      thumbnailUrl: currentImageUrl,
      originalUrl: url,
      isYouTubeUrl,
      error: e,
      errorType: typeof e,
      errorTarget: e?.target,
      errorCurrentTarget: e?.currentTarget,
      hasTriedFallback
    };
    console.error('YouTubeThumbnail - Image failed to load:', errorInfo)
    
    // Prevent infinite retry loops
    if (hasTriedFallback) {
      console.log('Already tried fallback, showing placeholder')
      setImageError(true)
      onError?.(errorInfo)
      return
    }
    
    if (isYouTubeUrl && !hasTriedFallback) {
      // Try fallback YouTube thumbnail
      const videoId = currentImageUrl?.match(/\/vi\/([^\/]+)\//)?.[1]
      if (videoId) {
        console.log('Trying fallback YouTube thumbnail:', `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
        setCurrentImageUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
        setHasTriedFallback(true)
        return
      }
    }
    
    console.log('Falling back to placeholder.svg')
    setImageError(true)
    setCurrentImageUrl('/placeholder.svg')
    setHasTriedFallback(true)
    
    // Pass the error information to the parent component
    onError?.(errorInfo)
  }

  const handleLoad = () => {
    // console.log('Image loaded successfully:', currentImageUrl)
    onLoad?.()
  }

  if (!currentImageUrl || currentImageUrl.trim() === '') {
    // console.log('YouTubeThumbnail: No valid thumbnail URL, showing placeholder')
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
        <Image
          src="/placeholder.svg"
          alt="No image available"
          fill={fill}
          width={width}
          height={height}
          className="object-contain"
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={currentImageUrl}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
      />
      {/* YouTube Play Button Overlay */}
      {isYouTubeUrl && showPlayButton && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all duration-300">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
            <svg 
              className="w-4 h-4 sm:w-6 sm:h-6 text-white ml-1" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
