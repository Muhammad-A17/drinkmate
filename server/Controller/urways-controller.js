const { createErrorResponse, logError } = require('../Utils/error-handler');
const crypto = require('crypto');

// URWAYS Payment Gateway Integration
// Based on the provided credentials

const URWAYS_CONFIG = {
  terminalId: process.env.URWAYS_TERMINAL_ID || 'aqualinesa',
  terminalPassword: process.env.URWAYS_TERMINAL_PASSWORD || 'URWAY@026_a',
  merchantKey: process.env.URWAYS_MERCHANT_KEY || 'e51ef25d3448a823888e3f38f9ffcc3693a40e3590cf4bb6e7ac5b352a00f30d',
  apiUrl: process.env.URWAYS_API_URL || 'https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest' // Production environment
};

/**
 * Get error message based on URWAY response code
 * Based on official URWAY documentation error codes
 */
const getErrorMessage = (responseCode) => {
  const errorMessages = {
    '000': 'Transaction Successful',
    '601': 'System Error, Please contact System Admin',
    '659': 'Request authentication failed',
    '701': 'Error while processing ApplePay payment Token request',
    '906': 'Invalid Card Token'
  };
  
  // Handle 5XX bank rejections
  if (responseCode && responseCode.startsWith('5')) {
    return 'Bank Rejection';
  }
  
  return errorMessages[responseCode] || `Unknown error (Code: ${responseCode})`;
};

/**
 * Generate hash for URWAYS API authentication
 * Based on URWAY documentation: SHA256(terminalId|password|trackid|amount|currency|merchantKey)
 * Note: trackid should be lowercase as per documentation
 */
const generateHash = (trackid, amount, currency) => {
  // Ensure trackid is lowercase as per URWAYS documentation
  const lowerTrackid = trackid.toLowerCase();
  
  // Based on URWAY documentation: SHA256(terminalId|password|trackid|amount|currency|merchantKey)
  const hashString = `${URWAYS_CONFIG.terminalId}|${URWAYS_CONFIG.terminalPassword}|${lowerTrackid}|${amount}|${currency}|${URWAYS_CONFIG.merchantKey}`;
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
    console.log('🚀 Request body:', req.body);
    console.log('🚀 URWAYS Config:', {
      terminalId: URWAYS_CONFIG.terminalId,
      hasPassword: !!URWAYS_CONFIG.terminalPassword,
      hasMerchantKey: !!URWAYS_CONFIG.merchantKey,
      apiUrl: URWAYS_CONFIG.apiUrl
    });
    
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

    // Generate unique transaction ID (trackid as per documentation)
    const trackid = `TXN_${orderId}`;

    // Get merchant IP (required by URWAY)
    const merchantIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

    // Prepare URWAYS request payload - use the working format
    const urwaysRequest = {
      merchantID: URWAYS_CONFIG.merchantKey,
      terminalID: URWAYS_CONFIG.terminalId,
      password: URWAYS_CONFIG.terminalPassword,
      action: '1', // 1 for payment
      trackID: trackid.toUpperCase(),
      amount: amount.toFixed(2),
      currency: currency,
      orderID: orderId.toUpperCase(), // Make sure case matches
      customerEmail: customerEmail,
      customerName: customerName,
      description: description || 'DrinkMate Order Payment',
      returnURL: `${process.env.FRONTEND_URL || 'https://drinkmate-project.netlify.app'}/payment/success?orderId=${orderId}`,
      cancelURL: `${process.env.FRONTEND_URL || 'https://drinkmate-project.netlify.app'}/payment/cancel?orderId=${orderId}`,
      udf1: 'DrinkMate',
      udf2: orderId.toUpperCase(), // Make sure case matches
      udf3: customerEmail,
      // Add signature for authentication - use original trackid (function handles lowercase conversion)
      signature: generateHash(trackid, amount, currency)
    };

    console.log('🚀 URWAYS Payment Request:', {
      terminalID: URWAYS_CONFIG.terminalId,
      amount: urwaysRequest.amount,
      currency: urwaysRequest.currency,
      trackID: urwaysRequest.trackID,
      customerEmail: urwaysRequest.customerEmail,
      orderID: urwaysRequest.orderID,
      signature: urwaysRequest.signature
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

    // Check response according to official documentation
    if (result.responseCode === '000' && result.result === 'Successful') {
      res.json({
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
      });
    } else {
      // Handle error codes according to documentation
      const errorMessage = getErrorMessage(result.responseCode);
      res.status(400).json(createErrorResponse(
        'Payment request failed',
        errorMessage || result.result || 'Failed to create payment request'
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

    // Get merchant IP (required by URWAY)
    const merchantIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

    const verifyRequest = {
      trackid: transactionId, // Order ID (lowercase as per docs)
      terminalId: URWAYS_CONFIG.terminalId,
      action: '10', // 10 for Transaction inquiry
      merchantIp: merchantIp, // Required by URWAY
      password: URWAYS_CONFIG.terminalPassword,
      currency: 'SAR',
      country: 'SA',
      amount: '0.00', // For inquiry, amount can be 0
      requestHash: generateHash(transactionId, 0, 'SAR'),
      udf1: '1', // Purchase transaction type for inquiry
      udf2: '', // Callback URL
      udf3: 'EN', // Language
      udf4: '', // Additional info
      udf5: '' // Additional info
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

    // Check response according to official documentation
    if (result.responseCode === '000' && result.result === 'Successful') {
      res.json({
        success: true,
        data: {
          transactionId: result.tranid, // URWAY transaction ID
          trackId: result.trackid, // Our order ID
          status: 'completed',
          message: 'Payment verified successfully',
          // Additional response data
          authCode: result.authcode,
          cardBrand: result.cardBrand,
          maskedPAN: result.maskedPAN,
          amount: result.amount,
          tranDate: result.trandate,
          rrn: result.rrn,
          eci: result.eci
        }
      });
    } else {
      const errorMessage = getErrorMessage(result.responseCode);
      res.status(400).json(createErrorResponse(
        'Payment verification failed',
        errorMessage || result.result || 'Payment not found or failed'
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
