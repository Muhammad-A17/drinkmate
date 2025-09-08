// Service Worker for DrinkMate
const CACHE_NAME = 'drinkmate-v1'
const urlsToCache = [
  '/',
  '/shop',
  '/co2',
  '/recipes',
  '/contact',
  '/track-order',
  '/refill-cylinder',
  '/manifest.json',
  '/favicon.ico',
  '/images/drinkmate-logo.png',
  '/images/drinkmate-og-image.jpg',
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
