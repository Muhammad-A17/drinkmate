import { NextRequest, NextResponse } from 'next/server'
import { addSecurityHeaders, logError, sanitizeErrorMessage } from '@/lib/api/protected-api'
import { urwaysPayment } from '@/lib/urways-payment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      amount,
      currency = 'SAR',
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      description,
      items
    } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: 'Invalid amount',
          error: 'Amount must be greater than 0'
        },
        { status: 400 }
      ))
    }

    if (!orderId) {
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: 'Order ID is required',
          error: 'Order ID cannot be empty'
        },
        { status: 400 }
      ))
    }

    if (!customerName || !customerEmail) {
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: 'Customer name and email are required',
          error: 'Customer information is incomplete'
        },
        { status: 400 }
      ))
    }

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization')
    console.log('🔐 Frontend API - Auth Header:', authHeader ? 'Present' : 'Missing')
    
    // Call backend URWAYS API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    console.log('🔐 Frontend API - Calling backend:', `${backendUrl}/payments/urways`)
    
    const response = await fetch(`${backendUrl}/payments/urways`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify({
        amount,
        currency,
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        description,
        items
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: errorData.message || 'Payment request failed',
          error: errorData.error || 'Backend payment service error'
        },
        { status: response.status }
      ))
    }

    const data = await response.json()
    
    return addSecurityHeaders(NextResponse.json({
      success: true,
      data: data.data || data
    }))

  } catch (error) {
    logError(error, 'UrwaysPaymentAPI')
    return addSecurityHeaders(NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: sanitizeErrorMessage(error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    ))
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')

    if (!transactionId) {
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: 'Transaction ID is required',
          error: 'Transaction ID parameter is missing'
        },
        { status: 400 }
      ))
    }

    // Verify payment
    const verificationResult = await urwaysPayment.verifyPayment(transactionId)

    if (verificationResult.success) {
      return addSecurityHeaders(NextResponse.json({
        success: true,
        data: {
          transactionId: verificationResult.transactionId,
          status: 'verified',
          message: verificationResult.message
        }
      }))
    } else {
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: verificationResult.message || 'Payment verification failed',
          error: verificationResult.error
        },
        { status: 400 }
      ))
    }

  } catch (error) {
    logError(error, 'UrwaysVerificationAPI')
    return addSecurityHeaders(NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: sanitizeErrorMessage(error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    ))
  }
}
