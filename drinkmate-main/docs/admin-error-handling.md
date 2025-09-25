# Admin Error Handling Guide

This guide explains how to implement comprehensive error handling in admin pages using the new error handling utilities.

## Overview

The admin error handling system provides:
- Centralized error management
- User-friendly error messages
- Automatic retry mechanisms
- Error logging and statistics
- Form validation error handling
- React error boundaries

## Core Components

### 1. AdminErrorHandler

The main error handling class that provides:
- Error parsing and categorization
- User-friendly error messages
- Toast notifications
- Error logging
- Retry mechanisms

```typescript
import { useAdminErrorHandler } from '@/lib/admin-error-handler'

const errorHandler = useAdminErrorHandler({
  context: 'ProductsPage',
  defaultOptions: { category: 'server' }
})
```

### 2. Custom Hooks

#### useAdminErrorHandler
Basic error handling hook for general use.

```typescript
import { useAdminErrorHandler } from '@/hooks/use-admin-error-handler'

const {
  errorState,
  handleError,
  retry,
  clearError,
  isRetrying,
  hasError,
  canRetry
} = useAdminErrorHandler({
  context: 'ProductsPage',
  defaultOptions: { category: 'server' }
})
```

#### useAsyncOperation
Hook for handling async operations with automatic error handling.

```typescript
import { useAsyncOperation } from '@/hooks/use-admin-error-handler'

const {
  execute,
  isLoading,
  result,
  errorState,
  handleError
} = useAsyncOperation(
  () => fetchProducts(),
  {
    context: 'ProductsPage',
    onSuccess: (data) => console.log('Success:', data),
    autoRetry: true,
    retryDelay: 1000
  }
)
```

#### useFormErrorHandler
Hook for handling form submissions with validation errors.

```typescript
import { useFormErrorHandler } from '@/hooks/use-admin-error-handler'

const {
  handleSubmit,
  validationErrors,
  isSubmitting,
  setFieldError,
  clearFieldError,
  clearAllValidationErrors
} = useFormErrorHandler('ProductForm', {
  onValidationError: (errors) => console.log('Validation errors:', errors),
  onSubmitError: (error) => console.log('Submit error:', error)
})
```

## Implementation Examples

### 1. Basic Page Error Handling

```typescript
import { useAdminErrorHandler, AdminErrorBoundary } from '@/lib/admin-error-handler'
import { AdminErrorDisplay } from '@/components/admin/AdminErrorDisplay'

export default function ProductsPage() {
  const errorHandler = useAdminErrorHandler({
    context: 'ProductsPage',
    defaultOptions: { category: 'server' }
  })

  const fetchProducts = async () => {
    try {
      const response = await adminAPI.getProducts()
      if (response.success) {
        setProducts(response.products)
      } else {
        errorHandler.handleError(
          new Error(response.message || 'Failed to fetch products'),
          'fetchProducts',
          { category: 'server', retryable: true }
        )
      }
    } catch (error) {
      errorHandler.handleError(error, 'fetchProducts', { 
        category: 'network', 
        retryable: true 
      })
    }
  }

  return (
    <AdminErrorBoundary>
      <AdminLayout>
        {/* Error Display */}
        {errorHandler.hasError && (
          <AdminErrorDisplay
            error={errorHandler.errorState.error}
            onRetry={() => errorHandler.retry(() => fetchProducts())}
            onDismiss={() => errorHandler.clearError()}
          />
        )}
        
        {/* Page Content */}
        {/* ... */}
      </AdminLayout>
    </AdminErrorBoundary>
  )
}
```

### 2. Form Error Handling

