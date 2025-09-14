'use client'

import Image from 'next/image'
import { Currency } from '@/utils/currency'
import { useCart } from '@/hooks/use-cart'
import { useCartSettings } from '@/lib/cart-settings-context'

interface RecItem {
  id: string | number
  name: string
  price: number
  image: string
  category?: string
}

interface RecommendationsProps {
  items: RecItem[]
}

export default function Recommendations({ items }: RecommendationsProps) {
  const { addItem } = useCart()
  const { settings, getText } = useCartSettings()
  
  if (!settings.recommendations.enabled || !items?.length) return null

  // Filter out items already in cart if setting is enabled
  const filteredItems = settings.recommendations.excludeInCart 
    ? items.filter(item => !addItem.toString().includes(String(item.id)))
    : items

  return (
    <section className="bg-white rounded-soft shadow-card p-5">
      <h2 className="text-lg font-semibold text-ink-900 mb-4">{getText('recommendations.titleEn')}</h2>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.slice(0, settings.recommendations.maxCount).map((p, index) => (
          <div 
            key={p.id}
            className="transform scale-80 hover:scale-85 transition-all duration-300 ease-out"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <ProductCard p={p} onAdd={() => addItem({
              id: String(p.id),
              name: p.name,
              price: p.price,
              quantity: 1,
              image: p.image,
            })} />
          </div>
        ))}
      </div>

      {/* Mobile carousel */}
      <div className="sm:hidden overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-3 pr-3 snap-x snap-mandatory">
          {filteredItems.slice(0, settings.recommendations.maxCount).map((p, index) => (
            <div 
              className="snap-start min-w-[72%] transform scale-80 hover:scale-85 transition-all duration-300 ease-out" 
              key={p.id}
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <ProductCard p={p} onAdd={() => addItem({
                id: String(p.id),
                name: p.name,
                price: p.price,
                quantity: 1,
                image: p.image,
              })} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductCard({ p, onAdd }: { p: RecItem; onAdd: () => void }) {
  return (
    <div className="rounded-soft border border-ink-200 hover:border-brand/60 transition-all duration-300 p-3 h-full flex flex-col group hover:shadow-lg">
      <div className="relative overflow-hidden rounded-md">
        <Image 
          src={p.image || "/placeholder.svg"} 
          alt={p.name} 
          width={320} 
          height={320} 
          className="rounded-md object-cover aspect-[4/5] transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <div className="mt-3 flex-1">
        <div className="text-ink-900 font-medium line-clamp-2 text-sm group-hover:text-brand transition-colors duration-200">{p.name}</div>
        <div className="mt-1 text-ink-700">
          <Currency amount={p.price} />
        </div>
      </div>
      <button 
        className="mt-3 h-11 rounded-md text-white font-medium transition-all duration-300 transform bg-brand hover:bg-brand-dark hover:scale-105 active:scale-95"
        onClick={onAdd}
      >
        Add
      </button>
    </div>
  )
}
