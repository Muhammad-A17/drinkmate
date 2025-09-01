import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, orderId, customerEmail, customerName } = body

         const payload = {
       merchantID: 'e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d',
       amount: amount || 100,
       currency: 'SAR',
       orderID: orderId || `TEST_${Date.now()}`,
       customerEmail: customerEmail || 'test@example.com',
       customerName: customerName || 'Test Customer',
       description: 'Test payment for DrinkMate',
       returnURL: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}`,
       cancelURL: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel?orderId=${orderId}`,
       terminalID: 'aqualinesa',
       password: 'URWAY@026_a',
       action: '1', // 1 for payment
       trackID: `TRACK_${Date.now()}`,
       udf1: 'DrinkMate',
       udf2: orderId,
       udf3: customerEmail
     }

    console.log('Urways Test Payload:', payload)

    const response = await fetch('https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    console.log('Urways Test Response:', data)

    if (data.result === 'SUCCESS' || data.result === 'A') {
      return NextResponse.json({
        success: true,
        transactionId: data.transactionID || data.payid,
        paymentUrl: data.targetURL || data.paymentURL,
        response: data
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.errorText || data.errorMessage || 'Payment initiation failed',
        response: data
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Urways test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Payment service unavailable',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
