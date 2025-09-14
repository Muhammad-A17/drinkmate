import { useEffect, useState, useRef } from 'react'

export const useStickyInView = () => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const ob = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '0px 0px -40% 0px', threshold: 0.01 }
    )
    ob.observe(ref.current)
    return () => ob.disconnect()
  }, [])

  return { ref, inView }
}
