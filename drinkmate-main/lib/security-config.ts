// Security Configuration for DrinkMate
// This file contains security settings and validation rules

export const SECURITY_CONFIG = {
  // Rate limiting settings
  RATE_LIMITS: {
    // General API endpoints
    GENERAL: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
    // Authentication endpoints
    AUTH: { maxRequests: 5, windowMs: 60000 }, // 5 login attempts per minute
    // Profile updates
    PROFILE: { maxRequests: 10, windowMs: 60000 }, // 10 profile updates per minute
    // Address management
    ADDRESSES: { maxRequests: 20, windowMs: 60000 }, // 20 address operations per minute
    // Order operations
    ORDERS: { maxRequests: 30, windowMs: 60000 }, // 30 order operations per minute
    // Payment operations
    PAYMENTS: { maxRequests: 5, windowMs: 60000 }, // 5 payment attempts per minute
  },

  // Input validation rules
  VALIDATION: {
    // Name validation
    NAME: {
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\u0600-\u06FF\s]+$/, // English and Arabic letters
      message: 'Name must contain only letters and spaces (2-50 characters)'
    },
    // Email validation
    EMAIL: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    // Phone validation - Saudi phone numbers
    PHONE: {
      pattern: /^(\+966|966|0)?[5-9][0-9]{8}$/,
      message: 'Please enter a valid Saudi phone number (e.g., 0507551812, +966507551812)'
    },
    // National address validation
    NATIONAL_ADDRESS: {
      pattern: /^[A-Z]{4}[0-9]{4}$/,
      message: 'National address must be 4 letters followed by 4 numbers (e.g., JESA3591)'
    },
    // Password validation
    PASSWORD: {
      minLength: 8,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character'
    },
    // Username validation
    USERNAME: {
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: 'Username must be 3-30 characters (letters, numbers, underscore only)'
    }
  },

  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  },

  // CORS settings
  CORS: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://drinkmate.com', 'https://www.drinkmate.com']
      : ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
    optionsSuccessStatus: 200
  },

  // JWT settings
  JWT: {
    expiresIn: '2d',
    issuer: 'drinkmate-api',
    audience: 'drinkmate-client'
  },

  // Session settings
  SESSION: {
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const
  },

  // File upload settings
  FILE_UPLOAD: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 5
  },

  // API security
  API: {
    // Request size limits
    maxRequestSize: '10mb',
    // Timeout settings
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000') || 30000, // 30 seconds
    // Retry settings
    maxRetries: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3') || 3,
    retryDelay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000') || 1000 // 1 second
  }
}

// Security utility functions
export class SecurityUtils {
  // Sanitize input to prevent XSS
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000) // Limit length
  }

  // Validate input against security rules
  static validateInput(input: string, type: keyof typeof SECURITY_CONFIG.VALIDATION): boolean {
    const rules = SECURITY_CONFIG.VALIDATION[type]
    return rules.pattern.test(input) && 
           input.length >= (rules as any).minLength && 
           input.length <= (rules as any).maxLength
  }

  // Generate secure random string
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Check if request is from allowed origin
  static isAllowedOrigin(origin: string): boolean {
    return SECURITY_CONFIG.CORS.origin.includes(origin)
  }

  // Rate limiting check
  static checkRateLimit(identifier: string, endpoint: keyof typeof SECURITY_CONFIG.RATE_LIMITS): boolean {
    const limits = SECURITY_CONFIG.RATE_LIMITS[endpoint]
    // Implementation would use Redis or similar in production
    return true // Simplified for demo
  }
}

// Export security configuration
export default SECURITY_CONFIG
