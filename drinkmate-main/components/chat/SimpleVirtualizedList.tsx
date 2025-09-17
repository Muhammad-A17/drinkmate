'use client'

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'

interface SimpleVirtualizedListProps {
  items: any[]
  itemHeight: number
  height: number
  renderItem: (item: any, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

const SimpleVirtualizedList: React.FC<SimpleVirtualizedListProps> = ({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 5,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(height / itemHeight) + overscan,
      items.length - 1
    )
    
    return {
      start: Math.max(0, startIndex - overscan),
      end: endIndex
    }
  }, [scrollTop, itemHeight, height, items.length, overscan])

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }))
  }, [items, visibleRange])

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Calculate total height
  const totalHeight = items.length * itemHeight

  // Calculate offset for visible items
  const offsetY = visibleRange.start * itemHeight

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SimpleVirtualizedList
