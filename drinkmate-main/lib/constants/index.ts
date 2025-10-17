// Shared constants for the DrinkMate application

// API Configuration
// Prefer local API during development even if NEXT_PUBLIC_API_URL is set
const isProdEnv = (process.env.NODE_ENV === 'production')
const resolvedBaseUrl = isProdEnv
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://drinkmate.sa/api')
  : 'http://localhost:3000'

export const API_CONFIG = {
  BASE_URL: resolvedBaseUrl,
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000') || 30000,
  RETRY_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3') || 3,
  RETRY_DELAY: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000') || 1000,
} as const

// Application Configuration
export const APP_CONFIG = {
  NAME: 'DrinkMate',
  VERSION: '1.0.0',
  DESCRIPTION: 'Premium Soda Makers, Flavors & Accessories',
  SUPPORT_EMAIL: 'support@drinkmate.com',
  PHONE: '+966 50 123 4567',
  ADDRESS: 'Riyadh, Saudi Arabia',
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  ACCOUNT: '/account',
  ADMIN: '/admin',
  TRACK_ORDER: '/track-order',
  CONTACT: '/contact',
  ABOUT: '/about',
  BLOG: '/blog',
  PRIVACY: '/privacy-policy',
  TERMS: '/terms-of-service',
  COOKIES: '/cookie-policy',
} as const

// Product Categories
export const PRODUCT_CATEGORIES = {
  SODA_MAKERS: 'sodamakers',
  FLAVORS: 'flavors',
  ACCESSORIES: 'accessories',
  CO2_CYLINDERS: 'co2',
} as const

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  OUT_OF_STOCK: 'out_of_stock',
} as const

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

// Payment Methods
export const PAYMENT_METHODS = {
  URWAYS: 'urways',
  TAP: 'tap',
  CASH_ON_DELIVERY: 'cod',
} as const

// Delivery Options
export const DELIVERY_OPTIONS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  ECONOMY: 'economy',
} as const

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const

// Sort Options
export const SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  RATING_ASC: 'rating_asc',
  RATING_DESC: 'rating_desc',
  NEWEST: 'newest',
  OLDEST: 'oldest',
  POPULARITY: 'popularity',
} as const

// Filter Options
export const FILTER_OPTIONS = {
  ALL: 'all',
  IN_STOCK: 'in_stock',
  ON_SALE: 'on_sale',
  NEW_ARRIVALS: 'new_arrivals',
  BEST_SELLERS: 'best_sellers',
  HIGH_RATED: 'high_rated',
} as const

// View Modes
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [12, 24, 48, 96],
} as const

// Price Ranges
export const PRICE_RANGES = {
  UNDER_100: [0, 100],
  UNDER_500: [0, 500],
  UNDER_1000: [0, 1000],
  UNDER_2000: [0, 2000],
  UNDER_5000: [0, 5000],
  ABOVE_5000: [5000, 10000],
} as const

// Rating Options
export const RATING_OPTIONS = {
  ALL: 0,
  FOUR_PLUS: 4,
  THREE_PLUS: 3,
  TWO_PLUS: 2,
  ONE_PLUS: 1,
} as const

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

