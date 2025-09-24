"use client"

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
        <DialogHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Get more time to pay</DialogTitle>
              <p className="text-sm text-gray-600">Split your purchase in up to 4 payments</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Plan - Compact Design */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-gray-900">4 payments</span>
              <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                <span className="text-lg font-bold text-gray-900">
                  <SaudiRiyal amount={monthlyPayment} />/mo
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-sm font-semibold text-green-600">No interest. No fees.</p>
            </div>
          </div>

          {/* How it works - Compact */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">How it works</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-sm text-gray-700">Choose Tabby at checkout to select a payment plan</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-sm text-gray-700">Enter your information and add your debit or credit card</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-sm text-gray-700">Your first payment is taken when the order is made</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  4
                </div>
                <p className="text-sm text-gray-700">We'll send you a reminder when your next payment is due</p>
              </div>
            </div>
          </div>

          {/* Trust indicators - Compact */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Trusted by millions</p>
                <p className="text-xs text-gray-600">Over 20 million shoppers use Tabby</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Shop safely with Tabby</p>
                <p className="text-xs text-gray-600">Buyer protection included with every purchase</p>
              </div>
            </div>
          </div>

          {/* Payment method logos - Compact */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-3">Accepted payment methods:</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center p-1">
                <Image
                  src="/images/payment-logos/visa.svg"
                  alt="Visa"
                  width={30}
                  height={18}
                  className="object-contain"
                />
              </div>
              <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center p-1">
                <Image
                  src="/images/payment-logos/mastercard.svg"
                  alt="Mastercard"
                  width={30}
                  height={18}
                  className="object-contain"
                />
              </div>
              <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center p-1">
                <Image
                  src="/images/payment-logos/mada.svg"
                  alt="Mada"
                  width={30}
                  height={18}
                  className="object-contain"
                />
              </div>
              <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center p-1">
                <Image
                  src="/images/payment-logos/apple-pay.svg"
                  alt="Apple Pay"
                  width={30}
                  height={18}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 text-sm rounded-lg"
          >
            Continue shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
