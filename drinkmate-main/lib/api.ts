// API service for handling all backend requests
import axios from 'axios';
import { getAuthToken } from './contexts/auth-context';
import { fallbackCylinders, fallbackFlavors, fallbackProducts } from './fallback-data';
import { withErrorHandler, createSuccessResponse, createErrorResponse } from './error-handler';
import { checkAdminRateLimit } from './api/protected-api';
import { API_CONFIG } from './constants';

// Re-export getAuthToken for other modules to use from this single import
export { getAuthToken };

// Base API URL - should be set in environment variables
// For local development, use localhost:3000 where the backend server is running
// API Configuration - Use environment variable or fallback
const FINAL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';


// Cache configuration - Reduced for better synchronization
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes in milliseconds (reduced for better sync)
export const apiCache = new Map();

// Debounce map to prevent rapid API calls
const debounceMap = new Map();

// Debounced API call function
export const debouncedApiCall = (key: string, apiCall: () => Promise<any>, delay: number = 1000) => {
  return new Promise((resolve, reject) => {
    // Clear existing timeout for this key
    if (debounceMap.has(key)) {
      clearTimeout(debounceMap.get(key));
    }
    
    // Set new timeout
    const timeoutId = setTimeout(async () => {
      try {
        const result = await apiCall();
        debounceMap.delete(key);
        resolve(result);
      } catch (error) {
        debounceMap.delete(key);
        reject(error);
      }
    }, delay);
    
    debounceMap.set(key, timeoutId);
  });
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: FINAL_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
  timeout: 45000, // Increased to 45 seconds to handle server startup time
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
        console.warn(`Security error: ${error.response.status} - ${error.response.statusText}`);
      }
    }
    
    return Promise.reject(error);
  }
);

// Cache invalidation helper
export const invalidateCache = (pattern?: string) => {
  if (pattern) {
    // Invalidate cache entries matching pattern
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
        if (process.env.NODE_ENV === 'development') {
          console.log(`Cache invalidated: ${key}`);
        }
      }
    }
  } else {
    // Clear all cache
    apiCache.clear();
    if (process.env.NODE_ENV === 'development') {
      console.log('All cache cleared');
    }
  }
};

