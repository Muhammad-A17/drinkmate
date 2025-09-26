// Payment Service for DrinkMate - Urways & Tap Payment Integration

export interface PaymentRequest {
  amount: number
  currency: string
  orderId: string
  customerEmail: string
  customerName: string
  description: string
  returnUrl: string
  cancelUrl: string
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  error?: string
}

class PaymentService {
  // Urways Payment Integration - Now calls frontend API route (no auth required)
  async processUrwaysPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Use the frontend API route which handles Urways directly
      const response = await fetch('/api/payments/urways', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          transactionId: data.transactionId,
          paymentUrl: data.paymentUrl
        }
      } else {
        return {
          success: false,
          error: data.message || 'Payment initiation failed'
        }
      }
    } catch (error) {
      console.error('Urways payment error:', error)
      return {
        success: false,
        error: 'Payment service unavailable'
      }
    }
  }

  // Tap Payment Integration
  async processTapPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://api.tap.company' 
        : 'https://sandbox-api.tap.company'

      const payload = {
        amount: request.amount,
        currency: request.currency,
        reference: {
          transaction: request.orderId
        },
        customer: {
          email: request.customerEmail,
          name: request.customerName
        },
        description: request.description,
        redirect: {
          url: request.returnUrl
        },
        post: {
          url: request.returnUrl
        }
      }

      const response = await fetch(`${baseUrl}/v2/charges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TAP_SECRET_KEY}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.status === 'INITIATED') {
        return {
          success: true,
          transactionId: data.id,
          paymentUrl: data.transaction.url
        }
      } else {
        return {
          success: false,
          error: data.message || 'Payment initiation failed'
        }
      }
    } catch (error) {
      console.error('Tap payment error:', error)
      return {
        success: false,
        error: 'Payment service unavailable'
      }
    }
  }

  // Verify Payment Status
  async verifyPayment(paymentMethod: string, transactionId: string): Promise<PaymentResponse> {
    try {
      if (paymentMethod === 'urways') {
        return await this.verifyUrwaysPayment(transactionId)
      } else if (paymentMethod === 'tap') {
        return await this.verifyTapPayment(transactionId)
      } else {
        return {
          success: false,
          error: 'Unsupported payment method'
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      return {
        success: false,
        error: 'Verification failed'
      }
    }
  }

  private async verifyUrwaysPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      // Use the frontend API route for verification
      const response = await fetch(`/api/payments/urways?transactionId=${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      return {
        success: data.success && data.isPaid,
        transactionId: data.transactionId || transactionId
      }
    } catch (error) {
      console.error('Urways verification error:', error)
      return {
        success: false,
        error: 'Verification failed'
      }
    }
  }

  private async verifyTapPayment(transactionId: string): Promise<PaymentResponse> {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.tap.company' 
      : 'https://sandbox-api.tap.company'

    const response = await fetch(`${baseUrl}/v2/charges/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TAP_SECRET_KEY}`
      }
    })

    const data = await response.json()
    return {
      success: data.status === 'CAPTURED',
      transactionId: data.id
    }
  }
}

export const paymentService = new PaymentService()
export default paymentService
