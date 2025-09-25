const { createErrorResponse, logError } = require('../Utils/error-handler');
const crypto = require('crypto');

// URWAYS Payment Gateway Integration
// Based on the provided credentials

const URWAYS_CONFIG = {
  terminalId: 'aqualinesa',
  terminalPassword: 'urway@123',
  merchantKey: '57346489046e409862696090e9ed52dc06192f6ab714178d22f49a93277df34f',
  apiUrl: 'https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest'
};

/**
 * Generate hash for URWAYS API authentication
 * Based on URWAYS documentation: SHA256(terminalId|password|trackId|amount|currency|merchantKey)
 */
const generateHash = (trackId, amount, currency) => {
  // Based on URWAYS documentation: SHA256(terminalId|password|trackId|amount|currency|merchantKey)
  const hashString = `${URWAYS_CONFIG.terminalId}|${URWAYS_CONFIG.terminalPassword}|${trackId}|${amount}|${currency}|${URWAYS_CONFIG.merchantKey}`;
  console.log('🔐 Hash String:', hashString);
  const hash = crypto.createHash('sha256').update(hashString).digest('hex');
  console.log('🔐 Generated Hash:', hash);
  return hash;
};

/**
 * Create payment request with URWAYS
 */
const createPayment = async (req, res) => {
  try {
    console.log('🚀 Creating URWAYS payment request...');
    
    const {
      amount,
      currency = 'SAR',
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      description = 'Drinkmate Order Payment',
      items = []
    } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json(createErrorResponse(
        'Invalid amount',
        'Amount must be greater than 0'
      ));
    }

    if (!orderId) {
      return res.status(400).json(createErrorResponse(
        'Order ID is required',
        'Order ID cannot be empty'
      ));
    }

    if (!customerName || !customerEmail) {
      return res.status(400).json(createErrorResponse(
        'Customer information required',
        'Customer name and email are required'
      ));
    }

    // Generate unique transaction ID
    const transactionId = `TXN_${orderId}_${Date.now()}`;

    // Prepare URWAYS request payload according to their API specification
    const urwaysRequest = {
      terminalId: URWAYS_CONFIG.terminalId,
      password: URWAYS_CONFIG.terminalPassword,
      action: '1', // 1 for payment
      currency: currency,
      country: 'SA',
      amount: amount.toFixed(2),
      trackId: transactionId,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone || '',
      customerAddress: '',
      customerCity: '',
      customerState: '',
      customerCountry: 'SA',
      customerZipCode: '',
      udf1: orderId,
      udf2: description,
      udf3: JSON.stringify(items),
      udf4: '',
      udf5: '',
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/payment/success`,
      hash: generateHash(transactionId, amount, currency)
    };

    console.log('🚀 URWAYS Payment Request:', {
      terminalId: URWAYS_CONFIG.terminalId,
      amount: urwaysRequest.amount,
      currency: urwaysRequest.currency,
      trackId: urwaysRequest.trackId,
      customerName: urwaysRequest.customerName,
      customerEmail: urwaysRequest.customerEmail,
      hash: urwaysRequest.hash
    });
    
    console.log('🚀 Full URWAYS Request:', JSON.stringify(urwaysRequest, null, 2));

    // Make API call to URWAYS
    const response = await fetch(URWAYS_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(urwaysRequest)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log('🚀 URWAYS Payment Response:', result);

    if (result.responseCode === '000') {
      res.json({
        success: true,
        data: {
          paymentUrl: result.targetUrl,
          transactionId: transactionId,
          message: 'Payment URL generated successfully'
        }
      });
    } else {
      res.status(400).json(createErrorResponse(
        'Payment request failed',
        result.responseMessage || 'Failed to create payment request'
      ));
    }

  } catch (error) {
    logError(error, 'UrwaysController');
    res.status(500).json(createErrorResponse(
      'Internal server error',
      error.message
    ));
  }
};

/**
 * Verify payment status with URWAYS
 */
const verifyPayment = async (req, res) => {
  try {
    console.log('🚀 Verifying URWAYS payment...');
    
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json(createErrorResponse(
        'Transaction ID required',
        'Transaction ID parameter is missing'
      ));
    }

    const verifyRequest = {
      terminalId: URWAYS_CONFIG.terminalId,
      password: URWAYS_CONFIG.terminalPassword,
      action: '10', // 10 for payment status inquiry
      trackId: transactionId,
      requestHash: generateHash(transactionId, 0, 'SAR')
    };

    const response = await fetch(URWAYS_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(verifyRequest)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log('🚀 URWAYS Verification Response:', result);

    if (result.responseCode === '000' && result.result === 'CAPTURED') {
      res.json({
        success: true,
        data: {
          transactionId: transactionId,
          status: 'verified',
          message: 'Payment verified successfully'
        }
      });
    } else {
      res.status(400).json(createErrorResponse(
        'Payment verification failed',
        result.responseMessage || 'Payment not found or failed'
      ));
    }

  } catch (error) {
    logError(error, 'UrwaysController');
    res.status(500).json(createErrorResponse(
      'Internal server error',
      error.message
    ));
  }
};

/**
 * Handle URWAYS callback/webhook
 */
const handleCallback = async (req, res) => {
  try {
    console.log('🚀 URWAYS Callback received:', req.body);
    
    const {
      trackId,
      result,
      responseCode,
      responseMessage,
      amount,
      currency,
      udf1 // This should contain our orderId
    } = req.body;

    if (responseCode === '000' && result === 'CAPTURED') {
      // Payment successful
      console.log('✅ Payment successful for transaction:', trackId);
      
      // Here you would typically:
      // 1. Update order status in database
      // 2. Send confirmation email
      // 3. Update inventory
      // 4. Log the transaction
      
      res.json({
        success: true,
        message: 'Payment processed successfully'
      });
    } else {
      // Payment failed
      console.log('❌ Payment failed for transaction:', trackId, responseMessage);
      
      res.json({
        success: false,
        message: 'Payment failed',
        error: responseMessage
      });
    }

  } catch (error) {
    logError(error, 'UrwaysController');
    res.status(500).json(createErrorResponse(
      'Internal server error',
      error.message
    ));
  }
};

/**
 * Refund URWAYS payment
 */
const refundPayment = async (req, res) => {
  try {
    console.log('🚀 Refunding URWAYS payment...');
    
    const { transactionId, amount, reason } = req.body;

    if (!transactionId || !amount) {
      return res.status(400).json(createErrorResponse(
        'Missing required fields',
        'Transaction ID and amount are required for refund'
      ));
    }

    // TODO: Implement actual refund logic with URWAYS API
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Refund request submitted successfully',
      refundId: `REF_${Date.now()}`,
      status: 'pending'
    });

  } catch (error) {
    logError(error, 'UrwaysController');
    res.status(500).json(createErrorResponse(
      'Internal server error',
      error.message
    ));
  }
};

module.exports = {
  createPayment,
  verifyPayment,
  handleCallback,
  refundPayment
};
