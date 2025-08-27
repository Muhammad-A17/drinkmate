"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  priority?: boolean;
  quality?: number;
}

export default function ProductImageGallery({ 
  images = ["/images/placeholder.png"], 
  activeIndex = 0, 
  setActiveIndex,
  priority = false,
  quality = 80
}: ProductImageGalleryProps) {
  
  const handlePrevious = () => {
    setActiveIndex(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  };

  const handleNext = () => {
    setActiveIndex(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  };

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <Image 
          src={images[activeIndex]} 
          alt="Product image" 
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority={priority}
          quality={quality}
        />
        
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto py-1">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative w-20 h-20 border-2 rounded-md overflow-hidden ${
                index === activeIndex 
                  ? 'border-[#12d6fa]' 
                  : 'border-transparent hover:border-gray-300'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image 
                src={image} 
                alt={`Product thumbnail ${index + 1}`} 
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
