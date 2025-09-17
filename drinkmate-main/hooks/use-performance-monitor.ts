'use client'

import { useEffect, useRef, useState } from 'react'

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  componentCount: number
  lastUpdate: Date
}

interface PerformanceMonitorOptions {
  enabled?: boolean
  logToConsole?: boolean
  threshold?: number // Log if render time exceeds threshold
}

export const usePerformanceMonitor = (
  componentName: string,
  options: PerformanceMonitorOptions = {}
) => {
  const {
    enabled = true,
    logToConsole = false,
    threshold = 16 // 16ms = 60fps
  } = options

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    lastUpdate: new Date()
  })

  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return

    renderStartTime.current = performance.now()
    renderCount.current += 1

    const measurePerformance = () => {
      const renderTime = performance.now() - renderStartTime.current
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0

      const newMetrics: PerformanceMetrics = {
        renderTime,
        memoryUsage,
        componentCount: renderCount.current,
        lastUpdate: new Date()
      }

      setMetrics(newMetrics)

      if (logToConsole && renderTime > threshold) {
        console.warn(`🐌 Slow render detected in ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          memoryUsage: `${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
          componentCount: renderCount.current
        })
      }
    }

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measurePerformance)
  })

  // Memory usage monitoring
  useEffect(() => {
    if (!enabled) return

    const updateMemoryUsage = () => {
      if ((performance as any).memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: (performance as any).memory.usedJSHeapSize
        }))
      }
    }

    const interval = setInterval(updateMemoryUsage, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [enabled])

  return {
    metrics,
    isSlowRender: metrics.renderTime > threshold,
    getPerformanceReport: () => ({
      component: componentName,
      ...metrics,
      memoryUsageMB: (metrics.memoryUsage / 1024 / 1024).toFixed(2)
    })
  }
}

export default usePerformanceMonitor
