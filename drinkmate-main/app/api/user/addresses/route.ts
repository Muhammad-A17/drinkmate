import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { makeAuthenticatedRequest, handleBackendResponse, checkRateLimit, sanitizeInput, validateNationalAddress } from '@/lib/protected-api'

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
    
    // Call backend API to get user addresses
    const response = await makeAuthenticatedRequest(
      `/user/addresses`,
      { method: 'GET' },
      authToken
    )

    return await handleBackendResponse(response)

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
    
    // Call backend API to create address
    const response = await makeAuthenticatedRequest(
      `/user/addresses`,
      {
        method: 'POST',
        body: JSON.stringify({
          firstName: sanitizeInput(firstName),
          lastName: sanitizeInput(lastName),
          phone: sanitizeInput(phone),
          district: sanitizeInput(district),
          city: sanitizeInput(city),
          country: 'Saudi Arabia',
          nationalAddress: nationalAddress ? sanitizeInput(nationalAddress).toUpperCase() : '',
          isDefault
        })
      },
      authToken
    )

    return await handleBackendResponse(response)

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
