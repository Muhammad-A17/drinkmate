import { NextRequest, NextResponse } from 'next/server'
import { addSecurityHeaders, logError, sanitizeErrorMessage } from '@/lib/api/protected-api'
import crypto from 'crypto'

// URWAYS Configuration
const URWAYS_CONFIG = {
  terminalId: process.env.URWAYS_TERMINAL_ID || 'aqualinesa',
  terminalPassword: process.env.URWAYS_TERMINAL_PASSWORD || 'URWAY@026_a',
  merchantKey: process.env.URWAYS_MERCHANT_KEY || 'e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d',
  apiUrl: process.env.URWAYS_API_URL || 'https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest'
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
    console.log('🚀 Creating URWAYS payment request from server...')
    
    // Verify this is a server-side request
    const userAgent = request.headers.get('user-agent') || ''
    const origin = request.headers.get('origin') || ''
    
    console.log('🔍 Server-side validation:', {
      userAgent: userAgent.substring(0, 50) + '...',
      origin: origin,
      isServerRequest: !origin.includes('localhost') && origin.includes('vercel.app')
    })
    
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
    
    // Debug log the received data
    console.log('🚀 URWAYS API - Received payment request:', {
      amount,
      currency,
      orderId,
      customerEmail,
      customerName,
      hasAmount: !!amount,
      hasCurrency: !!currency,
      hasOrderId: !!orderId,
      hasCustomerEmail: !!customerEmail,
      hasCustomerName: !!customerName
    })

    // Validate required fields
    if (!amount || !currency || !orderId || !customerEmail || !customerName) {
      console.error('🚀 URWAYS API - Validation failed:', {
        amount: amount || 'MISSING',
        currency: currency || 'MISSING',
        orderId: orderId || 'MISSING',
        customerEmail: customerEmail || 'MISSING',
        customerName: customerName || 'MISSING'
      })
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: amount, currency, orderId, customerEmail, customerName are required',
          debug: {
            hasAmount: !!amount,
            hasCurrency: !!currency,
            hasOrderId: !!orderId,
            hasCustomerEmail: !!customerEmail,
            hasCustomerName: !!customerName
          }
        },
        { status: 400 }
      ))
    }
    
    // Validate amount
    if (amount <= 0) {
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: 'Invalid amount: amount must be greater than 0'
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

    // Get the actual server IP from Vercel headers or use a valid IP
    const merchantIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '8.8.8.8' // Fallback to a valid public IP

    // Prepare URWAYS request payload - try different format
    const urwaysRequest = {
      terminalId: URWAYS_CONFIG.terminalId,
      password: URWAYS_CONFIG.terminalPassword,
      action: '1', // 1 for payment
      trackid: trackid.toLowerCase(),
      amount: amount.toFixed(2),
      currency: currency,
      customerEmail: customerEmail,
      merchantIp: merchantIp,
      country: 'SA',
      requestHash: generateHash(trackid, amount, currency),
      // Required customer details
      firstName: customerName.split(' ')[0] || 'Customer',
      lastName: customerName.split(' ').slice(1).join(' ') || 'Name',
      address: 'Saudi Arabia',
      city: 'Riyadh',
      state: 'Riyadh',
      zip: '12345',
      phoneno: '966500000000',
      // User defined fields
      udf1: orderId,
      udf2: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://drinkmate-ruddy.vercel.app'}/payment/success?orderId=${orderId}`,
      udf3: 'EN',
      udf4: description || 'DrinkMate Order Payment',
      udf5: JSON.stringify(items)
    }

    console.log('🚀 URWAYS Payment Request:', {
      terminalId: URWAYS_CONFIG.terminalId,
      amount: urwaysRequest.amount,
      currency: urwaysRequest.currency,
      trackid: urwaysRequest.trackid,
      customerEmail: urwaysRequest.customerEmail,
      merchantIp: merchantIp,
      orderId: urwaysRequest.udf1
    })
    
    console.log('🔍 Environment Check:', {
      NODE_ENV: process.env.NODE_ENV,
      URWAYS_TERMINAL_ID: process.env.URWAYS_TERMINAL_ID ? 'SET' : 'NOT SET',
      URWAYS_TERMINAL_PASSWORD: process.env.URWAYS_TERMINAL_PASSWORD ? 'SET' : 'NOT SET',
      URWAYS_MERCHANT_KEY: process.env.URWAYS_MERCHANT_KEY ? 'SET' : 'NOT SET',
      URWAYS_API_URL: process.env.URWAYS_API_URL ? 'SET' : 'NOT SET'
    })
    
    console.log('🚀 Full URWAYS Request:', JSON.stringify(urwaysRequest, null, 2))

    // Make API call to URWAYS from server
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    let response
    try {
      console.log('🚀 Making request to URWAYS API:', URWAYS_CONFIG.apiUrl)
      response = await fetch(URWAYS_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'DrinkMate-Server/1.0',
          'X-Forwarded-For': merchantIp,
          'X-Real-IP': merchantIp
        },
        body: JSON.stringify(urwaysRequest),
        signal: controller.signal
      })
      
      console.log('🚀 URWAYS API Response Status:', response.status, response.statusText)

      // Clear timeout if request completes successfully
      clearTimeout(timeoutId)
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('URWAYS API Timeout:', 'Request timed out after 30 seconds')
        return addSecurityHeaders(NextResponse.json(
          { 
            success: false, 
            message: 'Payment request timed out',
            error: 'Request timeout - please try again'
          },
          { status: 408 }
        ))
      }
      console.error('URWAYS API Network Error:', error)
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: 'Payment service unavailable',
          error: 'Network error - please try again later'
        },
        { status: 503 }
      ))
    }

    if (!response.ok) {
      console.error('URWAYS API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: URWAYS_CONFIG.apiUrl
      })
      throw new Error(`URWAYS API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result) {
      throw new Error('Empty response from URWAYS API')
    }

    console.log('🚀 URWAYS Payment Response:', result)
    console.log('🚀 URWAYS Response Details:', {
      result: result.result,
      responseCode: result.responseCode,
      errorText: result.errorText,
      errorMessage: result.errorMessage,
      reason: result.reason
    })

    // Check response according to URWAYS API documentation
    if (result.result === 'SUCCESS' || result.result === 'Successful' || result.result === 'A') {
      return addSecurityHeaders(NextResponse.json({
        success: true,
        data: {
          paymentUrl: result.targetURL || result.paymentURL || result.targetUrl || result.intUrl, // Payment URL
          transactionId: result.transactionID || result.payid || result.tranid, // URWAY transaction ID
          trackId: result.trackID || result.trackid || orderId, // Our order ID
          message: 'Payment URL generated successfully',
          // Additional response data
          authCode: result.authcode,
          cardBrand: result.cardBrand,
          maskedPAN: result.maskedPAN,
          amount: result.amount
        }
      }))
    } else {
      // Handle error response
      const errorMessage = result.errorText || result.errorMessage || result.reason || getErrorMessage(result.responseCode) || 'Payment initiation failed'
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: 'Payment request failed',
          error: errorMessage,
          responseCode: result.responseCode,
          response: result // Include full response for debugging
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
        'Accept': 'application/json',
        'User-Agent': 'DrinkMate-Server/1.0',
        'X-Forwarded-For': '8.8.8.8',
        'X-Real-IP': '8.8.8.8'
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