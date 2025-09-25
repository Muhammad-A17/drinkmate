/**
 * Custom hook for error handling in admin pages
 */

import { useState, useCallback, useRef } from 'react'
import { handleAdminError, AdminError, ErrorHandlerOptions } from '@/lib/admin-error-handler'

export interface UseAdminErrorHandlerOptions {
  context: string
  defaultOptions?: ErrorHandlerOptions
  onError?: (error: AdminError) => void
  onRetry?: () => void
}

export interface AdminErrorState {
  error: AdminError | null
  isRetrying: boolean
  retryCount: number
  lastErrorTime: string | null
}

export function useAdminErrorHandler(options: UseAdminErrorHandlerOptions) {
  const { context, defaultOptions = {}, onError, onRetry } = options
  const [errorState, setErrorState] = useState<AdminErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    lastErrorTime: null
  })
  
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxRetries = 3

  const handleError = useCallback((
    error: any,
    customOptions?: ErrorHandlerOptions
  ): AdminError => {
    const mergedOptions = { ...defaultOptions, ...customOptions }
    const adminError = handleAdminError(error, context, mergedOptions)
    
    setErrorState(prev => ({
      ...prev,
      error: adminError,
      lastErrorTime: new Date().toISOString()
    }))

    if (onError) {
      onError(adminError)
    }

    return adminError
  }, [context, defaultOptions, onError])

  const retry = useCallback(async (
    retryFn: () => Promise<any>,
    delay: number = 1000
  ): Promise<any> => {
    if (errorState.retryCount >= maxRetries) {
      const error = new Error('Maximum retry attempts exceeded')
      return handleError(error, { retryable: false })
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }))

    if (onRetry) {
      onRetry()
    }

    return new Promise((resolve, reject) => {
      retryTimeoutRef.current = setTimeout(async () => {
        try {
          const result = await retryFn()
          setErrorState(prev => ({
            ...prev,
            error: null,
            isRetrying: false,
            retryCount: 0
          }))
          resolve(result)
        } catch (error) {
          const adminError = handleError(error, { retryable: true })
          setErrorState(prev => ({
            ...prev,
            isRetrying: false
          }))
          reject(adminError)
        }
      }, delay * errorState.retryCount) // Exponential backoff
    })
  }, [errorState.retryCount, handleError, onRetry])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      lastErrorTime: null
    })
  }, [])

  const resetRetryCount = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      retryCount: 0
    }))
  }, [])

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  return {
    errorState,
    handleError,
    retry,
    clearError,
    resetRetryCount,
    cleanup,
    isRetrying: errorState.isRetrying,
    hasError: !!errorState.error,
    canRetry: errorState.retryCount < maxRetries && errorState.error?.retryable
  }
}

/**
 * Hook for handling async operations with error handling
 */
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  options: UseAdminErrorHandlerOptions & {
    onSuccess?: (result: T) => void
    autoRetry?: boolean
    retryDelay?: number
  }
) {
  const { onSuccess, autoRetry = false, retryDelay = 1000, ...errorOptions } = options
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<T | null>(null)
  
  const errorHandler = useAdminErrorHandler(errorOptions)

  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true)
    errorHandler.clearError()

    try {
      const operationResult = await operation()
      setResult(operationResult)
      if (onSuccess) {
        onSuccess(operationResult)
      }
      return operationResult
    } catch (error) {
      const adminError = errorHandler.handleError(error)
      
      if (autoRetry && adminError.retryable) {
        return errorHandler.retry(operation, retryDelay)
      }
      
      throw adminError
    } finally {
      setIsLoading(false)
    }
  }, [operation, onSuccess, autoRetry, retryDelay, errorHandler])

  return {
    ...errorHandler,
    execute,
    isLoading,
    result,
    setResult
  }
}

/**
 * Hook for handling form submissions with error handling
 */
export function useFormErrorHandler(
  context: string,
  options?: {
    onValidationError?: (errors: any) => void
    onSubmitError?: (error: AdminError) => void
  }
) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const errorHandler = useAdminErrorHandler({
    context,
    defaultOptions: { category: 'validation' },
    onError: options?.onSubmitError
  })

  const handleSubmit = useCallback(async (
    submitFn: () => Promise<any>,
    validationFn?: (data: any) => Record<string, string> | null
  ) => {
    setIsSubmitting(true)
    setValidationErrors({})
    errorHandler.clearError()

    try {
      // Run validation if provided
      if (validationFn) {
        const errors = validationFn({})
        if (errors && Object.keys(errors).length > 0) {
          setValidationErrors(errors)
          if (options?.onValidationError) {
            options.onValidationError(errors)
          }
          return
        }
      }

      await submitFn()
    } catch (error) {
      errorHandler.handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }, [errorHandler, options])

  const setFieldError = useCallback((field: string, message: string) => {
    setValidationErrors(prev => ({
      ...prev,
      [field]: message
    }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setValidationErrors(prev => {
      const { [field]: _, ...rest } = prev
      return rest
    })
  }, [])

  const clearAllValidationErrors = useCallback(() => {
    setValidationErrors({})
  }, [])

  return {
    ...errorHandler,
    handleSubmit,
    validationErrors,
    isSubmitting,
    setFieldError,
    clearFieldError,
    clearAllValidationErrors
  }
}
