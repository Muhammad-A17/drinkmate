import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { addSecurityHeaders, logError, sanitizeErrorMessage } from '@/lib/api/protected-api'

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    isAdmin: boolean
  }
}

async function changePassword(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { currentPassword, newPassword } = body

    // Basic validation
    if (!currentPassword || !newPassword) {
      const response = NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    if (newPassword.length < 8) {
      const response = NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    if (currentPassword === newPassword) {
      const response = NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    const userId = req.user?.id
    if (!userId) {
      const response = NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
      return addSecurityHeaders(response)
    }

    // Call backend API to change password
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    
    try {
      const response = await fetch(`${backendUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.get('Authorization') || ''
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return NextResponse.json(
          { error: errorData.error || 'Failed to change password' },
          { status: response.status }
        )
      }

      const result = await response.json()

      // Return success response
      const successResponse = NextResponse.json({
        success: true,
        message: 'Password changed successfully'
      })
      return addSecurityHeaders(successResponse)

    } catch (backendError) {
      logError(backendError, 'Backend API error')
      const response = NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
      return addSecurityHeaders(response)
    }

  } catch (error) {
    logError(error, 'Password change error')
    const response = NextResponse.json(
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    )
    return addSecurityHeaders(response)
  }
}

export const POST = withAuth(changePassword)
