// API service for handling all backend requests
import axios from 'axios';
import { getAuthToken } from './auth-context';

// Base API URL - should be set in environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://drinkmates.onrender.com';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const apiCache = new Map();

  // Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout (helps with Render cold starts)
});

// Helper function to implement retry mechanism with caching
const retryRequest = async (apiCall: () => Promise<any>, cacheKey?: string, maxRetries = 4, delay = 1500): Promise<any> => {
  // Check cache first if cacheKey is provided
  if (cacheKey && apiCache.has(cacheKey)) {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData.timestamp > Date.now() - CACHE_TTL) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache hit for ${cacheKey}`);
      }
      return cachedData.data;
    } else {
      // Cache expired
      apiCache.delete(cacheKey);
    }
  }
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const result = await apiCall();
    
    // Store in cache if cacheKey is provided
    if (cacheKey) {
      apiCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cached data for ${cacheKey}`);
      }
    }
    
    return result;
    } catch (error: any) {
      retries++;
      
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
        throw error;
      }
      
      // For network errors, wait longer between retries
      if (!error.response) {
        // Double the delay for network errors
        // Using a temporary variable to avoid TypeScript error
        const newDelay = Math.floor(delay * 2);
        delay = newDelay;
      }
      
      // Wait before retrying - exponential backoff
      const waitTime = Math.min(8000, Math.floor(delay * Math.pow(2, retries - 1)));
      // Use a type assertion to avoid TypeScript error
      await new Promise<void>(resolve => {
        const timeoutId = setTimeout(resolve, waitTime);
        return timeoutId;
      });
      
      // Log retry attempt
      if (process.env.NODE_ENV === 'development') {
        console.log(`Retrying API call (${retries}/${maxRetries})...`);
      }
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw new Error('Retry mechanism failed');
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
        console.log(`Response compressed with: ${contentEncoding}`);
      }
    }
    return response;
  },
  (error) => {
    // Convert network timeouts to a friendlier message
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'Network timeout. Please try again in a moment.';
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
    console.error('API Error:', error.response?.data || error.message);
    
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
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  verifyToken: async () => {
    return retryRequest(async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Attempting to verify token with API URL:', API_URL);
        }
        const response = await api.get('/auth/verify');
        if (process.env.NODE_ENV === 'development') {
          console.log('Token verification successful');
        }
        return response.data;
      } catch (error: any) {
        console.error('Token verification failed:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          url: `${API_URL}/auth/verify`
        });
        throw error;
      }
    }, undefined, 3, 1500); // 3 retries with 1.5s initial delay
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
        console.log('Fetching product with flexible method for:', idOrSlug);
      }
      // Heuristic: 24 hex chars -> likely a Mongo ObjectId
      const isObjectId = /^[a-f0-9]{24}$/i.test(idOrSlug);
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Trying direct product endpoint:', `/shop/products/${idOrSlug}`);
        }
        const direct = await api.get(`/shop/products/${idOrSlug}`);
        if (process.env.NODE_ENV === 'development') {
          console.log('Direct product fetch successful');
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
            console.log('Trying slug product endpoint:', `/shop/products/slug/${idOrSlug}`);
          }
          const bySlug = await api.get(`/shop/products/slug/${idOrSlug}`);
          if (process.env.NODE_ENV === 'development') {
            console.log('Slug product fetch successful');
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
        const response = await api.get(`/shop/products/slug/${slug}`);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching product by slug:', error.response?.data || error.message);
        throw error;
      }
    });
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
        console.log('Fetching bundle with flexible method for:', idOrSlug);
      }
      const isObjectId = /^[a-f0-9]{24}$/i.test(idOrSlug);
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Trying direct bundle endpoint:', `/shop/bundles/${idOrSlug}`);
        }
        const direct = await api.get(`/shop/bundles/${idOrSlug}`);
        if (process.env.NODE_ENV === 'development') {
          console.log('Direct bundle fetch successful');
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
            console.log('Trying slug bundle endpoint:', `/shop/bundles/slug/${idOrSlug}`);
          }
          const bySlug = await api.get(`/shop/bundles/slug/${idOrSlug}`);
          if (process.env.NODE_ENV === 'development') {
            console.log('Slug bundle fetch successful');
          }
          return bySlug.data;
        } catch (slugErr: any) {
          console.error('Error in slug bundle fetch:', slugErr.response?.status || slugErr.message);
          throw slugErr;
        }
      }
    });
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

  getCategoryById: async (categoryId: string) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  getSubcategoryById: async (subcategoryId: string) => {
    const response = await api.get(`/subcategories/${subcategoryId}`);
    return response.data;
  }
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
    const response = await api.get('/contact/contacts', { params });
    return response.data;
  },
  
  // Get contact by ID (admin only)
  getContactById: async (id: string) => {
    const response = await api.get(`/contact/contacts/${id}`);
    return response.data;
  },
  
  // Update contact status (admin only)
  updateContactStatus: async (id: string, updateData: any) => {
    const response = await api.put(`/contact/contacts/${id}/status`, updateData);
    return response.data;
  },
  
  // Add contact response (admin only)
  addContactResponse: async (id: string, responseData: any) => {
    const response = await api.post(`/contact/contacts/${id}/response`, responseData);
    return response.data;
  },
  
  // Delete contact (admin only)
  deleteContact: async (id: string) => {
    const response = await api.delete(`/contact/contacts/${id}`);
    return response.data;
  },
  
  // Get contact statistics (admin only)
  getContactStats: async () => {
    const response = await api.get('/contact/stats');
    return response.data;
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

  deleteCategory: async (categoryId: string) => {
    const token = getAuthToken();
    const response = await api.delete(`/admin/categories/${categoryId}`, {
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

// Export the API instance as default
export default api;
