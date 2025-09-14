'use client'

import CartHeader from './CartHeader'
import CartItemRow from './CartItemRow'
import CartNote from './CartNote'
import FreeGift from './FreeGift'
import Recommendations from './Recommendations'
import Summary from './Summary'
import StickyCheckout from './StickyCheckout'
import { useCart } from '@/hooks/use-cart'
import { useStickyInView } from '@/hooks/useStickyInView'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Banner from '@/components/layout/Banner'
import { CartSettingsProvider } from '@/lib/cart-settings-context'
import { Currency } from '@/utils/currency'

// Mock recommendations data - replace with your actual data source
const mockRecommendations = [
  {
    id: 201,
    name: "Premium CO2 Cylinder",
    price: 45.00,
    image: "/images/italian-strawberry-lemon-syrup.png",
    category: "Accessories"
  },
  {
    id: 202,
    name: "Flavor Syrup Pack",
    price: 25.00,
    image: "/images/italian-strawberry-lemon-syrup.png",
    category: "Flavors"
  },
  {
    id: 203,
    name: "Replacement Parts Kit",
    price: 35.00,
    image: "/images/italian-strawberry-lemon-syrup.png",
    category: "Accessories"
  }
]

export default function CartPage() {
  const { items, totalPrice, totalItems, loading, error, updateTrigger, addItem, clearCart } = useCart()
  const { ref: summaryRef, inView: summaryInView } = useStickyInView()
  
  // Debug logging to track cart updates
  console.log('CartPage render - items:', items.length, 'totalPrice:', totalPrice, 'updateTrigger:', updateTrigger)

  // Calculate totals
  const subtotal = totalPrice
  const freeShippingThreshold = 150
  const isFreeShipping = subtotal >= freeShippingThreshold
  const shipping = isFreeShipping ? 0 : (subtotal > 0 ? 25 : null)
  const discount = 0 // TODO: Add coupon support
  const tax = subtotal * 0.15 // 15% VAT
  const total = subtotal + (shipping || 0) - discount + tax

  const totals = {
    subtotal,
    shipping,
    discount,
    tax,
    total,
    shippingLabel: isFreeShipping ? 'FREE' : shipping ? <Currency amount={shipping} /> : 'Calculated at checkout'
  }

  // Show loading state
  if (loading) {
    return (
      <CartSettingsProvider>
        <Banner />
        <Header currentPage="cart" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cart...</p>
          </div>
        </div>
        <Footer />
      </CartSettingsProvider>
    )
  }

  // Show error state
  if (error) {
    return (
      <CartSettingsProvider>
        <Banner />
        <Header currentPage="cart" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </CartSettingsProvider>
    )
  }

  return (
    <CartSettingsProvider>
      <Banner />
      <Header currentPage="cart" />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-28">
        <CartHeader />
        
        {/* Debug test button - remove in production */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold mb-2">Debug Cart Test</h3>
          <div className="space-x-2">
            <button 
              onClick={() => {
                const testItem = {
                  id: 'test-' + Date.now(),
                  name: 'Test Product',
                  price: 25.00,
                  quantity: 1,
                  image: '/images/italian-strawberry-lemon-syrup.png'
                }
                addItem(testItem)
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Add Test Item
            </button>
            <button 
              onClick={() => clearCart()}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Clear Cart
            </button>
            <span className="text-sm text-gray-600">
              Items: {items.length} | Total: {totalPrice.toFixed(2)} | Trigger: {updateTrigger}
            </span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-soft shadow-card">
            {items.length === 0 ? (
              <div className="p-10 text-center text-ink-500">Your cart is empty.</div>
            ) : (
              <ul className="divide-y divide-ink-100" key={updateTrigger}>
                {items.map((item) => (
                  <li key={`${item.id}-${updateTrigger}`} className="p-5">
                    <CartItemRow item={item} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <CartNote />

          <FreeGift />

          <Recommendations items={mockRecommendations} />
        </div>

        {/* Right column (summary) */}
        <aside className="lg:col-span-4">
          <div ref={summaryRef} key={`summary-${updateTrigger}`}>
            <Summary totals={totals} />
          </div>
        </aside>
      </div>

      {/* Sticky bar only when summary not in view & cart not empty */}
      {items.length > 0 && <StickyCheckout visible={!summaryInView} totals={totals} />}
      </main>
      <Footer />
    </CartSettingsProvider>
  )
}
