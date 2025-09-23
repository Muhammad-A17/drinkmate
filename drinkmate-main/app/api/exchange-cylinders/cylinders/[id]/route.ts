import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cylinder ID is required for update'
        },
        { status: 400 }
      )
    }
    
    // Debug logging
    console.log('API Route - Update request for ID:', id)
    console.log('API Route - Received request body:', JSON.stringify(body, null, 2))
    console.log('API Route - Authorization header:', request.headers.get('Authorization'))

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/exchange-cylinders/cylinders/${id}`
    console.log('API Route - Backend URL:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    console.log('API Route - Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      throw new Error(`Backend responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('API Route - Backend response data:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating exchange cylinder:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update exchange cylinder',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cylinder ID is required for deletion'
        },
        { status: 400 }
      )
    }
    
    // Debug logging
    console.log('API Route - Delete request for ID:', id)
    console.log('API Route - Authorization header:', request.headers.get('Authorization'))

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/exchange-cylinders/cylinders/${id}`
    console.log('API Route - Backend URL:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    console.log('API Route - Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      throw new Error(`Backend responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('API Route - Backend response data:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting exchange cylinder:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete exchange cylinder',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}