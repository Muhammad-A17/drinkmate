import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const color = searchParams.get('color')
    const featured = searchParams.get('featured')
    const bestSeller = searchParams.get('bestSeller')
    const newArrival = searchParams.get('newArrival')
    const sort = searchParams.get('sort')

    // Build query parameters for the backend
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (category) params.append('category', category)
    if (search) params.append('search', search)
    if (minPrice) params.append('minPrice', minPrice)
    if (maxPrice) params.append('maxPrice', maxPrice)
    if (color) params.append('color', color)
    if (featured) params.append('featured', featured)
    if (bestSeller) params.append('bestSeller', bestSeller)
    if (newArrival) params.append('newArrival', newArrival)
    if (sort) params.append('sort', sort)

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/shop/products?${params}`
    
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
    console.error('Error fetching shop products:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch products',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
