import { NextRequest } from 'next/server'
import { 
  withErrorHandler, 
  createSuccessResponse, 
  createNetworkError,
  createValidationError,
  createPaginatedResponse 
} from '@/lib/error-handler'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  
  // Parse and validate parameters
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  // Validate pagination parameters
  if (page < 1) {
    throw createValidationError('Page number must be greater than 0')
  }
  if (limit < 1 || limit > 100) {
    throw createValidationError('Limit must be between 1 and 100')
  }

  // Extract filter parameters
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const color = searchParams.get('color')
  const featured = searchParams.get('featured')
  const bestSeller = searchParams.get('bestSeller')
  const newArrival = searchParams.get('newArrival')
  const sort = searchParams.get('sort')

  // Validate price range
  if (minPrice && maxPrice) {
    const min = parseFloat(minPrice)
    const max = parseFloat(maxPrice)
    if (min > max) {
      throw createValidationError('Minimum price cannot be greater than maximum price')
    }
  }

  // Build query parameters for the backend
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  })

  if (category) params.append('category', category)
  if (search) params.append('search', search)
  if (minPrice) params.append('minPrice', minPrice)
  if (maxPrice) params.append('maxPrice', maxPrice)
  if (color) params.append('color', color)
  if (featured) params.append('featured', featured)
  if (bestSeller) params.append('bestSeller', bestSeller)
  if (newArrival) params.append('newArrival', newArrival)
  if (sort) params.append('sort', sort)

  // Make request to backend
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/shop/products?${params}`
  
  const response = await fetch(backendUrl, {
    headers: {
      'Authorization': request.headers.get('Authorization') || '',
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw createNetworkError(`Backend responded with status: ${response.status}`)
  }

  const data = await response.json()
  
  // Check if response has pagination data
  if (data.pagination) {
    return createPaginatedResponse(
      data.products || data.data || [],
      data.pagination,
      'Products retrieved successfully'
    )
  }
  
  return createSuccessResponse(data, 'Products retrieved successfully')
})
