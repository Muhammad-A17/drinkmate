import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')

    if (process.env.NODE_ENV === 'development') {
      console.log('API Route - Received search parameters:', { page, limit, category, search, status, featured })
    }

    // Build query parameters for the backend
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (category) params.append('category', category)
    if (search) params.append('search', search)
    if (status) params.append('status', status)
    if (featured) params.append('featured', featured)

    // Make request to backend [[memory:8738512]]
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes?${params}`
    
    if (process.env.NODE_ENV === 'development') {
      console.log('API Route - Making request to backend:', backendUrl)
      console.log('API Route - Search parameter being sent:', search)
    }
    
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
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch recipes',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('Authorization')

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes`
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