// Colors
export const COLORS = {
  PRIMARY: '#12d6fa',
  PRIMARY_DARK: '#0fb8d9',
  SECONDARY: '#f8fafc',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const

// Fonts
export const FONTS = {
  PRIMARY_EN: 'Montserrat',
  PRIMARY_AR: 'Cairo',
  SECONDARY_EN: 'Noto Sans',
  SECONDARY_AR: 'Noto Arabic',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  CART: 'cart',
  WISHLIST: 'wishlist',
  COMPARE: 'compare',
  RECENTLY_VIEWED: 'recently-viewed',
  USER_PREFERENCES: 'user-preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  PRODUCTS_BY_CATEGORY: (category: string) => `/api/products/category/${category}`,
  SEARCH_PRODUCTS: '/api/products/search',
  
  // Categories
  CATEGORIES: '/api/categories',
  CATEGORY_BY_ID: (id: string) => `/api/categories/${id}`,
  
  // Cart
  CART: '/api/cart',
  ADD_TO_CART: '/api/cart/add',
  REMOVE_FROM_CART: '/api/cart/remove',
  UPDATE_CART: '/api/cart/update',
  CLEAR_CART: '/api/cart/clear',
  SYNC_CART: '/api/cart/sync',
  
  // Orders
  ORDERS: '/api/orders',
  ORDER_BY_ID: (id: string) => `/api/orders/${id}`,
  CREATE_ORDER: '/api/orders',
  TRACK_ORDER: '/api/orders/track',
  
  // Payments
  PAYMENTS_URWAYS: '/api/payments/urways',
  PAYMENTS_TAP: '/api/payments/tap',
  PAYMENT_VERIFY: '/api/payments/verify',
  
  // Reviews
  REVIEWS: '/api/reviews',
  REVIEW_BY_ID: (id: string) => `/api/reviews/${id}`,
  PRODUCT_REVIEWS: (productId: string) => `/api/reviews/product/${productId}`,
  REVIEW_VOTE: (id: string) => `/api/reviews/${id}/vote`,
  
  // Blog
  BLOG_POSTS: '/api/blog/posts',
  BLOG_POST_BY_ID: (id: string) => `/api/blog/posts/${id}`,
  BLOG_COMMENTS: (id: string) => `/api/blog/posts/${id}/comments`,
  
  // Testimonials
  TESTIMONIALS: '/api/testimonials/testimonials',
  TESTIMONIAL_BY_ID: (id: string) => `/api/testimonials/testimonials/${id}`,
  SUBMIT_TESTIMONIAL: '/api/testimonials/submit',
  
  // Contact
  CONTACT: '/api/contact',
  
  // Admin
  ADMIN_PRODUCTS: '/api/admin/products',
  ADMIN_ORDERS: '/api/admin/orders',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_CATEGORIES: '/api/admin/categories',
  ADMIN_STATS: '/api/admin/stats',
  ADMIN_REVIEWS: '/api/reviews/admin/reviews',
  ADMIN_BLOG_POSTS: '/api/blog/admin/posts',
  ADMIN_TESTIMONIALS: '/api/testimonials/admin/testimonials',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  WEAK_PASSWORD: 'Password must be at least 8 characters long.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  REQUIRED_FIELD: 'This field is required.',
  CART_EMPTY: 'Your cart is empty.',
  PRODUCT_OUT_OF_STOCK: 'This product is out of stock.',
  QUANTITY_EXCEEDS_STOCK: 'Quantity exceeds available stock.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  ORDER_NOT_FOUND: 'Order not found.',
  INVALID_TRACKING_NUMBER: 'Invalid tracking number.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PASSWORD_RESET: 'Password reset instructions sent to your email.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PRODUCT_ADDED_TO_CART: 'Product added to cart!',
  PRODUCT_REMOVED_FROM_CART: 'Product removed from cart.',
  CART_CLEARED: 'Cart cleared successfully.',
  ORDER_PLACED: 'Order placed successfully!',
  PAYMENT_SUCCESS: 'Payment completed successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  CONTACT_MESSAGE_SENT: 'Message sent successfully!',
  WISHLIST_ADDED: 'Added to wishlist!',
  WISHLIST_REMOVED: 'Removed from wishlist.',
} as const

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  MESSAGE_MIN_LENGTH: 10,
  MESSAGE_MAX_LENGTH: 1000,
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 99,
} as const

// Feature Flags
export const FEATURES = {
  ENABLE_REVIEWS: true,
  ENABLE_WISHLIST: true,
  ENABLE_COMPARE: true,
  ENABLE_QUICK_VIEW: true,
  ENABLE_GUEST_CHECKOUT: true,
  ENABLE_SOCIAL_LOGIN: false,
  ENABLE_2FA: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
} as const

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/drinkmate',
  TWITTER: 'https://twitter.com/drinkmate',
  INSTAGRAM: 'https://instagram.com/drinkmate',
  YOUTUBE: 'https://youtube.com/drinkmate',
  LINKEDIN: 'https://linkedin.com/company/drinkmate',
} as const

// SEO Defaults
export const SEO_DEFAULTS = {
  TITLE: 'DrinkMate - Premium Soda Makers, Flavors & Accessories',
  DESCRIPTION: 'Discover premium soda makers, delicious flavors, and essential accessories. Create refreshing carbonated drinks at home with DrinkMate.',
  KEYWORDS: 'soda maker, carbonated drinks, flavors, accessories, home brewing, DrinkMate',
  AUTHOR: 'DrinkMate Team',
  SITE_NAME: 'DrinkMate',
  LOCALE: 'en_US',
  TYPE: 'website',
} as const
