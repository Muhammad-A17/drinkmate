// URWAYS Payment Gateway Integration
// Based on the provided credentials and documentation

export interface UrwaysConfig {
  terminalId: string
  terminalPassword: string
  merchantKey: string
  apiUrl: string
  redirectUrl: string
  cancelUrl: string
}

export interface UrwaysPaymentRequest {
  amount: number
  currency: string
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  description?: string
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
}

export interface UrwaysPaymentResponse {
  success: boolean
  paymentUrl?: string
  transactionId?: string
  error?: string
  message?: string
}

// Default URWAYS configuration
const DEFAULT_URWAYS_CONFIG: UrwaysConfig = {
  terminalId: 'aqualinesa',
  terminalPassword: 'urway@123',
  merchantKey: '57346489046e409862696090e9ed52dc06192f6ab714178d22f49a93277df34f',
  apiUrl: 'https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest',
  redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/payment/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/payment/cancel`
}

export class UrwaysPaymentService {
  private config: UrwaysConfig

  constructor(config?: Partial<UrwaysConfig>) {
    this.config = { ...DEFAULT_URWAYS_CONFIG, ...config }
  }

  /**
   * Generate payment request for URWAYS
   */
  async createPaymentRequest(paymentData: UrwaysPaymentRequest): Promise<UrwaysPaymentResponse> {
    try {
      const {
        amount,
        currency = 'SAR',
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        description = 'Drinkmate Order Payment',
        items = []
      } = paymentData

      // Validate required fields
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount')
      }
      if (!orderId) {
        throw new Error('Order ID is required')
      }
      if (!customerName || !customerEmail) {
        throw new Error('Customer name and email are required')
      }

      // Call the frontend API which will handle the backend communication
      const response = await fetch('/api/payments/urways', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
        throw new Error(errorData.message || 'Payment request failed')
      }

      const result = await response.json()

      if (result.success) {
        return {
          success: true,
          paymentUrl: result.data.paymentUrl,
          transactionId: result.data.transactionId,
          message: result.data.message || 'Payment URL generated successfully'
        }
      } else {
        return {
          success: false,
          error: result.message || 'Payment request failed',
          message: result.message || 'Failed to create payment request'
        }
      }

    } catch (error) {
      console.error('🚀 URWAYS Payment Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to process payment request'
      }
    }
  }

  /**
   * Verify payment status with URWAYS
   */
  async verifyPayment(transactionId: string): Promise<UrwaysPaymentResponse> {
    try {
      const verifyRequest = {
        terminalId: this.config.terminalId,
        password: this.config.terminalPassword,
        action: '10', // 10 for payment status inquiry
        trackId: transactionId,
        requestHash: this.generateHash(transactionId, 0, 'SAR')
      }

      const response = await fetch(this.config.apiUrl, {
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
        return {
          success: true,
          transactionId: transactionId,
          message: 'Payment verified successfully'
        }
      } else {
        return {
          success: false,
          error: result.responseMessage || 'Payment verification failed',
          message: result.responseMessage || 'Payment not found or failed'
        }
      }

    } catch (error) {
      console.error('🚀 URWAYS Verification Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to verify payment'
      }
    }
  }

  /**
   * Generate hash for URWAYS API authentication
   */
  private generateHash(trackId: string, amount: number, currency: string): string {
    const crypto = require('crypto')
    const hashString = `${this.config.terminalId}|${this.config.terminalPassword}|${trackId}|${amount}|${currency}|${this.config.merchantKey}`
    return crypto.createHash('sha256').update(hashString).digest('hex')
  }

  /**
   * Get payment form HTML for direct integration
   */
  generatePaymentForm(paymentData: UrwaysPaymentRequest): string {
    const {
      amount,
      currency = 'SAR',
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      description = 'Drinkmate Order Payment'
    } = paymentData

    const transactionId = `TXN_${orderId}_${Date.now()}`
    const hash = this.generateHash(transactionId, amount, currency)

    return `
      <form id="urways-payment-form" action="${this.config.apiUrl}" method="POST">
        <input type="hidden" name="terminalId" value="${this.config.terminalId}">
        <input type="hidden" name="password" value="${this.config.terminalPassword}">
        <input type="hidden" name="action" value="1">
        <input type="hidden" name="currency" value="${currency}">
        <input type="hidden" name="country" value="SA">
        <input type="hidden" name="amount" value="${amount.toFixed(2)}">
        <input type="hidden" name="trackId" value="${transactionId}">
        <input type="hidden" name="customerName" value="${customerName}">
        <input type="hidden" name="customerEmail" value="${customerEmail}">
        <input type="hidden" name="customerPhone" value="${customerPhone || ''}">
        <input type="hidden" name="customerAddress" value="">
        <input type="hidden" name="customerCity" value="">
        <input type="hidden" name="customerState" value="">
        <input type="hidden" name="customerCountry" value="SA">
        <input type="hidden" name="customerZipCode" value="">
        <input type="hidden" name="udf1" value="${orderId}">
        <input type="hidden" name="udf2" value="${description}">
        <input type="hidden" name="udf3" value="">
        <input type="hidden" name="udf4" value="">
        <input type="hidden" name="udf5" value="">
        <input type="hidden" name="returnUrl" value="${this.config.redirectUrl}">
        <input type="hidden" name="requestHash" value="${hash}">
      </form>
      <script>
        document.getElementById('urways-payment-form').submit();
      </script>
    `
  }
}

// Export default instance
export const urwaysPayment = new UrwaysPaymentService()

// Export utility functions
export const createUrwaysPayment = (paymentData: UrwaysPaymentRequest) => 
  urwaysPayment.createPaymentRequest(paymentData)

export const verifyUrwaysPayment = (transactionId: string) => 
  urwaysPayment.verifyPayment(transactionId)
