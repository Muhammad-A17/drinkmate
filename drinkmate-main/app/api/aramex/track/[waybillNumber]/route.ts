import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ waybillNumber: string }> }
) {
  try {
    const { waybillNumber } = await params;

    if (!waybillNumber) {
      return NextResponse.json(
        { success: false, message: 'Waybill number is required' },
        { status: 400 }
      );
    }

    // Validate waybill number format
    if (waybillNumber.length < 8 || waybillNumber.length > 20) {
      return NextResponse.json(
        { success: false, message: 'Invalid waybill number format' },
        { status: 400 }
      );
    }

    // Call backend Aramex service
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/aramex/track/${waybillNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || 'Failed to track shipment',
          error: errorData.error 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Aramex tracking API error:', error);
    
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Request timeout - please try again' 
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
