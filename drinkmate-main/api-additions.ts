// Add these functions to your shopAPI object in api.ts

  // Get a single product by slug
  getProductBySlug: async (slug: string) => {
    try {
      const response = await api.get(`/shop/products/slug/${slug}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching product by slug:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get products by category
  getProductsByCategory: async (categoryId: string, params = {}) => {
    try {
      const response = await api.get(`/shop/categories/${categoryId}/products`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching products by category:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Add a review to a product
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
