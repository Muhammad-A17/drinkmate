'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface LazyLoadingOptions {
  threshold?: number
  rootMargin?: string
  root?: Element | null
}

interface LazyLoadingReturn {
  isVisible: boolean
  ref: React.RefObject<HTMLElement>
  hasBeenVisible: boolean
}

export const useLazyLoading = (options: LazyLoadingOptions = {}): LazyLoadingReturn => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    root = null
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    if (entry.isIntersecting) {
      setIsVisible(true)
      setHasBeenVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
      root
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [handleIntersection, threshold, rootMargin, root])

  return {
    isVisible,
    ref,
    hasBeenVisible
  }
}

export default useLazyLoading