// Helper function to implement retry mechanism with caching
export const retryRequest = async (apiCall: () => Promise<any>, cacheKey?: string, maxRetries = API_CONFIG.RETRY_ATTEMPTS, delay = API_CONFIG.RETRY_DELAY): Promise<any> => {
  // Check cache first if cacheKey is provided
  if (cacheKey && apiCache.has(cacheKey)) {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData.timestamp > Date.now() - CACHE_TTL) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache hit: ${cacheKey}`);
      }
      return cachedData.data;
    } else {
      // Cache expired
      apiCache.delete(cacheKey);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache expired: ${cacheKey}`);
      }
    }
  }
  
  // Check connectivity before making API calls
  const checkConnectivity = () => {
    const isOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' 
      ? navigator.onLine 
      : true; // Assume online if we can't detect
      
    if (process.env.NODE_ENV === 'development' && !isOnline) {
      console.warn('Device is offline, API calls may fail');
    }
    
    return isOnline;
  };
  
  let retries = 0;
  let lastError: any = null;
  
  while (retries < maxRetries) {
    // Check if we're online before attempting a request
    if (!checkConnectivity()) {
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      retries++;
      continue;
    }
    
    try {
      if (retries > 0 && process.env.NODE_ENV === 'development') {
        console.log(`Retrying API call (attempt ${retries + 1}/${maxRetries})`);
      }
      
      const result = await apiCall();
    
      // Store in cache if cacheKey is provided
      if (cacheKey) {
        apiCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
    
      return result;
    } catch (error: any) {
      lastError = error;
      retries++;
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`API call failed (attempt ${retries}/${maxRetries}):`, error.message);
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
          console.error(`Max retries (${maxRetries}) exceeded, giving up`);
        }
        throw error;
      }
      
      // For network errors, wait longer between retries
      let waitTime = Math.min(15000, Math.floor(delay * Math.pow(1.5, retries - 1)));
      
      if (!error.response) {
        // Network errors get longer waits
        waitTime = Math.min(20000, waitTime * 2);
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Network error detected, increasing wait time to ${waitTime}ms`);
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

// Note: Auth token interceptor is already added above (lines 73-88)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Add response compression detection
    if (process.env.NODE_ENV === 'development') {
      const contentEncoding = response.headers['content-encoding'];
      if (contentEncoding) {
        console.log(`Response compressed with ${contentEncoding}`);
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
        
        
        // Check if the error is likely due to backend not running
        if (error.code === 'ECONNREFUSED' || error.message?.includes('refused')) {
          console.error('Backend server appears to be down:', diagnosticInfo);
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
        console.error('Login failed:', error.message);
      }
      throw error;
    }
  },
  
  register: async (fullName: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { fullName, email, password });
      return response.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration failed:', error.message);
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
  getBundles: async (params = {}, forceRefresh = false) => {
    const cacheKey = `bundles-${JSON.stringify(params)}`;
    
    // Clear cache if force refresh is requested
    if (forceRefresh) {
      invalidateCache('bundles');
    }
    
    return retryRequest(async () => {
      const response = await api.get('/shop/bundles', { 
        params: forceRefresh ? { ...params, _t: Date.now() } : params 
      });
      return response.data;
    }, cacheKey);
  },
  
  getBundle: async (idOrSlug: string) => {
    const cacheKey = `bundle-${idOrSlug}`;
    
    return retryRequest(async () => {
      try {
        const response = await api.get(`/shop/bundles/${idOrSlug}`);
        return response.data;
      } catch (error: any) {
        // Handle 404 errors gracefully
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Bundle not found',
            bundle: null
          };
        }
        throw error;
      }
    }, cacheKey);
  },

  // Flexible bundle fetch (ID then slug fallback if backend supports slug route)
  getBundleFlexible: async (idOrSlug: string, bypassCache = false) => {
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
          throw slugErr;
        }
      }
    }, bypassCache ? undefined : cacheKey);
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

// Cart API
export const cartAPI = {
  // Get user's cart from database
  getCart: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required',
          cart: null
        };
      }

      const response = await api.get('/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting cart from API:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get cart',
        cart: null
      };
    }
  },

  // Add item to cart (saves to database)
  addToCart: async (productId: string, quantity: number = 1, variants: any[] = []) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await api.post('/cart/add', 
        { productId, quantity, variants },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add item to cart'
      };
    }
  },

  // Update item quantity in cart
  updateCartItem: async (productId: string, quantity: number) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await api.put('/cart/update',
        { productId, quantity },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cart item'
      };
    }
  },

  // Remove item from cart
  removeFromCart: async (productId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await api.delete(`/cart/remove/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove item from cart'
      };
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await api.delete('/cart/clear', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart'
      };
    }
  },

  // Sync localStorage cart with database (merge)
  syncCart: async (items: any[]) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required',
          cart: null
        };
      }

      const response = await api.post('/cart/sync',
        { items },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error syncing cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to sync cart',
        cart: null
      };
    }
  },
};

