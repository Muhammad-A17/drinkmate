import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  reason: string
  orderNumber?: string
  message: string
  attachments?: Array<{
    name: string
    url: string
    type: string
    size: number
  }>
  consent: boolean
  locale: string
  source: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'reason', 'message']
    const missingFields = requiredFields.filter(field => !body[field as keyof ContactFormData])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate consent
    if (!body.consent) {
      return NextResponse.json(
        { error: 'Consent is required' },
        { status: 400 }
      )
    }

    // Generate ticket ID
    const ticketId = `DM-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    
    // Create chat session via backend API
    try {
      const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            name: body.name,
            email: body.email,
            phone: body.phone || ''
          },
          category: body.reason,
          orderNumber: body.orderNumber || '',
          priority: body.reason === 'order' ? 'high' : 'medium'
        })
      })

      if (chatResponse.ok) {
        const chatData = await chatResponse.json()
        
        // Add the initial message directly to the chat using the model method
        // We'll need to add this message through the backend API that handles it properly
        const messageContent = `Contact Form Submission:\n\nReason: ${body.reason}\nMessage: ${body.message}${body.attachments?.length ? `\n\nAttachments: ${body.attachments.length} file(s)` : ''}`
        
        // Update the chat with the initial message using a direct database call
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat/${chatData.data._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initialMessage: messageContent,
            source: 'contact_form'
          })
        })

        if (updateResponse.ok) {
          console.log('Chat session created successfully:', chatData.data.sessionId)
        }
      }
    } catch (chatError) {
      console.error('Error creating chat session:', chatError)
      // Continue with the response even if chat creation fails
    }
    
    // Create contact submission object
    const contactSubmission = {
      ticketId,
      ...body,
      submittedAt: new Date().toISOString(),
      status: 'new',
      priority: body.reason === 'order' ? 'high' : 'normal'
    }

    // Log the submission
    console.log('Contact form submission:', contactSubmission)

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Your message has been sent successfully. We\'ll get back to you soon!'
    })

  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form. Please try again.' },
      { status: 500 }
    )
  }
}