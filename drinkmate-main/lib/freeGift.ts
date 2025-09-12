/**
 * Free Gift State Management
 * Centralized logic for free gift eligibility and selection
 */

export interface FreeGiftProduct {
  id: number
  name: string
  image: string
  originalPrice: number
  sku?: string
}

export interface FreeGiftState {
  eligible: boolean
  selected: FreeGiftProduct | null
  options: FreeGiftProduct[]
  maxQty: number
  threshold: number
  currentTotal: number
}

export interface Cart {
  total: number
  promotions?: {
    freeGift?: {
      eligible: boolean
      selectedItem?: FreeGiftProduct | null
      options?: FreeGiftProduct[]
      maxQty?: number
      threshold?: number
    }
  }
}

// Default free gift options
const DEFAULT_FREE_GIFT_OPTIONS: FreeGiftProduct[] = [
  {
    id: 101,
    name: "Drinkmate Flavor Sachet - Cherry",
    image: "/images/italian-strawberry-lemon-syrup.png",
    originalPrice: 15.0,
    sku: "FREE-CHERRY-101"
  },
  {
    id: 102,
    name: "Drinkmate Flavor Sachet - Lemon", 
    image: "/images/italian-strawberry-lemon-syrup.png",
    originalPrice: 15.0,
    sku: "FREE-LEMON-102"
  },
  {
    id: 103,
    name: "Drinkmate Flavor Sachet - Peach",
    image: "/images/italian-strawberry-lemon-syrup.png", 
    originalPrice: 15.0,
    sku: "FREE-PEACH-103"
  }
]

export function getFreeGiftState(cart: Cart): FreeGiftState {
  const threshold = 100
  const currentTotal = cart.total
  const eligible = currentTotal >= threshold && currentTotal < 150 // Between 100-150 SAR
  
  const promo = cart.promotions?.freeGift
  
  return {
    eligible,
    selected: promo?.selectedItem ?? null,
    options: promo?.options ?? DEFAULT_FREE_GIFT_OPTIONS,
    maxQty: promo?.maxQty ?? 1,
    threshold,
    currentTotal
  }
}

export function isFreeGiftEligible(total: number, threshold: number = 100): boolean {
  return total >= threshold && total < 150
}

export function getRemainingForFreeGift(total: number, threshold: number = 100): number {
  return Math.max(0, threshold - total)
}