// Order API
export const orderAPI = {
  // Create order (authenticated users)
  createOrder: async (orderData: any) => {
    const response = await api.post('/checkout/orders', orderData);
    return response.data;
  },
  
  // Create guest order (no authentication required)
  createGuestOrder: async (orderData: any) => {
    const response = await api.post('/checkout/guest-orders', orderData);
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

  // Get all posts for admin (includes unpublished and comments)
  getPostsAdmin: async (params = {}) => {
    const token = getAuthToken();
    const response = await api.get('/blog/admin/posts', { 
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
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
  
  // Add comment (authenticated)
  addComment: async (id: string, comment: string) => {
    const response = await api.post(`/blog/posts/${id}/comments`, { comment });
    return response.data;
  },
  
  // Add public comment (no authentication required)
  addPublicComment: async (id: string, commentData: { comment: string; username: string; email: string }) => {
    const response = await api.post(`/blog/posts/${id}/comments/public`, commentData);
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
  },
  
  // Delete comment (admin only)
  deleteComment: async (postId: string, commentId: string) => {
    const token = getAuthToken();
    
    const response = await api.delete(`/blog/posts/${postId}/comments/${commentId}`, {
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
  },
  
  // Get user's contact messages (customer)
  getUserContacts: async (email: string) => {
    const response = await api.get(`/contact/user/contacts?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  // Bulk actions (admin only)
  bulkUpdateContacts: async (contactIds: string[], updates: any) => {
    const response = await api.put('/contact/admin/contacts/bulk', { contactIds, updates });
    return response.data;
  },

  bulkDeleteContacts: async (contactIds: string[]) => {
    const response = await api.delete('/contact/admin/contacts/bulk', { data: { contactIds } });
    return response.data;
  },

  // Export contacts (admin only)
  exportContacts: async (filters: any = {}) => {
    const response = await api.get('/contact/admin/contacts/export', { params: filters });
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
      throw error;
    }
  },

  // Create new chat
  createChat: async (chatData: any) => {
    try {
      const response = await api.post('/chat/create', chatData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Get customer chats
  getCustomerChats: async () => {
    try {
      const response = await api.get('/chat/customer');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Get admin chats
  getAdminChats: async () => {
    try {
      const response = await api.get('/chat/admin/assigned');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Get all open chats (admin only)
  getOpenChats: async () => {
    try {
      const response = await api.get('/chat/admin/all');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Get chat by ID
  getChatById: async (chatId: string) => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Assign chat to admin
  assignChatToAdmin: async (chatId: string) => {
    try {
      const response = await api.put(`/chat/${chatId}/assign`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Send message
  sendMessage: async (chatId: string, messageData: any) => {
    try {
      const response = await api.post(`/chat/${chatId}/messages`, messageData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Get chat messages
  getChatMessages: async (chatId: string, limit = 50, skip = 0) => {
    try {
      const response = await api.get(`/chat/${chatId}/messages?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (chatId: string) => {
    try {
      const response = await api.put(`/chat/${chatId}/read`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Close chat
  closeChat: async (chatId: string, resolutionNotes = '') => {
    try {
      const response = await api.put(`/chat/${chatId}/close`, { resolutionNotes });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Get chat statistics
  getChatStats: async () => {
    try {
      const response = await api.get('/chat/admin/stats');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Rate chat
  rateChat: async (chatId: string, score: number, feedback: string = '') => {
    try {
      const response = await api.post(`/chat/${chatId}/rate`, { score, feedback });
      return response.data;
    } catch (error: any) {
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

// Admin API - Standardized with automatic token handling
export const adminAPI = {
  // Products
  getProducts: async (filters?: any) => {
    try {
      const response = await api.get('/admin/products', {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      console.error('Admin API - getProducts error:', error);
      return createErrorResponse(new Error('Failed to fetch products'));
    }
  },

  getProduct: async (id: string) => {
    try {
      const response = await api.get(`/admin/products/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch product',
        product: null
      };
    }
  },

  createProduct: async (productData: any) => {
    try {
      // Check rate limiting for product management
      const userId = getAuthToken() ? 'admin' : 'anonymous';
      if (!checkAdminRateLimit(userId, 'product_management')) {
        return {
          success: false,
          message: 'Rate limit exceeded. Please try again later.',
          product: null
        };
      }

      console.log('Creating product with data:', productData);
      console.log('Auth token present:', !!getAuthToken());
      
      const response = await api.post('/admin/products', productData);
      console.log('API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create product',
        product: null
      };
    }
  },

  updateProduct: async (id: string, productData: any) => {
    try {
      console.log('Updating product with ID:', id);
      console.log('Update data:', productData);
      console.log('Auth token present:', !!getAuthToken());
      
      const response = await api.put(`/admin/products/${id}`, productData);
      console.log('Update API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update API error:', error);
      console.error('Update error response:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update product',
        product: null
      };
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete product',
        deleted: false
      };
    }
  },

  // Orders
  getOrders: async (filters?: any) => {
    try {
      const response = await api.get('/admin/orders', {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders',
        orders: []
      };
    }
  },

  getOrder: async (id: string) => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order',
        order: null
      };
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status',
        order: null
      };
    }
  },

  // Users
  getUsers: async (filters?: any) => {
    try {
      const response = await api.get('/admin/users', {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch users',
        users: []
      };
    }
  },

  getUser: async (id: string) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user',
        user: null
      };
    }
  },

  updateUser: async (id: string, userData: any) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user',
        user: null
      };
    }
  },

  // Bundles
  getBundles: async (filters?: any) => {
    try {
      const response = await api.get('/admin/bundles', {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch bundles',
        bundles: []
      };
    }
  },

  getBundle: async (id: string) => {
    const token = getAuthToken();
    const response = await api.get(`/admin/bundles/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  createBundle: async (bundleData: any) => {
    const token = getAuthToken();
    const response = await api.post('/admin/bundles', bundleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    // Invalidate bundle cache after creation
    invalidateCache('bundles');
    return response.data;
  },

  updateBundle: async (id: string, bundleData: any) => {
    const token = getAuthToken();
    const response = await api.put(`/admin/bundles/${id}`, bundleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    // Invalidate bundle cache after update
    invalidateCache('bundles');
    invalidateCache(`bundle-${id}`);
    return response.data;
  },

  deleteBundle: async (id: string) => {
    const token = getAuthToken();
    const response = await api.delete(`/admin/bundles/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    // Invalidate bundle cache after deletion
    invalidateCache('bundles');
    invalidateCache(`bundle-${id}`);
    return response.data;
  },

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

  createUser: async (userData: any) => {
    // Check rate limiting for user management
    const userId = getAuthToken() ? 'admin' : 'anonymous';
    if (!checkAdminRateLimit(userId, 'user_management')) {
      return {
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        user: null
      };
    }

    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.post('/admin/users', userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },


  updateUserStatus: async (id: string, status: string) => {
    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.patch(`/admin/users/${id}/status`, { status }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  toggleUserRole: async (id: string, isAdmin: boolean) => {
    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.patch(`/admin/users/${id}/role`, { isAdmin }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  bulkUpdateUsers: async (userIds: string[], updates: any) => {
    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.patch('/admin/users/bulk', { userIds, updates }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  bulkDeleteUsers: async (userIds: string[]) => {
    // Get auth token using the correct key
    const token = getAuthToken();
    
    const response = await api.delete('/admin/users/bulk', {
      data: { userIds },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  // Image management
  uploadImage: async (file: File, retryCount = 0): Promise<{
    success: boolean;
    message: string;
    imageUrl?: string;
    publicId?: string;
    filename?: string;
    error?: string;
  }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Get auth token using the correct key
    const token = getAuthToken();
    
    try {
      const response = await api.post('/admin/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 60000, // 60 seconds for image uploads specifically
      });
      return response.data;
    } catch (error: any) {
      // Check if it's a server startup error and retry
      if (error.message?.includes('Server is starting up') && retryCount < 3) {
        console.log(`Server starting up, retrying upload in ${(retryCount + 1) * 10} seconds... (attempt ${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 10000)); // Wait 10, 20, 30 seconds
        return adminAPI.uploadImage(file, retryCount + 1);
      }
      throw error;
    }
  },
  
  deleteImage: async (publicId: string) => {
    try {
      // Get auth token using the correct key
      const token = getAuthToken();
      console.log('Deleting image with publicId:', publicId);
      console.log('PublicId type:', typeof publicId);
      console.log('PublicId length:', publicId.length);
      console.log('Auth token present:', !!token);
      
      // URL encode the publicId to handle forward slashes
      const encodedPublicId = encodeURIComponent(publicId);
      console.log('Encoded publicId:', encodedPublicId);
      
      const response = await api.delete(`/admin/delete-image/${encodedPublicId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Delete image response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Delete image error:', error);
      console.error('Delete image error response:', error.response?.data);
      throw error; // Re-throw to let the component handle it
    }
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

  bulkImportReviews: async (formData: FormData) => {
    const token = getAuthToken();
    const response = await api.post('/admin/reviews/bulk-import', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generateReviewReport: async (type: string) => {
    const token = getAuthToken();
    const response = await api.post('/admin/reviews/reports', { type }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateModerationSettings: async (settings: any) => {
    const token = getAuthToken();
    const response = await api.put('/admin/reviews/moderation-settings', settings, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
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

  // Analytics
  getAnalytics: async (timeRange: string = '30days') => {
    try {
      const token = getAuthToken();
      const response = await api.get(`/admin/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch analytics',
        analytics: null
      };
    }
  },

  getRevenueData: async (timeRange: string = '30days') => {
    try {
      const token = getAuthToken();
      const response = await api.get(`/admin/analytics/revenue?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch revenue data',
        data: null
      };
    }
  },

  getOrdersData: async (timeRange: string = '30days') => {
    try {
      const token = getAuthToken();
      const response = await api.get(`/admin/analytics/orders?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders data',
        data: null
      };
    }
  },

  getUsersData: async (timeRange: string = '30days') => {
    try {
      const token = getAuthToken();
      const response = await api.get(`/admin/analytics/users?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch users data',
        data: null
      };
    }
  },

  getCategoryRevenue: async (timeRange: string = '30days') => {
    try {
      const token = getAuthToken();
      const response = await api.get(`/admin/analytics/category-revenue?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch category revenue data',
        data: null
      };
    }
  },

  getTopProducts: async (timeRange: string = '30days') => {
    try {
      const token = getAuthToken();
      const response = await api.get(`/admin/analytics/top-products?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch top products data',
        data: null
      };
    }
  },

  getRegionalData: async (timeRange: string = '30days') => {
    try {
      const token = getAuthToken();
      const response = await api.get(`/admin/analytics/regional?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch regional data',
        data: null
      };
    }
  },

  // Settings Management
  getSettings: async () => {
    try {
      const token = getAuthToken();
      const response = await api.get('/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch settings',
        settings: null
      };
    }
  },

  updateSettings: async (settings: any) => {
    try {
      const token = getAuthToken();
      const response = await api.put('/admin/settings', settings, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update settings',
        settings: null
      };
    }
  },

  testEmailConnection: async (emailSettings: any) => {
    try {
      const token = getAuthToken();
      const response = await api.post('/admin/settings/test-email', emailSettings, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to test email connection',
      };
    }
  },

  exportSettings: async () => {
    try {
      const token = getAuthToken();
      const response = await api.get('/admin/settings/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export settings',
      };
    }
  },

  importSettings: async (settingsFile: File) => {
    try {
      const formData = new FormData();
      formData.append('settings', settingsFile);
      
      const token = getAuthToken();
      const response = await api.post('/admin/settings/import', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to import settings',
      };
    }
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
      throw error;
    }
  },
  
  getUserRefillOrders: async (userId: string, params?: any) => {
    try {
      const response = await api.get(`/refill/orders/user/${userId}`, { params });
      return response.data;
      } catch (error: any) {
      throw error;
    }
  },
  
  getAllRefillOrders: async (params?: any) => {
    try {
      const response = await api.get('/refill/orders', { params });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  getRefillOrderById: async (id: string) => {
    try {
      const response = await api.get(`/refill/orders/${id}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  updateRefillOrderStatus: async (id: string, statusData: any) => {
    try {
      const response = await api.patch(`/refill/orders/${id}/status`, statusData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  schedulePickup: async (id: string, pickupData: any) => {
    try {
      const response = await api.patch(`/refill/orders/${id}/pickup`, pickupData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  scheduleDelivery: async (id: string, deliveryData: any) => {
    try {
      const response = await api.patch(`/refill/orders/${id}/delivery`, deliveryData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  cancelRefillOrder: async (id: string, cancellationData: any) => {
    try {
      const response = await api.patch(`/refill/orders/${id}/cancel`, cancellationData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  getRefillDashboardStats: async () => {
    try {
      const response = await api.get('/refill/dashboard/stats');
      return response.data;
    } catch (error: any) {
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
        
        
        // Add cache-busting parameter to ensure fresh data
        const response = await api.get('/co2/cylinders', { 
          headers,
          params: { _t: Date.now() } // Cache busting
        });
        
        return response.data;
      }, cacheKey);
    } catch (error) {
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
      return { success: false, message: 'No slug or ID provided' };
    }
    
    const cacheKey = `co2-cylinder-${slugOrId}`;
    
    return retryRequest(async () => {
      // Try to fetch by slug first
      try {
        const response = await api.get(`/co2/cylinders/slug/${slugOrId}`);
        return response.data;
      } catch (error) {
        // If slug fails, try by ID as fallback
        const response = await api.get(`/co2/cylinders/${slugOrId}`);
        return response.data;
      }
    }, cacheKey);
  },
  
  // Create a new CO2 cylinder
  createCylinder: async (cylinderData: any) => {
    return retryRequest(async () => {
      const response = await api.post('/co2/cylinders', cylinderData);
      return response.data;
    });
  },
  
  // Update a CO2 cylinder
  updateCylinder: async (id: string, cylinderData: any) => {
    return retryRequest(async () => {
      const response = await api.put(`/co2/cylinders/${id}`, cylinderData);
      return response.data;
    });
  },
  
  // Delete a CO2 cylinder
  deleteCylinder: async (id: string) => {
    return retryRequest(async () => {
      const response = await api.delete(`/co2/cylinders/${id}`);
      return response.data;
    });
  }
};

// Export the API instance as default
export default api;

