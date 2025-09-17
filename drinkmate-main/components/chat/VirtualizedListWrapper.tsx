'use client'

import React, { useState, useEffect } from 'react'
import SimpleVirtualizedList from './SimpleVirtualizedList'

interface VirtualizedListWrapperProps {
  items: any[]
  itemHeight: number
  height: number
  renderItem: (item: any, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

const VirtualizedListWrapper: React.FC<VirtualizedListWrapperProps> = (props) => {
  const [useReactWindow, setUseReactWindow] = useState(false)
  const [ReactWindowList, setReactWindowList] = useState<any>(null)

  useEffect(() => {
    // Try to dynamically import react-window
    import('react-window')
      .then((module) => {
        setReactWindowList(() => (module as any).FixedSizeList)
        setUseReactWindow(true)
      })
      .catch((error) => {
        console.warn('react-window not available, using fallback virtualization:', error)
        setUseReactWindow(false)
      })
  }, [])

  // Use simple virtualization as fallback
  if (!useReactWindow || !ReactWindowList) {
    return <SimpleVirtualizedList {...props} />
  }

  // Use react-window if available
  return (
    <ReactWindowList
      height={props.height}
      itemCount={props.items.length}
      itemSize={props.itemHeight}
      overscanCount={props.overscan || 5}
      className={props.className}
    >
      {({ index, style }: { index: number; style: React.CSSProperties }) => (
        <div style={style}>
          {props.renderItem(props.items[index], index)}
        </div>
      )}
    </ReactWindowList>
  )
}

export default VirtualizedListWrapper
