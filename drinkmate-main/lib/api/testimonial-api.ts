import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'

// Testimonial types
export interface Testimonial {
  _id: string
  author: string
  role?: string
  company?: string
  text: string
  rating: number
  avatar?: string
  avatarInitial: string
  avatarColor: string
  isVerified: boolean
  isActive: boolean
  displayOrder: number
  featured: boolean
  productRelated?: string
  bundleRelated?: string
  user?: string
  language: 'en' | 'ar'
  translations: {
    [key: string]: {
      author?: string
      role?: string
      company?: string
      text?: string
    }
  }
  createdAt: string
  updatedAt: string
}

export interface TestimonialFilters {
  featured?: boolean
  productId?: string
  bundleId?: string
  verified?: boolean
  language?: 'en' | 'ar'
  limit?: number
}

export interface TestimonialResponse {
  success: boolean
  count: number
  testimonials: Testimonial[]
}

export interface CreateTestimonialData {
  author: string
  role?: string
  company?: string
  text: string
  rating?: number
  avatar?: string
  avatarColor?: string
  isVerified?: boolean
  productRelated?: string
  bundleRelated?: string
  featured?: boolean
  language?: 'en' | 'ar'
  translations?: {
    [key: string]: {
      author?: string
      role?: string
      company?: string
      text?: string
    }
  }
}

export interface UpdateTestimonialData extends Partial<CreateTestimonialData> {
  isActive?: boolean
  displayOrder?: number
}

export interface SubmitTestimonialData {
  text: string
  rating: number
  productId?: string
  bundleId?: string
}

// Testimonial API service
export const testimonialAPI = {
  // Get all testimonials (public)
  getTestimonials: async (filters?: TestimonialFilters) => {
    return apiClient.get<TestimonialResponse>(API_ENDPOINTS.TESTIMONIALS, {
      params: filters
    })
  },

  // Get all testimonials for admin
  getTestimonialsAdmin: async (filters?: TestimonialFilters) => {
    return apiClient.get<TestimonialResponse>(API_ENDPOINTS.ADMIN_TESTIMONIALS, {
      params: filters
    })
  },

  // Get single testimonial by ID
  getTestimonial: async (id: string) => {
    return apiClient.get<{ success: boolean; testimonial: Testimonial }>(
      API_ENDPOINTS.TESTIMONIAL_BY_ID(id)
    )
  },

  // Create a new testimonial (admin only)
  createTestimonial: async (testimonialData: CreateTestimonialData) => {
    return apiClient.post<{ success: boolean; message: string; testimonial: Testimonial }>(
      API_ENDPOINTS.ADMIN_TESTIMONIALS,
      testimonialData
    )
  },

  // Update a testimonial (admin only)
  updateTestimonial: async (id: string, testimonialData: UpdateTestimonialData) => {
    return apiClient.put<{ success: boolean; message: string; testimonial: Testimonial }>(
      `${API_ENDPOINTS.ADMIN_TESTIMONIALS}/${id}`,
      testimonialData
    )
  },

  // Delete a testimonial (admin only)
  deleteTestimonial: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.ADMIN_TESTIMONIALS}/${id}`
    )
  },

  // Submit a new testimonial (user)
  submitTestimonial: async (testimonialData: SubmitTestimonialData) => {
    return apiClient.post<{ success: boolean; message: string; testimonial: Testimonial }>(
      API_ENDPOINTS.SUBMIT_TESTIMONIAL,
      testimonialData
    )
  },

  // Approve a user-submitted testimonial (admin only)
  approveTestimonial: async (id: string) => {
    return apiClient.put<{ success: boolean; message: string; testimonial: Testimonial }>(
      `${API_ENDPOINTS.ADMIN_TESTIMONIALS}/${id}/approve`
    )
  }
}

export default testimonialAPI
