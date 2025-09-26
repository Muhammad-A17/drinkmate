import { NextRequest, NextResponse } from 'next/server'
import { addSecurityHeaders, logError, sanitizeErrorMessage } from '@/lib/api/protected-api'
import crypto from 'crypto'

// URWAYS Configuration
const URWAYS_CONFIG = {
  terminalId: 'aqualinesa',
  terminalPassword: 'URWAY@026_a',
  merchantKey: 'e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d',
  apiUrl: 'https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest'
}

/**
 * Generate hash for URWAYS API authentication
 * Based on URWAY documentation: SHA256(terminalId|password|trackid|amount|currency|merchantKey)
 * Note: trackid should be lowercase as per documentation
 */
const generateHash = (trackid: string, amount: number, currency: string): string => {
  const lowerTrackid = trackid.toLowerCase()
  const hashString = `${URWAYS_CONFIG.terminalId}|${URWAYS_CONFIG.terminalPassword}|${lowerTrackid}|${amount}|${currency}|${URWAYS_CONFIG.merchantKey}`
  console.log('🔐 Hash String:', hashString)
  const hash = crypto.createHash('sha256').update(hashString).digest('hex')
  console.log('🔐 Generated Hash:', hash)
  return hash
}

/**
 * Get error message based on URWAY response code
 */
const getErrorMessage = (responseCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    '000': 'Transaction Successful',
    '601': 'System Error, Please contact System Admin',
    '659': 'Request authentication failed',
    '701': 'Error while processing ApplePay payment Token request',
    '906': 'Invalid Card Token'
  }
  
  // Handle 5XX bank rejections
  if (responseCode && responseCode.startsWith('5')) {
    return 'Bank Rejection'
  }
  
  return errorMessages[responseCode] || `Unknown error (Code: ${responseCode})`
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating URWAYS payment request...')
    
    const body = await request.json()
    
    const {
      amount,
      currency = 'SAR',
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      description,
      items = []
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

    // Generate track ID (lowercase as per URWAY docs)
    const trackid = `TXN_${orderId}`.toLowerCase()

    // Prepare URWAYS request payload according to official documentation
    const urwaysRequest = {
      trackid: trackid,
      terminalId: URWAYS_CONFIG.terminalId,
      action: '1', // 1 for Purchase (Automatic Capture)
      customerEmail: customerEmail,
      merchantIp: '127.0.0.1', // Default IP for serverless
      country: 'SA',
      password: URWAYS_CONFIG.terminalPassword,
      currency: currency,
      amount: amount.toFixed(2),
      requestHash: generateHash(trackid, amount, currency),
      // Required customer details for SAR currency
      firstName: customerName.split(' ')[0] || 'Customer',
      lastName: customerName.split(' ').slice(1).join(' ') || 'Name',
      address: 'Saudi Arabia', // Required for SAR currency
      city: 'Riyadh', // Required for SAR currency
      state: 'Riyadh', // Required for SAR currency
      zip: '12345', // Required for SAR currency
      phoneno: customerPhone || '966500000000', // Required for SAR currency
      // User defined fields
      udf1: orderId, // Order reference
      udf2: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://drinkmate-ruddy.vercel.app'}/payment/success`, // Callback URL
      udf3: 'EN', // Language (EN/AR)
      udf4: description || 'DrinkMate Order Payment', // Payment description
      udf5: JSON.stringify(items) // Items as JSON string
    }

    console.log('🚀 URWAYS Payment Request:', {
      terminalId: URWAYS_CONFIG.terminalId,
      amount: urwaysRequest.amount,
      currency: urwaysRequest.currency,
      trackid: urwaysRequest.trackid,
      customerEmail: urwaysRequest.customerEmail,
      merchantIp: urwaysRequest.merchantIp,
      requestHash: urwaysRequest.requestHash
    })
    
    console.log('🚀 Full URWAYS Request:', JSON.stringify(urwaysRequest, null, 2))

    // Make API call to URWAYS
    const response = await fetch(URWAYS_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(urwaysRequest)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    console.log('🚀 URWAYS Payment Response:', result)

    // Check response according to official documentation
    if (result.responseCode === '000' && result.result === 'Successful') {
      return addSecurityHeaders(NextResponse.json({
        success: true,
        data: {
          paymentUrl: result.targetUrl || result.intUrl, // Payment URL
          transactionId: result.tranid, // URWAY transaction ID
          trackId: result.trackid, // Our order ID
          message: 'Payment URL generated successfully',
          // Additional response data
          authCode: result.authcode,
          cardBrand: result.cardBrand,
          maskedPAN: result.maskedPAN,
          amount: result.amount
        }
      }))
    } else {
      // Handle error codes according to documentation
      const errorMessage = getErrorMessage(result.responseCode)
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: 'Payment request failed',
          error: errorMessage || result.result || 'Failed to create payment request'
        },
        { status: 400 }
      ))
    }

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

    // Verify payment with URWAYS
    const verifyRequest = {
      terminalId: URWAYS_CONFIG.terminalId,
      password: URWAYS_CONFIG.terminalPassword,
      action: '10', // 10 for payment status inquiry
      trackId: transactionId.toLowerCase(),
      requestHash: generateHash(transactionId.toLowerCase(), 0, 'SAR')
    }

    const response = await fetch(URWAYS_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(verifyRequest)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.responseCode === '000' && result.result === 'CAPTURED') {
      return addSecurityHeaders(NextResponse.json({
        success: true,
        data: {
          transactionId: transactionId,
          status: 'verified',
          message: 'Payment verified successfully'
        }
      }))
    } else {
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: result.responseMessage || 'Payment verification failed',
          error: result.responseMessage || 'Payment not found or failed'
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