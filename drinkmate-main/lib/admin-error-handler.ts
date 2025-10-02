/**
 * Comprehensive error handling utilities for admin pages
 */

import React from 'react'

export interface AdminError {
  code: string
  message: string
  details?: any
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'network' | 'validation' | 'auth' | 'permission' | 'server' | 'unknown'
  retryable: boolean
}

export interface ErrorHandlerOptions {
  showToast?: boolean
  logToConsole?: boolean
  fallbackMessage?: string
  retryable?: boolean
  category?: AdminError['category']
}

export class AdminErrorHandler {
  private static instance: AdminErrorHandler
  private errorLog: AdminError[] = []
  private maxLogSize = 100

  static getInstance(): AdminErrorHandler {
    if (!AdminErrorHandler.instance) {
      AdminErrorHandler.instance = new AdminErrorHandler()
    }
    return AdminErrorHandler.instance
  }

  /**
   * Handle different types of errors with appropriate responses
   */
  handleError(
    error: any,
    context: string,
    options: ErrorHandlerOptions = {}
  ): AdminError {
    const {
      showToast = true,
      logToConsole = true,
      fallbackMessage = 'An unexpected error occurred',
      retryable = false,
      category = 'unknown'
    } = options

    const adminError = this.parseError(error, context, retryable, category)
    
    // Log error
    this.logError(adminError)
    
    if (logToConsole) {
      console.error(`[Admin Error] ${context}:`, {
        message: adminError.message,
        code: adminError.code,
        details: adminError.details
      })
    }

    // Show user-friendly message
    if (showToast) {
      this.showErrorToast(adminError)
    }

    return adminError
  }

  /**
   * Parse different types of errors into standardized format
   */
  private parseError(
    error: any,
    context: string,
    retryable: boolean,
    category: AdminError['category']
  ): AdminError {
    const timestamp = new Date().toISOString()
    
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.',
        details: { originalError: error.message, context },
        timestamp,
        severity: 'high',
        category: 'network',
        retryable: true
      }
    }

    // HTTP errors
    if (error.status || error.response?.status) {
      const status = error.status || error.response?.status
      const message = error.message || error.response?.data?.message || 'Request failed'
      
      return {
        code: `HTTP_${status}`,
        message: this.getHttpErrorMessage(status, message),
        details: { status, originalError: error, context },
        timestamp,
        severity: this.getSeverityFromStatus(status),
        category: status === 401 || status === 403 ? 'auth' : 'server',
        retryable: status >= 500
      }
    }

    // Validation errors
    if (error.name === 'ValidationError' || error.errors) {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Please check your input and try again.',
        details: { validationErrors: error.errors, context },
        timestamp,
        severity: 'medium',
        category: 'validation',
        retryable: false
      }
    }

    // Permission errors
    if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
      return {
        code: 'PERMISSION_ERROR',
        message: 'You do not have permission to perform this action.',
        details: { originalError: error.message, context },
        timestamp,
        severity: 'high',
        category: 'permission',
        retryable: false
      }
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: { originalError: error, context },
      timestamp,
      severity: 'medium',
      category,
      retryable
    }
  }

  /**
   * Get user-friendly HTTP error messages
   */
  private getHttpErrorMessage(status: number, originalMessage: string): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.'
      case 401:
        return 'Your session has expired. Please log in again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 409:
        return 'This action conflicts with existing data. Please refresh and try again.'
      case 422:
        return 'The data you provided is invalid. Please check your input.'
      case 429:
        return 'Too many requests. Please wait a moment and try again.'
      case 500:
        return 'Server error. Please try again later or contact support.'
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return originalMessage || 'An error occurred while processing your request.'
    }
  }

  /**
   * Get severity level from HTTP status
   */
  private getSeverityFromStatus(status: number): AdminError['severity'] {
    if (status >= 500) return 'critical'
    if (status >= 400) return 'high'
    if (status >= 300) return 'medium'
    return 'low'
  }

  /**
   * Show error toast notification
   */
  private showErrorToast(error: AdminError): void {
    // Import toast dynamically to avoid SSR issues
    import('sonner').then(({ toast }) => {
      const toastOptions = {
        duration: error.severity === 'critical' ? 10000 : 5000,
        action: error.retryable ? {
          label: 'Retry',
          onClick: () => this.retryLastAction()
        } : undefined
      }

      switch (error.severity) {
        case 'critical':
          toast.error(error.message, toastOptions)
          break
        case 'high':
          toast.error(error.message, toastOptions)
          break
        case 'medium':
          toast.warning(error.message, toastOptions)
          break
        case 'low':
          toast.info(error.message, toastOptions)
          break
      }
    })
  }

  /**
   * Log error to internal log
   */
  private logError(error: AdminError): void {
    this.errorLog.unshift(error)
    
    // Keep only the most recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }
  }

  /**
   * Retry last action (placeholder for retry logic)
   */
  private retryLastAction(): void {
    // This would be implemented based on the specific context
    console.log('Retrying last action...')
  }

  /**
   * Get error log for debugging
   */
  getErrorLog(): AdminError[] {
    return [...this.errorLog]
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number
    bySeverity: Record<AdminError['severity'], number>
    byCategory: Record<AdminError['category'], number>
    recent: AdminError[]
  } {
    const bySeverity = this.errorLog.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1
      return acc
    }, {} as Record<AdminError['severity'], number>)

    const byCategory = this.errorLog.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1
      return acc
    }, {} as Record<AdminError['category'], number>)

    return {
      total: this.errorLog.length,
      bySeverity,
      byCategory,
      recent: this.errorLog.slice(0, 10)
    }
  }
}

// Export singleton instance
export const adminErrorHandler = AdminErrorHandler.getInstance()

// Export convenience functions
export const handleAdminError = (
  error: any,
  context: string,
  options?: ErrorHandlerOptions
) => adminErrorHandler.handleError(error, context, options)

export const getAdminErrorStats = () => adminErrorHandler.getErrorStats()

export const clearAdminErrorLog = () => adminErrorHandler.clearErrorLog()

// Error boundary component for React
export interface ErrorBoundaryState {
  hasError: boolean
  error?: AdminError
  errorInfo?: any
}

export class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: AdminError; retry: () => void }> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    const adminError = adminErrorHandler.handleError(error, 'ErrorBoundary', {
      showToast: false,
      logToConsole: true
    })
    
    return {
      hasError: true,
      error: adminError
    }
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({
      error: adminErrorHandler.handleError(error, 'ErrorBoundary', {
        showToast: false,
        logToConsole: true
      }),
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return React.createElement(FallbackComponent, {
        error: this.state.error!,
        retry: () => this.setState({ hasError: false, error: undefined, errorInfo: undefined })
      })
    }

    return this.props.children
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: AdminError; retry: () => void }> = ({ error, retry }) => 
  React.createElement('div', {
    className: "flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-50 border border-red-200 rounded-lg"
  }, [
    React.createElement('div', {
      key: 'icon',
      className: "text-red-600 text-6xl mb-4"
    }, '⚠️'),
    React.createElement('h2', {
      key: 'title',
      className: "text-xl font-semibold text-red-800 mb-2"
    }, 'Something went wrong'),
    React.createElement('p', {
      key: 'message',
      className: "text-red-600 text-center mb-4"
    }, error.message),
    React.createElement('div', {
      key: 'buttons',
      className: "flex gap-2"
    }, [
      React.createElement('button', {
        key: 'retry',
        onClick: retry,
        className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      }, 'Try Again'),
      React.createElement('button', {
        key: 'reload',
        onClick: () => window.location.reload(),
        className: "px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
      }, 'Reload Page')
    ])
  ])
