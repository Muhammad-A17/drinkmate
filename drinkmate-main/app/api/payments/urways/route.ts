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

console.log('🔍 URWAYS Config on startup:', {
  terminalId: URWAYS_CONFIG.terminalId,
  merchantKey: URWAYS_CONFIG.merchantKey,
  apiUrl: URWAYS_CONFIG.apiUrl,
  hasPassword: !!URWAYS_CONFIG.terminalPassword,
  envVars: {
    URWAYS_TERMINAL_ID: process.env.URWAYS_TERMINAL_ID ? 'SET' : 'NOT SET',
    URWAYS_TERMINAL_PASSWORD: process.env.URWAYS_TERMINAL_PASSWORD ? 'SET' : 'NOT SET',
    URWAYS_MERCHANT_KEY: process.env.URWAYS_MERCHANT_KEY ? 'SET' : 'NOT SET',
    URWAYS_API_URL: process.env.URWAYS_API_URL ? 'SET' : 'NOT SET'
  }
})

/**
 * Generate hash for URWAYS API authentication
 * Based on URWAY docs: SHA256(terminalId|amount|currency|orderId|customerEmail|customerName|description|returnUrl|cancelUrl|terminalId|password|action|trackId|udf1|udf2|udf3)
 */
const generateHash = (trackid: string, amount: number, currency: string, orderId: string, customerEmail: string, customerName: string, description: string, returnUrl: string, cancelUrl: string, action: string = '1'): string => {
  const normalizedAmount = Number(amount).toFixed(2)
  const hashString = `${URWAYS_CONFIG.terminalId}|${normalizedAmount}|${currency}|${orderId}|${customerEmail}|${customerName}|${description}|${returnUrl}|${cancelUrl}|${URWAYS_CONFIG.terminalId}|${URWAYS_CONFIG.terminalPassword}|${action}|${trackid.toUpperCase()}|DrinkMate|${orderId}|${customerEmail}`
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
      isServerRequest: !origin.includes('localhost') && origin.includes('drinkmate.sa')
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

    // Get the actual server IP from Netlify headers or use a valid IP
    const merchantIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '8.8.8.8' // Fallback to a valid public IP

    // Prepare URWAYS request payload using the correct format
    // Based on URWAYS official documentation - using PascalCase field names
    const urwaysRequest = {
      MerchantID: URWAYS_CONFIG.terminalId, // Use terminal ID, not merchant key
      TerminalID: URWAYS_CONFIG.terminalId,
      Password: URWAYS_CONFIG.terminalPassword,
      Action: '1', // 1 for payment initiation
      TrackID: trackid.toUpperCase(),
      Amount: Number(amount).toFixed(2),
      Currency: currency,
      OrderID: orderId,
      CustomerEmail: customerEmail,
      CustomerName: customerName,
      Description: description || 'DrinkMate Order Payment',
      ReturnURL: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://drinkmate.sa'}/payment/success?orderId=${orderId}`,
      CancelURL: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://drinkmate.sa'}/payment/cancel?orderId=${orderId}`,
      UDF1: 'DrinkMate',
      UDF2: orderId,
      UDF3: customerEmail,
      Country: 'SA', // Saudi Arabia
      MerchantIP: merchantIp,
      RequestHash: generateHash(trackid, amount, currency, orderId, customerEmail, customerName, description || 'DrinkMate Order Payment', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://drinkmate.sa'}/payment/success?orderId=${orderId}`, `${process.env.NEXT_PUBLIC_BASE_URL || 'https://drinkmate.sa'}/payment/cancel?orderId=${orderId}`, '1')
    }

    console.log('🚀 URWAYS Payment Request:', {
      terminalId: URWAYS_CONFIG.terminalId,
      amount: urwaysRequest.Amount,
      currency: urwaysRequest.Currency,
      trackId: urwaysRequest.TrackID,
      customerEmail: urwaysRequest.CustomerEmail,
      merchantIp: merchantIp,
      orderId: urwaysRequest.OrderID
    })
    
    console.log('🔍 Environment Check:', {
      NODE_ENV: process.env.NODE_ENV,
      URWAYS_TERMINAL_ID: process.env.URWAYS_TERMINAL_ID ? 'SET' : 'NOT SET',
      URWAYS_TERMINAL_PASSWORD: process.env.URWAYS_TERMINAL_PASSWORD ? 'SET' : 'NOT SET',
      URWAYS_MERCHANT_KEY: process.env.URWAYS_MERCHANT_KEY ? 'SET' : 'NOT SET',
      URWAYS_API_URL: process.env.URWAYS_API_URL ? 'SET' : 'NOT SET'
    })
    
    console.log('🔍 URWAYS Config Values:', {
      terminalId: URWAYS_CONFIG.terminalId,
      merchantKey: URWAYS_CONFIG.merchantKey,
      apiUrl: URWAYS_CONFIG.apiUrl,
      hasPassword: !!URWAYS_CONFIG.terminalPassword
    })
    
    console.log('🚀 Full URWAYS Request:', JSON.stringify(urwaysRequest, null, 2))

    // Attempt to create a URWAYS payment session via JSON API, then return hosted form URL
    let urwaysResponse: any = null
    try {
      const response = await fetch(URWAYS_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'DrinkMate-Server/1.0',
          'X-Forwarded-For': merchantIp,
          'X-Real-IP': merchantIp
        },
        body: JSON.stringify(urwaysRequest)
      })

      if (!response.ok) {
        throw new Error(`HTTP error from URWAYS API: ${response.status}`)
      }
      urwaysResponse = await response.json()
      console.log('✅ URWAYS API response:', urwaysResponse)
    } catch (e) {
      console.error('❌ URWAYS API call failed:', e)
      return addSecurityHeaders(NextResponse.json({
          success: false, 
        message: 'Payment initiation failed',
        response: urwaysResponse,
        error: sanitizeErrorMessage(e instanceof Error ? e.message : 'Unknown error'),
        responseCode: urwaysResponse?.responseCode
      }, { status: 502 }))
    }

    // If URWAYS returns a payment id (e.g., PaymentId or paymentId), build hosted form URL
    const paymentId = urwaysResponse?.paymentId || urwaysResponse?.PaymentId || urwaysResponse?.tranid || urwaysResponse?.TranId
    if (paymentId) {
      // Use the correct URAYS hosted form URL format
      const paymentUrl = `https://payments.urway-tech.com/URWAYPGService/direct.jsp?paymentid=${paymentId}`
      console.log('✅ Generated URAYS payment URL:', paymentUrl)
      return addSecurityHeaders(NextResponse.json({
        success: true,
        data: {
          paymentUrl,
          transactionId: paymentId,
          trackId: urwaysRequest.TrackID,
          amount,
          orderId: urwaysRequest.OrderID
        }
      }))
    }

    // If URWAYS returns failure, bubble up details
    return addSecurityHeaders(NextResponse.json({
      success: false,
      message: getErrorMessage(urwaysResponse?.responseCode) || 'Payment initiation failed',
      response: urwaysResponse,
      responseCode: urwaysResponse?.responseCode
    }, { status: 400 }))

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
      requestHash: generateHash(transactionId.toLowerCase(), 0, 'SAR', transactionId, 'test@test.com', 'Test User', 'Payment Verification', 'https://drinkmate.sa/success', 'https://drinkmate.sa/cancel')
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