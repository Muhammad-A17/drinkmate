import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { makeAuthenticatedRequest, handleBackendResponse, checkRateLimit, sanitizeInput, validateNationalAddress } from '@/lib/api/protected-api'

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    isAdmin: boolean
  }
}

async function getUserAddresses(req: AuthenticatedRequest) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Check rate limiting
    if (!checkRateLimit(`addresses_${userId}`, 20, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      )
    }

    const authToken = req.headers.get('Authorization')?.replace('Bearer ', '') || ''
    
    // Call backend API to get user profile (which contains address data)
    const response = await makeAuthenticatedRequest(
      `/auth/profile`,
      { method: 'GET' },
      authToken
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: response.status }
      )
    }

    const userData = await response.json()
    
    // Transform user profile data to addresses format
    const addresses = [{
      id: userData.user?._id || userData.user?.id,
      firstName: userData.user?.name?.split(' ')[0] || '',
      lastName: userData.user?.name?.split(' ').slice(1).join(' ') || '',
      phone: userData.user?.phone || '',
      district: userData.user?.district || '',
      city: userData.user?.city || '',
      country: 'Saudi Arabia',
      nationalAddress: userData.user?.nationalAddress || '',
      isDefault: true
    }].filter(addr => addr.district && addr.city) // Only include if has address data

    return NextResponse.json({
      success: true,
      data: addresses
    })

  } catch (error) {
    console.error('Error fetching user addresses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createUserAddress(req: AuthenticatedRequest) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Check rate limiting
    if (!checkRateLimit(`create_address_${userId}`, 5, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { 
      firstName, 
      lastName, 
      phone, 
      district, 
      city, 
      nationalAddress,
      isDefault = false 
    } = body

    // Validation
    if (!firstName || !lastName || !phone || !district || !city) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Validate national address format if provided
    if (nationalAddress && !validateNationalAddress(nationalAddress)) {
      return NextResponse.json(
        { error: 'Invalid national address format. Must be 4 letters followed by 4 numbers (e.g., JESA3591)' },
        { status: 400 }
      )
    }

    const authToken = req.headers.get('Authorization')?.replace('Bearer ', '') || ''
    
    // Call backend API to update user profile with address data
    const response = await makeAuthenticatedRequest(
      `/auth/profile`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: `${sanitizeInput(firstName)} ${sanitizeInput(lastName)}`.trim(),
          phone: sanitizeInput(phone),
          district: sanitizeInput(district),
          city: sanitizeInput(city),
          nationalAddress: nationalAddress ? sanitizeInput(nationalAddress).toUpperCase() : ''
        })
      },
      authToken
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: response.status }
      )
    }

    const userData = await response.json()
    
    // Return the updated address data
    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      data: {
        id: userData.user?._id || userData.user?.id,
        firstName: sanitizeInput(firstName),
        lastName: sanitizeInput(lastName),
        phone: sanitizeInput(phone),
        district: sanitizeInput(district),
        city: sanitizeInput(city),
        country: 'Saudi Arabia',
        nationalAddress: nationalAddress ? sanitizeInput(nationalAddress).toUpperCase() : '',
        isDefault: true
      }
    })

  } catch (error) {
    console.error('Error creating user address:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getUserAddresses)
export const POST = withAuth(createUserAddress)
