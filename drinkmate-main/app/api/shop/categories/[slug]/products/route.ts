import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const color = searchParams.get('color')
    const featured = searchParams.get('featured')
    const bestSeller = searchParams.get('bestSeller')
    const newArrival = searchParams.get('newArrival')
    const sort = searchParams.get('sort')

    // Build query parameters for the backend
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      category: slug // Use the slug as the category parameter
    })

    if (search) queryParams.append('search', search)
    if (minPrice) queryParams.append('minPrice', minPrice)
    if (maxPrice) queryParams.append('maxPrice', maxPrice)
    if (color) queryParams.append('color', color)
    if (featured) queryParams.append('featured', featured)
    if (bestSeller) queryParams.append('bestSeller', bestSeller)
    if (newArrival) queryParams.append('newArrival', newArrival)
    if (sort) queryParams.append('sort', sort)

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/shop/products?${queryParams}`
    
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
    console.error('Error fetching products by category:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch products by category',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
