"use client"

import { useState, useEffect } from "react"
import { Play, ExternalLink, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

interface YouTubeVideoProps {
  videoUrl: string
  title?: string
  className?: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  showThumbnail?: boolean
  thumbnailClassName?: string
}

export function YouTubeVideo({
  videoUrl,
  title = "Video",
  className = "",
  autoplay = false,
  muted = false,
  controls = true,
  showThumbnail = true,
  thumbnailClassName = "",
}: YouTubeVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null)

  // Extract YouTube video ID from various YouTube URL formats
  useEffect(() => {
    const extractVideoId = (url: string): string | null => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      ]

      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
          return match[1]
        }
      }
      return null
    }

    const id = extractVideoId(videoUrl)
    setVideoId(id)

    if (id) {
      // Generate thumbnail URL with fallback
      const youtubeThumbnailBase = process.env.NEXT_PUBLIC_YOUTUBE_THUMBNAIL_BASE || 'https://img.youtube.com/vi'
      setThumbnailUrl(`${youtubeThumbnailBase}/${id}/maxresdefault.jpg`)
      setIsLoading(false)
    }
  }, [videoUrl])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout)
      }
    }
  }, [loadTimeout])

  // Suppress YouTube CORS errors globally
  useEffect(() => {
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    console.error = (...args) => {
      const message = args.join(' ')
      // Suppress YouTube CORS errors
      if (message.includes('googleads.g.doubleclick.net') || 
          message.includes('youtube.com/pagead') ||
          message.includes('Access-Control-Allow-Origin') ||
          message.includes('CORS policy')) {
        return // Suppress these errors
      }
      originalConsoleError.apply(console, args)
    }

    console.warn = (...args) => {
      const message = args.join(' ')
      // Suppress YouTube CORS warnings
      if (message.includes('googleads.g.doubleclick.net') || 
          message.includes('youtube.com/pagead') ||
          message.includes('Access-Control-Allow-Origin') ||
          message.includes('CORS policy')) {
        return // Suppress these warnings
      }
      originalConsoleWarn.apply(console, args)
    }

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || ''
      if (reason.includes('googleads.g.doubleclick.net') || 
          reason.includes('youtube.com/pagead') ||
          reason.includes('CORS policy')) {
        event.preventDefault() // Suppress the error
        return
      }
    }

    // Handle fetch errors
    const handleFetchError = (event: ErrorEvent) => {
      const message = event.message || ''
      if (message.includes('googleads.g.doubleclick.net') || 
          message.includes('youtube.com/pagead') ||
          message.includes('CORS policy')) {
        event.preventDefault() // Suppress the error
        return
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleFetchError)

    // Restore original console methods and remove listeners on cleanup
    return () => {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleFetchError)
    }
  }, [])

  const handlePlay = () => {
    setIsPlaying(true)
    setHasError(false)
    setErrorMessage("")
    
    // Set a timeout to detect if video fails to load
    const timeout = setTimeout(() => {
      setHasError(true)
      setErrorMessage("Video is taking too long to load. Please try again or watch on YouTube.")
    }, 10000) // 10 second timeout
    
    setLoadTimeout(timeout)
  }

  const handleClose = () => {
    setIsPlaying(false)
    // Clear timeout when closing
    if (loadTimeout) {
      clearTimeout(loadTimeout)
      setLoadTimeout(null)
    }
  }

  const handlePlayerError = (error: any) => {
    console.warn("YouTube player error:", error)
    setHasError(true)
    setErrorMessage("Failed to load video. Please try again or watch on YouTube.")
    setIsPlaying(false)
  }

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  const handleRetry = () => {
    setHasError(false)
    setErrorMessage("")
    setIsLoading(true)
    // Force re-render by updating videoId
    const id = extractVideoId(videoUrl)
    if (id) {
      setVideoId(id)
      const youtubeThumbnailBase = process.env.NEXT_PUBLIC_YOUTUBE_THUMBNAIL_BASE || 'https://img.youtube.com/vi'
      setThumbnailUrl(`${youtubeThumbnailBase}/${id}/maxresdefault.jpg`)
    }
  }

  if (!videoId) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <ExternalLink className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Invalid YouTube URL</p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
          >
            Open in YouTube
          </a>
        </div>
      </div>
    )
  }

  if (isPlaying && !hasError) {
    return (
      <div className={`relative ${className}`}>
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={`${process.env.NEXT_PUBLIC_YOUTUBE_EMBED_BASE || 'https://www.youtube.com/embed'}/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&fs=1&disablekb=0&iv_load_policy=3&cc_load_policy=0&playsinline=1&widget_referrer=${typeof window !== 'undefined' ? window.location.origin : ''}`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            referrerPolicy="strict-origin-when-cross-origin"
            onError={handlePlayerError}
            onLoad={() => {
              // Reset error state when iframe loads successfully
              setHasError(false)
              setErrorMessage("")
              // Clear timeout when video loads successfully
              if (loadTimeout) {
                clearTimeout(loadTimeout)
                setLoadTimeout(null)
              }
            }}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-800"
          onClick={handleClose}
        >
          ×
        </Button>
      </div>
    )
  }

  // Show error state with retry option
  if (hasError) {
    return (
      <div className={`relative ${className}`}>
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center p-4 sm:p-6 max-w-sm mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Video Error</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">{errorMessage}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                🔄 Retry
              </Button>
              <Button
                onClick={() => window.open(videoUrl, '_blank')}
                variant="default"
                size="sm"
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                <Youtube className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Watch on YouTube</span>
                <span className="sm:hidden">YouTube</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showThumbnail) {
    return (
      <div className={`relative group cursor-pointer ${className}`} onClick={handlePlay}>
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 p-2 sm:p-3 z-10">
            <div className="bg-red-600 text-white text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium">YouTube</div>
          </div>
          <div className="absolute top-0 right-0 p-2 sm:p-3 z-10">
            <div className="bg-black/70 text-white text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">HD</div>
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={thumbnailUrl || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              // Try fallback thumbnail URLs
              const youtubeThumbnailBase = process.env.NEXT_PUBLIC_YOUTUBE_THUMBNAIL_BASE || 'https://img.youtube.com/vi'
              if (target.src.includes('maxresdefault')) {
                target.src = `${youtubeThumbnailBase}/${videoId}/hqdefault.jpg`
              } else if (target.src.includes('hqdefault')) {
                target.src = `${youtubeThumbnailBase}/${videoId}/mqdefault.jpg`
              } else {
                target.src = "/video-thumbnail.png"
              }
              setIsLoading(false)
            }}
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-800 ml-0.5" fill="currentColor" />
            </div>
          </div>
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4 lg:p-6">
              <p className="text-white text-xs sm:text-sm lg:text-base font-medium line-clamp-2 leading-tight">{title}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={`${process.env.NEXT_PUBLIC_YOUTUBE_EMBED_BASE || 'https://www.youtube.com/embed'}/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}&rel=0&modestbranding=1`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

// Helper function to check if a URL is a YouTube URL
export function isYouTubeUrl(url: string): boolean {
  const youtubePatterns = [/youtube\.com\/watch\?v=/, /youtu\.be\//, /youtube\.com\/embed\//, /youtube\.com\/v\//]

  return youtubePatterns.some((pattern) => pattern.test(url))
}

// Helper function to extract video ID from YouTube URL
export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  return null
}
