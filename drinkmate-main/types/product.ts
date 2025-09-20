export interface Variant {
  id: string
  colorName?: string         // e.g., "Arctic Blue"
  colorHex?: string          // e.g., "#5BC0EB"
  image?: string             // variant image
  price: number              // current price
  compareAtPrice?: number    // sale strike-through if present
  inStock: boolean
}

export interface Product {
  id: string
  slug: string
  title: string
  image: string
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean; order?: number }>  // Array of image objects from API
  rating?: number | { average: number; count: number }  // 0-5 or object with average and count
  reviewCount?: number
  price: number              // base/current price
  compareAtPrice?: number    // optional sale
  minPrice?: number          // when variants have different prices
  maxPrice?: number
  variants?: Variant[]
  badges?: string[]          // e.g., ["Premium", "New"]
  inStock: boolean
  description?: string
  category?: string
  brand?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ProductCardProps {
  product: Product
  dir?: "ltr" | "rtl"        // pass "rtl" on Arabic pages
  onAddToCart?: (payload: {
    productId: string
    variantId?: string
    qty: number
  }) => void
  className?: string
}

export interface ProductGridProps {
  products: Product[]
  dir?: "ltr" | "rtl"
  className?: string
  loading?: boolean
}

