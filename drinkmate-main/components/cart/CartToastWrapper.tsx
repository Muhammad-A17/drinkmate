'use client'

import { useCart } from '@/lib/contexts/cart-context'
import ImprovedCartToast from './ImprovedCartToast'

export default function CartToastWrapper() {
  const { state, hideToast } = useCart()

  return (
    <ImprovedCartToast
      item={state.lastAddedItem}
      isVisible={state.showToast}
      onClose={hideToast}
    />
  )
}
