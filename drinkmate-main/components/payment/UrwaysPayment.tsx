'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UrwaysPaymentProps {
  amount: number
  currency?: string
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  description?: string
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
  className?: string
}

export function UrwaysPayment({
  amount,
  currency = 'SAR',
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  description = 'Drinkmate Order Payment',
  items = [],
  onSuccess,
  onError,
  className = ''
}: UrwaysPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
      const response = await fetch('/api/payments/urways', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          customerName,
          customerEmail,
          customerPhone,
          description,
          items
        })
      })

      const data = await response.json()

      if (data.success && data.data?.paymentUrl) {
        // Redirect to URWAYS payment page
        window.location.href = data.data.paymentUrl
      } else {
        throw new Error(data.message || 'Failed to create payment request')
      }
    } catch (error) {
      console.error('URWAYS Payment Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVerifyPayment = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/payments/urways?transactionId=${transactionId}`)
      const data = await response.json()

      if (data.success) {
        setIsVerified(true)
        onSuccess?.(transactionId)
        toast.success('Payment verified successfully!')
      } else {
        throw new Error(data.message || 'Payment verification failed')
      }
    } catch (error) {
      console.error('URWAYS Verification Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Verification failed'
      toast.error(errorMessage)
      onError?.(errorMessage)
    }
  }

  // Check if we're returning from URWAYS payment
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const transactionId = urlParams.get('transactionId')
    const status = urlParams.get('status')

    if (transactionId && status === 'success') {
      handleVerifyPayment(transactionId)
    } else if (status === 'cancel') {
      toast.error('Payment was cancelled')
      onError?.('Payment cancelled by user')
    }
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">URWAYS Payment</h3>
            <p className="text-sm text-gray-500">Secure payment processing</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">{amount.toFixed(2)} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{customerName}</span>
          </div>
        </div>

        {isVerified ? (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Payment Verified Successfully!</span>
          </div>
        ) : (
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay with URWAYS
              </>
            )}
          </Button>
        )}

        <div className="mt-4 flex items-center space-x-2 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span>Your payment is secured by URWAYS</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>By proceeding, you agree to our terms and conditions.</p>
        <p>URWAYS is a licensed payment service provider in Saudi Arabia.</p>
      </div>
    </div>
  )
}
