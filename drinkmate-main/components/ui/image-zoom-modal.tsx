"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, ZoomIn, ZoomOut, RotateCw, Download, Move } from 'lucide-react'
import Image from 'next/image'
import styles from './image-zoom-modal.module.css'

interface ImageZoomModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  alt: string
  title?: string
}

export default function ImageZoomModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  alt, 
  title 
}: ImageZoomModalProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setRotation(0)
      setIsLoading(true)
    }
  }, [isOpen])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1))
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${alt || 'image'}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black/95 border-0">
        <div className="relative w-full h-[95vh] overflow-hidden">
          {/* Header Controls */}
          <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h3 className="text-white text-lg font-semibold truncate max-w-md">
                {title || alt}
              </h3>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 bg-black/50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.1}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <span className="text-white text-sm px-2 min-w-[3rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={scale >= 5}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Controls */}
              <div className="flex items-center space-x-1 bg-black/50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  title="Rotate"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  title="Reset"
                >
                  <Move className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Container */}
          <div 
            className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div
              className={`relative transition-transform duration-200 ease-out ${styles.transformContainer}`}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`
              }}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              <Image
                src={imageUrl}
                alt={alt}
                width={800}
                height={600}
                className={`${styles.imageContainer} transition-opacity duration-300 ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                priority
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className={styles.instructions}>
              <div className="flex items-center space-x-4">
                <span>🖱️ Scroll to zoom</span>
                <span>🖱️ Drag to pan</span>
                <span>🔄 Click rotate</span>
                <span>📥 Click download</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
