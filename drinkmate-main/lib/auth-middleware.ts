import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { SECURITY_CONFIG, SecurityUtils } from './security-config'

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    isAdmin: boolean
  }
}

interface JWTPayload {
  id: string
  email?: string
  isAdmin?: boolean
  iat: number
  exp: number
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('Authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { 
            error: 'No valid authorization header provided',
            code: 'MISSING_AUTH_HEADER'
          },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      
      // Verify JWT token
      const jwtSecret = process.env.JWT_SECRET || 'default_dev_secret'
      let decoded: JWTPayload
      
      try {
        // First try with audience validation for new tokens
        try {
          decoded = jwt.verify(token, jwtSecret, {
            issuer: SECURITY_CONFIG.JWT.issuer,
            audience: SECURITY_CONFIG.JWT.audience
          }) as JWTPayload
        } catch (audienceError) {
          // If audience validation fails, try without it for backward compatibility
          console.log('Audience validation failed, trying without audience for backward compatibility')
          decoded = jwt.verify(token, jwtSecret) as JWTPayload
        }
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError)
        return NextResponse.json(
          { 
            error: 'Invalid or expired token',
            code: 'INVALID_TOKEN'
          },
          { status: 401 }
        )
      }

      // Validate token structure
      if (!decoded.id || !decoded.iat || !decoded.exp) {
        return NextResponse.json(
          { 
            error: 'Invalid token structure',
            code: 'INVALID_TOKEN_STRUCTURE'
          },
          { status: 401 }
        )
      }

      // Check token expiration
      const now = Math.floor(Date.now() / 1000)
      if (decoded.exp < now) {
        return NextResponse.json(
          { 
            error: 'Token has expired',
            code: 'TOKEN_EXPIRED'
          },
          { status: 401 }
        )
      }

      // Security check: Reject demo accounts in production
      if (process.env.NODE_ENV === 'production' && decoded.id.toString().startsWith('demo')) {
        return NextResponse.json(
          { 
            error: 'Demo accounts not allowed in production',
            code: 'DEMO_ACCOUNT_BLOCKED'
          },
          { status: 401 }
        )
      }

      // Add user info to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        id: decoded.id,
        email: decoded.email || '',
        isAdmin: decoded.isAdmin || false
      }

      // Call the original handler
      return await handler(authenticatedReq)

    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { 
          error: 'Authentication failed',
          code: 'AUTH_ERROR'
        },
        { status: 500 }
      )
    }
  }
}

export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(async (req: AuthenticatedRequest) => {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return NextResponse.json(
        { 
          error: 'Admin access required',
          code: 'ADMIN_REQUIRED'
        },
        { status: 403 }
      )
    }

    return await handler(req)
  })
}
