import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { makeAuthenticatedRequest, handleBackendResponse, checkRateLimit } from '@/lib/api/protected-api'

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    isAdmin: boolean
  }
}

async function getUserOrders(req: AuthenticatedRequest) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Check rate limiting
    if (!checkRateLimit(`orders_${userId}`, 30, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      )
    }

    const authToken = req.headers.get('Authorization')?.replace('Bearer ', '') || ''
    
    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const status = searchParams.get('status') || ''

    // Call backend API
    const response = await makeAuthenticatedRequest(
      `/orders/user/${userId}?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`,
      { method: 'GET' },
      authToken
    )

    return await handleBackendResponse(response)

  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getUserOrders)
