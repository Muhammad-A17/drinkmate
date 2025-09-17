'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Currency } from '@/utils/currency'
import { useCart } from '@/hooks/use-cart'
import { useCartSettings } from '@/lib/cart-settings-context'
import { useAuth } from '@/lib/auth-context'

interface RecommendationItem {
  _id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  images: string[]
  averageRating?: number
  reviewCount?: number
  category?: {
    name: string
    slug: string
  }
  shortDescription?: string
}

interface PersonalizedRecommendationsProps {
  className?: string
}

export default function PersonalizedRecommendations({ className = "" }: PersonalizedRecommendationsProps) {
  const { user, isAuthenticated, token } = useAuth()
  const { addItem, items: cartItems } = useCart()
  const { settings, getText } = useCartSettings()
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [strategy, setStrategy] = useState<string>('')
  
  useEffect(() => {
    fetchRecommendations()
  }, [isAuthenticated, token, settings.recommendations.enabled, settings.recommendations.maxCount, settings.recommendations.excludeInCart, cartItems])
  
  const fetchRecommendations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (!isAuthenticated || !token) {
        // If no token, fetch best selling products instead
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/recommendations/best-selling?limit=3`)
        const data = await response.json()
        
        if (data.success) {
          setRecommendations(data.data.products)
          setStrategy('best_sellers_only')
        } else {
          throw new Error(data.message || 'Failed to fetch recommendations')
        }
        return
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/recommendations/personalized?limit=3`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setRecommendations(data.data.recommendations)
        setStrategy(data.data.strategy)
      } else {
        throw new Error(data.message || 'Failed to fetch personalized recommendations')
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
      
      // Fallback to best selling products
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/recommendations/best-selling?limit=3`)
        const data = await response.json()
        
        if (data.success) {
          setRecommendations(data.data.products)
          setStrategy('best_sellers_fallback')
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!settings.recommendations.enabled) return null
  
  if (loading) {
    return (
      <section className={`bg-white rounded-soft shadow-card p-5 ${className}`}>
        <h2 className="text-lg font-semibold text-ink-900 mb-4">{getText('recommendations.titleEn')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-md aspect-[4/5] mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }
  
  if (error || !recommendations?.length) {
    return null
  }
  
  // Filter out items already in cart if setting is enabled
  const filteredItems = settings.recommendations.excludeInCart 
    ? recommendations.filter(item => {
        // This is a simple check - you might want to improve this logic
        return true // For now, we'll show all recommendations
      })
    : recommendations

  return (
    <section className={`bg-white rounded-soft shadow-card p-5 ${className}`}>
      <h2 className="text-lg font-semibold text-ink-900 mb-4">{getText('recommendations.titleEn')}</h2>
      
      {/* Strategy indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mb-2">
          Strategy: {strategy}
        </div>
      )}

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.slice(0, settings.recommendations.maxCount).map((product, index) => (
          <div 
            key={product._id}
            className="transform scale-80 hover:scale-85 transition-all duration-300 ease-out"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <ProductCard 
              product={product} 
              onAdd={() => addItem({
                id: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.images?.[0] || "/placeholder.svg",
              })} 
            />
          </div>
        ))}
      </div>

      {/* Mobile carousel */}
      <div className="sm:hidden overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-3 pr-3 snap-x snap-mandatory">
          {filteredItems.slice(0, settings.recommendations.maxCount).map((product, index) => (
            <div 
              className="snap-start min-w-[72%] transform scale-80 hover:scale-85 transition-all duration-300 ease-out" 
              key={product._id}
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <ProductCard 
                product={product} 
                onAdd={() => addItem({
                  id: product._id,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  image: product.images?.[0] || "/placeholder.svg",
                })} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, onAdd }: { product: RecommendationItem; onAdd: () => void }) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  
  return (
    <div className="rounded-soft border border-ink-200 hover:border-brand/60 transition-all duration-300 p-3 h-full flex flex-col group hover:shadow-lg">
      <div className="relative overflow-hidden rounded-md">
        <Image 
          src={product.images?.[0] || "/placeholder.svg"} 
          alt={product.name} 
          width={320} 
          height={320} 
          className="rounded-md object-cover aspect-[4/5] transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        
        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Sale
          </div>
        )}
      </div>
      
      <div className="mt-3 flex-1">
        <div className="text-ink-900 font-medium line-clamp-2 text-sm group-hover:text-brand transition-colors duration-200">
          {product.name}
        </div>
        
        {/* Category */}
        {product.category && (
          <div className="text-xs text-gray-500 mt-1">
            {product.category.name}
          </div>
        )}
        
        {/* Rating */}
        {product.averageRating && product.reviewCount && (
          <div className="flex items-center mt-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.averageRating!) ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviewCount})
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <Currency amount={product.price} />
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              <Currency amount={product.originalPrice!} />
            </span>
          )}
        </div>
      </div>
      
      <button 
        className="mt-3 h-11 rounded-md text-white font-medium transition-all duration-300 transform bg-brand hover:bg-brand-dark hover:scale-105 active:scale-95"
        onClick={onAdd}
      >
        Add to Cart
      </button>
    </div>
  )
}