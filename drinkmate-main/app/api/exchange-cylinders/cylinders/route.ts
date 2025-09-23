import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const brand = searchParams.get('brand')
    const exchangeType = searchParams.get('exchangeType')
    const serviceLevel = searchParams.get('serviceLevel')
    const status = searchParams.get('status')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const serviceArea = searchParams.get('serviceArea')
    const sortBy = searchParams.get('sortBy')
    const sortOrder = searchParams.get('sortOrder')

    // Build query parameters for the backend
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (brand) params.append('brand', brand)
    if (exchangeType) params.append('exchangeType', exchangeType)
    if (serviceLevel) params.append('serviceLevel', serviceLevel)
    if (status) params.append('status', status)
    if (minPrice) params.append('minPrice', minPrice)
    if (maxPrice) params.append('maxPrice', maxPrice)
    if (serviceArea) params.append('serviceArea', serviceArea)
    if (sortBy) params.append('sortBy', sortBy)
    if (sortOrder) params.append('sortOrder', sortOrder)

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/exchange-cylinders/cylinders?${params}`
    
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
    console.error('Error fetching exchange cylinders:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch exchange cylinders',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Debug logging
    console.log('API Route - Received request body:', JSON.stringify(body, null, 2))
    console.log('API Route - Authorization header:', request.headers.get('Authorization'))

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/exchange-cylinders/cylinders`
    console.log('API Route - Backend URL:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    console.log('API Route - Backend response status:', response.status)
    console.log('API Route - Backend response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      throw new Error(`Backend responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('API Route - Backend response data:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating exchange cylinder:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create exchange cylinder',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
