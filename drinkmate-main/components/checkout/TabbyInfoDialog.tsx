"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Users, Shield, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

interface TabbyInfoDialogProps {
  isOpen: boolean
  onClose: () => void
  orderTotal: number
}

export default function TabbyInfoDialog({ isOpen, onClose, orderTotal }: TabbyInfoDialogProps) {
  const monthlyPayment = orderTotal / 4

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">Get more time to pay</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Split your purchase in up to 4 payments</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Plan */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">4 payments</span>
              <div className="flex items-center space-x-2">
                <svg viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-600">
                  <path d="M10.21 7.76a3.815 3.815 0 0 1-.321 1.194l-3.554.75v-2.25l-1.107.234v1.249a.54.54 0 0 1-.095.307l-.576.849a.998.998 0 0 1-.618.41L.8 11.166a3.85 3.85 0 0 1 .321-1.193l3-.634V7.922l-2.799.592c.043-.422.154-.823.322-1.193l2.477-.524V2.422A3.899 3.899 0 0 1 5.228 1.5v5.064l1.107-.234V2.973a3.9 3.9 0 0 1 1.107-.924v4.046l2.768-.584a3.81 3.81 0 0 1-.321 1.193l-2.447.517v1.125l2.768-.585Zm-3.875 4.194c.043-.42.154-.822.322-1.193l3.553-.75a3.814 3.814 0 0 1-.321 1.192l-3.554.751Z" fill="currentColor"/>
                </svg>
                <span className="font-semibold text-gray-900">
                  <SaudiRiyal amount={monthlyPayment} />/mo
                </span>
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium">No interest. No fees.</p>
          </div>

          {/* How it works */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#12d6fa] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-sm text-gray-700">Choose Tabby at checkout to select a payment plan</p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#12d6fa] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-sm text-gray-700">Enter your information and add your debit or credit card</p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#12d6fa] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-sm text-gray-700">Your first payment is taken when the order is made</p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#12d6fa] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </div>
                <p className="text-sm text-gray-700">We'll send you a reminder when your next payment is due</p>
              </li>
            </ul>
          </div>

          {/* Trust indicators */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Trusted by millions</p>
                <p className="text-xs text-gray-600">Over 20 million shoppers discover products and pay their way with Tabby</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Shop safely with Tabby</p>
                <p className="text-xs text-gray-600">Buyer protection is included with every purchase</p>
              </div>
            </div>
          </div>

          {/* Payment method logos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Accepted payment methods:</p>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                <Image
                  src="/images/payment-logos/urways-payment.png"
                  alt="Payment methods"
                  width={120}
                  height={30}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
          >
            Continue shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
