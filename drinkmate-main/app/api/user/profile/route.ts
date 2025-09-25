import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { addSecurityHeaders, logError, sanitizeErrorMessage } from '@/lib/protected-api'

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    isAdmin: boolean
  }
}

async function updateUserProfile(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { name, phone, district, city, nationalAddress } = body

    // Basic validation
    if (!name || !name.trim()) {
      const response = NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    if (!district || !district.trim() || !city || !city.trim()) {
      const response = NextResponse.json(
        { error: 'District and city are required' },
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    // Validate national address format if provided
    if (nationalAddress && !/^[A-Z]{4}[0-9]{4}$/.test(nationalAddress)) {
      const response = NextResponse.json(
        { error: 'Invalid national address format. Must be 4 letters followed by 4 numbers (e.g., JESA3591)' },
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    // Validate phone number format if provided (Saudi phone numbers)
    if (phone && !/^(\+966|966|0)?[5-9][0-9]{8}$/.test(phone)) {
      const response = NextResponse.json(
        { error: 'Invalid phone number format. Please enter a valid Saudi phone number (e.g., 0507551812)' },
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

    // Call backend API to update user profile
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    
    try {
      const response = await fetch(`${backendUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.get('Authorization') || ''
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone?.trim() || '',
          district: district.trim(),
          city: city.trim(),
          nationalAddress: nationalAddress?.trim() || ''
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return NextResponse.json(
          { error: errorData.error || 'Failed to update profile' },
          { status: response.status }
        )
      }

      const updatedUser = await response.json()

      // Return success response with updated data
      const successResponse = NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          name: updatedUser.user?.name || name,
          phone: updatedUser.user?.phone || phone,
          district: updatedUser.user?.district || district,
          city: updatedUser.user?.city || city,
          country: 'Saudi Arabia',
          nationalAddress: updatedUser.user?.nationalAddress || nationalAddress
        }
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
    logError(error, 'Profile update error')
    const response = NextResponse.json(
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    )
    return addSecurityHeaders(response)
  }
}

// Export the protected handler
export const PUT = withAuth(updateUserProfile)
