import { NextRequest } from 'next/server'
import { 
  withErrorHandler, 
  createSuccessResponse, 
  createNotFoundError, 
  createNetworkError,
  createValidationError 
} from '@/lib/error-handler'

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params

  // Validate order ID
  if (!id || typeof id !== 'string') {
    throw createValidationError('Invalid order ID provided')
  }

  // Make request to backend
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/checkout/orders/${id}`
  
  const response = await fetch(backendUrl, {
    headers: {
      'Authorization': request.headers.get('Authorization') || '',
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw createNotFoundError('Order')
    }
    throw createNetworkError(`Backend responded with status: ${response.status}`)
  }

  const data = await response.json()
  
  return createSuccessResponse(data, 'Order details retrieved successfully')
})
