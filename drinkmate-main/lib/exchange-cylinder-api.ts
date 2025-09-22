import { api, retryRequest, apiCache, getAuthToken } from './api'

// Simple online check
const isOnline = () => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

// Exchange Cylinder API
export const exchangeCylinderAPI = {
  // Get all exchange cylinders
  getExchangeCylinders: async (filters?: {
    page?: number
    limit?: number
    brand?: string
    exchangeType?: string
    serviceLevel?: string
    status?: string
    minPrice?: number
    maxPrice?: number
    serviceArea?: string
    sortBy?: string
    sortOrder?: string
  }) => {
    // Check connectivity first
    if (!isOnline()) {
      console.warn('ExchangeCylinderAPI: Device appears to be offline, returning fallback data');
      return {
        success: true,
        cylinders: [],
        message: 'Using fallback data - device is offline'
      };
    }
    
    // Clear cache to get fresh data
    const cacheKey = 'exchange-cylinders';
    apiCache.delete(cacheKey);
    
    try {
      return await retryRequest(async () => {
        // Get token for admin requests
        const token = getAuthToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('ExchangeCylinderAPI Debug:', {
            baseURL: api.defaults.baseURL,
            endpoint: '/exchange-cylinders/cylinders',
            fullURL: `${api.defaults.baseURL}/exchange-cylinders/cylinders`,
            hasToken: !!token,
            filters,
            timestamp: new Date().toISOString()
          });
        }
        
        // Add cache-busting parameter to ensure fresh data
        const response = await api.get('/exchange-cylinders/cylinders', { 
          headers,
          params: { 
            _t: Date.now(), // Cache busting
            ...filters
          },
          timeout: 10000 // 10 second timeout
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('ExchangeCylinderAPI Response:', response.data);
        }
        return response.data;
      }, cacheKey, 3, 1500); // More retries with longer initial delay
    } catch (error) {
      console.error('ExchangeCylinderAPI Error:', error);
      // Return fallback data in the same format as the API would
      return {
        success: true,
        cylinders: [],
        message: 'Using fallback data due to network error'
      };
    }
  },

  // Get exchange cylinder by ID
  getExchangeCylinder: async (id: string) => {
    if (!id) {
      console.warn('getExchangeCylinder called with empty id');
      return { success: false, message: 'No ID provided' };
    }
    
    // Check connectivity first
    if (!isOnline()) {
      console.warn(`ExchangeCylinderAPI: Device is offline, returning fallback data for cylinder ${id}`);
      return {
        success: true,
        cylinder: null,
        message: 'Using fallback data - device is offline'
      };
    }
    
    const cacheKey = `exchange-cylinder-${id}`;
    
    try {
      return await retryRequest(async () => {
        const token = getAuthToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await api.get(`/exchange-cylinders/cylinders/${id}`, { 
          headers,
          params: { _t: Date.now() }, // Cache busting
          timeout: 10000 // 10 second timeout
        });
        
        return response.data;
      }, cacheKey, 3, 1500); // More retries with longer initial delay
    } catch (error) {
      console.error(`ExchangeCylinderAPI Error for cylinder ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch exchange cylinder'
      };
    }
  },

  // Get exchange cylinders by type
  getByExchangeType: async (type: string) => {
    if (!type) {
      console.warn('getByExchangeType called with empty type');
      return { success: false, message: 'No type provided' };
    }
    
    try {
      const response = await api.get(`/exchange-cylinders/cylinders/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`ExchangeCylinderAPI Error for type ${type}:`, error);
      return {
        success: false,
        message: 'Failed to fetch exchange cylinders by type'
      };
    }
  },

  // Get exchange cylinders by service level
  getByServiceLevel: async (level: string) => {
    if (!level) {
      console.warn('getByServiceLevel called with empty level');
      return { success: false, message: 'No level provided' };
    }
    
    try {
      const response = await api.get(`/exchange-cylinders/cylinders/service-level/${level}`);
      return response.data;
    } catch (error) {
      console.error(`ExchangeCylinderAPI Error for level ${level}:`, error);
      return {
        success: false,
        message: 'Failed to fetch exchange cylinders by service level'
      };
    }
  },

  // Get best sellers
  getBestSellers: async (limit: number = 10) => {
    try {
      const response = await api.get(`/exchange-cylinders/cylinders/best-sellers`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('ExchangeCylinderAPI Error for best sellers:', error);
      return {
        success: false,
        message: 'Failed to fetch best sellers'
      };
    }
  },

  // Get featured exchange cylinders
  getFeatured: async (limit: number = 10) => {
    try {
      const response = await api.get(`/exchange-cylinders/cylinders/featured`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('ExchangeCylinderAPI Error for featured:', error);
      return {
        success: false,
        message: 'Failed to fetch featured exchange cylinders'
      };
    }
  },

  // Record exchange transaction
  recordExchange: async (cylinderId: string) => {
    if (!cylinderId) {
      console.warn('recordExchange called with empty cylinderId');
      return { success: false, message: 'No cylinder ID provided' };
    }
    
    try {
      const token = getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await api.post(`/exchange-cylinders/cylinders/${cylinderId}/exchange`, {}, {
        headers,
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error(`ExchangeCylinderAPI Error recording exchange for ${cylinderId}:`, error);
      return {
        success: false,
        message: 'Failed to record exchange'
      };
    }
  },

  // Update rating
  updateRating: async (cylinderId: string, rating: number) => {
    if (!cylinderId) {
      console.warn('updateRating called with empty cylinderId');
      return { success: false, message: 'No cylinder ID provided' };
    }
    
    if (rating < 1 || rating > 5) {
      console.warn('updateRating called with invalid rating');
      return { success: false, message: 'Rating must be between 1 and 5' };
    }
    
    try {
      const token = getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await api.post(`/exchange-cylinders/cylinders/${cylinderId}/rating`, 
        { rating }, 
        { headers, timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      console.error(`ExchangeCylinderAPI Error updating rating for ${cylinderId}:`, error);
      return {
        success: false,
        message: 'Failed to update rating'
      };
    }
  }
};
