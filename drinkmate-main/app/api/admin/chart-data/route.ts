import { NextRequest, NextResponse } from 'next/server'
import { addSecurityHeaders, logError, sanitizeErrorMessage } from '@/lib/api/protected-api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    // Fetch chart data from backend
    const response = await fetch(`${API_BASE_URL}/admin/chart-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return addSecurityHeaders(NextResponse.json(
        { 
          success: false, 
          message: errorData.message || 'Failed to fetch chart data',
          error: sanitizeErrorMessage(errorData.error)
        },
        { status: response.status }
      ))
    }

    const data = await response.json()
    
    return addSecurityHeaders(NextResponse.json({
      success: true,
      data: data.data || data
    }))

  } catch (error) {
    logError(error, 'AdminChartDataAPI')
    return addSecurityHeaders(NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: sanitizeErrorMessage(error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    ))
  }
}
