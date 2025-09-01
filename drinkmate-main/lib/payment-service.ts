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
  // Urways Payment Integration
  async processUrwaysPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const baseUrl = 'https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest'

             const payload = {
         merchantID: process.env.URWAYS_MERCHANT_ID || 'e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d',
         amount: request.amount,
         currency: request.currency || 'SAR',
         orderID: request.orderId,
         customerEmail: request.customerEmail,
         customerName: request.customerName,
         description: request.description,
         returnURL: request.returnUrl,
         cancelURL: request.cancelUrl,
         terminalID: process.env.URWAYS_TERMINAL_ID || 'aqualinesa',
         password: process.env.URWAYS_PASSWORD || 'URWAY@026_a',
         action: '1', // 1 for payment
         trackID: `TRACK_${Date.now()}`,
         udf1: 'DrinkMate',
         udf2: request.orderId,
         udf3: request.customerEmail
       }

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.result === 'SUCCESS' || data.result === 'A') {
        return {
          success: true,
          transactionId: data.transactionID || data.payid,
          paymentUrl: data.targetURL || data.paymentURL
        }
      } else {
        return {
          success: false,
          error: data.errorText || data.errorMessage || 'Payment initiation failed'
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
    const baseUrl = 'https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest'

         const payload = {
       merchantID: process.env.URWAYS_MERCHANT_ID || 'e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d',
       action: '8', // 8 for inquiry
       trackID: transactionId,
       terminalID: process.env.URWAYS_TERMINAL_ID || 'aqualinesa',
       password: process.env.URWAYS_PASSWORD || 'URWAY@026_a'
     }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    return {
      success: data.result === 'SUCCESS' || data.result === 'A',
      transactionId: data.transactionID || transactionId
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
