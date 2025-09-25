// Centralized error handling utility for consistent error management across frontend and admin panel

import { toast } from "sonner"

export interface ApiError {
  success: false
  message: string
  code?: string
  status?: number
  details?: any
}

export interface ApiSuccess<T = any> {
  success: true
  data?: T
  message?: string
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  AUTHORIZATION = 'AUTHZ_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

// Error handler class
export class ErrorHandler {
  static handle(error: any, context?: string): ApiError {
    console.error(`Error in ${context || 'unknown context'}:`, error)
    
    // Network errors
    if (!error.response) {
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        code: ErrorType.NETWORK,
        status: 0
      }
    }
    
    const status = error.response.status
    const data = error.response.data
    
    // Authentication errors
    if (status === 401) {
      return {
        success: false,
        message: 'Authentication expired. Please log in again.',
        code: ErrorType.AUTHENTICATION,
        status,
        details: data
      }
    }
    
    // Authorization errors
    if (status === 403) {
      return {
        success: false,
        message: 'You do not have permission to perform this action.',
        code: ErrorType.AUTHORIZATION,
        status,
        details: data
      }
    }
    
    // Validation errors
    if (status === 400) {
      return {
        success: false,
        message: data?.message || 'Invalid request. Please check your input.',
        code: ErrorType.VALIDATION,
        status,
        details: data
      }
    }
    
    // Not found errors
    if (status === 404) {
      return {
        success: false,
        message: data?.message || 'The requested resource was not found.',
        code: ErrorType.NOT_FOUND,
        status,
        details: data
      }
    }
    
    // Server errors
    if (status >= 500) {
      return {
        success: false,
        message: 'Server error. Please try again later.',
        code: ErrorType.SERVER,
        status,
        details: data
      }
    }
    
    // Default error
    return {
      success: false,
      message: data?.message || error.message || 'An unexpected error occurred.',
      code: ErrorType.UNKNOWN,
      status,
      details: data
    }
  }
  
  static showToast(error: ApiError, context?: string) {
    const message = error.message || 'An error occurred'
    
    switch (error.code) {
      case ErrorType.NETWORK:
        toast.error(message, {
          description: 'Please check your internet connection'
        })
        break
      case ErrorType.AUTHENTICATION:
        toast.error(message, {
          description: 'You will be redirected to the login page',
          action: {
            label: 'Login',
            onClick: () => window.location.href = '/login'
          }
        })
        break
      case ErrorType.AUTHORIZATION:
        toast.error(message, {
          description: 'Contact an administrator if you believe this is an error'
        })
        break
      case ErrorType.VALIDATION:
        toast.error(message, {
          description: 'Please check your input and try again'
        })
        break
      case ErrorType.NOT_FOUND:
        toast.error(message, {
          description: 'The requested resource may have been moved or deleted'
        })
        break
      case ErrorType.SERVER:
        toast.error(message, {
          description: 'Our servers are experiencing issues. Please try again later'
        })
        break
      default:
        toast.error(message)
    }
  }
  
  static handleAndShow(error: any, context?: string): ApiError {
    const apiError = this.handle(error, context)
    this.showToast(apiError, context)
    return apiError
  }
}

// Utility function for API responses
export function createApiResponse<T = any>(
  success: boolean,
  data?: T,
  message?: string,
  code?: string
): ApiResponse<T> {
  if (success) {
    return {
      success: true,
      data,
      message
    }
  } else {
    return {
      success: false,
      message: message || 'An error occurred',
      code
    }
  }
}

// Utility function for success responses
export function createSuccessResponse<T = any>(data: T, message?: string): ApiSuccess<T> {
  return {
    success: true,
    data,
    message
  }
}

// Utility function for error responses
export function createErrorResponse(message: string, code?: string): ApiError {
  return {
    success: false,
    message,
    code
  }
}

export default ErrorHandler
