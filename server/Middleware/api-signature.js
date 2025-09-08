const crypto = require('crypto');
const hmac = require('crypto');

class APISignatureValidator {
  constructor() {
    this.allowedAlgorithms = ['sha256', 'sha512'];
    this.signatureTimeout = 5 * 60 * 1000; // 5 minutes
    this.nonceCache = new Map(); // Prevent replay attacks
  }

  // Generate API signature
  generateSignature(data, secret, timestamp, nonce) {
    const payload = this.createPayload(data, timestamp, nonce);
    const signature = hmac.createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return {
      signature,
      timestamp,
      nonce,
      algorithm: 'sha256'
    };
  }

  // Create payload for signing
  createPayload(data, timestamp, nonce) {
    const sortedData = this.sortObjectKeys(data);
    const dataString = JSON.stringify(sortedData);
    return `${timestamp}:${nonce}:${dataString}`;
  }

  // Sort object keys for consistent signing
  sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = this.sortObjectKeys(obj[key]);
    });

    return sorted;
  }

  // Validate API signature
  validateSignature(req, res, next) {
    try {
      const signature = req.headers['x-api-signature'];
      const timestamp = req.headers['x-timestamp'];
      const nonce = req.headers['x-nonce'];
      const algorithm = req.headers['x-algorithm'] || 'sha256';

      // Check required headers
      if (!signature || !timestamp || !nonce) {
        return res.status(401).json({
          error: 'Missing required signature headers',
          code: 'MISSING_SIGNATURE_HEADERS',
          required: ['x-api-signature', 'x-timestamp', 'x-nonce']
        });
      }

      // Validate algorithm
      if (!this.allowedAlgorithms.includes(algorithm)) {
        return res.status(400).json({
          error: 'Unsupported signature algorithm',
          code: 'UNSUPPORTED_ALGORITHM',
          allowed: this.allowedAlgorithms
        });
      }

      // Check timestamp (prevent replay attacks)
      const now = Date.now();
      const requestTime = parseInt(timestamp);
      
      if (isNaN(requestTime) || Math.abs(now - requestTime) > this.signatureTimeout) {
        return res.status(401).json({
          error: 'Request timestamp is invalid or expired',
          code: 'INVALID_TIMESTAMP',
          maxAge: this.signatureTimeout
        });
      }

      // Check nonce (prevent replay attacks)
      if (this.nonceCache.has(nonce)) {
        return res.status(401).json({
          error: 'Nonce already used (replay attack detected)',
          code: 'NONCE_REPLAY_DETECTED'
        });
      }

      // Get API secret (from environment or database)
      const apiSecret = this.getAPISecret(req);
      if (!apiSecret) {
        return res.status(401).json({
          error: 'API secret not found',
          code: 'API_SECRET_NOT_FOUND'
        });
      }

      // Verify signature
      const expectedSignature = this.generateSignature(
        req.body, 
        apiSecret, 
        timestamp, 
        nonce
      );

      if (!crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature.signature, 'hex')
      )) {
        return res.status(401).json({
          error: 'Invalid API signature',
          code: 'INVALID_SIGNATURE'
        });
      }

      // Store nonce to prevent replay
      this.nonceCache.set(nonce, now);
      
      // Clean up old nonces (older than 10 minutes)
      this.cleanupNonces();

      next();
    } catch (error) {
      console.error('API signature validation error:', error);
      res.status(500).json({
        error: 'Signature validation failed',
        code: 'SIGNATURE_VALIDATION_FAILED'
      });
    }
  }

  // Get API secret for the request
  getAPISecret(req) {
    // Try to get from API key header
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      // In production, this should be looked up from database
      // For now, use environment variable
      return process.env.API_SECRET || process.env.JWT_SECRET;
    }

    // Fallback to default secret
    return process.env.API_SECRET || process.env.JWT_SECRET;
  }

  // Clean up old nonces
  cleanupNonces() {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    for (const [nonce, timestamp] of this.nonceCache.entries()) {
      if (now - timestamp > maxAge) {
        this.nonceCache.delete(nonce);
      }
    }
  }

  // Generate nonce
  generateNonce() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Generate timestamp
  generateTimestamp() {
    return Date.now().toString();
  }
}

const apiSignatureValidator = new APISignatureValidator();

// Middleware for API signature validation
const validateAPISignature = (req, res, next) => {
  // Skip signature validation for certain endpoints
  const skipPaths = ['/health', '/status', '/metrics'];
  if (skipPaths.includes(req.path)) {
    return next();
  }

  // Skip for development if not explicitly enabled
  if (process.env.NODE_ENV === 'development' && 
      process.env.ENABLE_API_SIGNATURES !== 'true') {
    return next();
  }

  return apiSignatureValidator.validateSignature(req, res, next);
};

// Middleware for generating API signatures (for testing)
const generateAPISignature = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const secret = process.env.API_SECRET || process.env.JWT_SECRET;
    const timestamp = apiSignatureValidator.generateTimestamp();
    const nonce = apiSignatureValidator.generateNonce();
    
    const signatureData = apiSignatureValidator.generateSignature(
      req.body, 
      secret, 
      timestamp, 
      nonce
    );

    // Add signature headers to request
    req.headers['x-api-signature'] = signatureData.signature;
    req.headers['x-timestamp'] = signatureData.timestamp;
    req.headers['x-nonce'] = signatureData.nonce;
    req.headers['x-algorithm'] = signatureData.algorithm;
  }

  next();
};

// API key validation middleware
const validateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      code: 'MISSING_API_KEY'
    });
  }

  // In production, validate against database
  // For now, use environment variable
  const validAPIKeys = (process.env.VALID_API_KEYS || '').split(',');
  
  if (!validAPIKeys.includes(apiKey)) {
    return res.status(401).json({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }

  next();
};

module.exports = {
  validateAPISignature,
  generateAPISignature,
  validateAPIKey,
  apiSignatureValidator
};
