// Shared TypeScript types for the DrinkMate application

// Base product interface - unified for all product types
export interface BaseProduct {
  _id: string
  id?: string | number
  slug: string
  name: string
  brand?: string
  price: number
  originalPrice?: number
  salePrice?: number
  discount?: number
  image: string
  images?: string[]
  description?: string
  shortDescription?: string
  fullDescription?: string
  rating?: number
  reviews?: number
  averageRating?: number
  reviewCount?: number
  stock?: number
  minStock?: number
  status?: string
  isBestSeller?: boolean
  isFeatured?: boolean
  isNewProduct?: boolean
  isEcoFriendly?: boolean
  sku?: string
  createdAt?: string
  updatedAt?: string
  warranty?: string
  dimensions?: {
    width: number
    height: number
    depth: number
    weight: number
  }
  colors?: Array<{
    name: string
    hexCode: string
    inStock: boolean
  }>
  features?: string[]
  specifications?: Record<string, string>
  videos?: string[]
  documents?: Array<{
    name: string
    url: string
    type: string
  }>
  certifications?: string[]
  compatibility?: string[]
  safetyFeatures?: string[]
  howToUse?: {
    title: string
    steps: Array<{
      id: string
      title: string
      description: string
      image?: string
    }>
  }
  relatedProducts?: any[]
  material?: string // For CO2 cylinders and other products
}

// Product with category information
export interface Product extends BaseProduct {
  category: {
    _id: string
    name: string
    slug: string
  } | string
  subcategory?: string
}

// Bundle interface - extends BaseProduct for consistency
export interface Bundle extends BaseProduct {
  products: Product[]
  savings: number
  isActive: boolean
}

// CO2 Cylinder interface - extends BaseProduct for consistency
export interface CO2Cylinder extends BaseProduct {
  type: string
  capacity: number
  category: {
    _id: string
    name: string
    slug: string
  }
}

// Unified product type that can be any of the three product types
export type UnifiedProduct = Product | Bundle | CO2Cylinder

// Product type discriminator
export type ProductType = 'product' | 'bundle' | 'cylinder'

// Enhanced unified product with type information
export interface UnifiedProductWithType {
  product: UnifiedProduct
  productType: ProductType
}
export interface Category {
  _id: string
  name: string
  slug: string
  description: string
  image?: string
  isActive: boolean
  subcategories: Subcategory[]
}

// Subcategory interface
export interface Subcategory {
  _id: string
  name: string
  slug: string
  description?: string
}

// User interface
export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Cart item interface
export interface CartItem {
  id: string | number
  name: string
  price: number
  image: string
  quantity: number
  productType?: 'product' | 'bundle' | 'cylinder'
  isFree?: boolean
  category?: string
  color?: string
  size?: string
  isBundle?: boolean
}

// Order interface
export interface Order {
  _id: string
  orderNumber: string
  user: User
  items: CartItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: Address
  billingAddress?: Address
  createdAt: string
  updatedAt: string
  trackingNumber?: string
  estimatedDelivery?: string
}

// Address interface
export interface Address {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

// Review interface
export interface Review {
  _id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  pros?: string
  cons?: string
  wouldRecommend: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Filter interfaces
export interface ProductFilters {
  category?: string
  subcategory?: string
  brand?: string[]
  priceRange?: [number, number]
  rating?: number
  inStock?: boolean
  isNewProduct?: boolean
  isBestSeller?: boolean
  search?: string
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Component props interfaces
export interface ProductCardProps {
  product: Product | Bundle | CO2Cylinder
  onAddToCart?: (item: CartItem) => void
  onAddToWishlist?: (productId: string) => void
  onQuickView?: (product: Product | Bundle | CO2Cylinder) => void
  showQuickActions?: boolean
  className?: string
}

export interface PageLayoutProps {
  currentPage?: string
  children: React.ReactNode
  className?: string
}

// Form interfaces
export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  acceptTerms: boolean
}

export interface ContactForm {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

// Translation interface
export interface Translation {
  [key: string]: string | Translation
}

// Theme interface
export interface Theme {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  error: string
  warning: string
  success: string
  info: string
}

// Configuration interface
export interface AppConfig {
  apiBaseUrl: string
  frontendUrl: string
  environment: 'development' | 'staging' | 'production'
  features: {
    enableReviews: boolean
    enableWishlist: boolean
    enableCompare: boolean
    enableQuickView: boolean
    enableGuestCheckout: boolean
  }
  payment: {
    urways: {
      apiKey: string
      secretKey: string
      merchantId: string
      environment: 'sandbox' | 'production'
    }
    tap: {
      apiKey: string
      secretKey: string
      merchantId: string
      environment: 'sandbox' | 'production'
    }
  }
  delivery: {
    aramex: {
      enabled: boolean
      apiKey: string
      username: string
      password: string
      environment: 'sandbox' | 'production'
    }
  }
}
