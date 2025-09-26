import { api, retryRequest, apiCache, getAuthToken } from '../api'

// Simple online check
const isOnline = () => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

interface Recipe {
  _id: string
  title: string
  slug: string
  description: string
  category: string
  difficulty: string
  prepTime: number
  cookTime: number
  servings: number
  featured: boolean
  published: boolean
  images: Array<{
    url: string
    alt: string
    isPrimary: boolean
    publicId?: string
  }>
  ingredients: Array<{
    name: string
    amount?: string
    unit?: string
  }>
  instructions: Array<{
    step: number
    instruction: string
  }>
  tags: string[]
  author?: {
    _id: string
    username: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
  rating?: {
    average: number
    count: number
  }
}

interface RecipeFilters {
  page?: number
  limit?: number
  category?: string
  difficulty?: string
  featured?: boolean
  published?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const recipeAPI = {
  // Get all recipes with pagination and filtering
  getRecipes: async (filters: RecipeFilters = {}) => {
    // Check connectivity first
    if (!isOnline()) {
      return {
        success: true,
        recipes: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalRecipes: 0,
          hasNext: false,
          hasPrev: false
        },
        message: 'Using fallback data - device is offline'
      };
    }
    
    // Use cache to reduce API calls
    const cacheKey = `recipes-${JSON.stringify(filters)}`;
    
    try {
      return await retryRequest(async () => {
        // Get token for admin requests (optional for recipes)
        const token = getAuthToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        
        // Build query parameters
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.category) params.append('category', filters.category);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
        if (filters.published !== undefined) params.append('published', filters.published.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
        
        const response = await api.get(`/api/recipes?${params}`, { 
          headers,
          timeout: 10000 // 10 second timeout
        });
        
        
        return response.data;
      }, cacheKey, 2, 2000); // Fewer retries with longer delay
    } catch (error) {
      // Return fallback data in the same format as the API would
      return {
        success: false,
        recipes: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalRecipes: 0,
          hasNext: false,
          hasPrev: false
        },
        message: 'Failed to fetch recipes',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Get recipe by slug
  getRecipeBySlug: async (slug: string) => {
    if (!slug) {
      return { success: false, message: 'No slug provided' };
    }
    
    // Check connectivity first
    if (!isOnline()) {
      return {
        success: false,
        recipe: null,
        message: 'Using fallback data - device is offline'
      };
    }
    
    const cacheKey = `recipe-slug-${slug}`;
    
    try {
      return await retryRequest(async () => {
        const token = getAuthToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
      const response = await api.get(`/api/recipes/slug/${slug}`, { 
        headers,
        timeout: 10000
      });
        
        return response.data;
      }, cacheKey, 2, 2000);
    } catch (error) {
      return {
        success: false,
        recipe: null,
        message: 'Failed to fetch recipe'
      };
    }
  },

  // Get recipe by ID
  getRecipeById: async (id: string) => {
    if (!id) {
      return { success: false, message: 'No ID provided' };
    }
    
    // Check connectivity first
    if (!isOnline()) {
      return {
        success: false,
        recipe: null,
        message: 'Using fallback data - device is offline'
      };
    }
    
    const cacheKey = `recipe-${id}`;
    
    try {
      return await retryRequest(async () => {
        const token = getAuthToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await api.get(`/api/recipes/admin/${id}`, { 
          headers,
          timeout: 10000
        });
        
        return response.data;
      }, cacheKey, 2, 2000);
    } catch (error) {
      return {
        success: false,
        recipe: null,
        message: 'Failed to fetch recipe'
      };
    }
  },

  // Get featured recipes
  getFeaturedRecipes: async () => {
    // Check connectivity first
    if (!isOnline()) {
      return {
        success: true,
        recipes: [],
        message: 'Using fallback data - device is offline'
      };
    }
    
    const cacheKey = 'featured-recipes';
    
    try {
      return await retryRequest(async () => {
        const response = await api.get('/api/recipes/featured', { 
          timeout: 10000
        });
        
        return response.data;
      }, cacheKey, 2, 2000);
    } catch (error) {
      return {
        success: false,
        recipes: [],
        message: 'Failed to fetch featured recipes'
      };
    }
  },

  // Get recipes by category
  getRecipesByCategory: async (category: string) => {
    if (!category) {
      return { success: false, message: 'No category provided' };
    }
    
    // Check connectivity first
    if (!isOnline()) {
      return {
        success: true,
        recipes: [],
        message: 'Using fallback data - device is offline'
      };
    }
    
    const cacheKey = `recipes-category-${category}`;
    
    try {
      return await retryRequest(async () => {
        const response = await api.get(`/api/recipes/category/${category}`, { 
          timeout: 10000
        });
        
        return response.data;
      }, cacheKey, 2, 2000);
    } catch (error) {
      return {
        success: false,
        recipes: [],
        message: 'Failed to fetch recipes by category'
      };
    }
  },

  // Create a new recipe (admin only)
  createRecipe: async (recipeData: any) => {
    if (!isOnline()) {
      return {
        success: false,
        message: 'Device is offline, cannot create recipe'
      };
    }

    try {
      // Get admin token
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required to create recipe'
        };
      }


      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await api.post('/api/recipes', 
        recipeData, 
        { 
          headers, 
          timeout: 15000 // Extended timeout for creation
        }
      );
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create recipe',
        error: {
          status: error.response?.status,
          data: error.response?.data
        }
      };
    }
  },

  // Update an existing recipe (admin only)
  updateRecipe: async (recipeId: string, recipeData: any) => {
    if (!isOnline()) {
      return {
        success: false,
        message: 'Device is offline, cannot update recipe'
      };
    }

    try {
      // Get admin token
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required to update recipe'
        };
      }


      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await api.put(`/api/recipes/${recipeId}`, 
        recipeData, 
        { 
          headers, 
          timeout: 15000 // Extended timeout for update
        }
      );
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update recipe',
        error: {
          status: error.response?.status,
          data: error.response?.data
        }
      };
    }
  },

  // Delete a recipe (admin only)
  deleteRecipe: async (recipeId: string) => {
    if (!isOnline()) {
      return {
        success: false,
        message: 'Device is offline, cannot delete recipe'
      };
    }

    try {
      // Get admin token
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required to delete recipe'
        };
      }

      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await api.delete(`/api/recipes/${recipeId}`, { 
        headers, 
        timeout: 10000
      });
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete recipe'
      };
    }
  },

  // Rate a recipe
  rateRecipe: async (recipeId: string, rating: number) => {
    if (!recipeId) {
      return { success: false, message: 'No recipe ID provided' };
    }
    
    if (rating < 1 || rating > 5) {
      return { success: false, message: 'Rating must be between 1 and 5' };
    }
    
    try {
      const response = await api.post(`/api/recipes/${recipeId}/rate`, 
        { rating }, 
        { timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to rate recipe'
      };
    }
  }
};

export default recipeAPI;
