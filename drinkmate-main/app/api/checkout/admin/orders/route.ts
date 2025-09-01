import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const search = searchParams.get('search')

    // Build query parameters for the backend
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (status) params.append('status', status)
    if (paymentStatus) params.append('paymentStatus', paymentStatus)
    if (search) params.append('search', search)

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/checkout/admin/orders?${params}`
    
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