```typescript
import { useFormErrorHandler } from '@/hooks/use-admin-error-handler'

export default function ProductForm() {
  const formErrorHandler = useFormErrorHandler('ProductForm', {
    onValidationError: (errors) => {
      console.error('Validation errors:', errors)
    }
  })

  const handleSubmit = async (formData: ProductFormData) => {
    return formErrorHandler.handleSubmit(async () => {
      // Validate form data
      const validationErrors: Record<string, string> = {}
      
      if (!formData.name) {
        validationErrors.name = 'Product name is required'
      }
      
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          formErrorHandler.setFieldError(field, message)
        })
        throw new Error('Validation failed')
      }

      // Submit form
      const response = await adminAPI.createProduct(formData)
      if (response.success) {
        toast.success('Product created successfully')
        formErrorHandler.clearAllValidationErrors()
      } else {
        throw new Error(response.message || 'Failed to create product')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error display */}
      {formErrorHandler.validationErrors.name && (
        <div className="text-red-500 text-sm">
          {formErrorHandler.validationErrors.name}
        </div>
      )}
      {/* ... */}
    </form>
  )
}
```

### 3. Async Operation Error Handling

```typescript
import { useAsyncOperation } from '@/hooks/use-admin-error-handler'

export default function ProductsList() {
  const {
    execute: fetchProducts,
    isLoading,
    result: products,
    errorState,
    handleError
  } = useAsyncOperation(
    () => adminAPI.getProducts(),
    {
      context: 'ProductsList',
      onSuccess: (data) => {
        console.log('Products loaded:', data)
      },
      autoRetry: true,
      retryDelay: 2000
    }
  )

  useEffect(() => {
    fetchProducts()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {errorState.error && (
        <AdminErrorDisplay
          error={errorState.error}
          onRetry={() => fetchProducts()}
        />
      )}
      {/* Products list */}
    </div>
  )
}
```

## Error Categories

The system categorizes errors into:

- **network**: Connection issues, timeouts
- **validation**: Form validation errors
- **auth**: Authentication/authorization errors
- **permission**: Access control errors
- **server**: Backend server errors
- **unknown**: Unclassified errors

## Error Severity Levels

- **critical**: System-breaking errors
- **high**: Important errors that need attention
- **medium**: Warnings that should be noted
- **low**: Informational messages

## Best Practices

### 1. Always Use Error Boundaries
Wrap your admin pages with `AdminErrorBoundary` to catch React errors.

### 2. Provide Context
Always provide meaningful context when handling errors:
```typescript
errorHandler.handleError(error, 'fetchProducts', { 
  category: 'server', 
  retryable: true 
})
```

### 3. Handle Different Error Types
Use appropriate error handling for different scenarios:
- Network errors: Show retry option
- Validation errors: Show field-specific messages
- Auth errors: Redirect to login
- Permission errors: Show access denied message

### 4. Use Form Error Handler for Forms
Always use `useFormErrorHandler` for form submissions to get proper validation error handling.

### 5. Provide User-Friendly Messages
The system automatically converts technical errors to user-friendly messages, but you can customize them:

```typescript
errorHandler.handleError(error, 'fetchProducts', {
  fallbackMessage: 'Unable to load products. Please try again later.'
})
```

### 6. Log Errors for Debugging
The system automatically logs errors, but you can add additional logging:

```typescript
errorHandler.handleError(error, 'fetchProducts', {
  logToConsole: true,
  onError: (adminError) => {
    // Custom error logging
    console.error('Custom error logging:', adminError)
  }
})
```

## Error Display Components

### AdminErrorDisplay
Full-featured error display with details, retry options, and dismiss functionality.

### AdminErrorInline
Compact error display for inline use in forms or small spaces.

### AdminErrorStats
Statistics display showing error counts by severity and category.

## Testing Error Handling

### 1. Test Network Errors
Disconnect from internet or use invalid API endpoints.

### 2. Test Validation Errors
Submit forms with invalid data.

### 3. Test Auth Errors
Use expired or invalid tokens.

### 4. Test Permission Errors
Try accessing admin features with non-admin users.

## Monitoring and Debugging

The error handler provides statistics and logging:

```typescript
import { getAdminErrorStats } from '@/lib/admin-error-handler'

const stats = getAdminErrorStats()
console.log('Error statistics:', stats)
```

This includes:
- Total error count
- Errors by severity
- Errors by category
- Recent errors
- Error log for debugging
