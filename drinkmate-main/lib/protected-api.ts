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

  return await response.json()
}

// Rate limiting helper (simple in-memory store for demo)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const key = identifier
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

// Input sanitization helper
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
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

// Error response helpers
export function createErrorResponse(message: string, code: string, status: number = 400) {
  return NextResponse.json(
    { error: message, code },
    { status }
  )
}

export function createSuccessResponse(data: any, message: string = 'Success') {
  return NextResponse.json({
    success: true,
    message,
    data
  })
}
