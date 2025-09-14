// API service for handling all backend requests
import axios from 'axios';
import { getAuthToken } from './auth-context';
import { fallbackCylinders, fallbackFlavors, fallbackProducts } from './fallback-data';

// Re-export getAuthToken for other modules to use from this single import
export { getAuthToken };

// Base API URL - should be set in environment variables
// For local development, use localhost:3000 where the backend server is running
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const FINAL_API_URL = API_URL;

// Debug logging
console.log('API Configuration:', {
  originalAPI_URL: API_URL,
  FINAL_API_URL,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side'
});

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
export const apiCache = new Map();

// Create axios instance with default config
export const api = axios.create({
  baseURL: FINAL_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
  timeout: 15000, // Reduced to 15 seconds for better UX
  withCredentials: true, // Include cookies with cross-origin requests when needed
});

// Add security interceptors
api.interceptors.request.use(
  (config) => {
    // Add CSRF protection if needed
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add additional security headers
    config.headers['X-Content-Type-Options'] = 'nosniff';
    config.headers['X-Frame-Options'] = 'DENY';
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log security errors but not in production to avoid leaking sensitive info
    if (process.env.NODE_ENV !== 'production' && error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        console.warn('Security error:', error.response.status, error.response.data);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to implement retry mechanism with caching
export const retryRequest = async (apiCall: () => Promise<any>, cacheKey?: string, maxRetries = 3, delay = 1000): Promise<any> => {
  // Check cache first if cacheKey is provided
  if (cacheKey && apiCache.has(cacheKey)) {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData.timestamp > Date.now() - CACHE_TTL) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache hit for key: ${cacheKey}`);
      }
      return cachedData.data;
    } else {
      // Cache expired
      apiCache.delete(cacheKey);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache expired for key: ${cacheKey}`);
      }
    }
  }
  
  // Check connectivity before making API calls
  const checkConnectivity = () => {
    const isOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' 
      ? navigator.onLine 
      : true; // Assume online if we can't detect
      
    if (process.env.NODE_ENV === 'development' && !isOnline) {
      console.warn('Device appears to be offline');
    }
    
    return isOnline;
  };
  
  let retries = 0;
  let lastError: any = null;
  
  while (retries < maxRetries) {
    // Check if we're online before attempting a request
    if (!checkConnectivity()) {
      console.warn(`Network offline, waiting before retry attempt ${retries + 1}/${maxRetries}`);
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      retries++;
      continue;
    }
    
    try {
      if (retries > 0 && process.env.NODE_ENV === 'development') {
        console.log(`Retry attempt ${retries}/${maxRetries}`);
      }
      
      const result = await apiCall();
    
      // Store in cache if cacheKey is provided
      if (cacheKey) {
        apiCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        if (process.env.NODE_ENV === 'development') {
          console.log(`Data cached for key: ${cacheKey}`);
        }
      }
    
      return result;
    } catch (error: any) {
      lastError = error;
      retries++;
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(`API call failed (attempt ${retries}/${maxRetries}): ${error.message || 'Network Error'}`);
      }
      
      // Don't retry for certain error codes
      if (error.response) {
        // Don't retry for client errors (except 429 Too Many Requests)
        if (error.response.status >= 400 && 
            error.response.status < 500 && 
            error.response.status !== 429) {
          throw error;
        }
      }
      
      // If we've used all retries, throw the error
      if (retries >= maxRetries) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`All ${maxRetries} retry attempts failed`);
        }
        throw error;
      }
      
      // For network errors, wait longer between retries
      let waitTime = Math.min(15000, Math.floor(delay * Math.pow(1.5, retries - 1)));
      
      if (!error.response) {
        // Network errors get longer waits
        waitTime = Math.min(20000, waitTime * 2);
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Network error detected, waiting ${waitTime}ms before retry`);
        }
      }
      
      // Wait before retrying
      await new Promise<void>(resolve => {
        const timeoutId = setTimeout(resolve, waitTime);
        return timeoutId;
      });
    }
  }
  
  // This should never be reached due to the throw in the loop
  // But just in case, rethrow the last error we caught
  throw lastError || new Error('Retry mechanism failed');
};

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Add response compression detection
    if (process.env.NODE_ENV === 'development') {
      const contentEncoding = response.headers['content-encoding'];
      if (contentEncoding) {
        // Response compressed successfully
      }
    }
    return response;
  },
  (error) => {
    // Convert network timeouts to a friendlier message
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'Server is starting up (this may take 20-30 seconds). Please wait and try again.';
    }
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if needed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        sessionStorage.removeItem('auth-token');
        // Only redirect if not already on auth pages
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register') &&
            !window.location.pathname.includes('/forgot-password')) {
          // Use Next.js router for client-side navigation
          // We can't import useRouter() here, so we'll use a custom event
          // that components can listen for
          const event = new CustomEvent('session-expired');
          window.dispatchEvent(event);
          
          // Don't immediately redirect - let components handle it
          // This prevents hydration errors
        }
      }
    }
    
    // Log all API errors for debugging
    if (process.env.NODE_ENV === 'development') {
      // Safely extract error message with fallbacks
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      console.error('API Error:', errorMessage);
      
      // Add additional diagnostic information for network errors
      if (!error.response) {
        const diagnosticInfo = {
          online: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
          apiURL: api.defaults.baseURL,
          timestamp: new Date().toISOString(),
          errorCode: error.code || 'UNKNOWN',
          errorName: error.name || 'Error',
          request: {
            method: error.config?.method?.toUpperCase() || 'UNKNOWN',
            url: error.config?.url || 'UNKNOWN',
            timeout: error.config?.timeout || 'default',
            headers: error.config?.headers ? 'present' : 'none'
          }
        };
        
        console.warn('Network Error Details:', diagnosticInfo);
        
        // Check if the error is likely due to backend not running
        if (error.code === 'ECONNREFUSED' || error.message?.includes('refused')) {
          console.warn('⚠️ The API server may not be running. Please ensure the backend server is started.');
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error.response?.data || error.message);
      }
      throw error;
    }
  },
  
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      return response.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error.response?.data || error.message);
      }
      throw error;
    }
  },
  
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Forgot password error:', error.response?.data || error.message);
      }
      throw error;
    }
  },
  
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Reset password error:', error.response?.data || error.message);
      }
      throw error;
    }
  },
  
  verifyToken: async () => {
    return retryRequest(async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          // Verifying token
        }
        const response = await api.get('/auth/verify');
        if (process.env.NODE_ENV === 'development') {
          // Token verification successful
        }
        return response.data;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Token verification failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: `${API_URL}/auth/verify`
          });
        }
        throw error;
      }
    }, undefined, 3, 1500); // 3 retries with 1.5s initial delay
  },

  // Profile management
  getProfile: async () => {
    return retryRequest(async () => {
      try {
        const response = await api.get('/auth/profile');
        return response.data;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Get profile error:', error.response?.data || error.message);
        }
        throw error;
      }
    });
  },

  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    username?: string;
    email?: string;
  }) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Update profile error:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Change password error:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  uploadAvatar: async (formData: FormData) => {
    try {
      const response = await api.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Upload avatar error:', error.response?.data || error.message);
      }
      throw error;
    }
  }
};

// Shop API
export const shopAPI = {
  // Products
  getProducts: async (params = {}) => {
    // Create cache key based on params
    const cacheKey = `products-${JSON.stringify(params)}`;
    
    return retryRequest(async () => {
      const response = await api.get('/shop/products', { params });
      return response.data;
    }, cacheKey);
  },
  
  getProduct: async (idOrSlug: string) => {
    const cacheKey = `product-${idOrSlug}`;
    
    return retryRequest(async () => {
      const response = await api.get(`/shop/products/${idOrSlug}`);
      return response.data;
    }, cacheKey);
  },

  // Try ID first, then slug endpoint (helps when the param is ambiguous and avoids repeated page build failures)
  getProductFlexible: async (idOrSlug: string) => {
    const cacheKey = `product-flexible-${idOrSlug}`;
    
    return retryRequest(async () => {
      if (process.env.NODE_ENV === 'development') {
        // Fetching product with flexible method
      }
      // Heuristic: 24 hex chars -> likely a Mongo ObjectId
      const isObjectId = /^[a-f0-9]{24}$/i.test(idOrSlug);
      try {
        if (process.env.NODE_ENV === 'development') {
          // Trying direct product endpoint
        }
        const direct = await api.get(`/shop/products/${idOrSlug}`);
        if (process.env.NODE_ENV === 'development') {
          // Direct product fetch successful
        }
        return direct.data;
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in direct product fetch:', err.response?.status || err.message);
        }
        // If we assumed ObjectId or got a non-404, rethrow
        if (isObjectId && err.response?.status === 404) {
          // Nothing else to try
          throw err;
        }
        if (err.response && err.response.status !== 404) {
          throw err;
        }
        // Fallback to slug endpoint
        try {
          if (process.env.NODE_ENV === 'development') {
            // Trying slug product endpoint
          }
          const bySlug = await api.get(`/shop/products/${idOrSlug}`);
          if (process.env.NODE_ENV === 'development') {
            // Slug product fetch successful
          }
          return bySlug.data;
        } catch (slugErr: any) {
          console.error('Error in slug product fetch:', slugErr.response?.status || slugErr.message);
          throw slugErr;
        }
      }
    });
  },
  
  getProductBySlug: async (slug: string) => {
    const cacheKey = `product-slug-${slug}`;
    
    return retryRequest(async () => {
      try {
        const response = await api.get(`/shop/products/${slug}`);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching product by slug:', error.response?.data || error.message);
        throw error;
      }
    });
  },
  
  // Search products
  searchProducts: async (query: string, filters = {}) => {
    const cacheKey = `search-${query}-${JSON.stringify(filters)}`;
    
    return retryRequest(async () => {
      const response = await api.get('/shop/search', { 
        params: { q: query, ...filters } 
      });
      return response.data;
    }, cacheKey);
  },
  
  // Categories
  getCategories: async () => {
    const cacheKey = 'categories';
    
    return retryRequest(async () => {
      const response = await api.get('/categories');
      return response.data;
    }, cacheKey);
  },
  
  getProductsByCategory: async (slug: string, params = {}) => {
    const cacheKey = `products-category-${slug}-${JSON.stringify(params)}`;
    
    return retryRequest(async () => {
      const response = await api.get(`/shop/categories/${slug}/products`, { params });
      return response.data;
    }, cacheKey);
  },
  
  // Bundles
  getBundles: async (params = {}) => {
    const cacheKey = `bundles-${JSON.stringify(params)}`;
    
    return retryRequest(async () => {
      const response = await api.get('/shop/bundles', { params });
      return response.data;
    }, cacheKey);
  },
  
  getBundle: async (idOrSlug: string) => {
    const cacheKey = `bundle-${idOrSlug}`;
    
    return retryRequest(async () => {
      const response = await api.get(`/shop/bundles/${idOrSlug}`);
      return response.data;
    }, cacheKey);
  },

  // Flexible bundle fetch (ID then slug fallback if backend supports slug route)
  getBundleFlexible: async (idOrSlug: string) => {
    const cacheKey = `bundle-flexible-${idOrSlug}`;
    
    return retryRequest(async () => {
      if (process.env.NODE_ENV === 'development') {
        // Fetching bundle with flexible method
      }
      const isObjectId = /^[a-f0-9]{24}$/i.test(idOrSlug);
      try {
        if (process.env.NODE_ENV === 'development') {
          // Trying direct bundle endpoint
        }
        const direct = await api.get(`/shop/bundles/${idOrSlug}`);
        if (process.env.NODE_ENV === 'development') {
          // Direct bundle fetch successful
        }
        return direct.data;
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in direct bundle fetch:', err.response?.status || err.message);
        }
        if (isObjectId && err.response?.status === 404) {
          throw err;
        }
        if (err.response && err.response.status !== 404) {
          throw err;
        }
        try {
          if (process.env.NODE_ENV === 'development') {
            // Trying slug bundle endpoint
          }
          const bySlug = await api.get(`/shop/bundles/${idOrSlug}`);
          if (process.env.NODE_ENV === 'development') {
            // Slug bundle fetch successful
          }
          return bySlug.data;
        } catch (slugErr: any) {
          console.error('Error in slug bundle fetch:', slugErr.response?.status || slugErr.message);
          throw slugErr;
        }
      }
    });
  },

  // CO2 Cylinders
  getCO2Cylinders: async (params = {}) => {
    const cacheKey = `cylinders-${JSON.stringify(params)}`;
    
    return retryRequest(async () => {
      const response = await api.get('/co2/cylinders', { params });
      return response.data;
    }, cacheKey);
  },

  // Reviews
  addReview: async (productId: string, reviewData: {
    rating: number;
    title?: string;
    comment: string;
  }) => {
    try {
      const token = getAuthToken();
      const response = await api.post(`/shop/products/${productId}/reviews`, reviewData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding review:', error.response?.data || error.message);
      throw error;
    }
  },

  // Admin product management
  createProduct: async (productData: any) => {
    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.post('/shop/products', productData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateProduct: async (id: string, productData: any) => {
    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.put(`/shop/products/${id}`, productData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteProduct: async (id: string) => {
    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.delete(`/shop/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  // Bundle management
  createBundle: async (bundleData: any) => {
    const token = getAuthToken();
    
    const response = await api.post('/shop/bundles', bundleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  updateBundle: async (id: string, bundleData: any) => {
    const token = getAuthToken();
    
    const response = await api.put(`/shop/bundles/${id}`, bundleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  deleteBundle: async (id: string) => {
    const token = getAuthToken();
    
    const response = await api.delete(`/shop/bundles/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Review management
  getProductReviews: async (productId: string) => {
    const cacheKey = `product-reviews-${productId}`;
    
    return retryRequest(async () => {
      const response = await api.get(`/shop/products/${productId}/reviews`);
      return response.data;
    }, cacheKey);
  },

  getBundleReviews: async (bundleId: string) => {
    const cacheKey = `bundle-reviews-${bundleId}`;
    
    return retryRequest(async () => {
      const response = await api.get(`/shop/bundles/${bundleId}/reviews`);
      return response.data;
    }, cacheKey);
  },

  createReview: async (reviewData: any) => {
    const token = getAuthToken();
    const response = await api.post('/shop/reviews', reviewData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateReview: async (reviewId: string, reviewData: any) => {
    const token = getAuthToken();
    const response = await api.put(`/shop/reviews/${reviewId}`, reviewData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteReview: async (reviewId: string) => {
    const token = getAuthToken();
    const response = await api.delete(`/shop/reviews/${reviewId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Category management
  getSubcategories: async () => {
    const response = await api.get('/subcategories');
    return response.data;
  },

  getSubcategoriesByCategory: async (categoryId: string) => {
    const response = await api.get(`/categories/${categoryId}/subcategories`);
    return response.data;
  },

  // Unified method to get all products (shop products, bundles, CO2 cylinders)
  getAllProducts: async (params = {}) => {
    const cacheKey = `all-products-${JSON.stringify(params)}`;

    return retryRequest(async () => {
      try {
        // Fetch all product types in parallel
        const [productsRes, bundlesRes, cylindersRes] = await Promise.all([
          api.get('/shop/products', { params }),
          api.get('/shop/bundles', { params }),
          api.get('/co2/cylinders', { params })
        ]);

        // Combine and standardize the data
        const allProducts = [
          ...(productsRes.data.products || productsRes.data || []).map((product: any) => ({
            ...product,
            productType: 'product' as const
          })),
          ...(bundlesRes.data.bundles || bundlesRes.data || []).map((bundle: any) => ({
            ...bundle,
            productType: 'bundle' as const
          })),
          ...(cylindersRes.data.cylinders || cylindersRes.data || []).map((cylinder: any) => ({
            ...cylinder,
            productType: 'cylinder' as const
          }))
        ];

        return {
          success: true,
          products: allProducts,
          total: allProducts.length
        };
      } catch (error: any) {
        console.error('Error fetching all products:', error.response?.data || error.message);
        throw error;
      }
    }, cacheKey);
  },

  // Unified method to get product by slug (tries all product types)
  getProductBySlugUnified: async (slug: string) => {
    const cacheKey = `product-unified-${slug}`;

    return retryRequest(async () => {
      // Try to fetch from each product type
      const endpoints = [
        { type: 'product', url: `/shop/products/${slug}` },
        { type: 'bundle', url: `/shop/bundles/${slug}` },
        { type: 'cylinder', url: `/co2/cylinders/slug/${slug}` }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint.url);
          if (response.data && (response.data.product || response.data.bundle || response.data.cylinder)) {
            const product = response.data.product || response.data.bundle || response.data.cylinder;
            return {
              success: true,
              product: {
                ...product,
                productType: endpoint.type
              }
            };
          }
        } catch (error) {
          // Continue to next endpoint
          continue;
        }
      }

      // If no product found
      return {
        success: false,
        message: 'Product not found'
      };
    }, cacheKey);
  },
};

// Order API
export const orderAPI = {
  // Create order
  createOrder: async (orderData: any) => {
    const response = await api.post('/checkout/orders', orderData);
    return response.data;
  },
  
  // Get user orders
  getUserOrders: async (params = {}) => {
    const response = await api.get('/checkout/orders', { params });
    return response.data;
  },
  
  // Get single order
  getOrder: async (id: string) => {
    const response = await api.get(`/checkout/orders/${id}`);
    return response.data;
  },
  
  // Cancel order
  cancelOrder: async (id: string, reason: string) => {
    const response = await api.post(`/checkout/orders/${id}/cancel`, { cancelReason: reason });
    return response.data;
  },
  
  // Track order (public)
  trackOrder: async (orderNumber: string, email: string) => {
    const response = await api.get(`/checkout/track/${orderNumber}`, { params: { email } });
    return response.data;
  },
  
  // Get recent orders
  getRecentOrders: async (limit = 3) => {
    const response = await api.get('/checkout/recent-orders', { params: { limit } });
    return response.data;
  },
  
  // Get order history
  getOrderHistory: async (params = {}) => {
    const response = await api.get('/checkout/order-history', { params });
    return response.data;
  },
  
  // Validate coupon
  validateCoupon: async (code: string, cartTotal: number) => {
    const response = await api.post('/checkout/validate-coupon', { code, cartTotal });
    return response.data;
  },

  // Admin order methods
  // Get all orders (admin)
  getAllOrders: async (params = {}) => {
    const token = getAuthToken();
    const response = await api.get('/admin/orders', { 
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  },

  // Update order status (admin)
  updateOrderStatus: async (orderId: string, statusData: any) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await api.put(`/admin/orders/${orderId}/status`, statusData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Update order status error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status',
        error: error.message
      };
    }
  },

  // Delete order (admin)
  deleteOrder: async (orderId: string) => {
    try {
      const token = getAuthToken();
      const response = await api.delete(`/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Delete order error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Blog API
export const blogAPI = {
  // Get all posts
  getPosts: async (params = {}) => {
    const response = await api.get('/blog/posts', { params });
    return response.data;
  },
  
  // Get single post
  getPost: async (idOrSlug: string) => {
    const response = await api.get(`/blog/posts/${idOrSlug}`);
    return response.data;
  },
  
  // Like post
  likePost: async (id: string) => {
    const response = await api.post(`/blog/posts/${id}/like`);
    return response.data;
  },
  
  // Add comment
  addComment: async (id: string, comment: string) => {
    const response = await api.post(`/blog/posts/${id}/comments`, { comment });
    return response.data;
  },
  
  // Create post (admin only)
  createPost: async (postData: any) => {
    const token = getAuthToken();
    
    const response = await api.post('/blog/posts', postData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  // Update post (admin only)
  updatePost: async (id: string, postData: any) => {
    const token = getAuthToken();
    
    const response = await api.put(`/blog/posts/${id}`, postData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  // Delete post (admin only)
  deletePost: async (id: string) => {
    const token = getAuthToken();
    
    const response = await api.delete(`/blog/posts/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  // Approve comment (admin only)
  approveComment: async (postId: string, commentId: string) => {
    const token = getAuthToken();
    
    const response = await api.put(`/blog/posts/${postId}/comments/${commentId}/approve`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  }
};

// Contact API
export const contactAPI = {
  // Submit contact form
  submitContact: async (contactData: any) => {
    const response = await api.post('/contact/submit', contactData);
    return response.data;
  },
  
  // Get all contacts (admin only)
  getAllContacts: async (params = {}) => {
    const response = await api.get('/contact/admin/contacts', { params });
    return response.data;
  },
  
  // Get contact by ID (admin only)
  getContactById: async (id: string) => {
    const response = await api.get(`/contact/admin/contacts/${id}`);
    return response.data;
  },
  
  // Update contact status (admin only)
  updateContactStatus: async (id: string, updateData: any) => {
    const response = await api.put(`/contact/admin/contacts/${id}/status`, updateData);
    return response.data;
  },
  
  // Add contact response (admin only)
  addContactResponse: async (id: string, responseData: any) => {
    const response = await api.post(`/contact/admin/contacts/${id}/response`, responseData);
    return response.data;
  },
  
  // Delete contact (admin only)
  deleteContact: async (id: string) => {
    const response = await api.delete(`/contact/admin/contacts/${id}`);
    return response.data;
  },
  
  // Get contact statistics (admin only)
  getContactStats: async () => {
    const response = await api.get('/contact/admin/stats');
    return response.data;
  }
};

// Chat API
export const chatAPI = {
  // Check business hours
  checkBusinessHours: async () => {
    try {
      const response = await api.get('/chat/business-hours');
      return response.data;
    } catch (error: any) {
      console.error('Business hours check error:', error);
      throw error;
    }
  },

  // Create new chat
  createChat: async (chatData: any) => {
    try {
      const response = await api.post('/chat/create', chatData);
      return response.data;
    } catch (error: any) {
      console.error('Create chat error:', error);
      throw error;
    }
  },

  // Get customer chats
  getCustomerChats: async () => {
    try {
      const response = await api.get('/chat/customer');
      return response.data;
    } catch (error: any) {
      console.error('Get customer chats error:', error);
      throw error;
    }
  },

  // Get admin chats
  getAdminChats: async () => {
    try {
      const response = await api.get('/chat/admin/assigned');
      return response.data;
    } catch (error: any) {
      console.error('Get admin chats error:', error);
      throw error;
    }
  },

  // Get all open chats (admin only)
  getOpenChats: async () => {
    try {
      const response = await api.get('/chat/admin/all');
      return response.data;
    } catch (error: any) {
      console.error('Get open chats error:', error);
      throw error;
    }
  },

  // Get chat by ID
  getChatById: async (chatId: string) => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get chat by ID error:', error);
      throw error;
    }
  },

  // Assign chat to admin
  assignChatToAdmin: async (chatId: string) => {
    try {
      const response = await api.put(`/chat/${chatId}/assign`);
      return response.data;
    } catch (error: any) {
      console.error('Assign chat error:', error);
      throw error;
    }
  },

  // Send message
  sendMessage: async (chatId: string, messageData: any) => {
    try {
      const response = await api.post(`/chat/${chatId}/messages`, messageData);
      return response.data;
    } catch (error: any) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Get chat messages
  getChatMessages: async (chatId: string, limit = 50, skip = 0) => {
    try {
      const response = await api.get(`/chat/${chatId}/messages?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error: any) {
      console.error('Get chat messages error:', error);
      throw error;
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (chatId: string) => {
    try {
      const response = await api.put(`/chat/${chatId}/read`);
      return response.data;
    } catch (error: any) {
      console.error('Mark messages as read error:', error);
      throw error;
    }
  },

  // Close chat
  closeChat: async (chatId: string, resolutionNotes = '') => {
    try {
      const response = await api.put(`/chat/${chatId}/close`, { resolutionNotes });
      return response.data;
    } catch (error: any) {
      console.error('Close chat error:', error);
      throw error;
    }
  },

  // Get chat statistics
  getChatStats: async () => {
    try {
      const response = await api.get('/chat/admin/stats');
      return response.data;
    } catch (error: any) {
      console.error('Get chat stats error:', error);
      throw error;
    }
  },

  // Rate chat
  rateChat: async (chatId: string, score: number, feedback: string = '') => {
    try {
      const response = await api.post(`/chat/${chatId}/rate`, { score, feedback });
      return response.data;
    } catch (error: any) {
      console.error('Rate chat error:', error);
      throw error;
    }
  }
};

// Testimonial API
export const testimonialAPI = {
  // Get testimonials
  getTestimonials: async (params = {}) => {
    const response = await api.get('/testimonials/testimonials', { params });
    return response.data;
  },
  
  // Submit testimonial (requires auth)
  submitTestimonial: async (testimonialData: any) => {
    const response = await api.post('/testimonials/submit', testimonialData);
    return response.data;
  },
  
  // Create testimonial (admin only)
  createTestimonial: async (testimonialData: any) => {
    const token = getAuthToken();
    
    const response = await api.post('/testimonials/testimonials', testimonialData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  // Update testimonial (admin only)
  updateTestimonial: async (id: string, testimonialData: any) => {
    const token = getAuthToken();
    
    const response = await api.put(`/testimonials/testimonials/${id}`, testimonialData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  // Delete testimonial (admin only)
  deleteTestimonial: async (id: string) => {
    const token = getAuthToken();
    
    const response = await api.delete(`/testimonials/testimonials/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  // Approve testimonial (admin only)
  approveTestimonial: async (id: string) => {
    const token = getAuthToken();
    
    const response = await api.put(`/testimonials/testimonials/${id}/approve`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  // Users
  getAllUsers: async () => {
    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.get('/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  deleteUser: async (id: string) => {
    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.delete(`/admin/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  // Image management
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.post('/admin/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  deleteImage: async (filename: string) => {
    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.delete(`/admin/delete-image/${filename}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Bundle management
  createBundle: async (bundleData: any) => {
    const token = getAuthToken();
    
    const response = await api.post('/admin/bundles', bundleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  updateBundle: async (id: string, bundleData: any) => {
    const token = getAuthToken();
    
    const response = await api.put(`/admin/bundles/${id}`, bundleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  deleteBundle: async (id: string) => {
    const token = getAuthToken();
    
    const response = await api.delete(`/admin/bundles/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Review management
  getReviews: async () => {
    const token = getAuthToken();
    const response = await api.get('/admin/reviews', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateReviewStatus: async (reviewId: string, status: string) => {
    const token = getAuthToken();
    const response = await api.put(`/admin/reviews/${reviewId}/status`, { status }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteReview: async (reviewId: string) => {
    const token = getAuthToken();
    const response = await api.delete(`/admin/reviews/${reviewId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  addAdminResponse: async (reviewId: string, response: string) => {
    const token = getAuthToken();
    const apiResponse = await api.post(`/admin/reviews/${reviewId}/response`, { response }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return apiResponse.data;
  },

  // Category management
  getCategories: async () => {
    const token = getAuthToken();
    const response = await api.get('/admin/categories', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  createCategory: async (categoryData: any) => {
    const token = getAuthToken();
    const response = await api.post('/admin/categories', categoryData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateCategory: async (categoryId: string, categoryData: any) => {
    const token = getAuthToken();
    const response = await api.put(`/admin/categories/${categoryId}`, categoryData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteCategory: async (categoryId: string, force: boolean = false) => {
    const token = getAuthToken();
    const response = await api.delete(`/admin/categories/${categoryId}${force ? '?force=true' : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Create default categories (development helper)
  createDefaultCategories: async (forceReset: boolean = false) => {
    const token = getAuthToken();
    const url = `/admin/create-default-categories${forceReset ? '?forceReset=true' : ''}`;
    
    const response = await api.post(url, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  toggleCategoryStatus: async (categoryId: string) => {
    const token = getAuthToken();
    const response = await api.patch(`/admin/categories/${categoryId}/toggle`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Subcategory management
  getSubcategories: async () => {
    const token = getAuthToken();
    const response = await api.get('/admin/subcategories', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  createSubcategory: async (subcategoryData: any) => {
    const token = getAuthToken();
    const response = await api.post('/admin/subcategories', subcategoryData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateSubcategory: async (subcategoryId: string, subcategoryData: any) => {
    const token = getAuthToken();
    const response = await api.put(`/admin/subcategories/${subcategoryId}`, subcategoryData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteSubcategory: async (subcategoryId: string) => {
    const token = getAuthToken();
    const response = await api.delete(`/admin/subcategories/${subcategoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  toggleSubcategoryStatus: async (subcategoryId: string) => {
    const token = getAuthToken();
    const response = await api.patch(`/admin/subcategories/${subcategoryId}/toggle`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Utility functions
  updateItemCounts: async () => {
    const token = getAuthToken();
    const response = await api.post('/admin/update-item-counts', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  }
};

// Refill API
export const refillAPI = {
  createRefillOrder: async (orderData: any) => {
    try {
      const response = await api.post('/refill/orders', orderData);
      return response.data;
    } catch (error: any) {
      console.error('Create refill order error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getUserRefillOrders: async (userId: string, params?: any) => {
    try {
      const response = await api.get(`/refill/orders/user/${userId}`, { params });
      return response.data;
      } catch (error: any) {
      console.error('Get user refill orders error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getAllRefillOrders: async (params?: any) => {
    try {
      const response = await api.get('/refill/orders', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get all refill orders error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getRefillOrderById: async (id: string) => {
    try {
      const response = await api.get(`/refill/orders/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Get refill order error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  updateRefillOrderStatus: async (id: string, statusData: any) => {
    try {
      const response = await api.patch(`/refill/orders/${id}/status`, statusData);
      return response.data;
    } catch (error: any) {
      console.error('Update refill order status error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  schedulePickup: async (id: string, pickupData: any) => {
    try {
      const response = await api.patch(`/refill/orders/${id}/pickup`, pickupData);
      return response.data;
    } catch (error: any) {
      console.error('Schedule pickup error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  scheduleDelivery: async (id: string, deliveryData: any) => {
    try {
      const response = await api.patch(`/refill/orders/${id}/delivery`, deliveryData);
      return response.data;
    } catch (error: any) {
      console.error('Schedule delivery error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  cancelRefillOrder: async (id: string, cancellationData: any) => {
    try {
      const response = await api.patch(`/refill/orders/${id}/cancel`, cancellationData);
      return response.data;
    } catch (error: any) {
      console.error('Cancel refill order error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getRefillDashboardStats: async () => {
    try {
      const response = await api.get('/refill/dashboard/stats');
      return response.data;
    } catch (error: any) {
      console.error('Get refill dashboard stats error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// CO2 Cylinders API
export const co2API = {
  // Get all CO2 cylinders
  getCylinders: async () => {
    // Clear cache to get fresh data
    const cacheKey = 'co2-cylinders';
    apiCache.delete(cacheKey);
    
    try {
      return await retryRequest(async () => {
        // Get token for admin requests
        const token = getAuthToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Debug logging
        console.log('CO2API Debug:', {
          baseURL: api.defaults.baseURL,
          endpoint: '/co2/cylinders',
          fullURL: `${api.defaults.baseURL}/co2/cylinders`,
          hasToken: !!token,
          timestamp: new Date().toISOString()
        });
        
        // Add cache-busting parameter to ensure fresh data
        const response = await api.get('/co2/cylinders', { 
          headers,
          params: { _t: Date.now() } // Cache busting
        });
        
        console.log('CO2API Response:', response.data);
        return response.data;
      }, cacheKey);
    } catch (error) {
      console.warn('Failed to fetch cylinders from API, using fallback data', error);
      // Return fallback data in the same format as the API would
      return {
        success: true,
        cylinders: fallbackCylinders,
        message: 'Using fallback data due to network error'
      };
    }
  },
  
  // Get a single CO2 cylinder by slug or ID
  getCylinder: async (slugOrId: string) => {
    if (!slugOrId) {
      console.warn('getCylinder called with empty slugOrId');
      return { success: false, message: 'No slug or ID provided' };
    }
    
    const cacheKey = `co2-cylinder-${slugOrId}`;
    
    return retryRequest(async () => {
      // Try to fetch by slug first
      try {
        console.log(`Fetching cylinder by slug: ${slugOrId}`);
        const response = await api.get(`/co2/cylinders/slug/${slugOrId}`);
        console.log('Slug response:', response.data);
        return response.data;
      } catch (error) {
        // If slug fails, try by ID as fallback
        console.log(`Trying to fetch cylinder by ID instead: ${slugOrId}`);
        const response = await api.get(`/co2/cylinders/${slugOrId}`);
        console.log('ID response:', response.data);
        return response.data;
      }
    }, cacheKey);
  },
  
  // Create a new CO2 cylinder
  createCylinder: async (cylinderData: any) => {
    return retryRequest(async () => {
      console.log('API createCylinder called with:', cylinderData);
      const response = await api.post('/co2/cylinders', cylinderData);
      console.log('API createCylinder response:', response.data);
      return response.data;
    });
  },
  
  // Update a CO2 cylinder
  updateCylinder: async (id: string, cylinderData: any) => {
    return retryRequest(async () => {
      console.log('API updateCylinder called with:', { id, cylinderData });
      const response = await api.put(`/co2/cylinders/${id}`, cylinderData);
      console.log('API updateCylinder response:', response.data);
      return response.data;
    });
  },
  
  // Delete a CO2 cylinder
  deleteCylinder: async (id: string) => {
    return retryRequest(async () => {
      console.log('API deleteCylinder called with ID:', id);
      const response = await api.delete(`/co2/cylinders/${id}`);
      console.log('API deleteCylinder response:', response.data);
      return response.data;
    });
  }
};

// Export the API instance as default
export default api;

// CO2 Orders API
export const co2OrdersAPI = {
  // Get all CO2 orders
  getOrders: async () => {
    return retryRequest(async () => {
      const response = await api.get('/co2/orders');
      return response.data;
    });
  },
  
  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    return retryRequest(async () => {
      const response = await api.put(`/co2/orders/${orderId}/status`, { status });
      return response.data;
    });
  },
  
  // Update pickup details
  updatePickupDetails: async (orderId: string, pickupData: any) => {
    return retryRequest(async () => {
      const response = await api.put(`/co2/orders/${orderId}/pickup`, pickupData);
      return response.data;
    });
  },
  
  // Update delivery details
  updateDeliveryDetails: async (orderId: string, deliveryData: any) => {
    return retryRequest(async () => {
      const response = await api.put(`/co2/orders/${orderId}/delivery`, deliveryData);
      return response.data;
    });
  }
};
