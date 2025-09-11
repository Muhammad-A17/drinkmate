import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants'
import { ApiResponse, PaginatedResponse } from '@/lib/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId()

        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || 
             sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    } catch {
      return null
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private handleError(error: any) {
    if (error.response?.status === 401) {
      this.clearAuthToken()
      this.redirectToLogin()
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.data || error.message)
    }
  }

  private clearAuthToken() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    } catch {
      // Ignore storage errors
    }
  }

  private redirectToLogin() {
    if (typeof window === 'undefined') return
    
    const currentPath = window.location.pathname
    if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
      window.location.href = '/login'
    }
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config)
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
      }
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config)
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
      }
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config)
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
      }
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.patch(url, data, config)
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
      }
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config)
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
      }
    }
  }

  // Paginated request method
  async getPaginated<T = any>(
    url: string, 
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    try {
      const response: AxiosResponse<PaginatedResponse<T>> = await this.client.get(url, { params })
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        error: error.response?.data?.message || error.message || 'Request failed',
      }
    }
  }

  // File upload method
  async uploadFile<T = any>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response: AxiosResponse<T> = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Upload failed',
      }
    }
  }

  // Set auth token
  setAuthToken(token: string, persistent: boolean = true) {
    if (typeof window === 'undefined') return

    try {
      if (persistent) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      } else {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      }
    } catch {
      // Ignore storage errors
    }
  }

  // Clear auth token
  clearAuth() {
    this.clearAuthToken()
  }
}

// Create singleton instance
export const apiClient = new ApiClient()
export default apiClient
