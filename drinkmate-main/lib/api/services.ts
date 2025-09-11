import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'
import { 
  Product, 
  Bundle, 
  CO2Cylinder, 
  Category, 
  User, 
  Order, 
  Review, 
  ProductFilters,
  LoginForm,
  RegisterForm,
  ContactForm,
  Address
} from '@/lib/types'

// Products API
export const productsAPI = {
  // Get all products with filters
  getProducts: async (filters?: ProductFilters) => {
    return apiClient.get<{ products: Product[]; total: number }>(API_ENDPOINTS.PRODUCTS, {
      params: filters
    })
  },

  // Get single product by ID
  getProduct: async (id: string) => {
    return apiClient.get<{ product: Product }>(API_ENDPOINTS.PRODUCT_BY_ID(id))
  },

  // Get products by category
  getProductsByCategory: async (category: string, filters?: ProductFilters) => {
    return apiClient.get<{ products: Product[]; total: number }>(
      API_ENDPOINTS.PRODUCTS_BY_CATEGORY(category),
      { params: filters }
    )
  },

  // Search products
  searchProducts: async (query: string, filters?: ProductFilters) => {
    return apiClient.get<{ products: Product[]; total: number }>(API_ENDPOINTS.SEARCH_PRODUCTS, {
      params: { q: query, ...filters }
    })
  },

  // Get product reviews
  getProductReviews: async (productId: string) => {
    return apiClient.get<{ reviews: Review[] }>(API_ENDPOINTS.PRODUCT_REVIEWS(productId))
  },

  // Add product review
  addReview: async (productId: string, review: Omit<Review, '_id' | 'productId' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    return apiClient.post<{ review: Review }>(API_ENDPOINTS.REVIEWS, {
      productId,
      ...review
    })
  }
}

// Bundles API
export const bundlesAPI = {
  // Get all bundles
  getBundles: async (filters?: ProductFilters) => {
    return apiClient.get<{ bundles: Bundle[]; total: number }>(API_ENDPOINTS.PRODUCTS, {
      params: { type: 'bundle', ...filters }
    })
  },

  // Get single bundle by ID
  getBundle: async (id: string) => {
    return apiClient.get<{ bundle: Bundle }>(API_ENDPOINTS.PRODUCT_BY_ID(id))
  }
}

// CO2 Cylinders API
export const cylindersAPI = {
  // Get all CO2 cylinders
  getCylinders: async (filters?: ProductFilters) => {
    return apiClient.get<{ cylinders: CO2Cylinder[]; total: number }>(API_ENDPOINTS.PRODUCTS, {
      params: { type: 'cylinder', ...filters }
    })
  },

  // Get single cylinder by ID
  getCylinder: async (id: string) => {
    return apiClient.get<{ cylinder: CO2Cylinder }>(API_ENDPOINTS.PRODUCT_BY_ID(id))
  }
}

// Categories API
export const categoriesAPI = {
  // Get all categories
  getCategories: async () => {
    return apiClient.get<{ categories: Category[] }>(API_ENDPOINTS.CATEGORIES)
  },

  // Get single category by ID
  getCategory: async (id: string) => {
    return apiClient.get<{ category: Category }>(API_ENDPOINTS.CATEGORY_BY_ID(id))
  }
}

// Authentication API
export const authAPI = {
  // Login
  login: async (credentials: LoginForm) => {
    return apiClient.post<{ user: User; token: string }>(API_ENDPOINTS.LOGIN, credentials)
  },

  // Register
  register: async (userData: RegisterForm) => {
    return apiClient.post<{ user: User; token: string }>(API_ENDPOINTS.REGISTER, userData)
  },

  // Logout
  logout: async () => {
    return apiClient.post(API_ENDPOINTS.LOGOUT)
  },

  // Refresh token
  refreshToken: async () => {
    return apiClient.post<{ token: string }>(API_ENDPOINTS.REFRESH)
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    return apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email })
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    return apiClient.post(API_ENDPOINTS.RESET_PASSWORD, { token, password })
  }
}

// Cart API
export const cartAPI = {
  // Get cart
  getCart: async () => {
    return apiClient.get<{ items: any[] }>(API_ENDPOINTS.CART)
  },

  // Add to cart
  addToCart: async (item: any) => {
    return apiClient.post(API_ENDPOINTS.ADD_TO_CART, item)
  },

  // Remove from cart
  removeFromCart: async (productId: string) => {
    return apiClient.delete(API_ENDPOINTS.REMOVE_FROM_CART, {
      params: { productId }
    })
  },

  // Update cart item
  updateCartItem: async (productId: string, quantity: number) => {
    return apiClient.put(API_ENDPOINTS.UPDATE_CART, { productId, quantity })
  },

  // Clear cart
  clearCart: async () => {
    return apiClient.delete(API_ENDPOINTS.CLEAR_CART)
  }
}

