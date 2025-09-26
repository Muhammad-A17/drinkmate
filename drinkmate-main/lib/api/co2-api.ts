// CO2 API - Handles CO2 cylinder operations and data fetching
// Sample commit for demonstration purposes
import { api, apiCache, retryRequest, getAuthToken } from '../api';
import { fallbackCylinders } from '../fallback-data';

/**
 * Checks if the device is currently online
 * @returns {boolean} True if the device is online, false otherwise
 */
const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true; // Assume online if we can't detect
};

/**
 * Handles API errors with improved diagnostics
 * @param {any} error - The error object from the API call
 * @param {string} context - Context for the error (e.g., 'getCylinders')
 */
const handleApiError = (error: any, context: string): void => {
  // Create detailed error info
  const errorInfo = {
    context,
    message: error.message || 'Unknown error',
    type: error.response ? `HTTP ${error.response.status}` : 'Network Error',
    online: isOnline(),
    apiURL: api.defaults.baseURL,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };
  
  // Log with different levels based on error type
  if (!error.response) {
    console.warn('CO2API Network Error:', errorInfo);
  } else if (error.response.status >= 500) {
    console.error('CO2API Server Error:', errorInfo);
  } else {
    console.warn('CO2API Client Error:', errorInfo);
  }
};

// CO2 Cylinders API
export const co2API = {
  // Get all CO2 cylinders
  getCylinders: async () => {
    // Check connectivity first
    if (!isOnline()) {
      console.warn('CO2API: Device appears to be offline, returning fallback data');
      return {
        success: true,
        cylinders: fallbackCylinders,
        message: 'Using fallback data - device is offline'
      };
    }
    
    // Clear cache to get fresh data
    const cacheKey = 'co2-cylinders';
    apiCache.delete(cacheKey);
    
    try {
      return await retryRequest(async () => {
        // Get token for admin requests
        const token = getAuthToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('CO2API Debug:', {
            baseURL: api.defaults.baseURL,
            endpoint: '/co2/cylinders',
            fullURL: `${api.defaults.baseURL}/co2/cylinders`,
            hasToken: !!token,
            timestamp: new Date().toISOString()
          });
        }
        
        // Add cache-busting parameter to ensure fresh data
        const response = await api.get('/co2/cylinders', { 
          headers,
          params: { _t: Date.now() }, // Cache busting
          timeout: 10000 // 10 second timeout
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('CO2API Response:', response.data);
        }
        return response.data;
      }, cacheKey, 3, 1500); // More retries with longer initial delay
    } catch (error) {
      handleApiError(error, 'getCylinders');
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
    
    // Check connectivity first
    if (!isOnline()) {
      console.warn(`CO2API: Device is offline, returning fallback data for cylinder ${slugOrId}`);
      // Find a matching cylinder from fallback data or return the first one
      const fallbackCylinder = fallbackCylinders.find(c => 
        c.id === slugOrId || 
        c.id.toString() === slugOrId
      ) || fallbackCylinders[0];
      
      return {
        success: true,
        cylinder: fallbackCylinder,
        message: 'Using fallback data - device is offline'
      };
    }
    
    const cacheKey = `co2-cylinder-${slugOrId}`;
    
    try {
      return await retryRequest(async () => {
        const token = getAuthToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const isSlug = slugOrId.includes('-');
        const endpoint = isSlug ? `/co2/cylinders/slug/${slugOrId}` : `/co2/cylinders/${slugOrId}`;
        
        const response = await api.get(endpoint, { 
          headers,
          params: { _t: Date.now() }, // Cache busting
          timeout: 10000 // 10 second timeout
        });
        
        return response.data;
      }, cacheKey, 3, 1500); // More retries with longer initial delay
    } catch (error) {
      handleApiError(error, `getCylinder(${slugOrId})`);
      
      // Find a matching cylinder from fallback data or return the first one
      const fallbackCylinder = fallbackCylinders.find(c => 
        c.id === slugOrId || 
        c.id.toString() === slugOrId
      ) || fallbackCylinders[0];
      
      return {
        success: true,
        cylinder: fallbackCylinder,
        message: 'Using fallback data due to network error'
      };
    }
  },
  
  // Create a new CO2 cylinder (admin only)
  createCylinder: async (cylinderData: any) => {
    // Verify we're online before attempting write operations
    if (!isOnline()) {
      return { 
        success: false, 
        message: 'Cannot create cylinder - device is offline' 
      };
    }
    
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Authentication required' };
      }
      
      const response = await api.post('/co2/cylinders', cylinderData, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 15000 // 15 second timeout for create operations
      });
      
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'createCylinder');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create cylinder due to network issues' 
      };
    }
  },
  
  // Update a CO2 cylinder (admin only)
  updateCylinder: async (id: string, cylinderData: any) => {
    // Verify we're online before attempting write operations
    if (!isOnline()) {
      return { 
        success: false, 
        message: 'Cannot update cylinder - device is offline' 
      };
    }
    
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Authentication required' };
      }
      
      const response = await api.put(`/co2/cylinders/${id}`, cylinderData, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 15000 // 15 second timeout for update operations
      });
      
      return response.data;
    } catch (error: any) {
      handleApiError(error, `updateCylinder(${id})`);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update cylinder due to network issues' 
      };
    }
  },
  
  // Delete a CO2 cylinder (admin only)
  deleteCylinder: async (id: string) => {
    // Verify we're online before attempting write operations
    if (!isOnline()) {
      return { 
        success: false, 
        message: 'Cannot delete cylinder - device is offline' 
      };
    }
    
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Authentication required' };
      }
      
      const response = await api.delete(`/co2/cylinders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 15000 // 15 second timeout for delete operations
      });
      
      return response.data;
    } catch (error: any) {
      handleApiError(error, `deleteCylinder(${id})`);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete cylinder due to network issues' 
      };
    }
  }
};
