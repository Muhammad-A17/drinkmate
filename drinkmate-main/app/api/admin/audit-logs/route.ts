import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken } from '@/lib/contexts/auth-context'
import { addSecurityHeaders, logError } from '@/lib/api/protected-api'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = getAuthToken()
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify admin access
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category')
    const severity = searchParams.get('severity')

    // Fetch audit logs from backend
    const auditResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin/audit-logs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        page,
        limit,
        category,
        severity
      })
    })

    if (!auditResponse.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch audit logs' },
        { status: 500 }
      )
    }

        const data = await auditResponse.json()

        const successResponse = NextResponse.json({
          success: true,
          logs: data.logs || [],
          totalPages: data.totalPages || 1,
          currentPage: page,
          totalLogs: data.totalLogs || 0
        })

        return addSecurityHeaders(successResponse)

  } catch (error) {
    logError(error as Error, 'Audit logs API')
    const response = NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
    
    return addSecurityHeaders(response)
  }
}
