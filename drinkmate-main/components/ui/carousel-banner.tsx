"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselItem {
  id: number
  type?: "banner" | "hero"
  src: string
  alt: string
  mobileSrc?: string
  mobileAlt?: string
}

interface CarouselBannerProps {
  items: CarouselItem[]
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
  renderCustomContent?: (item: CarouselItem, isActive: boolean) => React.ReactNode
}

export default function CarouselBanner({ 
  items, 
  autoPlay = true, 
  autoPlayInterval = 5000,
  className = "",
  renderCustomContent
}: CarouselBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === items.length - 1 ? 0 : prev + 1))
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, items.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === items.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? items.length - 1 : prev - 1))
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  return (
    <div id="animation-carousel" className={`relative w-full ${className}`} data-carousel="static">
      {/* Carousel wrapper */}
      <div 
        className="relative h-[600px] sm:h-[700px] md:h-[500px] lg:h-[550px] xl:h-[600px] 2xl:h-[650px] overflow-hidden rounded-lg w-full touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 duration-200 ease-linear transition-opacity ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            data-carousel-item={index === currentSlide ? "active" : ""}
          >
            {item.type === "hero" && renderCustomContent ? (
              <div className="w-full h-full">
                {renderCustomContent(item, index === currentSlide)}
              </div>
            ) : (
              <>
                {/* Desktop Image */}
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="absolute inset-0 w-full h-full object-cover"
                  priority={index === 0}
                  quality={90}
                />
                
                {/* Mobile Image (if provided) */}
                {item.mobileSrc && (
                  <Image
                    src={item.mobileSrc}
                    alt={item.mobileAlt || item.alt}
                    fill
                    className="absolute inset-0 w-full h-full object-cover md:hidden"
                    priority={index === 0}
                    quality={90}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Slider controls */}
      <button
        type="button"
        className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-2 sm:px-4 cursor-pointer group focus:outline-none touch-manipulation"
        data-carousel-prev
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/40 dark:bg-gray-800/40 group-hover:bg-white/60 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none transition-all duration-200">
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-gray-800" />
          <span className="sr-only">Previous</span>
        </span>
      </button>

      <button
        type="button"
        className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-2 sm:px-4 cursor-pointer group focus:outline-none touch-manipulation"
        data-carousel-next
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/40 dark:bg-gray-800/40 group-hover:bg-white/60 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none transition-all duration-200">
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-gray-800" />
          <span className="sr-only">Next</span>
        </span>
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 touch-manipulation ${
              index === currentSlide 
                ? "bg-white scale-125 sm:scale-110" 
                : "bg-white/60 hover:bg-white/80 active:bg-white/90"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