// Orders API
export const ordersAPI = {
  // Get user orders
  getOrders: async () => {
    return apiClient.get<{ orders: Order[] }>(API_ENDPOINTS.ORDERS)
  },

  // Get single order
  getOrder: async (id: string) => {
    return apiClient.get<{ order: Order }>(API_ENDPOINTS.ORDER_BY_ID(id))
  },

  // Create order
  createOrder: async (orderData: {
    items: any[]
    shippingAddress: Address
    billingAddress?: Address
    paymentMethod: string
  }) => {
    return apiClient.post<{ order: Order }>(API_ENDPOINTS.CREATE_ORDER, orderData)
  },

  // Track order
  trackOrder: async (trackingNumber: string) => {
    return apiClient.get<{ order: Order }>(API_ENDPOINTS.TRACK_ORDER, {
      params: { trackingNumber }
    })
  }
}

// Payments API
export const paymentsAPI = {
  // Urways payment
  processUrwaysPayment: async (paymentData: any) => {
    return apiClient.post(API_ENDPOINTS.PAYMENTS_URWAYS, paymentData)
  },

  // Tap payment
  processTapPayment: async (paymentData: any) => {
    return apiClient.post(API_ENDPOINTS.PAYMENTS_TAP, paymentData)
  },

  // Verify payment
  verifyPayment: async (paymentId: string) => {
    return apiClient.post(API_ENDPOINTS.PAYMENT_VERIFY, { paymentId })
  }
}

// Contact API
export const contactAPI = {
  // Send contact message
  sendMessage: async (message: ContactForm) => {
    return apiClient.post(API_ENDPOINTS.CONTACT, message)
  }
}

// Admin API
export const adminAPI = {
  // Products
  getProducts: async (filters?: ProductFilters) => {
    return apiClient.get<{ products: Product[]; total: number }>(API_ENDPOINTS.ADMIN_PRODUCTS, {
      params: filters
    })
  },

  createProduct: async (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    return apiClient.post<{ product: Product }>(API_ENDPOINTS.ADMIN_PRODUCTS, product)
  },

  updateProduct: async (id: string, product: Partial<Product>) => {
    return apiClient.put<{ product: Product }>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`, product)
  },

  deleteProduct: async (id: string) => {
    return apiClient.delete(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`)
  },

  // Orders
  getOrders: async (filters?: any) => {
    return apiClient.get<{ orders: Order[]; total: number }>(API_ENDPOINTS.ADMIN_ORDERS, {
      params: filters
    })
  },

  updateOrderStatus: async (id: string, status: string) => {
    return apiClient.patch<{ order: Order }>(`${API_ENDPOINTS.ADMIN_ORDERS}/${id}`, { status })
  },

  // Users
  getUsers: async (filters?: any) => {
    return apiClient.get<{ users: User[]; total: number }>(API_ENDPOINTS.ADMIN_USERS, {
      params: filters
    })
  },

  // Categories
  getCategories: async () => {
    return apiClient.get<{ categories: Category[] }>(API_ENDPOINTS.ADMIN_CATEGORIES)
  },

  createCategory: async (category: Omit<Category, '_id'>) => {
    return apiClient.post<{ category: Category }>(API_ENDPOINTS.ADMIN_CATEGORIES, category)
  },

  updateCategory: async (id: string, category: Partial<Category>) => {
    return apiClient.put<{ category: Category }>(`${API_ENDPOINTS.ADMIN_CATEGORIES}/${id}`, category)
  },

  deleteCategory: async (id: string) => {
    return apiClient.delete(`${API_ENDPOINTS.ADMIN_CATEGORIES}/${id}`)
  },

  // Stats
  getStats: async () => {
    return apiClient.get<{
      totalProducts: number
      totalOrders: number
      totalUsers: number
      totalRevenue: number
      recentOrders: Order[]
      topProducts: Product[]
    }>(API_ENDPOINTS.ADMIN_STATS)
  }
}

// Export all APIs
export const api = {
  products: productsAPI,
  bundles: bundlesAPI,
  cylinders: cylindersAPI,
  categories: categoriesAPI,
  auth: authAPI,
  cart: cartAPI,
  orders: ordersAPI,
  payments: paymentsAPI,
  contact: contactAPI,
  admin: adminAPI,
}
