import { api, apiCache, retryRequest, getAuthToken } from './api';
import { fallbackCylinders } from './fallback-data';

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
    
    try {
      return await retryRequest(async () => {
        const token = getAuthToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const isSlug = slugOrId.includes('-');
        const endpoint = isSlug ? `/co2/cylinders/slug/${slugOrId}` : `/co2/cylinders/${slugOrId}`;
        
        const response = await api.get(endpoint, { 
          headers,
          params: { _t: Date.now() } // Cache busting
        });
        
        return response.data;
      }, cacheKey);
    } catch (error) {
      console.warn(`Failed to fetch cylinder ${slugOrId}, using fallback data`, error);
      // Find a matching cylinder from fallback data or return the first one
      const fallbackCylinder = fallbackCylinders.find(c => c.id === slugOrId) || fallbackCylinders[0];
      return {
        success: true,
        cylinder: fallbackCylinder,
        message: 'Using fallback data due to network error'
      };
    }
  },
  
  // Create a new CO2 cylinder (admin only)
  createCylinder: async (cylinderData: any) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Authentication required' };
      }
      
      const response = await api.post('/co2/cylinders', cylinderData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Create cylinder error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update a CO2 cylinder (admin only)
  updateCylinder: async (id: string, cylinderData: any) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Authentication required' };
      }
      
      const response = await api.put(`/co2/cylinders/${id}`, cylinderData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Update cylinder error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Delete a CO2 cylinder (admin only)
  deleteCylinder: async (id: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Authentication required' };
      }
      
      const response = await api.delete(`/co2/cylinders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Delete cylinder error:', error.response?.data || error.message);
      throw error;
    }
  }
};