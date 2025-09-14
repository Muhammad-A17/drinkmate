'use client'

import Image from 'next/image'
import { Currency } from '@/utils/currency'
import { useCart } from '@/hooks/use-cart'
import { useCartSettings } from '@/lib/cart-settings-context'
import { useState } from 'react'

interface CartItem {
  id: string | number
  name: string
  price: number
  quantity: number
  image: string
  category?: string
}

interface CartItemRowProps {
  item: CartItem
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem, saveForLater } = useCart()
  const { getText } = useCartSettings()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const onDecrement = () => {
    if (item.quantity === 1) setConfirmDelete(true)
    else updateQuantity(String(item.id), item.quantity - 1)
  }

  const onIncrement = () => {
    updateQuantity(String(item.id), item.quantity + 1)
  }

  const handleRemove = () => {
    removeItem(String(item.id))
    setConfirmDelete(false)
  }

  return (
    <div className="flex gap-4 items-start group hover:bg-ink-50/50 transition-colors duration-200 p-2 -m-2 rounded-lg">
      <div className="relative overflow-hidden rounded-md flex-shrink-0">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          width={80}
          height={80}
          className="rounded-md bg-ink-100 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-ink-900 font-medium truncate">{item.name}</h3>
            <p className="text-sm text-ink-600 mt-0.5">
              Unit price: <Currency amount={item.price} />
            </p>
            {item.category && (
              <p className="text-xs text-ink-500 mt-0.5">{item.category}</p>
            )}
          </div>

          <div className="text-right">
            <div className="text-ink-900 font-semibold text-lg">
              <Currency amount={item.price * item.quantity} />
            </div>
            <div className="text-xs text-ink-500 mt-0.5">
              x{item.quantity}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center border border-ink-200 rounded-full overflow-hidden">
            <button
              aria-label="Decrease quantity"
              className="h-9 w-9 flex items-center justify-center hover:bg-ink-50 active:bg-ink-100 transition-colors duration-150 rounded-l-full"
              onClick={onDecrement}
            >
              <span className="text-lg font-medium">–</span>
            </button>
            <input
              aria-label="Quantity"
              role="spinbutton"
              inputMode="numeric"
              value={item.quantity}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/\D/g, '')) || 1
                updateQuantity(String(item.id), Math.max(1, v))
              }}
              className="w-10 h-9 text-center outline-none font-medium transition-all duration-150 focus:bg-ink-50"
            />
            <button
              aria-label="Increase quantity"
              className="h-9 w-9 flex items-center justify-center hover:bg-ink-50 active:bg-ink-100 transition-colors duration-150 rounded-r-full"
              onClick={onIncrement}
            >
              <span className="text-lg font-medium">+</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <button 
              className="text-brand hover:underline" 
              onClick={() => saveForLater(String(item.id))}
            >
              {getText('general.saveForLaterEn')}
            </button>
            <button 
              className="text-danger hover:underline" 
              onClick={() => setConfirmDelete(true)}
            >
              {getText('general.removeEn')}
            </button>
          </div>
        </div>

        {/* Delete confirm (inline) */}
        {confirmDelete && (
          <div className="mt-3 p-3 rounded-md bg-danger-light text-danger flex items-center justify-between">
            <span>Remove this item?</span>
            <div className="flex gap-2">
              <button 
                className="px-3 py-1 bg-white rounded-md" 
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button 
                className="px-3 py-1 bg-danger text-white rounded-md" 
                onClick={handleRemove}
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
