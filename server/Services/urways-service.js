const axios = require('axios');
const crypto = require('crypto');

class UrwaysService {
    constructor() {
        this.terminalId = process.env.URWAYS_TERMINAL_ID || 'aqualinesa';
        this.password = process.env.URWAYS_TERMINAL_PASSWORD?.replace(/^["']|["']$/g, '') || 'URWAY@026_a';
        this.merchantKey = process.env.URWAYS_MERCHANT_KEY || 'e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d';
        this.apiUrl = process.env.URWAYS_API_URL || 'https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest';
        this.environment = process.env.URWAYS_ENVIRONMENT || 'production';
        
        // Set base URL based on environment
        this.baseUrl = this.environment === 'production' 
            ? 'https://payments.urway-tech.com' 
            : 'https://payments-dev.urway-tech.com';
    }

    /**
     * Generate signature for Urways API requests
     */
    generateSignature(data) {
        const sortedKeys = Object.keys(data).sort();
        const signatureString = sortedKeys
            .map(key => `${key}=${data[key]}`)
            .join('&');
        
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(signatureString)
            .digest('hex');
    }

    /**
     * Process payment with Urways
     */
    async processPayment(paymentData) {
        try {
            const {
                amount,
                currency = 'SAR',
                orderId,
                customerEmail,
                customerName,
                description,
                returnUrl,
                cancelUrl
            } = paymentData;

            // Validate required fields
            if (!amount || !orderId || !customerEmail) {
                throw new Error('Missing required payment data');
            }

            // Prepare payment request for Urways API (matching frontend structure)
            const trackid = `TXN_${orderId}`.toLowerCase();
            const paymentRequest = {
                merchantID: this.merchantKey,
                amount: amount.toFixed(2),
                currency: currency,
                orderID: orderId,
                customerEmail: customerEmail,
                customerName: customerName || '',
                description: description || `DrinkMate Order ${orderId}`,
                returnURL: returnUrl || `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`,
                cancelURL: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel?orderId=${orderId}`,
                terminalID: this.terminalId,
                password: this.password,
                action: '1', // 1 for payment
                trackID: trackid.toUpperCase(),
                udf1: 'DrinkMate',
                udf2: orderId,
                udf3: customerEmail
            };

            // Generate signature
            paymentRequest.signature = this.generateSignature(paymentRequest);

            console.log('Urways Payment Request:', {
                ...paymentRequest,
                password: '***' // Don't log password
            });

            // Make API call to Urways
            const response = await axios.post(
                this.apiUrl,
                paymentRequest,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 30000
                }
            );

            console.log('Urways API Response:', response.data);

            if (response.data && (response.data.result === 'SUCCESS' || response.data.result === 'A')) {
                return {
                    success: true,
                    transactionId: response.data.transactionID || response.data.payid,
                    paymentUrl: response.data.targetURL || response.data.paymentURL,
                    referenceId: response.data.referenceID
                };
            } else {
                console.log('Urways API Error Response:', response.data);
                console.log('Response Status:', response.status);
                console.log('Response Headers:', response.headers);
                throw new Error(response.data?.errorText || response.data?.errorMessage || response.data?.responseMessage || 'Payment initiation failed');
            }

        } catch (error) {
            console.error('Urways payment error:', error);
            
            if (error.response) {
                // API error response
                return {
                    success: false,
                    error: error.response.data?.message || 'Payment processing failed',
                    code: error.response.data?.code || 'PAYMENT_ERROR'
                };
            } else if (error.request) {
                // Network error
                return {
                    success: false,
                    error: 'Unable to connect to payment gateway',
                    code: 'NETWORK_ERROR'
                };
            } else {
                // Other error
                return {
                    success: false,
                    error: error.message || 'Payment processing failed',
                    code: 'UNKNOWN_ERROR'
                };
            }
        }
    }

    /**
     * Verify payment status with Urways
     */
    async verifyPayment(transactionId) {
        try {
            const verificationRequest = {
                merchantID: this.merchantId,
                terminalID: this.terminalId,
                password: this.password,
                action: '8', // 8 for inquiry
                trackID: transactionId
            };

            // Generate signature
            verificationRequest.signature = this.generateSignature(verificationRequest);

            const response = await axios.post(
                `${this.baseUrl}/URWAYPGService/transaction/jsonProcess/JSONrequest`,
                verificationRequest,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 30000
                }
            );

            if (response.data && (response.data.result === 'SUCCESS' || response.data.result === 'A')) {
                return {
                    success: true,
                    status: response.data.result,
                    amount: response.data.amount ? parseFloat(response.data.amount) / 100 : 0, // Convert from halalas
                    currency: response.data.currency,
                    transactionId: response.data.transactionID || transactionId,
                    referenceId: response.data.referenceID,
                    paymentDate: response.data.paymentDate,
                    isPaid: response.data.result === 'SUCCESS' || response.data.result === 'A'
                };
            } else {
                return {
                    success: false,
                    error: response.data?.errorText || response.data?.errorMessage || 'Payment verification failed'
                };
            }

        } catch (error) {
            console.error('Urways verification error:', error);
            return {
                success: false,
                error: error.message || 'Payment verification failed'
            };
        }
    }

    /**
     * Handle payment callback from Urways
     */
    async handleCallback(callbackData) {
        try {
            const {
                transactionId,
                status,
                amount,
                currency,
                referenceId,
                signature
            } = callbackData;

            // Verify signature
            const expectedSignature = this.generateSignature({
                transactionId,
                status,
                amount,
                currency,
                referenceId
            });

            if (signature !== expectedSignature) {
                throw new Error('Invalid signature');
            }

            return {
                success: true,
                transactionId,
                status,
                amount: parseFloat(amount) / 100, // Convert from halalas
                currency,
                referenceId,
                isPaid: status === 'SUCCESS' || status === 'COMPLETED'
            };

        } catch (error) {
            console.error('Urways callback error:', error);
            return {
                success: false,
                error: error.message || 'Callback processing failed'
            };
        }
    }

    /**
     * Refund payment
     */
    async refundPayment(transactionId, amount, reason = 'Customer request') {
        try {
            const refundRequest = {
                merchantID: this.merchantId,
                terminalID: this.terminalId,
                password: this.password,
                action: '3', // 3 for refund
                trackID: transactionId,
                amount: (amount * 100).toString(), // Convert to halalas
                reason: reason
            };

            // Generate signature
            refundRequest.signature = this.generateSignature(refundRequest);

            const response = await axios.post(
                `${this.baseUrl}/URWAYPGService/transaction/jsonProcess/JSONrequest`,
                refundRequest,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 30000
                }
            );

            if (response.data && (response.data.result === 'SUCCESS' || response.data.result === 'A')) {
                return {
                    success: true,
                    refundId: response.data.refundID || response.data.transactionID,
                    amount: response.data.amount ? parseFloat(response.data.amount) / 100 : amount,
                    status: response.data.result
                };
            } else {
                throw new Error(response.data?.errorText || response.data?.errorMessage || 'Refund failed');
            }

        } catch (error) {
            console.error('Urways refund error:', error);
            return {
                success: false,
                error: error.message || 'Refund processing failed'
            };
        }
    }

    /**
     * Get payment methods available
     */
    getAvailablePaymentMethods() {
        return [
            {
                id: 'urways',
                name: 'Urways Payment',
                description: 'Pay with credit/debit card via Urways',
                icon: 'credit-card',
                supportedCards: ['visa', 'mastercard', 'mada']
            }
        ];
    }
}

module.exports = new UrwaysService();
