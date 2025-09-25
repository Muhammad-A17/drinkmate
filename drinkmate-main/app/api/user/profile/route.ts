import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'

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
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!district || !district.trim() || !city || !city.trim()) {
      return NextResponse.json(
        { error: 'District and city are required' },
        { status: 400 }
      )
    }

    // Validate national address format if provided
    if (nationalAddress && !/^[A-Z]{4}[0-9]{4}$/.test(nationalAddress)) {
      return NextResponse.json(
        { error: 'Invalid national address format. Must be 4 letters followed by 4 numbers (e.g., JESA3591)' },
        { status: 400 }
      )
    }

    // Validate phone number format if provided (Saudi phone numbers)
    if (phone && !/^(\+966|966|0)?[5-9][0-9]{8}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please enter a valid Saudi phone number (e.g., 0507551812)' },
        { status: 400 }
      )
    }

    const userId = req.user?.id
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
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
      return NextResponse.json({
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

    } catch (backendError) {
      console.error('Backend API error:', backendError)
      return NextResponse.json(
        { error: 'Failed to connect to user service' },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the protected handler
export const PUT = withAuth(updateUserProfile)
