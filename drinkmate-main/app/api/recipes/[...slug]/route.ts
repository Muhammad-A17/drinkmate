import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const path = slug.join('/')
    const { searchParams } = new URL(request.url)
    
    // Build query parameters for the backend
    const queryParams = new URLSearchParams()
    searchParams.forEach((value, key) => {
      queryParams.append(key, value)
    })

    // Make request to backend based on the path
    let backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes`
    
    if (path === 'featured') {
      backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes/featured`
    } else if (path.startsWith('category/')) {
      const category = path.replace('category/', '')
      backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes/category/${category}`
    } else if (path.startsWith('slug/')) {
      const recipeSlug = path.replace('slug/', '')
      backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes/slug/${recipeSlug}`
    } else if (path.startsWith('admin/')) {
      const recipeId = path.replace('admin/', '')
      backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes/admin/${recipeId}`
    } else if (path === 'stats') {
      backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes/stats`
    } else {
      // Handle other paths or default to main recipes endpoint
      backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes`
    }

    // Add query parameters if any
    if (queryParams.toString()) {
      backendUrl += `?${queryParams.toString()}`
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
    console.error('Error fetching recipe data:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch recipe data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const path = slug.join('/')
    const body = await request.json()
    const authHeader = request.headers.get('Authorization')

    // Make request to backend based on the path
    let backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes`
    
    if (path.endsWith('/rate')) {
      // Handle rating endpoint
      const recipeId = path.replace('/rate', '')
      backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes/${recipeId}/rate`
    } else if (path === 'admin') {
      // Handle admin creation
      backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/recipes/admin`
    }
    
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
    console.error('Error processing recipe request:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process recipe request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
