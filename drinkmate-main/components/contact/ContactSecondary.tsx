"use client"

import React, { useState } from 'react'
import { Package, MapPin, Clock, Search, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ContactSecondaryProps {
  isRTL: boolean
}

export default function ContactSecondary({ isRTL }: ContactSecondaryProps) {
  const [orderLookup, setOrderLookup] = useState({
    email: '',
    orderNumber: ''
  })
  const [lookupResult, setLookupResult] = useState<any>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)

  const handleOrderLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderLookup.email || !orderLookup.orderNumber) return

    setIsLookingUp(true)
    try {
      // TODO: Implement actual order lookup
      setTimeout(() => {
        setLookupResult({
          orderNumber: orderLookup.orderNumber,
          status: 'Shipped',
          estimatedDelivery: '2024-01-15',
          trackingNumber: 'TRK123456789'
        })
        setIsLookingUp(false)
      }, 1000)
    } catch (error) {
      setIsLookingUp(false)
    }
  }

  const operatingHours = {
    weekdays: '9:00 AM - 5:00 PM (KSA)',
    weekdaysAr: '9:00 صباحاً - 5:00 مساءً (بتوقيت السعودية)',
    weekends: 'Closed',
    weekendsAr: 'مغلق',
    timezone: 'Asia/Riyadh'
  }

  const storeLocations = [
    {
      name: 'Riyadh Store',
      nameAr: 'متجر الرياض',
      address: 'King Fahd Road, Riyadh 12345',
      addressAr: 'طريق الملك فهد، الرياض 12345',
      phone: '+966 11 123 4567',
      hours: '9:00 AM - 10:00 PM',
      hoursAr: '9:00 صباحاً - 10:00 مساءً'
    },
    {
      name: 'Jeddah Store',
      nameAr: 'متجر جدة',
      address: 'Prince Mohammed Bin Abdulaziz St, Jeddah 21432',
      addressAr: 'شارع الأمير محمد بن عبدالعزيز، جدة 21432',
      phone: '+966 12 987 6543',
      hours: '9:00 AM - 10:00 PM',
      hoursAr: '9:00 صباحاً - 10:00 مساءً'
    }
  ]

  return (
    <div className="mt-16 space-y-8">
      <h2 className={`text-2xl font-bold text-gray-900 text-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
        {isRTL ? 'معلومات إضافية' : 'Additional Help'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Order Lookup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>{isRTL ? 'البحث عن الطلب' : 'Order Lookup'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOrderLookup} className="space-y-4">
              <div>
                <Label htmlFor="lookup-email">
                  {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                </Label>
                <Input
                  id="lookup-email"
                  type="email"
                  value={orderLookup.email}
                  onChange={(e) => setOrderLookup(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
              <div>
                <Label htmlFor="lookup-order">
                  {isRTL ? 'رقم الطلب' : 'Order Number'}
                </Label>
                <Input
                  id="lookup-order"
                  value={orderLookup.orderNumber}
                  onChange={(e) => setOrderLookup(prev => ({ ...prev, orderNumber: e.target.value }))}
                  placeholder="ORD-2024-001"
                  dir="ltr"
                />
              </div>
              <Button
                type="submit"
                disabled={isLookingUp || !orderLookup.email || !orderLookup.orderNumber}
                className="w-full"
              >
                {isLookingUp ? 
                  (isRTL ? 'جاري البحث...' : 'Looking up...') : 
                  (isRTL ? 'البحث عن الطلب' : 'Look up Order')
                }
              </Button>
            </form>

            {lookupResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    {isRTL ? 'تم العثور على الطلب' : 'Order Found'}
                  </span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>{isRTL ? 'رقم الطلب:' : 'Order:'} {lookupResult.orderNumber}</strong></p>
                  <p><strong>{isRTL ? 'الحالة:' : 'Status:'} {lookupResult.status}</strong></p>
                  <p><strong>{isRTL ? 'التسليم المتوقع:' : 'Estimated Delivery:'} {lookupResult.estimatedDelivery}</strong></p>
                  <p><strong>{isRTL ? 'رقم التتبع:' : 'Tracking:'} {lookupResult.trackingNumber}</strong></p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Store Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>{isRTL ? 'مواقع المتاجر' : 'Store Locations'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storeLocations.map((store, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className={`font-semibold text-gray-900 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                    {isRTL ? store.nameAr : store.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {isRTL ? store.addressAr : store.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isRTL ? store.phone : store.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isRTL ? store.hoursAr : store.hours}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>{isRTL ? 'ساعات العمل' : 'Operating Hours'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {isRTL ? 'الأحد - الخميس' : 'Sunday - Thursday'}
                </span>
                <span className="text-sm text-gray-600">
                  {isRTL ? operatingHours.weekdaysAr : operatingHours.weekdays}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {isRTL ? 'الجمعة - السبت' : 'Friday - Saturday'}
                </span>
                <span className="text-sm text-gray-600">
                  {isRTL ? operatingHours.weekendsAr : operatingHours.weekends}
                </span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  {isRTL ? 'جميع الأوقات بتوقيت السعودية' : 'All times in Saudi Arabia Time'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holiday Notice */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">
                {isRTL ? 'إشعار العطل الرسمية' : 'Holiday Notice'}
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                {isRTL ? 
                  'سنكون مغلقين خلال العطل الرسمية. يرجى التخطيط مسبقاً لطلباتك أو استخدام واتساب للاستفسارات العاجلة.' :
                  'We will be closed during official holidays. Please plan ahead for your orders or use WhatsApp for urgent inquiries.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
