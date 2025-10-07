import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withAdminAuth } from '@/lib/auth-middleware'

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    isAdmin: boolean
  }
}

// Helper function to make authenticated requests to backend
export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit,
  authToken: string
): Promise<Response> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  
  return fetch(`${backendUrl}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers
    }
  })
}

// Helper function to handle backend API responses
export async function handleBackendResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    return NextResponse.json(
      { 
        error: errorData.error || 'Backend service error',
        code: errorData.code || 'BACKEND_ERROR'
      },
      { status: response.status }
    )
  }

  const data = await response.json()
  return NextResponse.json(data)
}

// Enhanced rate limiting with different tiers for different operations
const rateLimitStore = new Map<string, { count: number; resetTime: number; blockedUntil?: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const key = identifier
  const record = rateLimitStore.get(key)

  // Check if user is temporarily blocked
  if (record?.blockedUntil && now < record.blockedUntil) {
    return false
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    // Implement progressive blocking
    const blockDuration = Math.min(record.count * 1000, 300000) // Max 5 minutes
    record.blockedUntil = now + blockDuration
    return false
  }

  record.count++
  return true
}

// Admin-specific rate limiting with stricter limits
export function checkAdminRateLimit(identifier: string, operation: string): boolean {
  const limits = {
    'user_management': { maxRequests: 20, windowMs: 60000 }, // 20 requests per minute
    'product_management': { maxRequests: 30, windowMs: 60000 }, // 30 requests per minute
    'order_management': { maxRequests: 50, windowMs: 60000 }, // 50 requests per minute
    'file_upload': { maxRequests: 10, windowMs: 60000 }, // 10 uploads per minute
    'bulk_operations': { maxRequests: 5, windowMs: 300000 }, // 5 bulk operations per 5 minutes
    'default': { maxRequests: 100, windowMs: 60000 } // 100 requests per minute for other operations
  }

  const limit = limits[operation as keyof typeof limits] || limits.default
  return checkRateLimit(`${identifier}_${operation}`, limit.maxRequests, limit.windowMs)
}

// Clean up expired rate limit records
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime && (!record.blockedUntil || now > record.blockedUntil)) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000)

// CSRF Protection
const csrfTokens = new Map<string, { token: string; expires: number }>()

export function generateCSRFToken(userId: string): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const expires = Date.now() + (30 * 60 * 1000) // 30 minutes
  
  csrfTokens.set(userId, { token, expires })
  return token
}

export function validateCSRFToken(userId: string, token: string): boolean {
  const stored = csrfTokens.get(userId)
  if (!stored || stored.expires < Date.now()) {
    csrfTokens.delete(userId)
    return false
  }
  
  return stored.token === token
}

export function cleanupCSRFTokens() {
  const now = Date.now()
  for (const [userId, tokenData] of csrfTokens.entries()) {
    if (now > tokenData.expires) {
      csrfTokens.delete(userId)
    }
  }
}

// Run CSRF cleanup every 10 minutes
setInterval(cleanupCSRFTokens, 10 * 60 * 1000)

// Input sanitization helper - Enhanced XSS protection
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/script/gi, '') // Remove script tags
    .replace(/iframe/gi, '') // Remove iframe tags
    .replace(/object/gi, '') // Remove object tags
    .replace(/embed/gi, '') // Remove embed tags
    .replace(/form/gi, '') // Remove form tags
    .replace(/input/gi, '') // Remove input tags
    .replace(/textarea/gi, '') // Remove textarea tags
    .replace(/select/gi, '') // Remove select tags
    .replace(/button/gi, '') // Remove button tags
    .replace(/link/gi, '') // Remove link tags
    .replace(/meta/gi, '') // Remove meta tags
    .replace(/style/gi, '') // Remove style tags
    .replace(/link/gi, '') // Remove link tags
    .replace(/&/g, '&amp;') // Escape ampersands
    .replace(/"/g, '&quot;') // Escape double quotes
    .replace(/'/g, '&#x27;') // Escape single quotes
    .replace(/\//g, '&#x2F;') // Escape forward slashes
    .substring(0, 1000) // Limit length
}

// HTML sanitization for rich text content
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return ''
  
  // Allow only safe HTML tags and attributes
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  const allowedAttributes = ['class', 'id']
  
  // Basic HTML sanitization - remove dangerous tags and attributes
  let sanitized = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object[^>]*>.*?<\/object>/gi, '') // Remove object tags
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '') // Remove embed tags
    .replace(/<form[^>]*>.*?<\/form>/gi, '') // Remove form tags
    .replace(/<input[^>]*>/gi, '') // Remove input tags
    .replace(/<textarea[^>]*>.*?<\/textarea>/gi, '') // Remove textarea tags
    .replace(/<select[^>]*>.*?<\/select>/gi, '') // Remove select tags
    .replace(/<button[^>]*>.*?<\/button>/gi, '') // Remove button tags
    .replace(/<link[^>]*>/gi, '') // Remove link tags
    .replace(/<meta[^>]*>/gi, '') // Remove meta tags
    .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove style tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/&/g, '&amp;') // Escape ampersands
    .replace(/</g, '&lt;') // Escape less than
    .replace(/>/g, '&gt;') // Escape greater than
    .replace(/"/g, '&quot;') // Escape double quotes
    .replace(/'/g, '&#x27;') // Escape single quotes
    .substring(0, 5000) // Limit length
  
  return sanitized
}

// SQL injection prevention helper
export function sanitizeForSql(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/['"]/g, '') // Remove quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .replace(/union/gi, '') // Remove UNION
    .replace(/select/gi, '') // Remove SELECT
    .replace(/insert/gi, '') // Remove INSERT
    .replace(/update/gi, '') // Remove UPDATE
    .replace(/delete/gi, '') // Remove DELETE
    .replace(/drop/gi, '') // Remove DROP
    .replace(/create/gi, '') // Remove CREATE
    .replace(/alter/gi, '') // Remove ALTER
    .replace(/exec/gi, '') // Remove EXEC
    .replace(/execute/gi, '') // Remove EXECUTE
    .trim()
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Saudi phone number validation: +966, 966, or 0 followed by 5-9 and 8 more digits
  const phoneRegex = /^(\+966|966|0)?[5-9][0-9]{8}$/
  return phoneRegex.test(phone)
}

export function validateNationalAddress(address: string): boolean {
  const addressRegex = /^[A-Z]{4}[0-9]{4}$/
  return addressRegex.test(address)
}

// Enhanced validation functions for admin forms
export function validateProductName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Product name must be at least 2 characters long' }
  }
  if (name.length > 100) {
    return { valid: false, error: 'Product name must be less than 100 characters' }
  }
  if (!/^[a-zA-Z0-9\s\-_.,()]+$/.test(name)) {
    return { valid: false, error: 'Product name contains invalid characters' }
  }
  return { valid: true }
}

export function validatePrice(price: string | number): { valid: boolean; error?: string } {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(numPrice) || numPrice < 0) {
    return { valid: false, error: 'Price must be a valid positive number' }
  }
  if (numPrice > 999999) {
    return { valid: false, error: 'Price must be less than 999,999' }
  }
  return { valid: true }
}

export function validateStock(stock: string | number): { valid: boolean; error?: string } {
  const numStock = typeof stock === 'string' ? parseInt(stock) : stock
  if (isNaN(numStock) || numStock < 0) {
    return { valid: false, error: 'Stock must be a valid non-negative number' }
  }
  if (numStock > 99999) {
    return { valid: false, error: 'Stock must be less than 99,999' }
  }
  return { valid: true }
}

export function validateSKU(sku: string): { valid: boolean; error?: string } {
  if (!sku || sku.trim().length < 3) {
    return { valid: false, error: 'SKU must be at least 3 characters long' }
  }
  if (sku.length > 50) {
    return { valid: false, error: 'SKU must be less than 50 characters' }
  }
  if (!/^[A-Z0-9\-_]+$/.test(sku)) {
    return { valid: false, error: 'SKU must contain only uppercase letters, numbers, hyphens, and underscores' }
  }
  return { valid: true }
}

export function validateDescription(description: string): { valid: boolean; error?: string } {
  if (!description || description.trim().length < 10) {
    return { valid: false, error: 'Description must be at least 10 characters long' }
  }
  if (description.length > 2000) {
    return { valid: false, error: 'Description must be less than 2000 characters' }
  }
  return { valid: true }
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim().length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' }
  }
  if (username.length > 30) {
    return { valid: false, error: 'Username must be less than 30 characters' }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }
  return { valid: true }
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' }
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' }
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter, one uppercase letter, and one number' }
  }
  return { valid: true }
}

export function validateYouTubeUrl(url: string): { valid: boolean; error?: string } {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/
  if (!youtubeRegex.test(url)) {
    return { valid: false, error: 'Invalid YouTube URL format' }
  }
  return { valid: true }
}

// Security headers helper
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Prevent clickjacking
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';")
  
  // Prevent MIME type sniffing
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // Remove server information
  response.headers.delete('X-Powered-By')
  
  return response
}

// Error response helpers
export function createErrorResponse(message: string, code: string, status: number = 400) {
  const response = NextResponse.json(
    { error: message, code },
    { status }
  )
  return addSecurityHeaders(response)
}

export function createSuccessResponse(data: any, message: string = 'Success') {
  const response = NextResponse.json({
    success: true,
    message,
    data
  })
  return addSecurityHeaders(response)
}

// Secure error logging - prevents information disclosure
export function logError(error: any, context: string = 'Unknown') {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error)
  } else {
    // In production, only log safe information
    console.error(`[${context}] Error occurred`)
  }
}

// Sanitize error messages for client responses
export function sanitizeErrorMessage(error: any): string {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : 'An error occurred'
  } else {
    // In production, return generic error messages
    if (error instanceof Error) {
      // Only return safe error messages
      const safeMessages = [
        'Validation failed',
        'Authentication required',
        'Access denied',
        'Resource not found',
        'Invalid request',
        'Service temporarily unavailable'
      ]
      
      // Check if error message is in safe list
      if (safeMessages.some(msg => error.message.includes(msg))) {
        return error.message
      }
    }
    
    return 'An error occurred. Please try again.'
  }
}
