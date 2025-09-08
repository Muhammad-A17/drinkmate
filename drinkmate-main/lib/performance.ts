// Performance optimization utilities

export function preloadImage(src: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  }
}

export function preloadFont(fontUrl: string, fontFamily: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.href = fontUrl
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  }
}

export function lazyLoadImage(img: HTMLImageElement, src: string) {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement
          image.src = src
          image.classList.remove('lazy')
          imageObserver.unobserve(image)
        }
      })
    })
    imageObserver.observe(img)
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    img.src = src
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function getImageOptimizationUrl(
  src: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  // If it's a Cloudinary URL, add optimization parameters
  if (src.includes('cloudinary.com')) {
    const baseUrl = src.split('/upload/')[0]
    const path = src.split('/upload/')[1]
    const transformations = []
    
    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    transformations.push(`q_${quality}`, 'f_auto', 'c_limit')
    
    return `${baseUrl}/upload/${transformations.join(',')}/${path}`
  }
  
  return src
}

export function measurePerformance(name: string, fn: () => void) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now()
    fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
  } else {
    fn()
  }
}

export function preloadCriticalResources() {
  if (typeof window !== 'undefined') {
    // Preload critical images
    const criticalImages = [
      '/images/drinkmate-logo.png',
      '/images/drinkmate-og-image.jpg',
    ]
    
    criticalImages.forEach(src => preloadImage(src))
    
    // Preload critical fonts
    preloadFont('/fonts/inter-var.woff2', 'Inter')
  }
}

export function optimizeImages() {
  if (typeof window !== 'undefined') {
    // Add loading="lazy" to all images that don't have it
    const images = document.querySelectorAll('img:not([loading])')
    images.forEach(img => {
      img.setAttribute('loading', 'lazy')
    })
    
    // Add decoding="async" to all images
    const allImages = document.querySelectorAll('img')
    allImages.forEach(img => {
      img.setAttribute('decoding', 'async')
    })
  }
}

export function enableServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}
