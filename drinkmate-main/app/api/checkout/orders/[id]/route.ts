import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/checkout/orders/${id}`
    
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
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch order details',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
