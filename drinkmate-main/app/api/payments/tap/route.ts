import { NextRequest, NextResponse } from 'next/server'
import paymentService from '@/lib/services/payment-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, orderId, customerEmail, customerName, description } = body

    const paymentRequest = {
      amount,
      currency: currency || 'SAR',
      orderId,
      customerEmail,
      customerName,
      description,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?orderId=${orderId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel?orderId=${orderId}`
    }

    const response = await paymentService.processTapPayment(paymentRequest)

    if (response.success) {
      return NextResponse.json({
        success: true,
        transactionId: response.transactionId,
        paymentUrl: response.paymentUrl
      })
    } else {
      return NextResponse.json({
        success: false,
        error: response.error
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Tap payment API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Payment processing failed'
    }, { status: 500 })
  }
}
