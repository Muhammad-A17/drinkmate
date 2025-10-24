'use client'

import Link from 'next/link'
import CartHeader from './CartHeader'
import CartItemRow from './CartItemRow'
import AnimatedCartItem from './AnimatedCartItem'
import CartNote from './CartNote'
import FreeGift from './FreeGift'
import PersonalizedRecommendations from './PersonalizedRecommendations'
import Summary from './Summary'
import StickyCheckout from './StickyCheckout'
import { useCart } from '@/hooks/use-cart'
import { useStickyInView } from '@/hooks/useStickyInView'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Banner from '@/components/layout/Banner'
import { CartSettingsProvider } from '@/lib/contexts/cart-settings-context'
import { Currency } from '@/utils/currency'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/contexts/translation-context'


export default function CartPage() {
  const { items, totalPrice, totalItems, loading, error, updateTrigger, addItem, clearCart, updateQuantity, removeItem } = useCart()
  const { ref: summaryRef, inView: summaryInView } = useStickyInView()
  const { t } = useTranslation()
  
  // Debug logging removed to prevent hydration issues

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
            <p className="text-gray-600">{t("cart.loading")}</p>
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
              {t("cart.retry")}
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
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-soft shadow-card">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 text-center text-ink-500"
              >
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-4">Add some products to get started!</p>
                <Link 
                  href="/shop" 
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </motion.div>
            ) : (
              <div className="p-4 space-y-4" key={updateTrigger}>
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <AnimatedCartItem
                      key={`${item.id}-${updateTrigger}`}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                      onMoveToWishlist={(id) => {
                        // Move to wishlist logic here
                        // console.log('Move to wishlist:', id)
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          <CartNote />

          <FreeGift />

          <PersonalizedRecommendations />
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
